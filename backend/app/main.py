from fastapi import FastAPI
from backend.app.services.gap_analysis.router import router as gap_analysis_router

app = FastAPI(title="SIH 2026 - Main API")

app.include_router(gap_analysis_router, prefix="/api")
