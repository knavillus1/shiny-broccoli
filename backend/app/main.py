"""FastAPI application setup and router configuration."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError

from .middleware import TimingMiddleware, RequestLoggingMiddleware
from .middleware.correlation import CorrelationIdMiddleware

from .core.logging import setup_logging

from .core.config import get_settings
from .api.v1.routers.health import router as health_router
from .api.v1.routers.images import router as images_router
from .api.v1.routers.tasks import router as openai_router
from .core.errors import from_http_exception, from_validation_error
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse

settings = get_settings()
setup_logging()

app = FastAPI(title="Shiny Broccoli API")


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Convert HTTPException to RFC 7807 Problem Details response."""
    problem = from_http_exception(exc)
    return JSONResponse(status_code=exc.status_code, content=problem.model_dump())

app.add_exception_handler(HTTPException, http_exception_handler)


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Convert validation errors to RFC 7807 Problem Details."""
    problem = from_validation_error(exc)
    return JSONResponse(status_code=422, content=problem.model_dump())

app.add_exception_handler(RequestValidationError, validation_exception_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.allow_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(CorrelationIdMiddleware)

app.add_middleware(
    RequestLoggingMiddleware, level=settings.request_log_level
)

app.add_middleware(TimingMiddleware)

app.include_router(health_router, prefix="/api/v1")
app.include_router(images_router, prefix="/api/v1")
app.include_router(openai_router, prefix="/api/v1")


@app.get("/")
def read_root():
    """Simple index route used for smoke tests."""

    return {"message": "Welcome"}
