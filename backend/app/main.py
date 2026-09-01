from __future__ import annotations

from fastapi import FastAPI

from backend.app.services.profile.router import router as profile_router

app = FastAPI(
    title='SIH2026 WAP API',
    description='Backend API for Career Path & Skill Development Platform',
    version='1.0.0',
)

# Mount System 1 Profile Builder router
app.include_router(profile_router)
