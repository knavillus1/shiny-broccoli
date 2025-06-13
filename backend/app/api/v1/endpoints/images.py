import logging
import time
from fastapi import APIRouter, UploadFile, File, HTTPException, status

from backend.services.image_processor import process_image

logger = logging.getLogger(__name__)

ALLOWED_TYPES = {
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
}

router = APIRouter()


def _validate_file(file: UploadFile) -> None:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type",
        )


@router.post("/images/upload")
async def upload_image(file: UploadFile = File(...)):
    start = time.time()
    logger.info("/images/upload called")
    _validate_file(file)
    # Stubbed processing: just acknowledge receipt
    result = {"filename": file.filename}
    logger.info("/images/upload completed in %.3f", time.time() - start)
    return result


@router.post("/images/process")
async def process_endpoint(
    file: UploadFile = File(...), mask: UploadFile | None = File(None)
):
    start = time.time()
    logger.info("/images/process called")
    _validate_file(file)
    result = await process_image(file, mask)
    logger.info("/images/process completed in %.3f", time.time() - start)
    return result
