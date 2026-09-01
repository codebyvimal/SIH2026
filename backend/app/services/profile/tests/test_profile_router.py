from datetime import UTC, datetime

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from backend.app.services.profile.router import router
from backend.app.shared.schemas import Domain, ProfileOutput, SkillLevel

app = FastAPI()
app.include_router(router)


@pytest.mark.asyncio
async def test_post_profile_endpoint(tmp_path, monkeypatch):
    test_db = str(tmp_path / 'test.db')
    test_graph = str(tmp_path / 'test_graph.gpickle')

    from backend.app.services.profile import logic

    monkeypatch.setattr(logic, 'DEFAULT_DB_PATH', test_db)
    monkeypatch.setattr(logic, 'DEFAULT_GRAPH_PATH', test_graph)

    payload = {
        'role': 'Analyst',
        'dept': 'Statistics',
        'education': 'M.Sc. Statistics',
        'experience_years': 3,
        'past_trainings': [
            {'course_name': 'Basic Python', 'completed_at': datetime.now(UTC).isoformat()}
        ],
    }

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as ac:
        response = await ac.post('/profile', json=payload)

    assert response.status_code == 200
    data = response.json()

    # Assert exact ProfileOutput contract
    profile_out = ProfileOutput.model_validate(data)
    assert isinstance(profile_out.official_id, str) and len(profile_out.official_id) > 0
    assert profile_out.profile_stored is True
    assert profile_out.graph_node_added is True
    assert set(profile_out.initial_levels.keys()) == set(Domain)
    assert profile_out.initial_levels[Domain.STATISTICAL_METHODS] == SkillLevel.PROFICIENT
    assert profile_out.initial_levels[Domain.DIGITAL_TOOLS] == SkillLevel.PROFICIENT
    assert profile_out.initial_levels[Domain.DATA_MANAGEMENT] == SkillLevel.WORKING
    assert profile_out.initial_levels[Domain.DOMAIN_KNOWLEDGE] == SkillLevel.WORKING


@pytest.mark.asyncio
async def test_get_profile_endpoints(tmp_path, monkeypatch):
    test_db = str(tmp_path / 'test.db')
    test_graph = str(tmp_path / 'test_graph.gpickle')

    from backend.app.services.profile import logic

    monkeypatch.setattr(logic, 'DEFAULT_DB_PATH', test_db)
    monkeypatch.setattr(logic, 'DEFAULT_GRAPH_PATH', test_graph)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as ac:
        # Create a profile
        payload = {
            'role': 'Director',
            'dept': 'Planning',
            'education': 'Ph.D. Economics',
            'experience_years': 8,
            'past_trainings': [],
        }
        res_post = await ac.post('/profile', json=payload)
        assert res_post.status_code == 200
        official_id = res_post.json()['official_id']

        # Fetch profile
        res_get = await ac.get(f'/profile/{official_id}')
        assert res_get.status_code == 200
        data_get = res_get.json()
        assert data_get['official_id'] == official_id
        assert data_get['profile_stored'] is True
        assert data_get['graph_node_added'] is True

        # Fetch non-existent profile
        res_404 = await ac.get('/profile/non-existent-official-999')
        assert res_404.status_code == 404

        # List profiles
        res_list = await ac.get('/profile')
        assert res_list.status_code == 200
        profiles_list = res_list.json()
        assert len(profiles_list) >= 1
        assert any(p['official_id'] == official_id for p in profiles_list)
