from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
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
from app.db.seeds.career_seed import seed_career_database
from app.schemas.career import (
    CareerListOut,
    CareerDetailOut,
    CareerSkillOut,
    CareerCourseOut,
    EntranceExamOut,
    SkillOut,
    CourseOut,
    SavedCareerOut
)

class CareerService:
    @staticmethod
    def ensure_seeded(db: Session):
        """Checks if career database is populated, and auto-seeds if empty."""
        if db.query(Career).count() == 0:
            seed_career_database(db)

    @staticmethod
    def get_careers(
        db: Session,
        industry: Optional[str] = None,
        cluster: Optional[str] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[CareerListOut]:
        CareerService.ensure_seeded(db)

        query = db.query(Career).options(
            joinedload(Career.skill_associations).joinedload(CareerSkill.skill)
        )

        if industry:
            query = query.filter(Career.industry == industry)
        if cluster:
            query = query.filter(Career.cluster == cluster)
        if search:
            search_fmt = f"%{search.lower()}%"
            query = query.filter(
                (Career.title.ilike(search_fmt)) |
                (Career.short_description.ilike(search_fmt)) |
                (Career.overview.ilike(search_fmt)) |
                (Career.industry.ilike(search_fmt)) |
                (Career.cluster.ilike(search_fmt)) |
                (Career.tamil_nadu_demand.ilike(search_fmt))
            )

        careers = query.order_by(Career.title.asc()).offset(skip).limit(limit).all()

        results = []
        for c in careers:
            skills = [cs.skill.name for cs in c.skill_associations if cs.skill]
            results.append(
                CareerListOut(
                    id=c.id,
                    title=c.title,
                    slug=c.slug,
                    cluster=c.cluster,
                    industry=c.industry,
                    short_description=c.short_description,
                    typical_pathway=c.typical_pathway,
                    entry_education_level=c.entry_education_level,
                    salary_range_min=c.salary_range_min,
                    salary_range_max=c.salary_range_max,
                    growth_rate=c.growth_rate,
                    tamil_nadu_demand=c.tamil_nadu_demand,
                    work_environment=c.work_environment,
                    key_skills=skills[:5]
                )
            )
        return results

    @staticmethod
    def get_career_by_identifier(db: Session, id_or_slug: str) -> CareerDetailOut:
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
                detail=f"Career '{id_or_slug}' not found in the database."
            )

        # Build skill details
        skill_outs = []
        for cs in sorted(career.skill_associations, key=lambda x: x.importance_weight, reverse=True):
            if cs.skill:
                skill_outs.append(
                    CareerSkillOut(
                        id=cs.skill.id,
                        name=cs.skill.name,
                        category=cs.skill.category,
                        importance_weight=cs.importance_weight,
                        is_core=cs.is_core
                    )
                )

        # Build course details with exams
        course_outs = []
        for cc in sorted(career.course_associations, key=lambda x: x.relevance_score, reverse=True):
            if cc.course:
                exam_outs = [
                    EntranceExamOut.model_validate(ce.exam)
                    for ce in cc.course.exam_associations
                    if ce.exam
                ]
                course_outs.append(
                    CareerCourseOut(
                        id=cc.course.id,
                        name=cc.course.name,
                        short_code=cc.course.short_code,
                        degree_level=cc.course.degree_level,
                        duration_years=cc.course.duration_years,
                        stream=cc.course.stream,
                        is_primary=cc.is_primary,
                        relevance_score=cc.relevance_score,
                        exams=exam_outs
                    )
                )

        return CareerDetailOut(
            id=career.id,
            title=career.title,
            slug=career.slug,
            cluster=career.cluster,
            industry=career.industry,
            overview=career.overview,
            short_description=career.short_description,
            typical_pathway=career.typical_pathway,
            entry_education_level=career.entry_education_level,
            salary_range_min=career.salary_range_min,
            salary_range_max=career.salary_range_max,
            growth_rate=career.growth_rate,
            tamil_nadu_demand=career.tamil_nadu_demand,
            work_environment=career.work_environment,
            higher_studies_options=career.higher_studies_options or [],
            alternative_careers=career.alternative_careers or [],
            skills=skill_outs,
            courses=course_outs,
            created_at=career.created_at
        )

    @staticmethod
    def get_all_skills(db: Session, category: Optional[str] = None) -> List[SkillOut]:
        CareerService.ensure_seeded(db)
        query = db.query(Skill)
        if category:
            query = query.filter(Skill.category == category)
        skills = query.order_by(Skill.name.asc()).all()
        return [SkillOut.model_validate(s) for s in skills]

    @staticmethod
    def get_all_courses(db: Session, stream: Optional[str] = None) -> List[CourseOut]:
        CareerService.ensure_seeded(db)
        query = db.query(Course).options(
            joinedload(Course.exam_associations).joinedload(CourseExam.exam)
        )
        if stream:
            query = query.filter(Course.stream == stream)
        courses = query.order_by(Course.name.asc()).all()

        results = []
        for c in courses:
            exam_outs = [EntranceExamOut.model_validate(ce.exam) for ce in c.exam_associations if ce.exam]
            results.append(
                CourseOut(
                    id=c.id,
                    name=c.name,
                    short_code=c.short_code,
                    degree_level=c.degree_level,
                    duration_years=c.duration_years,
                    stream=c.stream,
                    description=c.description,
                    eligibility_criteria=c.eligibility_criteria,
                    average_annual_fee_min=c.average_annual_fee_min,
                    average_annual_fee_max=c.average_annual_fee_max,
                    exams=exam_outs
                )
            )
        return results

    @staticmethod
    def get_all_exams(db: Session) -> List[EntranceExamOut]:
        CareerService.ensure_seeded(db)
        exams = db.query(EntranceExam).order_by(EntranceExam.name.asc()).all()
        return [EntranceExamOut.model_validate(e) for e in exams]

    @staticmethod
    def save_career(db: Session, user_id: int, career_id: int, notes: Optional[str] = None) -> SavedCareerOut:
        CareerService.ensure_seeded(db)
        career = db.query(Career).options(
            joinedload(Career.skill_associations).joinedload(CareerSkill.skill)
        ).filter(Career.id == career_id).first()
        if not career:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Career with ID {career_id} not found.")

        existing = db.query(SavedCareer).filter(
            SavedCareer.user_id == user_id,
            SavedCareer.career_id == career_id
        ).first()

        if not existing:
            existing = SavedCareer(user_id=user_id, career_id=career_id, notes=notes)
            db.add(existing)
            db.commit()
            db.refresh(existing)

        skills = [cs.skill.name for cs in career.skill_associations if cs.skill]
        career_list_item = CareerListOut(
            id=career.id,
            title=career.title,
            slug=career.slug,
            cluster=career.cluster,
            industry=career.industry,
            short_description=career.short_description,
            typical_pathway=career.typical_pathway,
            entry_education_level=career.entry_education_level,
            salary_range_min=career.salary_range_min,
            salary_range_max=career.salary_range_max,
            growth_rate=career.growth_rate,
            tamil_nadu_demand=career.tamil_nadu_demand,
            work_environment=career.work_environment,
            key_skills=skills[:5]
        )

        return SavedCareerOut(
            id=existing.id,
            career_id=existing.career_id,
            career=career_list_item,
            notes=existing.notes,
            created_at=existing.created_at
        )

    @staticmethod
    def unsave_career(db: Session, user_id: int, career_id: int) -> bool:
        item = db.query(SavedCareer).filter(
            SavedCareer.user_id == user_id,
            SavedCareer.career_id == career_id
        ).first()
        if item:
            db.delete(item)
            db.commit()
            return True
        return False

    @staticmethod
    def get_saved_careers(db: Session, user_id: int) -> List[SavedCareerOut]:
        items = db.query(SavedCareer).options(
            joinedload(SavedCareer.career).joinedload(Career.skill_associations).joinedload(CareerSkill.skill)
        ).filter(SavedCareer.user_id == user_id).order_by(SavedCareer.created_at.desc()).all()

        results = []
        for item in items:
            if not item.career:
                continue
            skills = [cs.skill.name for cs in item.career.skill_associations if cs.skill]
            career_list_item = CareerListOut(
                id=item.career.id,
                title=item.career.title,
                slug=item.career.slug,
                cluster=item.career.cluster,
                industry=item.career.industry,
                short_description=item.career.short_description,
                typical_pathway=item.career.typical_pathway,
                entry_education_level=item.career.entry_education_level,
                salary_range_min=item.career.salary_range_min,
                salary_range_max=item.career.salary_range_max,
                growth_rate=item.career.growth_rate,
                tamil_nadu_demand=item.career.tamil_nadu_demand,
                work_environment=item.career.work_environment,
                key_skills=skills[:5]
            )
            results.append(
                SavedCareerOut(
                    id=item.id,
                    career_id=item.career_id,
                    career=career_list_item,
                    notes=item.notes,
                    created_at=item.created_at
                )
            )
        return results

    @staticmethod
    def get_saved_career_ids(db: Session, user_id: int) -> List[int]:
        items = db.query(SavedCareer.career_id).filter(SavedCareer.user_id == user_id).all()
        return [i[0] for i in items]

