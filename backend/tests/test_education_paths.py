import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

def test_list_available_education_pathways(client: TestClient, db: Session):
    response = client.get("/api/education-paths")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["count"] >= 14
    items = data["data"]
    assert any(item["slug"] == "data-scientist" for item in items)
    assert any(item["slug"] == "ev-systems-engineer" for item in items)

def test_get_data_scientist_education_pathway(client: TestClient, db: Session):
    response = client.get("/api/education-paths/data-scientist")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    pathway = data["data"]

    # Verify root attributes
    assert pathway["career_slug"] == "data-scientist"
    assert pathway["career_title"] == "Data Scientist"
    assert pathway["salary_range_min"] > 0
    assert pathway["salary_range_max"] >= pathway["salary_range_min"]

    # Verify 5 structured milestones
    assert len(pathway["all_milestones"]) == 5
    m1 = pathway["school_preparation"]
    assert m1["step_number"] == 1
    assert "Physics" in m1["title"] or "Class" in m1["title"]
    assert len(m1["tags"]) > 0

    m2 = pathway["undergraduate_milestone"]
    assert m2["step_number"] == 2
    assert len(pathway["degrees"]) >= 1
    degree = pathway["degrees"][0]
    assert "name" in degree
    assert "duration_years" in degree
    assert degree["duration_years"] >= 3.0

    m3 = pathway["skill_milestone"]
    assert m3["step_number"] == 3
    assert len(pathway["skills"]) >= 2
    skill = pathway["skills"][0]
    assert "name" in skill
    assert "importance_weight" in skill

    m4 = pathway["career_launch_milestone"]
    assert m4["step_number"] == 4
    assert "CTC" in m4["subtitle"]

    m5 = pathway["higher_studies_milestone"]
    assert m5["step_number"] == 5
    assert len(pathway["higher_studies_options"]) > 0

def test_get_invalid_education_pathway(client: TestClient, db: Session):
    response = client.get("/api/education-paths/non-existent-career-xyz")
    assert response.status_code == 404
    data = response.json()
    assert data["success"] is False
