"""OpenAI image editing API endpoints."""

from __future__ import annotations

import asyncio
import logging
import time

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    HTTPException,
    status,
    BackgroundTasks,
)
import openai
from uuid import uuid4

from backend.services.openai_service import OpenAIService
from backend.services import task_manager

logger = logging.getLogger(__name__)

router = APIRouter()


async def _process_request(
    request_id: str, image: bytes, mask: bytes | None, prompt: str
) -> None:
    """Background task to send edit request to OpenAI."""
    service = OpenAIService()
    try:
        logger.info(f"Starting OpenAI edit for request {request_id}")
        result = await service.edit_image(image, mask, prompt)
        logger.info(f"OpenAI edit completed for request {request_id}")
        logger.info(f"OpenAI result structure: {result}")
        task_manager.set_result(request_id, result)
        logger.info(f"Result stored for request {request_id}")
    except Exception as exc:  # pragma: no cover - network errors handled in tests
        logger.exception(f"OpenAI edit failed for request {request_id}: {exc}")
        task_manager.set_error(request_id, str(exc))


@router.post("/images/edit")
async def edit_image(
    background_tasks: BackgroundTasks,
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
    try:
        img_bytes = await image.read()
        mask_bytes = await mask.read() if mask else None
        request_id = uuid4().hex
        eta_seconds = 30
        task_manager.create_task(request_id, eta_seconds)
        background_tasks.add_task(
            _process_request, request_id, img_bytes, mask_bytes, prompt
        )
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
    logger.info("/images/edit queued in %.3f", time.time() - start)
    return {"request_id": request_id, "eta_seconds": eta_seconds}


@router.get("/images/status/{request_id}")
async def get_status(request_id: str) -> dict[str, object]:
    """Return the processing status for an image edit request."""
    logger.info("/images/status called for %s", request_id)
    record = task_manager.get_task(request_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Request not found")
    response: dict[str, object] = {
        "request_id": request_id,
        "status": record.status,
    }
    if record.status in {"completed", "error"}:
        eta = 0
    else:
        eta = max(int(record.start_time + record.eta_seconds - time.time()), 0)
    response["eta_seconds"] = eta
    if record.result is not None:
        response["result"] = record.result
        logger.info(f"Returning result for {request_id}: {record.result}")
    if record.error is not None:
        response["error"] = record.error
    logger.info(f"Status response for {request_id}: {response}")
    return response
