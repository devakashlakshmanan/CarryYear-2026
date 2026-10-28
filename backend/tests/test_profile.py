import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_profile_get_and_update(db):
    # 1. Register a student
    reg_res = client.post("/api/auth/register", json={
        "name": "Muthu Kumar",
        "email": "muthu_profile_test@example.com",
        "password": "MuthuPassword123!"
    })
    assert reg_res.status_code == 201
    token = reg_res.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get initial profile
    get_res = client.get("/api/profile", headers=headers)
    assert get_res.status_code == 200
    p_data = get_res.json()["data"]
    assert p_data["user_email"] == "muthu_profile_test@example.com"
    assert p_data["state"] == "Tamil Nadu"
    assert p_data["onboarding_completed"] is False

    # 3. Update profile with 7-step onboarding data
    update_payload = {
        # Step 1: Basic info
        "age": 17,
        "gender": "Male",
        "state": "Tamil Nadu",
        "district": "Madurai",
        "city": "Madurai",
        "current_education_level": "Class 12",
        # Step 2: Academics
        "school_or_college": "TVS Higher Secondary School",
        "board_or_university": "Tamil Nadu State Board",
        "stream": "Bio-Maths",
        "percentage_or_cgpa": 89.2,
        "subject_marks": {"Maths": 92.0, "Biology": 88.0, "Physics": 86.0, "Chemistry": 91.0},
        # Step 3: Interests
        "interests": ["Healthcare", "Technology", "Research"],
        # Step 4: Skills
        "skills": [{"name": "Problem Solving", "level": 75}, {"name": "Communication", "level": 80}],
        # Step 5: Preferences
        "preferred_locations": ["Madurai", "Chennai", "Coimbatore"],
        "preferred_career_areas": ["Biomedical Engineering", "Data Science in Healthcare"],
        "govt_or_private": "Government",
        "higher_studies_preference": "M.Tech / MS",
        "study_mode": "Full-time",
        "college_type": "Government Aided",
        # Step 6: Finances
        "annual_family_income": "2.5 - 5 Lakhs",
        "max_education_budget": 120000.0,
        "need_scholarship": True,
        "hostel_required": True,
        "preferred_fee_range": "< 1.5 Lakhs",
        # Step 7: Goals
        "short_term_goal": "Join government medical or engineering college",
        "long_term_goal": "Innovate low-cost diagnostic healthcare devices",
        "target_career": "Biomedical Engineer",
        "higher_study_interest": True,
        "onboarding_completed": True
    }

    put_res = client.put("/api/profile", json=update_payload, headers=headers)
    assert put_res.status_code == 200
    updated_data = put_res.json()["data"]
    assert updated_data["district"] == "Madurai"
    assert updated_data["percentage_or_cgpa"] == 89.2
    assert "Healthcare" in updated_data["interests"]
    assert updated_data["onboarding_completed"] is True
    assert updated_data["max_education_budget"] == 120000.0

    # 4. Fetch again to confirm persistence
    refetch_res = client.get("/api/profile", headers=headers)
    assert refetch_res.status_code == 200
    persisted = refetch_res.json()["data"]
    assert persisted["district"] == "Madurai"
    assert persisted["target_career"] == "Biomedical Engineer"
    assert persisted["onboarding_completed"] is True

    # 5. Unauthorized check
    bad_res = client.get("/api/profile")
    assert bad_res.status_code == 401

def test_profile_community_quota_and_password_change(db):
    # 1. Register student
    reg_res = client.post("/api/auth/register", json={
        "name": "Kavitha Rajan",
        "email": "kavitha_quota_test@carryyear.in",
        "password": "InitialPassword123!"
    })
    assert reg_res.status_code == 201
    token = reg_res.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Update community, quota eligibility, and website preferences
    update_res = client.put("/api/profile", headers=headers, json={
        "community": "MBC",
        "is_first_graduate": True,
        "is_govt_school": True,
        "percentage_or_cgpa": 94.5,
        "subject_marks": {"Mathematics": 98.0, "Physics": 92.0, "Chemistry": 94.0},
        "website_preferences": {
            "notifications": {"cutoff_alerts": True, "scholarship_alerts": True},
            "theme": "light_lavender"
        }
    })
    assert update_res.status_code == 200
    p_data = update_res.json()["data"]
    assert p_data["community"] == "MBC"
    assert p_data["is_first_graduate"] is True
    assert p_data["is_govt_school"] is True
    assert p_data["website_preferences"]["theme"] == "light_lavender"

    # 3. Verify persistence
    check_res = client.get("/api/profile", headers=headers)
    assert check_res.status_code == 200
    saved = check_res.json()["data"]
    assert saved["community"] == "MBC"
    assert saved["is_first_graduate"] is True
    assert saved["is_govt_school"] is True

    # 4. Test Password Change - Wrong current password
    fail_pwd = client.post("/api/auth/change-password", headers=headers, json={
        "current_password": "WrongPassword999!",
        "new_password": "BrandNewSecurePassword123!"
    })
    assert fail_pwd.status_code == 400

    # 5. Test Password Change - Successful
    success_pwd = client.post("/api/auth/change-password", headers=headers, json={
        "current_password": "InitialPassword123!",
        "new_password": "BrandNewSecurePassword123!"
    })
    assert success_pwd.status_code == 200
    assert success_pwd.json()["success"] is True

    # 6. Verify login with new password
    new_login = client.post("/api/auth/login", json={
        "email": "kavitha_quota_test@carryyear.in",
        "password": "BrandNewSecurePassword123!"
    })
    assert new_login.status_code == 200
    assert "access_token" in new_login.json()["data"]

