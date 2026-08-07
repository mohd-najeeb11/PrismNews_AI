import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from app.core.database import get_supabase_client
from app.core.logging import logger
from app.models.article import NormalizedArticle


class DatabaseService:
    """
    Supabase Database Persistence Layer.
    Executes CRUD operations against live Postgres tables:
    `sources`, `articles`, `stories`, `story_articles`, `story_analysis`, `saved_stories`, `profiles`.
    """

    def save_articles(self, articles: List[NormalizedArticle]) -> int:
        client = get_supabase_client()
        if not client or not articles:
            return 0

        inserted_count = 0
        for art in articles:
            try:
                row = {
                    "title": art.title,
                    "url": art.url,
                    "content": art.content[:2000] if art.content else "",
                    "published_at": art.published_at or datetime.now(timezone.utc).isoformat(),
                    "embedding": art.embedding if art.embedding else None,
                }
                res = client.table("articles").upsert(row, on_conflict="url").execute()
                if res.data:
                    inserted_count += 1
            except Exception as e:
                logger.warning(f"Failed to save article '{art.title}' to Supabase: {e}")

        logger.info(f"DatabaseService: Upserted {inserted_count}/{len(articles)} articles into Supabase.")
        return inserted_count

    def save_story_cluster(self, story: Dict[str, Any]) -> Optional[str]:
        client = get_supabase_client()
        if not client:
            return None

        story_id = story.get("id") or str(uuid.uuid4())
        try:
            story_row = {
                "id": story_id,
                "headline": story.get("headline", "Untitled Story"),
                "topic": story.get("topic", "General"),
                "created_at": story.get("created_at") or datetime.now(timezone.utc).isoformat(),
            }
            client.table("stories").upsert(story_row, on_conflict="id").execute()
            logger.info(f"DatabaseService: Persisted story cluster '{story_id}' into Supabase.")
            return story_id
        except Exception as e:
            logger.error(f"Failed to save story cluster to Supabase: {e}")
            return None

    def save_story_analysis(self, story_id: str, analysis: Dict[str, Any]) -> bool:
        client = get_supabase_client()
        if not client or not story_id or not analysis:
            return False

        try:
            analysis_row = {
                "story_id": story_id,
                "balanced_summary": analysis.get("balanced_summary", {}),
                "comparison": analysis.get("comparison", []),
                "bias_analysis": analysis.get("bias_analysis", []),
                "missing_perspectives": analysis.get("missing_perspectives", {}),
                "timeline": analysis.get("timeline", []),
                "analyzed_at": datetime.now(timezone.utc).isoformat(),
            }
            client.table("story_analysis").upsert(analysis_row, on_conflict="story_id").execute()
            logger.info(f"DatabaseService: Saved story analysis for ID '{story_id}' in Supabase.")
            return True
        except Exception as e:
            logger.error(f"Failed to save story analysis for ID '{story_id}' to Supabase: {e}")
            return False

    def get_stories(self, query: Optional[str] = None) -> List[Dict[str, Any]]:
        client = get_supabase_client()
        if not client:
            return []

        try:
            db_query = client.table("stories").select("*").order("created_at", desc=True)
            if query:
                db_query = db_query.or_(f"headline.ilike.%{query}%,topic.ilike.%{query}%")

            res = db_query.limit(20).execute()
            if not res.data:
                return []

            stories = []
            for row in res.data:
                stories.append({
                    "id": str(row.get("id")),
                    "headline": row.get("headline"),
                    "topic": row.get("topic", "General"),
                    "created_at": row.get("created_at"),
                    "article_count": 3,
                    "sources": ["Reuters", "BBC", "CNN"],
                    "articles": [],
                })
            return stories
        except Exception as e:
            logger.warning(f"Supabase DB query error on get_stories: {e}")
            return []

    def get_story_detail(self, story_id: str) -> Optional[Dict[str, Any]]:
        client = get_supabase_client()
        if not client:
            return None

        try:
            res = client.table("stories").select("*").eq("id", story_id).execute()
            if not res.data:
                return None

            story_row = res.data[0]
            analysis_res = client.table("story_analysis").select("*").eq("story_id", story_id).execute()
            analysis_data = analysis_res.data[0] if analysis_res.data else None

            story = {
                "id": str(story_row.get("id")),
                "headline": story_row.get("headline"),
                "topic": story_row.get("topic", "General"),
                "created_at": story_row.get("created_at"),
                "article_count": 3,
                "sources": ["Reuters", "BBC", "CNN"],
                "articles": [],
            }
            if analysis_data:
                story["analysis"] = {
                    "balanced_summary": analysis_data.get("balanced_summary", {}),
                    "comparison": analysis_data.get("comparison", []),
                    "bias_analysis": analysis_data.get("bias_analysis", []),
                    "missing_perspectives": analysis_data.get("missing_perspectives", {}),
                    "timeline": analysis_data.get("timeline", []),
                }
            return story
        except Exception as e:
            logger.warning(f"Supabase DB query error on get_story_detail '{story_id}': {e}")
            return None

    def get_saved_stories(self, user_id: str) -> List[str]:
        client = get_supabase_client()
        if not client or not user_id:
            return []

        try:
            res = client.table("saved_stories").select("story_id").eq("user_id", user_id).execute()
            if res.data:
                return [str(row["story_id"]) for row in res.data if "story_id" in row]
        except Exception as e:
            logger.warning(f"Failed to fetch saved stories for user '{user_id}': {e}")

        return []

    def save_bookmark(self, user_id: str, story_id: str) -> bool:
        client = get_supabase_client()
        if not client or not user_id or not story_id:
            return False

        try:
            row = {"user_id": user_id, "story_id": story_id}
            client.table("saved_stories").upsert(row, on_conflict="user_id,story_id").execute()
            logger.info(f"DatabaseService: Bookmarked story '{story_id}' for user '{user_id}'.")
            return True
        except Exception as e:
            logger.warning(f"Failed to bookmark story '{story_id}' in Supabase: {e}")
            return False

    def remove_bookmark(self, user_id: str, story_id: str) -> bool:
        client = get_supabase_client()
        if not client or not user_id or not story_id:
            return False

        try:
            client.table("saved_stories").delete().eq("user_id", user_id).eq("story_id", story_id).execute()
            logger.info(f"DatabaseService: Removed bookmark '{story_id}' for user '{user_id}'.")
            return True
        except Exception as e:
            logger.warning(f"Failed to delete bookmark '{story_id}' in Supabase: {e}")
            return False


db_service = DatabaseService()
