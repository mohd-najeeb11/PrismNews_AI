import sys
from pathlib import Path

# Add parent directory to sys.path so app modules can be imported
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.database import get_supabase_client
from app.core.logging import logger
from app.services.db_service import db_service
from app.services.embeddings import embed_text
from app.services.quota_manager import quota_manager


def seed_live_supabase():
    """
    Populates live Supabase tables (`sources`, `articles`, `stories`, `story_analysis`)
    with pre-built demo story clusters from demo_stories.json.
    """
    client = get_supabase_client()
    if not client:
        logger.error("Cannot seed Supabase: Supabase client is not initialized.")
        return

    logger.info("Starting live Supabase database seeding...")
    seed_stories = quota_manager.load_seed_stories()

    if not seed_stories:
        logger.error("No seed stories found in demo_stories.json.")
        return

    # Seed dev demo user profile to satisfy foreign key constraint on saved_stories
    try:
        demo_profile = {
            "id": "00000000-0000-0000-0000-000000000000",
            "display_name": "Prism Reader",
            "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
        }
        client.table("profiles").upsert(demo_profile, on_conflict="id").execute()
        logger.info("DatabaseService: Seeded dev demo user profile into Supabase.")
    except Exception as e:
        logger.warning(f"Could not seed demo profile: {e}")


    for story in seed_stories:
        story_id = story.get("id")
        headline = story.get("headline")

        logger.info(f"Seeding story '{headline}' (ID: {story_id})...")

        # 1. Save story cluster
        db_service.save_story_cluster(story)

        # 2. Save articles & embeddings
        articles = story.get("articles", [])
        for art in articles:
            url = art.get("url") or f"https://example.com/article-{story_id}"
            title = art.get("title", "")
            content = art.get("snippet", title)
            text_for_embed = f"{title}. {content}"

            try:
                article_row = {
                    "title": title,
                    "url": url,
                    "content": content,
                    "published_at": art.get("published_at"),
                    "embedding": embed_text(text_for_embed),
                }
                client.table("articles").upsert(article_row, on_conflict="url").execute()
            except Exception as e:
                logger.warning(f"Error seeding article '{title}': {e}")

        # 3. Save analysis
        analysis = story.get("analysis")
        if analysis:
            db_service.save_story_analysis(story_id, analysis)

    logger.info("Supabase database seeding completed successfully!")



if __name__ == "__main__":
    seed_live_supabase()
