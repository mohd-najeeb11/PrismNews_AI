from fastapi import APIRouter
from app.api.v1.endpoints import health, quota

api_v1_router = APIRouter()

api_v1_router.include_router(health.router, tags=["Health"])
api_v1_router.include_router(quota.router, tags=["Quota"])

