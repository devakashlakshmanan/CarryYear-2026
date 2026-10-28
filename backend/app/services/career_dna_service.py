from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.db.models.career_dna import CareerDNA
from app.db.models.student_profile import StudentProfile
from app.db.models.assessment import AssessmentAttempt, AssessmentScore
from app.schemas.career_dna import CareerDNAResponse, TraitIndicator, ExplanatoryFactor

class CareerDNAService:
    @staticmethod
    def generate_career_dna(db: Session, user_id: int) -> CareerDNAResponse:
        """
        Synthesizes student academic profile, assessment scores, declared skills,
        goals, and regional/financial preferences into explainable Career DNA indicators.
        """
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Student profile not found. Please complete basic onboarding first."
            )

        # Retrieve latest completed assessment
        latest_attempt = (
            db.query(AssessmentAttempt)
            .filter(AssessmentAttempt.user_id == user_id, AssessmentAttempt.completed == True)
            .order_by(AssessmentAttempt.id.desc())
            .first()
        )

        assessment_scores_map: Dict[str, float] = {}
        if latest_attempt:
            scores = db.query(AssessmentScore).filter(AssessmentScore.attempt_id == latest_attempt.id).all()
            for s in scores:
                assessment_scores_map[s.dimension] = s.normalized_score

        # Extract Profile Features
        academic_score = float(profile.percentage_or_cgpa or 70.0)
        subject_marks = profile.subject_marks or {}
        math_mark = float(subject_marks.get("Mathematics") or subject_marks.get("Maths") or academic_score)
        cs_mark = float(subject_marks.get("Computer Science") or subject_marks.get("Computer") or math_mark)
        science_mark = float(subject_marks.get("Physics") or subject_marks.get("Science") or academic_score)

        skills = profile.skills or []
        skill_names = [s.get("name", "").lower() for s in skills if isinstance(s, dict)]
        has_tech_skill = any(k in " ".join(skill_names) for k in ["python", "java", "coding", "software", "c++", "web", "ai", "sql"])
        has_problem_solving = any("problem solving" in k or "analytical" in k for k in skill_names)

        # Extract Assessment Dimensions (with safe defaults if assessment not yet completed)
        logical_apt = assessment_scores_map.get("Logical Reasoning", academic_score * 0.85)
        numerical_apt = assessment_scores_map.get("Numerical Reasoning", math_mark * 0.85)
        analytical_apt = assessment_scores_map.get("Analytical Reasoning", (math_mark + cs_mark) / 2 * 0.85)
        verbal_apt = assessment_scores_map.get("Verbal Reasoning", 70.0)

        tech_interest = assessment_scores_map.get("Technology", 85.0 if "Technology" in (profile.interests or []) else 60.0)
        science_interest = assessment_scores_map.get("Science", 80.0 if "Science" in (profile.interests or []) else 55.0)
        business_interest = assessment_scores_map.get("Business", 75.0 if "Business" in (profile.interests or []) else 50.0)
        healthcare_interest = assessment_scores_map.get("Healthcare", 75.0 if "Healthcare" in (profile.interests or []) else 45.0)
        design_interest = assessment_scores_map.get("Design", 70.0 if "Design" in (profile.interests or []) else 40.0)
        social_interest = assessment_scores_map.get("Social Impact", 75.0 if "Social Impact" in (profile.interests or []) else 50.0)
        research_interest = assessment_scores_map.get("Research", 75.0 if "Research" in (profile.interests or []) else 50.0)
        management_interest = assessment_scores_map.get("Management", 70.0 if "Management" in (profile.interests or []) else 50.0)

        # 1. Synthesize 8 Core Traits (0 - 100)
        analytical_score = round(
            (math_mark * 0.35) +
            (analytical_apt * 0.35) +
            (numerical_apt * 0.20) +
            (research_interest * 0.10),
            1
        )

        tech_orientation = round(
            (tech_interest * 0.35) +
            ((cs_mark + (90 if has_tech_skill else 65)) / 2 * 0.30) +
            (logical_apt * 0.20) +
            (analytical_apt * 0.15),
            1
        )

        problem_solving = round(
            (logical_apt * 0.40) +
            (analytical_apt * 0.30) +
            (math_mark * 0.20) +
            ((95.0 if has_problem_solving else 70.0) * 0.10),
            1
        )

        communication = round(
            (verbal_apt * 0.50) +
            (management_interest * 0.25) +
            (academic_score * 0.25),
            1
        )

        research_orient = round(
            (research_interest * 0.45) +
            (science_interest * 0.25) +
            (analytical_apt * 0.30),
            1
        )

        business_acumen = round(
            (business_interest * 0.45) +
            (management_interest * 0.35) +
            (75.0 if profile.max_education_budget else 60.0) * 0.20,
            1
        )

        creative_design = round(
            (design_interest * 0.55) +
            (verbal_apt * 0.25) +
            (tech_interest * 0.20),
            1
        )

        social_leadership = round(
            (social_interest * 0.50) +
            (management_interest * 0.25) +
            (communication * 0.25),
            1
        )

        def get_rating(val: float) -> str:
            if val >= 75.0:
                return "Advanced"
            elif val >= 55.0:
                return "Proficient"
            return "Developing"

        traits_data: List[TraitIndicator] = [
            TraitIndicator(
                name="Analytical Thinking",
                score=min(100.0, max(0.0, analytical_score)),
                rating=get_rating(analytical_score),
                description="Capacity to dissect complex structures, evaluate quantitative evidence, and derive rigorous logical conclusions."
            ),
            TraitIndicator(
                name="Technology Orientation",
                score=min(100.0, max(0.0, tech_orientation)),
                rating=get_rating(tech_orientation),
                description="Affinity for digital computing systems, algorithm development, modern tooling, and technical problem spaces."
            ),
            TraitIndicator(
                name="Problem Solving",
                score=min(100.0, max(0.0, problem_solving)),
                rating=get_rating(problem_solving),
                description="Aptitude for identifying core root bottlenecks and engineering sequential, reproducible resolutions."
            ),
            TraitIndicator(
                name="Communication & Articulation",
                score=min(100.0, max(0.0, communication)),
                rating=get_rating(communication),
                description="Verbal reasoning clarity, written technical synthesis, and ability to coordinate concepts across teams."
            ),
            TraitIndicator(
                name="Research & Investigative Drive",
                score=min(100.0, max(0.0, research_orient)),
                rating=get_rating(research_orient),
                description="Curiosity towards experimental validation, scientific literature inquiry, and formulating new hypotheses."
            ),
            TraitIndicator(
                name="Business & Strategic Acumen",
                score=min(100.0, max(0.0, business_acumen)),
                rating=get_rating(business_acumen),
                description="Understanding of economic feasibility, organizational execution, project ROI, and team orchestration."
            ),
            TraitIndicator(
                name="Creative Design & Systems Fluency",
                score=min(100.0, max(0.0, creative_design)),
                rating=get_rating(creative_design),
                description="Intuition for ergonomic user journeys, visual balance, interactive media, and user-centric architecture."
            ),
            TraitIndicator(
                name="Social Leadership & Civic Impact",
                score=min(100.0, max(0.0, social_leadership)),
                rating=get_rating(social_leadership),
                description="Commitment to community advancement, ethical leadership, and resolving regional societal challenges in Tamil Nadu."
            )
        ]

        # Determine Dominant Career Cluster
        trait_dict = {t.name: t.score for t in traits_data}
        target_career = profile.target_career or ""

        if trait_dict["Technology Orientation"] >= 75.0 and trait_dict["Analytical Thinking"] >= 75.0:
            dominant_cluster = "Data Intelligence, Artificial Intelligence & Software Systems"
        elif trait_dict["Analytical Thinking"] >= 75.0 and trait_dict["Research & Investigative Drive"] >= 70.0:
            dominant_cluster = "Computational Research & Advanced Engineering Sciences"
        elif trait_dict["Business & Strategic Acumen"] >= 70.0:
            dominant_cluster = "Business Analytics, Product Strategy & Enterprise Leadership"
        elif trait_dict["Creative Design & Systems Fluency"] >= 70.0:
            dominant_cluster = "UI/UX Architecture, Digital Media & Product Design"
        elif trait_dict["Social Leadership & Civic Impact"] >= 70.0:
            dominant_cluster = "Public Administration, Healthcare Policy & Civic Innovation"
        else:
            dominant_cluster = "Core Applied Engineering & Quantitative Systems"

        # Calculate Confidence Score based on data completeness
        confidence = 50.0
        if profile.onboarding_completed:
            confidence += 25.0
        if latest_attempt and latest_attempt.completed:
            confidence += 25.0

        # Construct Transparent Explanatory Factors
        explanatory_factors: List[ExplanatoryFactor] = []

        # Academic Factor
        explanatory_factors.append(
            ExplanatoryFactor(
                source="Academic Performance",
                factor=f"Recorded {academic_score}% in {profile.current_education_level or 'Class 12'} ({profile.stream or 'General Stream'}), with Mathematics at {math_mark}%.",
                impact=f"Contributes 35% weight to Analytical Thinking ({analytical_score}%) and sets a strong STEM foundation for Tamil Nadu admissions.",
                weight="High"
            )
        )

        # Assessment Factor
        if latest_attempt:
            explanatory_factors.append(
                ExplanatoryFactor(
                    source="Cognitive & Aptitude Assessment",
                    factor=f"Demonstrated {logical_apt}% in Logical Reasoning and {analytical_apt}% in Analytical Reasoning in Attempt #{latest_attempt.id}.",
                    impact=f"Significantly elevated Problem Solving ({problem_solving}%) and validated structured algorithmic capacity.",
                    weight="High"
                )
            )
            explanatory_factors.append(
                ExplanatoryFactor(
                    source="Expressed Interest Inventory",
                    factor=f"Peak enthusiasm recorded in Technology ({tech_interest}%) and Research ({research_interest}%).",
                    impact=f"Pushes Technology Orientation ({tech_orientation}%) into the {traits_data[1].rating} tier.",
                    weight="High"
                )
            )

        # Skills & Career Goals Factor
        if skills:
            explanatory_factors.append(
                ExplanatoryFactor(
                    source="Practical Skills & Target Goal",
                    factor=f"Declared proficiency in {', '.join([s.get('name', '') for s in skills[:3]])}, targeting career: '{target_career or 'Technical Specialist'}'.",
                    impact="Reinforces real-world application readiness and prioritizes industry-aligned college specializations.",
                    weight="Moderate"
                )
            )

        # Financial & Regional Preferences
        if profile.district or profile.max_education_budget:
            explanatory_factors.append(
                ExplanatoryFactor(
                    source="Regional & Financial Reality",
                    factor=f"Preferred district focus around {profile.district or 'Tamil Nadu'} with an education budget cap of ₹{profile.max_education_budget or 100000:,} per year.",
                    impact="Integrates realistic feasibility constraints to match TNEA government-aided and merit institutions without unmanageable debt.",
                    weight="Moderate"
                )
            )

        # Cohesive Narrative: "Why this profile?"
        top_two_traits = sorted(traits_data, key=lambda x: x.score, reverse=True)[:2]
        why_narrative = (
            f"Your prominent scores in {top_two_traits[0].name} ({top_two_traits[0].score}%) and "
            f"{top_two_traits[1].name} ({top_two_traits[1].score}%), combined with your strong academic record "
            f"in {profile.stream or 'your curriculum'} and expressed interest in {profile.target_career or 'technology domains'}, "
            f"converge into the '{dominant_cluster}' indicator cluster. "
            f"This composite DNA balances your cognitive strengths with your practical goals in Tamil Nadu."
        )

        # Persist or update Career DNA record
        career_dna = db.query(CareerDNA).filter(CareerDNA.user_id == user_id).first()
        if not career_dna:
            career_dna = CareerDNA(user_id=user_id)
            db.add(career_dna)

        career_dna.dominant_cluster = dominant_cluster
        career_dna.confidence_score = confidence
        career_dna.traits = [t.model_dump() for t in traits_data]
        career_dna.why_this_profile = why_narrative
        career_dna.explanatory_factors = [f.model_dump() for f in explanatory_factors]
        career_dna.composite_vector = {
            "analytical": analytical_score,
            "technology": tech_orientation,
            "problem_solving": problem_solving,
            "communication": communication,
            "research": research_orient,
            "business": business_acumen,
            "design": creative_design,
            "social": social_leadership
        }
        career_dna.version = (career_dna.version or 0) + 1

        db.commit()
        db.refresh(career_dna)

        return CareerDNAResponse(
            id=career_dna.id,
            user_id=career_dna.user_id,
            dominant_cluster=career_dna.dominant_cluster,
            confidence_score=career_dna.confidence_score,
            traits=traits_data,
            why_this_profile=career_dna.why_this_profile,
            explanatory_factors=explanatory_factors,
            version=career_dna.version,
            created_at=career_dna.created_at,
            updated_at=career_dna.updated_at
        )

    @staticmethod
    def get_career_dna(db: Session, user_id: int) -> Optional[CareerDNAResponse]:
        """
        Retrieves existing Career DNA. If none exists, attempts automatic generation
        if a student profile exists.
        """
        career_dna = db.query(CareerDNA).filter(CareerDNA.user_id == user_id).first()
        if not career_dna:
            # Check if student profile exists to generate dynamically
            profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
            if profile:
                return CareerDNAService.generate_career_dna(db, user_id)
            return None

        traits_data = [TraitIndicator(**t) for t in career_dna.traits]
        explanatory_factors = [ExplanatoryFactor(**f) for f in career_dna.explanatory_factors]

        return CareerDNAResponse(
            id=career_dna.id,
            user_id=career_dna.user_id,
            dominant_cluster=career_dna.dominant_cluster,
            confidence_score=career_dna.confidence_score,
            traits=traits_data,
            why_this_profile=career_dna.why_this_profile,
            explanatory_factors=explanatory_factors,
            version=career_dna.version,
            created_at=career_dna.created_at,
            updated_at=career_dna.updated_at
        )
