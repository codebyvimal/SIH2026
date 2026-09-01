from pathlib import Path
from unittest.mock import patch

from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.app.services.assessment.router import router
from backend.app.shared.schemas import AssessmentOutput, QuizQuestion

app = FastAPI()
app.include_router(router)
client = TestClient(app)

SAMPLE_PDF = Path("data/dummy/sample_pdfs/sample_stats.pdf")


def _mock_quiz_output() -> AssessmentOutput:
    return AssessmentOutput(
        quiz_id="test-quiz-001",
        source_filename="sample_stats.pdf",
        questions=[
            QuizQuestion(
                q="What is a p-value?",
                options=[
                    "Probability of null given data",
                    "Probability of data given null",
                    "A test statistic",
                    "Power of the test",
                ],
                correct=1,
                explanation="A p-value is the probability of observing data as extreme as yours, assuming H0 is true.",
            )
        ],
    )


def test_assessment_endpoint_returns_valid_schema():
    """POST /assessment with a real PDF must return a valid AssessmentOutput."""
    with (
        patch(
            "backend.app.services.assessment.router.generate_quiz",
            return_value=_mock_quiz_output(),
        ),
        open(SAMPLE_PDF, "rb") as f,
    ):
        response = client.post(
            "/assessment", files={"file": ("sample_stats.pdf", f, "application/pdf")}
        )
    assert response.status_code == 200
    data = response.json()
    assert "quiz_id" in data
    assert "source_filename" in data
    assert isinstance(data["questions"], list)
    assert len(data["questions"]) == 1
    q = data["questions"][0]
    assert len(q["options"]) == 4
    assert 0 <= q["correct"] <= 3


def test_assessment_question_structure():
    """Each question must have exactly the fields defined in schemas.md."""
    with (
        patch(
            "backend.app.services.assessment.router.generate_quiz",
            return_value=_mock_quiz_output(),
        ),
        open(SAMPLE_PDF, "rb") as f,
    ):
        response = client.post(
            "/assessment", files={"file": ("sample_stats.pdf", f, "application/pdf")}
        )
    assert response.status_code == 200
    q = response.json()["questions"][0]
    assert "q" in q
    assert "options" in q
    assert "correct" in q
    assert "explanation" in q


def test_assessment_rejects_non_pdf():
    """POST /assessment with a non-PDF file must return 400."""
    response = client.post(
        "/assessment", files={"file": ("notes.txt", b"hello", "text/plain")}
    )
    assert response.status_code == 400
