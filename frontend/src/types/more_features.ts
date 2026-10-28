import type { SavedCareer } from './career';

export interface Scholarship {
  id: number;
  title: string;
  slug: string;
  provider: string;
  scheme_type: string;
  amount_per_annum: number;
  is_full_tuition_waiver: boolean;
  description: string;
  eligibility_community: string[];
  max_family_income?: number | null;
  min_academic_percentage?: number | null;
  gender_requirement: string;
  first_graduate_only: boolean;
  govt_school_quota_only: boolean;
  required_documents: string[];
  application_portal_url?: string | null;
  deadline_info: string;
}

export interface ScholarshipMatchItem {
  scholarship: Scholarship;
  is_eligible: boolean;
  eligibility_status: string;
  match_score: number;
  eligibility_reasons: string[];
  annual_benefit_amount: number;
  is_saved: boolean;
}

export interface ScholarshipMatchingResponse {
  total_schemes_evaluated: number;
  eligible_schemes_count: number;
  total_potential_aid: number;
  matches: ScholarshipMatchItem[];
}

export interface FinancialPlan {
  college_name: string;
  target_career: string;
  degree_duration_years: number;
  annual_tuition_fee: number;
  annual_hostel_fee: number;
  annual_living_expenses: number;
  total_annual_cost: number;
  total_degree_cost: number;
  annual_student_budget: number;
  total_student_budget: number;
  annual_scholarships_aid: number;
  total_scholarships_aid: number;
  net_funding_gap: number;
  financial_feasibility_tier: string;
  loan_principal: number;
  loan_interest_rate_percent: number;
  loan_tenure_years: number;
  moratorium_years: number;
  monthly_emi_amount: number;
  total_loan_repayment_amount: number;
  total_interest_payable: number;
  expected_starting_ctc: number;
  expected_monthly_gross: number;
  emi_to_income_ratio_percent: number;
  investment_payback_years: number;
  actionable_recommendations: string[];
}

export interface SimulationResult {
  baseline_cutoff: number;
  simulated_cutoff: number;
  baseline_budget: number;
  simulated_budget: number;
  quota: string;
  reach_colleges_count: number;
  target_colleges_count: number;
  safe_colleges_count: number;
  total_admission_options: number;
  top_recommended_colleges: Array<{
    college_name: string;
    district: string;
    course: string;
    category: string;
    cutoff_delta: number;
    annual_cost: number;
  }>;
  career_options: Array<{
    career_title: string;
    match_score: number;
    starting_ctc: number;
    industry: string;
  }>;
  insights: string[];
}

export interface SkillGapItem {
  skill_name: string;
  category: string;
  is_core: boolean;
  importance_weight: number;
  current_proficiency_percent: number;
  required_proficiency_percent: number;
  gap_percent: number;
  status: string;
  recommended_action: string;
}

export interface SkillGapAnalysis {
  target_career_id: number;
  target_career_title: string;
  target_career_industry: string;
  overall_skill_readiness_percent: number;
  core_skills_acquired: number;
  total_core_skills: number;
  gap_items: SkillGapItem[];
  top_priority_skills_to_learn: string[];
  estimated_study_hours_to_bridge: number;
}

export interface LearningResource {
  title: string;
  provider: string;
  format: string;
  is_free: boolean;
  url: string;
}

export interface RoadmapPhase {
  phase_number: number;
  title: string;
  timeline: string;
  focus_objective: string;
  milestones: string[];
  curated_resources: LearningResource[];
  hands_on_deliverable: string;
}

export interface LearningRoadmap {
  target_career: string;
  total_duration: string;
  estimated_weekly_commitment: string;
  phases: RoadmapPhase[];
  recommended_certifications: string[];
  tamil_nadu_internship_portals: string[];
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatResponse {
  reply: string;
  suggested_followups: string[];
  context_used: Record<string, any>;
}

export interface SavedScholarshipItem {
  id: number;
  scholarship_id: number;
  title: string;
  provider: string;
  amount_per_annum: number;
  scheme_type: string;
  deadline_info: string;
}

export interface UnifiedSavedHub {
  total_saved_count: number;
  saved_careers: SavedCareer[];
  saved_scholarships: SavedScholarshipItem[];
}
