# Recommendation Engine (System 3) — Implementation Plan

> **For agent:** Use `/home/vimal/SIH2026/.agents/skills/executing-plans/SKILL.md` to implement this plan task-by-task.

**Goal:** Build a standalone FastAPI service that takes a skill gap as input, runs FAISS semantic search over `data/dummy/courses.json`, then uses Gemini 2.5 Flash via Instructor to re-rank and justify each recommendation — returning a `RecommendationOutput` exactly matching `docs/schemas.md §3`.

**Architecture:**
- `logic.py` owns all business logic: load courses → build FAISS index → semantic-search top-k → call LLM (Instructor + Gemini) for re-ranking with `why` justifications.
- `router.py` exposes one endpoint: `POST /recommend` → `RecommendationOutput`.
- No cross-service imports. The only shared import is `backend/app/shared/schemas.py`.

**Tech Stack:** FastAPI, Pydantic v2, FAISS (`faiss-cpu`), `sentence-transformers` (model: `all-MiniLM-L6-v2`), `instructor`, `google-generativeai` (Gemini 2.5 Flash), `pytest`, `httpx`, `ruff`.

---

## Pre-task: Branch setup

```bash
git checkout -b <your-name>/recommendation-engine
```

> All commits go here. Never commit to `main` directly.

---

## Task 0: Enrich `data/dummy/courses.json`

The current catalogue has only 2 courses — too small for meaningful FAISS search. Expand it to ~15 realistic courses (mix of iGOT and NSSTA) covering all 4 domains: `statistical_methods`, `data_management`, `domain_knowledge`, `digital_tools`.

**Files:**
- Modify: `data/dummy/courses.json`

**Step 1: Replace the file with a richer catalogue**

Each entry must match `IgotCourse` shape exactly:
```json
{
  "course_id": "<unique-string>",
  "title": "<course title>",
  "provider": "iGOT" | "NSSTA",
  "duration_hours": <int>
}
```

Add entries covering topics like: Python for Data Analysis, SQL & Database Management, Public Policy Fundamentals, Statistical Methods for Officers, Excel & Power BI, R Programming, Data Visualization, Census Data Handling, GIS for Governance, Machine Learning Basics, Report Writing & Documentation, DBMS Concepts, Advanced Statistics, Digital Governance Tools, Probability & Inference.

**Step 2: Validate JSON parses cleanly**

```bash
python -c "
import json, pathlib
from backend.app.shared.schemas import IgotCourse
courses = json.loads(pathlib.Path('data/dummy/courses.json').read_text())
models = [IgotCourse(**c) for c in courses]
print(f'OK — {len(models)} courses loaded')
"
```

Expected: `OK — 15 courses loaded` (or however many you added, ≥ 10)

**Step 3: Commit**

```bash
git add data/dummy/courses.json
git commit -m "chore(data): enrich course catalogue to 15 entries for FAISS demo"
```

---

## Task 1: Scaffold service folder

**Files:**
- Create: `backend/app/services/recommendation/__init__.py`
- Create: `backend/app/services/recommendation/logic.py` (empty stubs)
- Create: `backend/app/services/recommendation/router.py` (empty stubs)
- Create: `backend/app/services/recommendation/tests/__init__.py`
- Create: `backend/app/services/recommendation/tests/test_logic.py`
- Create: `backend/app/services/recommendation/tests/test_router.py`

**Step 1: Write the scaffold files**

`backend/app/services/recommendation/__init__.py` — empty file.

`backend/app/services/recommendation/tests/__init__.py` — empty file.

`backend/app/services/recommendation/logic.py`:
```python
"""Recommendation logic: FAISS semantic search + Gemini LLM re-rank."""
from __future__ import annotations

from backend.app.shared.schemas import RecommendationInput, RecommendationOutput


def recommend(req: RecommendationInput) -> RecommendationOutput:
    raise NotImplementedError
```

`backend/app/services/recommendation/router.py`:
```python
"""FastAPI router for System 3 — Recommendation Engine."""
from __future__ import annotations

from fastapi import APIRouter

from backend.app.shared.schemas import RecommendationInput, RecommendationOutput
from backend.app.services.recommendation.logic import recommend

router = APIRouter(prefix='/recommend', tags=['recommendation'])


@router.post('', response_model=RecommendationOutput)
def recommend_endpoint(req: RecommendationInput) -> RecommendationOutput:
    return recommend(req)
```

**Step 2: Write the first failing test**

