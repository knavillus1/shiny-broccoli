import pytest
from fastapi.testclient import TestClient
from typing import Generator

from backend.app.main import app
from backend.app.core.dependencies import get_openai_service, get_image_processor
from backend.services.domain.async_image_processor import AsyncImageProcessor

# Configure pytest-asyncio
pytest_plugins = ("pytest_asyncio",)


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    with TestClient(app) as c:
        yield c


@pytest.fixture(autouse=True)
def clear_overrides() -> Generator[None, None, None]:
    """Ensure dependency overrides are cleared between tests."""
    app.dependency_overrides.clear()
    yield
    app.dependency_overrides.clear()


@pytest.fixture(autouse=True)
def override_openai_service(monkeypatch) -> Generator[None, None, None]:
    class DummyService:
        async def edit_image(self, image: bytes, mask: bytes | None, prompt: str):
            return {"detail": "ok"}

    app.dependency_overrides[get_openai_service] = lambda: DummyService()
    yield
    app.dependency_overrides.clear()


@pytest.fixture(autouse=True)
def override_image_processor() -> Generator[None, None, None]:
    processor = AsyncImageProcessor(max_workers=1)
    app.dependency_overrides[get_image_processor] = lambda: processor
    yield
    app.dependency_overrides.clear()
