from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.skill_gap_service import SkillGapService
from app.api.deps import get_current_user

router = APIRouter(prefix="/skills", tags=["Skill Gap Analysis"])

@router.get("/gap-analysis", response_model=dict)
def get_skill_gap_analysis(
    career_id_or_slug: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    analysis = SkillGapService.analyze_skill_gap(
        db=db,
        user_id=current_user.id,
        career_id_or_slug=career_id_or_slug
    )
    return {"success": True, "data": analysis}