`backend/app/services/recommendation/tests/test_logic.py`:
```python
import pytest
from backend.app.shared.schemas import RecommendationInput
from backend.app.services.recommendation.logic import recommend


def test_recommend_raises_not_implemented():
    req = RecommendationInput(gap_skill='python programming', gap_size=2)
    with pytest.raises(NotImplementedError):
        recommend(req)
```

**Step 3: Run it — expect PASS (pytest.raises catches NotImplementedError)**

```bash
pytest backend/app/services/recommendation/tests/test_logic.py::test_recommend_raises_not_implemented -v
```

Expected: `PASSED`

**Step 4: Commit**

```bash
git add backend/app/services/recommendation/
git commit -m "chore(rec): scaffold service folder with empty stubs and first test"
```

---

## Task 2: FAISS index builder

The FAISS index is built from `data/dummy/courses.json`. Embed each course title using `sentence-transformers`, store vectors in a `faiss.IndexFlatL2` index.

**Files:**
- Modify: `backend/app/services/recommendation/logic.py`
- Modify: `backend/app/services/recommendation/tests/test_logic.py`

**Step 1: Write the failing test first**

Add to `test_logic.py`:
```python
from backend.app.services.recommendation.logic import build_index, COURSES


def test_build_index_returns_index_and_courses():
    index, courses = build_index()
    assert index.ntotal == len(COURSES)
    assert len(courses) >= 10
    assert index.ntotal >= 10
```

**Step 2: Run to confirm FAIL**

```bash
pytest backend/app/services/recommendation/tests/test_logic.py::test_build_index_returns_index_and_courses -v
```

Expected: `FAILED` — `ImportError: cannot import name 'build_index'`

**Step 3: Implement `build_index` and `COURSES` in `logic.py`**

```python
"""Recommendation logic: FAISS semantic search + Gemini LLM re-rank."""
from __future__ import annotations

import json
import pathlib

import faiss
from sentence_transformers import SentenceTransformer

from backend.app.shared.schemas import (
    IgotCourse,
    RecommendationInput,
    RecommendationOutput,
)

_COURSES_PATH = pathlib.Path('data/dummy/courses.json')
_EMBED_MODEL_NAME = 'all-MiniLM-L6-v2'

COURSES: list[IgotCourse] = [
    IgotCourse(**c) for c in json.loads(_COURSES_PATH.read_text())
]


def build_index() -> tuple[faiss.IndexFlatL2, list[IgotCourse]]:
    """Embed all course titles and build a FAISS flat L2 index."""
    model = SentenceTransformer(_EMBED_MODEL_NAME)
    embeddings = model.encode([c.title for c in COURSES], convert_to_numpy=True).astype('float32')
    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(embeddings)
    return index, COURSES


def recommend(req: RecommendationInput) -> RecommendationOutput:
    raise NotImplementedError
```

**Step 4: Run test — expect PASS**

```bash
pytest backend/app/services/recommendation/tests/test_logic.py::test_build_index_returns_index_and_courses -v
```

Expected: `PASSED`

**Step 5: Commit**

```bash
git add backend/app/services/recommendation/logic.py backend/app/services/recommendation/tests/test_logic.py
git commit -m "feat(rec): add FAISS index builder with sentence-transformer embeddings"
```

---

## Task 3: Semantic search function

Given a query string, embed it and retrieve top-k similar courses. Convert L2 distance to a [0,1] relevance score.

**Files:**
- Modify: `backend/app/services/recommendation/logic.py`
- Modify: `backend/app/services/recommendation/tests/test_logic.py`

**Step 1: Write the failing tests**

Add to `test_logic.py`:
```python
from backend.app.services.recommendation.logic import semantic_search
from backend.app.shared.schemas import IgotCourse


def test_semantic_search_returns_top_k():
    index, courses = build_index()
    results = semantic_search('python data analysis', index, courses, top_k=3)
    assert len(results) == 3
    for course, score in results:
        assert 0.0 <= score <= 1.0
        assert isinstance(course, IgotCourse)


def test_semantic_search_top_result_is_relevant():
    index, courses = build_index()
    results = semantic_search('python programming', index, courses, top_k=5)
    top_titles = [c.title for c, _ in results]
    assert any('Python' in t or 'python' in t.lower() for t in top_titles)
```

**Step 2: Run — expect FAIL**

```bash
pytest backend/app/services/recommendation/tests/test_logic.py -k "semantic_search" -v
```

Expected: `FAILED` — `ImportError: cannot import name 'semantic_search'`

**Step 3: Implement `semantic_search` in `logic.py`**

