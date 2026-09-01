# Assessment Engine Implementation Plan

> **For Claude:** Use `${SUPERPOWERS_SKILLS_ROOT}/skills/collaboration/executing-plans/SKILL.md` to implement this plan task-by-task.

**Goal:** Build System 5 (Assessment Engine) — accepts a PDF upload, extracts its text via `pypdf`, generates a 4-option MCQ quiz via the Gemini LLM through Instructor, and returns an `AssessmentOutput` matching `docs/schemas.md`.

**Architecture:**
- FastAPI `POST /assessment` multipart endpoint receives a PDF file.
- `logic.py` extracts text using `pypdf`, feeds it to `Gemini 2.5 Flash` via `Instructor` for structured quiz generation.
- A `sample_stats.pdf` is created in `data/dummy/sample_pdfs/` so the service is testable without a real upload.
- The service imports ONLY from `backend/app/shared/schemas.py` — no cross-service imports.

**Tech Stack:** FastAPI, pypdf, Instructor, google-generativeai (Gemini 2.5 Flash), pytest, ruff, python-multipart

---

### Task 1: Create sample PDF fixture

**Files:**
- Create: `data/dummy/sample_pdfs/sample_stats.pdf`
- Create: `scripts/create_sample_pdf.py`

**Why:** The service tests against `data/dummy/sample_pdfs/` per `context.md §2`. We need a real (non-empty) PDF with readable statistical text so `pypdf` can extract content and the LLM has something to generate questions from. We use `reportlab` (already available in `requirements.txt`) to generate it programmatically.

**Step 1: Write the script**

```python
# scripts/create_sample_pdf.py
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

output_path = Path('data/dummy/sample_pdfs/sample_stats.pdf')
output_path.parent.mkdir(parents=True, exist_ok=True)

doc = SimpleDocTemplate(str(output_path), pagesize=letter)
styles = getSampleStyleSheet()
story = []

story.append(Paragraph('Introduction to Statistical Inference', styles['Title']))
story.append(Spacer(1, 12))

content = [
    ('What is a p-value?',
     'A p-value is the probability of obtaining test results at least as extreme '
     'as the observed results, assuming the null hypothesis is true. A low p-value '
     '(typically < 0.05) suggests strong evidence against the null hypothesis.'),
    ('Hypothesis Testing',
     'Hypothesis testing is a statistical method used to make decisions about a '
     'population based on sample data. It involves a null hypothesis (H0) and an '
     'alternative hypothesis (H1). The test statistic measures how far the sample '
     'data falls from the null hypothesis value.'),
    ('Type I and Type II Errors',
     'A Type I error (false positive) occurs when we reject a true null hypothesis. '
     'Its probability is denoted by alpha (significance level). A Type II error '
     '(false negative) occurs when we fail to reject a false null hypothesis. '
     'Its probability is denoted by beta. Statistical power = 1 - beta.'),
    ('Confidence Intervals',
     'A confidence interval gives a range of plausible values for a population '
     'parameter. A 95% confidence interval means that if we repeated the sampling '
     'procedure many times, 95% of the intervals would contain the true parameter.'),
]

for heading, body in content:
    story.append(Paragraph(heading, styles['Heading2']))
    story.append(Paragraph(body, styles['Normal']))
    story.append(Spacer(1, 12))

doc.build(story)
print(f'Created {output_path}')
```

**Step 2: Run the script to generate the PDF**

```bash
python scripts/create_sample_pdf.py
```

Expected: `Created data/dummy/sample_pdfs/sample_stats.pdf`

**Step 3: Verify it exists and is readable**

```bash
python -c "from pypdf import PdfReader; r=PdfReader('data/dummy/sample_pdfs/sample_stats.pdf'); print(r.pages[0].extract_text()[:200])"
```

Expected: first 200 chars of the statistical text we wrote.

**Step 4: Commit**

```bash
git add data/dummy/sample_pdfs/sample_stats.pdf scripts/create_sample_pdf.py
git commit -m "chore(assessment): add sample stats PDF fixture and generation script"
```

---

### Task 2: Scaffold service structure and write the failing test

