export interface StudentProfileData {
  id?: number;
  user_id?: number;
  user_name?: string;
  user_email?: string;

  // Step 1: Basic Info
  age?: number;
  gender?: string;
  state: string;
  district?: string;
  city?: string;
  current_education_level?: string;
  community?: string;
  is_first_graduate?: boolean;
  is_govt_school?: boolean;

  // Step 2: Academics
  school_or_college?: string;
  board_or_university?: string;
  stream?: string;
  percentage_or_cgpa?: number;
  subject_marks?: Record<string, number>;

  // Step 3: Interests
  interests: string[];

  // Step 4: Skills
  skills: { name: string; level: number }[];

  // Step 5: Preferences
  preferred_locations: string[];
  preferred_career_areas: string[];
  govt_or_private?: string;
  higher_studies_preference?: string;
  study_mode?: string;
  college_type?: string;

  // Step 6: Finances
  annual_family_income?: string;
  max_education_budget?: number;
  need_scholarship?: boolean;
  hostel_required?: boolean;
  preferred_fee_range?: string;

  // Step 7: Goals
  short_term_goal?: string;
  long_term_goal?: string;
  target_career?: string;
  higher_study_interest?: boolean;
  onboarding_completed: boolean;
  website_preferences?: Record<string, any>;
}
