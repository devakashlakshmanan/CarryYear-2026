from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.db.models.assessment import (
    AssessmentQuestion,
    AssessmentAttempt,
    AssessmentResponse,
    AssessmentScore
)
from app.db.seeds.assessment_questions import seed_assessment_questions
from app.schemas.assessment import AnswerSubmission, AssessmentResultResponse, DimensionScoreOut

class AssessmentService:
    @staticmethod
    def get_questions(db: Session, question_type: Optional[str] = None) -> List[AssessmentQuestion]:
        """
        Retrieves assessment questions. Auto-seeds if the question table is empty.
        """
        count = db.query(AssessmentQuestion).count()
        if count == 0:
            seed_assessment_questions(db)

        query = db.query(AssessmentQuestion)
        if question_type:
            query = query.filter(AssessmentQuestion.question_type == question_type)
        return query.order_by(AssessmentQuestion.id.asc()).all()

    @staticmethod
    def submit_assessment(
        db: Session,
        user_id: int,
        answers: List[AnswerSubmission]
    ) -> AssessmentResultResponse:
        """
        Processes answers, scores aptitude and interest dimensions,
        normalizes scores from 0 to 100, persists attempts and scores,
        and returns structured explainable results.
        """
        if not answers:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one answer must be submitted."
            )

        # Ensure question bank is seeded
        if db.query(AssessmentQuestion).count() == 0:
            seed_assessment_questions(db)

        question_ids = [a.question_id for a in answers]
        questions = db.query(AssessmentQuestion).filter(AssessmentQuestion.id.in_(question_ids)).all()
        q_map: Dict[int, AssessmentQuestion] = {q.id: q for q in questions}

        # Create new attempt
        attempt = AssessmentAttempt(user_id=user_id, completed=False)
        db.add(attempt)
        db.flush()

        aptitude_buckets: Dict[str, Dict[str, float]] = {}
        interest_buckets: Dict[str, List[float]] = {}
        responses: List[AssessmentResponse] = []

        for item in answers:
            q = q_map.get(item.question_id)
            if not q:
                continue

            opt_idx = item.selected_option_index
            is_correct = None
            awarded = 0.0

            if q.question_type == "aptitude":
                category = q.category
                if category not in aptitude_buckets:
                    aptitude_buckets[category] = {"earned": 0.0, "max": 0.0}
                aptitude_buckets[category]["max"] += q.scoring_weight

                if q.correct_option_index is not None and opt_idx == q.correct_option_index:
                    is_correct = True
                    awarded = q.scoring_weight
                    aptitude_buckets[category]["earned"] += awarded
                else:
                    is_correct = False
                    awarded = 0.0

            elif q.question_type == "interest":
                dimension = q.interest_dimension or q.category
                if dimension not in interest_buckets:
                    interest_buckets[dimension] = []

                # Options are Likert 0..4 -> 0% to 100%
                max_opt = max(len(q.options) - 1, 1)
                percent_val = (opt_idx / max_opt) * 100.0
                awarded = percent_val
                interest_buckets[dimension].append(percent_val)

            resp = AssessmentResponse(
                attempt_id=attempt.id,
                question_id=q.id,
                selected_option_index=opt_idx,
                is_correct=is_correct,
                score_awarded=awarded
            )
            responses.append(resp)

        db.add_all(responses)

        # Normalize Aptitude Scores
        dimension_score_entities: List[AssessmentScore] = []
        aptitude_dimension_scores: List[DimensionScoreOut] = []

        for category, bucket in aptitude_buckets.items():
            max_val = bucket["max"]
            earned_val = bucket["earned"]
            normalized = round((earned_val / max_val * 100.0) if max_val > 0 else 0.0, 1)

            score_entity = AssessmentScore(
                attempt_id=attempt.id,
                user_id=user_id,
                dimension=category,
                category_type="aptitude",
                normalized_score=normalized
            )
            dimension_score_entities.append(score_entity)
            aptitude_dimension_scores.append(
                DimensionScoreOut(
                    dimension=category,
                    category_type="aptitude",
                    normalized_score=normalized
                )
            )

        # Normalize Interest Scores
        interest_dimension_scores: List[DimensionScoreOut] = []
        for dimension, vals in interest_buckets.items():
            avg_normalized = round(sum(vals) / len(vals), 1) if vals else 0.0
            score_entity = AssessmentScore(
                attempt_id=attempt.id,
                user_id=user_id,
                dimension=dimension,
                category_type="interest",
                normalized_score=avg_normalized
            )
            dimension_score_entities.append(score_entity)
            interest_dimension_scores.append(
                DimensionScoreOut(
                    dimension=dimension,
                    category_type="interest",
                    normalized_score=avg_normalized
                )
            )

        db.add_all(dimension_score_entities)

        # Calculate Averages and Overall Score
        apt_scores = [s.normalized_score for s in aptitude_dimension_scores]
        apt_average = round(sum(apt_scores) / len(apt_scores), 1) if apt_scores else 0.0

        int_sorted = sorted(interest_dimension_scores, key=lambda x: x.normalized_score, reverse=True)
        top_interests = [s.dimension for s in int_sorted[:3] if s.normalized_score >= 50.0]
        if not top_interests and int_sorted:
            top_interests = [int_sorted[0].dimension]

        # Overall total score
        all_norm_scores = [s.normalized_score for s in aptitude_dimension_scores + interest_dimension_scores]
        overall_score = round(sum(all_norm_scores) / len(all_norm_scores), 1) if all_norm_scores else 0.0

        attempt.total_score = overall_score
        attempt.completed = True

        # Generate Explainable Summary
        strongest_aptitude = max(aptitude_dimension_scores, key=lambda x: x.normalized_score).dimension if aptitude_dimension_scores else "General Reasoning"
        summary_text = (
            f"You demonstrated strong aptitude in {strongest_aptitude} (average aptitude {apt_average}%) "
            f"with pronounced interest indicators in {', '.join(top_interests)}. "
            f"This composite evaluation feeds directly into your CarryYear Career DNA and pathway engine."
        )

        db.commit()
        db.refresh(attempt)

        all_dimension_scores = aptitude_dimension_scores + interest_dimension_scores

        return AssessmentResultResponse(
            attempt_id=attempt.id,
            total_score=attempt.total_score,
            completed=attempt.completed,
            created_at=attempt.created_at,
            dimension_scores=all_dimension_scores,
            aptitude_average=apt_average,
            top_interests=top_interests,
            summary=summary_text
        )

    @staticmethod
    def get_latest_attempt(db: Session, user_id: int) -> Optional[AssessmentResultResponse]:
        """
        Retrieves the latest completed assessment attempt for a user with calculated dimensions.
        """
        attempt = (
            db.query(AssessmentAttempt)
            .filter(AssessmentAttempt.user_id == user_id, AssessmentAttempt.completed == True)
            .order_by(AssessmentAttempt.id.desc())
            .first()
        )

        if not attempt:
            return None

        scores = db.query(AssessmentScore).filter(AssessmentScore.attempt_id == attempt.id).all()
        dim_scores = [
            DimensionScoreOut(
                dimension=s.dimension,
                category_type=s.category_type,
                normalized_score=s.normalized_score
            )
            for s in scores
        ]

        apt_scores = [s.normalized_score for s in dim_scores if s.category_type == "aptitude"]
        apt_average = round(sum(apt_scores) / len(apt_scores), 1) if apt_scores else 0.0

        int_scores = [s for s in dim_scores if s.category_type == "interest"]
        int_sorted = sorted(int_scores, key=lambda x: x.normalized_score, reverse=True)
        top_interests = [s.dimension for s in int_sorted[:3] if s.normalized_score >= 50.0]
        if not top_interests and int_sorted:
            top_interests = [int_sorted[0].dimension]

        strongest_aptitude = max([s for s in dim_scores if s.category_type == "aptitude"], key=lambda x: x.normalized_score).dimension if apt_scores else "General"
        summary_text = (
            f"Your latest assessment highlights notable strength in {strongest_aptitude} "
            f"coupled with peak engagement in {', '.join(top_interests)}."
        )

        return AssessmentResultResponse(
            attempt_id=attempt.id,
            total_score=attempt.total_score,
            completed=attempt.completed,
            created_at=attempt.created_at,
            dimension_scores=dim_scores,
            aptitude_average=apt_average,
            top_interests=top_interests,
            summary=summary_text
        )
