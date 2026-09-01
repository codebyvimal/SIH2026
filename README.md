# SIH2026-prebuild

Team scaffolding for the SIH 2026 build. Six people build eight isolated systems in
parallel and combine them at the end.

## Start here (for every teammate)

1. **`/context.md`** — the 8-system architecture, folder layout, and dummy data locations.
2. **`/AGENTS.md`** — the binding rules every AI agent follows: process, git workflow,
   code style, and the isolation rule. Read it before you start, and make the tools (Claude
   Code, Codex, OpenCode, Cursor, ...) read it on your behalf.
3. **`/docs/schemas.md`** — the frozen I/O contracts every system must honor.

## Not a rule file
`context.md` is a reference, not agent policy. The agent-facing rules live in
`AGENTS.md` (plus a thin symlink/pointer via `CLAUDE.md`).

## Team conventions (summary)
- Feature branches + PRs. Never commit to `main`.
- Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, ...).
- TDD where practical; every backend service has its own tests.
- `ruff format`+`check` (Python) and `eslint`+`prettier` (frontend) before "done".
- Never import across service folders; only `backend/app/shared/schemas.py`.
