from fastapi import APIRouter
from app.models.quota import QuotaStatusResponse
from app.services.quota_manager import quota_manager

router = APIRouter()


@router.get("/quota", response_model=QuotaStatusResponse, summary="Public Quota Status & Transparency")
async def get_quota_status() -> QuotaStatusResponse:
    """
    Returns public transparency metrics on daily API budget caps and usage counters.
    """
    return quota_manager.get_quota_status()
