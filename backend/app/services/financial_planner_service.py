from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.models.college import College
from app.db.models.career import Career
from app.db.models.student_profile import StudentProfile
from app.services.scholarship_service import ScholarshipService

class FinancialBreakdownOut(BaseModel):
    college_name: str
    target_career: str
    is_college_selected: bool = False
    is_career_selected: bool = False
    fee_source: str = "Tamil Nadu State Norms Estimate"
    academic_year: str = "2024-2025"
    degree_duration_years: float
    annual_tuition_fee: float
    annual_hostel_fee: float
    annual_food_living: float
    annual_transport: float
    annual_books_equipment: float
    annual_living_expenses: float
    total_annual_cost: float
    total_degree_cost: float
    annual_student_budget: float
    total_student_budget: float
    annual_scholarships_aid: float
    total_scholarships_aid: float
    net_funding_gap: float
    financial_feasibility_tier: str  # "Fully Self-Funded", "Low Gap", "Substantial Loan Needed"
    loan_principal: float
    loan_interest_rate_percent: float
    loan_tenure_years: int
    moratorium_years: float
    monthly_emi_amount: float
    total_loan_repayment_amount: float
    total_interest_payable: float
    expected_starting_ctc: float
    expected_monthly_gross: float
    emi_to_income_ratio_percent: float
    investment_payback_years: float
    tuition_is_custom: bool = False
    hostel_is_custom: bool = False
    budget_is_custom: bool = False
    disclaimer: str = (
        "Projections and EMI calculations are decision-support estimates for planning purposes, "
        "not guaranteed loan approvals or formal financial advice. Fee figures are based on published guidelines and user assumptions."
    )
    actionable_recommendations: List[str]

