from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(100), nullable=False, index=True)
    question_type = Column(String(50), nullable=False) # 'aptitude' or 'interest'
    question_text = Column(Text, nullable=False)
    options = Column(JSON, nullable=False) # list of options
    correct_option_index = Column(Integer, nullable=True) # for aptitude
    scoring_weight = Column(Float, default=1.0)
    interest_dimension = Column(String(100), nullable=True)
    explanation = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    total_score = Column(Float, default=0.0)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    responses = relationship("AssessmentResponse", back_populates="attempt", cascade="all, delete-orphan")
    scores = relationship("AssessmentScore", back_populates="attempt", cascade="all, delete-orphan")
    user = relationship("User")

class AssessmentResponse(Base):
    __tablename__ = "assessment_responses"

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("assessment_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("assessment_questions.id"), nullable=False)
    selected_option_index = Column(Integer, nullable=False)
    is_correct = Column(Boolean, nullable=True)
    score_awarded = Column(Float, default=0.0)

    attempt = relationship("AssessmentAttempt", back_populates="responses")
    question = relationship("AssessmentQuestion")

class AssessmentScore(Base):
    __tablename__ = "assessment_scores"

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("assessment_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    dimension = Column(String(100), nullable=False) # e.g. Logical Reasoning, Technology Interest
    category_type = Column(String(50), nullable=False) # aptitude / interest
    normalized_score = Column(Float, nullable=False) # 0 to 100
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    attempt = relationship("AssessmentAttempt", back_populates="scores")
