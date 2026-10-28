from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.db.models.college import College, CollegeCourse
from app.db.models.career import Course
from app.db.models.student_profile import StudentProfile
from app.db.seeds.college_seed import seed_college_database
from app.schemas.college import (
    CollegeListOut,
    CollegeDetailOut,
    CollegeCourseCutoffOut,
    CollegeMatchItem,
    CollegeMatchingResponse
)

class CollegeService:
    @staticmethod
    def ensure_seeded(db: Session):
        if db.query(College).count() == 0:
            seed_college_database(db)

    @staticmethod
    def get_colleges(
        db: Session,
        district: Optional[str] = None,
        category: Optional[str] = None,
        max_fee: Optional[float] = None,
        min_placement_ctc: Optional[float] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[CollegeListOut]:
        CollegeService.ensure_seeded(db)

        query = db.query(College).options(joinedload(College.courses))

        if district:
            query = query.filter(College.district == district)
        if category:
            query = query.filter(College.category == category)
        if max_fee:
            query = query.filter(College.tuition_fee_annual <= max_fee)
        if min_placement_ctc:
            query = query.filter(College.average_placement_ctc >= min_placement_ctc)
        if search:
            search_fmt = f"%{search.lower()}%"
            query = query.filter(
                (College.name.ilike(search_fmt)) |
                (College.district.ilike(search_fmt)) |
                (College.category.ilike(search_fmt)) |
                (College.tnea_code.ilike(search_fmt))
            )

        colleges = query.order_by(College.nirf_rank.asc().nullslast(), College.name.asc()).offset(skip).limit(limit).all()

        results = []
        for c in colleges:
            results.append(
                CollegeListOut(
                    id=c.id,
                    name=c.name,
                    slug=c.slug,
                    district=c.district,
                    category=c.category,
                    tnea_code=c.tnea_code,
                    nirf_rank=c.nirf_rank,
                    naac_grade=c.naac_grade,
                    tuition_fee_annual=c.tuition_fee_annual,
                    hostel_fee_annual=c.hostel_fee_annual,
                    average_placement_ctc=c.average_placement_ctc,
                    highest_placement_ctc=c.highest_placement_ctc,
                    placement_percentage=c.placement_percentage,
                    top_recruiters=c.top_recruiters or [],
                    courses_count=len(c.courses)
                )
            )
        return results

    @staticmethod
    def get_college_by_identifier(db: Session, id_or_slug: str) -> CollegeDetailOut:
        CollegeService.ensure_seeded(db)

        query = db.query(College).options(
            joinedload(College.courses).joinedload(CollegeCourse.course)
        )

        if id_or_slug.isdigit():
            college = query.filter(College.id == int(id_or_slug)).first()
        else:
            college = query.filter(College.slug == id_or_slug).first()

        if not college:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"College '{id_or_slug}' not found in Tamil Nadu directory."
            )

        course_outs = []
        for cc in college.courses:
            if not cc.course:
                continue
            course_outs.append(
                CollegeCourseCutoffOut(
                    id=cc.id,
                    course_id=cc.course.id,
                    course_name=cc.course.name,
                    short_code=cc.course.short_code,
                    stream=cc.course.stream,
                    duration_years=cc.course.duration_years,
                    cutoff_marks_oc=cc.cutoff_marks_oc,
                    cutoff_marks_bc=cc.cutoff_marks_bc,
                    cutoff_marks_mbc=cc.cutoff_marks_mbc,
                    cutoff_marks_sc=cc.cutoff_marks_sc,
                    cutoff_marks_st=cc.cutoff_marks_st,
                    intake_seats=cc.intake_seats
                )
            )

        return CollegeDetailOut(
            id=college.id,
            name=college.name,
            slug=college.slug,
            district=college.district,
            category=college.category,
            tnea_code=college.tnea_code,
            nirf_rank=college.nirf_rank,
            naac_grade=college.naac_grade,
            tuition_fee_annual=college.tuition_fee_annual,
            hostel_fee_annual=college.hostel_fee_annual,
            average_placement_ctc=college.average_placement_ctc,
            highest_placement_ctc=college.highest_placement_ctc,
            placement_percentage=college.placement_percentage,
            top_recruiters=college.top_recruiters or [],
            campus_facilities=college.campus_facilities or [],
            overview=college.overview,
            website_url=college.website_url,
            offered_courses=course_outs
        )

    @staticmethod
    def get_all_districts(db: Session) -> List[str]:
        CollegeService.ensure_seeded(db)
        items = db.query(College.district).distinct().order_by(College.district.asc()).all()
        return [i[0] for i in items if i[0]]

    @staticmethod
    def match_colleges_for_student(
        db: Session,
        user_id: int,
        quota: str = "OC",
        target_course: Optional[str] = None,
        custom_cutoff: Optional[float] = None,
        custom_budget: Optional[float] = None
    ) -> CollegeMatchingResponse:
        CollegeService.ensure_seeded(db)

        # 1. Fetch Student Profile
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()

        # 2. Determine student cut-off mark (out of 200)
        student_cutoff = 185.0
        student_budget = 120000.0
        preferred_district = None

        if custom_cutoff is not None and custom_cutoff > 0:
            student_cutoff = float(custom_cutoff)
        elif profile:
            # Check TNEA formula from subject marks: Maths + (Physics / 2) + (Chemistry / 2)
            marks = profile.subject_marks or {}
            m = marks.get("Mathematics") or marks.get("Maths") or marks.get("maths")
            p = marks.get("Physics") or marks.get("physics")
            c = marks.get("Chemistry") or marks.get("chemistry")

            if m is not None and p is not None and c is not None:
                try:
                    student_cutoff = float(m) + (float(p) / 2.0) + (float(c) / 2.0)
                except (ValueError, TypeError):
                    student_cutoff = 185.0
            elif profile.percentage_or_cgpa:
                val = profile.percentage_or_cgpa
                student_cutoff = val * 20.0 if val <= 10.0 else val * 2.0

        if custom_budget is not None and custom_budget > 0:
            student_budget = float(custom_budget)
        elif profile and profile.max_education_budget:
            student_budget = float(profile.max_education_budget)

        if profile and profile.district:
            preferred_district = profile.district

        # Clamp cutoff to realistic range [100.0, 200.0]
        student_cutoff = max(100.0, min(200.0, round(student_cutoff, 2)))

        # Normalize quota
        quota_clean = quota.upper().strip()
        if quota_clean not in ["OC", "BC", "BCM", "MBC", "SC", "ST"]:
            quota_clean = "OC"

        # 3. Query all CollegeCourse items
        query = db.query(CollegeCourse).options(
            joinedload(CollegeCourse.college),
            joinedload(CollegeCourse.course)
        )

        if target_course and target_course.strip():
            course_term = target_course.strip().lower()
            query = query.join(Course).filter(
                (Course.short_code.ilike(f"%{course_term}%")) |
                (Course.name.ilike(f"%{course_term}%"))
            )

        college_courses = query.all()

        reach_list: List[CollegeMatchItem] = []
        target_list: List[CollegeMatchItem] = []
        safe_list: List[CollegeMatchItem] = []

        for cc in college_courses:
            college = cc.college
            course = cc.course
            if not college or not course:
                continue

            # Pick cutoff according to quota
            if quota_clean == "BC" or quota_clean == "BCM":
                req_cutoff = cc.cutoff_marks_bc
            elif quota_clean == "MBC":
                req_cutoff = cc.cutoff_marks_mbc
            elif quota_clean == "SC":
                req_cutoff = cc.cutoff_marks_sc
            elif quota_clean == "ST":
                req_cutoff = cc.cutoff_marks_st
            else:
                req_cutoff = cc.cutoff_marks_oc

            delta = round(student_cutoff - req_cutoff, 2)

            # Categorize into Reach, Target, Safe
            # Reach: student cutoff is 1.0 to 5.0 marks below required
            # Target: student cutoff is between -1.0 and +3.0 marks of required
            # Safe: student cutoff is > 3.0 marks above required
            if -5.0 <= delta < -1.0:
                match_category = "Reach"
            elif -1.0 <= delta <= 3.0:
                match_category = "Target"
            elif delta > 3.0:
                match_category = "Safe"
            else:
                continue  # Far below cutoff

            # Financial Feasibility
            total_annual = college.tuition_fee_annual + college.hostel_fee_annual
            diff_budget = student_budget - total_annual

            if total_annual <= student_budget:
                fin_status = "Affordable"
            elif total_annual <= student_budget * 1.35:
                fin_status = "Moderate Stretch"
            else:
                fin_status = "High Budget Gap"

            district_match = bool(
                preferred_district and preferred_district.lower() == college.district.lower()
            )

            item = CollegeMatchItem(
                college_id=college.id,
                college_name=college.name,
                college_slug=college.slug,
                district=college.district,
                category=college.category,
                tnea_code=college.tnea_code,
                nirf_rank=college.nirf_rank,
                naac_grade=college.naac_grade,
                course_id=course.id,
                course_name=course.name,
                course_short_code=course.short_code,
                student_cutoff=student_cutoff,
                required_cutoff=req_cutoff,
                cutoff_delta=delta,
                match_category=match_category,
                financial_status=fin_status,
                total_annual_cost=total_annual,
                user_annual_budget=student_budget,
                budget_surplus_or_deficit=diff_budget,
                average_placement_ctc=college.average_placement_ctc,
                highest_placement_ctc=college.highest_placement_ctc,
                top_recruiters=college.top_recruiters or [],
                district_match=district_match
            )

            if match_category == "Reach":
                reach_list.append(item)
            elif match_category == "Target":
                target_list.append(item)
            else:
                safe_list.append(item)

        # Sort results
        # Reach: closest to cutoff first (delta descending)
        reach_list.sort(key=lambda x: x.cutoff_delta, reverse=True)
        # Target: higher placement & district match
        target_list.sort(key=lambda x: (x.district_match, x.average_placement_ctc), reverse=True)
        # Safe: closest to target first (delta ascending)
        safe_list.sort(key=lambda x: x.cutoff_delta)

        return CollegeMatchingResponse(
            student_cutoff=student_cutoff,
            student_quota=quota_clean,
            student_budget=student_budget,
            preferred_district=preferred_district,
            total_matches=len(reach_list) + len(target_list) + len(safe_list),
            reach_colleges=reach_list,
            target_colleges=target_list,
            safe_colleges=safe_list
        )
