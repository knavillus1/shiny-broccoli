"""Image upload and processing API endpoints using dependency injection."""

from __future__ import annotations

import time
import structlog
from typing import Awaitable, Callable

from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends

from backend.app.core.dependencies import get_process_image

logger = structlog.get_logger(__name__)

ALLOWED_TYPES = {
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
}

router = APIRouter()


def _validate_file(file: UploadFile) -> None:
    """Validate uploaded file content type."""
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type",
        )


@router.post("/images/upload")
async def upload_image(file: UploadFile = File(...)):
    """Upload an image and return a confirmation response."""
    start = time.time()
    logger.info("/images/upload called")
    _validate_file(file)
    result = {"filename": file.filename}
    logger.info("/images/upload completed in %.3f", time.time() - start)
    return result


@router.post("/images/process")
async def process_endpoint(
    file: UploadFile = File(...),
    mask: UploadFile | None = File(None),
    process_image: Callable[..., Awaitable[dict]] = Depends(get_process_image),
):
    """Process an image with an optional mask."""
    start = time.time()
    logger.info("/images/process called")
    _validate_file(file)
    result = await process_image(file, mask)
    logger.info("/images/process completed in %.3f", time.time() - start)
    return result
