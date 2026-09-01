import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from backend.app.services.gap_analysis.router import router

app = FastAPI()
app.include_router(router)
client = TestClient(app)

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
