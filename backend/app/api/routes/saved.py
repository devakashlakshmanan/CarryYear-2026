from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.saved_hub_service import SavedHubService
from app.api.deps import get_current_user

router = APIRouter(prefix="/saved", tags=["Saved Hub"])

@router.get("", response_model=dict)
def get_all_saved_items(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    saved_items = SavedHubService.get_all_saved(db=db, user_id=current_user.id)
    return {"success": True, "data": saved_items}
