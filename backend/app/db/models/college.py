from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class College(Base):
    __tablename__ = "colleges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    slug = Column(String(200), unique=True, nullable=False, index=True)
    district = Column(String(100), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    tnea_code = Column(String(20), nullable=True, index=True)
    nirf_rank = Column(Integer, nullable=True)
    naac_grade = Column(String(20), nullable=True)
    tuition_fee_annual = Column(Float, nullable=False, default=45000.0)
    hostel_fee_annual = Column(Float, nullable=False, default=40000.0)
    average_placement_ctc = Column(Float, nullable=False, default=600000.0)
    highest_placement_ctc = Column(Float, nullable=False, default=2400000.0)
    placement_percentage = Column(Float, default=85.0)
    top_recruiters = Column(JSON, default=list)
    campus_facilities = Column(JSON, default=list)
    overview = Column(Text, nullable=True)
    website_url = Column(String(255), nullable=True)
    
    # Data Provenance & Verification
    source_name = Column(String(150), default="DoTE Tamil Nadu / NIRF 2024")
    official_source_url = Column(String(255), nullable=True)
    academic_year = Column(String(20), default="2024-2025")
    verification_status = Column(String(50), default="verified") # verified, officially_sourced, historical, synthetic_demo
    last_verified_at = Column(DateTime(timezone=True), nullable=True, server_default=func.now())

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    courses = relationship("CollegeCourse", back_populates="college", cascade="all, delete-orphan")

class CollegeCourse(Base):
    __tablename__ = "college_courses"

    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    cutoff_marks_oc = Column(Float, default=180.0)
    cutoff_marks_bc = Column(Float, default=175.0)
    cutoff_marks_mbc = Column(Float, default=170.0)
    cutoff_marks_sc = Column(Float, default=155.0)
    cutoff_marks_st = Column(Float, default=145.0)
    intake_seats = Column(Integer, default=60)
    cutoff_year = Column(String(20), default="2024")
    source_name = Column(String(150), default="TNEA Single-Window Counseling")
    verification_status = Column(String(50), default="verified")

    college = relationship("College", back_populates="courses")
    course = relationship("Course")
