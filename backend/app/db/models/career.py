from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), unique=True, nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    career_associations = relationship("CareerSkill", back_populates="skill", cascade="all, delete-orphan")

class EntranceExam(Base):
    __tablename__ = "entrance_exams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False, index=True)
    short_code = Column(String(50), nullable=False, index=True)
    conducting_body = Column(String(150), nullable=False)
    level = Column(String(50), nullable=False)  # State Level (Tamil Nadu), National Level
    mode = Column(String(100), nullable=False)  # TNEA Counseling, CBT Exam, etc.
    description = Column(Text, nullable=True)
    website_url = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    course_associations = relationship("CourseExam", back_populates="exam", cascade="all, delete-orphan")

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    short_code = Column(String(50), nullable=False, index=True)
    degree_level = Column(String(50), nullable=False)  # Undergraduate, Postgraduate, Diploma
    duration_years = Column(Float, nullable=False)
    stream = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    eligibility_criteria = Column(Text, nullable=True)
    average_annual_fee_min = Column(Float, default=40000.0)
    average_annual_fee_max = Column(Float, default=180000.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    exam_associations = relationship("CourseExam", back_populates="course", cascade="all, delete-orphan")
    career_associations = relationship("CareerCourse", back_populates="course", cascade="all, delete-orphan")

class CourseExam(Base):
    __tablename__ = "course_exams"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    exam_id = Column(Integer, ForeignKey("entrance_exams.id", ondelete="CASCADE"), nullable=False, index=True)
    is_mandatory = Column(Boolean, default=True)

    course = relationship("Course", back_populates="exam_associations")
    exam = relationship("EntranceExam", back_populates="course_associations")

class Career(Base):
    __tablename__ = "careers"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), unique=True, nullable=False, index=True)
    slug = Column(String(150), unique=True, nullable=False, index=True)
    cluster = Column(String(150), nullable=False, index=True)
    industry = Column(String(100), nullable=False, index=True)
    overview = Column(Text, nullable=False)
    short_description = Column(Text, nullable=False)
    typical_pathway = Column(Text, nullable=False)
    entry_education_level = Column(String(50), nullable=False)
    salary_range_min = Column(Float, nullable=False)
    salary_range_max = Column(Float, nullable=False)
    growth_rate = Column(String(50), default="High Growth")
    tamil_nadu_demand = Column(String(100), nullable=False)
    work_environment = Column(String(100), default="Hybrid / Tech Hubs")
    higher_studies_options = Column(JSON, default=list)
    alternative_careers = Column(JSON, default=list)
    
    # Data Provenance & Verification
    source_name = Column(String(150), default="NASSCOM / TN Skill Development Mission (TNSDC)")
    official_source_url = Column(String(255), nullable=True)
    verification_status = Column(String(50), default="verified") # verified, officially_sourced, historical, synthetic_demo
    last_verified_at = Column(DateTime(timezone=True), nullable=True, server_default=func.now())

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    skill_associations = relationship("CareerSkill", back_populates="career", cascade="all, delete-orphan")
    course_associations = relationship("CareerCourse", back_populates="career", cascade="all, delete-orphan")

class CareerSkill(Base):
    __tablename__ = "career_skills"

    id = Column(Integer, primary_key=True, index=True)
    career_id = Column(Integer, ForeignKey("careers.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    importance_weight = Column(Float, default=1.0)
    is_core = Column(Boolean, default=True)

    career = relationship("Career", back_populates="skill_associations")
    skill = relationship("Skill", back_populates="career_associations")

class CareerCourse(Base):
    __tablename__ = "career_courses"

    id = Column(Integer, primary_key=True, index=True)
    career_id = Column(Integer, ForeignKey("careers.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    is_primary = Column(Boolean, default=True)
    relevance_score = Column(Float, default=100.0)

    career = relationship("Career", back_populates="course_associations")
    course = relationship("Course", back_populates="career_associations")
