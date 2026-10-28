from typing import List
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.services.career_service import CareerService
from app.services.scholarship_service import ScholarshipService
from app.schemas.career import SavedCareerOut
from app.db.models.scholarship_chat import SavedScholarship, Scholarship

class SavedScholarshipOut(BaseModel):
    id: int
    scholarship_id: int
    title: str
    provider: str
    amount_per_annum: float
    scheme_type: str
    deadline_info: str

class UnifiedSavedHubOut(BaseModel):
    total_saved_count: int
    saved_careers: List[SavedCareerOut]
    saved_scholarships: List[SavedScholarshipOut]

class SavedHubService:
    @staticmethod
    def get_all_saved(db: Session, user_id: int) -> UnifiedSavedHubOut:
        careers = CareerService.get_saved_careers(db=db, user_id=user_id)

        sch_items = db.query(SavedScholarship).filter(SavedScholarship.user_id == user_id).all()
        sch_outs = []
        for s in sch_items:
            sch = db.query(Scholarship).filter(Scholarship.id == s.scholarship_id).first()
            if sch:
                sch_outs.append(
                    SavedScholarshipOut(
                        id=s.id,
                        scholarship_id=sch.id,
                        title=sch.title,
                        provider=sch.provider,
                        amount_per_annum=sch.amount_per_annum,
                        scheme_type=sch.scheme_type,
                        deadline_info=sch.deadline_info
                    )
                )

        return UnifiedSavedHubOut(
            total_saved_count=len(careers) + len(sch_outs),
            saved_careers=careers,
            saved_scholarships=sch_outs
        )
