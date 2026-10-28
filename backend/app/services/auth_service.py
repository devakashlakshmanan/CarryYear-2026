from typing import Optional
from sqlalchemy.orm import Session
from app.db.models.user import User
from app.db.models.student_profile import StudentProfile
from app.schemas.user import UserRegister, UserLogin
from app.core.security import get_password_hash, verify_password, create_access_token

class AuthService:
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email.lower().strip()).first()

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def register_user(db: Session, user_data: UserRegister) -> User:
        clean_email = user_data.email.lower().strip()
        existing = AuthService.get_user_by_email(db, clean_email)
        if existing:
            raise ValueError("An account with this email address already exists.")

        user = User(
            name=user_data.name.strip(),
            email=clean_email,
            password_hash=get_password_hash(user_data.password),
            is_active=True,
            is_admin=False
        )
        db.add(user)
        db.flush()

        # Initialize empty student profile
        profile = StudentProfile(
            user_id=user.id,
            state="Tamil Nadu",
            onboarding_completed=False
        )
        db.add(profile)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def authenticate_user(db: Session, login_data: UserLogin) -> User:
        clean_email = login_data.email.lower().strip()
        user = AuthService.get_user_by_email(db, clean_email)
        if not user:
            raise ValueError("Invalid email or password.")
        if not verify_password(login_data.password, user.password_hash):
            raise ValueError("Invalid email or password.")
        if not user.is_active:
            raise ValueError("This account has been deactivated.")
        return user

    @staticmethod
    def generate_token_for_user(user: User) -> str:
        return create_access_token(subject=str(user.id))
