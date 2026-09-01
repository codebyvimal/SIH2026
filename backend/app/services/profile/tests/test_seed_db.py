import os
import pickle
import sqlite3
import tempfile

from scripts.seed_db import seed_profiles_to_db_and_graph


def test_seed_profiles_to_db_and_graph():
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = os.path.join(tmpdir, 'test.db')
        graph_path = os.path.join(tmpdir, 'test_graph.gpickle')
        profiles_file = os.path.abspath('data/dummy/profiles.json')

        count = seed_profiles_to_db_and_graph(profiles_file, db_path, graph_path)
        assert count > 0

        # Verify SQLite DB
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) FROM officials')
        assert cursor.fetchone()[0] == count
        cursor.execute('SELECT official_id, role, dept FROM officials')
        official_row = cursor.fetchone()
        assert official_row[0] == '123e4567-e89b-12d3-a456-426614174000'
        assert official_row[1] == 'Analyst'
        assert official_row[2] == 'Statistics'
        conn.close()

        # Verify NetworkX Graph
        with open(graph_path, 'rb') as f:
            graph = pickle.load(f)
        assert len(graph.nodes) == count
        assert '123e4567-e89b-12d3-a456-426614174000' in graph.nodes
