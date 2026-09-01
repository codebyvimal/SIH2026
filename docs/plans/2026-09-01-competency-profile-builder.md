# Competency Profile Builder Implementation Plan

> **For Claude:** Use `${SUPERPOWERS_SKILLS_ROOT}/skills/collaboration/executing-plans/SKILL.md` to implement this plan task-by-task.

**Goal:** Build and complete System 1 (Competency Profile Builder) to ingest official profiles, store them in SQLite, seed initial competency levels across 4 domains, persist graph nodes in NetworkX, expose REST API endpoints (`POST /profile`, `GET /profile/{official_id}`, `GET /profile`), and provide seeding utilities.

**Architecture:** A self-contained FastAPI service in `backend/app/services/profile/` that ingests `ProfileInput`, computes initial competency ratings per domain using experience and keyword heuristics, persists records to SQLite (`data/dummy/app.db`), creates attributed nodes in a NetworkX graph (`data/dummy/graph.gpickle`), and returns frozen contract shapes (`ProfileOutput`).

**Tech Stack:** FastAPI, Pydantic v2, SQLite3, NetworkX, Pytest, Pytest-Asyncio, HTTPX, Ruff.

---

### Task 1: Update Heuristics and Modernize Datetimes in Logic & Tests

**Files:**
- Modify: `backend/app/services/profile/logic.py`
- Modify: `backend/app/services/profile/tests/test_profile_logic.py`

**Step 1: Write the failing test**
Update `backend/app/services/profile/tests/test_profile_logic.py` to test domain keyword boundary conditions (case insensitivity, multi-domain matches, all 4 domains represented) without deprecated `datetime.utcnow()`.

```python
from datetime import datetime, timezone
from backend.app.services.profile.logic import compute_initial_levels
from backend.app.shared.schemas import Domain, PastTraining, ProfileInput, SkillLevel

def test_compute_initial_levels_multi_domain_bump():
    input_data = ProfileInput(
        role="Senior Statistical Officer",
        dept="Data Analytics",
        education="Ph.D. in Econometrics and Mathematics",
        experience_years=6,
        past_trainings=[
            PastTraining(course_name="Advanced SQL & Data Governance", completed_at=datetime.now(timezone.utc)),
            PastTraining(course_name="Python for Data Science & Tableau", completed_at=datetime.now(timezone.utc)),
            PastTraining(course_name="Public Policy and Administration", completed_at=datetime.now(timezone.utc)),
        ],
    )
    levels = compute_initial_levels(input_data)
    # Base for >5 years is PROFICIENT (3), each domain should bump +1 to EXPERT (4)
    assert levels[Domain.STATISTICAL_METHODS] == SkillLevel.EXPERT
    assert levels[Domain.DATA_MANAGEMENT] == SkillLevel.EXPERT
    assert levels[Domain.DOMAIN_KNOWLEDGE] == SkillLevel.EXPERT
    assert levels[Domain.DIGITAL_TOOLS] == SkillLevel.EXPERT
```

**Step 2: Run test to verify it fails or runs**
Run: `.venv/bin/pytest backend/app/services/profile/tests/test_profile_logic.py -v`
Expected: Passes or fails if datetime warning / logic mismatch.

**Step 3: Update implementation**
Refactor `backend/app/services/profile/logic.py` to ensure keyword matching handles edge cases, always outputs all 4 domains as `SkillLevel`, and cleans up any deprecation warnings.

**Step 4: Run test to verify it passes**
Run: `.venv/bin/pytest backend/app/services/profile/tests/test_profile_logic.py -v`
Expected: PASS with 0 warnings.

**Step 5: Commit**
```bash
git add backend/app/services/profile/logic.py backend/app/services/profile/tests/test_profile_logic.py
git commit -m "fix(profile): modernize datetimes and refine domain keyword matching heuristics"
```

---

### Task 2: Implement Profile Retrieval Queries (`get_profile` & `list_profiles`)

**Files:**
- Modify: `backend/app/services/profile/logic.py`
- Modify: `backend/app/services/profile/tests/test_profile_logic.py`

**Step 1: Write the failing test**
Add tests in `backend/app/services/profile/tests/test_profile_logic.py` for fetching an official profile by `official_id` and listing all profiles.

