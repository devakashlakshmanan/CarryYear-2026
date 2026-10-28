export interface Skill {
  id: number;
  name: string;
  category: string;
  description?: string | null;
}

export interface EntranceExam {
  id: number;
  name: string;
  short_code: string;
  conducting_body: string;
  level: string;
  mode: string;
  description?: string | null;
  website_url?: string | null;
}

export interface Course {
  id: number;
  name: string;
  short_code: string;
  degree_level: string;
  duration_years: number;
  stream: string;
  description?: string | null;
  eligibility_criteria?: string | null;
  average_annual_fee_min: number;
  average_annual_fee_max: number;
  exams: EntranceExam[];
}

export interface CareerSkill {
  id: number;
  name: string;
  category: string;
  importance_weight: number;
  is_core: boolean;
}

export interface CareerCourse {
  id: number;
  name: string;
  short_code: string;
  degree_level: string;
  duration_years: number;
  stream: string;
  is_primary: boolean;
  relevance_score: number;
  exams: EntranceExam[];
}

export interface CareerListItem {
  id: number;
  title: string;
  slug: string;
  cluster: string;
  industry: string;
  short_description: string;
  typical_pathway: string;
  entry_education_level: string;
  salary_range_min: number;
  salary_range_max: number;
  growth_rate: string;
  tamil_nadu_demand: string;
  work_environment: string;
  key_skills: string[];
}

export interface CareerDetail extends CareerListItem {
  overview: string;
  higher_studies_options: string[];
  alternative_careers: string[];
  skills: CareerSkill[];
  courses: CareerCourse[];
  created_at: string;
}

export interface SavedCareer {
  id: number;
  career_id: number;
  career: CareerListItem;
  notes?: string | null;
  created_at: string;
}

