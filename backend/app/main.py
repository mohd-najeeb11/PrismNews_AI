from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_v1_router
from app.core.config import settings
from app.core.logging import logger
from app.models.health import HealthCheckResponse
from app.models.quota import QuotaStatusResponse



@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.PROJECT_NAME} backend in {settings.ENV} mode (API_MODE={settings.API_MODE})...")
    yield
    logger.info(f"Shutting down {settings.PROJECT_NAME} backend...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware configuration
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include v1 router
app.include_router(api_v1_router, prefix=settings.API_V1_STR)

# Top-level health check aliases for backward compatibility & direct deploy checks
@app.get("/api/health", response_model=HealthCheckResponse, tags=["Health"], summary="Top-level API Health Check")
@app.get("/health", response_model=HealthCheckResponse, tags=["Health"], summary="Top-level Health Check")
async def top_level_health() -> HealthCheckResponse:
    return HealthCheckResponse(
        status="healthy",
        project=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENV,
        api_mode=settings.API_MODE,
    )


# Top-level quota endpoint alias (documented in API.md)
@app.get("/api/quota", response_model=QuotaStatusResponse, tags=["Quota"], summary="Public API Quota Status")
async def top_level_quota() -> QuotaStatusResponse:
    from app.services.quota_manager import quota_manager
    return quota_manager.get_quota_status()


# Top-level stories route aliases (documented in API.md)
@app.get("/api/stories", tags=["Stories"], summary="Top-level Stories Search/Browse")
async def top_level_stories(q: str = None):
    from app.api.v1.endpoints.stories import get_stories
    return await get_stories(q=q)


@app.get("/api/stories/{id}", tags=["Stories"], summary="Top-level Story Detail")
async def top_level_story_by_id(id: str):
    from app.api.v1.endpoints.stories import get_story_by_id
    return await get_story_by_id(id=id)


@app.get("/api/stories/{id}/compare", tags=["Stories"], summary="Top-level Story Comparison")
async def top_level_story_compare(id: str):
    from app.api.v1.endpoints.stories import get_story_comparison
    return await get_story_comparison(id=id)


@app.get("/api/stories/{id}/timeline", tags=["Stories"], summary="Top-level Story Timeline")
async def top_level_story_timeline(id: str):
    from app.api.v1.endpoints.stories import get_story_timeline
    return await get_story_timeline(id=id)




@app.get("/", tags=["Root"])
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/api/health",
        "api_v1": f"{settings.API_V1_STR}/health"
    }
