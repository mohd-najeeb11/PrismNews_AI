import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.core.config import settings
from app.core.logging import logger
from app.models.quota import QuotaStatusResponse, ServiceQuotaStatus

# Hard daily budget caps (see PROJECT_RULES.md)
DAILY_BUDGETS: Dict[str, int] = {
    "newsapi": 8,
    "gemini": 20,
    "groq": 10,
}


class QuotaManager:
    """
    Manages daily free-tier API caps, enforces API_MODE discipline,
    and provides offline seed dataset fallbacks.
    """

    def __init__(self):
        self._usage: Dict[str, Dict[str, Any]] = {
            "newsapi": {"calls_today": 0, "tokens_today": 0},
            "gemini": {"calls_today": 0, "tokens_today": 0},
            "groq": {"calls_today": 0, "tokens_today": 0},
        }
        self._last_reset_date: str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        self._seed_cache: Optional[List[Dict[str, Any]]] = None

    def _check_daily_reset(self) -> None:
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        if today != self._last_reset_date:
            logger.info(f"UTC Midnight reset triggered. Resetting quota counters for {today}.")
            for s in self._usage:
                self._usage[s] = {"calls_today": 0, "tokens_today": 0}
            self._last_reset_date = today

    def get_api_mode(self) -> str:
        return settings.API_MODE.lower()

    def set_api_mode(self, mode: str) -> str:
        valid_modes = {"seed", "rss", "live"}
        cleaned_mode = mode.lower().strip()
        if cleaned_mode in valid_modes:
            settings.API_MODE = cleaned_mode
            logger.info(f"[QuotaManager] Dynamic API_MODE set to '{cleaned_mode}'")
            return cleaned_mode
        raise ValueError(f"Invalid API mode '{mode}'. Must be one of: {valid_modes}")

    def can_call(self, service: str) -> bool:
        """
        Checks if an external service call is permitted under active API_MODE and daily budget caps.
        """
        self._check_daily_reset()
        mode = self.get_api_mode()

        # In seed mode, external API calls are strictly blocked
        if mode == "seed":
            logger.info(f"[QuotaManager] API_MODE=seed. Blocked call to '{service}'.")
            return False

        # In rss mode, newsapi is blocked, but LLM analysis (gemini/groq) is permitted
        if mode == "rss" and service.lower() == "newsapi":
            logger.info(f"[QuotaManager] API_MODE=rss. Blocked call to '{service}'.")
            return False

        service = service.lower()
        if service not in DAILY_BUDGETS:
            logger.warning(f"[QuotaManager] Unknown service '{service}'. Disallowing call.")
            return False

        budget = DAILY_BUDGETS[service]
        current_calls = self._usage[service]["calls_today"]

        if current_calls >= budget:
            logger.warning(f"[QuotaManager] Budget exhausted for '{service}' ({current_calls}/{budget}). Blocked call.")
            return False

        return True

    def increment_usage(self, service: str, tokens: int = 0) -> None:
        """
        Increments usage counter before executing an external API call.
        """
        self._check_daily_reset()
        service = service.lower()
        if service in self._usage:
            self._usage[service]["calls_today"] += 1
            self._usage[service]["tokens_today"] += tokens
            logger.info(
                f"[QuotaManager] Incremented '{service}' call counter: "
                f"{self._usage[service]['calls_today']}/{DAILY_BUDGETS.get(service, 0)}"
            )

    def get_quota_status(self) -> QuotaStatusResponse:
        """
        Returns full transparent quota status payload for GET /api/quota endpoint.
        """
        self._check_daily_reset()
        services_status: Dict[str, ServiceQuotaStatus] = {}

        for service, budget in DAILY_BUDGETS.items():
            usage_data = self._usage.get(service, {"calls_today": 0, "tokens_today": 0})
            calls_today = usage_data["calls_today"]
            calls_remaining = max(0, budget - calls_today)
            services_status[service] = ServiceQuotaStatus(
                service=service,
                daily_budget=budget,
                calls_today=calls_today,
                calls_remaining=calls_remaining,
                tokens_today=usage_data["tokens_today"],
                is_exhausted=(calls_remaining == 0),
            )

        # Reset time calculation (next UTC midnight)
        now_utc = datetime.now(timezone.utc)
        reset_time = datetime(now_utc.year, now_utc.month, now_utc.day, tzinfo=timezone.utc)
        reset_time_str = reset_time.strftime("%Y-%m-%dT00:00:00Z")

        return QuotaStatusResponse(
            api_mode=self.get_api_mode(),
            services=services_status,
            reset_at_utc=reset_time_str,
        )

    def load_seed_stories(self) -> List[Dict[str, Any]]:
        """
        Loads pre-baked seed demo stories from data/seed/demo_stories.json.
        """
        if self._seed_cache is not None:
            return self._seed_cache

        base_dir = Path(__file__).resolve().parent.parent.parent
        seed_path = base_dir / "data" / "seed" / "demo_stories.json"

        if not seed_path.exists():
            logger.error(f"Seed data file not found at {seed_path}")
            return []

        try:
            with open(seed_path, "r", encoding="utf-8") as f:
                stories = json.load(f)
                self._seed_cache = stories
                logger.info(f"Loaded {len(stories)} seed stories from {seed_path.name}")
                return stories
        except Exception as e:
            logger.error(f"Failed to read seed data: {e}")
            return []

    def get_seed_story(self, story_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves a single seed story by ID.
        """
        stories = self.load_seed_stories()
        for story in stories:
            if story.get("id") == story_id:
                return story
        return None


# Global singleton instance
quota_manager = QuotaManager()
