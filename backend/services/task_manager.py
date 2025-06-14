"""Simple in-memory tracker for async request progress."""

from __future__ import annotations

from dataclasses import dataclass, field
import time
from typing import Any, Dict


@dataclass
class TaskRecord:
    """Record describing the status of an async request."""

    status: str = "pending"
    result: dict[str, Any] | None = None
    error: str | None = None
    start_time: float = field(default_factory=time.time)
    eta_seconds: int = 30


_tasks: Dict[str, TaskRecord] = {}


def create_task(task_id: str, eta_seconds: int = 30) -> None:
    """Create a new task entry with optional ETA."""
    _tasks[task_id] = TaskRecord(eta_seconds=eta_seconds)


def set_result(task_id: str, result: dict[str, Any]) -> None:
    rec = _tasks.get(task_id)
    if rec:
        rec.status = "completed"
        rec.result = result


def set_error(task_id: str, error: str) -> None:
    rec = _tasks.get(task_id)
    if rec:
        rec.status = "error"
        rec.error = error


def get_task(task_id: str) -> TaskRecord | None:
    return _tasks.get(task_id)
