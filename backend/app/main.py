"""SIH 2026 — Career Path & Skill Development Platform API entry point.

This is the single integration point that mounts all service routers.
Each service is self-contained under backend/app/services/<name>/.
"""

from __future__ import annotations

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()  # loads .env at startup so GEMINI_API_KEY is available everywhere

from backend.app.services.assessment.router import router as assessment_router
from backend.app.services.gap_analysis.router import router as gap_analysis_router
from backend.app.services.grading.router import router as grading_router
from backend.app.services.igot_mock.router import router as igot_router
from backend.app.services.profile.router import router as profile_router
from backend.app.services.recommendation.router import router as recommendation_router

app = FastAPI(
    title='SIH 2026 — Career Path & Skill Development Platform',
    version='0.1.0',
    description='Hackathon demo — 8 integrated systems for government official skill development.',
)

# Allow the Next.js dev server (port 3000) to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# ------------------------------------------------------------------
# Mount service routers under standardized /api/v1 prefix
# ------------------------------------------------------------------
API_V1_PREFIX = '/api/v1'

app.include_router(profile_router, prefix=API_V1_PREFIX)
app.include_router(gap_analysis_router, prefix=API_V1_PREFIX)
app.include_router(recommendation_router, prefix=API_V1_PREFIX)
app.include_router(assessment_router, prefix=API_V1_PREFIX)
app.include_router(grading_router, prefix=API_V1_PREFIX)
app.include_router(igot_router, prefix=API_V1_PREFIX)


# ------------------------------------------------------------------
# Orchestration / Dashboard Endpoints (System 7 & 8 integration)
# ------------------------------------------------------------------
from collections import defaultdict

from fastapi import HTTPException

from backend.app.services.gap_analysis.logic import calculate_gaps
from backend.app.services.grading.logic import get_latest_grading_for_official
from backend.app.services.profile.logic import list_profiles
from backend.app.services.recommendation.logic import COURSES, _get_index, semantic_search
from backend.app.shared.schemas import (
    AdminDashboard,
    Domain,
    DomainAggregate,
    EmployeeDashboard,
    GapAnalysisInput,
    RecommendedCourse,
)


@app.get(f'{API_V1_PREFIX}/admin/dashboard', response_model=AdminDashboard)
@app.get(f'{API_V1_PREFIX}/dashboard/admin', response_model=AdminDashboard)
def get_admin_dashboard() -> AdminDashboard:
    """Calculates live aggregated competency metrics across all officials in SQLite."""
    profiles = list_profiles()
    total_officials = len(profiles)

    domain_gaps: dict[Domain, list[int]] = defaultdict(list)
    domain_below_target: dict[Domain, int] = defaultdict(int)
    course_counts: dict[str, int] = defaultdict(int)
    index = _get_index()

    for p in profiles:
        oid = p['official_id']
        role = p['role']
        gap_res = calculate_gaps(GapAnalysisInput(official_id=oid, role=role))
        for g in gap_res.gaps:
            domain_gaps[g.domain].append(g.gap)
            if g.gap > 0:
                domain_below_target[g.domain] += 1
                matches = semantic_search(g.skill, index, COURSES, top_k=2)
                for c, _ in matches:
                    course_counts[c.title] += 1

    aggregates = []
    for domain in Domain:
        gaps = domain_gaps[domain]
        avg_gap = round(sum(gaps) / len(gaps), 2) if gaps else 0.0
        below_count = domain_below_target[domain]
        aggregates.append(
            DomainAggregate(
                domain=domain,
                avg_gap=avg_gap,
                officials_below_target=below_count,
            )
        )

    top_courses = [
        title for title, _ in sorted(course_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    ]
    if not top_courses:
        top_courses = [c.title for c in COURSES[:3]]

    return AdminDashboard(
        total_officials=total_officials,
        domain_aggregates=aggregates,
        top_recommended_courses=top_courses,
    )


@app.get(f'{API_V1_PREFIX}/dashboard/employee/{{official_id}}', response_model=EmployeeDashboard)
@app.get(f'{API_V1_PREFIX}/dashboard/employee', response_model=EmployeeDashboard)
@app.get(f'{API_V1_PREFIX}/profiles', response_model=EmployeeDashboard)
def get_employee_dashboard(official_id: str | None = None) -> EmployeeDashboard:
    """Dynamically integrates System 1, 2, 3, and 6 for a specific official."""
    profiles = list_profiles()
    if not profiles:
        raise HTTPException(status_code=404, detail='No officials found in database')

    target_profile = None
    if official_id:
        for p in profiles:
            if p['official_id'] == official_id:
                target_profile = p
                break

    if not target_profile:
        target_profile = profiles[0]

    oid = target_profile['official_id']
    role = target_profile['role']

    gap_res = calculate_gaps(GapAnalysisInput(official_id=oid, role=role))

    index = _get_index()
    recommended: list[RecommendedCourse] = []
    seen_courses: set[str] = set()

    sorted_gaps = sorted(gap_res.gaps, key=lambda x: x.gap, reverse=True)
    for g in sorted_gaps:
        if g.gap > 0:
            matches = semantic_search(g.skill, index, COURSES, top_k=2)
            for c, score in matches:
                if c.course_id not in seen_courses:
                    seen_courses.add(c.course_id)
                    recommended.append(
                        RecommendedCourse(
                            course=c.title,
                            course_id=c.course_id,
                            relevance=round(score, 2),
                            why=f'Directly addresses your skill gap in {g.skill} ({g.domain.value.replace("_", " ").title()}).',
                            duration_hours=c.duration_hours,
                        )
                    )
        if len(recommended) >= 4:
            break

    if not recommended:
        for c in COURSES[:4]:
            recommended.append(
                RecommendedCourse(
                    course=c.title,
                    course_id=c.course_id,
                    relevance=0.85,
                    why='Core recommended professional development course.',
                    duration_hours=c.duration_hours,
                )
            )

    latest_grading = get_latest_grading_for_official(oid)

    return EmployeeDashboard(
        official_id=oid,
        gaps=gap_res.gaps,
        recommended=recommended,
        latest_grading=latest_grading,
    )


@app.get(f'{API_V1_PREFIX}/officials', response_model=list[dict])
def list_officials_summary() -> list[dict]:
    """Returns official directory from SQLite for UI selection."""
    profiles = list_profiles()
    return [
        {
            'official_id': p['official_id'],
            'role': p['role'],
            'dept': p['dept'],
            'experience_years': p['experience_years'],
            'education': p['education'],
        }
        for p in profiles
    ]
