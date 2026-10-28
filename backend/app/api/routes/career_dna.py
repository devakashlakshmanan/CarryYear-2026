from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.deps import get_current_user
from app.db.models.user import User
from app.services.career_dna_service import CareerDNAService
from app.schemas.career_dna import CareerDNAResponse

router = APIRouter(prefix="/career-dna", tags=["Career DNA"])

@router.get("", response_model=dict)
def get_career_dna(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch the student's multi-dimensional Career DNA profile indicators.
    Auto-synthesizes if student profile exists and DNA has not yet been generated.
    """
    dna = CareerDNAService.get_career_dna(db, user_id=current_user.id)
    return {
        "success": True,
        "data": dna
    }

@router.post("/generate", response_model=dict)
def generate_career_dna(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Synthesize and regenerate Career DNA based on latest student profile,
    assessment attempt scores, skills, and regional/financial preferences.
    """
    dna = CareerDNAService.generate_career_dna(db, user_id=current_user.id)
    return {
        "success": True,
        "message": "Career DNA synthesized successfully.",
        "data": dna
    }