Add after `build_index`:
```python
def semantic_search(
    query: str,
    index: faiss.IndexFlatL2,
    courses: list[IgotCourse],
    top_k: int = 5,
) -> list[tuple[IgotCourse, float]]:
    """Return top-k courses with relevance scores in [0, 1]."""
    model = SentenceTransformer(_EMBED_MODEL_NAME)
    q_vec = model.encode([query], convert_to_numpy=True).astype('float32')
    distances, indices = index.search(q_vec, top_k)
    return [
        (courses[idx], float(1.0 / (1.0 + dist)))
        for dist, idx in zip(distances[0], indices[0])
    ]
```

**Step 4: Run — expect PASS**

```bash
pytest backend/app/services/recommendation/tests/test_logic.py -k "semantic_search" -v
```

Expected: `2 passed`

**Step 5: Commit**

```bash
git add backend/app/services/recommendation/logic.py backend/app/services/recommendation/tests/test_logic.py
git commit -m "feat(rec): add semantic_search over FAISS index"
```

---

## Task 4: LLM re-rank with Instructor + Gemini

Take the FAISS top-k results and call Gemini 2.5 Flash via Instructor to produce `why` justifications and LLM-adjusted relevance scores.

**Files:**
- Modify: `backend/app/services/recommendation/logic.py`
- Modify: `backend/app/services/recommendation/tests/test_logic.py`

**Step 1: Write the failing test (uses monkeypatch — no real API key needed)**

Add to `test_logic.py`:
```python
from unittest.mock import patch
from backend.app.services.recommendation.logic import llm_rerank
from backend.app.shared.schemas import RecommendedCourse, RecommendationOutput


def test_llm_rerank_structure(monkeypatch):
    """Mock the LLM call; verify llm_rerank returns correct shape."""
    candidates = [
        (IgotCourse(course_id='c1', title='Python for Data Analysis', provider='iGOT', duration_hours=10), 0.85),
        (IgotCourse(course_id='c2', title='Applied Statistics', provider='NSSTA', duration_hours=20), 0.70),
    ]
    mock_output = RecommendationOutput(recommended=[
        RecommendedCourse(course='Python for Data Analysis', course_id='c1', relevance=0.92,
                          why='Directly teaches Python data skills.'),
        RecommendedCourse(course='Applied Statistics', course_id='c2', relevance=0.75,
                          why='Covers statistical foundations.'),
    ])
    with patch('backend.app.services.recommendation.logic._genai_client') as mock_client:
        mock_client.chat.completions.create.return_value = mock_output
        result = llm_rerank('python programming', 2, candidates)
    assert len(result.recommended) == 2
    assert result.recommended[0].relevance == 0.92
    assert len(result.recommended[0].why) > 10
```

**Step 2: Run — expect FAIL**

```bash
pytest backend/app/services/recommendation/tests/test_logic.py::test_llm_rerank_structure -v
```

Expected: `FAILED` — `ImportError: cannot import name 'llm_rerank'`

**Step 3: Implement `llm_rerank` in `logic.py`**

Add at the top of `logic.py` (new imports):
```python
import instructor
import google.generativeai as genai
from pydantic import BaseModel
from backend.app.shared.schemas import RecommendedCourse
```

After `COURSES` declaration, add:
```python
_genai_client = instructor.from_gemini(
    client=genai.GenerativeModel('gemini-2.5-flash'),
    mode=instructor.Mode.GEMINI_JSON,
)


class _LLMReRankOutput(BaseModel):
    recommended: list[RecommendedCourse]
```

Add the function:
```python
def llm_rerank(
    gap_skill: str,
    gap_size: int,
    candidates: list[tuple[IgotCourse, float]],
) -> RecommendationOutput:
    """Call Gemini via Instructor to re-rank candidates and produce why justifications."""
    candidate_text = '\n'.join(
        f'- [{c.course_id}] "{c.title}" ({c.provider}, {c.duration_hours}h) — FAISS score: {score:.3f}'
        for c, score in candidates
    )
    prompt = (
        f'A government official has a skill gap in "{gap_skill}" (gap size: {gap_size}/4).\n'
        f'Rank these courses from most to least relevant and write a one-sentence justification:\n\n'
        f'{candidate_text}\n\n'
        f'Return relevance score (0.0–1.0) and a concise "why" for each course.'
    )
    result = _genai_client.chat.completions.create(
        messages=[{'role': 'user', 'content': prompt}],
        response_model=_LLMReRankOutput,
    )
    return RecommendationOutput(recommended=result.recommended)
```

**Step 4: Run — expect PASS**

```bash
pytest backend/app/services/recommendation/tests/test_logic.py::test_llm_rerank_structure -v
```

Expected: `PASSED`

**Step 5: Commit**

