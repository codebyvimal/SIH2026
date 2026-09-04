from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, UploadFile

from backend.app.shared.schemas import AssessmentOutput

from .logic import run_assessment

router = APIRouter()


from starlette.concurrency import run_in_threadpool


@router.post('/assessment', response_model=AssessmentOutput)
async def assessment_endpoint(file: UploadFile = File(...)) -> AssessmentOutput:  # noqa: B008
    if file.content_type != 'application/pdf':
        raise HTTPException(status_code=400, detail='Only PDF files are accepted.')
    pdf_bytes = await file.read()
    try:
        return await run_in_threadpool(run_assessment, pdf_bytes, file.filename or 'unknown.pdf')
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
