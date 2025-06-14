"""OpenAI API client service with basic PNG optimization."""

from __future__ import annotations

from io import BytesIO
from typing import Any
import structlog

import openai

from backend.app.core.config import get_settings
from backend.services.domain.async_image_processor import AsyncImageProcessor

logger = structlog.get_logger(__name__)


class OpenAIService:
    """Simple wrapper around the OpenAI Async API client."""

    def __init__(self, api_key: str | None = None) -> None:
        settings = get_settings()
        key = api_key or settings.openai_api_key
        if not key:
            raise ValueError("OpenAI API key is not configured")
        self._client = openai.AsyncOpenAI(api_key=key)
        logger.debug("OpenAI client initialized")

    async def edit_image(
        self,
        image: bytes,
        mask: bytes | None,
        prompt: str,
        n: int = 1,
        *,
        processor: AsyncImageProcessor | None = None,
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
            processor = processor or AsyncImageProcessor()
            png_image, png_mask, width, height = await processor.process_image_async(
                image, mask
            )

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
        except Exception:
            logger.exception("OpenAI image edit failed")
            raise
        logger.info("Image edit response: %s", response)
        try:
            result = response.to_dict()
            logger.info("Successfully converted response to dict")
            return result
        except Exception as e:
            logger.warning(f"Failed to convert response to dict using to_dict(): {e}")
            try:
                result = dict(response)
                logger.info("Successfully converted response using dict()")
                return result
            except Exception as e2:
                logger.error("Failed to convert response using dict(): %s", e2)
                raise RuntimeError(
                    f"Could not convert OpenAI response to dict: {e2}"
                ) from e2
