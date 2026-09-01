from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.app.services.grading.router import router

app = FastAPI()
app.include_router(router)
client = TestClient(app)


def test_grade_quiz_all_correct():
    response = client.post(
        "/grading", json={"quiz_id": "quiz-stats-01", "answers": {"0": 1}}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["quiz_id"] == "quiz-stats-01"
    assert data["score"] == 100.0
    assert len(data["feedback"]) == 1
    feedback = data["feedback"][0]
    assert feedback["is_correct"] is True
    assert feedback["your_answer"] == 1
    assert feedback["correct"] == 1
    assert "p-value" in feedback["q"]


def test_grade_quiz_wrong_answer():
    response = client.post(
        "/grading", json={"quiz_id": "quiz-stats-01", "answers": {"0": 0}}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["score"] == 0.0
    assert data["feedback"][0]["is_correct"] is False
    assert data["feedback"][0]["your_answer"] == 0
    assert data["feedback"][0]["correct"] == 1


def test_grade_quiz_not_found():
    response = client.post(
        "/grading", json={"quiz_id": "unknown-quiz", "answers": {"0": 0}}
    )
    assert response.status_code == 404


def test_grade_quiz_invalid_question_index():
    response = client.post(
        "/grading", json={"quiz_id": "quiz-stats-01", "answers": {"99": 0}}
    )
    assert response.status_code == 400
