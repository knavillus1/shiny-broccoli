from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import get_settings
from .api.v1.endpoints.health import router as health_router

settings = get_settings()

app = FastAPI(title="Shiny Broccoli API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.allow_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api/v1")


@app.get("/")
def read_root():
    return {"message": "Welcome"}
