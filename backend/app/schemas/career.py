from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class SkillOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: str
    description: Optional[str] = None

class EntranceExamOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    short_code: str
    conducting_body: str
    level: str
    mode: str
    description: Optional[str] = None
    website_url: Optional[str] = None

class CourseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    short_code: str
    degree_level: str
    duration_years: float
    stream: str
    description: Optional[str] = None
    eligibility_criteria: Optional[str] = None
    average_annual_fee_min: float
    average_annual_fee_max: float
    exams: List[EntranceExamOut] = []

class CareerSkillOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: str
    importance_weight: float
    is_core: bool

class CareerCourseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    short_code: str
    degree_level: str
    duration_years: float
    stream: str
    is_primary: bool
    relevance_score: float
    exams: List[EntranceExamOut] = []

class CareerListOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    slug: str
    cluster: str
    industry: str
    short_description: str
    typical_pathway: str
    entry_education_level: str
    salary_range_min: float
    salary_range_max: float
    growth_rate: str
    tamil_nadu_demand: str
    work_environment: str
    key_skills: List[str] = []

class CareerDetailOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    slug: str
    cluster: str
    industry: str
    overview: str
    short_description: str
    typical_pathway: str
    entry_education_level: str
    salary_range_min: float
    salary_range_max: float
    growth_rate: str
    tamil_nadu_demand: str
    work_environment: str
    higher_studies_options: List[str] = []
    alternative_careers: List[str] = []
    skills: List[CareerSkillOut] = []
    courses: List[CareerCourseOut] = []
    created_at: datetime

class SavedCareerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    career_id: int
    career: CareerListOut
    notes: Optional[str] = None
    created_at: datetime

