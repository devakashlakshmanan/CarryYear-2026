import axios from 'axios';
import type { AxiosError } from 'axios';
import type { ApiResponse, LoginPayload, RegisterPayload, TokenData, User } from '../types/auth';
import type { StudentProfileData } from '../types/profile';
import type { Question, AnswerSubmission, AssessmentResult } from '../types/assessment';
import type { CareerDNAData } from '../types/career_dna';
import type { CareerListItem, CareerDetail, Skill, Course, EntranceExam, SavedCareer } from '../types/career';
import type { RecommendationResponse } from '../types/recommendation';
import type { EducationPathway, PathwayListItem } from '../types/pathway';
import type { CollegeListItem, CollegeDetail, CollegeMatchingResponse } from '../types/college';
import type {
  Scholarship,
  ScholarshipMatchingResponse,
  FinancialPlan,
  SimulationResult,
  SkillGapAnalysis,
  LearningRoadmap,
  ChatMessage,
  ChatResponse,
  UnifiedSavedHub
} from '../types/more_features';

const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('carryyear_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor to handle unauthenticated 401s
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<any>>) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        localStorage.removeItem('carryyear_token');
        localStorage.removeItem('carryyear_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Service API endpoints
export const authApi = {
  register: async (payload: RegisterPayload): Promise<TokenData> => {
    const res = await api.post<ApiResponse<TokenData>>('/auth/register', payload);
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Registration failed');
    }
    return res.data.data;
  },

  login: async (payload: LoginPayload): Promise<TokenData> => {
    const res = await api.post<ApiResponse<TokenData>>('/auth/login', payload);
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Login failed');
    }
    return res.data.data;
  },

  getMe: async (): Promise<User> => {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to fetch user');
    }
    return res.data.data;
  },
};

// Profile Service API endpoints
export const profileApi = {
  getProfile: async (): Promise<StudentProfileData> => {
    const res = await api.get<ApiResponse<StudentProfileData>>('/profile');
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to fetch student profile');
    }
    return res.data.data;
  },

  updateProfile: async (data: Partial<StudentProfileData>): Promise<StudentProfileData> => {
    const res = await api.put<ApiResponse<StudentProfileData>>('/profile', data);
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to update student profile');
    }
    return res.data.data;
  },
};

// Assessment Service API endpoints
export const assessmentApi = {
  getQuestions: async (questionType?: string): Promise<Question[]> => {
    const params = questionType ? { question_type: questionType } : {};
    const res = await api.get<ApiResponse<Question[]>>('/assessment/questions', { params });
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to fetch assessment questions');
    }
    return res.data.data;
  },

  submitAssessment: async (answers: AnswerSubmission[]): Promise<AssessmentResult> => {
    const res = await api.post<ApiResponse<AssessmentResult>>('/assessment/submit', { answers });
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to submit assessment');
    }
    return res.data.data;
  },

  getLatestAssessment: async (): Promise<AssessmentResult | null> => {
    const res = await api.get<ApiResponse<AssessmentResult | null>>('/assessment/latest');
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to fetch latest assessment');
    }
    return res.data.data ?? null;
  },
};

// Career DNA Service API endpoints
export const careerDnaApi = {
  getCareerDNA: async (): Promise<CareerDNAData | null> => {
    const res = await api.get<ApiResponse<CareerDNAData | null>>('/career-dna');
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to fetch Career DNA');
    }
    return res.data.data ?? null;
  },

  generateCareerDNA: async (): Promise<CareerDNAData> => {
    const res = await api.post<ApiResponse<CareerDNAData>>('/career-dna/generate');
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to generate Career DNA');
    }
    return res.data.data;
  },
};

// Career Intelligence Service API endpoints
export const careerApi = {
  getCareers: async (params?: {
    industry?: string;
    cluster?: string;
    search?: string;
    skip?: number;
    limit?: number;
  }): Promise<CareerListItem[]> => {
    const res = await api.get<ApiResponse<CareerListItem[]>>('/careers', { params });
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to fetch careers');
    }
    return res.data.data;
  },

  getCareerDetail: async (idOrSlug: string | number): Promise<CareerDetail> => {
    const res = await api.get<ApiResponse<CareerDetail>>(`/careers/${idOrSlug}`);
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to fetch career details');
    }
    return res.data.data;
  },

  getSkills: async (category?: string): Promise<Skill[]> => {
    const params = category ? { category } : {};
    const res = await api.get<ApiResponse<Skill[]>>('/careers/meta/skills', { params });
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to fetch skills');
    }
    return res.data.data;
  },

  getCourses: async (stream?: string): Promise<Course[]> => {
    const params = stream ? { stream } : {};
    const res = await api.get<ApiResponse<Course[]>>('/careers/meta/courses', { params });
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to fetch courses');
    }
    return res.data.data;
  },

  getEntranceExams: async (): Promise<EntranceExam[]> => {
    const res = await api.get<ApiResponse<EntranceExam[]>>('/careers/meta/exams');
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to fetch entrance exams');
    }
    return res.data.data;
  },

  getSavedCareers: async (): Promise<SavedCareer[]> => {
    const res = await api.get<ApiResponse<SavedCareer[]>>('/careers/saved');
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to fetch saved careers');
    }
    return res.data.data;
  },

  getSavedCareerIds: async (): Promise<number[]> => {
    const res = await api.get<ApiResponse<number[]>>('/careers/saved/ids');
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to fetch saved career IDs');
    }
    return res.data.data;
  },

  saveCareer: async (careerId: number, notes?: string): Promise<SavedCareer> => {
    const params = notes ? { notes } : {};
    const res = await api.post<ApiResponse<SavedCareer>>(`/careers/${careerId}/save`, null, { params });
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to bookmark career');
    }
    return res.data.data;
  },

  unsaveCareer: async (careerId: number): Promise<boolean> => {
    const res = await api.delete<ApiResponse<{ removed: boolean }>>(`/careers/${careerId}/save`);
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to remove career bookmark');
    }
    return res.data.data?.removed ?? true;
  },
};

