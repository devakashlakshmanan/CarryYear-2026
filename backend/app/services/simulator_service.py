from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.models.student_profile import StudentProfile
from app.services.college_service import CollegeService
from app.services.recommendation_service import RecommendationService

class ScenarioAdjustmentIn(BaseModel):
    cutoff_delta: float = 0.0          # e.g. +3.5 or -2.0 marks
    budget_delta: float = 0.0          # e.g. +30000 or -20000 INR
    preferred_district: Optional[str] = None
    target_cluster: Optional[str] = None
    quota: str = "OC"

class SimulationResultOut(BaseModel):
    baseline_cutoff: float
    simulated_cutoff: float
    baseline_budget: float
    simulated_budget: float
    quota: str
    reach_colleges_count: int
    target_colleges_count: int
    safe_colleges_count: int
    total_admission_options: int
    cutoff_source_year: str = "TNEA 2024 Counseling Archive"
    disclaimer: str = (
        "Historical cutoffs serve as benchmark reference points. Actual admission depends on annual applicant "
        "distributions, seat matrix, and counseling normalization."
    )
    top_recommended_colleges: List[dict]
    career_options: List[dict]
    insights: List[str]

class SimulatorService:
    @staticmethod
    def run_simulation(db: Session, user_id: int, adj: ScenarioAdjustmentIn) -> SimulationResultOut:
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()

        base_cutoff = 185.0
        if profile:
            marks = profile.subject_marks or {}
            m = marks.get("Mathematics") or marks.get("Maths") or marks.get("maths")
            p = marks.get("Physics") or marks.get("physics")
            c = marks.get("Chemistry") or marks.get("chemistry")
            if m is not None and p is not None and c is not None:
                try:
                    base_cutoff = float(m) + (float(p) / 2.0) + (float(c) / 2.0)
                except (ValueError, TypeError):
                    base_cutoff = 185.0
            elif profile.percentage_or_cgpa:
                v = float(profile.percentage_or_cgpa)
                base_cutoff = v * 20.0 if v <= 10.0 else v * 2.0

        sim_cutoff = max(100.0, min(200.0, base_cutoff + adj.cutoff_delta))

        base_budget = profile.max_education_budget if profile and profile.max_education_budget else 120000.0
        sim_budget = max(25000.0, base_budget + adj.budget_delta)

        sim_quota = adj.quota
        if (not sim_quota or sim_quota == "OC") and profile and profile.community:
            sim_quota = profile.community.upper().strip()

        # Run College Matching with simulated parameters
        college_res = CollegeService.match_colleges_for_student(
            db=db,
            user_id=user_id,
            quota=sim_quota,
            custom_cutoff=sim_cutoff,
            custom_budget=sim_budget
        )

        # Top 3 Target/Safe
        top_cols = []
        for c in (college_res.target_colleges[:2] + college_res.safe_colleges[:2]):
            top_cols.append({
                "college_name": c.college_name,
                "district": c.district,
                "course": c.course_short_code,
                "category": c.match_category,
                "cutoff_delta": c.cutoff_delta,
                "annual_cost": c.total_annual_cost
            })

        # Run Recommendation
        rec_res = RecommendationService.get_recommendations(
            db=db,
            user_id=user_id,
            industry=None,
            min_score=50.0
        )

        top_careers = []
        for r in rec_res.recommendations[:3]:
            top_careers.append({
                "career_title": r.career_title,
                "match_score": r.match_score,
                "starting_ctc": r.salary_range_min,
                "industry": r.industry
            })

        insights = []
        if adj.cutoff_delta > 0:
            insights.append(f"A +{adj.cutoff_delta:.1f} mark increase expands your Target & Safe admissions by {len(college_res.target_colleges) + len(college_res.safe_colleges)} seats.")
        elif adj.cutoff_delta < 0:
            insights.append(f"A {adj.cutoff_delta:.1f} mark drop shifts {len(college_res.reach_colleges)} top tier colleges into the Reach category.")

        if adj.budget_delta > 0:
            insights.append(f"Adding ₹{adj.budget_delta:,.0f} to your annual budget opens autonomous private institutions like SSN and PSG Tech with no debt burden.")
        elif adj.budget_delta < 0:
            insights.append(f"Reduced budget focuses choices on high-ranking government institutions like CEG Guindy and GCT Coimbatore.")

        insights.append(f"Category {adj.quota} quota grants favorable seat matrix allocation across Tamil Nadu single-window counseling.")

        return SimulationResultOut(
            baseline_cutoff=round(base_cutoff, 2),
            simulated_cutoff=round(sim_cutoff, 2),
            baseline_budget=base_budget,
            simulated_budget=sim_budget,
            quota=adj.quota,
            reach_colleges_count=len(college_res.reach_colleges),
            target_colleges_count=len(college_res.target_colleges),
            safe_colleges_count=len(college_res.safe_colleges),
            total_admission_options=college_res.total_matches,
            top_recommended_colleges=top_cols,
            career_options=top_careers,
            insights=insights
        )
