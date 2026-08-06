from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_v1_router
from app.core.config import settings
from app.core.logging import logger
from app.models.health import HealthCheckResponse


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


@app.get("/", tags=["Root"])
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/api/health",
        "api_v1": f"{settings.API_V1_STR}/health"
    }
