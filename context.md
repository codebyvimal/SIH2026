# context.md — Project Scaffolding

Single reference for how this repo is structured, what each system does, and how six people
can build in parallel and combine later without blocking each other. This is a **reference
doc**, not the agent-steering file — see `/AGENTS.md` for that.

---

## 1. Tech stack

| Layer | Choice |
|---|---|
| Backend | FastAPI (Python) |
| Competency graph | NetworkX |
| Storage | SQLite |
| LLM | Gemini 2.5 Flash, via Instructor (structured Pydantic output only) |
| Semantic search | FAISS + Sentence-Transformers (local) |
| Frontend | Next.js + Tailwind + Recharts |
| PDF parsing | pypdf |

---

## 2. The 8 systems

Each system is a self-contained backend service (own folder, own router, own tests, own
mock data) or frontend module. **Nobody needs another system running to build or test
their own** — everyone builds against the shared schemas + their own dummy data, and
integration is just wiring routers together at the end.

| # | System | Owns | Depends on (mocked, not live) |
|---|---|---|---|
| 1 | Profile Builder | Intake + storage of official's data | — |
| 2 | Gap Analysis Engine | Graph traversal, gap scoring | Mock profile output |
| 3 | Recommendation Engine | FAISS search + LLM re-rank | Mock gap output, mock course catalogue |
| 4 | iGOT Integration Layer | Mocked external API | — (this IS the mock) |
| 5 | Assessment Engine | PDF → quiz generation | Sample PDFs |
| 6 | Grading / Feedback | Score + explain answers | Mock quiz output |
| 7 | Employee Dashboard | Frontend, read-only | Mock JSON matching systems 1,2,3,6 |
| 8 | Admin Dashboard | Frontend, aggregated read-only | Mock JSON, aggregated |

### System 1 — Profile Builder
- **Input:** `{role, dept, education, experience_years, past_trainings}` (JSON, form or seed)
- **Output:** `{official_id, profile_stored, graph_node_added, initial_levels}` (JSON)
- **Test alone with:** `data/dummy/profiles.json`

### System 2 — Gap Analysis Engine
- **Input:** `{official_id, role}`
- **Output:** `{gaps: [{skill, required, current, gap}]}`
- **Test alone with:** `data/dummy/profiles.json` + `data/dummy/framework.json` (hardcoded competency framework — no need for System 1 to be running)

### System 3 — Recommendation Engine
- **Input:** `{gap_skill, gap_size}`
- **Output:** `{recommended: [{course, relevance, why}]}`
- **Test alone with:** `data/dummy/courses.json` (mock catalogue) + a hardcoded sample gap object — no need for System 2 to be running

### System 4 — iGOT Integration Layer (mock)
- **Input:** `GET /courses`, `POST /enroll {official_id, course_id}`, `GET /completion/{id}`
- **Output:** canned JSON matching the real iGOT API contract shape
- **Test alone with:** nothing else — it's a static mock service, runs standalone

### System 5 — Assessment Engine
- **Input:** a PDF file
- **Output:** `{questions: [{q, options[4], correct, explanation}]}`
- **Test alone with:** `data/dummy/sample_pdfs/*.pdf`

### System 6 — Grading / Feedback
- **Input:** `{quiz_id, answers}`
- **Output:** `{score, feedback: [{q, your_answer, correct, explanation}]}`
- **Test alone with:** `data/dummy/quizzes.json` (a pre-made quiz + answer key) — no need for System 5 to be running

### System 7 — Employee Dashboard
- **Input:** `GET /dashboard/{official_id}`
- **Output:** rendered page (gap chart, course cards, quiz score)
- **Test alone with:** `frontend/mock_data/employee_dashboard.json` — build and preview the UI without any backend running

### System 8 — Admin Dashboard
- **Input:** `GET /dashboard/admin`
- **Output:** rendered page (aggregate charts)
- **Test alone with:** `frontend/mock_data/admin_dashboard.json`

---

## 3. Folder structure

