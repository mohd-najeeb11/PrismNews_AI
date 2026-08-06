from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query

from app.models.story import ComparisonItem, StoryDetailResponse, StorySummaryResponse, TimelineItem
from app.services.quota_manager import quota_manager

router = APIRouter()


@router.get("/stories", response_model=List[StorySummaryResponse], summary="Search/Browse Story Clusters")
async def get_stories(q: Optional[str] = Query(None, description="Topic or headline keyword filter")) -> List[StorySummaryResponse]:
    """
    Returns a list of story cluster summaries.
    Reads from cache / database (or seed dataset in API_MODE=seed). Never triggers external ingestion.
    """
    stories = quota_manager.load_seed_stories()
    
    if q:
        query_lower = q.lower()
        stories = [
            s for s in stories
            if query_lower in s.get("headline", "").lower() or query_lower in s.get("topic", "").lower()
        ]

    # Convert to StorySummaryResponse (omitting heavy analysis from list view)
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
    story = quota_manager.get_seed_story(id)
    if not story:
        raise HTTPException(status_code=404, detail=f"Story with ID '{id}' not found")

    return StoryDetailResponse(**story)


@router.get("/stories/{id}/compare", response_model=List[ComparisonItem], summary="Get Story Outlet Comparison Matrix")
async def get_story_comparison(id: str) -> List[ComparisonItem]:
    """
    Returns the outlet comparison array from the story analysis.
    """
    story = quota_manager.get_seed_story(id)
    if not story or "analysis" not in story:
        raise HTTPException(status_code=404, detail=f"Story analysis for ID '{id}' not found")

    return story["analysis"].get("comparison", [])


@router.get("/stories/{id}/timeline", response_model=List[TimelineItem], summary="Get Story Framing Evolution Timeline")
async def get_story_timeline(id: str) -> List[TimelineItem]:
    """
    Returns the chronological framing shift timeline from the story analysis.
    """
    story = quota_manager.get_seed_story(id)
    if not story or "analysis" not in story:
        raise HTTPException(status_code=404, detail=f"Story timeline for ID '{id}' not found")

    return story["analysis"].get("timeline", [])
