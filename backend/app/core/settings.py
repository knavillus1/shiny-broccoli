from __future__ import annotations

"""Application configuration management using Pydantic BaseSettings."""

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuration loaded from environment variables or .env file."""

    openai_api_key: str | None = Field(default=None)
    allow_origins: str = Field(default="http://localhost:5173")
    log_level: str = Field(default="INFO")
    log_format: str = Field(default="console")
    request_log_level: str = Field(default="INFO")
    redis_url: str | None = Field(default=None)

    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        case_sensitive=False,
        env_prefix=""
    )
