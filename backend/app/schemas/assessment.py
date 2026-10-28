from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class QuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category: str
    question_type: str  # 'aptitude' or 'interest'
    question_text: str
    options: List[str]
    interest_dimension: Optional[str] = None
    scoring_weight: float = 1.0

class AnswerSubmission(BaseModel):
    question_id: int
    selected_option_index: int = Field(..., ge=0, le=10)

class AssessmentSubmitRequest(BaseModel):
    answers: List[AnswerSubmission]

class DimensionScoreOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    dimension: str
    category_type: str  # 'aptitude' or 'interest'
    normalized_score: float = Field(..., ge=0.0, le=100.0)

class AssessmentResponseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    question_id: int
    category: str
    question_type: str
    selected_option_index: int
    is_correct: Optional[bool] = None
    score_awarded: float

class AssessmentResultResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    attempt_id: int
    total_score: float
    completed: bool
    created_at: datetime
    dimension_scores: List[DimensionScoreOut]
    aptitude_average: float
    top_interests: List[str]
    summary: str
