from fastapi import APIRouter, HTTPException

from backend.app.shared.schemas import GradingInput, GradingOutput

from .logic import grade_quiz, get_grading_by_quiz_and_official

router = APIRouter()


@router.post('/grading', response_model=GradingOutput)
def submit_grading(input_data: GradingInput) -> GradingOutput:
    try:
        return grade_quiz(input_data)
    except HTTPException:
        raise
    except KeyError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.get('/grading/{quiz_id}/{official_id}', response_model=GradingOutput)
def get_grading(quiz_id: str, official_id: str) -> GradingOutput:
    result = get_grading_by_quiz_and_official(quiz_id, official_id)
    if result is None:
        raise HTTPException(status_code=404, detail='Grading result not found for given quiz_id and official_id')
    return result
