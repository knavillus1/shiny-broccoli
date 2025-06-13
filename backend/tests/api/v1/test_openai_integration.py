import io
from backend.app.api.v1.endpoints import openai_integration


class DummyService:
    async def verify_connection(self):
        return {"object": "list"}


def patch_service(monkeypatch):
    monkeypatch.setattr(openai_integration, "OpenAIService", lambda: DummyService())


def test_edit_image(client, monkeypatch):
    patch_service(monkeypatch)
    file_content = io.BytesIO(b"data")
    response = client.post(
        "/api/v1/images/edit",
        files={"image": ("test.png", file_content, "image/png")},
        data={"prompt": "edit"},
    )
    assert response.status_code == 200
    assert response.json() == {"detail": "editing not implemented"}


def test_get_status(client):
    response = client.get("/api/v1/images/status/abc123")
    assert response.status_code == 200
    assert response.json() == {"request_id": "abc123", "status": "pending"}
