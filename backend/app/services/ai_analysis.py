import json
import re
from typing import Any, Dict, Optional
import httpx

from app.core.config import settings
from app.core.logging import logger
from app.models.story import StoryAnalysisSchema
from app.prompts.combined_analysis import build_combined_analysis_prompt
from app.services.quota_manager import quota_manager


class AIAnalysisService:
    """
    Module M6: AI Analysis Pipeline.
    Runs single-pass combined LLM analysis for a story cluster.
    Enforces quota discipline (Gemini primary -> Groq fallback -> seed/mock fallback).
    """

    async def analyze_story(self, story: Dict[str, Any]) -> Dict[str, Any]:
        story_id = story.get("id", "")
        headline = story.get("headline", "Untitled Story")
        articles = story.get("articles", [])

        # 1. Check Cache Hit
        if "analysis" in story and story["analysis"]:
            logger.info(f"Cache HIT for story analysis ID '{story_id}'")
            return story["analysis"]

        # Check Seed Store Cache
        seed_story = quota_manager.get_seed_story(story_id)
        if seed_story and "analysis" in seed_story:
            logger.info(f"Seed Cache HIT for story analysis ID '{story_id}'")
            return seed_story["analysis"]

        # 2. Check Quota & Call Gemini Primary
        if quota_manager.can_call("gemini") and settings.GEMINI_API_KEY:
            logger.info(f"Executing Gemini 2.0 Flash analysis for story '{headline}'...")
            analysis = await self._call_gemini(headline, articles)
            if analysis:
                quota_manager.increment_usage("gemini")
                return analysis

        # 3. Fallback to Groq if Gemini unavailable/fails
        if quota_manager.can_call("groq") and settings.GROQ_API_KEY:
            logger.info(f"Executing Groq fallback analysis for story '{headline}'...")
            analysis = await self._call_groq(headline, articles)
            if analysis:
                quota_manager.increment_usage("groq")
                return analysis

        # 4. Fallback to structured default analysis
        logger.info(f"Using default fallback analysis for story '{headline}' (Quota/Keys unavailable)")
        return self._generate_fallback_analysis(headline, articles)

    async def _call_gemini(self, headline: str, articles: list) -> Optional[Dict[str, Any]]:
        prompt = build_combined_analysis_prompt(headline, articles)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={settings.GEMINI_API_KEY}"

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": "application/json",
            },
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        return self._parse_and_validate(text)
                else:
                    logger.error(f"Gemini API returned error {resp.status_code}: {resp.text}")
        except Exception as e:
            logger.error(f"Gemini API exception: {e}")

        return None

    async def _call_groq(self, headline: str, articles: list) -> Optional[Dict[str, Any]]:
        prompt = build_combined_analysis_prompt(headline, articles)
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": "llama-3.1-70b-versatile",
            "messages": [
                {"role": "system", "content": "You are a media bias analysis assistant. Output raw JSON only."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.2,
            "response_format": {"type": "json_object"},
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(url, headers=headers, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    choices = data.get("choices", [])
                    if choices:
                        text = choices[0].get("message", {}).get("content", "")
                        return self._parse_and_validate(text)
                else:
                    logger.error(f"Groq API returned error {resp.status_code}: {resp.text}")
        except Exception as e:
            logger.error(f"Groq API exception: {e}")

        return None

    def _parse_and_validate(self, text: str) -> Optional[Dict[str, Any]]:
        try:
            # Clean markdown codeblocks if present
            cleaned = text.strip()
            if cleaned.startswith("```"):
                cleaned = re.sub(r"^```(?:json)?\n?", "", cleaned)
                cleaned = re.sub(r"\n?```$", "", cleaned)

            parsed = json.loads(cleaned)
            # Validate with Pydantic schema
            validated = StoryAnalysisSchema(**parsed)
            return validated.model_dump()
        except Exception as e:
            logger.error(f"Failed to parse/validate LLM JSON response: {e}")
            return None

    def _generate_fallback_analysis(self, headline: str, articles: list) -> Dict[str, Any]:
        sources = list({art.get("source") or art.get("source_name") or "News Outlet" for art in articles})
        if not sources:
            sources = ["Source A", "Source B"]

        comparison = []
        bias_analysis = []
        timeline = []

        for idx, src in enumerate(sources):
            comparison.append({
                "source": src,
                "headline": f"{src}: Coverage of {headline[:40]}...",
                "tone": "neutral" if idx % 2 == 0 else "pragmatic",
                "emphasis": "Policy implications and key facts",
            })
            bias_analysis.append({
                "source": src,
                "framing": ["institutional reporting", "fact-based focus"],
                "tone": "neutral",
                "loaded_phrases": [
                    {
                        "text": "officials confirmed key updates",
                        "reason": "Standard neutral reporting attribution"
                    }
                ],
            })
            timeline.append({
                "published_at": f"2026-08-06T0{idx+1}:00:00Z",
                "source": src,
                "framing_shift": f"Initial reporting established primary facts and context for {src}.",
            })

        fallback = {
            "balanced_summary": {
                "consensus_facts": [
                    f"Core development regarding '{headline}' was announced.",
                    "Multiple outlets confirmed primary facts and participating stakeholders."
                ],
                "disputed_points": [
                    "Different outlets emphasized varying aspects of future economic impact."
                ],
                "neutral_summary": f"Outlets across the media spectrum reported on {headline}. Coverage balances core public announcements with initial analytical commentary."
            },
            "comparison": comparison,
            "bias_analysis": bias_analysis,
            "missing_perspectives": {
                "covered": ["Primary official spokespersons", "Major news agencies"],
                "missing": ["Independent domain experts", "Community stakeholder impact"]
            },
            "timeline": timeline
        }
        return fallback


ai_analysis_service = AIAnalysisService()