```bash
git add backend/app/services/recommendation/logic.py backend/app/services/recommendation/tests/test_logic.py
git commit -m "feat(rec): add LLM re-rank via Instructor + Gemini 2.5 Flash"
```

---

## Task 5: Wire `recommend()` — full pipeline with cached singletons

Cache the SentenceTransformer model and FAISS index at module level (built once at startup).

**Files:**
- Modify: `backend/app/services/recommendation/logic.py`
- Modify: `backend/app/services/recommendation/tests/test_logic.py`

**Step 1: Write the failing end-to-end test**

Add to `test_logic.py`:
```python
def test_recommend_returns_recommendation_output(monkeypatch):
    """Full pipeline test — mocks the LLM, tests FAISS+routing end-to-end."""
    mock_output = RecommendationOutput(recommended=[
        RecommendedCourse(course='Python for Data Analysis', course_id='course-igot-101',
                          relevance=0.91, why='Directly relevant to python gap.'),
    ])
    with patch('backend.app.services.recommendation.logic.llm_rerank', return_value=mock_output):
        result = recommend(RecommendationInput(gap_skill='python programming', gap_size=2))
    assert isinstance(result, RecommendationOutput)
    assert len(result.recommended) >= 1
```

**Step 2: Run — expect FAIL**

```bash
pytest backend/app/services/recommendation/tests/test_logic.py::test_recommend_returns_recommendation_output -v
```

Expected: `FAILED` — recommend raises `NotImplementedError`

**Step 3: Refactor `logic.py` — cache singletons, wire `recommend()`**

Replace the body of `logic.py` with the final version:
```python
"""Recommendation logic: FAISS semantic search + Gemini LLM re-rank."""
from __future__ import annotations

import json
import pathlib

import faiss
import instructor
import google.generativeai as genai
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

from backend.app.shared.schemas import (
    IgotCourse,
    RecommendedCourse,
    RecommendationInput,
    RecommendationOutput,
)

_COURSES_PATH = pathlib.Path('data/dummy/courses.json')
_EMBED_MODEL_NAME = 'all-MiniLM-L6-v2'
_TOP_K = 5

# Module-level singletons — built once at startup
COURSES: list[IgotCourse] = [
    IgotCourse(**c) for c in json.loads(_COURSES_PATH.read_text())
]
_embed_model: SentenceTransformer = SentenceTransformer(_EMBED_MODEL_NAME)
_faiss_index: faiss.IndexFlatL2 | None = None

_genai_client = instructor.from_gemini(
    client=genai.GenerativeModel('gemini-2.5-flash'),
    mode=instructor.Mode.GEMINI_JSON,
)


class _LLMReRankOutput(BaseModel):
    recommended: list[RecommendedCourse]


def _get_index() -> faiss.IndexFlatL2:
    global _faiss_index
    if _faiss_index is None:
        embeddings = _embed_model.encode(
            [c.title for c in COURSES], convert_to_numpy=True
        ).astype('float32')
        idx = faiss.IndexFlatL2(embeddings.shape[1])
        idx.add(embeddings)
        _faiss_index = idx
    return _faiss_index


def build_index() -> tuple[faiss.IndexFlatL2, list[IgotCourse]]:
    """Public helper used in tests."""
    return _get_index(), COURSES


def semantic_search(
    query: str,
    index: faiss.IndexFlatL2,
    courses: list[IgotCourse],
    top_k: int = _TOP_K,
) -> list[tuple[IgotCourse, float]]:
    """Return top-k courses with relevance scores in [0, 1]."""
    q_vec = _embed_model.encode([query], convert_to_numpy=True).astype('float32')
    distances, indices = index.search(q_vec, top_k)
    return [
        (courses[idx], float(1.0 / (1.0 + dist)))
        for dist, idx in zip(distances[0], indices[0])
    ]


def llm_rerank(
    gap_skill: str,
    gap_size: int,
    candidates: list[tuple[IgotCourse, float]],
) -> RecommendationOutput:
    """Call Gemini via Instructor to re-rank candidates and produce why justifications."""
    candidate_text = '\n'.join(
        f'- [{c.course_id}] "{c.title}" ({c.provider}, {c.duration_hours}h) — FAISS score: {score:.3f}'
        for c, score in candidates
    )
    prompt = (
        f'A government official has a skill gap in "{gap_skill}" (gap size: {gap_size}/4).\n'
        f'Rank these courses from most to least relevant and write a one-sentence justification:\n\n'
        f'{candidate_text}\n\n'
        f'Return relevance score (0.0–1.0) and a concise "why" for each course.'
    )
    result = _genai_client.chat.completions.create(
        messages=[{'role': 'user', 'content': prompt}],
        response_model=_LLMReRankOutput,
    )
    return RecommendationOutput(recommended=result.recommended)


def recommend(req: RecommendationInput) -> RecommendationOutput:
    """Full pipeline: FAISS search → LLM re-rank → RecommendationOutput."""
    index = _get_index()
    candidates = semantic_search(req.gap_skill, index, COURSES, top_k=_TOP_K)
    return llm_rerank(req.gap_skill, req.gap_size, candidates)
```

