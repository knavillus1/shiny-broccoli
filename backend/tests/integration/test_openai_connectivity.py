import os
import pytest

from backend.services.openai_service import OpenAIService

@pytest.mark.asyncio
async def test_openai_connectivity_integration():
    """
    Integration test for basic OpenAI API connectivity using models.list.
    Skips if OPENAI_API_KEY is not set in the environment.
    """
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        pytest.skip("OPENAI_API_KEY not set in environment")

    service = OpenAIService(api_key=api_key)
    response = await service.verify_connection()

    # Basic response structure verification
    assert isinstance(response, dict)
    assert "data" in response
    assert isinstance(response["data"], list)
    # At least one model should be present
    assert len(response["data"]) > 0
