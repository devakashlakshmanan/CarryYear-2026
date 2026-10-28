import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardOverview } from './features/dashboard/DashboardOverview';
import { ProtectedRoute } from './components/ProtectedRoute';
import { OnboardingWizard } from './features/onboarding/OnboardingWizard';
import { AssessmentView } from './features/assessment/AssessmentView';
import { CareerDNAView } from './features/career_dna/CareerDNAView';
import { CareerRecommendationsView } from './features/recommendations/CareerRecommendationsView';
import { CareerExplorerView } from './features/careers/CareerExplorerView';
import { EducationPathwaysView } from './features/education_pathways/EducationPathwaysView';
import { CollegeMatchingView } from './features/colleges/CollegeMatchingView';
import { ScholarshipMatchingView } from './features/scholarships/ScholarshipMatchingView';
import { FinancialPlannerView } from './features/finance/FinancialPlannerView';
import { WhatIfSimulatorView } from './features/simulator/WhatIfSimulatorView';
import { SkillGapView } from './features/skills/SkillGapView';
import { LearningRoadmapView } from './features/roadmap/LearningRoadmapView';
import { AIAdvisorView } from './features/advisor/AIAdvisorView';
import { SavedHubView } from './features/saved/SavedHubView';
import { SettingsView } from './features/settings/SettingsView';
import { MyProfileView } from './features/profile/MyProfileView';
import { Compass, Sparkles, GraduationCap, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';

function LandingPage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-[#FAF9FF] text-zinc-900 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-md shadow-violet-500/20">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-violet-700 to-purple-600 bg-clip-text text-transparent">
                CarryYear
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800">
                Tamil Nadu
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs transition-all shadow-sm"
              >
                Go to Dashboard ({user?.name})
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 font-medium text-xs transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs transition-all shadow-sm shadow-violet-500/20"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-violet-50 border border-violet-200/60 text-violet-700 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-pink-500" />
          <span>Tamil Nadu Personalized Decision Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 max-w-3xl leading-tight">
          Your Career. <span className="text-violet-600">Your Path.</span> Your Future.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-zinc-600 max-w-2xl leading-relaxed">
          CarryYear transforms academic profiles, aptitude, interests, skills, goals and financial constraints into explainable personalized career and education pathways.
        </p>

        {/* Feature Highlights */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-4xl text-left">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-soft hover:shadow-premium transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base text-zinc-900">Career DNA</h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Multi-dimensional profile combining analytical thinking, aptitude, interests and skills into an explainable indicator profile.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-soft hover:shadow-premium transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base text-zinc-900">Tamil Nadu College Matching</h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Matched against regional colleges across Tamil Nadu districts with fee estimates, course mapping, and financial feasibility.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-soft hover:shadow-premium transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base text-zinc-900">Explainable Decisions</h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Never black-box. Transparent factor breakdowns showing academic fit, aptitude alignment, and actionable skill gaps.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap gap-4 justify-center">
          <Link
            to="/register"
            className="px-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition-all shadow-md shadow-violet-500/25 flex items-center space-x-2"
          >
            <span>Build My Career DNA</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="px-8 py-3.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 font-semibold text-sm border border-zinc-200 transition-all shadow-sm"
          >
            Sign In to Account
          </Link>
        </div>
      </main>

      <footer className="border-t border-zinc-200/60 py-6 text-center text-xs text-zinc-500">
        CarryYear Platform &copy; 2026. Built with FastAPI, PostgreSQL, React, TypeScript, and Groq Decision Intelligence.
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Authenticated Dashboard Shell */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<DashboardOverview />} />
              <Route path="onboarding" element={<OnboardingWizard />} />
              <Route path="profile" element={<MyProfileView />} />
              <Route path="career-dna" element={<CareerDNAView />} />
              <Route path="assessment" element={<AssessmentView />} />
              <Route path="careers" element={<CareerExplorerView />} />
              <Route path="recommendations" element={<CareerRecommendationsView />} />
              <Route path="education-paths" element={<EducationPathwaysView />} />
              <Route path="colleges" element={<CollegeMatchingView />} />
              <Route path="scholarships" element={<ScholarshipMatchingView />} />
              <Route path="finance" element={<FinancialPlannerView />} />
              <Route path="simulator" element={<WhatIfSimulatorView />} />
              <Route path="skills" element={<SkillGapView />} />
              <Route path="roadmap" element={<LearningRoadmapView />} />
              <Route path="ai-advisor" element={<AIAdvisorView />} />
              <Route path="saved" element={<SavedHubView />} />
              <Route path="settings" element={<SettingsView />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}
