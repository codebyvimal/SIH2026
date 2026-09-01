from __future__ import annotations

import json
import os
import pickle
import sqlite3
from uuid import uuid4

import networkx as nx

from backend.app.shared.schemas import (
    Domain,
    ProfileInput,
    ProfileOutput,
    SkillLevel,
)

# Default database and graph storage paths
DEFAULT_DB_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), '../../../../data/dummy/app.db')
)
DEFAULT_GRAPH_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), '../../../../data/dummy/graph.gpickle')
)

# Domain keyword matching rules
DOMAIN_KEYWORDS = {
    Domain.STATISTICAL_METHODS: [
        'statistic',
        'inference',
        'probability',
        'econometric',
        'mathematics',
        'math ',
    ],
    Domain.DATA_MANAGEMENT: [
        'sql',
        'database',
        'data management',
        'etl',
        'warehouse',
        'data governance',
    ],
    Domain.DOMAIN_KNOWLEDGE: [
        'public policy',
        'governance',
        'public administration',
        'economics',
        'domain knowledge',
    ],
    Domain.DIGITAL_TOOLS: [
        'python',
        'excel',
        ' r ',
        'r programming',
        'tableau',
        'power bi',
        'software',
        'programming',
        'digital tool',
    ],
}


def compute_initial_levels(input_data: ProfileInput) -> dict[Domain, SkillLevel]:
    """
    Computes initial skill levels for the 4 competency domains:
    1. Base level from experience_years:
       - 0 to 2 years: BASIC (1)
       - >2 to 5 years: WORKING (2)
       - >5 years: PROFICIENT (3)
    2. Bumps level (+1, capped at EXPERT=4) if keywords appear in education or past_trainings.
    """
    # 1. Base level calculation
    if input_data.experience_years <= 2:
        base_level_val = SkillLevel.BASIC.value
    elif input_data.experience_years <= 5:
        base_level_val = SkillLevel.WORKING.value
    else:
        base_level_val = SkillLevel.PROFICIENT.value

    # Aggregate text for keyword checking
    search_text = (input_data.education or '').lower() + ' '
    for pt in input_data.past_trainings:
        search_text += (pt.course_name or '').lower() + ' '

    initial_levels: dict[Domain, SkillLevel] = {}

    for domain in Domain:
        level_val = base_level_val
        keywords = DOMAIN_KEYWORDS.get(domain, [])
        if any(keyword in search_text for keyword in keywords):
            level_val = min(level_val + 1, SkillLevel.EXPERT.value)
        initial_levels[domain] = SkillLevel(level_val)

    return initial_levels


def init_db(db_path: str = DEFAULT_DB_PATH) -> None:
    """Ensures the SQLite officials table exists."""
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    try:
        with conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS officials (
                    official_id TEXT PRIMARY KEY,
                    role TEXT NOT NULL,
                    dept TEXT NOT NULL,
                    education TEXT NOT NULL,
                    experience_years INTEGER NOT NULL,
                    past_trainings TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
    finally:
        conn.close()


import logging
from datetime import UTC

logger = logging.getLogger(__name__)


def load_or_create_graph(graph_path: str = DEFAULT_GRAPH_PATH) -> nx.Graph:
    """Loads existing NetworkX graph from pickle file or creates a new one."""
    if os.path.exists(graph_path):
        try:
            with open(graph_path, 'rb') as f:
                graph = pickle.load(f)
                if isinstance(graph, nx.Graph):
                    return graph
        except (pickle.PickleError, EOFError, OSError, TypeError, ValueError) as exc:
            logger.warning('Failed to load graph from %s: %s', graph_path, exc)
    return nx.Graph()


def save_graph(graph: nx.Graph, graph_path: str = DEFAULT_GRAPH_PATH) -> None:
    """Persists the NetworkX graph to disk."""
    os.makedirs(os.path.dirname(graph_path), exist_ok=True)
    with open(graph_path, 'wb') as f:
        pickle.dump(graph, f)


def build_profile(
    input_data: ProfileInput,
    db_path: str = DEFAULT_DB_PATH,
    graph_path: str = DEFAULT_GRAPH_PATH,
) -> ProfileOutput:
    """
    Builds official profile:
    1. Generates official_id (UUID).
    2. Computes initial_levels for all 4 domains.
    3. Stores profile in SQLite officials table.
    4. Adds official node to NetworkX graph and persists to disk.
    5. Returns ProfileOutput.
    """
    official_id = str(uuid4())
    initial_levels = compute_initial_levels(input_data)

    profile_stored = False
    graph_node_added = False

    # 3. Insert row into SQLite
    try:
        init_db(db_path)
        conn = sqlite3.connect(db_path)
        past_trainings_json = json.dumps(
            [pt.model_dump(mode='json') for pt in input_data.past_trainings]
        )
        with conn:
            conn.execute(
                """
                INSERT INTO officials (official_id, role, dept, education, experience_years, past_trainings)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    official_id,
                    input_data.role,
                    input_data.dept,
                    input_data.education,
                    input_data.experience_years,
                    past_trainings_json,
                ),
            )
        conn.close()
        profile_stored = True
    except (sqlite3.Error, OSError, TypeError, ValueError) as exc:
        logger.warning('Failed to store profile to SQLite: %s', exc)
        profile_stored = False

    # 4 & 5. NetworkX graph node addition and persistence
    try:
        graph = load_or_create_graph(graph_path)
        node_attrs = {
            'role': input_data.role,
            'dept': input_data.dept,
            'education': input_data.education,
            'experience_years': input_data.experience_years,
            **{domain: level.value for domain, level in initial_levels.items()},
        }
        graph.add_node(official_id, **node_attrs)
        save_graph(graph, graph_path)
        graph_node_added = True
    except (pickle.PickleError, OSError, TypeError, ValueError) as exc:
        logger.warning('Failed to add node to graph: %s', exc)
        graph_node_added = False

    return ProfileOutput(
        official_id=official_id,
        profile_stored=profile_stored,
        graph_node_added=graph_node_added,
        initial_levels=initial_levels,
    )


if __name__ == '__main__':
    from datetime import datetime

    from backend.app.shared.schemas import PastTraining

    sample_input = ProfileInput(
        role='Analyst',
        dept='Statistics',
        education='M.Sc. Statistics',
        experience_years=3,
        past_trainings=[PastTraining(course_name='Basic Python', completed_at=datetime.now(UTC))],
    )
    result = build_profile(sample_input)
    print('Standalone test result:')
    print(result.model_dump_json(indent=2))
