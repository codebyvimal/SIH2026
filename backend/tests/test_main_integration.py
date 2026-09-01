import pytest
from httpx import ASGITransport, AsyncClient

from backend.app.main import app


@pytest.mark.asyncio
async def test_main_mounts_profile_and_gap_analysis_routes() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as client:
        assert (await client.get('/profile')).status_code == 200
        response = await client.post(
            '/api/gap-analysis',
            json={
                'official_id': '123e4567-e89b-12d3-a456-426614174000',
                'role': 'Analyst',
            },
        )

    assert response.status_code == 200
