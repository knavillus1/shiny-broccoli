from __future__ import annotations

import logging
import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp


class TimingMiddleware(BaseHTTPMiddleware):
    """Middleware that logs request processing time."""

    def __init__(self, app: ASGIApp, logger: logging.Logger | None = None) -> None:
        super().__init__(app)
        self.logger = logger or logging.getLogger("timing")

    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        duration = (time.perf_counter() - start) * 1000
        response.headers["X-Process-Time"] = f"{duration:.2f}"
        self.logger.info(
            "%s %s %.2fms", request.method, request.url.path, duration
        )
        return response
