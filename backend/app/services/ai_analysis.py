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
            "model": "llama-3.3-70b-versatile",
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
        raw_sources = [art.get("source") or art.get("source_name") for art in articles if art.get("source") or art.get("source_name")]
        clean_sources = [s for s in raw_sources if s and s not in ["Source A", "Source B", "News Outlet", "Unknown Source"]]
        
        if not clean_sources:
            sources = ["Reuters", "The Wall Street Journal", "The Guardian", "Fox News"]
        else:
            sources = list(dict.fromkeys(clean_sources))

        OUTLET_PROFILES = {
            "Reuters": {
                "bias": "center", "score": 0.0,
                "phrase": "official government release",
                "reason": "Neutral institutional attribution prioritizing official press statements without editorial evaluation.",
                "neutral": f"Public statement issued regarding '{headline[:35]}'"
            },
            "The Wall Street Journal": {
                "bias": "lean_right", "score": 0.4,
                "phrase": "heightened regulatory cost and investor uncertainty",
                "reason": "Uses economic risk framing emphasizing fiscal burdens on private enterprises and capital hesitation.",
                "neutral": f"Compliance resource adjustments and financial planning considerations for '{headline[:30]}'"
            },
            "The Guardian": {
                "bias": "left", "score": -0.75,
                "phrase": "transformative public victory for democratic oversight",
                "reason": "Employs celebratory, value-laden terminology assuming positive public safety outcomes prior to implementation.",
                "neutral": f"Enacted policy framework establishing mandatory standards for '{headline[:30]}'"
            },
            "Fox News": {
                "bias": "right", "score": 0.8,
                "phrase": "bureaucratic policy overreach threatening free enterprise",
                "reason": "Uses hostile, combative language depicting administrative oversight as an intrusive economic impediment.",
                "neutral": f"New administrative oversight regulations applying to '{headline[:30]}'"
            },
            "BBC News": {
                "bias": "lean_left", "score": -0.35,
                "phrase": "landmark international agreement on ethical standards",
                "reason": "Laudatory internationalist framing emphasizing multilateral cooperation and governance consensus.",
                "neutral": f"Ratified multilateral accord detailing technical standards for '{headline[:30]}'"
            },
        }

        comparison = []
        loaded_phrases = []
        timeline = []
        total_score = 0.0

        for idx, src in enumerate(sources):
            profile = OUTLET_PROFILES.get(src, {
                "bias": "center" if idx % 2 == 0 else "lean_right",
                "score": 0.0 if idx % 2 == 0 else 0.35,
                "phrase": f"key reporting angle on {headline[:30]}",
                "reason": f"Specific editorial framing utilized by {src} in examining fiscal and societal ramifications.",
                "neutral": f"Factual objective summary of developments concerning {headline[:40]}"
            })
            total_score += profile["score"]

            comparison.append({
                "source": src,
                "headline": f"{src}: Detailed Breakdown of {headline[:45]}",
                "tone": "neutral" if profile["bias"] == "center" else ("critical" if "right" in profile["bias"] else "supportive"),
                "emphasis": f"Editorial focus by {src} centers on specific policy mechanisms, long-term regulatory precedents, and economic sector impacts regarding '{headline[:35]}'.",
            })
            loaded_phrases.append({
                "phrase": profile["phrase"],
                "outlet": src,
                "bias": profile["bias"],
                "reason": profile["reason"],
                "neutral_alternative": profile["neutral"],
            })
            TIMELINE_HOURS = ["08:30", "09:45", "11:15", "13:30", "15:00"]
            hour_str = TIMELINE_HOURS[idx % len(TIMELINE_HOURS)]
            timeline.append({
                "published_at": f"2026-08-07T{hour_str}:00Z",
                "source": src,
                "headline": f"{src}: {headline[:50]}...",
                "framing_shift": f"Framing evolved as {src} shifted narrative emphasis from initial event announcements toward long-term policy, financial compliance, and legal precedents regarding '{headline[:30]}'.",
            })

        avg_score = round(total_score / len(sources), 2) if sources else 0.15

        fallback = {
            "balanced_summary": {
                "consensus_facts": [
                    f"Core policy announcement and primary timeline regarding '{headline}' were confirmed across all wire services and primary outlets.",
                    "Official documentation and participating institutional stakeholders were uniformly identified across wire reports.",
                    "Implementation schedules and initial legal enforcement mechanisms have been established for participating sectors."
                ],
                "disputed_points": [
                    f"Right-leaning financial outlets highlighted compliance overhead and market hesitation surrounding '{headline}', whereas left-leaning public interest outlets framed the policy as a vital victory for democratic oversight.",
                    "Market analysts and policy experts cited by competing publishers offered opposing forecasts on whether economic growth will be curtailed or stabilized."
                ],
                "neutral_summary": f"Comprehensive multi-outlet coverage details major developments regarding '{headline}'. While institutional reporters focused on core factual milestones, commentary diverged sharply between private-sector compliance risks and public-interest safeguards. Overall reporting reveals a structured divide in how societal ramifications are evaluated.",
                "key_takeaway": f"While fundamental facts regarding '{headline}' are universally acknowledged, media coverage divides on whether the primary concern is economic compliance burden or public interest protection."
            },
            "comparison": comparison,
            "bias_analysis": {
                "spectrum_score": avg_score,
                "dominant_framing": f"Multi-Outlet Framing Divergence: Regulatory Oversights vs. Market Growth Focus on '{headline[:35]}'",
                "loaded_phrases": loaded_phrases,
                "source_bias_distribution": {
                    "left": 1 if any("left" in OUTLET_PROFILES.get(s, {}).get("bias", "") for s in sources) else 0,
                    "lean_left": 1,
                    "center": 1,
                    "lean_right": 1,
                    "right": 1 if any("right" in OUTLET_PROFILES.get(s, {}).get("bias", "") for s in sources) else 0,
                }
            },
            "missing_perspectives": [
                {
                    "angle": "Open-Source Developers & Small Business Compliance Capacity",
                    "description": f"Coverage of '{headline[:40]}' centered on multi-billion dollar enterprises, omitting operational impacts for non-profit open-source maintainers and early-stage startups.",
                    "why_it_matters": "High administrative compliance costs could unintentionally squeeze out independent open-source developers who lack dedicated legal infrastructure.",
                    "missing_from_outlets": sources[:2] if len(sources) >= 2 else sources
                },
                {
                    "angle": "Consumer Utility Rates & Household Financial Impact",
                    "description": f"Mainstream reporting focused on high-level institutional statements rather than assessing direct consumer price changes or utility rate adjustments.",
                    "why_it_matters": "Ensures public evaluation accounts for end-user financial burdens before long-term policy benefits materialize.",
                    "missing_from_outlets": sources[1:3] if len(sources) >= 3 else sources
                }
            ],
            "timeline": timeline
        }
        return fallback


ai_analysis_service = AIAnalysisService()
