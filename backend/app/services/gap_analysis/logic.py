import json
from pathlib import Path

from fastapi import HTTPException

from backend.app.shared.schemas import GapAnalysisInput, GapAnalysisOutput, SkillGap, SkillLevel


def get_data_dir():
    return Path(__file__).parents[4] / 'data' / 'dummy'


def calculate_gaps(input_data: GapAnalysisInput) -> GapAnalysisOutput:
    profiles_path = get_data_dir() / 'profiles.json'
    framework_path = get_data_dir() / 'framework.json'

    with open(profiles_path) as f:
        profiles = json.load(f)

    with open(framework_path) as f:
        framework = json.load(f)

    profile = next((p for p in profiles if p['official_id'] == input_data.official_id), None)
    if not profile:
        raise HTTPException(status_code=404, detail='Profile not found')

    gaps = []
    initial_levels = profile.get('initial_levels', {})

    for skill_info in framework['skills']:
        domain = skill_info['domain']
        required_level_value = skill_info['required_by_role'].get(input_data.role, 0)
        required_level = SkillLevel(required_level_value)

        current_level_value = initial_levels.get(domain, 0)
        current_level = SkillLevel(current_level_value)

        gap = max(0, required_level_value - current_level_value)

        gaps.append(
            SkillGap(
                skill=skill_info['skill'],
                domain=domain,
                required=required_level,
                current=current_level,
                gap=gap,
            )
        )

    return GapAnalysisOutput(official_id=input_data.official_id, gaps=gaps)
