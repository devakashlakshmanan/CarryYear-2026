from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.services.skill_gap_service import SkillGapService

class LearningResource(BaseModel):
    title: str
    provider: str
    format: str # Video / Interactive / Project
    is_free: bool
    url: str

class RoadmapPhase(BaseModel):
    phase_number: int
    title: str
    timeline: str
    focus_objective: str
    milestones: List[str]
    curated_resources: List[LearningResource]
    hands_on_deliverable: str

class LearningRoadmapOut(BaseModel):
    target_career: str
    total_duration: str
    estimated_weekly_commitment: str
    phases: List[RoadmapPhase]
    recommended_certifications: List[str]
    tamil_nadu_internship_portals: List[str]

class RoadmapService:
    @staticmethod
    def generate_roadmap(db: Session, user_id: int, career_id_or_slug: Optional[str] = None) -> LearningRoadmapOut:
        gap_res = SkillGapService.analyze_skill_gap(db, user_id=user_id, career_id_or_slug=career_id_or_slug)
        career_title = gap_res.target_career_title
        missing_skills = gap_res.top_priority_skills_to_learn or ["Python", "SQL", "Machine Learning"]

        phase1 = RoadmapPhase(
            phase_number=1,
            title="Foundational Core Competencies",
            timeline="Months 1 - 3 (Weeks 1 to 12)",
            focus_objective=f"Master fundamental programming principles, algorithmic logic, and data modeling for {career_title}.",
            milestones=[
                f"Complete syntax & standard libraries in {missing_skills[0] if len(missing_skills) > 0 else 'Python'}",
                "Build algorithmic problem-solving habits (solve 40+ LeetCode/HackerRank challenges)",
                "Version control & Git collaboration on personal GitHub profile"
            ],
            curated_resources=[
                LearningResource(
                    title="Python for Applied Computing (Tamil & English)",
                    provider="NPTEL - IIT Madras",
                    format="Video & Assignment Series",
                    is_free=True,
                    url="https://nptel.ac.in"
                ),
                LearningResource(
                    title="Naan Mudhalvan Foundational Tech Upskilling",
                    provider="Government of Tamil Nadu",
                    format="Interactive Portal",
                    is_free=True,
                    url="https://naanmudhalvan.tn.gov.in"
                ),
                LearningResource(
                    title="Scientific Computing with Python",
                    provider="freeCodeCamp",
                    format="Interactive Exercises",
                    is_free=True,
                    url="https://www.freecodecamp.org"
                )
            ],
            hands_on_deliverable="Deploy an automated data ingestion or command-line system published as a public GitHub repo with documentation."
        )

        phase2 = RoadmapPhase(
            phase_number=2,
            title="Specialized Systems & Architectural Deep-Dive",
            timeline="Months 4 - 7 (Weeks 13 to 28)",
            focus_objective=f"Deepen mastery in specialized domain tooling: {', '.join(missing_skills[1:3]) if len(missing_skills) > 1 else 'Machine Learning & Cloud Systems'}.",
            milestones=[
                "Implement end-to-end relational schemas & optimized SQL queries",
                "Train, validate, and evaluate predictive machine learning or embedded logic",
                "Integrate REST APIs and microservice communication contracts"
            ],
            curated_resources=[
                LearningResource(
                    title="Applied Machine Learning & Deep Learning",
                    provider="Coursera / DeepLearning.AI",
                    format="Courseware & Labs",
                    is_free=False,
                    url="https://www.coursera.org"
                ),
                LearningResource(
                    title="Database Management Systems & Optimization",
                    provider="NPTEL - IIT Kharagpur",
                    format="Video Lecture Series",
                    is_free=True,
                    url="https://nptel.ac.in"
                )
            ],
            hands_on_deliverable="End-to-end full stack or AI predictive application connected to a live database and hosted on cloud infrastructure."
        )

        phase3 = RoadmapPhase(
            phase_number=3,
            title="Production Portfolio & Open Source Contributions",
            timeline="Months 8 - 10 (Weeks 29 to 40)",
            focus_objective="Demonstrate production-grade craftsmanship through capstone development and open source contributions.",
            milestones=[
                "Containerize applications with Docker and configure CI/CD actions",
                "Contribute code patches or documentation to active open source repos",
                "Present project architecture in a technical blog or LinkedIn showcase"
            ],
            curated_resources=[
                LearningResource(
                    title="Docker & Cloud DevOps Fundamentals",
                    provider="Docker / AWS Educate",
                    format="Hands-on Sandbox",
                    is_free=True,
                    url="https://aws.amazon.com/education/awseducate"
                )
            ],
            hands_on_deliverable="Production-ready capstone project solving a tangible Tamil Nadu public sector or industrial problem (e.g. smart agriculture, traffic, health registries)."
        )

        phase4 = RoadmapPhase(
            phase_number=4,
            title="Industry Placement & Interview Readiness",
            timeline="Months 11 - 12 (Weeks 41 to 52)",
            focus_objective="Ace technical assessments, system design interviews, and campus recruitment drives across Tamil Nadu IT parks.",
            milestones=[
                "Complete 10 mock technical and behavioral interviews",
                "Resume review aligned with Chennai & Coimbatore tech hiring standards",
                "Apply to 20+ verified campus and off-campus tech internship positions"
            ],
            curated_resources=[
                LearningResource(
                    title="TNEA & Tamil Nadu State Placement Preparation",
                    provider="Anna University CUIC (Centre for University-Industry Collaboration)",
                    format="Placement Guidebook",
                    is_free=True,
                    url="https://www.annauniv.edu/cuic"
                )
            ],
            hands_on_deliverable="Polished interactive portfolio website with live demos, code repos, and verified credentials."
        )

        return LearningRoadmapOut(
            target_career=career_title,
            total_duration="12 Months Structured Track",
            estimated_weekly_commitment="8 - 12 Hours / Week",
            phases=[phase1, phase2, phase3, phase4],
            recommended_certifications=[
                "AWS Certified Cloud Practitioner or Solutions Architect",
                "TensorFlow / PyTorch Developer Certificate",
                "NPTEL Elite Gold Certification in Algorithms & Data Structures"
            ],
            tamil_nadu_internship_portals=[
                "Naan Mudhalvan Internship Exchange",
                "TIDEL Park IT Talent Portal (Chennai & Coimbatore)",
                "AICTE Internships Portal (Tamil Nadu Chapter)",
                "Anna University CUIC Campus Drives"
            ]
        )
