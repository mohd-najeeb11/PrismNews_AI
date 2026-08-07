from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Body, HTTPException, status
from pydantic import BaseModel, Field

from app.services.ai_analysis import ai_analysis_service
from app.services.live_fetcher import live_fetcher
from app.services.quota_manager import quota_manager
from app.services.translation_service import translation_service

router = APIRouter()


class LanguageResponse(BaseModel):
    code: str
    name: str
    native_name: str
    flag: str


class TranslateStoryRequest(BaseModel):
    language: str = Field(..., example="hi")


class StoryTranslationResponse(BaseModel):
    story_id: str
    language: str
    cache_status: str
    translated_content: Dict[str, Any]
    last_updated: str


@router.get("/languages", response_model=List[LanguageResponse], summary="List Supported Languages")
async def get_supported_languages() -> List[LanguageResponse]:
    """
    Returns list of supported UI and AI translation languages.
    """
    return [
        LanguageResponse(code="en", name="English", native_name="English", flag="🇬🇧"),
        LanguageResponse(code="hi", name="Hindi", native_name="हिन्दी", flag="🇮🇳"),
        LanguageResponse(code="te", name="Telugu", native_name="తెలుగు", flag="🇮🇳"),
    ]


@router.get("/stories/{id}/translations/{language}", summary="Get Cached Story Translation")
async def get_story_translation(id: str, language: str):
    """
    Retrieves cached translation for a story in the requested language (e.g. 'hi' or 'te').
    """
    lang = language.lower()
    if lang in ["en", "english"]:
        return {"story_id": id, "language": "en", "cache_status": "Original", "translated_content": {}}

    cached = translation_service.get_cached_translation(id, lang)
    if not cached:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Translation for story '{id}' in language '{lang}' has not been generated yet.",
        )

    return {
        "story_id": id,
        "language": lang,
        "cache_status": cached.get("cache_status", "Cached"),
        "translated_content": cached,
        "last_updated": cached.get("updated_at", ""),
    }


@router.post("/stories/{id}/translate", summary="Translate Story Analysis")
async def translate_story(id: str, req: TranslateStoryRequest = Body(...)):
    """
    Translates AI story analysis into target language ('hi' or 'te') using Gemini/Groq AI pipeline.
    """
    target_lang = req.language.lower()
    if target_lang in ["en", "english"]:
        return {
            "story_id": id,
            "language": "en",
            "cache_status": "Original",
            "translated_content": {},
            "last_updated": "",
        }

    if target_lang not in ["hi", "te"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported language '{target_lang}'. Supported: 'en', 'hi', 'te'.",
        )

    # Check cache first
    cached = translation_service.get_cached_translation(id, target_lang)
    if cached:
        return {
            "story_id": id,
            "language": target_lang,
            "cache_status": "Cached",
            "translated_content": cached,
            "last_updated": cached.get("updated_at", ""),
        }

    # Fetch original story analysis
    story = live_fetcher.get_cached_story(id)
    if not story:
        from app.services.db_service import db_service
        story = db_service.get_story_detail(id)
    if not story:
        seed_stories = quota_manager.load_seed_stories()
        for s in seed_stories:
            if s["id"] == id:
                story = s
                break


    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Story with ID '{id}' not found.",
        )

    # Get analysis
    analysis = story.get("analysis")
    if not analysis:
        analysis = await ai_analysis_service.analyze_story(story)

    # Perform translation
    translated = await translation_service.translate_story(id, analysis, target_lang)
    if not translated:
        # Graceful fallback: return 200 with status "Unavailable" so frontend handles fallback cleanly
        return {
            "story_id": id,
            "language": target_lang,
            "cache_status": "Unavailable",
            "translated_content": analysis,
            "last_updated": "",
            "message": "Translation currently unavailable.",
        }

    return {
        "story_id": id,
        "language": target_lang,
        "cache_status": translated.get("cache_status", "Fresh"),
        "translated_content": translated,
        "last_updated": translated.get("updated_at", ""),
    }
