from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class SkillItem(BaseModel):
    name: str
    level: int = Field(50, ge=1, le=100) # 1 to 100 proficiency score

class ProfileUpdate(BaseModel):
    # Step 1: Basic Information
    age: Optional[int] = Field(None, ge=12, le=60)
    gender: Optional[str] = None
    state: Optional[str] = "Tamil Nadu"
    district: Optional[str] = None
    city: Optional[str] = None
    current_education_level: Optional[str] = None

    # Step 2: Academic Profile
    school_or_college: Optional[str] = None
    board_or_university: Optional[str] = None
    stream: Optional[str] = None
    percentage_or_cgpa: Optional[float] = Field(None, ge=0.0, le=100.0)
    subject_marks: Optional[Dict[str, float]] = None

    # Step 3: Interests
    interests: Optional[List[str]] = None

    # Step 4: Skills
    skills: Optional[List[Dict[str, Any]]] = None

    # Step 5: Preferences
    preferred_locations: Optional[List[str]] = None
    preferred_career_areas: Optional[List[str]] = None
    govt_or_private: Optional[str] = None
    higher_studies_preference: Optional[str] = None
    study_mode: Optional[str] = "Full-time"
    college_type: Optional[str] = "Any"

    # Step 6: Financial Profile
    annual_family_income: Optional[str] = None
    max_education_budget: Optional[float] = Field(None, ge=0.0)
    need_scholarship: Optional[bool] = False
    hostel_required: Optional[bool] = False
    preferred_fee_range: Optional[str] = None

    # Step 7: Goals
    short_term_goal: Optional[str] = None
    long_term_goal: Optional[str] = None
    target_career: Optional[str] = None
    higher_study_interest: Optional[bool] = False
    onboarding_completed: Optional[bool] = True

class ProfileResponse(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str] = None
    user_email: Optional[str] = None

    # Step 1
    age: Optional[int] = None
    gender: Optional[str] = None
    state: str = "Tamil Nadu"
    district: Optional[str] = None
    city: Optional[str] = None
    current_education_level: Optional[str] = None

    # Step 2
    school_or_college: Optional[str] = None
    board_or_university: Optional[str] = None
    stream: Optional[str] = None
    percentage_or_cgpa: Optional[float] = None
    subject_marks: Optional[Dict[str, float]] = None

    # Step 3
    interests: List[str] = []

    # Step 4
    skills: List[Dict[str, Any]] = []

    # Step 5
    preferred_locations: List[str] = []
    preferred_career_areas: List[str] = []
    govt_or_private: Optional[str] = None
    higher_studies_preference: Optional[str] = None
    study_mode: Optional[str] = "Full-time"
    college_type: Optional[str] = "Any"

    # Step 6
    annual_family_income: Optional[str] = None
    max_education_budget: Optional[float] = 0.0
    need_scholarship: Optional[bool] = False
    hostel_required: Optional[bool] = False
    preferred_fee_range: Optional[str] = None

    # Step 7
    short_term_goal: Optional[str] = None
    long_term_goal: Optional[str] = None
    target_career: Optional[str] = None
    higher_study_interest: Optional[bool] = False
    onboarding_completed: bool = False

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
