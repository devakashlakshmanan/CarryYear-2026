from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.career import EntranceExamOut

class PathwayExamNode(BaseModel):
    id: int
    name: str
    short_code: str
    conducting_body: str
    level: str
    mode: str
    description: Optional[str] = None
    website_url: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class PathwayDegreeNode(BaseModel):
    id: int
    name: str
    short_code: str
    degree_level: str
    duration_years: float
    stream: str
    is_primary: bool
    relevance_score: float
    annual_fee_min: float
    annual_fee_max: float
    eligibility_criteria: Optional[str] = None
    exams: List[EntranceExamOut] = []
    model_config = ConfigDict(from_attributes=True)

class PathwaySkillNode(BaseModel):
    id: int
    name: str
    category: str
    importance_weight: float
    is_core: bool
    model_config = ConfigDict(from_attributes=True)

class PathwayMilestone(BaseModel):
    step_number: int
    stage_name: str
    title: str
    subtitle: str
    description: str
    duration_estimate: str
    tags: List[str] = []
    metadata: dict = {}

class EducationPathwayOut(BaseModel):
    career_id: int
    career_title: str
    career_slug: str
    industry: str
    cluster: str
    entry_education_level: str
    tamil_nadu_demand: str
    salary_range_min: float
    salary_range_max: float
    growth_rate: str
    typical_pathway_summary: str
    school_preparation: PathwayMilestone
    undergraduate_milestone: PathwayMilestone
    degrees: List[PathwayDegreeNode]
    skill_milestone: PathwayMilestone
    skills: List[PathwaySkillNode]
    career_launch_milestone: PathwayMilestone
    higher_studies_milestone: PathwayMilestone
    higher_studies_options: List[str]
    alternative_careers: List[str]
    all_milestones: List[PathwayMilestone]
    model_config = ConfigDict(from_attributes=True)
