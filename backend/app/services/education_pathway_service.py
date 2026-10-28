from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.db.models.career import Career, CareerSkill, CareerCourse, Course, CourseExam, EntranceExam, Skill
from app.services.career_service import CareerService
from app.schemas.career import EntranceExamOut
from app.schemas.pathway import (
    EducationPathwayOut,
    PathwayMilestone,
    PathwayDegreeNode,
    PathwaySkillNode,
)

class EducationPathwayService:
    @staticmethod
    def get_pathway_for_career(db: Session, id_or_slug: str) -> EducationPathwayOut:
        CareerService.ensure_seeded(db)

        query = db.query(Career).options(
            joinedload(Career.skill_associations).joinedload(CareerSkill.skill),
            joinedload(Career.course_associations).joinedload(CareerCourse.course).joinedload(Course.exam_associations).joinedload(CourseExam.exam)
        )

        if id_or_slug.isdigit():
            career = query.filter(Career.id == int(id_or_slug)).first()
        else:
            career = query.filter(Career.slug == id_or_slug).first()

        if not career:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Career '{id_or_slug}' not found in pathway registry."
            )

        # 1. Degree Nodes
        degrees: List[PathwayDegreeNode] = []
        primary_degree_name = "Bachelor's Degree"
        for cc in sorted(career.course_associations, key=lambda x: (x.is_primary, x.relevance_score), reverse=True):
            if not cc.course:
                continue
            if cc.is_primary:
                primary_degree_name = cc.course.short_code or cc.course.name

            exam_outs = [
                EntranceExamOut.model_validate(ce.exam)
                for ce in cc.course.exam_associations
                if ce.exam
            ]

            degrees.append(
                PathwayDegreeNode(
                    id=cc.course.id,
                    name=cc.course.name,
                    short_code=cc.course.short_code,
                    degree_level=cc.course.degree_level,
                    duration_years=cc.course.duration_years,
                    stream=cc.course.stream,
                    is_primary=cc.is_primary,
                    relevance_score=cc.relevance_score,
                    annual_fee_min=cc.course.average_annual_fee_min,
                    annual_fee_max=cc.course.average_annual_fee_max,
                    eligibility_criteria=cc.course.eligibility_criteria,
                    exams=exam_outs
                )
            )

        # 2. Skill Nodes
        skills: List[PathwaySkillNode] = []
        for cs in sorted(career.skill_associations, key=lambda x: (x.is_core, x.importance_weight), reverse=True):
            if not cs.skill:
                continue
            skills.append(
                PathwaySkillNode(
                    id=cs.skill.id,
                    name=cs.skill.name,
                    category=cs.skill.category,
                    importance_weight=cs.importance_weight,
                    is_core=cs.is_core
                )
            )

        # 3. Determine Higher Secondary preparation stream
        is_engineering = "Engineering" in career.cluster or "Data" in career.cluster or "Robotics" in career.cluster
        is_medical = "Bio" in career.cluster or "Healthcare" in career.cluster
        is_design = "Creative" in career.cluster or "Design" in career.cluster
        is_business = "Management" in career.cluster or "FinTech" in career.cluster

        if is_engineering:
            school_stream = "Class 11 & 12 (Physics, Chemistry, Mathematics - PCM / Computer Science)"
            school_desc = "Score high aggregate in Maths, Physics, and Chemistry for Anna University TNEA engineering counseling cut-off (calculated out of 200 marks)."
            school_tags = ["Class 12 PCM", "TNEA Cut-off Target: 185-198+", "JEE Main Foundation"]
        elif is_medical:
            school_stream = "Class 11 & 12 (Physics, Chemistry, Biology / Maths - PCMB)"
            school_desc = "Master cellular biology, organic chemistry, and physics. Prepare for TNEA biomedical single-window counseling or NEET entrance examination."
            school_tags = ["Class 12 PCB/PCMB", "TNEA Biomedical Merit", "NEET-UG Option"]
        elif is_design:
            school_stream = "Class 11 & 12 (Any Academic Stream with Visual Arts / Computer Science)"
            school_desc = "Focus on aesthetic composition, digital media literacy, creative reasoning, and foundational drawing/prototyping skills."
            school_tags = ["Class 12 Any Stream", "Design Portfolio", "UCEED / NID / State Entrance"]
        else:
            school_stream = "Class 11 & 12 (Commerce / Mathematics / Computer Science)"
            school_desc = "Build rigorous foundations in business mathematics, statistics, economics, and analytical problem-solving."
            school_tags = ["Class 12 Commerce/Maths", "TANCET / CUET Foundation", "Quantitative Aptitude"]

        # Step 1: School Preparation
        step1 = PathwayMilestone(
            step_number=1,
            stage_name="Higher Secondary Foundation",
            title=f"Secondary School Track: {school_stream}",
            subtitle="Grades 11-12 Board Examinations & Cut-off Strategy",
            description=school_desc,
            duration_estimate="2 Years (Standards XI & XII)",
            tags=school_tags,
            metadata={"stream": school_stream}
        )

        # Step 2: Undergraduate Degree
        all_exams_set = set()
        for d in degrees:
            for ex in d.exams:
                all_exams_set.add(ex.short_code)
        exams_str = ", ".join(sorted(all_exams_set)) if all_exams_set else "Merit Counseling"

        step2 = PathwayMilestone(
            step_number=2,
            stage_name="Undergraduate Degree",
            title=f"Academic Degree: {primary_degree_name}",
            subtitle=f"Entrance / Counseling: {exams_str}",
            description=f"Complete a recognized Bachelor's program in Tamil Nadu (e.g. Anna University CEG/MIT, PSG Tech, CIT, NIT Trichy) covering accredited academic coursework and mandatory lab practicums.",
            duration_estimate="3 to 4 Years",
            tags=list(all_exams_set) + ["UG Degree", "Anna University Affiliated / Autonomous"],
            metadata={"degrees_count": len(degrees), "primary_degree": primary_degree_name}
        )

        # Step 3: Skill Building & Practicum
        core_skill_names = [s.name for s in skills if s.is_core][:4]
        step3 = PathwayMilestone(
            step_number=3,
            stage_name="Competency & Skill Portfolio",
            title="Industry Competency Mastery & Project Portfolio",
            subtitle="Hands-on Systems, GitHub Projects & Industry Internships",
            description=f"Build hands-on mastery in essential competencies: {', '.join(core_skill_names)}. Secure 6-8 month internships across Chennai OMR, TIDEL Park, or Coimbatore industrial corridors.",
            duration_estimate="Simultaneous with Semesters 5-8",
            tags=core_skill_names + ["Capstone Project", "Industrial Internship"],
            metadata={"skills_count": len(skills)}
        )

        # Step 4: Early Career Placement
        step4 = PathwayMilestone(
            step_number=4,
            stage_name="Career Launch",
            title=f"Entry Role: {career.title}",
            subtitle=f"Starting CTC: ₹{career.salary_range_min/100000:.1f} - ₹{career.salary_range_max/100000:.1f} LPA",
            description=f"Gain campus or lateral placement in Tamil Nadu's leading tech and industrial clusters: {career.tamil_nadu_demand}.",
            duration_estimate="0 - 3 Years Post-Graduation",
            tags=[f"Growth: {career.growth_rate}", f"₹{career.salary_range_min/100000:.1f}L Min CTC", "Tamil Nadu Recruiter Base"],
            metadata={"min_ctc": career.salary_range_min, "max_ctc": career.salary_range_max}
        )

        # Step 5: Higher Studies & Leadership
        higher_opts = career.higher_studies_options or ["M.Tech / M.E via CEETA-PG", "MBA via TANCET", "Executive Specializations"]
        step5 = PathwayMilestone(
            step_number=5,
            stage_name="Advanced Studies & Leadership",
            title="Postgraduate Specialization & Executive Progression",
            subtitle="CEETA-PG, TANCET, GATE, or Senior Technical Leadership",
            description=f"Advance into senior architect or leadership roles via higher education options: {', '.join(higher_opts)}.",
            duration_estimate="3+ Years Onward",
            tags=higher_opts[:3] + ["Senior Leadership"],
            metadata={"options": higher_opts}
        )

        all_milestones = [step1, step2, step3, step4, step5]

        return EducationPathwayOut(
            career_id=career.id,
            career_title=career.title,
            career_slug=career.slug,
            industry=career.industry,
            cluster=career.cluster,
            entry_education_level=career.entry_education_level,
            tamil_nadu_demand=career.tamil_nadu_demand,
            salary_range_min=career.salary_range_min,
            salary_range_max=career.salary_range_max,
            growth_rate=career.growth_rate,
            typical_pathway_summary=career.typical_pathway,
            school_preparation=step1,
            undergraduate_milestone=step2,
            degrees=degrees,
            skill_milestone=step3,
            skills=skills,
            career_launch_milestone=step4,
            higher_studies_milestone=step5,
            higher_studies_options=career.higher_studies_options or [],
            alternative_careers=career.alternative_careers or [],
            all_milestones=all_milestones
        )

    @staticmethod
    def list_all_pathways(db: Session) -> List[dict]:
        """Returns concise listing of all career pathways for the pathway explorer dropdown."""
        CareerService.ensure_seeded(db)
        careers = db.query(Career.id, Career.title, Career.slug, Career.cluster, Career.industry).order_by(Career.title.asc()).all()
        return [
            {
                "id": c.id,
                "title": c.title,
                "slug": c.slug,
                "cluster": c.cluster,
                "industry": c.industry
            }
            for c in careers
        ]
