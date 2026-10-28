from typing import Optional
from sqlalchemy.orm import Session
from app.db.models.user import User
from app.db.models.student_profile import StudentProfile
from app.schemas.profile import ProfileUpdate, ProfileResponse

class ProfileService:
    @staticmethod
    def get_or_create_profile(db: Session, user: User) -> StudentProfile:
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
        if not profile:
            profile = StudentProfile(
                user_id=user.id,
                state="Tamil Nadu",
                onboarding_completed=False,
                interests=[],
                skills=[],
                preferred_locations=[],
                preferred_career_areas=[],
                subject_marks={}
            )
            db.add(profile)
            db.commit()
            db.refresh(profile)
        return profile

    @staticmethod
    def update_profile(db: Session, user: User, profile_in: ProfileUpdate) -> StudentProfile:
        profile = ProfileService.get_or_create_profile(db, user)

        update_data = profile_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(profile, field, value)

        db.commit()
        db.refresh(profile)
        return profile

    @staticmethod
    def serialize_profile(profile: StudentProfile, user: User) -> ProfileResponse:
        return ProfileResponse(
            id=profile.id,
            user_id=profile.user_id,
            user_name=user.name,
            user_email=user.email,
            age=profile.age,
            gender=profile.gender,
            state=profile.state or "Tamil Nadu",
            district=profile.district,
            city=profile.city,
            current_education_level=profile.current_education_level,
            school_or_college=profile.school_or_college,
            board_or_university=profile.board_or_university,
            stream=profile.stream,
            percentage_or_cgpa=profile.percentage_or_cgpa,
            subject_marks=profile.subject_marks or {},
            interests=profile.interests or [],
            skills=profile.skills or [],
            preferred_locations=profile.preferred_locations or [],
            preferred_career_areas=profile.preferred_career_areas or [],
            govt_or_private=profile.govt_or_private,
            higher_studies_preference=profile.higher_studies_preference,
            study_mode=profile.study_mode or "Full-time",
            college_type=profile.college_type or "Any",
            annual_family_income=profile.annual_family_income,
            max_education_budget=profile.max_education_budget or 0.0,
            need_scholarship=profile.need_scholarship or False,
            hostel_required=profile.hostel_required or False,
            preferred_fee_range=profile.preferred_fee_range,
            short_term_goal=profile.short_term_goal,
            long_term_goal=profile.long_term_goal,
            target_career=profile.target_career,
            higher_study_interest=profile.higher_study_interest or False,
            onboarding_completed=profile.onboarding_completed,
            created_at=profile.created_at,
            updated_at=profile.updated_at
        )
