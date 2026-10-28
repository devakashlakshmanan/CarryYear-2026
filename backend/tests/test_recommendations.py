import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.db.models.user import User
from app.db.models.student_profile import StudentProfile
from app.core.security import get_password_hash, create_access_token

def setup_recommendation_student(db: Session, email="rec_tester@carryyear.in"):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            password_hash=get_password_hash("ValidPass123"),
            name="Recommendation Student",
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
            percentage_or_cgpa=95.0,
            subject_marks={
                "Mathematics": 99,
                "Physics": 94,
                "Computer Science": 98
            },
            skills=[
                {"name": "Python", "level": 90},
                {"name": "SQL & Relational Databases", "level": 80}
            ],
            interests=["Technology", "Science"],
            target_career="Data Scientist",
            max_education_budget=150000,
            onboarding_completed=True
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    token = create_access_token(subject=user.id)
    return user, token

def test_recommendations_unauthorized(client: TestClient):
    response = client.get("/api/recommendations")
    assert response.status_code == 401

def test_recommendations_generation_and_scoring(client: TestClient, db: Session):
    user, token = setup_recommendation_student(db)
    headers = {"Authorization": f"Bearer {token}"}

    # Submit assessment so aptitude/interest dimensions are populated
    q_resp = client.get("/api/assessment/questions")
    questions = q_resp.json()["data"]
    answers = [
        {"question_id": q["id"], "selected_option_index": 1 if q["question_type"] == "aptitude" else 4}
        for q in questions
    ]
    sub_resp = client.post("/api/assessment/submit", headers=headers, json={"answers": answers})
    assert sub_resp.status_code == 200

    # Fetch recommendations
    response = client.get("/api/recommendations", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    res = data["data"]

    assert res["total_evaluated"] >= 10
    recs = res["recommendations"]
    assert len(recs) >= 10

    # Verify descending sort order
    scores = [r["match_score"] for r in recs]
    assert scores == sorted(scores, reverse=True)

    # Top recommendation should have high match
    top = recs[0]
    assert top["match_score"] >= 80.0
    assert top["match_tier"] in ["High Match", "Moderate Match"]

    # Verify factor breakdown
    factors = top["factors"]
    assert 0.0 <= factors["academic_fit"] <= 100.0
    assert 0.0 <= factors["aptitude_fit"] <= 100.0
    assert 0.0 <= factors["interest_alignment"] <= 100.0
    assert 0.0 <= factors["skill_match"] <= 100.0
    assert 0.0 <= factors["financial_feasibility"] <= 100.0
    assert 0.0 <= factors["location_fit"] <= 100.0

    # Verify skills comparison
    assert isinstance(top["matching_skills"], list)
    assert isinstance(top["skill_gaps"], list)
    assert "explanation" in top
    assert len(top["explanation"]) > 20

    # Test filtering by industry
    filter_resp = client.get("/api/recommendations?industry=Manufacturing %26 Robotics", headers=headers)
    assert filter_resp.status_code == 200
    filter_data = filter_resp.json()["data"]["recommendations"]
    for r in filter_data:
        assert r["industry"] == "Manufacturing & Robotics"

    # Test filtering by minimum score
    min_resp = client.get("/api/recommendations?min_score=85.0", headers=headers)
    assert min_resp.status_code == 200
    min_data = min_resp.json()["data"]["recommendations"]
    for r in min_data:
        assert r["match_score"] >= 85.0
