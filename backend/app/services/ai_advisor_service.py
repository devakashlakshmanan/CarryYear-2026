import os
from typing import List, Optional
import json
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.models.scholarship_chat import ChatHistory
from app.db.models.student_profile import StudentProfile
from app.db.models.career_dna import CareerDNA
from app.services.recommendation_service import RecommendationService
from app.services.college_service import CollegeService
from app.services.scholarship_service import ScholarshipService

class ChatMessageOut(BaseModel):
    id: int
    role: str
    content: str
    created_at: str

class ChatRequestIn(BaseModel):
    message: str

class ChatResponseOut(BaseModel):
    reply: str
    suggested_followups: List[str]
    context_used: dict

class AIAdvisorService:
    @staticmethod
    def get_history(db: Session, user_id: int) -> List[ChatMessageOut]:
        items = db.query(ChatHistory).filter(ChatHistory.user_id == user_id).order_by(ChatHistory.created_at.asc()).all()
        return [
            ChatMessageOut(
                id=c.id,
                role=c.role,
                content=c.content,
                created_at=str(c.created_at)
            )
            for c in items
        ]

    @staticmethod
    def chat(db: Session, user_id: int, user_message: str) -> ChatResponseOut:
        # 1. Fetch Profile and Context
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
        dna = db.query(CareerDNA).filter(CareerDNA.user_id == user_id).first()
        recs = RecommendationService.get_recommendations(db, user_id=user_id, min_score=60.0)
        colleges = CollegeService.match_colleges_for_student(db, user_id=user_id)
        scholarships = ScholarshipService.match_scholarships_for_user(db, user_id=user_id)

        # Build context
        context_data = {
            "student_name": profile.user.name if profile and profile.user else "Student",
            "district": profile.district if profile else "Chennai",
            "percentage": profile.percentage_or_cgpa if profile else 90.0,
            "target_career": profile.target_career if profile else "Data Scientist",
            "dominant_dna_cluster": dna.dominant_cluster if dna else "Data Intelligence & AI",
            "top_careers": [r.career_title for r in recs.recommendations[:3]],
            "target_colleges": [c.college_name for c in colleges.target_colleges[:2]],
            "eligible_scholarships": [s.scholarship.title for s in scholarships.matches if s.is_eligible][:2],
            "budget": profile.max_education_budget if profile else 120000.0
        }

        # Persist User message
        user_record = ChatHistory(
            user_id=user_id,
            role="user",
            content=user_message,
            context_metadata=context_data
        )
        db.add(user_record)
        db.commit()

        # Generate response using Groq if key present, else deterministic advisor engine
        groq_api_key = os.getenv("GROQ_API_KEY")
        reply = None

        if groq_api_key and groq_api_key != "YOUR_GROQ_API_KEY_HERE":
            try:
                from groq import Groq
                client = Groq(api_key=groq_api_key)

                system_prompt = f"""
You are the CarryYear Decision Intelligence Advisor, an elite Tamil Nadu educational & career counselor.
You have access to the student's real profile:
- Name: {context_data['student_name']}
- Location: {context_data['district']}, Tamil Nadu
- Academic Percentage / CGPA: {context_data['percentage']}
- Target Career: {context_data['target_career']}
- Career DNA: {context_data['dominant_dna_cluster']}
- Top Recommended Careers: {', '.join(context_data['top_careers'])}
- Matched Colleges in Tamil Nadu: {', '.join(context_data['target_colleges'])}
- Eligible Scholarships: {', '.join(context_data['eligible_scholarships'])}
- Annual Budget: ₹{context_data['budget']:,.0f}

Guide the student accurately regarding Anna University TNEA single-window counseling, cutoff strategy out of 200, state scholarships (e.g. First Graduate, 7.5% Govt School, BC/MBC/SC/ST welfare), and engineering corridors (Chennai, Coimbatore, Hosur).
Keep responses structured, encouraging, concise, and highly actionable.
"""
                chat_completion = client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_message}
                    ],
                    model="llama-3.3-70b-versatile",
                    temperature=0.6,
                    max_tokens=600
                )
                reply = chat_completion.choices[0].message.content
            except Exception as e:
                reply = None

        # Fallback to intelligent deterministic response
        if not reply:
            reply = AIAdvisorService._generate_deterministic_response(user_message, context_data)

        # Suggested followups
        followups = [
            f"What TNEA cutoff is required for {context_data['target_colleges'][0] if context_data['target_colleges'] else 'CEG Guindy'}?",
            f"How do I apply for the Tamil Nadu First Graduate scholarship?",
            f"What projects should I build to become a {context_data['target_career']}?"
        ]

        # Persist assistant reply
        assistant_record = ChatHistory(
            user_id=user_id,
            role="assistant",
            content=reply,
            context_metadata={"suggested_followups": followups}
        )
        db.add(assistant_record)
        db.commit()

        return ChatResponseOut(
            reply=reply,
            suggested_followups=followups,
            context_used=context_data
        )

    @staticmethod
    def _generate_deterministic_response(msg: str, ctx: dict) -> str:
        m = msg.lower()
        name = ctx["student_name"]
        district = ctx["district"]
        career = ctx["target_career"]
        dna = ctx["dominant_dna_cluster"]
        colleges = ", ".join(ctx["target_colleges"]) if ctx["target_colleges"] else "CEG Guindy, MIT, and PSG Tech"
        scholarships = ", ".join(ctx["eligible_scholarships"]) if ctx["eligible_scholarships"] else "Tamil Nadu First Graduate Scheme"

        if "scholarship" in m or "fee" in m or "money" in m or "cost" in m:
            return (
                f"Hello {name}! Based on your profile in {district}, you are eligible to leverage **{scholarships}**.\n\n"
                f"1. **Tamil Nadu First Graduate Scheme**: If you are the first degree holder in your family, you receive a direct tuition fee waiver through TNEA single window counseling.\n"
                f"2. **Fee Feasibility**: With your annual budget of ₹{ctx['budget']:,.0f}, government institutions like CEG Guindy (₹35k/year) and GCT Coimbatore (₹32k/year) are 100% self-funded with zero loan burden.\n"
                f"3. **Education Loans**: Premier state institutions qualify for the SBI Scholar loan scheme with no collateral required."
            )
        elif "college" in m or "tnea" in m or "cutoff" in m or "rank" in m:
            return (
                f"Great question, {name}! For your academic profile, your prime Target college matches include **{colleges}**.\n\n"
                f"• **Cut-Off Strategy**: TNEA calculates your cutoff out of 200 marks using Maths + (Physics/2) + (Chemistry/2). Aim for 195+ to secure B.Tech AI & Data Science or B.E. CSE at CEG, MIT, or PSG Tech.\n"
                f"• **Regional Corridors**: If staying near {district} is preferred, prioritize institutions within the local zone during TNEA round choice-filling.\n"
                f"• **Next Step**: You can simulate your cut-off changes in our **What-If Simulator** to see your Reach, Target, and Safe colleges instantly."
            )
        else:
            return (
                f"Welcome {name}! Analyzing your **Career DNA ({dna})**, your profile shows high alignment with **{career}** and **{', '.join(ctx['top_careers'][:2])}**.\n\n"
                f"**Strategic Pathway Recommendation**:\n"
                f"1. **Academics**: Target degree programs in B.Tech AI & DS or B.E. Computer Science through TNEA counseling.\n"
                f"2. **Colleges**: Top institutions matching your profile include **{colleges}**.\n"
                f"3. **Skill Stack**: Prioritize hands-on mastery in core competencies (Python, SQL, Machine Learning) using NPTEL and the Naan Mudhalvan portal.\n"
                f"4. **Financial Aid**: You can avail **{scholarships}** to reduce tuition expenses.\n\n"
                f"Feel free to ask me about specific college cut-offs, scholarship application checklists, or project roadmap guidance!"
            )
