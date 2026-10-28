import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.db.models.user import User
from app.db.models.student_profile import StudentProfile
from app.core.security import get_password_hash, create_access_token

def setup_test_student(db: Session, email="integrated_student@carryyear.in"):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            password_hash=get_password_hash("SecretPass123!"),
            name="Integrated Student",
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
            percentage_or_cgpa=94.0,
            subject_marks={
                "Mathematics": 98,
                "Physics": 92,
                "Chemistry": 94
            },
            skills=[
                {"name": "Python", "level": 85},
                {"name": "SQL & Relational Databases", "level": 70}
            ],
            target_career="Data Scientist",
            max_education_budget=120000,
            onboarding_completed=True
        )
        db.add(profile)
        db.commit()

    token = create_access_token(subject=user.id)
    return user, {"Authorization": f"Bearer {token}"}

def test_scholarships_catalog_and_matching(client: TestClient, db: Session):
    # 1. Catalog
    res = client.get("/api/scholarships")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["count"] >= 5

    # 2. Matching
    user, headers = setup_test_student(db)
    match_res = client.get("/api/scholarships/match?community=BC", headers=headers)
    assert match_res.status_code == 200
    match_data = match_res.json()["data"]
    assert match_data["total_schemes_evaluated"] >= 5
    assert len(match_data["matches"]) >= 5
    assert match_data["total_potential_aid"] > 0

def test_financial_feasibility_planner(client: TestClient, db: Session):
    user, headers = setup_test_student(db)
    res = client.get("/api/finance/plan", headers=headers)
    assert res.status_code == 200
    data = res.json()["data"]
    assert "total_degree_cost" in data
    assert "monthly_emi_amount" in data
    assert "investment_payback_years" in data
    assert len(data["actionable_recommendations"]) > 0

def test_what_if_simulator(client: TestClient, db: Session):
    user, headers = setup_test_student(db)
    payload = {
        "cutoff_delta": 2.5,
        "budget_delta": 40000.0,
        "quota": "BC"
    }
    res = client.post("/api/simulator/evaluate", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["simulated_cutoff"] > data["baseline_cutoff"]
    assert data["total_admission_options"] > 0
    assert len(data["insights"]) > 0

def test_skill_gap_analyzer(client: TestClient, db: Session):
    user, headers = setup_test_student(db)
    res = client.get("/api/skills/gap-analysis?career_id_or_slug=data-scientist", headers=headers)
    assert res.status_code == 200
    data = res.json()["data"]
    assert "overall_skill_readiness_percent" in data
    assert len(data["gap_items"]) > 0
    assert data["estimated_study_hours_to_bridge"] > 0

def test_learning_roadmap_engine(client: TestClient, db: Session):
    user, headers = setup_test_student(db)
    res = client.get("/api/roadmap/generate?career_id_or_slug=data-scientist", headers=headers)
    assert res.status_code == 200
    data = res.json()["data"]
    assert len(data["phases"]) == 4
    assert len(data["recommended_certifications"]) > 0
    assert len(data["tamil_nadu_internship_portals"]) > 0

def test_ai_advisor_chat_and_history(client: TestClient, db: Session):
    user, headers = setup_test_student(db)
    # 1. Chat
    chat_res = client.post(
        "/api/advisor/chat",
        json={"message": "What scholarships can I apply for in Tamil Nadu?"},
        headers=headers
    )
    assert chat_res.status_code == 200
    data = chat_res.json()["data"]
    assert "reply" in data
    assert len(data["reply"]) > 20
    assert len(data["suggested_followups"]) > 0

    # 2. History
    hist_res = client.get("/api/advisor/history", headers=headers)
    assert hist_res.status_code == 200
    hist_data = hist_res.json()["data"]
    assert len(hist_data) >= 2  # user + assistant

def test_saved_hub_overview(client: TestClient, db: Session):
    user, headers = setup_test_student(db)
    res = client.get("/api/saved", headers=headers)
    assert res.status_code == 200
    data = res.json()["data"]
    assert "total_saved_count" in data
    assert "saved_careers" in data
    assert "saved_scholarships" in data
