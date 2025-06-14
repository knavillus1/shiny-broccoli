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
    assert body["title"] == "Unprocessable Entity"
    assert body["status"] == 422
