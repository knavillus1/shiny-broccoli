from __future__ import annotations

import logging
import time

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import structlog


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log request and response information using structlog."""

    def __init__(self, app: ASGIApp, level: str = "INFO") -> None:
        super().__init__(app)
        self.logger = structlog.get_logger("request")
        self.level = getattr(logging, level.upper(), logging.INFO)

    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        duration = (time.perf_counter() - start) * 1000
        self.logger.log(
            self.level,
            "request completed",
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            duration_ms=round(duration, 2),
        )
        return response
