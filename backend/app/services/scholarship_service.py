from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.db.models.scholarship_chat import Scholarship, SavedScholarship
from app.db.models.student_profile import StudentProfile
from app.db.seeds.scholarship_seed import seed_scholarship_database
from pydantic import BaseModel, ConfigDict

class ScholarshipOut(BaseModel):
    id: int
    title: str
    slug: str
    provider: str
    scheme_type: str
    amount_per_annum: float
    is_full_tuition_waiver: bool
    description: str
    eligibility_community: List[str] = []
    max_family_income: Optional[float] = None
    min_academic_percentage: Optional[float] = None
    gender_requirement: str
    first_graduate_only: bool
    govt_school_quota_only: bool
    required_documents: List[str] = []
    application_portal_url: Optional[str] = None
    deadline_info: str
    model_config = ConfigDict(from_attributes=True)

class ScholarshipMatchItem(BaseModel):
    scholarship: ScholarshipOut
    is_eligible: bool
    eligibility_status: str  # "Fully Eligible", "Conditional Match", "Not Eligible"
    match_score: int         # 0 - 100
    eligibility_reasons: List[str] = []
    annual_benefit_amount: float
    is_saved: bool = False
    model_config = ConfigDict(from_attributes=True)

class ScholarshipMatchingResponse(BaseModel):
    total_schemes_evaluated: int
    eligible_schemes_count: int
    total_potential_aid: float
    matches: List[ScholarshipMatchItem] = []
    model_config = ConfigDict(from_attributes=True)

