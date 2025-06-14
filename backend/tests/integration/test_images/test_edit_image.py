import os
import pytest
from backend.services.infrastructure.openai_service import OpenAIService


@pytest.mark.asyncio
async def test_edit_image_integration():
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        pytest.skip("OPENAI_API_KEY not set in environment")

    service = OpenAIService(api_key=api_key)
    image_path = os.path.join(os.path.dirname(__file__), "image1.png")
    mask_path = os.path.join(os.path.dirname(__file__), "mask.png")
    with open(image_path, "rb") as f:
        image_bytes = f.read()
    with open(mask_path, "rb") as f:
        mask_bytes = f.read()
    prompt = "Make the image background blue."
    result = await service.edit_image(image_bytes, mask_bytes, prompt)
    assert isinstance(result, dict)
    # The OpenAI response should contain at least one of these expected keys
    # or be a simple success response like {'ok': True}
    assert (
        "status" in result
        or "data" in result
        or "id" in result
        or "result" in result
        or "ok" in result
        or "url" in result
        or "revised_prompt" in result
    )
