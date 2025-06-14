from __future__ import annotations

"""Application configuration management using Pydantic BaseSettings."""

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuration loaded from environment variables or .env file."""

    openai_api_key: str | None = Field(default=None, env="OPENAI_API_KEY")
    allow_origins: str = Field(default="http://localhost:5173", env="ALLOW_ORIGINS")
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    redis_url: str | None = Field(default=None, env="REDIS_URL")

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")
