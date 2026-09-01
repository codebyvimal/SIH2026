from __future__ import annotations

import io
import os
import uuid

import google.generativeai as genai
import instructor
from dotenv import load_dotenv
from pydantic import BaseModel
from pypdf import PdfReader

from backend.app.shared.schemas import AssessmentOutput, QuizQuestion

load_dotenv()

_NAMESPACE = uuid.UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")  # URL namespace


def _extract_text(pdf_bytes: bytes) -> str:
    """Extract all text from a PDF given its raw bytes."""
    reader = PdfReader(io.BytesIO(pdf_bytes))
    parts: list[str] = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            parts.append(text)
    return "\n".join(parts)


def generate_quiz(pdf_bytes: bytes, filename: str) -> AssessmentOutput:
    """Extract text from PDF and generate a quiz via Gemini through Instructor."""
    text = _extract_text(pdf_bytes)
    if not text.strip():
        raise ValueError("No extractable text found in the PDF.")

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY environment variable not set.")

    genai.configure(api_key=api_key)
    raw_client = genai.GenerativeModel(model_name="gemini-3.6-flash")
    client = instructor.from_gemini(raw_client, mode=instructor.Mode.GEMINI_JSON)

    prompt = (
        "You are a quiz generator for government training. "
        "Read the text below and generate exactly 5 multiple-choice questions. "
        "Each question must have exactly 4 answer options. "
        "Identify the correct answer index (0-3) and write a clear explanation.\n\n"
        f"TEXT:\n{text[:6000]}"  # cap at 6000 chars to stay within context limits
    )

    # Instructor forces the response into AssessmentOutput Pydantic shape — no raw JSON parsing
    class _QuizPayload(BaseModel):
        questions: list[QuizQuestion]

    result = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        response_model=_QuizPayload,
    )

    return AssessmentOutput(
        quiz_id=str(uuid.uuid5(_NAMESPACE, filename)),
        source_filename=filename,
        questions=result.questions,
    )
