from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.deps import get_current_user
from app.db.models.user import User
from app.services.recommendation_service import RecommendationService
from app.schemas.recommendation import RecommendationResponse

router = APIRouter(prefix="/recommendations", tags=["Career Recommendations"])

@router.get("", response_model=dict)
def get_career_recommendations(
    industry: Optional[str] = Query(None, description="Filter recommendations by industry"),
    min_score: float = Query(0.0, ge=0.0, le=100.0, description="Minimum match percentage threshold"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate deterministic, explainable career recommendations tailored to current student's
    academic performance, cognitive aptitude, expressed interests, skills, and regional constraints.
    """
    res = RecommendationService.get_recommendations(
        db=db,
        user_id=current_user.id,
        industry=industry,
        min_score=min_score
    )
    return {
        "success": True,
        "data": res
    }
