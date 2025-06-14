"""Application logging configuration utilities."""

from __future__ import annotations

import logging
import os


def setup_logging() -> None:
    """Configure root logger using LOG_LEVEL env var."""
    level_name = os.getenv("LOG_LEVEL", "INFO").upper()
    level = getattr(logging, level_name, logging.INFO)
    if not logging.getLogger().handlers:
        logging.basicConfig(
            level=level,
            format="[%(asctime)s] %(levelname)s %(name)s: %(message)s",
        )
    else:
        logging.getLogger().setLevel(level)
