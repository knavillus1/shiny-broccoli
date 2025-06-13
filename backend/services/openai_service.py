"""OpenAI API client service."""

from __future__ import annotations

import logging
from io import BytesIO
from typing import Any

try:  # Pillow is optional in test environments
    from PIL import Image
except Exception:  # pragma: no cover - pillow may not be installed
    Image = None  # type: ignore

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
        # Convert response to dict for consistency
        try:
            return response.to_dict()
        except Exception:
            return dict(response)

    def _ensure_png(self, data: bytes) -> bytes:
        """Convert image bytes to PNG if not already."""
        if Image is None:  # pragma: no cover - Pillow not installed
            return data
        img = Image.open(BytesIO(data))
        if img.format != "PNG":
            buf = BytesIO()
            img.save(buf, format="PNG")
            return buf.getvalue()
        return data

    async def edit_image(
        self, image: bytes, mask: bytes | None, prompt: str, n: int = 1
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
        n:
            Number of images to generate (default 1).
        """
        logger.info("Sending image edit request")
        try:
            png_image = self._ensure_png(image)
            png_mask = self._ensure_png(mask) if mask else None
            # Open image to get size
            with Image.open(BytesIO(png_image)) as img_obj:
                width, height = img_obj.size
            # Prepare file-like objects for OpenAI API
            image_file = BytesIO(png_image)
            image_file.name = "image.png"
            mask_file = BytesIO(png_mask) if png_mask else None
            if mask_file:
                mask_file.name = "mask.png"
            response = await self._client.images.edit(
                model="dall-e-2",
                image=image_file,
                mask=mask_file,
                prompt=prompt,
                n=n,
                size=f"{width}x{height}",
            )
        except Exception:  # pragma: no cover - network errors mocked in tests
            logger.exception("OpenAI image edit failed")
            raise
        logger.debug("Image edit response: %s", response)
        return response.to_dict()
