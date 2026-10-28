from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.scholarship_service import ScholarshipService
from app.api.deps import get_current_user

router = APIRouter(prefix="/scholarships", tags=["Scholarships"])

@router.get("", response_model=dict)
def list_scholarships(
    scheme_type: Optional[str] = Query(None),
    community: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    items = ScholarshipService.get_scholarships(
        db=db,
        scheme_type=scheme_type,
        community=community,
        search=search,
        skip=skip,
        limit=limit
    )
    return {"success": True, "count": len(items), "data": items}

@router.get("/match", response_model=dict)
def match_scholarships(
    community: Optional[str] = Query(None),
    income: Optional[float] = Query(None),
    first_graduate: Optional[bool] = Query(None),
    govt_school: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    matches = ScholarshipService.match_scholarships_for_user(
        db=db,
        user_id=current_user.id,
        custom_community=community,
        custom_income=income,
        is_first_graduate=first_graduate,
        is_govt_school=govt_school
    )
    return {"success": True, "data": matches}

@router.post("/{scholarship_id}/toggle-save", response_model=dict)
def toggle_save_scholarship(
    scholarship_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    saved = ScholarshipService.toggle_save_scholarship(db=db, user_id=current_user.id, scholarship_id=scholarship_id)
    return {"success": True, "data": {"saved": saved}}

@router.get("/{slug}", response_model=dict)
def get_scholarship_by_slug(slug: str, db: Session = Depends(get_db)):
    sch = ScholarshipService.get_scholarship_by_slug(db=db, slug=slug)
    return {"success": True, "data": sch}
