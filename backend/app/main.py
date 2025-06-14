"""FastAPI application setup and router configuration."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .middleware import TimingMiddleware

from .logging import setup_logging

from .core.config import get_settings
from .api.v1.routers.health import router as health_router
from .api.v1.endpoints.images import router as images_router
from .api.v1.endpoints.openai_integration import router as openai_router

settings = get_settings()
setup_logging()

app = FastAPI(title="Shiny Broccoli API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.allow_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(TimingMiddleware)

app.include_router(health_router, prefix="/api/v1")
app.include_router(images_router, prefix="/api/v1")
app.include_router(openai_router, prefix="/api/v1")


@app.get("/")
def read_root():
    """Simple index route used for smoke tests."""

    return {"message": "Welcome"}
