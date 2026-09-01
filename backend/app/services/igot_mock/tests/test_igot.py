"""Tests for System 4 — iGOT Integration Layer (mock)."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.app.services.igot_mock.router import router

app = FastAPI()
app.include_router(router)
client = TestClient(app)


def test_list_courses_returns_list():
    resp = client.get('/igot/courses')
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) > 0
    # Verify schema shape
    first = data[0]
    assert 'course_id' in first
    assert 'title' in first
    assert 'provider' in first
    assert 'duration_hours' in first


def test_enroll_returns_enrollment_id():
    resp = client.post(
        '/igot/enroll',
        json={'official_id': 'off-001', 'course_id': 'course-igot-101'},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert 'enrollment_id' in data
    assert data['status'] == 'enrolled'


def test_completion_after_enroll():
    # Enroll first to get an enrollment_id
    enroll_resp = client.post(
        '/igot/enroll',
        json={'official_id': 'off-002', 'course_id': 'course-nssta-01'},
    )
    eid = enroll_resp.json()['enrollment_id']

    resp = client.get(f'/igot/completion/{eid}')
    assert resp.status_code == 200
    data = resp.json()
    assert data['enrollment_id'] == eid
    assert data['completed'] is False  # always incomplete in demo


def test_completion_unknown_enrollment():
    resp = client.get('/igot/completion/doesnotexist')
    assert resp.status_code == 404
