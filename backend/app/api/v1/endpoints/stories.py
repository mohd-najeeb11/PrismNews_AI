from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query

from pydantic import BaseModel, Field

from app.core.config import settings
from app.models.story import ComparisonItem, StoryDetailResponse, StorySummaryResponse, TimelineItem
from app.services.ai_analysis import ai_analysis_service
from app.services.db_service import db_service
from app.services.live_fetcher import live_fetcher
from app.services.quota_manager import quota_manager

router = APIRouter()


class LiveQueryRequest(BaseModel):
    query: str = Field(..., example="Nvidia AI")


@router.post("/stories/live", response_model=StoryDetailResponse, summary="On-Demand Live Topic/URL Analysis")
async def analyze_live_query(req: LiveQueryRequest) -> StoryDetailResponse:
    """
    On-demand live data ingestion and AI analysis for any topic or URL.
    Fetches real-time coverage from Google News RSS & NewsAPI, clusters publishers, and returns full analysis.
    """
    q = req.query.strip()
    try:
        q = urllib.parse.unquote(q)
    except Exception:
        pass

    if not q:
        raise HTTPException(status_code=400, detail="Query string cannot be empty.")

    if q.startswith("http://") or q.startswith("https://"):
        story = await live_fetcher.fetch_by_url(q)
    else:
        story = await live_fetcher.fetch_by_topic(q)

    return StoryDetailResponse(**story)



from app.services.clustering import clustering_service
from app.services.ingestion import ingestion_service


@router.get("/stories", response_model=List[StorySummaryResponse], summary="Search/Browse Story Clusters")
async def get_stories(q: Optional[str] = Query(None, description="Topic or headline keyword filter")) -> List[StorySummaryResponse]:
    """
    Returns a list of story cluster summaries.
    Reads from live Supabase DB first, falling back to seed dataset or live on-demand fetch.
    Respects active quota_manager.get_api_mode() ('seed', 'rss', 'live').
    """
    mode = quota_manager.get_api_mode()
    stories = []

    # 1. RSS Mode: Run live RSS ingestion & clustering on demand
    if mode == "rss":
        try:
            logger.info("Executing RSS Mode ingestion across feeds...")
            articles = ingestion_service.ingest_rss()
            if articles:
                stories = clustering_service.cluster_articles(articles, threshold=0.55)
        except Exception as e:
            logger.error(f"RSS Mode ingestion failed: {e}")

    # 2. Live Mode: Fetch from live Supabase DB or trigger live fetcher
    elif mode == "live":
        stories = db_service.get_stories(q)
        if not stories:
            try:
                topic_to_fetch = q if q else "Technology Policy"
                if topic_to_fetch.startswith("http://") or topic_to_fetch.startswith("https://"):
                    live_story = await live_fetcher.fetch_by_url(topic_to_fetch)
                else:
                    live_story = await live_fetcher.fetch_by_topic(topic_to_fetch)
                if live_story:
                    stories = [live_story]
            except Exception as e:
                logger.warning(f"Live mode fetch failed: {e}")

    # 3. Seed Mode or Fallback when no stories found
    if not stories:
        stories = quota_manager.load_seed_stories()
        if q:
            query_lower = q.lower()
            filtered = [
                s for s in stories
                if query_lower in s.get("headline", "").lower() or query_lower in s.get("topic", "").lower()
            ]
            if filtered:
                stories = filtered

    def clean_topic_name(raw_topic: str, headline: str = "") -> str:
        if not raw_topic:
            return "World News"
        combined = (str(raw_topic) + " " + str(headline)).lower()
        if any(k in combined for k in ["batman", "movie", "film", "hollywood", "actor", "cinema", "entertainment", "recipe", "bake"]):
            return "Entertainment & Media"
        elif any(k in combined for k in ["ai", "tech", "chip", "nvidia", "apple", "google", "software", "policy", "cyber"]):
            return "Technology & Policy"
        elif any(k in combined for k in ["market", "economy", "stock", "bank", "fed", "rate", "trade", "finance"]):
            return "Economy & Markets"
        elif any(k in combined for k in ["energy", "climate", "oil", "green", "environment", "solar"]):
            return "Energy & Environment"
        elif len(raw_topic) > 25:
            return "World News"
        return raw_topic

    summary_list = []
    seen_headlines = set()
    for story in stories:
        headline = story.get("headline") or story.get("title") or "Untitled Story"
        norm_h = headline.lower().strip()
        if norm_h in seen_headlines:
            continue
        seen_headlines.add(norm_h)

        cleaned_topic = clean_topic_name(story.get("topic") or story.get("category"), headline)

        summary_list.append(
            StorySummaryResponse(
                id=story["id"],
                headline=headline,
                topic=cleaned_topic,
                created_at=story.get("created_at") or datetime.now(timezone.utc).isoformat(),
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
    # 1. Check live in-memory fetcher cache
    story = live_fetcher.get_cached_story(id)

    # 2. Check Supabase DB
    if not story and settings.API_MODE != "seed":
        story = db_service.get_story_detail(id)

    # 3. Check pre-baked seed dataset
    if not story:
        story = quota_manager.get_seed_story(id)

    if not story:
        raise HTTPException(status_code=404, detail=f"Story with ID '{id}' not found")

    if "analysis" not in story or not story["analysis"]:
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


