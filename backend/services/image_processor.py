"""Image processing service stubs."""

from __future__ import annotations

from fastapi import UploadFile


async def process_image(file: UploadFile, mask: UploadFile | None) -> dict:
    """Process an image with an optional mask and return result stub."""
    # Real implementation would process the image and mask.
    return {"detail": "processing not implemented"}
