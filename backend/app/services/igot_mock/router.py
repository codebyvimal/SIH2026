"""iGOT Integration Layer — System 4 router."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from backend.app.shared.schemas import (
    CompletionStatus,
    EnrollRequest,
    EnrollResponse,
    IgotCourse,
)

from .logic import enroll, get_completion, get_courses

router = APIRouter(prefix='/igot', tags=['iGOT'])


@router.get('/courses', response_model=list[IgotCourse])
def list_courses() -> list[IgotCourse]:
    """GET /igot/courses — returns mock iGOT + NSSTA course catalogue."""
    return get_courses()


@router.post('/enroll', response_model=EnrollResponse)
def enroll_course(request: EnrollRequest) -> EnrollResponse:
    """POST /igot/enroll — record a mock enrollment."""
    return enroll(request)


@router.get('/completion/{enrollment_id}', response_model=CompletionStatus)
def course_completion(enrollment_id: str) -> CompletionStatus:
    """GET /igot/completion/{enrollment_id} — returns canned completion status."""
    try:
        return get_completion(enrollment_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