```
repo/
├── AGENTS.md
├── CLAUDE.md                     # one line: @AGENTS.md
├── context.md                    # this file
├── docs/
│   └── schemas.md                # frozen shared Pydantic contracts — source of truth for all I/O shapes
│
├── backend/
│   ├── app/
│   │   ├── main.py                # mounts all service routers — the ONLY integration point
│   │   ├── shared/
│   │   │   └── schemas.py         # shared Pydantic models, imported by every service
│   │   └── services/
│   │       ├── profile/           # System 1
│   │       │   ├── router.py
│   │       │   ├── logic.py
│   │       │   ├── mock_data/
│   │       │   └── tests/
│   │       ├── gap_analysis/      # System 2
│   │       │   ├── router.py
│   │       │   ├── logic.py
│   │       │   ├── mock_data/
│   │       │   └── tests/
│   │       ├── recommendation/    # System 3
│   │       │   └── ... (same shape)
│   │       ├── igot_mock/         # System 4
│   │       │   └── ... (same shape)
│   │       ├── assessment/        # System 5
│   │       │   └── ... (same shape)
│   │       └── grading/           # System 6
│   │           └── ... (same shape)
│   └── tests/
│       └── conftest.py            # shared pytest fixtures, if any
│
├── frontend/
│   ├── app/
│   │   ├── dashboard/employee/    # System 7
│   │   └── dashboard/admin/       # System 8
│   ├── components/
│   └── mock_data/
│       ├── employee_dashboard.json
│       └── admin_dashboard.json
│
├── data/
│   └── dummy/
│       ├── profiles.json
│       ├── framework.json          # hardcoded competency framework (4 domains)
│       ├── courses.json            # mock iGOT + NSSTA catalogue
│       ├── quizzes.json
│       └── sample_pdfs/
│
└── scripts/
    └── seed_db.py                  # loads data/dummy/* into local SQLite for demo
```

**Rule:** every `services/<name>/` folder is self-contained — its own router, logic, mock
data, and tests. It imports shared shapes from `backend/app/shared/schemas.py` and nothing
else from other services. This is what makes parallel building possible: six people can work
in six folders simultaneously without merge conflicts or needing each other's code running.

---

## 4. Where dummy data lives

All fake/seed data lives in `data/dummy/` at the repo root (backend) and `frontend/mock_data/`
(frontend). Nothing invents its own ad-hoc mock data inside a service folder — one shared
location so the same fixtures are reused across systems and stay consistent (e.g. the same
`official_id` in `profiles.json` should be the one referenced in `quizzes.json` and the
dashboard mocks).

Each service's `mock_data/` subfolder (under `services/<name>/`) holds only pytest-specific
fixtures that are too narrow to belong in the shared `data/dummy/` set — the default should
be to reuse the shared data, not fork it.

---

## 5. How systems combine later

1. Each service exposes a FastAPI `APIRouter` with routes matching the I/O contracts in
   `docs/schemas.md`.
2. `backend/app/main.py` is the single file that imports and mounts every router — this is
   the only place integration actually happens.
3. While building, each service reads from its own `mock_data/` or `data/dummy/` files.
   Swapping a mock for a real upstream call (e.g. System 2 actually calling System 1 instead
   of reading `profiles.json`) is a one-line change inside that service's `logic.py` — the
   router and output contract don't change.
4. System 4 (iGOT mock) never gets "swapped out" for the hackathon — it stays mocked
   permanently for this build (see `AGENTS.md` scope boundary).

---

## 6. Testing independently

```
# test one backend service in isolation
pytest backend/app/services/gap_analysis/tests

# test everything
pytest backend/

# run one service standalone (for manual/curl testing)
uvicorn backend.app.services.assessment.router:app --reload --port 8005

# frontend, against mock data only (no backend needed)
npm run dev   # reads frontend/mock_data/*.json until wired to live API
```

Because every service owns its own tests and mock data, a system being "done" means:
`pytest` passes in its own folder, and it returns the correct shape from `docs/schemas.md`
when hit with the mock input — regardless of whether any other system exists yet.
