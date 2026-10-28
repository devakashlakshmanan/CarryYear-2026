import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Tabs } from '../../components/ui/Tabs';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';
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
  Bookmark
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const { success, info } = useToast();
  const [activeTab, setActiveTab] = useState('summary');

  const tabs = [
    { id: 'summary', label: 'Decision Summary' },
    { id: 'dna', label: 'Career DNA Preview', badge: '88%' },
    { id: 'pathways', label: 'TN College Matches' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <PageHeader
        title={`Vanakkam, ${user?.name || 'Student'}!`}
        subtitle="Tamil Nadu Personalized Career & Education Decision Intelligence Dashboard"
        badge={
          <Badge variant="primary" size="md">
            Profile Match Engine Active
          </Badge>
        }
        actions={
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => info('Notification', 'Tamil Nadu counseling dataset updated for 2026.')}
            >
              Test Notification
            </Button>
            <Link to="/onboarding">
              <Button size="sm" variant="accent" rightIcon={<ArrowRight className="w-4 h-4" />}>
                {user?.onboarding_completed ? 'Update Profile' : 'Start Onboarding'}
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
                  <div className="text-2xl font-extrabold text-zinc-900">86%</div>
                  <p className="text-xs text-emerald-600 font-medium mt-0.5 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Technology & Research Focus</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card hoverEffect>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Profile Match
                  </span>
                  <div className="p-2 rounded-xl bg-pink-100 text-pink-700">
                    <Briefcase className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-extrabold text-zinc-900">Data Scientist</div>
                  <p className="text-xs text-zinc-500 mt-0.5">89% Multi-Factor Fit</p>
                </div>
              </CardContent>
            </Card>

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
                  <div className="text-2xl font-extrabold text-zinc-900">14 Institutions</div>
                  <p className="text-xs text-zinc-500 mt-0.5">Chennai, CBE, Madurai</p>
                </div>
              </CardContent>
            </Card>

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
                  <div className="text-2xl font-extrabold text-zinc-900">Feasible</div>
                  <p className="text-xs text-emerald-600 font-medium mt-0.5">Within ₹1.5L Budget</p>
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
                      Profile indicators generated from your academic scores, aptitude assessments, and skill data.
                    </CardDescription>
                  </div>
                  <Badge variant="primary">Updated</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProgressBar label="Analytical Thinking" value={84} color="violet" />
                <ProgressBar label="Technology Orientation" value={91} color="violet" />
                <ProgressBar label="Problem Solving" value={88} color="violet" />
                <ProgressBar label="Research Orientation" value={72} color="pink" />
                <ProgressBar label="Communication & Articulation" value={67} color="pink" />
                <ProgressBar label="Business & Management Fit" value={51} color="amber" />
              </CardContent>
            </Card>

            {/* AI Advisor Prompt Box */}
            <Card className="bg-gradient-to-br from-violet-900 to-purple-900 text-white border-0 shadow-xl">
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-pink-400 mb-2">
                  <BotMessageSquare className="w-5 h-5" />
                </div>
                <CardTitle className="text-white">Profile-Aware AI Advisor</CardTitle>
                <CardDescription className="text-violet-200">
                  Powered by Groq Llama-3.3 and RAG vector retrieval across Tamil Nadu colleges and career data.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-violet-100 bg-white/10 p-3 rounded-xl border border-white/10">
                  "Why was Data Scientist recommended over Full-Stack Developer for my profile?"
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

          {/* Sample Table Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Top Career Matches (Deterministic Scoring)</CardTitle>
              <CardDescription>
                Compatibility scores calculated across Academic Fit, Aptitude Fit, Interests, and Market Demand.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Career Pathway</TableHeaderCell>
                    <TableHeaderCell>Profile Match</TableHeaderCell>
                    <TableHeaderCell>Primary Route</TableHeaderCell>
                    <TableHeaderCell>Top Factor</TableHeaderCell>
                    <TableHeaderCell>Action</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-bold text-zinc-900">
                      Data Scientist
                    </TableCell>
                    <TableCell>
                      <Badge variant="success">89% Match</Badge>
                    </TableCell>
                    <TableCell>B.Tech AI & Data Science (Anna Univ / Autonomous)</TableCell>
                    <TableCell className="text-xs text-zinc-500">Strong Quantitative & Tech Aptitude</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => success('Career Saved', 'Data Scientist added to your saved careers.')}>
                        Save
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold text-zinc-900">
                      AI / Machine Learning Engineer
                    </TableCell>
                    <TableCell>
                      <Badge variant="success">86% Match</Badge>
                    </TableCell>
                    <TableCell>B.Tech CSE / AI & ML</TableCell>
                    <TableCell className="text-xs text-zinc-500">Python & Problem Solving Skills</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => success('Career Saved', 'AI Engineer added to your saved careers.')}>
                        Save
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold text-zinc-900">
                      Data Analyst
                    </TableCell>
                    <TableCell>
                      <Badge variant="primary">82% Match</Badge>
                    </TableCell>
                    <TableCell>B.Sc Statistics / Data Science / B.Tech</TableCell>
                    <TableCell className="text-xs text-zinc-500">Analytical & Logic Reasoning</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => success('Career Saved', 'Data Analyst added to your saved careers.')}>
                        Save
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          {/* Decision Intelligence Hub Quick Launchpad */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                Decision Intelligence Workspaces
              </h3>
              <span className="text-xs text-violet-600 font-medium">All Models Synchronized</span>
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
                      Check eligibility for 7.5% Govt School, First Graduate, and Post-Matric welfare aid.
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
                      Amortization, education loan interest, monthly EMI, and career payback calculation.
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
                      Explore how higher cutoffs, lower budgets, or shifting to AI impacts college matches.
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
                      Match existing student competencies against industry prerequisites and bridge deficits.
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
                      Step-by-step 4-phase curriculum integrated with NPTEL and Naan Mudhalvan courses.
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
                      Quickly access and organize your saved target careers and eligible scholarships.
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-zinc-900">Aptitude Dimensions</h4>
                <ProgressBar label="Logical Reasoning" value={78} color="violet" />
                <ProgressBar label="Numerical Reasoning" value={82} color="violet" />
                <ProgressBar label="Analytical Reasoning" value={74} color="violet" />
                <ProgressBar label="Verbal Reasoning" value={68} color="violet" />
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-zinc-900">Interest Orientation</h4>
                <ProgressBar label="Technology Interest" value={91} color="pink" />
                <ProgressBar label="Science & Research" value={76} color="pink" />
                <ProgressBar label="Design & Creative" value={54} color="pink" />
                <ProgressBar label="Business & Finance" value={61} color="amber" />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-violet-50 border border-violet-100 text-xs text-violet-900 leading-relaxed">
              <strong>Why this profile?</strong> Your strong analytical and technology indicators, combined with your high marks in Mathematics and Computer Science, contribute strongly to your technology-oriented profile.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Empty State demonstration */}
      {activeTab === 'pathways' && (
        <EmptyState
          title="Select Target Career for College Matching"
          description="Complete your career selection to discover Tamil Nadu engineering and arts colleges tailored to your budget and cutoff criteria."
          icon={GraduationCap}
          actionText="Explore Careers"
          onAction={() => window.location.href = '/careers'}
        />
      )}
    </div>
  );
};