class FinancialPlannerService:
    @staticmethod
    def calculate_plan(
        db: Session,
        user_id: int,
        college_id: Optional[int] = None,
        career_id: Optional[int] = None,
        custom_tuition: Optional[float] = None,
        custom_hostel: Optional[float] = None,
        custom_budget: Optional[float] = None,
        loan_interest_rate: float = 8.5,
        loan_tenure_years: int = 7
    ) -> FinancialBreakdownOut:
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()

        # Resolve College explicitly without silent substitution
        college = None
        is_college_selected = False
        fee_source = "Tamil Nadu State Higher Education Norms (Estimated)"
        academic_year = "2024-2025"

        if college_id:
            college = db.query(College).filter(College.id == college_id).first()
            if college:
                is_college_selected = True
                fee_source = college.source_name or "Official Tamil Nadu College Fee Schedule"
                academic_year = college.academic_year or "2024-2025"
        else:
            try:
                from app.services.college_service import CollegeService
                matched_cols = CollegeService.match_colleges_for_student(db, user_id=user_id)
                top_candidate = matched_cols.target_colleges[0] if matched_cols.target_colleges else (matched_cols.safe_colleges[0] if matched_cols.safe_colleges else None)
                if top_candidate:
                    college = db.query(College).filter(College.id == top_candidate.college_id).first()
                    if college:
                        is_college_selected = True
                        fee_source = college.source_name or "Official Tamil Nadu College Fee Schedule"
                        academic_year = college.academic_year or "2024-2025"
            except Exception:
                pass

        college_name = college.name if college else "State Average Model (TN Engineering / Science)"

        # Resolve Career explicitly from profile or top recommendation
        career = None
        is_career_selected = False
        if career_id:
            career = db.query(Career).filter(Career.id == career_id).first()
            if career:
                is_career_selected = True
        elif profile and profile.target_career:
            career = db.query(Career).filter(Career.title.ilike(f"%{profile.target_career}%")).first()
            if career:
                is_career_selected = True

        if not career:
            try:
                from app.services.recommendation_service import RecommendationService
                rec_res = RecommendationService.get_recommendations(db, user_id=user_id)
                if rec_res.recommendations:
                    top_rec_id = rec_res.recommendations[0].career_id
                    career = db.query(Career).filter(Career.id == top_rec_id).first()
                    if career:
                        is_career_selected = True
            except Exception:
                pass

        target_career = career.title if career else (profile.target_career if profile and profile.target_career else "Professional Career Pathway")

        duration_years = 4.0

        # Base fee figures
        default_tuition = college.tuition_fee_annual if college else 45000.0
        default_hostel = college.hostel_fee_annual if college else 35000.0

        tuition = custom_tuition if custom_tuition is not None else default_tuition
        hostel = custom_hostel if custom_hostel is not None else default_hostel

        # Itemized living costs
        annual_food_living = 15000.0
        annual_transport = 8000.0
        annual_books_equipment = 10000.0
        living = annual_food_living + annual_transport + annual_books_equipment  # 33000.0

        annual_total = tuition + hostel + living
        degree_total = annual_total * duration_years

        default_budget = profile.max_education_budget if (profile and profile.max_education_budget) else 100000.0
        annual_budget = custom_budget if custom_budget is not None else default_budget
        total_budget = annual_budget * duration_years

        # Potential scholarship deduction
        scholarship_res = ScholarshipService.match_scholarships_for_user(db, user_id=user_id)
        annual_aid = min(scholarship_res.total_potential_aid, tuition + hostel)
        total_aid = annual_aid * duration_years

        net_gap = max(0.0, degree_total - (total_budget + total_aid))

        # Loan Amortization (safe bounds)
        loan_principal = net_gap
        bounded_interest = max(0.1, min(25.0, loan_interest_rate))
        bounded_tenure = max(1, min(20, loan_tenure_years))
        r = (bounded_interest / 100.0) / 12.0
        n = bounded_tenure * 12

        if loan_principal > 0 and r > 0 and n > 0:
            emi = loan_principal * r * ((1.0 + r) ** n) / (((1.0 + r) ** n) - 1.0)
            total_repayment = emi * n
            total_interest = total_repayment - loan_principal
        else:
            emi = 0.0
            total_repayment = 0.0
            total_interest = 0.0

        starting_ctc = career.salary_range_min if career else 550000.0
        monthly_gross = starting_ctc / 12.0
        emi_ratio = (emi / monthly_gross * 100.0) if monthly_gross > 0 else 0.0

        payback_years = (degree_total / starting_ctc) if starting_ctc > 0 else 1.8

        if net_gap == 0:
            tier = "Fully Self-Funded / Covered by Budget & Scholarships"
        elif net_gap <= 150000.0:
            tier = "Low Gap (Coverable via State Subsidy or Family Savings)"
        else:
            tier = "Education Loan Considered (SBI Scholar / Canara Vidya)"

        recs = [
            f"Review official tuition schedule from {fee_source} ({academic_year}).",
            f"Explore state fee waivers like Tamil Nadu First Graduate Scholarship to offset up to ₹{min(annual_aid, 25000.0):,.0f}/year.",
            f"Education loan estimate at {bounded_interest}% tenure {bounded_tenure} years yields an estimated EMI of ₹{emi:,.0f}/month.",
            "Utilize the moratorium period interest subsidy through the Central Sector Interest Subsidy (CSIS) scheme if eligible."
        ]

        return FinancialBreakdownOut(
            college_name=college_name,
            target_career=target_career,
            is_college_selected=is_college_selected,
            is_career_selected=is_career_selected,
            fee_source=fee_source,
            academic_year=academic_year,
            degree_duration_years=duration_years,
            annual_tuition_fee=tuition,
            annual_hostel_fee=hostel,
            annual_food_living=annual_food_living,
            annual_transport=annual_transport,
            annual_books_equipment=annual_books_equipment,
            annual_living_expenses=living,
            total_annual_cost=annual_total,
            total_degree_cost=degree_total,
            annual_student_budget=annual_budget,
            total_student_budget=total_budget,
            annual_scholarships_aid=annual_aid,
            total_scholarships_aid=total_aid,
            net_funding_gap=net_gap,
            financial_feasibility_tier=tier,
            loan_principal=loan_principal,
            loan_interest_rate_percent=bounded_interest,
            loan_tenure_years=bounded_tenure,
            moratorium_years=duration_years + 0.5,
            monthly_emi_amount=round(emi, 2),
            total_loan_repayment_amount=round(total_repayment, 2),
            total_interest_payable=round(total_interest, 2),
            expected_starting_ctc=starting_ctc,
            expected_monthly_gross=round(monthly_gross, 2),
            emi_to_income_ratio_percent=round(emi_ratio, 1),
            investment_payback_years=round(payback_years, 1),
            tuition_is_custom=custom_tuition is not None,
            hostel_is_custom=custom_hostel is not None,
            budget_is_custom=custom_budget is not None,
            actionable_recommendations=recs
        )
