# AGENTS.md — Team Rules for AI Coding Agents

This file is read by **every** AI coding agent in this repo (Claude Code, Codex, OpenCode,
Gemini CLI, Cursor, etc.). If you are an agent given a task here, treat this as binding
project policy. Where this file conflicts with generic habits, **this file wins**.

> For the human-readable architecture reference, see [`context.md`](./context.md).
> For frozen I/O contracts (source of truth for all cross-system shapes), see
> [`docs/schemas.md`](./docs/schemas.md).

---

## 1. Read these first (in order)

1. `AGENTS.md` — this file: how we work and what "done" means.
2. `context.md` — the 8-system architecture, folder layout, dummy data locations.
3. `docs/schemas.md` — the Pydantic/JSON contracts every system must honor.

Do not invent new interfaces as you go. Match the shapes already defined in
`docs/schemas.md`. If a contract is missing, **ask the team lead before defining one** —
contradictory auto-invented schemas are the #1 way parallel builds break.

---

## 2. Scope boundaries (non-negotiable)

- This hackathon builds a **working demo**, not production. Prefer the simplest thing that
  works and looks good on stage.
- **System 4 (iGOT mock) stays mocked forever.** Do not attempt a real iGOT integration.
- LLM calls go through **Instructor for structured Pydantic output only**. No raw-string
  JSON parsing of LLM output.
- Semantic search is **local** (FAISS + Sentence-Transformers). No external vector DB.
- Each of the 8 systems builds/testable **in isolation with its own mock data** — nobody
  waits on another system.

---

## 3. Engineering process — how every task is done

Always follow this order. Skip nothing. "Just vibe it" does not mean skipping process.

### 3a. Plan before building (when the task is non-trivial)
- If a task needs multiple steps or touches new areas, use the **Writing Plans** skill to
  write a short plan into `docs/plans/YYYY-MM-DD-<feature>.md` and follow it. Keep plans
  small.
- If handed a plan, use the **Executing Plans** skill to run it in batches with checkpoints.

### 3b. Write tests (TDD when practical)
- Use the **Test-Driven Development** skill: red → green → refactor. Write the failing test
  first, watch it fail, then implement.
- Every backend service MUST have tests under its own `services/<name>/tests/`.
- Frontend: add a test where behavior is non-trivial; otherwise verify against mock data.
- **A feature is not done until it is tested.**

### 3c. Debugging
- When something breaks, use the **Systematic Debugging** skill: root cause first, no
  symptom patching, no shotgun fixes. Never "just try changing X".

### 3d. Frontend design
- When building/styling any UI, use the **frontend-design** skill (distinctive, production
  grade, avoids generic "AI slop" aesthetics).
- When handling PDFs (System 5 — assessment), use the **pdf** skill.

### 3e. Definition of done — all must pass before you say "done":
- [ ] Feature behaves per its contract in `docs/schemas.md` (tested with mock input).
- [ ] Its own tests pass: `pytest backend/app/services/<name>/tests` (Python) / test cmd (TS).
- [ ] No lint or format errors (`ruff check` / `eslint` — see §5).
- [ ] No imports across service folders (only `backend/app/shared/schemas.py`) — see §6.
- [ ] Committed with a Conventional Commit message — see §4.

---

## 4. Git workflow & commit conventions

- **Workflow:** feature branches + PRs. Never commit directly to `main`.
  - Branch name: `<your-name>/<short-feature>` e.g. `anya/gap-scoring`.
  - Commit the branch early and often; open a PR when the feature's tests pass.
- **Commit messages:** Conventional Commits.
  - `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`, `style:`, `perf:`.
  - Imperative, present tense, ≤ ~70 chars subject. e.g. `feat(gap): add ordering by gap size`.
- Pull `main` into your branch before finishing to catch conflicts early.
- The 8 systems are isolated, so merge conflicts should be rare — if you get many, you are
  likely touching shared code you should not be.

---

## 5. Code style & tooling (consistency across the whole team)

Use exactly these tools and settings so everyone's code looks the same. Configure them when
you scaffold, before writing code.

### Python (backend)
- **Formatter/Linter:** `ruff` (lint + format). Same settings for everyone — see
  `pyproject.toml` if present, else the baseline below.
- **Defaults when no config yet:**
  - `ruff format` for formatting; `ruff check --fix` for lint.
  - Line length 100. Single quotes. Type hints on all function signatures and public models.
  - Use **Pydantic v2** models from `backend/app/shared/schemas.py` for every I/O boundary.
- **Tests:** `pytest`. Fixtures shared in `backend/tests/conftest.py`.
- **Run:** `pytest backend/`, `ruff check backend/`, `ruff format backend/`.

### Frontend (Next.js + Tailwind + Recharts)
- **Linter/Formatter:** ESLint (flat config) + Prettier. Run `eslint . --fix` and
  `prettier --write .` before finishing.
- **TypeScript strict mode** — no `any` unless unavoidable and commented.
- Tailwind utility classes for styling; keep custom CSS minimal.
- Recharts for all charts; dark/light consistent via Tailwind `dark:` variants where used.
- Components in `frontend/components/`, routes under `frontend/app/`.

### Universal
- Prefer existing code style. Match the file you are editing.
- Keep functions small and single-purpose. Use clear, descriptive names.
- Do not commit secrets, API keys, or large binary files. `*.env` is local-only.

---

## 6. The isolation rule (protects parallel work)

- A service's `services/<name>/` folder is **self-contained**: own router, logic, mock_data,
  tests.
- It may import shared Pydantic shapes from `backend/app/shared/schemas.py` and **nothing
  from another service**.
- All shared dummy data lives in `data/dummy/` (backend) and `frontend/mock_data/`
  (frontend). Reuse it; do not fork ad-hoc copies into service folders unless it is a
  narrow pytest-only fixture.
- Integration happens **only in `backend/app/main.py`** (mounts routers). Never wire systems
  directly to each other.

---

## 7. When you are stuck or unsure

- Go back to `context.md` §1–6 and `docs/schemas.md`.
- Use the **Systematic Debugging** skill before guessing.
- If a decision crosses system boundaries or changes a shared schema, **ask the team lead**
  rather than improvising — consistency across 6 parallel builders is the whole point.

---

## 8. Installed skills (auto-detect, do not force-load)

These skills are installed for every agent. They load **only when the task matches** their
`when_to_use`. Do not load them on every task, and do not skip them when they do match:

| Skill | Use when |
|---|---|
| `writing-plans` | planning a multi-step feature |
| `executing-plans` | executing a written plan with checkpoints |
| `test-driven-development-tdd` | implementing any feature/bugfix |
| `systematic-debugging` | any bug, test failure, or unexpected behavior |
| `frontend-design` | building/styling UI |
| `pdf` | creating/reading/editing PDFs (System 5) |
