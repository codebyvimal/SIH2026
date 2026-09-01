"""iGOT Integration Layer — System 4 (permanent mock, never calls real iGOT API)."""

from __future__ import annotations

import json
import uuid
from pathlib import Path

from backend.app.shared.schemas import (
    CompletionStatus,
    EnrollRequest,
    EnrollResponse,
    IgotCourse,
)

_COURSES_FILE = Path('data/dummy/courses.json')

# In-memory enrollment store (reset on restart — demo only)
_enrollments: dict[str, dict] = {}


def get_courses() -> list[IgotCourse]:
    """Return the full mock course catalogue."""
    with _COURSES_FILE.open() as f:
        raw = json.load(f)
    return [IgotCourse(**item) for item in raw]


def enroll(request: EnrollRequest) -> EnrollResponse:
    """Record an enrollment and return a canned confirmation."""
    enrollment_id = f'enroll-{uuid.uuid4().hex[:8]}'
    _enrollments[enrollment_id] = {
        'official_id': request.official_id,
        'course_id': request.course_id,
        'completed': False,
        'completed_at': None,
    }
    return EnrollResponse(enrollment_id=enrollment_id, status='enrolled')


def get_completion(enrollment_id: str) -> CompletionStatus:
    """Return canned completion status; always incomplete in demo."""
    if enrollment_id not in _enrollments:
        raise KeyError(f"enrollment_id '{enrollment_id}' not found")
    entry = _enrollments[enrollment_id]
    return CompletionStatus(
        enrollment_id=enrollment_id,
        completed=entry['completed'],
        completed_at=entry['completed_at'],
    )
