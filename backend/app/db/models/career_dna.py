from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class CareerDNA(Base):
    __tablename__ = "career_dna"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    # Core multidimensional traits (e.g. Analytical Thinking, Technology Orientation, etc.)
    traits = Column(JSON, nullable=False)

    dominant_cluster = Column(String(150), nullable=False)
    confidence_score = Column(Float, default=85.0)

    # Explainable rationale and transparent input factor breakdown
    why_this_profile = Column(Text, nullable=False)
    explanatory_factors = Column(JSON, nullable=False)  # List of strings / objects

    # Feature representation for recommendation engine
    composite_vector = Column(JSON, nullable=True)

    version = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="career_dna")
