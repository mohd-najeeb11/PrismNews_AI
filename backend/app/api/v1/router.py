from fastapi import APIRouter
from app.api.v1.endpoints import health, ingest, quota, saved_stories, stories, translations, user

api_v1_router = APIRouter()

api_v1_router.include_router(health.router, tags=["Health"])
api_v1_router.include_router(quota.router, tags=["Quota"])
api_v1_router.include_router(stories.router, tags=["Stories"])
api_v1_router.include_router(ingest.router, tags=["Ingestion"])
api_v1_router.include_router(user.router, tags=["User"])
api_v1_router.include_router(saved_stories.router, tags=["Saved Stories"])
api_v1_router.include_router(translations.router, tags=["Translations"])





