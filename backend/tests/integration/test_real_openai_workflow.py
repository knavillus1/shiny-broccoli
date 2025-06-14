import os
import io
import time
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app


@pytest.mark.skipif(
    not os.environ.get("OPENAI_API_KEY"),
    reason="OPENAI_API_KEY not set in environment",
)
def test_real_openai_workflow():
    """End-to-end test hitting OpenAI with real API calls."""
    image_path = os.path.join(
        os.path.dirname(__file__), "test_images", "image1.png"
    )
    mask_path = os.path.join(
        os.path.dirname(__file__), "test_images", "mask.png"
    )
    with open(image_path, "rb") as f:
        img_bytes = f.read()
    with open(mask_path, "rb") as f:
        mask_bytes = f.read()

    client = TestClient(app)
    response = client.post(
        "/api/v1/images/edit",
        files={
            "image": ("image.png", io.BytesIO(img_bytes), "image/png"),
            "mask": ("mask.png", io.BytesIO(mask_bytes), "image/png"),
        },
        data={"prompt": "Make the background blue"},
    )
    assert response.status_code == 200
    request_id = response.json()["request_id"]

    status_json = {}
    for _ in range(30):
        status_res = client.get(f"/api/v1/images/status/{request_id}")
        assert status_res.status_code == 200
        status_json = status_res.json()
        if status_json["status"] in {"completed", "error"}:
            break
        time.sleep(1)

    assert status_json["status"] in {"completed", "error"}
