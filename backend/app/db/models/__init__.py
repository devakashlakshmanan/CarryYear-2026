from app.db.models.user import User
from app.db.models.student_profile import StudentProfile
from app.db.models.assessment import (
    AssessmentQuestion,
    AssessmentAttempt,
    AssessmentResponse,
    AssessmentScore
)
from app.db.models.career_dna import CareerDNA
from app.db.models.career import (
    Skill,
    EntranceExam,
    Course,
    CourseExam,
    Career,
    CareerSkill,
    CareerCourse
)
from app.db.models.saved_career import SavedCareer
from app.db.models.college import College, CollegeCourse
from app.db.models.scholarship_chat import Scholarship, SavedScholarship, ChatHistory

__all__ = [
    "User",
    "StudentProfile",
    "AssessmentQuestion",
    "AssessmentAttempt",
    "AssessmentResponse",
    "AssessmentScore",
    "CareerDNA",
    "Skill",
    "EntranceExam",
    "Course",
    "CourseExam",
    "Career",
    "CareerSkill",
    "CareerCourse",
    "SavedCareer",
    "College",
    "CollegeCourse",
    "Scholarship",
    "SavedScholarship",
    "ChatHistory"
]
