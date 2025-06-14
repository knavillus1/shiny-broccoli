from __future__ import annotations

import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
from fastapi import Request
from structlog import contextvars
import structlog


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """Attach a correlation ID to each request and response."""

    def __init__(self, app: ASGIApp, header_name: str = "X-Request-ID") -> None:
        super().__init__(app)
        self.header_name = header_name
        self.logger = structlog.get_logger("correlation")

    async def dispatch(self, request: Request, call_next):
        corr_id = request.headers.get(self.header_name, str(uuid.uuid4()))
        request.state.correlation_id = corr_id
        token = contextvars.bind_contextvars(correlation_id=corr_id)
        try:
            response = await call_next(request)
        finally:
            contextvars.reset_contextvars(**token)
        response.headers[self.header_name] = corr_id
        return response
