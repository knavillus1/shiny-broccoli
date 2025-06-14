from io import BytesIO

import pytest
from PIL import Image

from backend.services.domain.async_image_processor import AsyncImageProcessor


@pytest.mark.asyncio
async def test_process_image_resizes_image():
    proc = AsyncImageProcessor(max_workers=1)
    buf = BytesIO()
    Image.new("RGBA", (300, 300)).save(buf, format="PNG")
    img_bytes = buf.getvalue()

    png_image, png_mask, width, height = await proc.process_image_async(img_bytes, None)
    assert png_mask is None
    assert (width, height) == (512, 512)
    assert png_image.startswith(b"\x89PNG")


@pytest.mark.asyncio
async def test_process_image_resizes_mask():
    proc = AsyncImageProcessor(max_workers=1)
    img_buf = BytesIO()
    Image.new("RGBA", (200, 200)).save(img_buf, format="PNG")
    img_bytes = img_buf.getvalue()

    mask_buf = BytesIO()
    Image.new("L", (100, 100), color=255).save(mask_buf, format="PNG")
    mask_bytes = mask_buf.getvalue()

    png_image, png_mask, width, height = await proc.process_image_async(
        img_bytes, mask_bytes
    )
    assert (width, height) == (256, 256)
    assert png_mask is not None
    with Image.open(BytesIO(png_mask)) as m:
        assert m.size == (256, 256)
