from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query

from app.core.config import settings
from app.models.story import ComparisonItem, StoryDetailResponse, StorySummaryResponse, TimelineItem
from app.services.ai_analysis import ai_analysis_service
from app.services.db_service import db_service
from app.services.quota_manager import quota_manager

router = APIRouter()


@router.get("/stories", response_model=List[StorySummaryResponse], summary="Search/Browse Story Clusters")
async def get_stories(q: Optional[str] = Query(None, description="Topic or headline keyword filter")) -> List[StorySummaryResponse]:
    """
    Returns a list of story cluster summaries.
    Reads from live Supabase DB first, falling back to seed dataset in API_MODE=seed or when empty.
    """
    stories = []
    if settings.API_MODE != "seed":
        stories = db_service.get_stories(q)

    if not stories:
        stories = quota_manager.load_seed_stories()
        if q:
            query_lower = q.lower()
            stories = [
                s for s in stories
                if query_lower in s.get("headline", "").lower() or query_lower in s.get("topic", "").lower()
            ]

    summary_list = []
    for story in stories:
        summary_list.append(
            StorySummaryResponse(
                id=story["id"],
                headline=story["headline"],
                topic=story["topic"],
                created_at=story["created_at"],
                article_count=story.get("article_count", len(story.get("articles", []))),
                sources=story.get("sources", []),
                articles=story.get("articles", []),
            )
        )
    return summary_list


@router.get("/stories/{id}", response_model=StoryDetailResponse, summary="Get Story Detail & Full Analysis")
async def get_story_by_id(id: str) -> StoryDetailResponse:
    """
    Returns full story metadata and cached AI analysis for all dashboard tabs.
    """
    story = None
    if settings.API_MODE != "seed":
        story = db_service.get_story_detail(id)

    if not story:
        story = quota_manager.get_seed_story(id)

    if not story:
        raise HTTPException(status_code=404, detail=f"Story with ID '{id}' not found")

    analysis = await ai_analysis_service.analyze_story(story)
    story["analysis"] = analysis

    # Persist generated analysis back to Supabase if live
    if settings.API_MODE != "seed":
        db_service.save_story_analysis(id, analysis)

    return StoryDetailResponse(**story)


@router.get("/stories/{id}/compare", response_model=List[ComparisonItem], summary="Get Story Outlet Comparison Matrix")
async def get_story_comparison(id: str) -> List[ComparisonItem]:
    """
    Returns the outlet comparison array from the story analysis.
    """
    story_detail = await get_story_by_id(id)
    if not story_detail.analysis:
        raise HTTPException(status_code=404, detail=f"Story analysis for ID '{id}' not found")

    return story_detail.analysis.comparison


@router.get("/stories/{id}/timeline", response_model=List[TimelineItem], summary="Get Story Framing Evolution Timeline")
async def get_story_timeline(id: str) -> List[TimelineItem]:
    """
    Returns the chronological framing shift timeline from the story analysis.
    """
    story_detail = await get_story_by_id(id)
    if not story_detail.analysis:
        raise HTTPException(status_code=404, detail=f"Story timeline for ID '{id}' not found")

    return story_detail.analysis.timeline


