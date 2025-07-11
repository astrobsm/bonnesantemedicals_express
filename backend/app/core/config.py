from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field
import os

class Settings(BaseSettings):
    model_config = {
        "env_file": ".env", 
        "env_file_encoding": "utf-8",
        "extra": "allow"  # Allow extra env vars for compatibility
    }
    
    DATABASE_URL: str = Field(
        default="postgresql://localhost:5432/astrobsm_db",
        env="DATABASE_URL",
        description="PostgreSQL database connection string"
    )
    SECRET_KEY: str = Field(
        default="development-secret-key-change-in-production",
        env="SECRET_KEY",
        description="Secret key for JWT token signing"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS Configuration
    ALLOWED_ORIGINS: List[str] = Field(
        default=["*"],
        env="ALLOWED_ORIGINS"
    )
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

    # App Configuration
    APP_NAME: str = Field(default="AstroBSM Oracle IVANSTAMAS", env="APP_NAME")
    APP_VERSION: str = Field(default="1.0.0", env="APP_VERSION")
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    DEBUG: bool = Field(default=True, env="DEBUG")

settings = Settings()

# Patch: Convert postgres:// to postgresql:// for SQLAlchemy compatibility
if settings.DATABASE_URL.startswith("postgres://"):
    settings.DATABASE_URL = settings.DATABASE_URL.replace("postgres://", "postgresql://", 1)
    settings.DATABASE_URL = settings.DATABASE_URL.replace("postgres://", "postgresql://", 1)
print(f"[DEBUG] DATABASE_URL in use: {settings.DATABASE_URL}")