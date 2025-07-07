from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field
import os

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://astrobsm:WttcHRFGuDdzcwFn5YtdcNodlshXJ3sT@dpg-d10a2i8gjchc73agp9a0-a.oregon-postgres.render.com/bonnesantemedical_db"
    SECRET_KEY: str = "your_secret_key"  # Change this to a strong secret key
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALLOWED_ORIGINS: List[str] = ["*"]  # Correct field name for allowed origins
    allow_methods: List[str] = Field(
        default=["*"],
        env="ALLOW_METHODS",
        description="List of HTTP methods allowed for CORS"
    )
    allow_headers: List[str] = Field(
        default=["*"],
        env="ALLOW_HEADERS",
        description="List of HTTP headers allowed for CORS"
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "allow"  # Allow extra env vars (e.g., SKIP_PREFLIGHT_CHECK) for Render compatibility

settings = Settings()
# Patch: Convert postgres:// to postgresql:// for SQLAlchemy compatibility
if settings.DATABASE_URL.startswith("postgres://"):
    settings.DATABASE_URL = settings.DATABASE_URL.replace("postgres://", "postgresql://", 1)
print(f"[DEBUG] DATABASE_URL in use: {settings.DATABASE_URL}")