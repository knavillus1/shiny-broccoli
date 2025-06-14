import importlib
import sys
import types
import pytest
import base64
from io import BytesIO
from PIL import Image


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
    module = importlib.import_module("backend.services.infrastructure.openai_service")
    return importlib.reload(module)


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
async def test_edit_image(monkeypatch):
    # Minimal valid 1x1 PNG image (transparent)
    png_base64 = (
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+"
        "X2ZkAAAAASUVORK5CYII="
    )
    png_bytes = base64.b64decode(png_base64)

    def factory(api_key=None, **_):
        return DummyClient(api_key)

    service_module = load_service(monkeypatch, factory)
    service = service_module.OpenAIService(api_key="test-key")
    result = await service.edit_image(png_bytes, None, "prompt")
    assert isinstance(result, dict)


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "img_size,expected",
    [
        (100, 256),
        (400, 512),
        (800, 1024),
    ],
)
async def test_edit_image_resizes_image(monkeypatch, img_size, expected):
    buf = BytesIO()
    Image.new("RGBA", (img_size, img_size)).save(buf, format="PNG")
    img_bytes = buf.getvalue()

    captured = {}

    class TrackImages:
        async def edit(self, **kwargs):
            captured["size"] = kwargs["size"]
            captured["img"] = Image.open(kwargs["image"]).size
            return {"ok": True}

    class TrackClient(DummyClient):
        def __init__(self, key: str | None) -> None:
            super().__init__(key)
            self.images = TrackImages()

    def factory(api_key=None, **_):
        return TrackClient(api_key)

    service_module = load_service(monkeypatch, factory)
    service = service_module.OpenAIService(api_key="key")
    result = await service.edit_image(img_bytes, None, "prompt")
    assert result == {"ok": True}
    assert captured["size"] == f"{expected}x{expected}"
    assert captured["img"] == (expected, expected)


@pytest.mark.asyncio
async def test_edit_image_resizes_mask(monkeypatch):
    img_buf = BytesIO()
    Image.new("RGBA", (300, 300)).save(img_buf, format="PNG")
    img_bytes = img_buf.getvalue()

    mask_buf = BytesIO()
    Image.new("L", (100, 100), color=255).save(mask_buf, format="PNG")
    mask_bytes = mask_buf.getvalue()

    captured = {}

    class TrackImages:
        async def edit(self, **kwargs):
            captured["size"] = kwargs["size"]
            captured["img"] = Image.open(kwargs["image"]).size
            captured["mask"] = Image.open(kwargs["mask"]).size
            return {"ok": True}

    class TrackClient(DummyClient):
        def __init__(self, key: str | None) -> None:
            super().__init__(key)
            self.images = TrackImages()

    def factory(api_key=None, **_):
        return TrackClient(api_key)

    service_module = load_service(monkeypatch, factory)
    service = service_module.OpenAIService(api_key="key")
    result = await service.edit_image(img_bytes, mask_bytes, "prompt")
    assert result == {"ok": True}
    assert captured["size"] == "512x512"
    assert captured["img"] == (512, 512)
    assert captured["mask"] == (512, 512)
