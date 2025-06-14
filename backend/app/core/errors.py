"""RFC 7807 Problem Details models and helpers."""

from __future__ import annotations

from http import HTTPStatus
from typing import Optional

from fastapi import HTTPException
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, Field


class ProblemDetail(BaseModel):
    """Problem Details response model."""

    type: str = Field(default="about:blank")
    title: str
    status: int
    detail: Optional[str] = None
    instance: Optional[str] = None


def from_http_exception(exc: HTTPException) -> ProblemDetail:
    """Create a :class:`ProblemDetail` from an HTTPException."""
    title = HTTPStatus(exc.status_code).phrase
    detail = exc.detail if isinstance(exc.detail, str) else None
    return ProblemDetail(title=title, detail=detail, status=exc.status_code)


def from_validation_error(exc: RequestValidationError) -> ProblemDetail:
    """Create a :class:`ProblemDetail` from a validation error."""
    title = HTTPStatus(422).phrase
    return ProblemDetail(title=title, detail=str(exc), status=422)


def from_openai_error(exc) -> HTTPException:
    """Map OpenAI errors to sanitized :class:`HTTPException` instances."""
    import openai  # Local import to avoid hard dependency when not needed

    if isinstance(exc, openai.BadRequestError):
        return HTTPException(400, "Invalid request to OpenAI")
    if isinstance(exc, (openai.AuthenticationError, openai.PermissionDeniedError)):
        return HTTPException(401, "OpenAI authentication failed")
    if isinstance(exc, openai.RateLimitError):
        return HTTPException(429, "OpenAI rate limit exceeded")
    if isinstance(exc, openai.APIConnectionError):
        return HTTPException(502, "Failed to connect to OpenAI")
    if isinstance(exc, openai.APITimeoutError):
        return HTTPException(504, "OpenAI request timed out")
    if isinstance(exc, openai.APIError):
        return HTTPException(503, "OpenAI service error")
    return HTTPException(500, "OpenAI error")
