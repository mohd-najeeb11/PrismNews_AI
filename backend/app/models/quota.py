from pydantic import BaseModel, Field
from typing import Dict, List, Optional


class ServiceQuotaStatus(BaseModel):
    service: str = Field(..., example="gemini")
    daily_budget: int = Field(..., example=20)
    calls_today: int = Field(..., example=1)
    calls_remaining: int = Field(..., example=19)
    tokens_today: int = Field(0, example=3200)
    is_exhausted: bool = Field(False, example=False)


class QuotaStatusResponse(BaseModel):
    api_mode: str = Field(..., example="seed")
    services: Dict[str, ServiceQuotaStatus]
    reset_at_utc: str = Field(..., example="2026-08-08T00:00:00Z")
