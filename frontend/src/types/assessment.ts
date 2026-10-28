export type QuestionType = 'aptitude' | 'interest';

export interface Question {
  id: number;
  category: string;
  question_type: QuestionType;
  question_text: string;
  options: string[];
  interest_dimension?: string | null;
  scoring_weight?: number;
}

export interface AnswerSubmission {
  question_id: number;
  selected_option_index: number;
}

export interface DimensionScore {
  dimension: string;
  category_type: 'aptitude' | 'interest';
  normalized_score: number;
}

export interface AssessmentResult {
  attempt_id: number;
  total_score: number;
  completed: boolean;
  created_at: string;
  dimension_scores: DimensionScore[];
  aptitude_average: number;
  top_interests: string[];
  summary: string;
}
