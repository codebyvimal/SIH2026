import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from backend.app.services.gap_analysis.router import router

app = FastAPI()
app.include_router(router)


@pytest.mark.asyncio
async def test_gap_analysis_calculates_correctly() -> None:
    payload = {'official_id': '123e4567-e89b-12d3-a456-426614174000', 'role': 'Analyst'}
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as client:
        response = await client.post('/gap-analysis', json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data['official_id'] == '123e4567-e89b-12d3-a456-426614174000'

    gaps = data['gaps']
    assert len(gaps) == 2

    digital_gap = next((g for g in gaps if g['domain'] == 'digital_tools'), None)
    assert digital_gap['gap'] == 2

    stat_gap = next((g for g in gaps if g['domain'] == 'statistical_methods'), None)
    assert stat_gap['gap'] == 0
