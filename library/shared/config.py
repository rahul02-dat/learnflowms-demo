from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    # App config
    PROJECT_NAME: str = "LearnFlow"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/learnflow"

    # Redis (Rate limiting and Celery)
    REDIS_URL: str = "redis://localhost:6379/0"

    # Authentication
    SECRET_KEY: str = "supersecretkey" # In production, use a secure random key
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Rate Limiting
    LOGIN_MAX_ATTEMPTS: int = 5
    LOGIN_BLOCK_MINUTES: int = 15

    # OTP configuration
    OTP_EXPIRE_MINUTES: int = 5

    # SMTP Configuration (Self-Hosted via Gmail or similar)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: Optional[str] = "noreply@learnflow.local"

    # System configuration
    AUDIT_LOG_LEVEL: str = "METADATA_ONLY"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=True)

settings = Settings()
