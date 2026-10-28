from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.career_service import CareerService
from app.api.deps import get_current_user
from app.schemas.career import (
    CareerListOut,
    CareerDetailOut,
    SkillOut,
    CourseOut,
    EntranceExamOut
)

router = APIRouter(prefix="/careers", tags=["Careers"])

@router.get("", response_model=dict)
def list_careers(
    industry: Optional[str] = Query(None, description="Filter by industry"),
    cluster: Optional[str] = Query(None, description="Filter by career cluster"),
    search: Optional[str] = Query(None, description="Search query across title, description, and industry"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Search and filter careers from the Tamil Nadu and national career intelligence database.
    """
    careers = CareerService.get_careers(
        db=db,
        industry=industry,
        cluster=cluster,
        search=search,
        skip=skip,
        limit=limit
    )
    return {
        "success": True,
        "count": len(careers),
        "data": careers
    }

@router.get("/meta/skills", response_model=dict)
def list_skills(
    category: Optional[str] = Query(None, description="Filter by skill category"),
    db: Session = Depends(get_db)
):
    """
    Retrieve structured skills taxonomy across computing, engineering, healthcare, and business.
    """
    skills = CareerService.get_all_skills(db=db, category=category)
    return {
        "success": True,
        "count": len(skills),
        "data": skills
    }

@router.get("/meta/courses", response_model=dict)
def list_courses(
    stream: Optional[str] = Query(None, description="Filter by degree stream"),
    db: Session = Depends(get_db)
):
    """
    Retrieve academic degrees and courses offered in Tamil Nadu with entrance exam requirements.
    """
    courses = CareerService.get_all_courses(db=db, stream=stream)
    return {
        "success": True,
        "count": len(courses),
        "data": courses
    }

@router.get("/meta/exams", response_model=dict)
def list_entrance_exams(
    db: Session = Depends(get_db)
):
    """
    Retrieve state (TNEA, TANCET, CEETA-PG) and national entrance exams.
    """
    exams = CareerService.get_all_exams(db=db)
    return {
        "success": True,
        "count": len(exams),
        "data": exams
    }

@router.get("/saved", response_model=dict)
def get_user_saved_careers(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Retrieve all bookmarked careers for the authenticated user.
    """
    saved = CareerService.get_saved_careers(db=db, user_id=current_user.id)
    return {
        "success": True,
        "count": len(saved),
        "data": saved
    }

@router.get("/saved/ids", response_model=dict)
def get_user_saved_career_ids(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Retrieve list of saved career IDs for fast UI bookmark state resolution.
    """
    ids = CareerService.get_saved_career_ids(db=db, user_id=current_user.id)
    return {
        "success": True,
        "data": ids
    }

@router.post("/{career_id}/save", response_model=dict)
def save_career_bookmark(
    career_id: int,
    notes: Optional[str] = Query(None, description="Optional personal notes"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Bookmark a career for the authenticated user.
    """
    result = CareerService.save_career(db=db, user_id=current_user.id, career_id=career_id, notes=notes)
    return {
        "success": True,
        "message": "Career successfully bookmarked.",
        "data": result
    }

@router.delete("/{career_id}/save", response_model=dict)
def remove_career_bookmark(
    career_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Remove a career bookmark for the authenticated user.
    """
    removed = CareerService.unsave_career(db=db, user_id=current_user.id, career_id=career_id)
    return {
        "success": True,
        "message": "Career bookmark removed." if removed else "Bookmark did not exist.",
        "data": {"removed": removed}
    }

@router.get("/{id_or_slug}", response_model=dict)
def get_career_details(
    id_or_slug: str,
    db: Session = Depends(get_db)
):
    """
    Retrieve comprehensive career profile details, including required skills,
    degree pathways, entrance examinations, and salary insights.
    """
    career = CareerService.get_career_by_identifier(db=db, id_or_slug=id_or_slug)
    return {
        "success": True,
        "data": career
    }
