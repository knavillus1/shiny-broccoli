import io


def test_upload_image(client):
    file_content = io.BytesIO(b"data")
    response = client.post(
        "/api/v1/images/upload",
        files={"file": ("test.png", file_content, "image/png")},
    )
    assert response.status_code == 200
    assert response.json() == {"filename": "test.png"}


def test_upload_invalid_type(client):
    file_content = io.BytesIO(b"data")
    response = client.post(
        "/api/v1/images/upload",
        files={"file": ("test.txt", file_content, "text/plain")},
    )
    assert response.status_code == 400


def test_process_image(client):
    file_content = io.BytesIO(b"data")
    response = client.post(
        "/api/v1/images/process",
        files={"file": ("test.png", file_content, "image/png")},
    )
    assert response.status_code == 200
    assert response.json() == {"detail": "processing not implemented"}
