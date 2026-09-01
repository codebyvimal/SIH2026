from fastapi import APIRouter, HTTPException

from backend.app.services.profile.logic import build_profile, get_profile, list_profiles
from backend.app.shared.schemas import ProfileInput, ProfileOutput

router = APIRouter(prefix='/profile', tags=['profile'])


@router.post('', response_model=ProfileOutput)
async def create_profile(profile_in: ProfileInput) -> ProfileOutput:
    return build_profile(profile_in)


@router.get('/{official_id}', response_model=ProfileOutput)
async def read_profile(official_id: str) -> ProfileOutput:
    profile = get_profile(official_id)
    if not profile:
        raise HTTPException(status_code=404, detail='Profile not found')
    return profile


@router.get('', response_model=list[dict])
async def read_profiles() -> list[dict]:
    return list_profiles()
