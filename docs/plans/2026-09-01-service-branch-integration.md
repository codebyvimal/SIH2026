# Service Branch Integration Implementation Plan

> **For Claude:** Use `${SUPERPOWERS_SKILLS_ROOT}/skills/collaboration/executing-plans/SKILL.md` to implement this plan task-by-task.

**Goal:** Integrate all currently eligible feature branches in dependency order while preserving every existing service contract and proving the combined application works after each merge.

**Architecture:** Start from `main` in an isolated integration branch. Merge Profile Builder before Gap Analysis, then Recommendation Engine, then Assessment Engine; resolve only integration seams in `backend/app/main.py`, shared schemas, and dependency configuration. Validate each newly merged service in isolation and rerun the combined backend suite before moving on.

**Tech Stack:** Git, FastAPI, Pydantic v2, pytest, Ruff.

---

### Task 1: Integrate Profile Builder

**Files:**
- Modify: `backend/app/main.py`
- Modify: `pyproject.toml`, `scripts/seed_dummy_data.py` only if Git reports a merge conflict
- Test: `backend/app/services/profile/tests/`

**Step 1: Merge `origin/ramu` into the integration branch.**

Run: `git merge --no-ff origin/ramu -m "merge: integrate profile builder"`

**Step 2: Resolve only reported conflicts, preserving the frozen contracts.**

**Step 3: Run the Profile Builder tests and backend test suite.**

Run: `pytest backend/app/services/profile/tests && pytest backend/`

**Step 4: Run Ruff checks.**

Run: `ruff check backend && ruff format --check backend`

### Task 2: Integrate Gap Analysis

**Files:**
- Modify: `backend/app/main.py`, `backend/app/shared/schemas.py`
- Test: `backend/app/services/gap_analysis/tests/`

**Step 1: Merge `origin/antigravity/gap-analysis`.**

Run: `git merge --no-ff origin/antigravity/gap-analysis -m "merge: integrate gap analysis"`

**Step 2: Resolve reported conflicts by retaining all prior router mounts and schema models.**

**Step 3: Run service and full backend verification.**

Run: `pytest backend/app/services/gap_analysis/tests && pytest backend/ && ruff check backend && ruff format --check backend`

### Task 3: Integrate Recommendation Engine

**Files:**
- Modify: `backend/app/main.py`
- Test: `backend/app/services/recommendation/tests/`

**Step 1: Merge `origin/agent/recommendation-engine`.**

Run: `git merge --no-ff origin/agent/recommendation-engine -m "merge: integrate recommendation engine"`

**Step 2: Resolve reported conflicts without removing prior service mounts.**

**Step 3: Run service and full backend verification.**

Run: `pytest backend/app/services/recommendation/tests && pytest backend/ && ruff check backend && ruff format --check backend`

### Task 4: Integrate Employee Dashboard

**Files:**
- Modify: `frontend/app/dashboard/employee/page.tsx`, `frontend/components/dashboard/`, `frontend/mock_data/employee_dashboard.json`
- Test: `frontend/__tests__/`

**Step 1: Merge `origin/antigravity/employee-dashboard`.**

Run: `git merge --no-ff origin/antigravity/employee-dashboard -m "merge: integrate employee dashboard"`

**Step 2: Resolve reported conflicts while retaining the frozen schema contracts and dashboard mock-data shape.**

**Step 3: Run dashboard and backend verification.**

Run: `npm test -- --runInBand && pytest backend/ && ruff check backend && ruff format --check backend`

### Task 5: Final integration verification

**Files:**
- Modify: `backend/app/main.py` only if required to preserve all router mounts
- Test: `backend/`

**Step 1: Inspect mounted routes and imports for all integrated services.**

**Step 2: Run `pytest backend/`, `ruff check backend`, and `ruff format --check backend`.**

**Step 3: Commit any conflict-resolution changes and this plan.**

Run: `git add docs/plans backend/app/main.py backend/app/shared/schemas.py pyproject.toml requirements.txt && git commit -m "chore: document service branch integration"`
