"""Structured logging configuration using structlog."""

from __future__ import annotations

import logging
import os
import sys
from typing import List
import structlog
from structlog import contextvars


def setup_logging() -> None:
    """Configure structlog and standard logging."""
    level_name = os.getenv("LOG_LEVEL", "INFO").upper()
    level = getattr(logging, level_name, logging.INFO)
    log_format = os.getenv("LOG_FORMAT", "console")

    logging.basicConfig(level=level, format="%(message)s", stream=sys.stdout)

    processors: List[structlog.types.Processor] = [
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.add_log_level,
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        contextvars.merge_contextvars,
    ]

    if log_format == "json":
        processors.append(structlog.processors.JSONRenderer())
    else:
        processors.append(structlog.dev.ConsoleRenderer())

    structlog.configure(
        wrapper_class=structlog.make_filtering_bound_logger(level),
        processors=processors,
    )