```python
def test_get_profile_and_list_profiles():
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = os.path.join(tmpdir, "test.db")
        graph_path = os.path.join(tmpdir, "test_graph.gpickle")

        input_data = ProfileInput(
            role="Analyst",
            dept="Statistics",
            education="B.Sc. Statistics",
            experience_years=2,
            past_trainings=[],
        )
        created = build_profile(input_data, db_path=db_path, graph_path=graph_path)

        # Query existing profile
        fetched = get_profile(created.official_id, db_path=db_path, graph_path=graph_path)
        assert fetched is not None
        assert fetched.official_id == created.official_id
        assert fetched.initial_levels == created.initial_levels

        # Query non-existing profile
        assert get_profile("non-existent-id", db_path=db_path, graph_path=graph_path) is None

        # List profiles
        profiles = list_profiles(db_path=db_path)
        assert len(profiles) == 1
        assert profiles[0]["official_id"] == created.official_id
```

**Step 2: Run test to verify it fails**
Run: `.venv/bin/pytest backend/app/services/profile/tests/test_profile_logic.py::test_get_profile_and_list_profiles -v`
Expected: FAIL with `NameError: name 'get_profile' is not defined`.

**Step 3: Write minimal implementation**
Implement `get_profile(official_id, db_path, graph_path) -> ProfileOutput | None` and `list_profiles(db_path) -> list[dict]` in `backend/app/services/profile/logic.py`.

```python
def get_profile(
    official_id: str,
    db_path: str = DEFAULT_DB_PATH,
    graph_path: str = DEFAULT_GRAPH_PATH,
) -> ProfileOutput | None:
    init_db(db_path)
    conn = sqlite3.connect(db_path)
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT official_id, role, dept, education, experience_years, past_trainings
            FROM officials WHERE official_id = ?
            """,
            (official_id,),
        )
        row = cursor.fetchone()
        if not row:
            return None

        past_trainings_raw = json.loads(row[5])
        past_trainings = [PastTraining(**pt) for pt in past_trainings_raw]
        profile_input = ProfileInput(
            role=row[1],
            dept=row[2],
            education=row[3],
            experience_years=row[4],
            past_trainings=past_trainings,
        )
        initial_levels = compute_initial_levels(profile_input)

        graph = load_or_create_graph(graph_path)
        graph_node_added = official_id in graph.nodes

        return ProfileOutput(
            official_id=official_id,
            profile_stored=True,
            graph_node_added=graph_node_added,
            initial_levels=initial_levels,
        )
    finally:
        conn.close()

def list_profiles(db_path: str = DEFAULT_DB_PATH) -> list[dict]:
    init_db(db_path)
    conn = sqlite3.connect(db_path)
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT official_id, role, dept, education, experience_years, past_trainings, created_at
            FROM officials ORDER BY created_at DESC
            """
        )
        rows = cursor.fetchall()
        result = []
        for r in rows:
            result.append({
                "official_id": r[0],
                "role": r[1],
                "dept": r[2],
                "education": r[3],
                "experience_years": r[4],
                "past_trainings": json.loads(r[5]),
                "created_at": r[6],
            })
        return result
    finally:
        conn.close()
```

**Step 4: Run test to verify it passes**
Run: `.venv/bin/pytest backend/app/services/profile/tests/test_profile_logic.py -v`
Expected: PASS.

**Step 5: Commit**
```bash
git add backend/app/services/profile/logic.py backend/app/services/profile/tests/test_profile_logic.py
git commit -m "feat(profile): implement get_profile and list_profiles lookup functions"
```

---

### Task 3: Expose REST Endpoints (`GET /profile/{official_id}` & `GET /profile`)

**Files:**
- Modify: `backend/app/services/profile/router.py`
- Modify: `backend/app/services/profile/tests/test_profile_router.py`

**Step 1: Write the failing test**
In `backend/app/services/profile/tests/test_profile_router.py`, add tests for `GET /profile/{official_id}` (successful fetch and 404 not found) and `GET /profile` (listing).

```python
@pytest.mark.asyncio
async def test_get_profile_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Create a profile
        payload = {
            "role": "Director",
            "dept": "Planning",
            "education": "Ph.D. Economics",
            "experience_years": 8,
            "past_trainings": [],
        }
        res_post = await ac.post("/profile", json=payload)
        assert res_post.status_code == 200
        official_id = res_post.json()["official_id"]

        # Fetch profile
        res_get = await ac.get(f"/profile/{official_id}")
        assert res_get.status_code == 200
        assert res_get.json()["official_id"] == official_id
        assert res_get.json()["profile_stored"] is True

        # Fetch non-existent profile
        res_404 = await ac.get("/profile/invalid-id-999")
        assert res_404.status_code == 404

        # List profiles
        res_list = await ac.get("/profile")
        assert res_list.status_code == 200
        assert any(p["official_id"] == official_id for p in res_list.json())
```

