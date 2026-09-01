"""Shared pytest fixtures for backend tests.

Add project-wide fixtures here so individual service test suites can reuse them.
"""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

# Ensure the project root is on sys.path so `backend.app.*` imports work
# regardless of how pytest is invoked.
_PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))


@pytest.fixture()
def sample_pdf_bytes() -> bytes:
    """Return the raw bytes of the sample stats PDF fixture."""
    pdf_path = _PROJECT_ROOT / "data" / "dummy" / "sample_pdfs" / "sample_stats.pdf"
    return pdf_path.read_bytes()
