"""OpenAI image editing API endpoints."""

from __future__ import annotations

import logging
import time

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status

from backend.services.openai_service import OpenAIService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/images/edit")
async def edit_image(
    image: UploadFile = File(...),
    mask: UploadFile | None = File(None),
    prompt: str = Form(""),
):
    """Edit an image using OpenAI's API."""
    if image.content_type not in {"image/png", "image/jpeg", "image/jpg"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported image format",
        )
    if mask is not None and mask.content_type not in {"image/png"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mask must be PNG",
        )
    if not prompt.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prompt is required",
        )
    if len(prompt) > 1000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prompt too long",
        )
    start = time.time()
    logger.info("/images/edit called")
    service = OpenAIService()
    try:
        # Placeholder call until editing support is implemented
        await service.verify_connection()
    except Exception as exc:  # pragma: no cover - should not occur in tests
        logger.exception("OpenAI edit failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        )
    logger.info("/images/edit completed in %.3f", time.time() - start)
    return {"detail": "editing not implemented"}


@router.get("/images/status/{request_id}")
async def get_status(request_id: str) -> dict[str, str]:
    """Return the processing status for an image edit request."""
    logger.info("/images/status called for %s", request_id)
    # Placeholder implementation until async processing is added
    return {"request_id": request_id, "status": "pending"}
