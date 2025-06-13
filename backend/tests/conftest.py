import pytest
from fastapi.testclient import TestClient
from typing import Generator

from backend.app.main import app

# Configure pytest-asyncio
pytest_plugins = ("pytest_asyncio",)


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    with TestClient(app) as c:
        yield c
