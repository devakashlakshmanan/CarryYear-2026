from typing import List, Optional, Dict, Any, Set
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from app.db.models.student_profile import StudentProfile
from app.db.models.career_dna import CareerDNA
from app.db.models.assessment import AssessmentAttempt, AssessmentScore
from app.db.models.career import (
    Career,
    CareerSkill,
    CareerCourse,
    Course,
    Skill
)
from app.services.career_service import CareerService
from app.schemas.recommendation import (
    FactorBreakdown,
    CareerRecommendationOut,
    RecommendationResponse
)

class RecommendationService:
    @staticmethod
    def get_recommendations(
        db: Session,
        user_id: int,
        industry: Optional[str] = None,
        min_score: float = 0.0
    ) -> RecommendationResponse:
        """
        Calculates explainable, deterministic multi-factor match scores for all careers
        based on student academic marks, cognitive aptitude, expressed interests,
        declared skills, financial feasibility, and regional preferences in Tamil Nadu.
        """
        CareerService.ensure_seeded(db)

        profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Student profile not found. Please complete basic onboarding first."
            )

        # Retrieve Career DNA if available
        career_dna = db.query(CareerDNA).filter(CareerDNA.user_id == user_id).first()
        dominant_cluster = career_dna.dominant_cluster if career_dna else "General Career Exploration"

        # Retrieve Latest Assessment Scores
        latest_attempt = (
            db.query(AssessmentAttempt)
            .filter(AssessmentAttempt.user_id == user_id, AssessmentAttempt.completed == True)
            .order_by(AssessmentAttempt.id.desc())
            .first()
        )
        assessment_scores: Dict[str, float] = {}
        if latest_attempt:
            scores = db.query(AssessmentScore).filter(AssessmentScore.attempt_id == latest_attempt.id).all()
            for s in scores:
                assessment_scores[s.dimension] = s.normalized_score

        # Extract Student Profile Features
        academic_percentage = float(profile.percentage_or_cgpa or 70.0)
        subject_marks = profile.subject_marks or {}
        math_mark = float(subject_marks.get("Mathematics") or subject_marks.get("Maths") or academic_percentage)
        cs_mark = float(subject_marks.get("Computer Science") or subject_marks.get("Computer") or math_mark)
        science_mark = float(subject_marks.get("Physics") or subject_marks.get("Science") or academic_percentage)
        stream_str = (profile.stream or "").lower()

        student_skills_raw = profile.skills or []
        student_skill_names: Set[str] = set()
        for s in student_skills_raw:
            if isinstance(s, dict):
                student_skill_names.add(s.get("name", "").strip().lower())
            elif isinstance(s, str):
                student_skill_names.add(s.strip().lower())

        student_interests_raw = profile.interests or []
        student_interests: Set[str] = {i.lower() for i in student_interests_raw}

        student_budget = float(profile.max_education_budget or 120000.0)
        preferred_districts = [d.lower() for d in (profile.preferred_locations or [profile.district or "Tamil Nadu"])]
        target_career_str = (profile.target_career or "").lower()

        # Aptitude baselines
        logical_apt = assessment_scores.get("Logical Reasoning", academic_percentage * 0.85)
        numerical_apt = assessment_scores.get("Numerical Reasoning", math_mark * 0.85)
        analytical_apt = assessment_scores.get("Analytical Reasoning", (math_mark + cs_mark) / 2 * 0.85)
        verbal_apt = assessment_scores.get("Verbal Reasoning", 70.0)

        # Interest baselines
        tech_interest = assessment_scores.get("Technology", 85.0 if "technology" in student_interests else 60.0)
        science_interest = assessment_scores.get("Science", 80.0 if "science" in student_interests else 55.0)
        business_interest = assessment_scores.get("Business", 75.0 if "business" in student_interests else 50.0)
        healthcare_interest = assessment_scores.get("Healthcare", 75.0 if "healthcare" in student_interests else 45.0)
        design_interest = assessment_scores.get("Design", 70.0 if "design" in student_interests else 40.0)
        research_interest = assessment_scores.get("Research", 75.0 if "research" in student_interests else 50.0)
        mgmt_interest = assessment_scores.get("Management", 70.0 if "management" in student_interests else 50.0)

        # Retrieve All Careers with Joined Skills and Courses
        query = db.query(Career).options(
            joinedload(Career.skill_associations).joinedload(CareerSkill.skill),
            joinedload(Career.course_associations).joinedload(CareerCourse.course)
        )
        if industry:
            query = query.filter(Career.industry == industry)

        careers = query.all()
        recommendation_list: List[CareerRecommendationOut] = []

        for career in careers:
            # 1. Academic Fit (20%)
            stream_compat = 70.0
            if "information technology" in career.industry.lower() or "manufacturing" in career.industry.lower():
                if any(x in stream_compat_check for stream_compat_check in [stream_str] for x in ["math", "pcm", "computer", "science", "engineering"]):
                    stream_compat = 95.0
            elif "healthcare" in career.industry.lower():
                if any(x in stream_str for x in ["bio", "science", "medical"]):
                    stream_compat = 95.0
                elif "math" in stream_str:
                    stream_compat = 85.0  # Biomedical engineering is open to PCM
            else:
                stream_compat = 90.0  # Business/Design open across streams

            academic_fit = round(min(100.0, (academic_percentage * 0.5) + (stream_compat * 0.3) + (math_mark * 0.2)), 1)

            # 2. Aptitude Fit (25%)
            if "information technology" in career.industry.lower():
                aptitude_fit = round((analytical_apt * 0.40) + (logical_apt * 0.35) + (numerical_apt * 0.25), 1)
            elif "manufacturing" in career.industry.lower():
                aptitude_fit = round((analytical_apt * 0.40) + (numerical_apt * 0.35) + (logical_apt * 0.25), 1)
            elif "healthcare" in career.industry.lower():
                aptitude_fit = round((analytical_apt * 0.45) + (logical_apt * 0.30) + (verbal_apt * 0.25), 1)
            elif "fintech" in career.industry.lower() or "business" in career.industry.lower():
                aptitude_fit = round((numerical_apt * 0.40) + (logical_apt * 0.30) + (verbal_apt * 0.30), 1)
            else:
                aptitude_fit = round((analytical_apt * 0.40) + (verbal_apt * 0.35) + (logical_apt * 0.25), 1)
            aptitude_fit = min(100.0, max(0.0, aptitude_fit))

            # 3. Interest Alignment (20%)
            if "information technology" in career.industry.lower():
                interest_fit = (tech_interest * 0.50) + (research_interest * 0.25) + (science_interest * 0.25)
            elif "manufacturing" in career.industry.lower():
                interest_fit = (tech_interest * 0.40) + (science_interest * 0.35) + (design_interest * 0.25)
            elif "healthcare" in career.industry.lower():
                interest_fit = (healthcare_interest * 0.55) + (science_interest * 0.25) + (research_interest * 0.20)
            elif "fintech" in career.industry.lower() or "business" in career.industry.lower():
                interest_fit = (business_interest * 0.50) + (mgmt_interest * 0.30) + (tech_interest * 0.20)
            else:
                interest_fit = (design_interest * 0.60) + (tech_interest * 0.20) + (research_interest * 0.20)

            # Bonus if career matches target career
            if target_career_str and (target_career_str in career.title.lower() or career.title.lower() in target_career_str):
                interest_fit = min(100.0, interest_fit + 12.0)
            elif any(p in career.title.lower() for p in (profile.preferred_career_areas or [])):
                interest_fit = min(100.0, interest_fit + 8.0)

            interest_fit = round(min(100.0, max(0.0, interest_fit)), 1)

            # 4. Skill Match & Gap Analysis (15%)
            career_skills = [cs.skill for cs in career.skill_associations if cs.skill]
            matching_skills: List[str] = []
            skill_gaps: List[str] = []
            total_skill_weight = 0.0
            earned_skill_weight = 0.0

            for cs in career.skill_associations:
                if not cs.skill:
                    continue
                w = cs.importance_weight or 1.0
                total_skill_weight += w
                s_name = cs.skill.name
                s_lower = s_name.lower()

                # Check if student possesses this skill or related substring
                is_match = any(
                    user_sk in s_lower or s_lower in user_sk
                    for user_sk in student_skill_names
                )

                if is_match:
                    matching_skills.append(s_name)
                    earned_skill_weight += w
                else:
                    skill_gaps.append(s_name)

            if total_skill_weight > 0:
                raw_skill_ratio = (earned_skill_weight / total_skill_weight) * 100.0
                # Baseline 40% if student has solid aptitude to learn
                skill_match = round(min(100.0, max(40.0, raw_skill_ratio * 0.7 + 30.0)), 1)
            else:
                skill_match = 75.0

            # 5. Financial Feasibility (10%)
            primary_course_assoc = next((ca for ca in career.course_associations if ca.is_primary and ca.course), None)
            primary_degree_name = primary_course_assoc.course.name if primary_course_assoc else (career.course_associations[0].course.name if career.course_associations else "Undergraduate Degree")
            course_fee_min = primary_course_assoc.course.average_annual_fee_min if primary_course_assoc else 45000.0
            course_fee_max = primary_course_assoc.course.average_annual_fee_max if primary_course_assoc else 150000.0

            if student_budget >= course_fee_max:
                financial_feasibility = 98.0
            elif student_budget >= course_fee_min:
                financial_feasibility = round(85.0 + ((student_budget - course_fee_min) / max(course_fee_max - course_fee_min, 1.0)) * 13.0, 1)
            else:
                # Scholarship offset support for Tamil Nadu candidates
                scholarship_boost = 25.0 if profile.need_scholarship else 15.0
                fee_ratio = (student_budget / max(course_fee_min, 1.0)) * 100.0
                financial_feasibility = round(min(85.0, max(50.0, fee_ratio + scholarship_boost)), 1)

            # 6. Location Fit (10%)
            demand_lower = career.tamil_nadu_demand.lower()
            location_match = any(dist in demand_lower for dist in preferred_districts)
            if location_match:
                location_fit = 96.0
            elif "tamil nadu" in demand_lower or "chennai" in demand_lower or "coimbatore" in demand_lower:
                location_fit = 88.0
            else:
                location_fit = 78.0

            # Composite Deterministic Match Score
            match_score = round(
                (academic_fit * 0.20) +
                (aptitude_fit * 0.25) +
                (interest_fit * 0.20) +
                (skill_match * 0.15) +
                (financial_feasibility * 0.10) +
                (location_fit * 0.10),
                1
            )

            # Determine Tier
            if match_score >= 80.0:
                match_tier = "High Match"
            elif match_score >= 65.0:
                match_tier = "Moderate Match"
            else:
                match_tier = "Potential Pathway"

            # Formulate Explainable Narrative
            top_factors = []
            if academic_fit >= 85.0:
                top_factors.append(f"strong academic foundation in {profile.stream or 'your curriculum'} ({academic_percentage}%)")
            if aptitude_fit >= 80.0:
                top_factors.append(f"high cognitive reasoning alignment ({aptitude_fit}%)")
            if interest_fit >= 80.0:
                top_factors.append(f"pronounced interest in {career.industry} ({interest_fit}%)")

            top_factors_str = ", ".join(top_factors) if top_factors else "solid overall indicator compatibility"
            gap_summary = f" Closing {len(skill_gaps)} key skill gap(s) including {', '.join(skill_gaps[:2])} will maximize placement competitiveness." if skill_gaps else " Complete skill coverage already demonstrated."

            explanation = (
                f"Matched with {match_score}% confidence driven by {top_factors_str}. "
                f"Supported by strong regional demand across {career.tamil_nadu_demand.split('across')[-1].strip()}."
                f"{gap_summary}"
            )

            if match_score >= min_score:
                recommendation_list.append(
                    CareerRecommendationOut(
                        career_id=career.id,
                        career_title=career.title,
                        slug=career.slug,
                        cluster=career.cluster,
                        industry=career.industry,
                        match_score=match_score,
                        match_tier=match_tier,
                        factors=FactorBreakdown(
                            academic_fit=academic_fit,
                            aptitude_fit=aptitude_fit,
                            interest_alignment=interest_fit,
                            skill_match=skill_match,
                            financial_feasibility=financial_feasibility,
                            location_fit=location_fit
                        ),
                        explanation=explanation,
                        matching_skills=matching_skills,
                        skill_gaps=skill_gaps,
                        salary_range_min=career.salary_range_min,
                        salary_range_max=career.salary_range_max,
                        growth_rate=career.growth_rate,
                        tamil_nadu_demand=career.tamil_nadu_demand,
                        typical_pathway=career.typical_pathway,
                        primary_degree=primary_degree_name
                    )
                )

        # Sort recommendations by match_score descending
        recommendation_list.sort(key=lambda x: x.match_score, reverse=True)

        return RecommendationResponse(
            user_id=user_id,
            total_evaluated=len(recommendation_list),
            dominant_cluster=dominant_cluster,
            recommendations=recommendation_list
        )
