import html
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
import httpx

from app.core.config import settings
from app.core.logging import logger
from app.models.article import NormalizedArticle
from app.services.embeddings import embed_text
from app.services.quota_manager import quota_manager


def clean_text_html(text: str) -> str:
    if not text:
        return ""
    res = text
    for _ in range(3):
        if "&" in res:
            next_res = html.unescape(res)
            if next_res == res:
                break
            res = next_res
        else:
            break
    return res.strip()



class IngestionService:
    """
    Article Ingestion Service: RSS-first (unlimited), NewsAPI secondary (capped).
    Normalizes articles, deduplicates URLs, and generates 384-dim embeddings.
    """

    def __init__(self):
        self._seen_urls: set = set()

    def load_feeds(self) -> List[Dict[str, str]]:
        base_dir = Path(__file__).resolve().parent.parent.parent
        feeds_path = base_dir / "data" / "feeds.json"
        if not feeds_path.exists():
            logger.error(f"Feeds configuration not found at {feeds_path}")
            return []
        try:
            with open(feeds_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to read feeds.json: {e}")
            return []

    def ingest_rss(self) -> List[NormalizedArticle]:
        """
        Polls configured RSS feeds, normalizes articles, and generates local embeddings.
        """
        import feedparser

        feeds = self.load_feeds()
        normalized_articles: List[NormalizedArticle] = []

        logger.info(f"Starting RSS ingestion across {len(feeds)} feeds...")

        for feed_info in feeds:
            feed_url = feed_info.get("url")
            source_id = feed_info.get("id", "00000000-0000-0000-0000-000000000000")
            source_name = feed_info.get("name", "Unknown Source")

            try:
                parsed = feedparser.parse(feed_url)
                for entry in parsed.entries[:12]:  # Take top 12 latest per feed
                    url = entry.get("link") or entry.get("id")
                    if not url or url in self._seen_urls:
                        continue

                    self._seen_urls.add(url)
                    raw_title = entry.get("title", "").strip()
                    if not raw_title:
                        continue

                    title = clean_text_html(raw_title)
                    summary = clean_text_html(entry.get("summary") or entry.get("description") or "")
                    # Truncate content to ~2,000 chars per DATABASE.md rules
                    content = summary[:2000]

                    published_raw = entry.get("published") or entry.get("updated")
                    published_at = datetime.now(timezone.utc).isoformat()
                    if published_raw:
                        try:
                            # Parse feedparser time tuple if available
                            if hasattr(entry, "published_parsed") and entry.published_parsed:
                                dt = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
                                published_at = dt.isoformat()
                        except Exception:
                            pass

                    # Generate local vector embedding (title + lede)
                    text_for_embedding = f"{title}. {content[:600]}"
                    embedding_vector = embed_text(text_for_embedding)

                    article = NormalizedArticle(
                        source_id=source_id,
                        source_name=clean_text_html(source_name),
                        title=title,
                        url=url,
                        content=content,
                        published_at=published_at,
                        embedding=embedding_vector,
                    )
                    normalized_articles.append(article)

            except Exception as e:
                logger.warning(f"Error fetching RSS feed '{source_name}' ({feed_url}): {e}")

        logger.info(f"RSS Ingestion complete. Ingested {len(normalized_articles)} new articles.")
        return normalized_articles

    async def ingest_newsapi(self, query: str) -> List[NormalizedArticle]:
        """
        NewsAPI secondary ingestion path. Capped at 8 req/day by QuotaManager.
        """
        if not quota_manager.can_call("newsapi"):
            logger.info("NewsAPI call skipped: Quota exhausted or API_MODE restricts live calls.")
            return []

        # Increment quota before making the request
        quota_manager.increment_usage("newsapi")

        api_key = getattr(settings, "NEWSAPI_KEY", None)
        if not api_key:
            logger.warning("NEWSAPI_KEY is not set. Returning empty list.")
            return []

        url = f"https://newsapi.org/v2/everything?q={query}&pageSize=5&apiKey={api_key}"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(url)
                if resp.status_code != 200:
                    logger.error(f"NewsAPI error: {resp.status_code} - {resp.text}")
                    return []
                data = resp.json()
                articles_data = data.get("articles", [])
                
                normalized_articles = []
                for item in articles_data:
                    item_url = item.get("url")
                    if not item_url or item_url in self._seen_urls:
                        continue
                    
                    self._seen_urls.add(item_url)
                    title = clean_text_html(item.get("title", ""))
                    content = clean_text_html(item.get("description") or item.get("content") or "")[:2000]
                    
                    text_for_embedding = f"{title}. {content[:600]}"
                    embedding_vector = embed_text(text_for_embedding)

                    article = NormalizedArticle(
                        source_id="newsapi-source",
                        source_name=clean_text_html(item.get("source", {}).get("name", "NewsAPI Source")),
                        title=title,
                        url=item_url,
                        content=content,
                        published_at=item.get("publishedAt") or datetime.now(timezone.utc).isoformat(),
                        embedding=embedding_vector,
                    )
                    normalized_articles.append(article)


                    article = NormalizedArticle(
                        source_id="newsapi-source",
                        source_name=item.get("source", {}).get("name", "NewsAPI"),
                        title=title,
                        url=item_url,
                        content=content,
                        published_at=item.get("publishedAt", datetime.now(timezone.utc).isoformat()),
                        embedding=embedding_vector,
                    )
                    normalized_articles.append(article)
                return normalized_articles
        except Exception as e:
            logger.error(f"Failed to query NewsAPI: {e}")
            return []


ingestion_service = IngestionService()