**Files:**
- Create: `backend/app/services/assessment/__init__.py`
- Create: `backend/app/services/assessment/tests/__init__.py`
- Create: `backend/app/services/assessment/tests/test_assessment.py`

**Step 1: Write the failing tests**

```python
# backend/app/services/assessment/tests/test_assessment.py
import pytest
from pathlib import Path
from fastapi import FastAPI
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from backend.app.shared.schemas import AssessmentOutput, QuizQuestion
from backend.app.services.assessment.router import router

app = FastAPI()
app.include_router(router)
client = TestClient(app)

SAMPLE_PDF = Path('data/dummy/sample_pdfs/sample_stats.pdf')


def _mock_quiz_output() -> AssessmentOutput:
    return AssessmentOutput(
        quiz_id='test-quiz-001',
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
                explanation='A p-value is the probability of observing data as extreme as yours, assuming H0 is true.',
            )
        ],
    )


def test_assessment_endpoint_returns_valid_schema():
    """POST /assessment with a real PDF must return a valid AssessmentOutput."""
    with patch(
        'backend.app.services.assessment.logic.generate_quiz',
        return_value=_mock_quiz_output(),
    ):
        with open(SAMPLE_PDF, 'rb') as f:
            response = client.post('/assessment', files={'file': ('sample_stats.pdf', f, 'application/pdf')})
    assert response.status_code == 200
    data = response.json()
    assert 'quiz_id' in data
    assert 'source_filename' in data
    assert isinstance(data['questions'], list)
    assert len(data['questions']) == 1
    q = data['questions'][0]
    assert len(q['options']) == 4
    assert 0 <= q['correct'] <= 3


def test_assessment_question_structure():
    """Each question must have exactly the fields defined in schemas.md."""
    with patch(
        'backend.app.services.assessment.logic.generate_quiz',
        return_value=_mock_quiz_output(),
    ):
        with open(SAMPLE_PDF, 'rb') as f:
            response = client.post('/assessment', files={'file': ('sample_stats.pdf', f, 'application/pdf')})
    assert response.status_code == 200
    q = response.json()['questions'][0]
    assert 'q' in q
    assert 'options' in q
    assert 'correct' in q
    assert 'explanation' in q


def test_assessment_rejects_non_pdf():
    """POST /assessment with a non-PDF file must return 400."""
    response = client.post('/assessment', files={'file': ('notes.txt', b'hello', 'text/plain')})
    assert response.status_code == 400
```

**Step 2: Run the test to verify it fails**

```bash
PYTHONPATH=. pytest backend/app/services/assessment/tests/test_assessment.py -v
```

Expected: `ImportError` or `ModuleNotFoundError` — `router` doesn't exist yet.

**Step 3: Commit the test**

```bash
git add backend/app/services/assessment/
git commit -m "test(assessment): add failing tests for assessment engine"
```

---

### Task 3: Implement logic.py — PDF extraction + LLM quiz generation

**Files:**
- Create: `backend/app/services/assessment/logic.py`

**Overview:**
1. Accept raw bytes + filename.
2. Use `pypdf.PdfReader` to extract full text from all pages.
3. Build a prompt and call Gemini 2.5 Flash via `Instructor` with `AssessmentOutput` as the response model.
4. Generate a deterministic `quiz_id` using `uuid5` over the filename so the same PDF always gets the same ID.
5. Return the `AssessmentOutput` Pydantic model directly.

**Key design notes (per AGENTS.md §2):**
- LLM output must be parsed by Instructor into `AssessmentOutput` — no raw `json.loads()` of LLM strings.
- The `.env` file holds `GEMINI_API_KEY`. Logic reads it via `os.getenv`. No hard-coded keys.

