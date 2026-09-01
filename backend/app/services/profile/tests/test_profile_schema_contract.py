import json
import os
import tempfile

from backend.app.services.profile.logic import build_profile
from backend.app.shared.schemas import Domain, ProfileInput, ProfileOutput, SkillLevel


def test_contract_with_dummy_profiles():
    dummy_profiles_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), '../../../../../data/dummy/profiles.json')
    )
    assert os.path.exists(dummy_profiles_path), f'File {dummy_profiles_path} does not exist'

    with open(dummy_profiles_path, 'r') as f:
        profiles_data = json.load(f)

    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = os.path.join(tmpdir, 'test.db')
        graph_path = os.path.join(tmpdir, 'test_graph.gpickle')

        for item in profiles_data:
            profile_input = ProfileInput.model_validate(item)
            output = build_profile(profile_input, db_path=db_path, graph_path=graph_path)

            # Strict Pydantic model validation
            assert isinstance(output, ProfileOutput)
            assert (
                isinstance(output.official_id, str) and len(output.official_id) == 36
            )  # UUID standard length
            assert output.profile_stored is True
            assert output.graph_node_added is True

            # Must contain all 4 domains exactly
            assert len(output.initial_levels) == 4
            for domain in Domain:
                assert domain in output.initial_levels
                assert isinstance(output.initial_levels[domain], SkillLevel)
                assert 0 <= output.initial_levels[domain].value <= 4
