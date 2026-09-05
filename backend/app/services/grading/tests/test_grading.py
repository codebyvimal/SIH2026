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
    """Out-of-range index is rejected before any feedback is computed.

    Submitting index 99 (quiz has only 1 question) must:
    - return HTTP 400
    - not include any partial feedback in the response body
    """
    response = client.post('/grading', json={'quiz_id': 'quiz-stats-01', 'answers': {'99': 0}})
    assert response.status_code == 400
    # No partial feedback should be present — validation fires before the loop.
    body = response.json()
    assert 'feedback' not in body or body.get('feedback') in (None, [])


# ---------------------------------------------------------------------------
# Tests for grading persistence and get_latest_grading_for_official
# ---------------------------------------------------------------------------


def test_grade_quiz_persists_result_when_official_id_provided(tmp_path):
    """Submitting with official_id saves a row that can be retrieved later."""
    from backend.app.services.grading.logic import (
        get_latest_grading_for_official,
        grade_quiz,
        seed_quiz_to_db,
    )
    from backend.app.shared.schemas import GradingInput

    db_file = str(tmp_path / 'test_persist.db')
    seed_quiz_to_db(FIXTURE_QUIZ, db_path=db_file)

    grade_quiz(
        GradingInput(quiz_id='quiz-stats-01', answers={0: 1}, official_id='official-001'),
        db_path=db_file,
    )

    result = get_latest_grading_for_official('official-001', db_path=db_file)
    assert result is not None
    assert result.quiz_id == 'quiz-stats-01'
    assert result.score == 100.0
    assert len(result.feedback) == 1
    assert result.feedback[0].is_correct is True


def test_get_latest_grading_returns_none_for_unknown_official(tmp_path):
    """When an official has no grading history, the function returns None."""
    from backend.app.services.grading.logic import get_latest_grading_for_official

    db_file = str(tmp_path / 'test_empty.db')
    result = get_latest_grading_for_official('no-such-official', db_path=db_file)
    assert result is None


def test_grade_quiz_without_official_id_does_not_persist(tmp_path):
    """Omitting official_id does not write to grading_results."""
    from backend.app.services.grading.logic import (
        get_latest_grading_for_official,
        grade_quiz,
        seed_quiz_to_db,
    )
    from backend.app.shared.schemas import GradingInput

    db_file = str(tmp_path / 'test_no_persist.db')
    seed_quiz_to_db(FIXTURE_QUIZ, db_path=db_file)

    grade_quiz(
        GradingInput(quiz_id='quiz-stats-01', answers={0: 1}),  # no official_id
        db_path=db_file,
    )

    # Nothing should have been written.
    result = get_latest_grading_for_official('any-official', db_path=db_file)
    assert result is None