class ScholarshipService:
    @staticmethod
    def ensure_seeded(db: Session):
        if db.query(Scholarship).count() == 0:
            seed_scholarship_database(db)

    @staticmethod
    def get_scholarships(
        db: Session,
        scheme_type: Optional[str] = None,
        community: Optional[str] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[ScholarshipOut]:
        ScholarshipService.ensure_seeded(db)
        query = db.query(Scholarship)

        if scheme_type:
            query = query.filter(Scholarship.scheme_type == scheme_type)
        if search:
            s_fmt = f"%{search.lower()}%"
            query = query.filter(
                (Scholarship.title.ilike(s_fmt)) |
                (Scholarship.provider.ilike(s_fmt)) |
                (Scholarship.description.ilike(s_fmt))
            )

        items = query.order_by(Scholarship.amount_per_annum.desc()).offset(skip).limit(limit).all()

        if community:
            comm_upper = community.upper()
            items = [
                s for s in items
                if comm_upper in [c.upper() for c in (s.eligibility_community or [])] or "ALL" in (s.eligibility_community or [])
            ]

        return [ScholarshipOut.model_validate(s) for s in items]

    @staticmethod
    def get_scholarship_by_slug(db: Session, slug: str) -> ScholarshipOut:
        ScholarshipService.ensure_seeded(db)
        s = db.query(Scholarship).filter(Scholarship.slug == slug).first()
        if not s:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Scholarship '{slug}' not found.")
        return ScholarshipOut.model_validate(s)

    @staticmethod
    def match_scholarships_for_user(
        db: Session,
        user_id: int,
        custom_community: Optional[str] = None,
        custom_income: Optional[float] = None,
        is_first_graduate: Optional[bool] = None,
        is_govt_school: Optional[bool] = None
    ) -> ScholarshipMatchingResponse:
        ScholarshipService.ensure_seeded(db)

        profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
        user_saved_ids = set(
            s[0] for s in db.query(SavedScholarship.scholarship_id).filter(SavedScholarship.user_id == user_id).all()
        )

        all_scholarships = db.query(Scholarship).order_by(Scholarship.amount_per_annum.desc()).all()

        # User traits grounded in authenticated profile
        if custom_community:
            community = custom_community.upper().strip()
        elif profile and profile.community:
            community = profile.community.upper().strip()
        else:
            community = "OC"

        # Resolve family income from custom parameter or profile income bracket / budget
        if custom_income is not None:
            family_income = float(custom_income)
        elif profile and profile.annual_family_income:
            inc_str = profile.annual_family_income.lower()
            if "< 2.5" in inc_str or "below 2.5" in inc_str:
                family_income = 180000.0
            elif "2.5 - 5" in inc_str or "2.5 to 5" in inc_str:
                family_income = 350000.0
            elif "5 - 10" in inc_str:
                family_income = 700000.0
            elif "> 10" in inc_str or "above 10" in inc_str:
                family_income = 1200000.0
            else:
                try:
                    family_income = float(profile.annual_family_income)
                except ValueError:
                    family_income = 200000.0
        elif profile and profile.max_education_budget:
            family_income = profile.max_education_budget * 2.0
        else:
            family_income = 180000.0

        if is_first_graduate is not None:
            first_grad = bool(is_first_graduate)
        elif profile and profile.is_first_graduate is not None:
            first_grad = bool(profile.is_first_graduate)
        else:
            first_grad = False

        if is_govt_school is not None:
            govt_school = bool(is_govt_school)
        elif profile and profile.is_govt_school is not None:
            govt_school = bool(profile.is_govt_school)
        else:
            govt_school = False

        academic_pct = 75.0
        if profile and profile.percentage_or_cgpa:
            academic_pct = float(profile.percentage_or_cgpa)
            if academic_pct <= 10.0:
                academic_pct *= 10.0

        matches: List[ScholarshipMatchItem] = []
        total_aid = 0.0

        for sch in all_scholarships:
            reasons = []
            score = 100
            eligible = True

            # 1. Community check
            comm_list = [c.upper() for c in (sch.eligibility_community or [])]
            if "ALL" not in comm_list and community not in comm_list:
                eligible = False
                score -= 40
                reasons.append(f"Requires reservation category in {', '.join(comm_list)} (Current: {community})")
            else:
                reasons.append(f"Matches category criteria ({community})")

            # 2. Income ceiling check
            if sch.max_family_income is not None:
                if family_income > sch.max_family_income:
                    eligible = False
                    score -= 30
                    reasons.append(f"Family income ₹{family_income:,.0f} exceeds ceiling of ₹{sch.max_family_income:,.0f}")
                else:
                    reasons.append(f"Income within eligible ceiling (< ₹{sch.max_family_income:,.0f})")

            # 3. Academic percentage check
            if sch.min_academic_percentage is not None:
                if academic_pct < sch.min_academic_percentage:
                    eligible = False
                    score -= 20
                    reasons.append(f"Academic score {academic_pct:.1f}% below minimum {sch.min_academic_percentage:.1f}%")
                else:
                    reasons.append(f"Academic merit verified ({academic_pct:.1f}%)")

            # 4. First graduate requirement
            if sch.first_graduate_only and not first_grad:
                eligible = False
                score -= 35
                reasons.append("Exclusive to First Graduate certificate holders")
            elif sch.first_graduate_only and first_grad:
                reasons.append("Qualifies under Tamil Nadu First Graduate verification")

            # 5. Government school quota (7.5%)
            if sch.govt_school_quota_only and not govt_school:
                eligible = False
                score -= 35
                reasons.append("Requires Classes 6-12 completion in Tamil Nadu Govt schools")
            elif sch.govt_school_quota_only and govt_school:
                reasons.append("Qualifies under 7.5% Govt School reservation quota")

            score = max(0, min(100, score))
            status_text = "Fully Eligible" if eligible else ("Conditional Match" if score >= 60 else "Ineligible")

            if eligible:
                total_aid += sch.amount_per_annum

            matches.append(
                ScholarshipMatchItem(
                    scholarship=ScholarshipOut.model_validate(sch),
                    is_eligible=eligible,
                    eligibility_status=status_text,
                    match_score=score,
                    eligibility_reasons=reasons,
                    annual_benefit_amount=sch.amount_per_annum,
                    is_saved=(sch.id in user_saved_ids)
                )
            )

        matches.sort(key=lambda x: (x.is_eligible, x.annual_benefit_amount), reverse=True)

        return ScholarshipMatchingResponse(
            total_schemes_evaluated=len(all_scholarships),
            eligible_schemes_count=sum(1 for m in matches if m.is_eligible),
            total_potential_aid=total_aid,
            matches=matches
        )

    @staticmethod
    def toggle_save_scholarship(db: Session, user_id: int, scholarship_id: int) -> bool:
        existing = db.query(SavedScholarship).filter(
            SavedScholarship.user_id == user_id,
            SavedScholarship.scholarship_id == scholarship_id
        ).first()

        if existing:
            db.delete(existing)
            db.commit()
            return False
        else:
            new_item = SavedScholarship(user_id=user_id, scholarship_id=scholarship_id)
            db.add(new_item)
            db.commit()
            return True
