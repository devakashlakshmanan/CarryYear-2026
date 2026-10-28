from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class CollegeCourseCutoffOut(BaseModel):
    id: int
    course_id: int
    course_name: str
    short_code: str
    stream: str
    duration_years: float
    cutoff_marks_oc: float
    cutoff_marks_bc: float
    cutoff_marks_mbc: float
    cutoff_marks_sc: float
    cutoff_marks_st: float
    intake_seats: int
    model_config = ConfigDict(from_attributes=True)

class CollegeListOut(BaseModel):
    id: int
    name: str
    slug: str
    district: str
    category: str
    tnea_code: Optional[str] = None
    nirf_rank: Optional[int] = None
    naac_grade: Optional[str] = None
    tuition_fee_annual: float
    hostel_fee_annual: float
    average_placement_ctc: float
    highest_placement_ctc: float
    placement_percentage: float
    top_recruiters: List[str] = []
    courses_count: int = 0
    model_config = ConfigDict(from_attributes=True)

class CollegeDetailOut(BaseModel):
    id: int
    name: str
    slug: str
    district: str
    category: str
    tnea_code: Optional[str] = None
    nirf_rank: Optional[int] = None
    naac_grade: Optional[str] = None
    tuition_fee_annual: float
    hostel_fee_annual: float
    average_placement_ctc: float
    highest_placement_ctc: float
    placement_percentage: float
    top_recruiters: List[str] = []
    campus_facilities: List[str] = []
    overview: Optional[str] = None
    website_url: Optional[str] = None
    offered_courses: List[CollegeCourseCutoffOut] = []
    model_config = ConfigDict(from_attributes=True)

class CollegeMatchItem(BaseModel):
    college_id: int
    college_name: str
    college_slug: str
    district: str
    category: str
    tnea_code: Optional[str] = None
    nirf_rank: Optional[int] = None
    naac_grade: Optional[str] = None
    course_id: int
    course_name: str
    course_short_code: str
    student_cutoff: float
    required_cutoff: float
    cutoff_delta: float  # student_cutoff - required_cutoff
    match_category: str  # "Reach", "Target", "Safe"
    financial_status: str  # "Affordable", "Moderate Stretch", "High Budget Gap"
    total_annual_cost: float
    user_annual_budget: float
    budget_surplus_or_deficit: float
    average_placement_ctc: float
    highest_placement_ctc: float
    top_recruiters: List[str] = []
    district_match: bool
    model_config = ConfigDict(from_attributes=True)

class CollegeMatchingResponse(BaseModel):
    student_cutoff: float
    student_quota: str
    student_budget: float
    preferred_district: Optional[str] = None
    total_matches: int
    reach_colleges: List[CollegeMatchItem] = []
    target_colleges: List[CollegeMatchItem] = []
    safe_colleges: List[CollegeMatchItem] = []
    model_config = ConfigDict(from_attributes=True)
