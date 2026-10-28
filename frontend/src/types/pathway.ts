import type { EntranceExam } from './career';

export interface PathwayDegreeNode {
  id: number;
  name: string;
  short_code: string;
  degree_level: string;
  duration_years: number;
  stream: string;
  is_primary: boolean;
  relevance_score: number;
  annual_fee_min: number;
  annual_fee_max: number;
  eligibility_criteria?: string | null;
  exams: EntranceExam[];
}

export interface PathwaySkillNode {
  id: number;
  name: string;
  category: string;
  importance_weight: number;
  is_core: boolean;
}

export interface PathwayMilestone {
  step_number: number;
  stage_name: string;
  title: string;
  subtitle: string;
  description: string;
  duration_estimate: string;
  tags: string[];
  metadata: Record<string, any>;
}

export interface EducationPathway {
  career_id: number;
  career_title: string;
  career_slug: string;
  industry: string;
  cluster: string;
  entry_education_level: string;
  tamil_nadu_demand: string;
  salary_range_min: number;
  salary_range_max: number;
  growth_rate: string;
  typical_pathway_summary: string;
  school_preparation: PathwayMilestone;
  undergraduate_milestone: PathwayMilestone;
  degrees: PathwayDegreeNode[];
  skill_milestone: PathwayMilestone;
  skills: PathwaySkillNode[];
  career_launch_milestone: PathwayMilestone;
  higher_studies_milestone: PathwayMilestone;
  higher_studies_options: string[];
  alternative_careers: string[];
  all_milestones: PathwayMilestone[];
}

export interface PathwayListItem {
  id: number;
  title: string;
  slug: string;
  cluster: string;
  industry: string;
}
