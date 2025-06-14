import io
from backend.app.api.v1.routers import tasks
import httpx
import openai
import pytest


class DummyService:
    async def edit_image(self, image: bytes, mask: bytes | None, prompt: str):
        assert image == b"data"
        assert mask is None
        assert prompt == "edit"
        return {"detail": "ok"}


def make_error(error_cls, status_code=400):
    request = httpx.Request("POST", "https://example.com")
    if issubclass(error_cls, openai.APIConnectionError):
        return error_cls(message="boom", request=request)
    response = httpx.Response(status_code, request=request)
    return error_cls("boom", response=response, body=None)


def test_edit_image(client, monkeypatch):

    async def immediate(request_id, image, mask, prompt, service, processor):
        tasks.task_manager.set_result(request_id, {"detail": "ok"})

    monkeypatch.setattr(tasks, "_process_request", immediate)
    file_content = io.BytesIO(b"data")
    response = client.post(
        "/api/v1/images/edit",
        files={"image": ("test.png", file_content, "image/png")},
        data={"prompt": "edit"},
    )
    assert response.status_code == 200
    data = response.json()
    request_id = data["request_id"]
    assert data["eta_seconds"] == 30
    status_resp = client.get(f"/api/v1/images/status/{request_id}")
    assert status_resp.status_code == 200
    assert status_resp.json() == {
        "request_id": request_id,
        "status": "completed",
        "result": {"detail": "ok"},
        "eta_seconds": 0,
    }


def test_edit_image_invalid_type(client, monkeypatch):
    file_content = io.BytesIO(b"data")
    response = client.post(
        "/api/v1/images/edit",
        files={"image": ("test.txt", file_content, "text/plain")},
        data={"prompt": "edit"},
    )
    assert response.status_code == 400


def test_edit_image_missing_prompt(client, monkeypatch):
    file_content = io.BytesIO(b"data")
    response = client.post(
        "/api/v1/images/edit",
        files={"image": ("test.png", file_content, "image/png")},
        data={"prompt": ""},
    )
    assert response.status_code == 400


def test_edit_image_invalid_mask(client, monkeypatch):
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
    task_id = "abc123"
    tasks.task_manager.create_task(task_id)
    tasks.task_manager.set_result(task_id, {"ok": True})
    response = client.get(f"/api/v1/images/status/{task_id}")
    assert response.status_code == 200
    assert response.json() == {
        "request_id": task_id,
        "status": "completed",
        "result": {"ok": True},
        "eta_seconds": 0,
    }


@pytest.mark.parametrize(
    "error_cls",
    [
        openai.BadRequestError,
        openai.RateLimitError,
        openai.APIConnectionError,
    ],
)
def test_openai_error_mapping(client, monkeypatch, error_cls):
    async def fail_task(request_id, image, mask, prompt, service, processor):
        tasks.task_manager.set_error(request_id, "boom")

    monkeypatch.setattr(tasks, "_process_request", fail_task)
    file_content = io.BytesIO(b"data")
    response = client.post(
        "/api/v1/images/edit",
        files={"image": ("test.png", file_content, "image/png")},
        data={"prompt": "edit"},
    )
    assert response.status_code == 200
    request_id = response.json()["request_id"]
    status_resp = client.get(f"/api/v1/images/status/{request_id}")
    data = status_resp.json()
    assert data["status"] == "error"
    assert data["eta_seconds"] == 0


@pytest.mark.asyncio
async def test_process_request_sanitizes_error():
    class FailService:
        async def edit_image(self, image, mask, prompt, processor=None):
            import httpx
            raise openai.RateLimitError(
                "boom",
                response=httpx.Response(429, request=httpx.Request("POST", "http://")),
                body=None,
            )

    processor = tasks.AsyncImageProcessor()
    request_id = "test1"
    tasks.task_manager.create_task(request_id)
    await tasks._process_request(
        request_id,
        b"i",
        None,
        "prompt",
        FailService(),
        processor,
    )
    record = tasks.task_manager.get_task(request_id)
    assert record.status == "error"
    assert record.error == "OpenAI rate limit exceeded"
