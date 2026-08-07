import json
import re
from datetime import datetime, timezone
from typing import Any, Dict, Optional
import httpx

from app.core.config import settings
from app.core.database import get_supabase_client
from app.core.logging import logger
from app.services.ai_analysis import normalize_story_analysis


class TranslationService:
    """
    Dedicated AI Translation Service for PrismNews AI.
    Translates story analysis payloads into target languages (Hindi / Telugu),
    stores translations in Supabase table `story_translations` & in-memory cache,
    and falls back to English if AI translation is unavailable.
    """

    def __init__(self):
        self._memory_cache: Dict[str, Dict[str, Any]] = {}

    def _get_cache_key(self, story_id: str, language: str) -> str:
        return f"{story_id}:{language.lower()}"

    def get_cached_translation(self, story_id: str, language: str) -> Optional[Dict[str, Any]]:
        lang = language.lower()
        if lang in ["en", "english"]:
            return None  # English is primary source

        cache_key = self._get_cache_key(story_id, lang)
        # 1. In-memory check
        if cache_key in self._memory_cache:
            res = dict(self._memory_cache[cache_key])
            res["cache_status"] = "Cached"
            return res

        # 2. Supabase DB check
        client = get_supabase_client()
        if client:
            try:
                db_res = client.table("story_translations").select("*").eq("story_id", story_id).eq("language", lang).execute()
                if db_res.data:
                    row = db_res.data[0]
                    translation_payload = {
                        "story_id": story_id,
                        "language": lang,
                        "balanced_summary": row.get("translated_summary", {}),
                        "comparison": row.get("translated_comparison", []),
                        "bias_analysis": row.get("translated_bias", {}),
                        "missing_perspectives": row.get("translated_perspectives", []),
                        "timeline": row.get("translated_timeline", []),
                        "transparency_report": row.get("translated_transparency_report", {}),
                        "cache_status": "Cached",
                        "updated_at": row.get("updated_at") or datetime.now(timezone.utc).isoformat(),
                    }
                    normalized = normalize_story_analysis(translation_payload)
                    normalized["language"] = lang
                    normalized["cache_status"] = "Cached"
                    self._memory_cache[cache_key] = normalized
                    return normalized
            except Exception as e:
                logger.warning(f"Failed to fetch translation for '{story_id}' ({lang}) from Supabase: {e}")

        return None

    def save_translation(self, story_id: str, language: str, translation: Dict[str, Any]) -> bool:
        lang = language.lower()
        cache_key = self._get_cache_key(story_id, lang)

        normalized = normalize_story_analysis(translation)
        normalized["story_id"] = story_id
        normalized["language"] = lang
        normalized["cache_status"] = "Cached"
        normalized["updated_at"] = datetime.now(timezone.utc).isoformat()

        # Cache in memory
        self._memory_cache[cache_key] = normalized

        # Save to Supabase DB if client is active
        client = get_supabase_client()
        if client:
            try:
                row = {
                    "story_id": story_id,
                    "language": lang,
                    "translated_summary": normalized.get("balanced_summary", {}),
                    "translated_comparison": normalized.get("comparison", []),
                    "translated_bias": normalized.get("bias_analysis", {}),
                    "translated_perspectives": normalized.get("missing_perspectives", []),
                    "translated_timeline": normalized.get("timeline", []),
                    "translated_transparency_report": normalized.get("transparency_report", {}),
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }
                client.table("story_translations").upsert(row, on_conflict="story_id,language").execute()
                logger.info(f"TranslationService: Persisted '{lang}' translation for story '{story_id}' in Supabase.")
                return True
            except Exception as e:
                logger.warning(f"Failed to persist translation for '{story_id}' ({lang}) in Supabase: {e}")

        return False

    async def translate_story(self, story_id: str, source_analysis: Dict[str, Any], target_language: str) -> Optional[Dict[str, Any]]:
        lang = target_language.lower()
        if lang in ["en", "english"]:
            return source_analysis

        # 1. Return cached translation if present
        cached = self.get_cached_translation(story_id, lang)
        if cached:
            logger.info(f"Translation HIT for story '{story_id}' ({lang})")
            return cached

        # 2. Build structured translation prompt for Gemini / Groq
        lang_name = "Hindi (हिन्दी)" if lang == "hi" else "Telugu (తెలుగు)" if lang == "te" else lang.upper()
        
        prompt = f"""You are a professional multilingual translator specializing in news media analysis.
Translate the following JSON analysis payload into {lang_name}.

CRITICAL TRANSLATION RULES:
1. Translate all explanatory text, summaries, phrases, headlines, and descriptions into natural, fluent {lang_name}.
2. Keep publisher names (e.g. "Reuters", "BBC News", "Fox News"), URLs, numeric scores, and ISO timestamps in their original format.
3. Preserve the EXACT JSON structure and key names. Output raw JSON only.

INPUT JSON ANALYSIS:
{json.dumps(source_analysis, ensure_ascii=False, indent=2)}

Output raw JSON for {lang_name}:"""

        translated_dict = None

        # Try Gemini 2.0 Flash
        if settings.GEMINI_API_KEY:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={settings.GEMINI_API_KEY}"
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"temperature": 0.1, "responseMimeType": "application/json"},
                }
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                            cleaned = text.strip()
                            if cleaned.startswith("```"):
                                cleaned = re.sub(r"^```(?:json)?\n?", "", cleaned)
                                cleaned = re.sub(r"\n?```$", "", cleaned)
                            translated_dict = json.loads(cleaned)
            except Exception as e:
                logger.warning(f"Gemini API translation error for '{story_id}' ({lang}): {e}")

        # Fallback to Groq if Gemini unavailable/failed
        if not translated_dict and settings.GROQ_API_KEY:
            try:
                url = "https://api.groq.com/openai/v1/chat/completions"
                headers = {"Authorization": f"Bearer {settings.GROQ_API_KEY}", "Content-Type": "application/json"}
                payload = {
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": "You are a professional news analysis translator. Output raw JSON only."},
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.1,
                    "response_format": {"type": "json_object"},
                }
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.post(url, headers=headers, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        choices = data.get("choices", [])
                        if choices:
                            text = choices[0].get("message", {}).get("content", "")
                            cleaned = text.strip()
                            if cleaned.startswith("```"):
                                cleaned = re.sub(r"^```(?:json)?\n?", "", cleaned)
                                cleaned = re.sub(r"\n?```$", "", cleaned)
                            translated_dict = json.loads(cleaned)
            except Exception as e:
                logger.warning(f"Groq API translation error for '{story_id}' ({lang}): {e}")

        if translated_dict:
            normalized = normalize_story_analysis(translated_dict)
            normalized["story_id"] = story_id
            normalized["language"] = lang
            normalized["cache_status"] = "Fresh"
            normalized["updated_at"] = datetime.now(timezone.utc).isoformat()
            self.save_translation(story_id, lang, normalized)
            return normalized

        logger.warning(f"AI API unavailable for '{story_id}' ({lang}). Serving structured translation fallback.")
        return self._generate_translated_fallback(story_id, source_analysis, lang)

    def _generate_translated_fallback(self, story_id: str, source_analysis: Dict[str, Any], lang: str) -> Dict[str, Any]:
        lang_label = "हिन्दी" if lang == "hi" else "తెలుగు" if lang == "te" else lang.upper()
        res = dict(source_analysis) if source_analysis else {}

        bs = dict(res.get("balanced_summary", {}))
        original_overview = bs.get("overview") or bs.get("neutral_summary") or "Synthesized news coverage."
        bs["overview"] = f"[{lang_label} अनुवाद]: {original_overview}"
        bs["neutral_summary"] = bs["overview"]
        res["balanced_summary"] = bs

        normalized = normalize_story_analysis(res)
        normalized["story_id"] = story_id
        normalized["language"] = lang
        normalized["cache_status"] = "Cached"
        normalized["updated_at"] = datetime.now(timezone.utc).isoformat()

        self._memory_cache[self._get_cache_key(story_id, lang)] = normalized
        return normalized


translation_service = TranslationService()

