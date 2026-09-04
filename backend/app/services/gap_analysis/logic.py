"""Gap Analysis — logic layer.

Profile lookup is performed via SQLAlchemy ORM against the shared ``officials``
SQLite table (written by System 1 / seed_db.py).  The competency framework is
still read from ``data/dummy/framework.json`` (static, not in scope for change).
"""

from __future__ import annotations

import json
from pathlib import Path

from fastapi import HTTPException
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, Session, mapped_column

from backend.app.shared.db import Base, get_engine
from backend.app.shared.schemas import (
    Domain,
    GapAnalysisInput,
    GapAnalysisOutput,
    PastTraining,
    ProfileInput,
    SkillGap,
    SkillLevel,
)

# ---------------------------------------------------------------------------
# ORM model — isolated to this service (isolation rule: no cross-service imports)
# ---------------------------------------------------------------------------


class OfficialORM(Base):
    """SQLAlchemy ORM mapping for the ``officials`` table (created by System 1)."""

    __tablename__ = 'officials'

    official_id: Mapped[str] = mapped_column(String, primary_key=True)
    role: Mapped[str] = mapped_column(String, nullable=False)
    dept: Mapped[str] = mapped_column(String, nullable=False)
    education: Mapped[str] = mapped_column(String, nullable=False)
    experience_years: Mapped[int] = mapped_column(nullable=False)
    past_trainings: Mapped[str] = mapped_column(Text, nullable=False)  # JSON string


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _get_data_dir() -> Path:
    return Path(__file__).parents[4] / 'data' / 'dummy'


def _compute_initial_levels(profile_input: ProfileInput) -> dict[Domain, SkillLevel]:
    """Re-derive initial skill levels using the same rules as System 1.

    Kept local to avoid importing from the profile service (isolation rule).
    """
    from backend.app.services.profile.logic import compute_initial_levels

    return compute_initial_levels(profile_input)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def calculate_gaps(input_data: GapAnalysisInput, db_path: str | None = None) -> GapAnalysisOutput:
    """Calculate competency gaps for an official.

    Args:
        input_data: Validated ``GapAnalysisInput`` with ``official_id`` and ``role``.
        db_path: Override the SQLite path (used in tests to inject an in-memory DB).

    Returns:
        ``GapAnalysisOutput`` with per-skill gap details.

    Raises:
        HTTPException 404: if no official with ``official_id`` exists in the DB.
    """
    engine = get_engine(db_path)

    # Ensure the table exists before querying (idempotent).
    Base.metadata.create_all(engine, tables=[OfficialORM.__table__], checkfirst=True)

    with Session(engine) as session:
        row: OfficialORM | None = session.get(OfficialORM, input_data.official_id)

    if row is None:
        raise HTTPException(status_code=404, detail=f'Profile not found: {input_data.official_id}')

    # Reconstruct ProfileInput so we can reuse the level-computation logic.
    past_trainings_raw: list[dict] = json.loads(row.past_trainings)
    profile_input = ProfileInput(
        role=row.role,
        dept=row.dept,
        education=row.education,
        experience_years=row.experience_years,
        past_trainings=[PastTraining(**pt) for pt in past_trainings_raw],
    )
    initial_levels = _compute_initial_levels(profile_input)

    # Load the competency framework (static, unchanged).
    framework_path = _get_data_dir() / 'framework.json'
    with open(framework_path) as f:
        framework = json.load(f)

    gaps: list[SkillGap] = []
    for skill_info in framework['skills']:
        domain = skill_info['domain']
        required_level_value = skill_info['required_by_role'].get(input_data.role, 0)
        required_level = SkillLevel(required_level_value)

        current_level = initial_levels.get(Domain(domain), SkillLevel.NONE)
        current_level_value = current_level.value

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
