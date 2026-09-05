import pytest
from httpx import ASGITransport, AsyncClient

from backend.app.main import app


@pytest.mark.asyncio
async def test_main_mounts_profile_and_gap_analysis_routes() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as client:
        assert (await client.get('/api/v1/profile')).status_code == 200
        response = await client.post(
            '/api/v1/gap-analysis',
            json={
                'official_id': '123e4567-e89b-12d3-a456-426614174000',
                'role': 'Analyst',
            },
        )
        assert response.status_code == 200
        igot_res = await client.get('/api/v1/igot/courses')
        assert igot_res.status_code == 200

        admin_res = await client.get('/api/v1/admin/dashboard')
        assert admin_res.status_code == 200
        admin_data = admin_res.json()
        assert 'total_officials' in admin_data
        assert 'domain_aggregates' in admin_data

        emp_res = await client.get('/api/v1/dashboard/employee')
        assert emp_res.status_code == 200
        emp_data = emp_res.json()
        assert 'official_id' in emp_data
        assert 'gaps' in emp_data
        assert 'recommended' in emp_data
