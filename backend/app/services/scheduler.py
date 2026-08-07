import asyncio
from typing import Optional
from app.core.config import settings
from app.core.logging import logger
from app.services.clustering import clustering_service
from app.services.db_service import db_service
from app.services.ingestion import ingestion_service
from app.services.quota_manager import quota_manager


class IngestionScheduler:
    """
    Automated Background Scheduler for periodic RSS feed ingestion,
    vector embedding generation, article clustering, and AI framing analysis.
    """

    def __init__(self, interval_seconds: int = 1800):
        self.interval_seconds = interval_seconds
        self._task: Optional[asyncio.Task] = None
        self._running = False

    async def start(self):
        if self._running:
            return
        self._running = True
        self._task = asyncio.create_task(self._loop())
        logger.info(f"IngestionScheduler started (interval: {self.interval_seconds}s, API_MODE={settings.API_MODE}).")

    async def stop(self):
        if not self._running:
            return
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("IngestionScheduler stopped.")

    async def _loop(self):
        # Initial run on startup if not in seed-only mode
        while self._running:
            try:
                if settings.API_MODE != "seed":
                    logger.info("Executing scheduled RSS background ingestion cycle...")
                    articles = ingestion_service.ingest_rss()
                    if articles:
                        # Save normalized articles & embeddings to Supabase
                        db_service.save_articles(articles)

                        # Cluster into story topics
                        clusters = clustering_service.cluster_articles(articles)
                        for story in clusters:
                            db_service.save_story_cluster(story)
                else:
                    logger.info("IngestionScheduler cycle skipped (API_MODE=seed)")
            except Exception as e:
                logger.error(f"Error in background ingestion scheduler cycle: {e}")

            # Sleep for configured interval
            await asyncio.sleep(self.interval_seconds)


ingestion_scheduler = IngestionScheduler(interval_seconds=1800)
