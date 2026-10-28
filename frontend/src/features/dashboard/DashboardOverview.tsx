import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Tabs } from '../../components/ui/Tabs';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { useToast } from '../../components/ui/Toast';
import {
  profileApi,
  careerDnaApi,
  recommendationApi,
  collegeApi,
  financeApi,
  careerApi
} from '../../services/api';
import type { StudentProfileData } from '../../types/profile';
import type { CareerDNAData } from '../../types/career_dna';
import type { CareerRecommendation } from '../../types/recommendation';
import type { CollegeMatchingResponse } from '../../types/college';
import type { FinancialPlan } from '../../types/more_features';
import {
  Dna,
  Briefcase,
  GraduationCap,
  ArrowRight,
  BotMessageSquare,
  Wallet,
  CheckCircle2,
  Award,
  SlidersHorizontal,
  Flame,
  Milestone,
  Bookmark,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState('summary');

  // Dynamic Dashboard Data State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [dna, setDna] = useState<CareerDNAData | null>(null);
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [collegeMatches, setCollegeMatches] = useState<CollegeMatchingResponse | null>(null);
  const [financialPlan, setFinancialPlan] = useState<FinancialPlan | null>(null);
  const [savingCareerId, setSavingCareerId] = useState<number | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load student profile first
      const profileData = await profileApi.getProfile().catch(() => null);
      setProfile(profileData);

      // Fetch personalized outputs in parallel
      const [dnaRes, recRes, colRes, finRes] = await Promise.allSettled([
        careerDnaApi.getCareerDNA(),
        recommendationApi.getRecommendations(),
        collegeApi.getCollegeMatches(),
        financeApi.getPlan()
      ]);

      if (dnaRes.status === 'fulfilled') setDna(dnaRes.value);
      if (recRes.status === 'fulfilled') setRecommendations(recRes.value.recommendations || []);
      if (colRes.status === 'fulfilled') setCollegeMatches(colRes.value);
      if (finRes.status === 'fulfilled') setFinancialPlan(finRes.value);

    } catch (err: any) {
      console.error('Failed to load dashboard overview data:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to assemble dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCareer = async (careerId: number, title: string) => {
    try {
      setSavingCareerId(careerId);
      await careerApi.saveCareer(careerId);
      success('Career Saved', `${title} has been added to your shortlist.`);
    } catch (err: any) {
      toastError('Save Failed', err?.response?.data?.message || err?.message || 'Could not save career.');
    } finally {
      setSavingCareerId(null);
    }
  };

  const topRec = recommendations.length > 0 ? recommendations[0] : null;

  const tabs = [
    { id: 'summary', label: 'Decision Summary' },
    {
      id: 'dna',
      label: 'Career DNA Preview',
      badge: dna?.confidence_score ? `${Math.round(dna.confidence_score)}%` : undefined
    },
    {
      id: 'pathways',
      label: 'TN College Matches',
      badge: collegeMatches ? `${collegeMatches.total_matches}` : undefined
    },
  ];

  if (loading) {
    return <LoadingState message="Connecting student profile to Tamil Nadu decision intelligence..." />;
  }

  if (error && !profile) {
    return (
      <ErrorState
        title="Dashboard Unavailable"
        message={error}
        onRetry={loadDashboardData}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <PageHeader
        title={`Vanakkam, ${user?.name || profile?.state || 'Student'}!`}
        subtitle={`${profile?.district || 'Tamil Nadu'} • ${profile?.current_education_level || 'Higher Education'} • ${profile?.stream || 'Personalized Stream'}`}
        badge={
          <Badge variant="primary" size="md">
            Profile Match Engine Active
          </Badge>
        }
        actions={
          <div className="flex items-center space-x-2">
            <Link to="/onboarding">
              <Button size="sm" variant="accent" rightIcon={<ArrowRight className="w-4 h-4" />}>
                {user?.onboarding_completed || profile?.onboarding_completed ? 'Update Profile' : 'Start Onboarding'}
              </Button>
            </Link>
          </div>
        }
      />

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Summary */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {/* Top 4 KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Career DNA Card */}
            <Card hoverEffect>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Career DNA Score
                  </span>
                  <div className="p-2 rounded-xl bg-violet-100 text-violet-700">
                    <Dna className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-extrabold text-zinc-900">
                    {dna?.confidence_score ? `${Math.round(dna.confidence_score)}%` : 'Pending'}
                  </div>
                  <p className="text-xs text-emerald-600 font-medium mt-0.5 flex items-center space-x-1 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{dna?.dominant_cluster || 'Complete Assessment'}</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Profile Match Card */}
            <Card hoverEffect>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Top Career Match
                  </span>
                  <div className="p-2 rounded-xl bg-pink-100 text-pink-700">
                    <Briefcase className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xl font-extrabold text-zinc-900 truncate">
                    {topRec ? topRec.career_title : (profile?.target_career || 'Exploring Careers')}
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {topRec ? `${Math.round(topRec.match_score)}% Multi-Factor Fit` : 'Personalized Scoring'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* TN Colleges Card */}
            <Card hoverEffect>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    TN Colleges Found
                  </span>
                  <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-extrabold text-zinc-900">
                    {collegeMatches ? `${collegeMatches.total_matches} Institutions` : 'Evaluating...'}
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {collegeMatches
                      ? `Cutoff: ${collegeMatches.student_cutoff}/200 (${collegeMatches.student_quota} Quota)`
                      : 'TNEA Single-Window'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Financial Feasibility Card */}
            <Card hoverEffect>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Financial Feasibility
                  </span>
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xl font-extrabold text-zinc-900 truncate">
                    {financialPlan ? (financialPlan.net_funding_gap === 0 ? 'Fully Feasible' : 'Aid / Loan Needed') : 'Self-Funded'}
                  </div>
                  <p className="text-xs text-emerald-600 font-medium mt-0.5">
                    Annual Budget: ₹{(profile?.max_education_budget || 120000).toLocaleString('en-IN')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Core Modules Quick Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Career DNA Preview Widget */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Career DNA Profile Indicators</CardTitle>
                    <CardDescription>
                      Personalized traits synthesized from your marks, aptitude assessment, skills, and regional priorities.
                    </CardDescription>
                  </div>
                  <Link to="/career-dna">
                    <Badge variant="primary" className="cursor-pointer hover:bg-violet-200">
                      View Full DNA →
                    </Badge>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {dna && dna.traits && dna.traits.length > 0 ? (
                  dna.traits.slice(0, 5).map((t) => (
                    <ProgressBar
                      key={t.name}
                      label={t.name}
                      value={Math.round(t.score)}
                      color={t.score >= 80 ? 'violet' : t.score >= 60 ? 'pink' : 'amber'}
                    />
                  ))
                ) : (
                  <div className="py-6 text-center space-y-3">
                    <AlertCircle className="w-8 h-8 text-violet-400 mx-auto" />
                    <p className="text-xs text-zinc-500">
                      Take our 10-minute assessment to compute your granular 8-trait Career DNA indicators.
                    </p>
                    <Link to="/assessment">
                      <Button size="sm" variant="outline">
                        Take Assessment Now
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Advisor Prompt Box */}
            <Card className="bg-gradient-to-br from-violet-900 to-purple-900 text-white border-0 shadow-xl flex flex-col justify-between">
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-pink-400 mb-2">
                  <BotMessageSquare className="w-5 h-5" />
                </div>
                <CardTitle className="text-white">Profile-Aware AI Advisor</CardTitle>
                <CardDescription className="text-violet-200">
                  Grounding answers in your actual grades ({profile?.percentage_or_cgpa || 85}%), community quota ({profile?.community || 'OC'}), and district ({profile?.district || 'Tamil Nadu'}).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-violet-100 bg-white/10 p-3 rounded-xl border border-white/10">
                  "Based on my {profile?.community || 'OC'} cutoff of {collegeMatches?.student_cutoff || 185}, what are my best TNEA admission chances?"
                </p>
                <Link to="/ai-advisor">
                  <Button
                    variant="accent"
                    size="sm"
                    className="w-full mt-2"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Open AI Career Advisor
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Real Dynamic Career Recommendations Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Top Career Matches for Your Profile</CardTitle>
                  <CardDescription>
                    Deterministic multi-factor scoring matching your academic marks, cognitive aptitude, skills, and market demand.
                  </CardDescription>
                </div>
                <Link to="/recommendations">
                  <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    View All {recommendations.length} Matches
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recommendations.length > 0 ? (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Career Pathway</TableHeaderCell>
                      <TableHeaderCell>Profile Match</TableHeaderCell>
                      <TableHeaderCell>Industry / Sector</TableHeaderCell>
                      <TableHeaderCell>Starting CTC (TN)</TableHeaderCell>
                      <TableHeaderCell>Action</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recommendations.slice(0, 4).map((rec) => (
                      <TableRow key={rec.career_id}>
                        <TableCell className="font-bold text-zinc-900">
                          <Link to={`/education-paths?career=${rec.slug}`} className="hover:text-violet-700 hover:underline">
                            {rec.career_title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant={rec.match_score >= 80 ? 'success' : 'primary'}>
                            {Math.round(rec.match_score)}% Match
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-zinc-600">{rec.industry}</TableCell>
                        <TableCell className="text-xs font-semibold text-zinc-800">
                          ₹{(rec.salary_range_min / 100000).toFixed(1)} - ₹{(rec.salary_range_max / 100000).toFixed(1)} LPA
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={savingCareerId === rec.career_id}
                            onClick={() => handleSaveCareer(rec.career_id, rec.career_title)}
                          >
                            Save
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center text-zinc-500 text-sm">
                  Complete your basic profile to generate your personalized career matches.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Decision Intelligence Hub Quick Launchpad */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                Decision Intelligence Workspaces
              </h3>
              <span className="text-xs text-violet-600 font-medium">Synchronized with Profile</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link to="/scholarships" className="group">
                <Card hoverEffect className="h-full border-l-4 border-l-emerald-500 group-hover:border-emerald-600 transition-all">
                  <CardContent className="pt-5">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                        <Award className="w-5 h-5" />
                      </div>
                      <Badge variant="success">TN Schemes</Badge>
                    </div>
                    <div className="font-bold text-zinc-900 mt-3 group-hover:text-emerald-700 transition-colors">
                      Scholarship Matching
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      Check eligibility for {profile?.community || 'BC/MBC'} quotas, First Graduate concessions, and 7.5% Govt School aid.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/finance" className="group">
                <Card hoverEffect className="h-full border-l-4 border-l-indigo-500 group-hover:border-indigo-600 transition-all">
                  <CardContent className="pt-5">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <Badge variant="primary">ROI & EMI</Badge>
                    </div>
                    <div className="font-bold text-zinc-900 mt-3 group-hover:text-indigo-700 transition-colors">
                      Financial Feasibility Planner
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      Amortization, education loan interest, monthly EMI, and degree payback against expected starting CTC.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/simulator" className="group">
                <Card hoverEffect className="h-full border-l-4 border-l-purple-500 group-hover:border-purple-600 transition-all">
                  <CardContent className="pt-5">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                        <SlidersHorizontal className="w-5 h-5" />
                      </div>
                      <Badge variant="accent">Interactive</Badge>
                    </div>
                    <div className="font-bold text-zinc-900 mt-3 group-hover:text-purple-700 transition-colors">
                      What-If Path Simulator
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      Simulate cutoff mark gains (+1 to +5 marks) and budget shifts on Tamil Nadu college admissions.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/skills" className="group">
                <Card hoverEffect className="h-full border-l-4 border-l-amber-500 group-hover:border-amber-600 transition-all">
                  <CardContent className="pt-5">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                        <Flame className="w-5 h-5" />
                      </div>
                      <Badge variant="warning">Bridging</Badge>
                    </div>
                    <div className="font-bold text-zinc-900 mt-3 group-hover:text-amber-700 transition-colors">
                      Skill Gap Analyzer
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      Match existing verified skills against industry prerequisites for {topRec ? topRec.career_title : 'Target Careers'}.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/roadmap" className="group">
                <Card hoverEffect className="h-full border-l-4 border-l-blue-500 group-hover:border-blue-600 transition-all">
                  <CardContent className="pt-5">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                        <Milestone className="w-5 h-5" />
                      </div>
                      <Badge variant="primary">12 Months</Badge>
                    </div>
                    <div className="font-bold text-zinc-900 mt-3 group-hover:text-blue-700 transition-colors">
                      Learning Roadmap
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      4-phase milestone curriculum integrated with NPTEL and Naan Mudhalvan verified courses.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/saved" className="group">
                <Card hoverEffect className="h-full border-l-4 border-l-rose-500 group-hover:border-rose-600 transition-all">
                  <CardContent className="pt-5">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                        <Bookmark className="w-5 h-5" />
                      </div>
                      <Badge variant="error">Shortlist</Badge>
                    </div>
                    <div className="font-bold text-zinc-900 mt-3 group-hover:text-rose-700 transition-colors">
                      Saved Hub & Bookmarks
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      Quickly access and organize your saved target careers and shortlisted scholarships.
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Career DNA details */}
      {activeTab === 'dna' && (
        <Card>
          <CardHeader>
            <CardTitle>Career DNA Deep Dive</CardTitle>
            <CardDescription>
              A multidimensional synthesis of your assessment and academic profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {dna ? (
              <>
                <div className="p-4 rounded-xl bg-violet-50 border border-violet-100 text-xs text-violet-900 leading-relaxed">
                  <strong>Why this profile?</strong> {dna.why_this_profile}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-zinc-900">Synthesized Traits</h4>
                    {dna.traits.slice(0, 4).map((t) => (
                      <ProgressBar
                        key={t.name}
                        label={t.name}
                        value={Math.round(t.score)}
                        color="violet"
                      />
                    ))}
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-zinc-900">Orientation & Acumen</h4>
                    {dna.traits.slice(4).map((t) => (
                      <ProgressBar
                        key={t.name}
                        label={t.name}
                        value={Math.round(t.score)}
                        color="pink"
                      />
                    ))}
                  </div>
                </div>

                {dna.explanatory_factors && dna.explanatory_factors.length > 0 && (
                  <div className="space-y-3 pt-3">
                    <h4 className="text-sm font-bold text-zinc-900">Explainable Decision Factors</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {dna.explanatory_factors.map((f, i) => (
                        <div key={i} className="p-3 rounded-xl border border-zinc-200/80 bg-zinc-50/50 space-y-1">
                          <div className="font-semibold text-zinc-800">{f.source}</div>
                          <p className="text-zinc-600">{f.factor}</p>
                          <p className="text-violet-700 text-[11px] font-medium">{f.impact}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                title="Career DNA Not Yet Generated"
                description="Complete your basic onboarding profile and assessment to synthesize your personalized Career DNA indicators."
                icon={Dna}
                actionText="Go to Onboarding"
                onAction={() => window.location.href = '/onboarding'}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 3: TN College Matches */}
      {activeTab === 'pathways' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Personalized College Matching</CardTitle>
                <CardDescription>
                  Matched Tamil Nadu institutions categorized by TNEA cutoff score ({collegeMatches?.student_cutoff || 185}/200) and reservation quota ({collegeMatches?.student_quota || 'OC'}).
                </CardDescription>
              </div>
              <Link to="/colleges">
                <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Full College Match Explorer
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {collegeMatches && (collegeMatches.target_colleges.length > 0 || collegeMatches.safe_colleges.length > 0) ? (
              <div className="space-y-6">
                {/* Target Colleges */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-violet-700 mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Target Colleges (Within TNEA Cutoff Range)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {collegeMatches.target_colleges.slice(0, 4).map((c) => (
                      <div key={`${c.college_id}-${c.course_id}`} className="p-4 rounded-xl border border-zinc-200 bg-white hover:border-violet-300 transition-all space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="font-bold text-sm text-zinc-900">{c.college_name}</h5>
                          <Badge variant="primary" size="sm">{c.course_short_code}</Badge>
                        </div>
                        <div className="text-xs text-zinc-500">{c.district} • TNEA Code: {c.tnea_code || 'N/A'}</div>
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs">
                          <span className="text-emerald-700 font-semibold">Cutoff Req: {c.required_cutoff}</span>
                          <span className="text-zinc-600 font-medium">Avg CTC: ₹{(c.average_placement_ctc / 100000).toFixed(1)} LPA</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safe Colleges */}
                {collegeMatches.safe_colleges.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-3 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Safe Admission Bets
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {collegeMatches.safe_colleges.slice(0, 2).map((c) => (
                        <div key={`${c.college_id}-${c.course_id}`} className="p-4 rounded-xl border border-zinc-200 bg-white hover:border-emerald-300 transition-all space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="font-bold text-sm text-zinc-900">{c.college_name}</h5>
                            <Badge variant="success" size="sm">{c.course_short_code}</Badge>
                          </div>
                          <div className="text-xs text-zinc-500">{c.district} • Cutoff Cushion: +{c.cutoff_delta.toFixed(1)} marks</div>
                          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs">
                            <span className="text-emerald-700 font-semibold">Req: {c.required_cutoff}</span>
                            <span className="text-zinc-600 font-medium">Total Cost: ₹{c.total_annual_cost.toLocaleString('en-IN')}/yr</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                title="No College Matches Generated"
                description="We need your subject marks or academic percentage to evaluate your TNEA engineering counseling matches."
                icon={GraduationCap}
                actionText="Update Marks in Profile"
                onAction={() => window.location.href = '/profile'}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
