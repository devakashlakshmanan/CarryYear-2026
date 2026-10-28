import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.db.models.user import User
from app.core.security import get_password_hash, create_access_token

def get_auth_headers(db: Session, email="personalization_tester@carryyear.in"):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            password_hash=get_password_hash("StrongSecret99"),
            name="Ananya Murugan",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    token = create_access_token(subject=user.id)
    return user, {"Authorization": f"Bearer {token}"}

def test_complete_dynamic_personalization_flow(client: TestClient, db: Session):
    user, headers = get_auth_headers(db)

    # 1. Update Onboarding & Student Profile
    profile_payload = {
        "state": "Tamil Nadu",
        "district": "Coimbatore",
        "city": "Coimbatore",
        "age": 18,
        "gender": "Female",
        "community": "BC",
        "is_first_graduate": True,
        "is_govt_school": False,
        "current_education_level": "Class 12",
        "school_or_college": "PSG Sarvajana HSS",
        "board_or_university": "Tamil Nadu State Board",
        "stream": "Computer Science & Maths",
        "percentage_or_cgpa": 92.5,
        "subject_marks": {
            "Mathematics": 98.0,
            "Physics": 94.0,
            "Chemistry": 90.0,
            "Computer Science": 98.0
        },
        "interests": ["Technology", "Artificial Intelligence", "Research", "Engineering"],
        "skills": [
            {"name": "Python", "level": 80.0},
            {"name": "SQL", "level": 70.0},
            {"name": "Problem Solving", "level": 85.0}
        ],
        "preferred_locations": ["Coimbatore", "Chennai"],
        "preferred_career_areas": ["Data Science", "Artificial Intelligence"],
        "target_career": "Data Scientist",
        "annual_family_income": "2.5 - 5 Lakhs",
        "max_education_budget": 140000.0,
        "need_scholarship": True,
        "hostel_required": True,
        "onboarding_completed": True
    }

    resp = client.put("/api/profile", json=profile_payload, headers=headers)
    assert resp.status_code == 200
    p_data = resp.json()["data"]
    assert p_data["district"] == "Coimbatore"
    assert p_data["community"] == "BC"
    assert p_data["is_first_graduate"] is True
    assert p_data["max_education_budget"] == 140000.0

    # 2. Career DNA Generation
    dna_resp = client.get("/api/career-dna", headers=headers)
    assert dna_resp.status_code == 200
    dna = dna_resp.json()["data"]
    assert dna is not None
    assert dna["confidence_score"] >= 75.0
    assert len(dna["traits"]) >= 8
    assert "why_this_profile" in dna
    assert "Coimbatore" in str(dna["explanatory_factors"]) or "Mathematics" in str(dna["explanatory_factors"])

    # 3. Career Recommendations
    rec_resp = client.get("/api/recommendations", headers=headers)
    assert rec_resp.status_code == 200
    rec_data = rec_resp.json()["data"]
    recs = rec_data["recommendations"]
    assert len(recs) > 0
    top_rec = recs[0]
    assert top_rec["match_score"] >= 70.0
    assert "factors" in top_rec
    assert top_rec["factors"]["academic_fit"] > 0
    assert top_rec["factors"]["skill_match"] > 0

    # 4. College Matching: verify TNEA Cutoff = 98 + 94/2 + 90/2 = 190.0, and BC quota
    col_resp = client.get("/api/colleges/match", headers=headers)
    assert col_resp.status_code == 200
    match_data = col_resp.json()["data"]
    assert match_data["student_cutoff"] == 190.0
    assert match_data["student_quota"] == "BC"
    assert match_data["student_budget"] == 140000.0
    assert match_data["preferred_district"] == "Coimbatore"
    assert match_data["total_matches"] > 0

    # 5. Scholarship Matching: verify First Graduate & BC welfare match
    sch_resp = client.get("/api/scholarships/match", headers=headers)
    assert sch_resp.status_code == 200
    sch_data = sch_resp.json()["data"]
    assert sch_data["eligible_schemes_count"] > 0
    fg_match = next((s for s in sch_data["matches"] if "First Graduate" in s["scholarship"]["title"]), None)
    assert fg_match is not None
    assert fg_match["is_eligible"] is True
    assert any("First Graduate" in r for r in fg_match["eligibility_reasons"])

    # 6. Financial Planner: uses student's ₹140,000 budget and matched college fees
    fin_resp = client.get("/api/finance/plan", headers=headers)
    assert fin_resp.status_code == 200
    fin_data = fin_resp.json()["data"]
    assert fin_data["annual_student_budget"] == 140000.0
    assert fin_data["annual_tuition_fee"] > 0
    assert fin_data["total_degree_cost"] > 0
    assert "actionable_recommendations" in fin_data

    # 7. What-If Simulator: test +2.5 mark cutoff gain
    sim_resp = client.post("/api/simulator/evaluate", json={"cutoff_delta": 2.5, "budget_delta": 20000, "quota": "BC"}, headers=headers)
    assert sim_resp.status_code == 200
    sim_data = sim_resp.json()["data"]
    assert sim_data["baseline_cutoff"] == 190.0
    assert sim_data["simulated_cutoff"] == 192.5
    assert sim_data["simulated_budget"] == 160000.0
    assert sim_data["total_admission_options"] > 0

    # 8. Skill Gap Analysis: tests student's declared skills (Python, SQL) against Data Scientist
    gap_resp = client.get("/api/skills/gap-analysis", headers=headers)
    assert gap_resp.status_code == 200
    gap_data = gap_resp.json()["data"]
    assert "Data Scientist" in gap_data["target_career_title"]
    assert gap_data["overall_skill_readiness_percent"] > 0
    assert len(gap_data["gap_items"]) > 0

    # 9. Learning Roadmap: produces 4-phase track with verified resource URLs
    road_resp = client.get("/api/roadmap/generate", headers=headers)
    assert road_resp.status_code == 200
    road_data = road_resp.json()["data"]
    assert len(road_data["phases"]) >= 4
    p1 = road_data["phases"][0]
    assert len(p1["curated_resources"]) > 0
    assert any("nptel.ac.in" in r["url"] or "naanmudhalvan" in r["url"] for r in p1["curated_resources"])

    # 10. AI Career Advisor Chat: personalized reply referencing student context
    adv_resp = client.post("/api/advisor/chat", json={"message": "What is my TNEA cutoff and what scholarships can I get?"}, headers=headers)
    assert adv_resp.status_code == 200
    adv_data = adv_resp.json()["data"]
    assert "reply" in adv_data
    reply_text = adv_data["reply"]
    assert len(reply_text) > 10
    assert "190" in str(adv_data["context_used"]) or "BC" in str(adv_data["context_used"])

    # 11. Profile Update & Dynamic Refresh: change target career and budget
    update_resp = client.put("/api/profile", json={"max_education_budget": 200000.0, "target_career": "AI / Machine Learning Engineer"}, headers=headers)
    assert update_resp.status_code == 200
    assert update_resp.json()["data"]["max_education_budget"] == 200000.0

    # Verify Financial Planner refreshed to new ₹200,000 budget
    fin_refreshed = client.get("/api/finance/plan", headers=headers).json()["data"]
    assert fin_refreshed["annual_student_budget"] == 200000.0

    # 12. Data Provenance Sync: verify official sources
    sync_resp = client.post("/api/data-provenance/sync")
    assert sync_resp.status_code == 200
    sync_data = sync_resp.json()["data"]
    assert sync_data["status"] == "success"
    assert sync_data["colleges_verified"] > 0
    assert sync_data["scholarships_verified"] > 0
