"""SIH 2026 — Career Path & Skill Development Platform API entry point.

This is the single integration point that mounts all service routers.
Each service is self-contained under backend/app/services/<name>/.
"""

from __future__ import annotations

from fastapi import FastAPI

from backend.app.services.assessment.router import router as assessment_router
from backend.app.services.grading.router import router as grading_router

app = FastAPI(
    title="SIH 2026 — Career Path & Skill Development Platform",
    version="0.1.0",
)

# ------------------------------------------------------------------
# Mount service routers (add new ones here as systems are built)
# ------------------------------------------------------------------
app.include_router(assessment_router, prefix="/api")
app.include_router(grading_router, prefix="/api")
