from fastapi import APIRouter

from backend.app.shared.schemas import GapAnalysisInput, GapAnalysisOutput

from .logic import calculate_gaps

router = APIRouter()


@router.post('/gap-analysis', response_model=GapAnalysisOutput)
async def perform_gap_analysis(input_data: GapAnalysisInput) -> GapAnalysisOutput:
    return calculate_gaps(input_data)
