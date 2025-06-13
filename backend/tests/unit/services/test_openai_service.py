import importlib
import sys
import types
import pytest
import base64


class DummyModels:
    async def list(self):
        return {"object": "list"}


class DummyImages:
    async def edit(self, **kwargs):
        return {"result": "success"}


class DummyClient:
    def __init__(self, api_key: str) -> None:
        self.api_key = api_key
        self.models = DummyModels()
        self.images = DummyImages()


def load_service(monkeypatch: pytest.MonkeyPatch, client_factory) -> types.ModuleType:
    """Reload openai_service with a patched openai module."""
    fake_openai = types.SimpleNamespace(AsyncOpenAI=client_factory)
    monkeypatch.setitem(sys.modules, "openai", fake_openai)
    module = importlib.import_module("backend.services.openai_service")
    return importlib.reload(module)


@pytest.mark.asyncio
async def test_verify_connection(monkeypatch):
    calls = {}

    def factory(api_key: str) -> DummyClient:
        calls["key"] = api_key
        return DummyClient(api_key)

    service_module = load_service(monkeypatch, factory)
    service = service_module.OpenAIService(api_key="test-key")
    result = await service.verify_connection()
    assert calls["key"] == "test-key"
    assert result == {"object": "list"}


def test_missing_key(monkeypatch):
    service_module = load_service(monkeypatch, lambda api_key: DummyClient(api_key))

    class DummySettings:
        openai_api_key = None

    monkeypatch.setattr(
        service_module, "get_settings", lambda: DummySettings()
    )

    with pytest.raises(ValueError):
        service_module.OpenAIService()


@pytest.mark.asyncio
def test_edit_image(monkeypatch):
    # Minimal valid 1x1 PNG image (transparent)
    png_base64 = (
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+"
        "X2ZkAAAAASUVORK5CYII="
    )
    png_bytes = base64.b64decode(png_base64)

    def factory(api_key: str) -> DummyClient:
        return DummyClient(api_key)

    service_module = load_service(monkeypatch, factory)
    service = service_module.OpenAIService(api_key="test-key")
    # Use valid PNG bytes
    result = service.edit_image(png_bytes, None, "prompt")
    # If edit_image is async, await it
    if hasattr(result, "__await__"):
        import asyncio
        result = asyncio.get_event_loop().run_until_complete(result)
    assert isinstance(result, dict)
