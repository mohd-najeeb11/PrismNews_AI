from contextlib import asynccontextmanager
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.endpoints.saved_stories import SaveStoryRequest
from app.api.v1.router import api_v1_router
from app.core.auth import get_current_user
from app.core.config import settings
from app.core.logging import logger
from app.models.health import HealthCheckResponse
from app.models.quota import QuotaStatusResponse




from app.services.scheduler import ingestion_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.PROJECT_NAME} backend in {settings.ENV} mode (API_MODE={settings.API_MODE})...")
    await ingestion_scheduler.start()
    yield
    await ingestion_scheduler.stop()
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


# Top-level ingest trigger route alias (documented in API.md)
@app.post("/api/ingest/trigger", tags=["Ingestion"], summary="Top-level Ingest Trigger")
async def top_level_ingest_trigger():
    from app.api.v1.endpoints.ingest import trigger_ingest
    return await trigger_ingest()


# Top-level Auth & User aliases (documented in API.md)
@app.get("/api/me", tags=["User"], summary="Top-level Current User Profile")
async def top_level_me(user=Depends(get_current_user)):
    from app.api.v1.endpoints.user import get_me
    return await get_me(user=user)


@app.get("/api/saved-stories", tags=["Saved Stories"], summary="Top-level Get Saved Stories")
async def top_level_get_saved_stories(user=Depends(get_current_user)):
    from app.api.v1.endpoints.saved_stories import get_saved_stories
    return await get_saved_stories(user=user)


@app.post("/api/saved-stories", tags=["Saved Stories"], summary="Top-level Bookmark Story")
async def top_level_post_saved_story(req: SaveStoryRequest, user=Depends(get_current_user)):
    from app.api.v1.endpoints.saved_stories import save_story
    return await save_story(req=req, user=user)


@app.delete("/api/saved-stories/{id}", tags=["Saved Stories"], summary="Top-level Remove Bookmark")
async def top_level_delete_saved_story(id: str, user=Depends(get_current_user)):
    from app.api.v1.endpoints.saved_stories import delete_saved_story
    return await delete_saved_story(id=id, user=user)






from pathlib import Path
from fastapi.responses import FileResponse

@app.get("/", tags=["Root"])
async def root():
    frontend_index = Path(__file__).resolve().parent.parent.parent / "frontend" / "public" / "index.html"
    if frontend_index.exists():
        return FileResponse(frontend_index)
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/api/health",
        "api_v1": f"{settings.API_V1_STR}/health"
    }

