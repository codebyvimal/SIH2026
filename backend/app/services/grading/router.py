from fastapi import APIRouter, HTTPException

from backend.app.shared.schemas import GradingInput, GradingOutput

from .logic import grade_quiz

router = APIRouter()


@router.post("/grading", response_model=GradingOutput)
def submit_grading(input_data: GradingInput) -> GradingOutput:
    try:
        return grade_quiz(input_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except KeyError as e:
        raise HTTPException(status_code=400, detail=str(e))
