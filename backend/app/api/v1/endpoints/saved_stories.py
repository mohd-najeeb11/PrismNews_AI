from typing import Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.core.auth import UserProfile, get_current_user
from app.models.story import StorySummaryResponse
from app.services.db_service import db_service
from app.services.quota_manager import quota_manager

router = APIRouter()

# In-memory store fallback when running in offline/seed mode
_user_saved_store: Dict[str, set] = {}


class SaveStoryRequest(BaseModel):
    story_id: str = Field(..., example="story-tech-01")


class SavedStoryActionResponse(BaseModel):
    status: str
    story_id: str
    message: str


@router.get("/saved-stories", response_model=List[StorySummaryResponse], summary="Get User Saved Stories")
async def get_saved_stories(user: UserProfile = Depends(get_current_user)) -> List[StorySummaryResponse]:
    """
    Returns list of saved/bookmarked stories for current user from Supabase (or seed store fallback).
    """
    saved_ids = set(db_service.get_saved_stories(user.id))
    if not saved_ids:
        saved_ids = _user_saved_store.get(user.id, set())

    seed_stories = quota_manager.load_seed_stories()

    # If empty store for user in dev mode, default save the first story for rich UI demo
    if not saved_ids and seed_stories:
        first_id = seed_stories[0]["id"]
        saved_ids.add(first_id)
        _user_saved_store[user.id] = saved_ids

    saved_list = []
    for story in seed_stories:
        if story["id"] in saved_ids:
            saved_list.append(
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
    return saved_list


@router.post("/saved-stories", response_model=SavedStoryActionResponse, summary="Bookmark a Story")
async def save_story(
    req: SaveStoryRequest, user: UserProfile = Depends(get_current_user)
) -> SavedStoryActionResponse:
    """
    Saves a story to the user's bookmarks in live Supabase and local cache.
    """
    user_saved = _user_saved_store.setdefault(user.id, set())
    user_saved.add(req.story_id)

    db_service.save_bookmark(user.id, req.story_id)

    return SavedStoryActionResponse(
        status="success",
        story_id=req.story_id,
        message="Story bookmarked successfully",
    )


@router.delete("/saved-stories/{id}", response_model=SavedStoryActionResponse, summary="Remove Bookmarked Story")
async def delete_saved_story(
    id: str, user: UserProfile = Depends(get_current_user)
) -> SavedStoryActionResponse:
    """
    Removes a bookmarked story from live Supabase and local cache.
    """
    user_saved = _user_saved_store.get(user.id, set())
    if id in user_saved:
        user_saved.remove(id)

    db_service.remove_bookmark(user.id, id)

    return SavedStoryActionResponse(
        status="success",
        story_id=id,
        message="Bookmark removed successfully",
    )

