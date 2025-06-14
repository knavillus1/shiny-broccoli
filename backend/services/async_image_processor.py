"""Asynchronous image processing utilities using thread pools."""

from __future__ import annotations

import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
from typing import Tuple

try:  # Pillow is optional for test environments
    from PIL import Image
except Exception:  # pragma: no cover - optional dependency
    Image = None  # type: ignore

logger = logging.getLogger(__name__)


class AsyncImageProcessor:
    """Process images in a thread pool to avoid blocking the event loop."""

    def __init__(self, max_workers: int = 4) -> None:
        self._executor = ThreadPoolExecutor(max_workers=max_workers)

    # Internal synchronous processing function
    def _process(
        self, image: bytes, mask: bytes | None
    ) -> Tuple[bytes, bytes | None, int, int]:
        if Image is None:
            # No processing possible without Pillow
            return image, mask, 0, 0

        png_image = self._ensure_png(image)
        png_mask = self._ensure_png(mask) if mask else None

        with Image.open(BytesIO(png_image)) as img_obj:
            orig_w, orig_h = img_obj.size
            supported_sizes = (256, 512, 1024)
            target_size = 1024
            for s in supported_sizes:
                if max(orig_w, orig_h) <= s:
                    target_size = s
                    break
            if orig_w != target_size or orig_h != target_size:
                img_obj = img_obj.resize(
                    (target_size, target_size), Image.Resampling.LANCZOS
                )
                buf = BytesIO()
                img_obj.save(buf, format="PNG", optimize=True)
                png_image = buf.getvalue()
                logger.info(
                    "Image resized from %sx%s to %sx%s",
                    orig_w,
                    orig_h,
                    target_size,
                    target_size,
                )
            width = height = target_size

        if png_mask:
            with Image.open(BytesIO(png_mask)) as m_obj:
                mask_w, mask_h = m_obj.size
                if mask_w != target_size or mask_h != target_size:
                    m_obj = m_obj.resize(
                        (target_size, target_size), Image.Resampling.LANCZOS
                    )
                    mbuf = BytesIO()
                    m_obj.save(mbuf, format="PNG", optimize=True)
                    png_mask = mbuf.getvalue()
                    logger.info(
                        "Mask resized from %sx%s to %sx%s",
                        mask_w,
                        mask_h,
                        target_size,
                        target_size,
                    )
        return png_image, png_mask, width, height

    def _ensure_png(self, data: bytes | None) -> bytes:
        if data is None:
            return b""
        if Image is None:
            return data
        img = Image.open(BytesIO(data))
        buf = BytesIO()
        img.save(buf, format="PNG", optimize=True)
        return buf.getvalue()

    async def process_image_async(
        self, image: bytes, mask: bytes | None
    ) -> Tuple[bytes, bytes | None, int, int]:
        """Process image and optional mask asynchronously."""
        loop = asyncio.get_event_loop()
        start = asyncio.get_event_loop().time()
        result = await loop.run_in_executor(self._executor, self._process, image, mask)
        duration = asyncio.get_event_loop().time() - start
        logger.info("Image processing completed in %.3f seconds", duration)
        return result