// Recommendation Engine Service API endpoints
export const recommendationApi = {
  getRecommendations: async (params?: {
    industry?: string;
    min_score?: number;
  }): Promise<RecommendationResponse> => {
    const res = await api.get<ApiResponse<RecommendationResponse>>('/recommendations', { params });
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to fetch career recommendations');
    }
    return res.data.data;
  },
};

// Education Pathways Service API endpoints
export const educationPathwaysApi = {
  getPathwaysList: async (): Promise<PathwayListItem[]> => {
    const res = await api.get<ApiResponse<PathwayListItem[]>>('/education-paths');
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to fetch education pathways list');
    }
    return res.data.data;
  },

  getPathway: async (idOrSlug: string | number): Promise<EducationPathway> => {
    const res = await api.get<ApiResponse<EducationPathway>>(`/education-paths/${idOrSlug}`);
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to fetch career education pathway');
    }
    return res.data.data;
  },
};

// Colleges & Matching Service API endpoints
export const collegeApi = {
  getColleges: async (params?: {
    district?: string;
    category?: string;
    max_fee?: number;
    min_placement_ctc?: number;
    search?: string;
    skip?: number;
    limit?: number;
  }): Promise<CollegeListItem[]> => {
    const res = await api.get<ApiResponse<CollegeListItem[]>>('/colleges', { params });
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to fetch colleges catalog');
    }
    return res.data.data;
  },

  getDistricts: async (): Promise<string[]> => {
    const res = await api.get<ApiResponse<string[]>>('/colleges/meta/districts');
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to fetch districts');
    }
    return res.data.data;
  },

  getCollegeDetail: async (idOrSlug: string | number): Promise<CollegeDetail> => {
    const res = await api.get<ApiResponse<CollegeDetail>>(`/colleges/${idOrSlug}`);
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to fetch college details');
    }
    return res.data.data;
  },

  getCollegeMatches: async (params?: {
    quota?: string;
    target_course?: string;
    custom_cutoff?: number;
    custom_budget?: number;
  }): Promise<CollegeMatchingResponse> => {
    const res = await api.get<ApiResponse<CollegeMatchingResponse>>('/colleges/match', { params });
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to generate college matches');
    }
    return res.data.data;
  },
};

// Scholarship Matching Service
export const scholarshipApi = {
  getScholarships: async (params?: {
    scheme_type?: string;
    community?: string;
    search?: string;
  }): Promise<Scholarship[]> => {
    const res = await api.get<ApiResponse<Scholarship[]>>('/scholarships', { params });
    return res.data.data || [];
  },

  getMatches: async (params?: {
    community?: string;
    income?: number;
    first_graduate?: boolean;
    govt_school?: boolean;
  }): Promise<ScholarshipMatchingResponse> => {
    const res = await api.get<ApiResponse<ScholarshipMatchingResponse>>('/scholarships/match', { params });
    return res.data.data!;
  },

  toggleSave: async (scholarshipId: number): Promise<boolean> => {
    const res = await api.post<ApiResponse<{ saved: boolean }>>(`/scholarships/${scholarshipId}/toggle-save`);
    return res.data.data?.saved ?? false;
  },
};

// Financial Planner Service
export const financeApi = {
  getPlan: async (params?: {
    college_id?: number;
    career_id?: number;
    custom_tuition?: number;
    custom_hostel?: number;
    custom_budget?: number;
    loan_interest_rate?: number;
    loan_tenure_years?: number;
  }): Promise<FinancialPlan> => {
    const res = await api.get<ApiResponse<FinancialPlan>>('/finance/plan', { params });
    return res.data.data!;
  },
};

// What-If Simulator Service
export const simulatorApi = {
  evaluate: async (adjustment: {
    cutoff_delta: number;
    budget_delta: number;
    quota: string;
    preferred_district?: string;
    target_cluster?: string;
  }): Promise<SimulationResult> => {
    const res = await api.post<ApiResponse<SimulationResult>>('/simulator/evaluate', adjustment);
    return res.data.data!;
  },
};

// Skill Gap Analysis Service
export const skillsApi = {
  getGapAnalysis: async (careerIdOrSlug?: string): Promise<SkillGapAnalysis> => {
    const params = careerIdOrSlug ? { career_id_or_slug: careerIdOrSlug } : {};
    const res = await api.get<ApiResponse<SkillGapAnalysis>>('/skills/gap-analysis', { params });
    return res.data.data!;
  },
};

// Learning Roadmap Service
export const roadmapApi = {
  getRoadmap: async (careerIdOrSlug?: string): Promise<LearningRoadmap> => {
    const params = careerIdOrSlug ? { career_id_or_slug: careerIdOrSlug } : {};
    const res = await api.get<ApiResponse<LearningRoadmap>>('/roadmap/generate', { params });
    return res.data.data!;
  },
};

// AI Advisor Service
export const advisorApi = {
  getHistory: async (): Promise<ChatMessage[]> => {
    const res = await api.get<ApiResponse<ChatMessage[]>>('/advisor/history');
    return res.data.data || [];
  },

  sendMessage: async (message: string): Promise<ChatResponse> => {
    const res = await api.post<ApiResponse<ChatResponse>>('/advisor/chat', { message });
    return res.data.data!;
  },
};

// Saved Hub Service
export const savedApi = {
  getAllSaved: async (): Promise<UnifiedSavedHub> => {
    const res = await api.get<ApiResponse<UnifiedSavedHub>>('/saved');
    return res.data.data!;
  },
};







