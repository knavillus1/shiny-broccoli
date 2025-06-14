"""FastAPI dependency functions for core services."""

from __future__ import annotations

from fastapi import Depends

from .config import get_settings, Settings
from backend.services.openai_service import OpenAIService
from backend.services.async_image_processor import AsyncImageProcessor


def get_openai_service(settings: Settings = Depends(get_settings)) -> OpenAIService:
    """Provide OpenAIService configured with application settings."""
    return OpenAIService(api_key=settings.openai_api_key)


def get_task_repository():
    """Return task manager module as a repository placeholder."""
    from backend.services import task_manager  # local import to avoid circular

    return task_manager


_async_processor = AsyncImageProcessor()


def get_image_processor() -> AsyncImageProcessor:
    """Provide the default async image processor instance."""
    return _async_processor


def get_process_image():
    """Provide the synchronous image processing function."""
    from backend.services.image_processor import process_image

    return process_image
