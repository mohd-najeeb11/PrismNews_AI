from typing import Any, Dict
from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.ingestion import ingestion_service
from app.services.quota_manager import quota_manager

router = APIRouter()


class IngestTriggerResponse(BaseModel):
    mode: str = Field(..., example="rss")
    articles_ingested: int = Field(..., example=12)
    newsapi_calls_remaining: int = Field(..., example=8)
    gemini_calls_remaining: int = Field(..., example=20)


@router.post("/ingest/trigger", response_model=IngestTriggerResponse, summary="Manual Ingestion Trigger")
async def trigger_ingest() -> IngestTriggerResponse:
    """
    Manually triggers an RSS ingestion & normalization cycle.
    Respects QuotaManager daily caps.
    """
    mode = quota_manager.get_api_mode()
    
    # Run RSS ingest
    articles = ingestion_service.ingest_rss()

    quota_status = quota_manager.get_quota_status()
    newsapi_rem = quota_status.services.get("newsapi", {}).calls_remaining if hasattr(quota_status.services.get("newsapi"), "calls_remaining") else 8
    gemini_rem = quota_status.services.get("gemini", {}).calls_remaining if hasattr(quota_status.services.get("gemini"), "calls_remaining") else 20

    return IngestTriggerResponse(
        mode=mode,
        articles_ingested=len(articles),
        newsapi_calls_remaining=newsapi_rem,
        gemini_calls_remaining=gemini_rem,
    )
