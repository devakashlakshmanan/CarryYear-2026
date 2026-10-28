import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_and_login_flow(db):
    test_user_data = {
        "name": "Ananya Sundaram",
        "email": "ananya_auth_test@example.com",
        "password": "StrongPassword123!"
    }

    # 1. Register
    reg_response = client.post("/api/auth/register", json=test_user_data)
    assert reg_response.status_code == 201
    reg_json = reg_response.json()
    assert reg_json["success"] is True
    assert "access_token" in reg_json["data"]
    assert reg_json["data"]["user"]["email"] == "ananya_auth_test@example.com"
    token = reg_json["data"]["access_token"]

    # 2. Duplicate registration should fail
    dup_response = client.post("/api/auth/register", json=test_user_data)
    assert dup_response.status_code == 400
    dup_json = dup_response.json()
    assert dup_json["success"] is False
    assert "already exists" in dup_json["message"]

    # 3. Login with wrong password
    bad_login = client.post("/api/auth/login", json={
        "email": "ananya_auth_test@example.com",
        "password": "WrongPassword!"
    })
    assert bad_login.status_code == 401
    bad_json = bad_login.json()
    assert bad_json["success"] is False

    # 4. Login with correct password
    login_response = client.post("/api/auth/login", json={
        "email": "ananya_auth_test@example.com",
        "password": "StrongPassword123!"
    })
    assert login_response.status_code == 200
    login_json = login_response.json()
    assert login_json["success"] is True
    assert "access_token" in login_json["data"]
    login_token = login_json["data"]["access_token"]

    # 5. Access /api/auth/me with token
    me_response = client.get("/api/auth/me", headers={
        "Authorization": f"Bearer {login_token}"
    })
    assert me_response.status_code == 200
    me_json = me_response.json()
    assert me_json["success"] is True
    assert me_json["data"]["email"] == "ananya_auth_test@example.com"
    assert me_json["data"]["name"] == "Ananya Sundaram"

    # 6. Access /api/auth/me with invalid token
    bad_me = client.get("/api/auth/me", headers={
        "Authorization": "Bearer invalid_token_12345"
    })
    assert bad_me.status_code == 401
