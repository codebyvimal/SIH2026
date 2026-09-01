from __future__ import annotations

import json
import os
import sqlite3
import sys

# Ensure repository root is on sys.path
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)


from backend.app.services.profile.logic import (
    DEFAULT_DB_PATH,
    DEFAULT_GRAPH_PATH,
    compute_initial_levels,
    init_db,
    load_or_create_graph,
    save_graph,
)
from backend.app.shared.schemas import PastTraining, ProfileInput

DEFAULT_PROFILES_FILE = os.path.join(REPO_ROOT, 'data', 'dummy', 'profiles.json')


def seed_profiles_to_db_and_graph(
    profiles_file: str = DEFAULT_PROFILES_FILE,
    db_path: str = DEFAULT_DB_PATH,
    graph_path: str = DEFAULT_GRAPH_PATH,
) -> int:
    """
    Loads profiles from profiles.json and persists them into:
    1. SQLite officials table at db_path
    2. NetworkX graph at graph_path
    Returns the count of seeded profiles.
    """
    if not os.path.exists(profiles_file):
        raise FileNotFoundError(f'Profiles file not found: {profiles_file}')

    with open(profiles_file, 'r', encoding='utf-8') as f:
        profiles_raw = json.load(f)

    init_db(db_path)
    conn = sqlite3.connect(db_path)
    graph = load_or_create_graph(graph_path)

    seeded_count = 0
    try:
        with conn:
            for item in profiles_raw:
                official_id = item['official_id']
                past_trainings = [PastTraining(**pt) for pt in item.get('past_trainings', [])]
                profile_input = ProfileInput(
                    role=item['role'],
                    dept=item['dept'],
                    education=item['education'],
                    experience_years=item['experience_years'],
                    past_trainings=past_trainings,
                )
                initial_levels = compute_initial_levels(profile_input)

                # Persist to SQLite
                conn.execute(
                    """
                    INSERT OR REPLACE INTO officials (official_id, role, dept, education, experience_years, past_trainings)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        official_id,
                        profile_input.role,
                        profile_input.dept,
                        profile_input.education,
                        profile_input.experience_years,
                        json.dumps([pt.model_dump(mode='json') for pt in past_trainings]),
                    ),
                )

                # Add to NetworkX Graph
                node_attrs = {
                    'role': profile_input.role,
                    'dept': profile_input.dept,
                    'education': profile_input.education,
                    'experience_years': profile_input.experience_years,
                    **{domain: level.value for domain, level in initial_levels.items()},
                }
                graph.add_node(official_id, **node_attrs)
                seeded_count += 1

        save_graph(graph, graph_path)
    finally:
        conn.close()

    return seeded_count


if __name__ == '__main__':
    count = seed_profiles_to_db_and_graph()
    print(f'Successfully seeded {count} profiles into SQLite and NetworkX graph.')
