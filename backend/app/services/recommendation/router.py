"""FastAPI router for System 3 — Recommendation Engine."""
from __future__ import annotations

from fastapi import APIRouter

from backend.app.shared.schemas import RecommendationInput, RecommendationOutput
from backend.app.services.recommendation.logic import recommend

router = APIRouter(prefix='/recommend', tags=['recommendation'])


@router.post('', response_model=RecommendationOutput)
def recommend_endpoint(req: RecommendationInput) -> RecommendationOutput:
    return recommend(req)
