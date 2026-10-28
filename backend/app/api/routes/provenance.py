from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.ingestion_service import IngestionService

router = APIRouter(prefix="/data-provenance", tags=["Data Provenance & Ingestion"])

@router.get("/summary", response_model=dict)
def get_provenance_summary(db: Session = Depends(get_db)):
    """
    Retrieve live data provenance summary: verified record counts, official sources,
    academic year validity, and ingestion audit log.
    """
    summary = IngestionService.get_provenance_summary(db)
    return {
        "success": True,
        "message": "Data provenance summary retrieved successfully.",
        "data": summary
    }

@router.post("/sync", response_model=dict)
def sync_official_data_sources(db: Session = Depends(get_db)):
    """
    Synchronize and verify Tamil Nadu higher education directories, cutoffs, and scholarship schemes
    with official government sources (TNEA, DoTE, National Scholarship Portal, Naan Mudhalvan).
    """
    result = IngestionService.sync_official_sources(db)
    return {
        "success": True,
        "message": "Tamil Nadu education and scholarship datasets verified and synchronized.",
        "data": result
    }
