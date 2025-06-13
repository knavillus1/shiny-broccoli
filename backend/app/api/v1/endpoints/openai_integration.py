"""OpenAI image editing API endpoints."""

from __future__ import annotations

import logging
import time

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
import openai

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
        img_bytes = await image.read()
        mask_bytes = await mask.read() if mask else None
        result = await service.edit_image(img_bytes, mask_bytes, prompt)
    except openai.BadRequestError as exc:  # pragma: no cover - network
        logger.warning("OpenAI bad request: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )
    except (
        openai.AuthenticationError,
        openai.PermissionDeniedError,
    ) as exc:  # pragma: no cover - network
        logger.warning("OpenAI auth error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        )
    except openai.RateLimitError as exc:  # pragma: no cover - network
        logger.warning("OpenAI rate limit: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=str(exc),
        )
    except openai.APIConnectionError as exc:  # pragma: no cover - network
        logger.warning("OpenAI connection error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        )
    except openai.APITimeoutError as exc:  # pragma: no cover - network
        logger.warning("OpenAI timeout: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=str(exc),
        )
    except openai.APIError as exc:  # pragma: no cover - network
        logger.warning("OpenAI API error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        )
    except Exception as exc:  # pragma: no cover - should not occur in tests
        logger.exception("OpenAI edit failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        )
    logger.info("/images/edit completed in %.3f", time.time() - start)
    return result


@router.get("/images/status/{request_id}")
async def get_status(request_id: str) -> dict[str, str]:
    """Return the processing status for an image edit request."""
    logger.info("/images/status called for %s", request_id)
    # Placeholder implementation until async processing is added
    return {"request_id": request_id, "status": "pending"}
