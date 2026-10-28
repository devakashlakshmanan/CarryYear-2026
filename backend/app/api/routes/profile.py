from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models.user import User
from app.schemas.profile import ProfileUpdate, ProfileResponse
from app.schemas.common import ApiResponse
from app.services.profile_service import ProfileService
from app.api.deps import get_current_user

router = APIRouter(prefix="/profile", tags=["Student Profile"])

@router.get("", response_model=ApiResponse[ProfileResponse])
def get_student_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = ProfileService.get_or_create_profile(db, current_user)
    serialized = ProfileService.serialize_profile(profile, current_user)
    return ApiResponse(
        success=True,
        message="Student profile retrieved successfully.",
        data=serialized
    )

@router.put("", response_model=ApiResponse[ProfileResponse])
def update_student_profile(
    profile_in: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    updated = ProfileService.update_profile(db, current_user, profile_in)
    serialized = ProfileService.serialize_profile(updated, current_user)
    return ApiResponse(
        success=True,
        message="Student profile updated successfully.",
        data=serialized
    )
