from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)

    # Step 1: Basic Information
    age = Column(Integer, nullable=True)
    gender = Column(String(50), nullable=True)
    state = Column(String(100), default="Tamil Nadu", nullable=False)
    district = Column(String(100), nullable=True, index=True)
    city = Column(String(100), nullable=True)
    current_education_level = Column(String(100), nullable=True) # e.g. Class 10, Class 12, Diploma, UG, PG
    community = Column(String(50), default="OC", nullable=True) # OC, BC, BCM, MBC, SC, SCA, ST
    is_first_graduate = Column(Boolean, default=False, nullable=True)
    is_govt_school = Column(Boolean, default=False, nullable=True) # 7.5% TN Govt School quota claim
    website_preferences = Column(JSON, default=dict, nullable=True) # theme, notification toggles, accessibility

    # Step 2: Academic Profile
    school_or_college = Column(String(255), nullable=True)
    board_or_university = Column(String(255), nullable=True) # State Board, CBSE, ICSE, Anna University, etc.
    stream = Column(String(100), nullable=True) # Bio-Maths, Computer Science, Commerce, Arts, Engineering
    percentage_or_cgpa = Column(Float, nullable=True)
    subject_marks = Column(JSON, default=dict, nullable=True) # e.g. {"Maths": 92, "Physics": 88}

    # Step 3: Interests
    interests = Column(JSON, default=list, nullable=True) # e.g. ["Technology", "Design", "Research"]

    # Step 4: Skills
    skills = Column(JSON, default=list, nullable=True) # e.g. [{"name": "Python", "level": 70}]

    # Step 5: Preferences
    preferred_locations = Column(JSON, default=list, nullable=True) # e.g. ["Chennai", "Coimbatore"]
    preferred_career_areas = Column(JSON, default=list, nullable=True)
    govt_or_private = Column(String(50), nullable=True) # Government, Private, Any
    higher_studies_preference = Column(String(100), nullable=True)
    study_mode = Column(String(50), default="Full-time", nullable=True)
    college_type = Column(String(100), default="Any", nullable=True)

    # Step 6: Financial Profile
    annual_family_income = Column(String(100), nullable=True) # e.g. "< 2.5 Lakhs", "2.5 - 5 Lakhs"
    max_education_budget = Column(Float, default=0.0, nullable=True) # in INR per annum
    need_scholarship = Column(Boolean, default=False, nullable=True)
    hostel_required = Column(Boolean, default=False, nullable=True)
    preferred_fee_range = Column(String(100), nullable=True)

    # Step 7: Goals & State
    short_term_goal = Column(Text, nullable=True)
    long_term_goal = Column(Text, nullable=True)
    target_career = Column(String(150), nullable=True)
    higher_study_interest = Column(Boolean, default=False, nullable=True)
    onboarding_completed = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="profile")

    def __repr__(self):
        return f"<StudentProfile(user_id={self.user_id}, state='{self.state}', district='{self.district}')>"
