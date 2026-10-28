from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload
from app.db.models.career import Career, CareerSkill, Skill
from app.db.models.student_profile import StudentProfile
from app.services.career_service import CareerService

class SkillGapItem(BaseModel):
    skill_name: str
    category: str
    is_core: bool
    importance_weight: float
    current_proficiency_percent: float
    required_proficiency_percent: float
    gap_percent: float
    status: str  # "Acquired", "Moderate Gap", "Critical Gap"
    recommended_action: str

class SkillGapAnalysisOut(BaseModel):
    target_career_id: int
    target_career_title: str
    target_career_industry: str
    overall_skill_readiness_percent: float
    core_skills_acquired: int
    total_core_skills: int
    gap_items: List[SkillGapItem]
    top_priority_skills_to_learn: List[str]
    estimated_study_hours_to_bridge: int

class SkillGapService:
    @staticmethod
    def analyze_skill_gap(db: Session, user_id: int, career_id_or_slug: Optional[str] = None) -> SkillGapAnalysisOut:
        CareerService.ensure_seeded(db)
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()

        # Find target career
        query = db.query(Career).options(
            joinedload(Career.skill_associations).joinedload(CareerSkill.skill)
        )

        if career_id_or_slug and career_id_or_slug.isdigit():
            career = query.filter(Career.id == int(career_id_or_slug)).first()
        elif career_id_or_slug:
            career = query.filter(Career.slug == career_id_or_slug).first()
        elif profile and profile.target_career:
            career = query.filter(Career.title.ilike(f"%{profile.target_career}%")).first()
        else:
            career = None

        if not career:
            try:
                from app.services.recommendation_service import RecommendationService
                rec_res = RecommendationService.get_recommendations(db, user_id=user_id)
                if rec_res.recommendations:
                    top_id = rec_res.recommendations[0].career_id
                    career = query.filter(Career.id == top_id).first()
            except Exception:
                pass

        if not career:
            career = query.first()

        # Extract student's verified skills
        user_skills_map = {}
        if profile and profile.skills:
            for s in profile.skills:
                if isinstance(s, dict) and "name" in s:
                    user_skills_map[s["name"].strip().lower()] = float(s.get("level", 50.0))

        gap_items: List[SkillGapItem] = []
        total_weighted_acquired = 0.0
        total_weighted_required = 0.0
        core_acquired = 0
        core_total = 0
        priority_skills = []

        for cs in career.skill_associations:
            skill = cs.skill
            if not skill:
                continue

            req_level = 85.0 if cs.is_core else 70.0
            s_name = skill.name
            s_lower = s_name.lower()

            curr_level = user_skills_map.get(s_lower, 0.0)
            # Partial match check
            if curr_level == 0.0:
                for k, v in user_skills_map.items():
                    if k in s_lower or s_lower in k:
                        curr_level = v * 0.8
                        break

            gap = max(0.0, req_level - curr_level)
            weight = cs.importance_weight

            total_weighted_required += weight * req_level
            total_weighted_acquired += weight * min(req_level, curr_level)

            if cs.is_core:
                core_total += 1
                if gap <= 15.0:
                    core_acquired += 1

            if gap <= 10.0:
                status_str = "Acquired"
                action = f"Strong competence verified in {s_name}."
            elif gap <= 35.0:
                status_str = "Moderate Gap"
                action = f"Complete 2-3 applied mini-projects to reinforce {s_name}."
                if cs.is_core:
                    priority_skills.append(s_name)
            else:
                status_str = "Critical Gap"
                action = f"Prioritize formal foundations in {s_name} through structured coursework."
                if cs.is_core:
                    priority_skills.append(s_name)

            gap_items.append(
                SkillGapItem(
                    skill_name=s_name,
                    category=skill.category,
                    is_core=cs.is_core,
                    importance_weight=cs.importance_weight,
                    current_proficiency_percent=round(curr_level, 1),
                    required_proficiency_percent=round(req_level, 1),
                    gap_percent=round(gap, 1),
                    status=status_str,
                    recommended_action=action
                )
            )

        gap_items.sort(key=lambda x: (x.is_core, x.gap_percent), reverse=True)

        overall_readiness = (
            round((total_weighted_acquired / total_weighted_required) * 100.0, 1)
            if total_weighted_required > 0 else 50.0
        )

        total_gap_sum = sum(g.gap_percent for g in gap_items)
        est_hours = int(total_gap_sum * 2.2)

        return SkillGapAnalysisOut(
            target_career_id=career.id,
            target_career_title=career.title,
            target_career_industry=career.industry,
            overall_skill_readiness_percent=overall_readiness,
            core_skills_acquired=core_acquired,
            total_core_skills=core_total,
            gap_items=gap_items,
            top_priority_skills_to_learn=priority_skills[:4],
            estimated_study_hours_to_bridge=max(40, est_hours)
        )
