from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.education_pathway_service import EducationPathwayService
from app.schemas.pathway import EducationPathwayOut

router = APIRouter(prefix="/education-paths", tags=["Education Pathways"])

@router.get("", response_model=dict)
def list_available_pathways(db: Session = Depends(get_db)):
    """
    Retrieve concise catalog of all career pathways available for roadmap exploration.
    """
    pathways = EducationPathwayService.list_all_pathways(db=db)
    return {
        "success": True,
        "count": len(pathways),
        "data": pathways
    }

@router.get("/{id_or_slug}", response_model=dict)
def get_career_education_pathway(
    id_or_slug: str,
    db: Session = Depends(get_db)
):
    """
    Retrieve structured multi-stage education and career pathway graph for a given career,
    including school preparation, Tamil Nadu entrance exams (TNEA, NEET, JEE), undergraduate
    degree options, essential skills, early career milestones, and higher studies.
    """
    pathway = EducationPathwayService.get_pathway_for_career(db=db, id_or_slug=id_or_slug)
    return {
        "success": True,
        "data": pathway
    }