**Step 2: Run test to verify it fails**
Run: `.venv/bin/pytest backend/app/services/profile/tests/test_profile_router.py -v`
Expected: FAIL with 405 Method Not Allowed or 404.

**Step 3: Write minimal implementation in router**
Update `backend/app/services/profile/router.py`:

```python
from fastapi import APIRouter, HTTPException
from backend.app.services.profile.logic import build_profile, get_profile, list_profiles
from backend.app.shared.schemas import ProfileInput, ProfileOutput

router = APIRouter(prefix="/profile", tags=["profile"])

@router.post("", response_model=ProfileOutput)
async def create_profile(profile_in: ProfileInput) -> ProfileOutput:
    return build_profile(profile_in)

@router.get("/{official_id}", response_model=ProfileOutput)
async def read_profile(official_id: str) -> ProfileOutput:
    profile = get_profile(official_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.get("", response_model=list[dict])
async def read_profiles() -> list[dict]:
    return list_profiles()
```

**Step 4: Run test to verify it passes**
Run: `.venv/bin/pytest backend/app/services/profile/tests/test_profile_router.py -v`
Expected: PASS.

**Step 5: Commit**
```bash
git add backend/app/services/profile/router.py backend/app/services/profile/tests/test_profile_router.py
git commit -m "feat(profile): add GET /profile/{official_id} and GET /profile endpoints"
```

---

### Task 4: Complete Database & NetworkX Graph Seeding in `scripts/seed_db.py`

**Files:**
- Create: `scripts/seed_db.py`
- Test: `backend/app/services/profile/tests/test_seed_db.py`

**Step 1: Write the failing test**
Create `backend/app/services/profile/tests/test_seed_db.py` to verify that `seed_db.py` correctly reads `data/dummy/profiles.json`, seeds SQLite `officials` table and NetworkX `graph.gpickle`, and sets deterministic `official_id`.

```python
import os
import tempfile
import sqlite3
import pickle
from scripts.seed_db import seed_profiles_to_db_and_graph

def test_seed_profiles_to_db_and_graph():
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = os.path.join(tmpdir, "test.db")
        graph_path = os.path.join(tmpdir, "test_graph.gpickle")
        profiles_file = os.path.abspath("data/dummy/profiles.json")

        count = seed_profiles_to_db_and_graph(profiles_file, db_path, graph_path)
        assert count > 0

        # Verify DB
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM officials")
        assert cursor.fetchone()[0] == count
        conn.close()

        # Verify Graph
        with open(graph_path, "rb") as f:
            graph = pickle.load(f)
        assert len(graph.nodes) == count
```

**Step 2: Run test to verify it fails**
Run: `.venv/bin/pytest backend/app/services/profile/tests/test_seed_db.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'scripts.seed_db'`.

**Step 3: Implement `scripts/seed_db.py`**
Write `scripts/seed_db.py` to load profiles from `data/dummy/profiles.json` and insert into `data/dummy/app.db` and `data/dummy/graph.gpickle` while maintaining deterministic `official_id`s.

**Step 4: Run test to verify it passes**
Run: `.venv/bin/pytest backend/app/services/profile/tests/test_seed_db.py -v`
Expected: PASS.

**Step 5: Commit**
```bash
git add scripts/seed_db.py backend/app/services/profile/tests/test_seed_db.py
git commit -m "feat(seed): create seed_db script for profiles SQLite and NetworkX graph"
```

---

### Task 5: Verification, Integration Testing & Code Quality Pass

**Files:**
- Test: `backend/app/services/profile/tests/`
- Verify: `backend/app/main.py`

**Step 1: Run complete test suite**
Run: `.venv/bin/pytest backend/ -v`
Expected: All tests pass across the backend.

**Step 2: Run ruff lint & format checks**
Run:
```bash
.venv/bin/ruff check backend/ scripts/
.venv/bin/ruff format backend/ scripts/ --check
```
Expected: 0 lint errors, all code properly formatted.

**Step 3: Run seed_db script to prepare local demo storage**
Run: `.venv/bin/python scripts/seed_db.py`
Expected: Success message with count of seeded profiles.

**Step 4: Commit**
```bash
git add backend/ scripts/
git commit -m "chore(profile): format code and verify full test suite for profile builder"
```

---
