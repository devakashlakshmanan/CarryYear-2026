import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.db.models.user import User
from app.db.models.student_profile import StudentProfile
from app.core.security import get_password_hash, create_access_token

def setup_college_test_user(db: Session, email="college_tester@carryyear.in"):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            password_hash=get_password_hash("Password123!"),
            name="College Test Student",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not profile:
        profile = StudentProfile(
            user_id=user.id,
            state="Tamil Nadu",
            district="Chennai",
            current_education_level="Class 12",
            stream="Computer Science & Maths",
            percentage_or_cgpa=96.0,
            subject_marks={
                "Mathematics": 98,
                "Physics": 96,
                "Chemistry": 94
            },
            max_education_budget=100000,
            onboarding_completed=True
        )
        db.add(profile)
        db.commit()

    token = create_access_token(subject=user.id)
    return user, {"Authorization": f"Bearer {token}"}

def test_list_tamil_nadu_colleges(client: TestClient, db: Session):
    response = client.get("/api/colleges")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["count"] >= 10
    colleges = data["data"]

    first_col = colleges[0]
    assert "name" in first_col
    assert "district" in first_col
    assert "category" in first_col
    assert "tuition_fee_annual" in first_col
    assert "average_placement_ctc" in first_col

def test_filter_colleges_by_district_and_search(client: TestClient, db: Session):
    # District filter
    res = client.get("/api/colleges?district=Coimbatore")
    assert res.status_code == 200
    c_data = res.json()["data"]
    assert len(c_data) >= 3
    assert all(c["district"] == "Coimbatore" for c in c_data)

    # Search query
    search_res = client.get("/api/colleges?search=ceg")
    assert search_res.status_code == 200
    s_data = search_res.json()["data"]
    assert len(s_data) >= 1
    assert "Guindy" in s_data[0]["name"] or "CEG" in s_data[0]["name"]

def test_get_college_districts_meta(client: TestClient, db: Session):
    res = client.get("/api/colleges/meta/districts")
    assert res.status_code == 200
    districts = res.json()["data"]
    assert "Chennai" in districts
    assert "Coimbatore" in districts

def test_get_college_details_and_cutoffs(client: TestClient, db: Session):
    res = client.get("/api/colleges/anna-univ-ceg")
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    college = body["data"]

    assert college["slug"] == "anna-univ-ceg"
    assert college["tnea_code"] == "0001"
    assert len(college["offered_courses"]) >= 3
    c1 = college["offered_courses"][0]
    assert "cutoff_marks_oc" in c1
    assert c1["cutoff_marks_oc"] >= 190.0

def test_college_matching_engine(client: TestClient, db: Session):
    user, headers = setup_college_test_user(db)

    # Cut-off calculation for student: Maths(98) + Physics(96)/2 + Chemistry(94)/2 = 98 + 48 + 47 = 193.0
    res = client.get("/api/colleges/match?quota=OC", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    result = data["data"]

    assert result["student_cutoff"] == 193.0
    assert result["student_quota"] == "OC"
    assert result["total_matches"] > 0
    assert len(result["reach_colleges"]) + len(result["target_colleges"]) + len(result["safe_colleges"]) == result["total_matches"]

    # Test custom cutoff simulation
    sim_res = client.get("/api/colleges/match?custom_cutoff=198.5&quota=BC", headers=headers)
    assert sim_res.status_code == 200
    sim_data = sim_res.json()["data"]
    assert sim_data["student_cutoff"] == 198.5
    assert sim_data["student_quota"] == "BC"
    assert len(sim_data["safe_colleges"]) > 0
