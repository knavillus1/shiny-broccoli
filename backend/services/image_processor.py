"""Image processing service stubs."""

from fastapi import UploadFile


async def process_image(file: UploadFile, mask: UploadFile | None) -> dict:
    """Stub image processing function."""
    # Real implementation would process the image and mask.
    return {"detail": "processing not implemented"}
