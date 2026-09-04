"""Gap Analysis tests — seeds the officials table in a tmp SQLite DB."""

from __future__ import annotations

import json
from unittest.mock import patch

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from backend.app.services.gap_analysis.logic import OfficialORM
from backend.app.services.gap_analysis.router import router
from backend.app.shared.db import Base, get_engine

# ---------------------------------------------------------------------------
# Fixture helpers
# ---------------------------------------------------------------------------

_OFFICIAL_ID = '123e4567-e89b-12d3-a456-426614174000'


def _seed_official(db_path: str) -> None:
    """Insert a single official row matching the existing test assertions.

    Fixture design:
    - experience_years=1 → base level = BASIC (1)
    - education "M.Sc. Statistics" → 'statistic' keyword bumps statistical_methods to WORKING (2)
    - training "Leadership Workshop" → no keyword match → digital_tools stays at BASIC (1)

    Resulting computed levels: digital_tools=1, statistical_methods=2.
    Required for role "Analyst": digital_tools=3, statistical_methods=2.
    Expected gaps: digital=2, statistical=0.  ← matches test assertions below.
    """
    engine = get_engine(db_path)
    Base.metadata.create_all(engine, tables=[OfficialORM.__table__], checkfirst=True)

    past_trainings = json.dumps([{'course_name': 'Leadership Workshop', 'completed_at': None}])
    from sqlalchemy.orm import Session

    with Session(engine) as session:
        session.merge(
            OfficialORM(
                official_id=_OFFICIAL_ID,
                role='Analyst',
                dept='Statistics',
                education='M.Sc. Statistics',
                experience_years=1,
                past_trainings=past_trainings,
            )
        )
        session.commit()


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_gap_analysis_calculates_correctly(tmp_path) -> None:
    db_file = str(tmp_path / 'test.db')
    _seed_official(db_file)

    payload = {'official_id': _OFFICIAL_ID, 'role': 'Analyst'}

    app = FastAPI()
    app.include_router(router)

    # Patch the router's call-through so calculate_gaps uses our tmp DB.
    with patch('backend.app.services.gap_analysis.router.calculate_gaps') as mock_calc:
        from backend.app.services.gap_analysis.logic import calculate_gaps as _real_calc

        mock_calc.side_effect = lambda inp: _real_calc(inp, db_path=db_file)

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url='http://test') as client:
            response = await client.post('/gap-analysis', json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data['official_id'] == _OFFICIAL_ID

    gaps = data['gaps']
    assert len(gaps) == 2

    digital_gap = next((g for g in gaps if g['domain'] == 'digital_tools'), None)
    assert digital_gap['gap'] == 2

    stat_gap = next((g for g in gaps if g['domain'] == 'statistical_methods'), None)
    assert stat_gap['gap'] == 0


@pytest.mark.asyncio
async def test_gap_analysis_404_for_unknown_official(tmp_path) -> None:
    db_file = str(tmp_path / 'test.db')
    # Do NOT seed — table is empty.

    app = FastAPI()
    app.include_router(router)

    with patch('backend.app.services.gap_analysis.router.calculate_gaps') as mock_calc:
        from backend.app.services.gap_analysis.logic import calculate_gaps as _real_calc

        mock_calc.side_effect = lambda inp: _real_calc(inp, db_path=db_file)

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url='http://test') as client:
            response = await client.post(
                '/gap-analysis', json={'official_id': 'does-not-exist', 'role': 'Analyst'}
            )

    assert response.status_code == 404
