from fastapi import APIRouter
from app.core.config import settings
from app.models.health import HealthCheckResponse

router = APIRouter()


@router.get("/health", response_model=HealthCheckResponse, summary="Health Check Endpoint")
async def health_check() -> HealthCheckResponse:
    return HealthCheckResponse(
        status="healthy",
        project=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENV,
        api_mode=settings.API_MODE,
    )
