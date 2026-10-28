import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.db.models.user import User
from app.core.security import get_password_hash, create_access_token

def create_test_user_token(db: Session, email="assessment_tester@carryyear.in"):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            password_hash=get_password_hash("ValidPass123"),
            name="Assessment Student",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    token = create_access_token(subject=user.id)
    return user, token

def test_get_assessment_questions(client: TestClient, db: Session):
    response = client.get("/api/assessment/questions")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["count"] > 0
    questions = data["data"]
    assert len(questions) >= 12

    # Check structure
    q1 = questions[0]
    assert "id" in q1
    assert "category" in q1
    assert "question_text" in q1
    assert "options" in q1
    assert isinstance(q1["options"], list)
    # Ensure correct answer is not exposed in public questions endpoint
    assert "correct_option_index" not in q1
    assert "explanation" not in q1

def test_submit_assessment_unauthorized(client: TestClient):
    response = client.post("/api/assessment/submit", json={"answers": []})
    assert response.status_code == 401

def test_submit_and_retrieve_assessment(client: TestClient, db: Session):
    user, token = create_test_user_token(db)
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch questions first
    q_resp = client.get("/api/assessment/questions")
    questions = q_resp.json()["data"]
    assert len(questions) > 0

    # Formulate answers (some correct, some high interest)
    answers = []
    for q in questions:
        # choose option index 1 or 2 for aptitude, 4 (Strongly Agree) for interest
        opt_idx = 1 if q["question_type"] == "aptitude" else 4
        answers.append({
            "question_id": q["id"],
            "selected_option_index": opt_idx
        })

    submit_resp = client.post(
        "/api/assessment/submit",
        headers=headers,
        json={"answers": answers}
    )
    assert submit_resp.status_code == 200
    submit_data = submit_resp.json()
    assert submit_data["success"] is True
    res = submit_data["data"]

    assert res["completed"] is True
    assert "dimension_scores" in res
    assert len(res["dimension_scores"]) > 0

    # Verify normalized scores are within [0, 100]
    for dim_score in res["dimension_scores"]:
        assert 0.0 <= dim_score["normalized_score"] <= 100.0
        assert dim_score["category_type"] in ["aptitude", "interest"]

    assert "aptitude_average" in res
    assert "top_interests" in res
    assert len(res["top_interests"]) > 0
    assert "summary" in res

    # Now verify GET /api/assessment/latest
    latest_resp = client.get("/api/assessment/latest", headers=headers)
    assert latest_resp.status_code == 200
    latest_data = latest_resp.json()
    assert latest_data["success"] is True
    assert latest_data["data"] is not None
    assert latest_data["data"]["attempt_id"] == res["attempt_id"]
    assert latest_data["data"]["total_score"] == res["total_score"]
