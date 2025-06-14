import io
import os
import pytest
import httpx

from backend.app.api.v1.endpoints import openai_integration
from backend.app.main import app
from fastapi.testclient import TestClient
import openai


class DummyService:
    async def edit_image(self, image: bytes, mask: bytes | None, prompt: str):
        return {"detail": "ok"}


class FailingService:
    def __init__(self, exc: Exception) -> None:
        self._exc = exc

    async def edit_image(self, image: bytes, mask: bytes | None, prompt: str):
        raise self._exc


@pytest.fixture()
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def sample_image_bytes():
    path = os.path.join(os.path.dirname(__file__), "test_images", "image1.png")
    with open(path, "rb") as f:
        return f.read()


def test_full_workflow_success(client, monkeypatch, sample_image_bytes):
    monkeypatch.setattr(
        openai_integration,
        "OpenAIService",
        lambda: DummyService(),
    )
    data = client.get("/")
    assert data.status_code == 200
    result = client.post(
        "/api/v1/images/edit",
        files={"image": ("test.png", io.BytesIO(sample_image_bytes), "image/png")},
        data={"prompt": "edit"},
    )
    assert result.status_code == 200
    request_id = result.json()["request_id"]
    status = client.get(f"/api/v1/images/status/{request_id}").json()
    assert status["status"] in {"completed", "pending"}


def test_full_workflow_api_error(client, monkeypatch, sample_image_bytes):
    exc = openai.BadRequestError(
        "boom",
        response=httpx.Response(400, request=httpx.Request("POST", "http://")),
        body=None,
    )
    monkeypatch.setattr(
        openai_integration,
        "OpenAIService",
        lambda: FailingService(exc),
    )
    result = client.post(
        "/api/v1/images/edit",
        files={"image": ("test.png", io.BytesIO(sample_image_bytes), "image/png")},
        data={"prompt": "edit"},
    )
    assert result.status_code == 200
    request_id = result.json()["request_id"]
    status = client.get(f"/api/v1/images/status/{request_id}").json()
    assert status["status"] == "error"


def test_full_workflow_connection_error(client, monkeypatch, sample_image_bytes):
    exc = openai.APIConnectionError(
        message="boom", request=httpx.Request("POST", "http://")
    )
    monkeypatch.setattr(
        openai_integration,
        "OpenAIService",
        lambda: FailingService(exc),
    )
    result = client.post(
        "/api/v1/images/edit",
        files={"image": ("test.png", io.BytesIO(sample_image_bytes), "image/png")},
        data={"prompt": "edit"},
    )
    assert result.status_code == 200
    request_id = result.json()["request_id"]
    status = client.get(f"/api/v1/images/status/{request_id}").json()
    assert status["status"] == "error"
