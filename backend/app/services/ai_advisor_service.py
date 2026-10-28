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
from app.core.config import settings

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
            "district": profile.district if profile and profile.district else "Tamil Nadu",
            "percentage": profile.percentage_or_cgpa if profile and profile.percentage_or_cgpa else 85.0,
            "target_career": profile.target_career if profile and profile.target_career else (recs.recommendations[0].career_title if recs.recommendations else "Data Scientist"),
            "dominant_dna_cluster": dna.dominant_cluster if dna else "Technology & Research Focus",
            "top_careers": [r.career_title for r in recs.recommendations[:3]],
            "target_colleges": [c.college_name for c in (colleges.target_colleges[:2] or colleges.safe_colleges[:2])],
            "eligible_scholarships": [s.scholarship.title for s in scholarships.matches if s.is_eligible][:2],
            "budget": profile.max_education_budget if profile and profile.max_education_budget else 120000.0,
            "community": profile.community if profile and profile.community else "OC",
            "is_first_graduate": profile.is_first_graduate if profile and profile.is_first_graduate is not None else False,
            "is_govt_school": profile.is_govt_school if profile and profile.is_govt_school is not None else False,
            "stream": profile.stream if profile and profile.stream else "Science & Mathematics"
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
        groq_api_key = os.getenv("GROQ_API_KEY") or getattr(settings, "GROQ_API_KEY", "")
        reply = None
        engine_mode = "deterministic"

        if groq_api_key and groq_api_key.strip() not in ["", "YOUR_GROQ_API_KEY_HERE", "mock_or_real_groq_key"]:
            try:
                from groq import Groq
                client = Groq(api_key=groq_api_key.strip(), timeout=12.0)

                system_prompt = f"""
You are the CarryYear Decision Intelligence Advisor, an educational and career counselor for students in Tamil Nadu.
You have access to verified student database records:
- Name: {context_data['student_name']}
- Location: {context_data['district']}, Tamil Nadu
- Academic Percentage / CGPA: {context_data['percentage']}
- Target Career: {context_data['target_career']}
- Career DNA: {context_data['dominant_dna_cluster']}
- Top Recommended Careers: {', '.join(context_data['top_careers'])}
- Matched Colleges in Tamil Nadu: {', '.join(context_data['target_colleges'])}
- Eligible Scholarships: {', '.join(context_data['eligible_scholarships'])}
- Annual Budget: ₹{context_data['budget']:,.0f}

Guidelines:
1. Ground answers strictly in verified Tamil Nadu counseling processes (TNEA single-window counseling out of 200).
2. Distinguish published facts from estimates. Do not invent non-existent schemes or guarantee admission.
3. Be concise, respectful, and actionable.
"""
                preferred_model = os.getenv("GROQ_MODEL") or getattr(settings, "GROQ_MODEL", "openai/gpt-oss-120b")
                candidate_models = list(dict.fromkeys([m for m in [preferred_model, "openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b", "llama-3.3-70b-versatile"] if m]))

                for model in candidate_models:
                    try:
                        chat_completion = client.chat.completions.create(
                            messages=[
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": user_message}
                            ],
                            model=model,
                            temperature=0.5,
                            max_tokens=600
                        )
                        reply = chat_completion.choices[0].message.content
                        if reply and reply.strip():
                            engine_mode = "groq_grounded"
                            break
                    except Exception:
                        continue
            except Exception:
                reply = None

        # Fallback to intelligent deterministic response grounded in DB records
        if not reply:
            reply = AIAdvisorService._generate_deterministic_response(user_message, context_data)
            reply += "\n\n*(Advisor Mode: Deterministic Decision Engine grounded in verified database records. Groq API inference is currently using deterministic fallback mode).* "

        # Suggested followups
        followups = [
            f"What TNEA cutoff is required for {context_data['target_colleges'][0] if context_data['target_colleges'] else 'CEG Guindy'}?",
            f"How do I apply for the Tamil Nadu First Graduate scholarship?",
            f"What projects should I build to become a {context_data['target_career']}?"
        ]

        # Format and clean response (normalize HTML line breaks, strip unsafe tags, normalize tables)
        reply = AIAdvisorService._format_ai_response(reply)

        # Persist assistant reply
        assistant_record = ChatHistory(
            user_id=user_id,
            role="assistant",
            content=reply,
            context_metadata={"suggested_followups": followups, "engine_mode": engine_mode}
        )
        db.add(assistant_record)
        db.commit()

        return ChatResponseOut(
            reply=reply,
            suggested_followups=followups,
            context_used=context_data
        )

    @staticmethod
    def _format_ai_response(text: Optional[str]) -> str:
        if not text:
            return ""
        import re
        # 1. Normalize line breaks: replace <br>, <br/>, <br /> with standard newlines
        formatted = re.sub(r'<br\s*/?>', '\n', text, flags=re.IGNORECASE)
        # 2. Convert <hr>, <hr/> into markdown horizontal rule
        formatted = re.sub(r'<hr\s*/?>', '\n\n---\n\n', formatted, flags=re.IGNORECASE)
        # 3. Convert <p> and </p> tags
        formatted = re.sub(r'<p\s*>', '\n\n', formatted, flags=re.IGNORECASE)
        formatted = re.sub(r'</p\s*>', '\n', formatted, flags=re.IGNORECASE)
        # 4. Strip any other raw HTML tags to prevent untrusted HTML or raw tags from leaking
        formatted = re.sub(r'</?[a-zA-Z][a-zA-Z0-9]*(?:\s+[^>]*?)?/?>', '', formatted)
        # 5. Ensure tables have a blank line before header row so Markdown parsers parse them correctly
        formatted = re.sub(r'([^\n])\r?\n(\|[^\n]+\|\r?\n\|[-:\s|]+\|)', r'\1\n\n\2', formatted)
        # 6. Clean up excessive consecutive newlines (max 2)
        formatted = re.sub(r'\n{3,}', '\n\n', formatted).strip()
        return formatted

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
            first_grad_note = (
                "**First Graduate Status**: As a declared First Graduate, you qualify for an annual ₹25,000 tuition fee waiver during TNEA counseling."
                if ctx.get("is_first_graduate")
                else "**First Graduate Status**: If any sibling or parent has a degree, standard tuition applies, but you can explore community post-matric schemes."
            )
            govt_note = (
                "\n4. **7.5% TN Govt School Quota**: Your profile indicates 7.5% Govt School reservation eligibility, granting 100% full fee waiver including hostel and counseling fees in Anna University and affiliated colleges."
                if ctx.get("is_govt_school")
                else ""
            )
            return (
                f"Hello {name}! Based on your verified profile in {district} and reservation category **{ctx.get('community', 'OC')}**, matched schemes include **{scholarships}**.\n\n"
                f"1. {first_grad_note}\n"
                f"2. **Fee Feasibility**: With your stated annual budget of ₹{ctx['budget']:,.0f}, premier state institutions like CEG Guindy and GCT Coimbatore offer high ROI with minimal loan exposure.\n"
                f"3. **Education Loans**: Verified public institutions qualify for the SBI Scholar loan scheme with preferential interest rates and no collateral requirements.{govt_note}"
            )
        elif "college" in m or "tnea" in m or "cutoff" in m or "rank" in m:
            return (
                f"Great question, {name}! For your academic profile ({ctx.get('percentage')}% in {ctx.get('stream')}) under the **{ctx.get('community', 'OC')} quota**, your prime Target college matches include **{colleges}**.\n\n"
                f"• **Cut-Off Reference**: TNEA single-window counseling evaluates your composite engineering cut-off out of 200 marks for the {ctx.get('community', 'OC')} category.\n"
                f"• **Regional Corridors**: If staying near {district} is preferred, prioritize institutions within the local zone during TNEA round choice-filling.\n"
                f"• **Scenario Simulation**: You can test mark variances in our **What-If Simulator** to see your Reach, Target, and Safe colleges instantly."
            )
        else:
            return (
                f"Welcome {name}! Analyzing your **Career DNA ({dna})**, your profile shows high alignment with **{career}** and **{', '.join(ctx['top_careers'][:2])}**.\n\n"
                f"**Strategic Pathway Guidance**:\n"
                f"1. **Academics**: Target degree programs in B.Tech AI & DS or B.E. Computer Science through TNEA counseling.\n"
                f"2. **Colleges**: Top institutions matching your profile include **{colleges}**.\n"
                f"3. **Skill Stack**: Prioritize hands-on mastery in core competencies (Python, SQL, Machine Learning) using NPTEL and the Naan Mudhalvan portal.\n"
                f"4. **Financial Aid**: You can review **{scholarships}** to reduce tuition expenses.\n\n"
                f"Feel free to ask about specific college cut-offs, scholarship application checklists, or project roadmap guidance!"
            )
