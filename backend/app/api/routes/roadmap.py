from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.roadmap_service import RoadmapService
from app.api.deps import get_current_user

router = APIRouter(prefix="/roadmap", tags=["Learning Roadmap"])

@router.get("/generate", response_model=dict)
def get_learning_roadmap(
    career_id_or_slug: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    roadmap = RoadmapService.generate_roadmap(
        db=db,
        user_id=current_user.id,
        career_id_or_slug=career_id_or_slug
    )
    return {"success": True, "data": roadmap}
