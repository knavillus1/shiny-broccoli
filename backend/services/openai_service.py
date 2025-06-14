"""OpenAI API client service with basic PNG optimization."""

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
        return response

    def _ensure_png(self, data: bytes) -> bytes:
        """Return image data encoded as optimized PNG."""
        if Image is None:  # pragma: no cover - Pillow not installed
            return data
        img = Image.open(BytesIO(data))
        buf = BytesIO()
        img.save(buf, format="PNG", optimize=True)
        return buf.getvalue()

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

            # Open image to get size and ensure supported dimensions
            if Image is not None:
                with Image.open(BytesIO(png_image)) as img_obj:
                    orig_w, orig_h = img_obj.size
                    # choose supported target size
                    supported_sizes = (256, 512, 1024)
                    target_size = 1024  # Default to largest if image is bigger
                    for s in supported_sizes:
                        if max(orig_w, orig_h) <= s:
                            target_size = s
                            break

                    # Resize image to square using padding instead of stretching
                    if orig_w != target_size or orig_h != target_size:
                        # Create a new square image with transparent background
                        square_img = Image.new('RGBA', (target_size, target_size), (0, 0, 0, 0))
                        
                        # Calculate scaling to fit within target_size while maintaining aspect ratio
                        scale = min(target_size / orig_w, target_size / orig_h)
                        new_w = int(orig_w * scale)
                        new_h = int(orig_h * scale)
                        
                        # Resize original image maintaining aspect ratio
                        resized_img = img_obj.resize((new_w, new_h), Image.Resampling.LANCZOS)
                        
                        # Calculate position to center the image
                        paste_x = (target_size - new_w) // 2
                        paste_y = (target_size - new_h) // 2
                        
                        # Paste the resized image onto the square canvas
                        square_img.paste(resized_img, (paste_x, paste_y))
                        
                        buf = BytesIO()
                        square_img.save(buf, format="PNG", optimize=True)
                        png_image = buf.getvalue()
                        
                        logger.info(f"Image padded from {orig_w}x{orig_h} to {target_size}x{target_size}, "
                                  f"content at ({paste_x},{paste_y}) size {new_w}x{new_h}")

                    width = height = target_size

                # Resize mask to match if present
                if png_mask:
                    with Image.open(BytesIO(png_mask)) as m_obj:
                        mask_w, mask_h = m_obj.size
                        if mask_w != target_size or mask_h != target_size:
                            # Apply the same transformation to the mask as we did to the image
                            square_mask = Image.new('RGBA', (target_size, target_size), (0, 0, 0, 255))  # Opaque background
                            
                            # Calculate scaling (should match image scaling)
                            scale = min(target_size / mask_w, target_size / mask_h)
                            new_mask_w = int(mask_w * scale)
                            new_mask_h = int(mask_h * scale)
                            
                            # Resize mask maintaining aspect ratio
                            resized_mask = m_obj.resize((new_mask_w, new_mask_h), Image.Resampling.LANCZOS)
                            
                            # Calculate position to center the mask (should match image positioning)
                            paste_x = (target_size - new_mask_w) // 2
                            paste_y = (target_size - new_mask_h) // 2
                            
                            # Paste the resized mask onto the square canvas
                            square_mask.paste(resized_mask, (paste_x, paste_y))
                            
                            mbuf = BytesIO()
                            square_mask.save(mbuf, format="PNG", optimize=True)
                            png_mask = mbuf.getvalue()
                            
                            logger.info(f"Mask padded from {mask_w}x{mask_h} to {target_size}x{target_size}, "
                                      f"content at ({paste_x},{paste_y}) size {new_mask_w}x{new_mask_h}")
            else:  # pragma: no cover - Pillow not installed
                # This case should ideally not happen if frontend validates
                # but as a fallback, try to get dimensions if possible
                # This might still fail if PIL is missing and image lacks size info
                try:
                    # A simple way to get dimensions for PNG without full PIL
                    # This is a placeholder and might not work for all PNGs
                    # A more robust solution would be needed if PIL is optional
                    if (
                        png_image.startswith(b'\x89PNG\r\n\x1a\n')
                        and png_image[12:16] == b'IHDR'
                    ):
                        import struct
                        width, height = struct.unpack('>LL', png_image[16:24])
                    else:  # Fallback when PNG header is missing
                        # Proceed with original bytes if no PIL
                        pass  # width/height may be missing; API might error
                except Exception:  # pragma: no cover
                    # If we can't determine size and PIL is not there, we can't resize.
                    # The API will likely reject it if not already a supported size.
                    pass

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
                logger.error(f"Failed to convert response using dict(): {e2}")
                raise RuntimeError(f"Could not convert OpenAI response to dict: {e2}") from e2
