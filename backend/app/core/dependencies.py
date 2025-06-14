"""FastAPI dependency functions for core services."""

from __future__ import annotations

from fastapi import Depends

from .config import get_settings, Settings
from backend.services.openai_service import OpenAIService
from backend.services.image_processor import process_image


def get_openai_service(settings: Settings = Depends(get_settings)) -> OpenAIService:
    """Provide OpenAIService configured with application settings."""
    return OpenAIService(api_key=settings.openai_api_key)


def get_task_repository():
    """Return task manager module as a repository placeholder."""
    from backend.services import task_manager  # local import to avoid circular

    return task_manager


def get_image_processor():
    """Provide the default image processor implementation."""
    return process_image
