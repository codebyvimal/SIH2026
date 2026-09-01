from unittest.mock import patch

from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.app.services.recommendation.router import router
from backend.app.shared.schemas import RecommendationOutput, RecommendedCourse

app = FastAPI()
app.include_router(router)
client = TestClient(app)

_MOCK_OUTPUT = RecommendationOutput(
    recommended=[
        RecommendedCourse(
            course='Python for Data Analysis',
            course_id='course-igot-101',
            relevance=0.91,
            why='Directly addresses the python skill gap.',
        )
    ]
)


def test_post_recommend_returns_200():
    with patch('backend.app.services.recommendation.router.recommend', return_value=_MOCK_OUTPUT):
        resp = client.post('/recommend', json={'gap_skill': 'python programming', 'gap_size': 2})
    assert resp.status_code == 200


def test_post_recommend_response_matches_schema():
    with patch('backend.app.services.recommendation.router.recommend', return_value=_MOCK_OUTPUT):
        resp = client.post('/recommend', json={'gap_skill': 'python programming', 'gap_size': 2})
    body = resp.json()
    assert 'recommended' in body
    rec = body['recommended'][0]
    assert {'course', 'course_id', 'relevance', 'why'} <= rec.keys()
    assert 0.0 <= rec['relevance'] <= 1.0


def test_post_recommend_invalid_body_returns_422():
    resp = client.post('/recommend', json={'gap_skill': 'python', 'gap_size': -1})
    assert resp.status_code == 422  # pydantic ge=0 fails