```python
# backend/app/services/assessment/logic.py
from __future__ import annotations

import io
import os
import uuid
from typing import TYPE_CHECKING

import instructor
import google.generativeai as genai
from pypdf import PdfReader

from backend.app.shared.schemas import AssessmentOutput, QuizQuestion

_NAMESPACE = uuid.UUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')  # URL namespace


def _extract_text(pdf_bytes: bytes) -> str:
    """Extract all text from a PDF given its raw bytes."""
    reader = PdfReader(io.BytesIO(pdf_bytes))
    parts: list[str] = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            parts.append(text)
    return '\n'.join(parts)


def generate_quiz(pdf_bytes: bytes, filename: str) -> AssessmentOutput:
    """Extract text from PDF and generate a quiz via Gemini through Instructor."""
    text = _extract_text(pdf_bytes)
    if not text.strip():
        raise ValueError('No extractable text found in the PDF.')

    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise RuntimeError('GEMINI_API_KEY environment variable not set.')

    genai.configure(api_key=api_key)
    raw_client = genai.GenerativeModel(model_name='gemini-2.5-flash')
    client = instructor.from_gemini(raw_client, mode=instructor.Mode.GEMINI_JSON)

    prompt = (
        'You are a quiz generator for government training. '
        'Read the text below and generate exactly 5 multiple-choice questions. '
        'Each question must have exactly 4 answer options. '
        'Identify the correct answer index (0-3) and write a clear explanation.\n\n'
        f'TEXT:\n{text[:6000]}'  # cap at 6000 chars to stay within context limits
    )

    # Instructor forces the response into AssessmentOutput Pydantic shape — no raw JSON parsing
    class _QuizPayload(AssessmentOutput):
        pass

    result = client.chat.completions.create(
        messages=[{'role': 'user', 'content': prompt}],
        response_model=_QuizPayload,
    )

    # Overwrite quiz_id and source_filename deterministically
    result.quiz_id = str(uuid.uuid5(_NAMESPACE, filename))
    result.source_filename = filename
    return result
```

**Step: Commit**

```bash
git add backend/app/services/assessment/logic.py
git commit -m "feat(assessment): add PDF extraction and LLM quiz generation logic"
```

---

### Task 4: Implement router.py — the FastAPI endpoint

**Files:**
- Create: `backend/app/services/assessment/router.py`

```python
# backend/app/services/assessment/router.py
from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, UploadFile

from backend.app.shared.schemas import AssessmentOutput
from .logic import generate_quiz

router = APIRouter()


@router.post('/assessment', response_model=AssessmentOutput)
async def run_assessment(file: UploadFile = File(...)) -> AssessmentOutput:
    if file.content_type != 'application/pdf':
        raise HTTPException(status_code=400, detail='Only PDF files are accepted.')
    pdf_bytes = await file.read()
    try:
        return generate_quiz(pdf_bytes, file.filename or 'unknown.pdf')
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
```

**Step 1: Run the tests to verify they now pass**

```bash
PYTHONPATH=. pytest backend/app/services/assessment/tests/test_assessment.py -v
```

Expected: all 3 tests PASS (LLM calls are mocked, so no API key needed for tests).

**Step 2: Run ruff lint and format**

```bash
ruff check backend/app/services/assessment/ --fix
ruff format backend/app/services/assessment/
```

Expected: no errors.

**Step 3: Mount the router in main.py**

```python
# backend/app/main.py (add the import + include_router call)
from backend.app.services.assessment.router import router as assessment_router
app.include_router(assessment_router, prefix='/api')
```

**Step 4: Commit**

```bash
git add backend/app/services/assessment/router.py backend/app/main.py
git commit -m "feat(assessment): add assessment router and mount in main"
```

---

### Task 5: Manual smoke test against real endpoint

**Why:** This step verifies the real LLM integration works end-to-end, not just the mocked unit tests.

**Step 1: Set the API key**

```bash
export GEMINI_API_KEY=<your key from .env>
```

**Step 2: Run the service in isolation**

```bash
PYTHONPATH=. uvicorn backend.app.main:app --reload --port 8005
```

**Step 3: Hit the endpoint with curl**

```bash
curl -s -X POST http://localhost:8005/api/assessment \
  -F "file=@data/dummy/sample_pdfs/sample_stats.pdf" | python3 -m json.tool
```

Expected: a JSON response with `quiz_id`, `source_filename`, and a `questions` list of 5 MCQs — each with `q`, `options[4]`, `correct`, `explanation`.

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat(assessment): complete System 5 — assessment engine end-to-end"
```
