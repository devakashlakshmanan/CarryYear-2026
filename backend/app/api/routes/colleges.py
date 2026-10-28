from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.college_service import CollegeService
from app.api.deps import get_current_user
from app.schemas.college import (
    CollegeListOut,
    CollegeDetailOut,
    CollegeMatchingResponse
)

router = APIRouter(prefix="/colleges", tags=["Colleges & Matching"])

@router.get("", response_model=dict)
def list_colleges(
    district: Optional[str] = Query(None, description="Filter by Tamil Nadu district"),
    category: Optional[str] = Query(None, description="Filter by college category"),
    max_fee: Optional[float] = Query(None, description="Maximum annual tuition fee"),
    min_placement_ctc: Optional[float] = Query(None, description="Minimum average placement CTC"),
    search: Optional[str] = Query(None, description="Search query by name, district, or TNEA code"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Search and filter verified Tamil Nadu colleges and universities.
    """
    colleges = CollegeService.get_colleges(
        db=db,
        district=district,
        category=category,
        max_fee=max_fee,
        min_placement_ctc=min_placement_ctc,
        search=search,
        skip=skip,
        limit=limit
    )
    return {
        "success": True,
        "count": len(colleges),
        "data": colleges
    }

@router.get("/meta/districts", response_model=dict)
def list_college_districts(db: Session = Depends(get_db)):
    """
    Retrieve unique Tamil Nadu districts with accredited engineering and technology colleges.
    """
    districts = CollegeService.get_all_districts(db=db)
    return {
        "success": True,
        "data": districts
    }

@router.get("/match", response_model=dict)
def match_colleges_for_user(
    quota: str = Query("OC", description="Reservation Category quota (OC, BC, BCM, MBC, SC, ST)"),
    target_course: Optional[str] = Query(None, description="Filter by course e.g. 'B.E. CSE', 'B.Tech AI & DS'"),
    custom_cutoff: Optional[float] = Query(None, description="Simulate with custom TNEA cut-off mark (0-200)"),
    custom_budget: Optional[float] = Query(None, description="Simulate with custom annual budget limit"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Generate personalized Tamil Nadu college recommendations categorized into
    Reach, Target, and Safe buckets based on student's TNEA cutoff score, budget, and reservation quota.
    """
    match_result = CollegeService.match_colleges_for_student(
        db=db,
        user_id=current_user.id,
        quota=quota,
        target_course=target_course,
        custom_cutoff=custom_cutoff,
        custom_budget=custom_budget
    )
    return {
        "success": True,
        "data": match_result
    }

@router.get("/{id_or_slug}", response_model=dict)
def get_college_detail(
    id_or_slug: str,
    db: Session = Depends(get_db)
):
    """
    Retrieve comprehensive college details including TNEA cutoffs across reservation categories,
    placement statistics, campus facilities, and recruiters.
    """
    college = CollegeService.get_college_by_identifier(db=db, id_or_slug=id_or_slug)
    return {
        "success": True,
        "data": college
    }
