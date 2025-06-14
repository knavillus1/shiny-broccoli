"""Application configuration management utilities."""

from dataclasses import dataclass
from functools import lru_cache
import os


@dataclass
class Settings:
    allow_origins: str = "http://localhost:5173"
    openai_api_key: str | None = None

    @classmethod
    def from_env(cls) -> "Settings":
        """Create a Settings instance populated from environment variables."""
        return cls(
            allow_origins=os.getenv("ALLOW_ORIGINS", "http://localhost:5173"),
            openai_api_key=os.getenv("OPENAI_API_KEY"),
        )


@lru_cache()
def get_settings() -> Settings:
    """Return cached Settings instance."""
    return Settings.from_env()
