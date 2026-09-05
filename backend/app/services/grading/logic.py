"""Grading / Feedback — logic layer.

Quiz lookup is performed via SQLAlchemy ORM against the ``assessments`` table
written by System 5 (Assessment Engine).  ``quizzes.json`` is no longer read
at runtime; the table is seeded in tests via ``seed_quiz_to_db``.

Grading results are persisted to the ``grading_results`` table (one row per
submission) when ``official_id`` is included in the request.  The dashboard
endpoint uses ``get_latest_grading_for_official`` to retrieve the most recent
result without any hardcoded fallback data.
"""

from __future__ import annotations

import datetime
import json
from typing import ClassVar

from fastapi import HTTPException
from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, Session, mapped_column

from backend.app.shared.db import Base, get_engine
from backend.app.shared.schemas import (
    AssessmentOutput,
    GradingInput,
    GradingOutput,
    QuestionFeedback,
    QuizQuestion,
)

# ---------------------------------------------------------------------------
# ORM model — mirrors AssessmentORM from the assessment service (read-side view)
# ---------------------------------------------------------------------------


class AssessmentRecordORM(Base):
    """Read-side ORM view of the ``assessments`` table written by System 5."""

    __tablename__ = 'assessments'
    __table_args__: ClassVar[dict] = {'extend_existing': True}

    quiz_id: Mapped[str] = mapped_column(String, primary_key=True)
    source_filename: Mapped[str] = mapped_column(String, nullable=False)
    questions_json: Mapped[str] = mapped_column(Text, nullable=False)


# ---------------------------------------------------------------------------
# ORM model — persists grading results per official (System 6 write side)
# ---------------------------------------------------------------------------


class GradingResultORM(Base):
    """Persisted grading result row written after each quiz submission."""

    __tablename__ = 'grading_results'
    __table_args__: ClassVar[dict] = {'extend_existing': True}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    official_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    quiz_id: Mapped[str] = mapped_column(String, nullable=False)
    score: Mapped[float] = mapped_column(nullable=False)
    feedback_json: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.utcnow, nullable=False
    )


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _ensure_tables(engine) -> None:  # type: ignore[type-arg]
    """Create all grading-owned tables if they do not yet exist."""
    Base.metadata.create_all(
        engine,
        tables=[AssessmentRecordORM.__table__, GradingResultORM.__table__],
        checkfirst=True,
    )


def _load_quiz_from_db(quiz_id: str, engine) -> AssessmentOutput:  # type: ignore[type-arg]
    """Fetch an ``AssessmentOutput`` from the ``assessments`` table.

    Raises:
        HTTPException 404: if the quiz_id is not in the database.
    """
    _ensure_tables(engine)

    with Session(engine) as session:
        record: AssessmentRecordORM | None = session.get(AssessmentRecordORM, quiz_id)

    if record is None:
        raise HTTPException(status_code=404, detail=f'Quiz not found: {quiz_id}')

    questions = [QuizQuestion(**q) for q in json.loads(record.questions_json)]
    return AssessmentOutput(
        quiz_id=record.quiz_id,
        source_filename=record.source_filename,
        questions=questions,
    )


# ---------------------------------------------------------------------------
# Test helper — seed a quiz row without going through System 5
# ---------------------------------------------------------------------------


def seed_quiz_to_db(quiz: AssessmentOutput, db_path: str | None = None) -> None:
    """Insert (or replace) an ``AssessmentOutput`` directly into the assessments table.

    Used exclusively by grading tests to bootstrap fixture data without calling
    the full assessment pipeline.
    """
    engine = get_engine(db_path)
    _ensure_tables(engine)
    questions_json = json.dumps([q.model_dump() for q in quiz.questions])
    with Session(engine) as session:
        record = AssessmentRecordORM(
            quiz_id=quiz.quiz_id,
            source_filename=quiz.source_filename,
            questions_json=questions_json,
        )
        session.merge(record)
        session.commit()


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def grade_quiz(input_data: GradingInput, db_path: str | None = None) -> GradingOutput:
    """Grade submitted answers against the stored quiz schema.

    Args:
        input_data: Validated ``GradingInput`` with ``quiz_id`` and ``answers``.
                    If ``official_id`` is provided the result is persisted to
                    the ``grading_results`` table for later dashboard retrieval.
        db_path:    Override the SQLite path (for tests using an in-memory DB).

    Returns:
        ``GradingOutput`` with score and per-question feedback.

    Raises:
        HTTPException 404: if the quiz_id is not found.
        KeyError: if any answer index is out of range.
    """
    engine = get_engine(db_path)
    quiz = _load_quiz_from_db(input_data.quiz_id, engine)

    feedback_list: list[QuestionFeedback] = []
    correct_count = 0
    total_questions = len(quiz.questions)

    if total_questions == 0:
        return GradingOutput(quiz_id=input_data.quiz_id, score=0.0, feedback=[])

    # Validate that all submitted indices are in range before computing any feedback.
    for q_idx in input_data.answers:
        if q_idx < 0 or q_idx >= total_questions:
            raise KeyError(f'Invalid question index: {q_idx}')

    for i, question in enumerate(quiz.questions):
        user_answer = input_data.answers.get(i)

        is_correct = False
        if user_answer is not None and user_answer == question.correct:
            is_correct = True
            correct_count += 1

        feedback_list.append(
            QuestionFeedback(
                q=question.q,
                your_answer=user_answer if user_answer is not None else -1,
                correct=question.correct,
                is_correct=is_correct,
                explanation=question.explanation,
            )
        )

    score = (correct_count / total_questions) * 100.0
    result = GradingOutput(quiz_id=input_data.quiz_id, score=score, feedback=feedback_list)

    # Persist the result if an official_id was supplied.
    if input_data.official_id:
        feedback_json = json.dumps([fb.model_dump() for fb in feedback_list])
        with Session(engine) as session:
            session.add(
                GradingResultORM(
                    official_id=input_data.official_id,
                    quiz_id=result.quiz_id,
                    score=result.score,
                    feedback_json=feedback_json,
                )
            )
            session.commit()

    return result


def get_latest_grading_for_official(
    official_id: str, db_path: str | None = None
) -> GradingOutput | None:
    """Return the most recent grading result for *official_id*, or ``None``.

    Queries the ``grading_results`` table ordered by ``created_at`` descending
    and returns the top row as a ``GradingOutput``.  Returns ``None`` when no
    record exists for that official.

    Args:
        official_id: The official whose latest grading result is requested.
        db_path:     Override the SQLite path (for tests).
    """
    engine = get_engine(db_path)
    _ensure_tables(engine)

    with Session(engine) as session:
        row: GradingResultORM | None = (
            session.query(GradingResultORM)
            .filter(GradingResultORM.official_id == official_id)
            .order_by(GradingResultORM.created_at.desc())
            .first()
        )

    if row is None:
        return None

    feedback = [QuestionFeedback(**fb) for fb in json.loads(row.feedback_json)]
    return GradingOutput(quiz_id=row.quiz_id, score=row.score, feedback=feedback)