**Step 4: Run all logic tests**

```bash
pytest backend/app/services/recommendation/tests/test_logic.py -v
```

Expected: all tests pass.

**Step 5: Commit**

```bash
git add backend/app/services/recommendation/logic.py
git commit -m "feat(rec): wire full recommend() pipeline with cached FAISS index"
```

---

## Task 6: Router contract tests

**Files:**
- Modify: `backend/app/services/recommendation/tests/test_router.py`

**Step 1: Write failing router tests**

`backend/app/services/recommendation/tests/test_router.py`:
```python
from unittest.mock import patch

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.app.services.recommendation.router import router
from backend.app.shared.schemas import RecommendationOutput, RecommendedCourse

app = FastAPI()
app.include_router(router)
client = TestClient(app)

_MOCK_OUTPUT = RecommendationOutput(recommended=[
    RecommendedCourse(
        course='Python for Data Analysis',
        course_id='course-igot-101',
        relevance=0.91,
        why='Directly addresses the python skill gap.',
    )
])


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
    assert resp.status_code == 422   # pydantic ge=0 fails
```

**Step 2: Run — expect all 3 PASS**

```bash
pytest backend/app/services/recommendation/tests/test_router.py -v
```

Expected: `3 passed`

**Step 3: Commit**

```bash
git add backend/app/services/recommendation/tests/test_router.py
git commit -m "test(rec): add router contract tests for POST /recommend"
```

---

## Task 7: Full suite + lint

**Step 1: Run all recommendation tests**

```bash
pytest backend/app/services/recommendation/tests/ -v
```

Expected: all tests pass.

**Step 2: Lint + format**

```bash
ruff check backend/app/services/recommendation/ --fix
ruff format backend/app/services/recommendation/
```

Fix any remaining issues, re-run tests.

**Step 3: Commit**

```bash
git add backend/app/services/recommendation/
git commit -m "style(rec): ruff format + lint fixes"
```

---

## Task 8: Wire router into `backend/app/main.py`

**Files:**
- Create or modify: `backend/app/main.py`

**Step 1: Check if `main.py` exists**

```bash
ls backend/app/main.py 2>/dev/null && echo "exists" || echo "missing"
```

**Step 2a: If missing — create it**

```python
"""Backend entry point — mounts all service routers."""
from __future__ import annotations

from fastapi import FastAPI

from backend.app.services.recommendation.router import router as recommendation_router

app = FastAPI(title='SIH 2026 — Career Path & Skill Development Platform')
app.include_router(recommendation_router)
```

**Step 2b: If exists — add only these two lines in the right place**

```python
from backend.app.services.recommendation.router import router as recommendation_router
# (inside the section where routers are mounted)
app.include_router(recommendation_router)
```

**Step 3: Smoke test**

```bash
uvicorn backend.app.main:app --reload --port 8003 &
sleep 4
curl -s -X POST http://localhost:8003/recommend \
  -H 'Content-Type: application/json' \
  -d '{"gap_skill": "statistical analysis", "gap_size": 3}' | python -m json.tool
kill %1
```

Expected: JSON with `recommended` array, each entry having `course`, `course_id`, `relevance`, `why`.

**Step 4: Commit**

```bash
git add backend/app/main.py
git commit -m "feat(rec): mount recommendation router in main.py"
```

---

## Task 9: Open PR

```bash
git fetch origin
git rebase origin/main
git push -u origin <your-name>/recommendation-engine
```

- **PR title:** `feat(rec): System 3 — Recommendation Engine (FAISS + LLM re-rank)`
- **PR description:** paste `pytest` output showing all tests pass + link this plan.

---

## Definition of Done

- [ ] `data/dummy/courses.json` has ≥ 10 entries covering all 4 domains
- [ ] `pytest backend/app/services/recommendation/tests/` — all pass
- [ ] `ruff check backend/app/services/recommendation/` — zero errors
- [ ] `POST /recommend` → `RecommendationOutput` exactly per `docs/schemas.md §3`
- [ ] No imports from any other `services/` folder
- [ ] Router mounted in `backend/app/main.py`
- [ ] PR open against `main` with green tests
