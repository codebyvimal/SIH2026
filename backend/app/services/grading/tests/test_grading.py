"""Grading tests — uses an in-memory SQLite DB seeded via seed_quiz_to_db."""

from __future__ import annotations

from unittest.mock import patch

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.app.services.grading.logic import seed_quiz_to_db
from backend.app.services.grading.router import router
from backend.app.shared.schemas import AssessmentOutput, QuizQuestion

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

FIXTURE_QUIZ = AssessmentOutput(
    quiz_id='quiz-stats-01',
    source_filename='sample_stats.pdf',
    questions=[
        QuizQuestion(
            q='What is a p-value?',
            options=[
                'Probability of null given data',
                'Probability of data given null',
                'A test statistic',
                'Power of the test',
            ],
            correct=1,
            explanation='A p-value is the probability of observing data as extreme as yours, assuming the null hypothesis is true.',
        )
    ],
)

_IN_MEMORY_DB = 'sqlite:///:memory:'


@pytest.fixture()
def client(tmp_path):
    """FastAPI test client backed by a seeded in-memory (tmp) SQLite DB."""
    db_file = str(tmp_path / 'test.db')
    seed_quiz_to_db(FIXTURE_QUIZ, db_path=db_file)

    app = FastAPI()
    app.include_router(router)

    # Patch grade_quiz so it uses the temp DB, not the shared app.db.
    with patch('backend.app.services.grading.router.grade_quiz') as mock_grade:
        from backend.app.services.grading.logic import grade_quiz as _real_grade

        mock_grade.side_effect = lambda inp: _real_grade(inp, db_path=db_file)
        yield TestClient(app)


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


def test_grade_quiz_all_correct(client):
    response = client.post('/grading', json={'quiz_id': 'quiz-stats-01', 'answers': {'0': 1}})
    assert response.status_code == 200
    data = response.json()
    assert data['quiz_id'] == 'quiz-stats-01'
    assert data['score'] == 100.0
    assert len(data['feedback']) == 1
    feedback = data['feedback'][0]
    assert feedback['is_correct'] is True
    assert feedback['your_answer'] == 1
    assert feedback['correct'] == 1
    assert 'p-value' in feedback['q']


def test_grade_quiz_wrong_answer(client):
    response = client.post('/grading', json={'quiz_id': 'quiz-stats-01', 'answers': {'0': 0}})
    assert response.status_code == 200
    data = response.json()
    assert data['score'] == 0.0
    assert data['feedback'][0]['is_correct'] is False
    assert data['feedback'][0]['your_answer'] == 0
    assert data['feedback'][0]['correct'] == 1


def test_grade_quiz_not_found(client):
    response = client.post('/grading', json={'quiz_id': 'unknown-quiz', 'answers': {'0': 0}})
    assert response.status_code == 404


def test_grade_quiz_invalid_question_index(client):
    response = client.post('/grading', json={'quiz_id': 'quiz-stats-01', 'answers': {'99': 0}})
    assert response.status_code == 400
