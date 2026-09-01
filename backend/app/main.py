"""Backend entry point — mounts all integrated service routers."""

from __future__ import annotations

from fastapi import FastAPI

from backend.app.services.gap_analysis.router import router as gap_analysis_router
from backend.app.services.profile.router import router as profile_router
from backend.app.services.recommendation.router import router as recommendation_router

app = FastAPI(title='SIH 2026 — Career Path & Skill Development Platform')
app.include_router(profile_router)
app.include_router(gap_analysis_router, prefix='/api')
app.include_router(recommendation_router)
