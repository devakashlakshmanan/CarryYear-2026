from sqlalchemy import Column, Integer, String, DateTime, Text, JSON
from sqlalchemy.sql import func
from app.db.database import Base

class DataIngestionRecord(Base):
    __tablename__ = "data_ingestions"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(100), nullable=False, index=True) # e.g. "colleges", "scholarships", "careers", "tnea_cutoffs"
    source_name = Column(String(200), nullable=False)
    source_url = Column(String(255), nullable=True)
    academic_year = Column(String(50), nullable=False, default="2024-2025")
    total_records = Column(Integer, default=0)
    verified_records = Column(Integer, default=0)
    stale_records = Column(Integer, default=0)
    status = Column(String(50), default="completed") # "completed", "partial", "failed"
    notes = Column(Text, nullable=True)
    ingestion_metadata = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
