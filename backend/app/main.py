"""SIH 2026 — Career Path & Skill Development Platform API entry point.

This is the single integration point that mounts all service routers.
Each service is self-contained under backend/app/services/<name>/.
"""

from __future__ import annotations

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()  # loads .env at startup so GEMINI_API_KEY is available everywhere

from backend.app.services.assessment.router import router as assessment_router
from backend.app.services.gap_analysis.router import router as gap_analysis_router
from backend.app.services.grading.router import router as grading_router
from backend.app.services.igot_mock.router import router as igot_router
from backend.app.services.profile.router import router as profile_router
from backend.app.services.recommendation.router import router as recommendation_router

app = FastAPI(
    title='SIH 2026 — Career Path & Skill Development Platform',
    version='0.1.0',
    description='Hackathon demo — 8 integrated systems for government official skill development.',
)

# Allow the Next.js dev server (port 3000) to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000', 'http://127.0.0.1:3000'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# ------------------------------------------------------------------
# Mount service routers (add new ones here as systems are built)
# ------------------------------------------------------------------
app.include_router(profile_router)
app.include_router(gap_analysis_router, prefix='/api')
app.include_router(recommendation_router)
app.include_router(assessment_router, prefix='/api')
app.include_router(grading_router, prefix='/api')
app.include_router(igot_router)
