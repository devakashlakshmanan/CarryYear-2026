from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.deps import get_current_user
from app.db.models.user import User
from app.services.assessment_service import AssessmentService
from app.schemas.assessment import (
    QuestionOut,
    AssessmentSubmitRequest,
    AssessmentResultResponse
)

router = APIRouter(prefix="/assessment", tags=["Assessment"])

@router.get("/questions", response_model=dict)
def get_questions(
    question_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Fetch all assessment questions. Optionally filter by question_type ('aptitude' or 'interest').
    """
    questions = AssessmentService.get_questions(db, question_type=question_type)
    return {
        "success": True,
        "count": len(questions),
        "data": [QuestionOut.model_validate(q) for q in questions]
    }

@router.post("/submit", response_model=dict)
def submit_assessment(
    payload: AssessmentSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit student answers, evaluate aptitude and interest dimensions,
    store attempt, and return normalized scores and explainable summary.
    """
    result = AssessmentService.submit_assessment(
        db=db,
        user_id=current_user.id,
        answers=payload.answers
    )
    return {
        "success": True,
        "message": "Assessment completed and scores calculated successfully",
        "data": result
    }

@router.get("/latest", response_model=dict)
def get_latest_assessment(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch latest completed assessment results and dimension breakdown for current authenticated student.
    """
    result = AssessmentService.get_latest_attempt(db, user_id=current_user.id)
    return {
        "success": True,
        "data": result
    }
