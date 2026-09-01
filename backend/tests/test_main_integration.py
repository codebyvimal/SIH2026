from fastapi.testclient import TestClient

from backend.app.main import app


def test_main_mounts_profile_and_gap_analysis_routes() -> None:
    client = TestClient(app)

    assert client.get('/profile').status_code == 200
    response = client.post(
        '/api/gap-analysis',
        json={
            'official_id': '123e4567-e89b-12d3-a456-426614174000',
            'role': 'Analyst',
        },
    )

    assert response.status_code == 200
