"""Backend entry point — mounts all service routers."""
from __future__ import annotations

from fastapi import FastAPI

from backend.app.services.recommendation.router import router as recommendation_router

app = FastAPI(title='SIH 2026 — Career Path & Skill Development Platform')
app.include_router(recommendation_router)
