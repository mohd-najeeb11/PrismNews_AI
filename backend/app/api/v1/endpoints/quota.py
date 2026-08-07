from fastapi import APIRouter, Body, HTTPException
from app.models.quota import QuotaStatusResponse, SetApiModeRequest
from app.services.quota_manager import quota_manager

router = APIRouter()


@router.get("/quota", response_model=QuotaStatusResponse, summary="Public Quota Status & Transparency")
async def get_quota_status() -> QuotaStatusResponse:
    """
    Returns public transparency metrics on daily API budget caps and usage counters.
    """
    return quota_manager.get_quota_status()


@router.post("/quota/mode", response_model=QuotaStatusResponse, summary="Update Active API Mode")
async def update_api_mode(req: SetApiModeRequest = Body(...)) -> QuotaStatusResponse:
    """
    Dynamically switches backend API mode between 'seed', 'rss', and 'live'.
    """
    try:
        quota_manager.set_api_mode(req.mode)
        return quota_manager.get_quota_status()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

