export interface CollegeCourseCutoff {
  id: number;
  course_id: number;
  course_name: string;
  short_code: string;
  stream: string;
  duration_years: number;
  cutoff_marks_oc: number;
  cutoff_marks_bc: number;
  cutoff_marks_mbc: number;
  cutoff_marks_sc: number;
  cutoff_marks_st: number;
  intake_seats: number;
}

export interface CollegeListItem {
  id: number;
  name: string;
  slug: string;
  district: string;
  category: string;
  tnea_code?: string | null;
  nirf_rank?: number | null;
  naac_grade?: string | null;
  tuition_fee_annual: number;
  hostel_fee_annual: number;
  average_placement_ctc: number;
  highest_placement_ctc: number;
  placement_percentage: number;
  top_recruiters: string[];
  courses_count: number;
}

export interface CollegeDetail extends CollegeListItem {
  campus_facilities: string[];
  overview?: string | null;
  website_url?: string | null;
  offered_courses: CollegeCourseCutoff[];
}

export interface CollegeMatchItem {
  college_id: number;
  college_name: string;
  college_slug: string;
  district: string;
  category: string;
  tnea_code?: string | null;
  nirf_rank?: number | null;
  naac_grade?: string | null;
  course_id: number;
  course_name: string;
  course_short_code: string;
  student_cutoff: number;
  required_cutoff: number;
  cutoff_delta: number;
  match_category: 'Reach' | 'Target' | 'Safe';
  financial_status: 'Affordable' | 'Moderate Stretch' | 'High Budget Gap';
  total_annual_cost: number;
  user_annual_budget: number;
  budget_surplus_or_deficit: number;
  average_placement_ctc: number;
  highest_placement_ctc: number;
  top_recruiters: string[];
  district_match: boolean;
}

export interface CollegeMatchingResponse {
  student_cutoff: number;
  student_quota: string;
  student_budget: number;
  preferred_district?: string | null;
  total_matches: number;
  reach_colleges: CollegeMatchItem[];
  target_colleges: CollegeMatchItem[];
  safe_colleges: CollegeMatchItem[];
}
