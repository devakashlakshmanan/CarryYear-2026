from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict

class FactorBreakdown(BaseModel):
    academic_fit: float = Field(..., ge=0.0, le=100.0)
    aptitude_fit: float = Field(..., ge=0.0, le=100.0)
    interest_alignment: float = Field(..., ge=0.0, le=100.0)
    skill_match: float = Field(..., ge=0.0, le=100.0)
    financial_feasibility: float = Field(..., ge=0.0, le=100.0)
    location_fit: float = Field(..., ge=0.0, le=100.0)

class CareerRecommendationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    career_id: int
    career_title: str
    slug: str
    cluster: str
    industry: str
    match_score: float = Field(..., ge=0.0, le=100.0)
    match_tier: str  # High Match (>=80%), Moderate Match (65-79%), Potential Pathway (<65%)
    factors: FactorBreakdown
    explanation: str
    matching_skills: List[str]
    skill_gaps: List[str]
    salary_range_min: float
    salary_range_max: float
    growth_rate: str
    tamil_nadu_demand: str
    typical_pathway: str
    primary_degree: Optional[str] = None

class RecommendationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    total_evaluated: int
    dominant_cluster: str
    recommendations: List[CareerRecommendationOut]
