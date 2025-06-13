"""In-memory chat transcript storage utilities."""

from __future__ import annotations

from typing import List

_messages: List[str] = []


def add_message(message: str) -> None:
    """Append a message to the transcript storage."""

    _messages.append(message)


def get_messages() -> List[str]:
    """Return the stored chat messages."""

    return list(_messages)
