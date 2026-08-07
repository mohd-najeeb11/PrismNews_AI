import re
import uuid
import json
import urllib.parse
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import httpx
import feedparser

from app.core.config import settings
from app.core.logging import logger
from app.models.article import NormalizedArticle
from app.services.ai_analysis import ai_analysis_service
from app.services.db_service import db_service
from app.services.embeddings import embed_text
from app.services.quota_manager import quota_manager


class LiveFetcherService:
    """
    On-Demand Live Data Ingestion Service.
    Fetches real-time articles for any query topic or news URL using Google News RSS & NewsAPI.
    Clusters competing publisher coverage, runs Gemini/Groq AI analysis, and saves to DB.
    """

    def extract_domain_publisher(self, url: str) -> str:
        try:
            domain = urllib.parse.urlparse(url).netloc.lower()
            domain = re.sub(r"^www\.", "", domain)
            mapping = {
                "reuters.com": "Reuters",
                "wsj.com": "The Wall Street Journal",
                "theguardian.com": "The Guardian",
                "foxnews.com": "Fox News",
                "bbc.com": "BBC News",
                "bbc.co.uk": "BBC News",
                "cnn.com": "CNN",
                "bloomberg.com": "Bloomberg",
                "npr.org": "NPR",
                "apnews.com": "Associated Press",
                "washingtonpost.com": "The Washington Post",
                "nytimes.com": "The New York Times",
                "cnbc.com": "CNBC",
                "ft.com": "Financial Times",
                "techcrunch.com": "TechCrunch",
            }
            for k, v in mapping.items():
                if k in domain:
                    return v
            parts = domain.split(".")
            if len(parts) >= 2:
                return parts[-2].capitalize()
            return domain.capitalize()
        except Exception:
            return "News Outlet"

    def fetch_google_news_rss(self, query: str) -> List[NormalizedArticle]:
        encoded_q = urllib.parse.quote(query)
        feed_url = f"https://news.google.com/rss/search?q={encoded_q}&hl=en-US&gl=US&ceid=US:en"
        articles: List[NormalizedArticle] = []

        try:
            logger.info(f"Polling Google News RSS for live query: '{query}'...")
            parsed = feedparser.parse(feed_url)
            for entry in parsed.entries[:10]:
                title = entry.get("title", "").strip()
                link = entry.get("link") or entry.get("id", "")
                if not title or not link:
                    continue

                # Clean publisher from title if present (e.g. "Headline - Reuters")
                pub_name = "News Outlet"
                if " - " in title:
                    parts = title.rsplit(" - ", 1)
                    title_clean = parts[0].strip()
                    pub_name = parts[1].strip()
                else:
                    title_clean = title
                    pub_name = self.extract_domain_publisher(link)

                summary = entry.get("summary") or entry.get("description") or title_clean
                clean_content = re.sub(r"<[^>]+>", "", summary)[:1500]

                pub_raw = entry.get("published") or entry.get("updated")
                published_at = datetime.now(timezone.utc).isoformat()
                if hasattr(entry, "published_parsed") and entry.published_parsed:
                    try:
                        dt = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
                        published_at = dt.isoformat()
                    except Exception:
                        pass

                text_for_embed = f"{title_clean}. {clean_content[:500]}"
                vector = embed_text(text_for_embed)

                art = NormalizedArticle(
                    source_id=str(uuid.uuid4()),
                    source_name=pub_name,
                    title=title_clean,
                    url=link,
                    content=clean_content,
                    published_at=published_at,
                    embedding=vector,
                )
                articles.append(art)
        except Exception as e:
            logger.error(f"Failed to fetch Google News RSS for query '{query}': {e}")

        return articles

    async def fetch_by_url(self, target_url: str) -> Dict[str, Any]:
        """
        Scrapes target URL and searches competing outlets covering the same story.
        """
        logger.info(f"Live URL Ingestion triggered for: '{target_url}'")
        target_title = ""
        target_content = ""
        publisher = self.extract_domain_publisher(target_url)

        try:
            headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) PrismNewsAI/1.0"}
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                resp = await client.get(target_url, headers=headers)
                if resp.status_code == 200:
                    html = resp.text
                    # Extract title tag or og:title
                    title_match = re.search(r"<title[^>]*>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
                    if title_match:
                        target_title = re.sub(r"<[^>]+>", "", title_match.group(1)).strip()
                    # Clean title
                    if " - " in target_title:
                        target_title = target_title.split(" - ")[0].strip()
                    elif " | " in target_title:
                        target_title = target_title.split(" | ")[0].strip()

                    # Extract meta description
                    desc_match = re.search(r'<meta[^>]*property=["\']og:description["\'][^>]*content=["\'](.*?)["\']', html, re.IGNORECASE)
                    if not desc_match:
                        desc_match = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\'](.*?)["\']', html, re.IGNORECASE)
                    if desc_match:
                        target_content = desc_match.group(1).strip()
        except Exception as e:
            logger.warning(f"Direct HTML scrape failed for URL '{target_url}': {e}")

        if not target_title:
            # Fallback title from URL path
            path = urllib.parse.urlparse(target_url).path
            cleaned_slug = re.sub(r"[-_/]+", " ", path).strip()
            target_title = cleaned_slug.title() if len(cleaned_slug) > 10 else f"Breaking Story from {publisher}"

        # Extract core search query from headline (first 5 meaningful words)
        words = [w for w in re.findall(r"\w+", target_title) if len(w) > 3 and w.lower() not in ["http", "https", "com", "www"]]
        search_query = " ".join(words[:4]) if words else publisher

        # Fetch competing outlet articles via Google News RSS
        rss_articles = self.fetch_google_news_rss(search_query)

        # Build target article model
        target_art = NormalizedArticle(
            source_id=str(uuid.uuid4()),
            source_name=publisher,
            title=target_title,
            url=target_url,
            content=target_content or f"Direct coverage report from {publisher} regarding '{target_title}'.",
            published_at=datetime.now(timezone.utc).isoformat(),
            embedding=embed_text(f"{target_title}. {target_content}"),
        )

        all_articles = [target_art] + [a for a in rss_articles if a.url != target_url][:5]
        return await self._create_and_analyze_cluster(target_title, search_query or "Breaking News", all_articles)

    async def fetch_by_topic(self, topic_query: str) -> Dict[str, Any]:
        """
        Fetches live articles for any custom topic keyword or query string.
        """
        logger.info(f"Live Topic Ingestion triggered for query: '{topic_query}'")

        # 1. Google News RSS search (unlimited)
        rss_articles = self.fetch_google_news_rss(topic_query)

        # 2. NewsAPI search (if available and quota permits)
        from app.services.ingestion import ingestion_service
        newsapi_articles = await ingestion_service.ingest_newsapi(topic_query)

        combined = rss_articles + newsapi_articles
        # Deduplicate by URL
        unique_arts = []
        seen = set()
        for a in combined:
            if a.url not in seen:
                seen.add(a.url)
                unique_arts.append(a)

        if not unique_arts:
            logger.warning(f"No live articles returned for query '{topic_query}'. Falling back to seed cluster.")
            return quota_manager.load_seed_stories()[0]

        headline = f"Live Update: Coverage Analysis of {topic_query.title()}"
        if unique_arts:
            headline = unique_arts[0].title

        return await self._create_and_analyze_cluster(headline, topic_query.title(), unique_arts[:6])

    async def _create_and_analyze_cluster(self, headline: str, topic: str, articles: List[NormalizedArticle]) -> Dict[str, Any]:
        story_id = f"live-{uuid.uuid4()}"
        sources = list(dict.fromkeys(a.source_name for a in articles if a.source_name))

        raw_articles = []
        for a in articles:
            raw_articles.append({
                "id": a.source_id,
                "source": a.source_name,
                "source_name": a.source_name,
                "title": a.title,
                "url": a.url,
                "published_at": a.published_at,
                "snippet": a.content[:300] if a.content else "",
            })

        story = {
            "id": story_id,
            "headline": headline,
            "topic": topic,
            "category": topic,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "article_count": len(raw_articles),
            "sources_count": len(sources),
            "sources": sources,
            "articles": raw_articles,
        }

        # Execute single-pass AI Analysis
        analysis = await ai_analysis_service.analyze_story(story)
        story["analysis"] = analysis

        # Save to live database if enabled
        if settings.API_MODE != "seed":
            db_service.save_story_analysis(story_id, analysis)

        return story


live_fetcher = LiveFetcherService()
