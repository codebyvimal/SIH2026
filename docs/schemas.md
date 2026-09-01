# docs/schemas.md — Frozen I/O Contracts

This is the **source of truth** for every shape crossing a system boundary. If your service's
input or output doesn't match what's here, fix your service — don't invent a variant shape.
If a contract is missing something you need, ask the team lead before extending it (see
`AGENTS.md` §1).

All models are **Pydantic v2**, live in `backend/app/shared/schemas.py`, and are imported —
never re-declared — by every service. Frontend TypeScript types should mirror these 1:1
(see §9).

---

## 0. Shared primitives

```python
from __future__ import annotations
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field


class SkillLevel(int, Enum):
    """0 = no exposure, 4 = expert. Used for both required and current levels."""
    NONE = 0
    BASIC = 1
    WORKING = 2
    PROFICIENT = 3
    EXPERT = 4


class Domain(str, Enum):
    """The 4 hardcoded competency domains in data/dummy/framework.json."""
    STATISTICAL_METHODS = 'statistical_methods'
    DATA_MANAGEMENT = 'data_management'
    DOMAIN_KNOWLEDGE = 'domain_knowledge'
    DIGITAL_TOOLS = 'digital_tools'
```

---

## 1. System 1 — Profile Builder

```python
class PastTraining(BaseModel):
    course_name: str
    completed_at: datetime | None = None


class ProfileInput(BaseModel):
    role: str
    dept: str
    education: str
    experience_years: int = Field(ge=0)
    past_trainings: list[PastTraining] = []


class ProfileOutput(BaseModel):
    official_id: str                       # UUID string, generated on creation
    profile_stored: bool
    graph_node_added: bool
    initial_levels: dict[Domain, SkillLevel]   # seeded from role + past_trainings
```

**Mock data:** `data/dummy/profiles.json` — list of `ProfileInput` + assigned `official_id`.

---

## 2. System 2 — Gap Analysis Engine

```python
class GapAnalysisInput(BaseModel):
    official_id: str
    role: str


class SkillGap(BaseModel):
    skill: str
    domain: Domain
    required: SkillLevel
    current: SkillLevel
    gap: int = Field(ge=0)                 # required.value - current.value, floored at 0


class GapAnalysisOutput(BaseModel):
    official_id: str
    gaps: list[SkillGap]
```

**Mock data:** `data/dummy/profiles.json` + `data/dummy/framework.json`.

**`framework.json` shape** (hardcoded competency framework, 4 domains):
```python
class FrameworkSkill(BaseModel):
    skill: str
    domain: Domain
    required_by_role: dict[str, SkillLevel]   # role name -> required level


class CompetencyFramework(BaseModel):
    skills: list[FrameworkSkill]
```

---

## 3. System 3 — Recommendation Engine

```python
class RecommendationInput(BaseModel):
    gap_skill: str
    gap_size: int = Field(ge=0)


class RecommendedCourse(BaseModel):
    course: str
    course_id: str
    relevance: float = Field(ge=0.0, le=1.0)   # FAISS similarity, then LLM-adjusted
    why: str                                    # short LLM-generated justification


class RecommendationOutput(BaseModel):
    recommended: list[RecommendedCourse]
```

**Mock data:** `data/dummy/courses.json` (mock iGOT + NSSTA catalogue) + a hardcoded sample
`SkillGap`.

---

## 4. System 4 — iGOT Integration Layer (mock, permanent)

```python
class IgotCourse(BaseModel):
    course_id: str
    title: str
    provider: str                # 'iGOT' | 'NSSTA'
    duration_hours: int


class EnrollRequest(BaseModel):
    official_id: str
    course_id: str


class EnrollResponse(BaseModel):
    enrollment_id: str
    status: str                  # 'enrolled'


class CompletionStatus(BaseModel):
    enrollment_id: str
    completed: bool
    completed_at: datetime | None = None
```

**Endpoints:** `GET /courses` → `list[IgotCourse]`, `POST /enroll` → `EnrollResponse`,
`GET /completion/{id}` → `CompletionStatus`. This service never calls out anywhere — it's
static canned data shaped like the real iGOT API (see `AGENTS.md` §2: stays mocked forever).

---

## 5. System 5 — Assessment Engine

```python
class QuizQuestion(BaseModel):
    q: str
    options: list[str] = Field(min_length=4, max_length=4)
    correct: int = Field(ge=0, le=3)      # index into options
    explanation: str


class AssessmentOutput(BaseModel):
    quiz_id: str
    source_filename: str
    questions: list[QuizQuestion]
```

Input is a raw PDF (multipart upload), parsed via `pypdf`, generated via the single
quiz-generation agent using Instructor for structured output — no raw-string JSON parsing.

**Mock data:** `data/dummy/sample_pdfs/*.pdf`.

---

## 6. System 6 — Grading / Feedback

```python
class GradingInput(BaseModel):
    quiz_id: str
    answers: dict[int, int]        # question index -> chosen option index


class QuestionFeedback(BaseModel):
    q: str
    your_answer: int
    correct: int
    is_correct: bool
    explanation: str


class GradingOutput(BaseModel):
    quiz_id: str
    score: float = Field(ge=0.0, le=100.0)
    feedback: list[QuestionFeedback]
```

**Mock data:** `data/dummy/quizzes.json` (pre-made quiz + answer key).

---

## 7. System 7 — Employee Dashboard (frontend, read-only)

```python
class EmployeeDashboard(BaseModel):
    official_id: str
    gaps: list[SkillGap]                     # from System 2
    recommended: list[RecommendedCourse]     # from System 3
    latest_grading: GradingOutput | None     # from System 6
```

**Mock data:** `frontend/mock_data/employee_dashboard.json` — matches Systems 1, 2, 3, 6
exactly. Build/preview the UI with this file; no backend required.

---

## 8. System 8 — Admin Dashboard (frontend, aggregated read-only)

```python
class DomainAggregate(BaseModel):
    domain: Domain
    avg_gap: float
    officials_below_target: int


class AdminDashboard(BaseModel):
    total_officials: int
    domain_aggregates: list[DomainAggregate]
    top_recommended_courses: list[str]       # course titles, ranked by enrollment count
```

**Mock data:** `frontend/mock_data/admin_dashboard.json`.

---

## 9. Frontend TypeScript mirror

Frontend types in `frontend/` should mirror these models field-for-field (same names, same
optionality). Enums (`SkillLevel`, `Domain`) become TS string/number union types. Do not
hand-roll a divergent frontend shape — if `EmployeeDashboard` changes here, the TS type
changes in the same PR.

---

## 10. Changing a contract

These are **frozen** for the hackathon. If a system genuinely needs a new field:
1. Confirm no existing field covers it.
2. Ask the team lead (per `AGENTS.md` §7) — a shared schema change affects every consumer.
3. Update this file, `backend/app/shared/schemas.py`, and every mock data file that shape
   touches, in the same PR.
