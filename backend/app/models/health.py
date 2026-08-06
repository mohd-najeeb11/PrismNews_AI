from pydantic import BaseModel, Field


class HealthCheckResponse(BaseModel):
    status: str = Field(..., example="healthy")
    project: str = Field(..., example="PrismNews AI")
    version: str = Field(..., example="1.0.0")
    environment: str = Field(..., example="development")
    api_mode: str = Field(..., example="seed")
