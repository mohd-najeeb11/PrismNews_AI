from pathlib import Path
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "PrismNews AI"
    VERSION: str = "1.0.0"
    ENV: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"

    # CORS configuration
    CORS_ORIGINS: Union[List[str], str] = ["http://localhost:3000"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    # API Mode Discipline: seed | rss | live
    API_MODE: str = "seed"

    # API Keys & Third Party Integrations
    GEMINI_API_KEY: Union[str, None] = None
    GROQ_API_KEY: Union[str, None] = None
    NEWSAPI_KEY: Union[str, None] = None
    SUPABASE_URL: Union[str, None] = None
    SUPABASE_SERVICE_ROLE_KEY: Union[str, None] = None
    SUPABASE_JWT_SECRET: Union[str, None] = None

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parent.parent.parent / ".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
