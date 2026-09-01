# Gap Analysis Engine Implementation Plan

> **For Claude:** Use `${SUPERPOWERS_SKILLS_ROOT}/skills/collaboration/executing-plans/SKILL.md` to implement this plan task-by-task.

**Goal:** Build System 2 (Gap Analysis Engine) to calculate skill gaps based on official roles and the competency framework.

**Architecture:** A FastAPI service in `backend/app/services/gap_analysis` that reads mock profile data and the mock framework, calculates the gaps (required vs current), and returns a `GapAnalysisOutput`.

**Tech Stack:** Python, FastAPI, Pydantic, pytest

---

### Task 1: Setup service structure and tests

**Files:**
- Create: `backend/app/services/gap_analysis/__init__.py`
- Create: `backend/app/services/gap_analysis/router.py`
- Create: `backend/app/services/gap_analysis/logic.py`
- Create: `backend/app/services/gap_analysis/tests/__init__.py`
- Create: `backend/app/services/gap_analysis/tests/test_gap_analysis.py`
- Create: `backend/app/main.py`

**Step 1: Write the failing test**

```python
# backend/app/services/gap_analysis/tests/test_gap_analysis.py
import pytest
from fastapi.testclient import TestClient
from backend.app.services.gap_analysis.router import router

client = TestClient(router)

def test_gap_analysis_calculates_correctly():
    payload = {
        "official_id": "123e4567-e89b-12d3-a456-426614174000",
        "role": "Analyst"
    }
    response = client.post("/gap-analysis", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["official_id"] == "123e4567-e89b-12d3-a456-426614174000"
    
    gaps = data["gaps"]
    assert len(gaps) == 2
    
    digital_gap = next((g for g in gaps if g["domain"] == "digital_tools"), None)
    assert digital_gap["gap"] == 2
    
    stat_gap = next((g for g in gaps if g["domain"] == "statistical_methods"), None)
    assert stat_gap["gap"] == 0
```

**Step 2: Run test to verify it fails**

Run: `pytest backend/app/services/gap_analysis/tests/test_gap_analysis.py -v`
Expected: FAIL due to missing files/router.

**Step 3: Write minimal implementation for logic**

```python
# backend/app/services/gap_analysis/logic.py
import json
from pathlib import Path
from fastapi import HTTPException
from backend.app.shared.schemas import GapAnalysisInput, GapAnalysisOutput, SkillGap, SkillLevel

def get_data_dir():
    return Path(__file__).parents[4] / "data" / "dummy"

def calculate_gaps(input_data: GapAnalysisInput) -> GapAnalysisOutput:
    profiles_path = get_data_dir() / "profiles.json"
    framework_path = get_data_dir() / "framework.json"
    
    with open(profiles_path) as f:
        profiles = json.load(f)
        
    with open(framework_path) as f:
        framework = json.load(f)
        
    profile = next((p for p in profiles if p["official_id"] == input_data.official_id), None)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    gaps = []
    initial_levels = profile.get("initial_levels", {})
    
    for skill_info in framework["skills"]:
        domain = skill_info["domain"]
        required_level_value = skill_info["required_by_role"].get(input_data.role, 0)
        required_level = SkillLevel(required_level_value)
        
        current_level_value = initial_levels.get(domain, 0)
        current_level = SkillLevel(current_level_value)
        
        gap = max(0, required_level_value - current_level_value)
        
        gaps.append(SkillGap(
            skill=skill_info["skill"],
            domain=domain,
            required=required_level,
            current=current_level,
            gap=gap
        ))
        
    return GapAnalysisOutput(official_id=input_data.official_id, gaps=gaps)
```

**Step 4: Write minimal implementation for router**

```python
# backend/app/services/gap_analysis/router.py
from fastapi import APIRouter
from backend.app.shared.schemas import GapAnalysisInput, GapAnalysisOutput
from .logic import calculate_gaps

router = APIRouter()

@router.post("/gap-analysis", response_model=GapAnalysisOutput)
def perform_gap_analysis(input_data: GapAnalysisInput):
    return calculate_gaps(input_data)
```

**Step 5: Run test to verify it passes**

Run: `pytest backend/app/services/gap_analysis/tests/test_gap_analysis.py -v`
Expected: PASS

**Step 6: Integrate router in main.py**

```python
# backend/app/main.py
from fastapi import FastAPI
from backend.app.services.gap_analysis.router import router as gap_analysis_router

app = FastAPI(title="SIH 2026 - Main API")

app.include_router(gap_analysis_router, prefix="/api")
```

**Step 7: Run full tests to verify**

Run: `pytest backend/app/services/gap_analysis/tests/test_gap_analysis.py -v`
Expected: PASS

**Step 8: Commit**

```bash
git add backend/app/services/gap_analysis/ backend/app/main.py
git commit -m "feat(gap): implement gap analysis engine logic and router"
```
