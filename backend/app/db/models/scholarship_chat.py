from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class Scholarship(Base):
    __tablename__ = "scholarships"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    slug = Column(String(200), unique=True, nullable=False, index=True)
    provider = Column(String(150), nullable=False)  # Tamil Nadu Govt, Central Govt, AICTE, Trust
    scheme_type = Column(String(100), nullable=False) # State Government, Merit, Community, First Graduate
    amount_per_annum = Column(Float, nullable=False) # e.g. 50000.0 or 0 (full tuition waiver)
    is_full_tuition_waiver = Column(Boolean, default=False)
    description = Column(Text, nullable=False)
    eligibility_community = Column(JSON, default=list) # ["OC", "BC", "MBC", "SC", "ST", "ALL"]
    max_family_income = Column(Float, nullable=True) # e.g. 250000.0 (annual)
    min_academic_percentage = Column(Float, nullable=True) # e.g. 60.0%
    gender_requirement = Column(String(50), default="ANY") # "ANY", "FEMALE", "MALE"
    first_graduate_only = Column(Boolean, default=False)
    govt_school_quota_only = Column(Boolean, default=False) # 7.5% TN Govt school quota
    required_documents = Column(JSON, default=list)
    application_portal_url = Column(String(255), nullable=True)
    deadline_info = Column(String(100), default="Annual TNEA Counseling Season")
    
    # Data Provenance & Verification
    source_name = Column(String(150), default="National Scholarship Portal / TN Welfare Dept")
    academic_year = Column(String(20), default="2024-2025")
    verification_status = Column(String(50), default="verified") # verified, officially_sourced, historical, synthetic_demo
    last_verified_at = Column(DateTime(timezone=True), nullable=True, server_default=func.now())

    created_at = Column(DateTime(timezone=True), server_default=func.now())

class SavedScholarship(Base):
    __tablename__ = "saved_scholarships"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    scholarship_id = Column(Integer, ForeignKey("scholarships.id", ondelete="CASCADE"), nullable=False, index=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    scholarship = relationship("Scholarship")

class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(20), nullable=False) # "user", "assistant", "system"
    content = Column(Text, nullable=False)
    context_metadata = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
