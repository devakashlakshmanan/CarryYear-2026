import pytest
from app.db.models.user import User
from app.db.models.student_profile import StudentProfile

def test_user_crud(db):
    test_email = "tamil_student@example.com"

    # 1. CREATE User
    user = User(
        name="Karthik Raman",
        email=test_email,
        password_hash="fake_bcrypt_hash_for_test",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    assert user.id is not None
    assert user.name == "Karthik Raman"
    assert user.email == test_email
    assert user.is_active is True

    # 2. READ User
    fetched_user = db.query(User).filter(User.id == user.id).first()
    assert fetched_user is not None
    assert fetched_user.email == test_email

    # 3. UPDATE User
    fetched_user.name = "Karthik Ramanathan"
    db.commit()
    db.refresh(fetched_user)
    assert fetched_user.name == "Karthik Ramanathan"

    # 4. CREATE StudentProfile linked to User
    profile = StudentProfile(
        user_id=fetched_user.id,
        age=18,
        gender="Male",
        state="Tamil Nadu",
        district="Coimbatore",
        city="Coimbatore",
        current_education_level="Class 12",
        school_or_college="PSG Sarvajana Higher Secondary School",
        board_or_university="Tamil Nadu State Board",
        stream="Computer Science & Maths",
        percentage_or_cgpa=91.5,
        subject_marks={"Maths": 95, "Physics": 90, "Computer Science": 98, "Chemistry": 83},
        interests=["Technology", "Artificial Intelligence", "Robotics"],
        skills=[{"name": "Python", "level": 70}, {"name": "Problem Solving", "level": 80}],
        preferred_locations=["Coimbatore", "Chennai"],
        preferred_career_areas=["Data Science", "Software Engineering"],
        govt_or_private="Any",
        study_mode="Full-time",
        college_type="Government Aided",
        annual_family_income="2.5 - 5 Lakhs",
        max_education_budget=150000.0,
        need_scholarship=True,
        hostel_required=True,
        short_term_goal="Secure admission in top Tamil Nadu engineering college for AI/DS",
        long_term_goal="Become an AI Research Scientist",
        target_career="Data Scientist",
        onboarding_completed=True
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    assert profile.id is not None
    assert profile.user_id == fetched_user.id
    assert profile.district == "Coimbatore"
    assert profile.subject_marks["Computer Science"] == 98
    assert "Technology" in profile.interests
    assert profile.onboarding_completed is True

    # 5. READ via Relationship
    db.refresh(fetched_user)
    assert fetched_user.profile is not None
    assert fetched_user.profile.state == "Tamil Nadu"
    assert fetched_user.profile.user.email == test_email

    # 6. UPDATE StudentProfile
    profile.percentage_or_cgpa = 92.0
    profile.interests.append("Data Analytics")
    db.commit()
    db.refresh(profile)
    assert profile.percentage_or_cgpa == 92.0

    # 7. DELETE and Verify CASCADE
    user_id = fetched_user.id
    db.delete(fetched_user)
    db.commit()

    # User should be deleted
    deleted_user = db.query(User).filter(User.id == user_id).first()
    assert deleted_user is None

    # Profile should be cascade deleted
    orphaned_profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
    assert orphaned_profile is None
