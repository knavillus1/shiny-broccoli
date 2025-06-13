import io
from backend.app.api.v1.endpoints import openai_integration
import httpx
import openai
import pytest


class DummyService:
    async def edit_image(self, image: bytes, mask: bytes | None, prompt: str):
        assert image == b"data"
        assert mask is None
        assert prompt == "edit"
        return {"detail": "ok"}


def patch_service(monkeypatch):
    monkeypatch.setattr(openai_integration, "OpenAIService", lambda: DummyService())


def make_error(error_cls, status_code=400):
    request = httpx.Request("POST", "https://example.com")
    if issubclass(error_cls, openai.APIConnectionError):
        return error_cls(message="boom", request=request)
    response = httpx.Response(status_code, request=request)
    return error_cls("boom", response=response, body=None)


def test_edit_image(client, monkeypatch):
    patch_service(monkeypatch)
    file_content = io.BytesIO(b"data")
    response = client.post(
        "/api/v1/images/edit",
        files={"image": ("test.png", file_content, "image/png")},
        data={"prompt": "edit"},
    )
    assert response.status_code == 200
    assert response.json() == {"detail": "ok"}


def test_edit_image_invalid_type(client, monkeypatch):
    patch_service(monkeypatch)
    file_content = io.BytesIO(b"data")
    response = client.post(
        "/api/v1/images/edit",
        files={"image": ("test.txt", file_content, "text/plain")},
        data={"prompt": "edit"},
    )
    assert response.status_code == 400


def test_edit_image_missing_prompt(client, monkeypatch):
    patch_service(monkeypatch)
    file_content = io.BytesIO(b"data")
    response = client.post(
        "/api/v1/images/edit",
        files={"image": ("test.png", file_content, "image/png")},
        data={"prompt": ""},
    )
    assert response.status_code == 400


def test_edit_image_invalid_mask(client, monkeypatch):
    patch_service(monkeypatch)
    file_content = io.BytesIO(b"data")
    mask_content = io.BytesIO(b"data")
    response = client.post(
        "/api/v1/images/edit",
        files={
            "image": ("test.png", file_content, "image/png"),
            "mask": ("mask.jpg", mask_content, "image/jpeg"),
        },
        data={"prompt": "edit"},
    )
    assert response.status_code == 400


def test_get_status(client):
    response = client.get("/api/v1/images/status/abc123")
    assert response.status_code == 200
    assert response.json() == {"request_id": "abc123", "status": "pending"}


@pytest.mark.parametrize(
    "error_cls,status",
    [
        (openai.BadRequestError, 400),
        (openai.RateLimitError, 429),
        (openai.APIConnectionError, 502),
    ],
)
def test_openai_error_mapping(client, monkeypatch, error_cls, status):
    class FailService:
        async def edit_image(self, image: bytes, mask: bytes | None, prompt: str):
            raise make_error(error_cls)

    monkeypatch.setattr(openai_integration, "OpenAIService", lambda: FailService())
    file_content = io.BytesIO(b"data")
    response = client.post(
        "/api/v1/images/edit",
        files={"image": ("test.png", file_content, "image/png")},
        data={"prompt": "edit"},
    )
    assert response.status_code == status
