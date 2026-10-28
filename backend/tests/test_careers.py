import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

def test_list_careers(client: TestClient, db: Session):
    response = client.get("/api/careers")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["count"] >= 14
    careers = data["data"]

    # Verify attributes of the first career
    c = careers[0]
    assert "id" in c
    assert "title" in c
    assert "slug" in c
    assert "cluster" in c
    assert "industry" in c
    assert "salary_range_min" in c
    assert "salary_range_max" in c
    assert "tamil_nadu_demand" in c
    assert "key_skills" in c
    assert isinstance(c["key_skills"], list)

def test_search_and_filter_careers(client: TestClient, db: Session):
    # Search for "data"
    search_res = client.get("/api/careers?search=data")
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert search_data["count"] >= 1
    titles = [c["title"].lower() for c in search_data["data"]]
    assert any("data" in t for t in titles)

    # Filter by industry
    ind_res = client.get("/api/careers?industry=Manufacturing %26 Robotics")
    assert ind_res.status_code == 200
    ind_data = ind_res.json()
    assert ind_data["count"] >= 2
    for c in ind_data["data"]:
        assert c["industry"] == "Manufacturing & Robotics"

def test_get_career_details_and_relationships(client: TestClient, db: Session):
    response = client.get("/api/careers/data-scientist")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    career = data["data"]

    assert career["slug"] == "data-scientist"
    assert career["title"] == "Data Scientist"
    assert "overview" in career
    assert "typical_pathway" in career
    assert len(career["skills"]) >= 3
    assert len(career["courses"]) >= 1

    # Verify skill details
    skill1 = career["skills"][0]
    assert "name" in skill1
    assert "category" in skill1
    assert "importance_weight" in skill1

    # Verify course details with exams
    course1 = career["courses"][0]
    assert "name" in course1
    assert "degree_level" in course1
    assert "duration_years" in course1
    assert "exams" in course1

def test_get_nonexistent_career(client: TestClient, db: Session):
    response = client.get("/api/careers/quantum-teleporter-operator")
    assert response.status_code == 404

def test_career_meta_taxonomies(client: TestClient, db: Session):
    # Skills
    skills_res = client.get("/api/careers/meta/skills")
    assert skills_res.status_code == 200
    skills_data = skills_res.json()
    assert skills_data["count"] >= 15
    skill_names = [s["name"] for s in skills_data["data"]]
    assert "Python" in skill_names
    assert "Machine Learning" in skill_names

    # Courses
    courses_res = client.get("/api/careers/meta/courses")
    assert courses_res.status_code == 200
    courses_data = courses_res.json()
    assert courses_data["count"] >= 8
    course_codes = [c["short_code"] for c in courses_data["data"]]
    assert "B.Tech AI & DS" in course_codes

    # Exams
    exams_res = client.get("/api/careers/meta/exams")
    assert exams_res.status_code == 200
    exams_data = exams_res.json()
    assert exams_data["count"] >= 5
    exam_codes = [e["short_code"] for e in exams_data["data"]]
    assert "TNEA" in exam_codes
    assert "JEE Main" in exam_codes
