import os
import sqlite3
import tempfile
from datetime import UTC, datetime

from backend.app.services.profile.logic import build_profile, compute_initial_levels
from backend.app.shared.schemas import (
    Domain,
    PastTraining,
    ProfileInput,
    ProfileOutput,
    SkillLevel,
)


def test_compute_initial_levels_beginner():
    # 1 year experience, no keyword bumps
    input_data = ProfileInput(
        role='Clerk',
        dept='Admin',
        education='B.A. History',
        experience_years=1,
        past_trainings=[],
    )
    levels = compute_initial_levels(input_data)

    # 4 domains must be present
    assert set(levels.keys()) == set(Domain)
    # 0-2 years base level is BASIC (1)
    for domain in Domain:
        assert levels[domain] == SkillLevel.BASIC


def test_compute_initial_levels_with_bumps():
    # 3 years experience (WORKING=2 base)
    # education has "Statistics" -> bumps STATISTICAL_METHODS
    # past_trainings has "Basic Python" -> bumps DIGITAL_TOOLS
    input_data = ProfileInput(
        role='Analyst',
        dept='Statistics',
        education='M.Sc. Statistics',
        experience_years=3,
        past_trainings=[PastTraining(course_name='Basic Python', completed_at=datetime.now(UTC))],
    )
    levels = compute_initial_levels(input_data)

    assert levels[Domain.STATISTICAL_METHODS] == SkillLevel.PROFICIENT  # 2 + 1 = 3
    assert levels[Domain.DIGITAL_TOOLS] == SkillLevel.PROFICIENT  # 2 + 1 = 3
    assert levels[Domain.DATA_MANAGEMENT] == SkillLevel.WORKING  # 2
    assert levels[Domain.DOMAIN_KNOWLEDGE] == SkillLevel.WORKING  # 2


def test_compute_initial_levels_multi_domain_bump():
    input_data = ProfileInput(
        role='Senior Statistical Officer',
        dept='Data Analytics',
        education='Ph.D. in Econometrics and Mathematics',
        experience_years=6,
        past_trainings=[
            PastTraining(
                course_name='Advanced SQL & Data Governance',
                completed_at=datetime.now(UTC),
            ),
            PastTraining(
                course_name='Python for Data Science & Tableau',
                completed_at=datetime.now(UTC),
            ),
            PastTraining(
                course_name='Public Policy and Administration',
                completed_at=datetime.now(UTC),
            ),
        ],
    )
    levels = compute_initial_levels(input_data)
    # Base for >5 years is PROFICIENT (3), each domain should bump +1 to EXPERT (4)
    assert set(levels.keys()) == set(Domain)
    assert levels[Domain.STATISTICAL_METHODS] == SkillLevel.EXPERT
    assert levels[Domain.DATA_MANAGEMENT] == SkillLevel.EXPERT
    assert levels[Domain.DOMAIN_KNOWLEDGE] == SkillLevel.EXPERT
    assert levels[Domain.DIGITAL_TOOLS] == SkillLevel.EXPERT


def test_build_profile_storage_and_graph():
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = os.path.join(tmpdir, 'test.db')
        graph_path = os.path.join(tmpdir, 'test_graph.gpickle')

        input_data = ProfileInput(
            role='Analyst',
            dept='Statistics',
            education='M.Sc. Statistics',
            experience_years=3,
            past_trainings=[
                PastTraining(course_name='Basic Python', completed_at=datetime.now(UTC))
            ],
        )

        output = build_profile(input_data, db_path=db_path, graph_path=graph_path)

        # Verify ProfileOutput shape and types
        assert isinstance(output, ProfileOutput)
        assert isinstance(output.official_id, str) and len(output.official_id) > 0
        assert output.profile_stored is True
        assert output.graph_node_added is True
        assert set(output.initial_levels.keys()) == set(Domain)

        # Check SQLite DB
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute(
            'SELECT official_id, role, dept, education, experience_years, past_trainings FROM officials WHERE official_id = ?',
            (output.official_id,),
        )
        row = cursor.fetchone()
        conn.close()

        assert row is not None
        assert row[0] == output.official_id
        assert row[1] == 'Analyst'
        assert row[2] == 'Statistics'
        assert row[3] == 'M.Sc. Statistics'
        assert row[4] == 3

        # Check NetworkX Graph persistence
        assert os.path.exists(graph_path)
        import pickle

        with open(graph_path, 'rb') as f:
            graph = pickle.load(f)

        assert output.official_id in graph.nodes
        node_data = graph.nodes[output.official_id]
        assert node_data['role'] == 'Analyst'
        assert node_data['dept'] == 'Statistics'
        assert (
            node_data[Domain.STATISTICAL_METHODS]
            == output.initial_levels[Domain.STATISTICAL_METHODS].value
        )
