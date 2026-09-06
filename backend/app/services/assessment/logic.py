"""Assessment Engine — logic layer.

Workflow:
1. ``generate_quiz`` extracts PDF text and calls Gemini via Instructor to produce
   a structured ``AssessmentOutput`` Pydantic model.
2. ``run_assessment`` (the public entry point called by the router) wraps
   ``generate_quiz`` and persists the result into the ``assessments`` SQLite table
   so grading (System 6) can retrieve it later.
"""

from __future__ import annotations

import io
import json
import os
import uuid

import instructor
from dotenv import load_dotenv
from google import genai
from pydantic import BaseModel
from pypdf import PdfReader
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, Session, mapped_column

from backend.app.shared.db import Base, get_engine
from backend.app.shared.schemas import AssessmentOutput, QuizQuestion

load_dotenv()

_NAMESPACE = uuid.UUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')  # URL namespace
_GEMINI_MODEL = 'gemini-1.5-flash'


# ---------------------------------------------------------------------------
# ORM model
# ---------------------------------------------------------------------------


class AssessmentORM(Base):
    """Stores a generated quiz so grading (System 6) can look it up by ``quiz_id``."""

    __tablename__ = 'assessments'

    quiz_id: Mapped[str] = mapped_column(String, primary_key=True)
    source_filename: Mapped[str] = mapped_column(String, nullable=False)
    questions_json: Mapped[str] = mapped_column(Text, nullable=False)  # JSON array of QuizQuestion


def _ensure_table(engine) -> None:  # type: ignore[type-arg]
    """Create the ``assessments`` table if it does not already exist."""
    Base.metadata.create_all(engine, tables=[AssessmentORM.__table__], checkfirst=True)


# ---------------------------------------------------------------------------
# PDF helpers
# ---------------------------------------------------------------------------


def _extract_text(pdf_bytes: bytes) -> str:
    """Extract all text from a PDF given its raw bytes."""
    reader = PdfReader(io.BytesIO(pdf_bytes))
    parts: list[str] = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            parts.append(text)
    return '\n'.join(parts)


# ---------------------------------------------------------------------------
# Quiz generation (pure — no DB side-effects, easy to mock in tests)
# ---------------------------------------------------------------------------


def generate_quiz(pdf_bytes: bytes, filename: str) -> AssessmentOutput:
    """Extract text from PDF and generate a quiz via Gemini through Instructor."""
    text = _extract_text(pdf_bytes)
    if not text.strip():
        raise ValueError('No extractable text found in the PDF.')

    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise RuntimeError('GEMINI_API_KEY environment variable not set.')

    raw_client = genai.Client(api_key=api_key)
    client = instructor.from_genai(client=raw_client)

    prompt = (
        'You are a quiz generator for government training. '
        'Read the text below and generate exactly 5 multiple-choice questions. '
        'Each question must have exactly 4 answer options. '
        'Identify the correct answer index (0-3) and write a clear explanation.\n\n'
        f'TEXT:\n{text[:6000]}'  # cap at 6000 chars to stay within context limits
    )

    # Instructor forces the response into AssessmentOutput Pydantic shape — no raw JSON parsing
    class _QuizPayload(BaseModel):
        questions: list[QuizQuestion]

    result = client.chat.completions.create(
        model=_GEMINI_MODEL,
        messages=[{'role': 'user', 'content': prompt}],
        response_model=_QuizPayload,
    )

    import hashlib
    content_hash = hashlib.md5(text[:1000].encode('utf-8', errors='ignore')).hexdigest()
    return AssessmentOutput(
        quiz_id=str(uuid.uuid5(_NAMESPACE, f"{filename}_{content_hash}")),
        source_filename=filename,
        questions=result.questions,
    )


# ---------------------------------------------------------------------------
# Public entry point — generates quiz AND persists to SQLite
# ---------------------------------------------------------------------------


def run_assessment(
    pdf_bytes: bytes,
    filename: str,
    db_path: str | None = None,
) -> AssessmentOutput:
    """Generate a quiz from *pdf_bytes* and persist it to the ``assessments`` table.

    Args:
        pdf_bytes: Raw bytes of the uploaded PDF.
        filename:  Original filename (used for deterministic quiz_id generation).
        db_path:   Override the SQLite path (for tests that inject an in-memory DB).

    Returns:
        The freshly generated ``AssessmentOutput``.

    Raises:
        ValueError: if the PDF contains no extractable text.
        RuntimeError: if ``GEMINI_API_KEY`` is not set.
    """
    quiz: AssessmentOutput = generate_quiz(pdf_bytes, filename)

    engine = get_engine(db_path)
    _ensure_table(engine)

    questions_json = json.dumps([q.model_dump() for q in quiz.questions])

    with Session(engine) as session:
        # Use merge so re-uploading the same PDF is idempotent.
        record = AssessmentORM(
            quiz_id=quiz.quiz_id,
            source_filename=quiz.source_filename,
            questions_json=questions_json,
        )
        session.merge(record)
        session.commit()

    return quiz

def get_quiz(quiz_id: str, db_path: str | None = None) -> AssessmentOutput | None:
    """Retrieve a generated quiz from the database."""
    engine = get_engine(db_path)
    _ensure_table(engine)
    with Session(engine) as session:
        record = session.get(AssessmentORM, quiz_id)
        if not record:
            return None
        return AssessmentOutput(
            quiz_id=record.quiz_id,
            source_filename=record.source_filename,
            questions=json.loads(record.questions_json)
        )
