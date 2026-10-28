import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.db.models.user import User
from app.db.models.student_profile import StudentProfile
from app.core.security import get_password_hash, create_access_token

def create_dna_test_user_and_profile(db: Session, email="dna_tester@carryyear.in"):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            password_hash=get_password_hash("ValidPass123"),
            name="DNA Student",
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
            district="Coimbatore",
            current_education_level="Class 12",
            stream="Computer Science & Maths",
            percentage_or_cgpa=94.5,
            subject_marks={
                "Mathematics": 98,
                "Physics": 92,
                "Chemistry": 90,
                "Computer Science": 99
            },
            skills=[
                {"name": "Python", "level": 85},
                {"name": "Problem Solving", "level": 90}
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

def test_career_dna_unauthorized(client: TestClient):
    get_res = client.get("/api/career-dna")
    assert get_res.status_code == 401

    post_res = client.post("/api/career-dna/generate")
    assert post_res.status_code == 401

def test_career_dna_synthesis_and_persistence(client: TestClient, db: Session):
    user, token = create_dna_test_user_and_profile(db)
    headers = {"Authorization": f"Bearer {token}"}

    # First submit an assessment so Career DNA has cognitive data to fuse
    q_resp = client.get("/api/assessment/questions")
    questions = q_resp.json()["data"]
    answers = [
        {"question_id": q["id"], "selected_option_index": 1 if q["question_type"] == "aptitude" else 4}
        for q in questions
    ]
    sub_resp = client.post("/api/assessment/submit", headers=headers, json={"answers": answers})
    assert sub_resp.status_code == 200

    # Generate Career DNA
    dna_gen = client.post("/api/career-dna/generate", headers=headers)
    assert dna_gen.status_code == 200
    gen_data = dna_gen.json()
    assert gen_data["success"] is True
    dna = gen_data["data"]

    # Verify traits
    assert "traits" in dna
    assert len(dna["traits"]) == 8
    for trait in dna["traits"]:
        assert 0.0 <= trait["score"] <= 100.0
        assert trait["rating"] in ["Advanced", "Proficient", "Developing"]
        assert len(trait["description"]) > 10

    # Verify dominant cluster and confidence score
    assert "dominant_cluster" in dna
    assert len(dna["dominant_cluster"]) > 0
    assert dna["confidence_score"] >= 75.0

    # Verify explainability factors
    assert "why_this_profile" in dna
    assert len(dna["why_this_profile"]) > 20
    assert "explanatory_factors" in dna
    assert len(dna["explanatory_factors"]) >= 3
    for factor in dna["explanatory_factors"]:
        assert "source" in factor
        assert "factor" in factor
        assert "impact" in factor
        assert factor["weight"] in ["High", "Moderate", "Secondary"]

    # Test GET /api/career-dna retrieval
    get_dna = client.get("/api/career-dna", headers=headers)
    assert get_dna.status_code == 200
    retrieved = get_dna.json()["data"]
    assert retrieved is not None
    assert retrieved["id"] == dna["id"]
    assert retrieved["dominant_cluster"] == dna["dominant_cluster"]
    assert len(retrieved["traits"]) == 8
