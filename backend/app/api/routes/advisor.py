from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.ai_advisor_service import AIAdvisorService, ChatRequestIn
from app.api.deps import get_current_user

router = APIRouter(prefix="/advisor", tags=["AI Advisor"])

@router.get("/history", response_model=dict)
def get_chat_history(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    history = AIAdvisorService.get_history(db=db, user_id=current_user.id)
    return {"success": True, "data": history}

@router.post("/chat", response_model=dict)
def send_chat_message(
    body: ChatRequestIn,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    reply = AIAdvisorService.chat(
        db=db,
        user_id=current_user.id,
        user_message=body.message
    )
    return {"success": True, "data": reply}
