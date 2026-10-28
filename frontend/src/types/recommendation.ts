export interface FactorBreakdown {
  academic_fit: number;
  aptitude_fit: number;
  interest_alignment: number;
  skill_match: number;
  financial_feasibility: number;
  location_fit: number;
}

export interface CareerRecommendation {
  career_id: number;
  career_title: string;
  slug: string;
  cluster: string;
  industry: string;
  match_score: number;
  match_tier: 'High Match' | 'Moderate Match' | 'Potential Pathway';
  factors: FactorBreakdown;
  explanation: string;
  matching_skills: string[];
  skill_gaps: string[];
  salary_range_min: number;
  salary_range_max: number;
  growth_rate: string;
  tamil_nadu_demand: string;
  typical_pathway: string;
  primary_degree?: string | null;
}

export interface RecommendationResponse {
  user_id: number;
  total_evaluated: number;
  dominant_cluster: string;
  recommendations: CareerRecommendation[];
}
