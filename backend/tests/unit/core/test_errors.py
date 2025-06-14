from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.testclient import TestClient

from backend.app.core.errors import from_http_exception
from backend.app.main import http_exception_handler, validation_exception_handler


def test_from_http_exception():
    exc = HTTPException(status_code=400, detail="bad")
    pd = from_http_exception(exc)
    assert pd.status == 400
    assert pd.detail == "bad"
    assert pd.title == "Bad Request"


def test_http_exception_handler():
    app = FastAPI()
    app.add_exception_handler(HTTPException, http_exception_handler)

    @app.get("/boom")
    async def boom():
        raise HTTPException(status_code=404, detail="missing")

    client = TestClient(app)
    response = client.get("/boom")
    assert response.status_code == 404
    assert response.json() == {
        "type": "about:blank",
        "title": "Not Found",
        "status": 404,
        "detail": "missing",
        "instance": None,
    }


def test_validation_exception_handler():
    app = FastAPI()
    app.add_exception_handler(RequestValidationError, validation_exception_handler)

    @app.post("/items")
    async def create_item(name: int):
        return {"name": name}

    client = TestClient(app)
    response = client.post("/items", json={"name": "abc"})
    assert response.status_code == 422
    body = response.json()
    assert body["title"] == "Unprocessable Content"
    assert body["status"] == 422


def test_from_openai_error_mapping():
    import openai
    from backend.app.core.errors import from_openai_error

    import httpx
    error = openai.RateLimitError(
        "boom",
        response=httpx.Response(429, request=httpx.Request("POST", "http://")),
        body=None,
    )
    http_exc = from_openai_error(error)
    assert http_exc.status_code == 429
    assert "rate limit" in http_exc.detail.lower()
