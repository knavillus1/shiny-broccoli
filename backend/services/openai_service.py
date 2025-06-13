"""OpenAI API client service."""

from __future__ import annotations

import logging
from typing import Any

import openai

from backend.app.core.config import get_settings

logger = logging.getLogger(__name__)


class OpenAIService:
    """Simple wrapper around the OpenAI Async API client."""

    def __init__(self, api_key: str | None = None) -> None:
        settings = get_settings()
        key = api_key or settings.openai_api_key
        if not key:
            raise ValueError("OpenAI API key is not configured")
        self._client = openai.AsyncOpenAI(api_key=key)
        logger.debug("OpenAI client initialized")

    async def verify_connection(self) -> dict[str, Any]:
        """Perform a trivial API call to verify credentials.

        The call is mocked during tests and does not require network access.
        """
        logger.info("Verifying OpenAI credentials")
        response = await self._client.models.list()
        logger.debug("Models list response: %s", response)
        return response

    async def edit_image(
        self, image: bytes, mask: bytes | None, prompt: str
    ) -> dict[str, Any]:
        """Send an image edit request to OpenAI.

        Parameters
        ----------
        image:
            The base image data in bytes.
        mask:
            Optional mask image data in bytes.
        prompt:
            The editing prompt to apply.
        """
        logger.info("Sending image edit request")
        try:
            response = await self._client.images.edit(
                image=image,
                mask=mask,
                prompt=prompt,
            )
        except Exception:  # pragma: no cover - network errors mocked in tests
            logger.exception("OpenAI image edit failed")
            raise
        logger.debug("Image edit response: %s", response)
        return response
