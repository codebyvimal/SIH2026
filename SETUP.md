# SETUP.md — Environment Bootstrap (run once, same for all teammates)

Follow this in order. It ONLY sets up the environment and the empty folder skeleton.
**It does NOT create any application code** — your AI agent builds that fresh as you work
on each system, guided by `context.md`, `AGENTS.md`, and `docs/schemas.md`.

Run this once when you clone. When it's done, your machine matches everyone else's.

---

## 1. Prerequisites

```bash
python3 --version   # Must be 3.11+
node --version      # Must be 18+
npm --version       # Must be 9+
git --version
```

If any are missing, install them, then continue.

---

## 2. Navigate to repo root

You must be at the repo root (the folder containing `AGENTS.md`, `context.md`).

```bash
cd <repo-root>
```

Verify `AGENTS.md` and `context.md` exist here. If not, stop.

---

## 3. Python virtual environment + backend deps

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

Verify:

```bash
python -c "import fastapi, pydantic, networkx, uvicorn, pytest, ruff; print('backend deps OK')"
```

---

## 4. Frontend deps

Your AI agent scaffolds the `frontend/` code as it builds Systems 7 & 8. If a `frontend/package.json`
exists, install it:

```bash
cd frontend
npm install
cd ..
```

If `frontend/` does not exist yet, skip this step — your agent creates it later.

---

## 5. Empty folder skeleton

Create the directory structure the architecture expects (see `context.md` §3). Folders only —
**no files**. Your AI agent fills them in as it builds.

```bash
mkdir -p backend/app/shared
mkdir -p backend/app/services/{profile,gap_analysis,recommendation,igot_mock,assessment,grading}
mkdir -p backend/tests
mkdir -p docs
mkdir -p data/dummy/sample_pdfs
mkdir -p frontend/app/dashboard/{employee,admin}
mkdir -p frontend/components
mkdir -p frontend/mock_data
mkdir -p scripts
```

---

## 6. .env

Copy the example and fill in your own keys (do not commit real keys):

```bash
cp .env.example .env
```

---

## 7. Done

Your environment now matches the rest of the team. Start building — hand this file to your
AI agent and tell it to read `AGENTS.md` and `context.md` first.
