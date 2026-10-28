from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models.user import User
from app.schemas.user import UserRegister, UserLogin, UserResponse, TokenData
from app.schemas.common import ApiResponse
from app.services.auth_service import AuthService
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=ApiResponse[TokenData], status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    try:
        user = AuthService.register_user(db, user_in)
        token = AuthService.generate_token_for_user(user)
        user_resp = UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            is_active=user.is_active,
            is_admin=user.is_admin,
            onboarding_completed=user.profile.onboarding_completed if user.profile else False,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
        return ApiResponse(
            success=True,
            message="Registration successful.",
            data=TokenData(
                access_token=token,
                token_type="bearer",
                user=user_resp
            )
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/login", response_model=ApiResponse[TokenData])
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    try:
        user = AuthService.authenticate_user(db, login_in)
        token = AuthService.generate_token_for_user(user)
        user_resp = UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            is_active=user.is_active,
            is_admin=user.is_admin,
            onboarding_completed=user.profile.onboarding_completed if user.profile else False,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
        return ApiResponse(
            success=True,
            message="Login successful.",
            data=TokenData(
                access_token=token,
                token_type="bearer",
                user=user_resp
            )
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

@router.get("/me", response_model=ApiResponse[UserResponse])
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    user_resp = UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        is_active=current_user.is_active,
        is_admin=current_user.is_admin,
        onboarding_completed=current_user.profile.onboarding_completed if current_user.profile else False,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )
    return ApiResponse(
        success=True,
        message="Profile retrieved successfully.",
        data=user_resp
    )
