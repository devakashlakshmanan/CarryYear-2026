from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.financial_planner_service import FinancialPlannerService
from app.api.deps import get_current_user

router = APIRouter(prefix="/finance", tags=["Financial Feasibility"])

@router.get("/plan", response_model=dict)
def get_financial_plan(
    college_id: Optional[int] = Query(None),
    career_id: Optional[int] = Query(None),
    custom_tuition: Optional[float] = Query(None),
    custom_hostel: Optional[float] = Query(None),
    custom_budget: Optional[float] = Query(None),
    loan_interest_rate: float = Query(8.5),
    loan_tenure_years: int = Query(7),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    plan = FinancialPlannerService.calculate_plan(
        db=db,
        user_id=current_user.id,
        college_id=college_id,
        career_id=career_id,
        custom_tuition=custom_tuition,
        custom_hostel=custom_hostel,
        custom_budget=custom_budget,
        loan_interest_rate=loan_interest_rate,
        loan_tenure_years=loan_tenure_years
    )
    return {"success": True, "data": plan}
