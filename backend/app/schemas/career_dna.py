from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class TraitIndicator(BaseModel):
    name: str
    score: float = Field(..., ge=0.0, le=100.0)
    rating: str  # Advanced, Proficient, Developing
    description: str

class ExplanatoryFactor(BaseModel):
    source: str  # Academic, Assessment, Interests, Skills, Constraints
    factor: str
    impact: str
    weight: str  # High, Moderate, Secondary

class CareerDNAResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    dominant_cluster: str
    confidence_score: float
    traits: List[TraitIndicator]
    why_this_profile: str
    explanatory_factors: List[ExplanatoryFactor]
    version: int
    created_at: datetime
    updated_at: datetime
