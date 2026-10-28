import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_cross_user_isolation_profile_and_saved_items(db):
    """
    Test strict multi-tenant authorization isolation:
    User A's profile, saved items, and assessment data must NEVER be accessible
    or modifiable by User B.
    """
    # 1. Register User A
    user_a_email = "student_alpha_isolation@example.com"
    reg_a = client.post("/api/auth/register", json={
        "name": "Student Alpha",
        "email": user_a_email,
        "password": "StrongPassword123!"
    })
    assert reg_a.status_code == 201
    token_a = reg_a.json()["data"]["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # 2. Register User B
    user_b_email = "student_beta_isolation@example.com"
    reg_b = client.post("/api/auth/register", json={
        "name": "Student Beta",
        "email": user_b_email,
        "password": "StrongPassword123!"
    })
    assert reg_b.status_code == 201
    token_b = reg_b.json()["data"]["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 3. User A updates their profile with personal information
    update_a = client.put("/api/profile", headers=headers_a, json={
        "target_career": "Data Scientist",
        "location": "Chennai",
        "district": "Chennai",
        "percentage_or_cgpa": 92.5
    })
    assert update_a.status_code == 200
    assert update_a.json()["data"]["target_career"] == "Data Scientist"
    assert update_a.json()["data"]["user_email"] == user_a_email

    # 4. User B requests their profile -> must NOT see User A's data
    profile_b = client.get("/api/profile", headers=headers_b)
    assert profile_b.status_code == 200
    assert profile_b.json()["data"]["user_email"] == user_b_email
    assert profile_b.json()["data"]["target_career"] is None or profile_b.json()["data"]["target_career"] != "Data Scientist"

    # 5. User A bookmarks Career ID 1
    save_a = client.post("/api/careers/1/save", headers=headers_a, json={"notes": "Alpha secret dream career"})
    assert save_a.status_code == 200

    # 6. User B fetches their saved items -> must be empty (0 items)
    saved_b = client.get("/api/saved", headers=headers_b)
    assert saved_b.status_code == 200
    assert len(saved_b.json()["data"]["saved_careers"]) == 0

    # 7. User A fetches their saved items -> must have 1 item
    saved_a = client.get("/api/saved", headers=headers_a)
    assert saved_a.status_code == 200
    assert len(saved_a.json()["data"]["saved_careers"]) == 1
    assert saved_a.json()["data"]["saved_careers"][0]["career_id"] == 1

    # 8. User B attempts to unsave User A's bookmark -> should report removed=False because B does not own it
    unsave_b = client.delete("/api/careers/1/save", headers=headers_b)
    assert unsave_b.status_code == 200
    assert unsave_b.json()["data"]["removed"] is False

    # Verify User A's bookmark is STILL intact
    saved_a_verify = client.get("/api/saved", headers=headers_a)
    assert len(saved_a_verify.json()["data"]["saved_careers"]) == 1

    # 9. Unauthenticated requests to protected endpoints must return 401
    unauth_profile = client.get("/api/profile")
    assert unauth_profile.status_code == 401

    unauth_saved = client.get("/api/saved")
    assert unauth_saved.status_code == 401
