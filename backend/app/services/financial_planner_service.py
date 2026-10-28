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
    degree_duration_years: float
    annual_tuition_fee: float
    annual_hostel_fee: float
    annual_living_expenses: float
    total_annual_cost: float
    total_degree_cost: float
    annual_student_budget: float
    total_student_budget: float
    annual_scholarships_aid: float
    total_scholarships_aid: float
    net_funding_gap: float
    financial_feasibility_tier: str # "Self-Funded", "Low Gap / Micro Loan", "Substantial Loan Needed"
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

        # Resolve College
        college = None
        if college_id:
            college = db.query(College).filter(College.id == college_id).first()
        if not college:
            college = db.query(College).first()

        # Resolve Career
        career = None
        if career_id:
            career = db.query(Career).filter(Career.id == career_id).first()
        if not career:
            career = db.query(Career).first()

        duration_years = 4.0
        tuition = custom_tuition if custom_tuition is not None else (college.tuition_fee_annual if college else 45000.0)
        hostel = custom_hostel if custom_hostel is not None else (college.hostel_fee_annual if college else 35000.0)
        living = 25000.0  # books, commute, project equipment

        annual_total = tuition + hostel + living
        degree_total = annual_total * duration_years

        annual_budget = custom_budget if custom_budget is not None else (profile.max_education_budget if profile and profile.max_education_budget else 120000.0)
        total_budget = annual_budget * duration_years

        # Potential scholarship deduction
        scholarship_res = ScholarshipService.match_scholarships_for_user(db, user_id=user_id)
        annual_aid = min(scholarship_res.total_potential_aid, tuition + hostel)
        total_aid = annual_aid * duration_years

        net_gap = max(0.0, degree_total - (total_budget + total_aid))

        # Loan Amortization
        loan_principal = net_gap
        r = (loan_interest_rate / 100.0) / 12.0
        n = loan_tenure_years * 12

        if loan_principal > 0 and r > 0 and n > 0:
            emi = loan_principal * r * ((1.0 + r) ** n) / (((1.0 + r) ** n) - 1.0)
            total_repayment = emi * n
            total_interest = total_repayment - loan_principal
        else:
            emi = 0.0
            total_repayment = 0.0
            total_interest = 0.0

        starting_ctc = career.salary_range_min if career else 650000.0
        monthly_gross = starting_ctc / 12.0
        emi_ratio = (emi / monthly_gross * 100.0) if monthly_gross > 0 else 0.0

        payback_years = (degree_total / starting_ctc) if starting_ctc > 0 else 1.5

        if net_gap == 0:
            tier = "Fully Self-Funded / Covered by Budget & Scholarships"
        elif net_gap <= 150000.0:
            tier = "Low Gap (Easily covered via State Subsidy or Part-time Assistance)"
        else:
            tier = "Substantial Education Loan Recommended (SBI Scholar / Canara Vidya)"

        recs = [
            f"Apply for Tamil Nadu First Graduate tuition concession to save up to ₹{annual_aid:,.0f} annually.",
            f"SBI Scholar loan offers concessionary interest rates ({loan_interest_rate}%) with zero collateral for Anna University CEG, MIT, PSG Tech, and NIT Trichy.",
            f"Expected initial salary of ₹{starting_ctc/100000:.1f} LPA yields an investment payback period of only {payback_years:.1f} years.",
            "Take advantage of interest subsidy during the 4-year moratorium period via Central Sector Interest Subsidy (CSIS) scheme."
        ]

        return FinancialBreakdownOut(
            college_name=college.name if college else "Tamil Nadu Engineering Institution",
            target_career=career.title if career else "Technology Professional",
            degree_duration_years=duration_years,
            annual_tuition_fee=tuition,
            annual_hostel_fee=hostel,
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
            loan_interest_rate_percent=loan_interest_rate,
            loan_tenure_years=loan_tenure_years,
            moratorium_years=duration_years + 0.5,
            monthly_emi_amount=round(emi, 2),
            total_loan_repayment_amount=round(total_repayment, 2),
            total_interest_payable=round(total_interest, 2),
            expected_starting_ctc=starting_ctc,
            expected_monthly_gross=round(monthly_gross, 2),
            emi_to_income_ratio_percent=round(emi_ratio, 1),
            investment_payback_years=round(payback_years, 1),
            actionable_recommendations=recs
        )
