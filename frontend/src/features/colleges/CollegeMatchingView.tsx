import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  Building2,
  TrendingUp,
  Search,
  Sliders,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  X
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { collegeApi } from '../../services/api';
import type {
  CollegeListItem,
  CollegeDetail,
  CollegeMatchingResponse
} from '../../types/college';

export const CollegeMatchingView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'match' | 'directory'>('match');

  // Match State
  const [matchingData, setMatchingData] = useState<CollegeMatchingResponse | null>(null);
  const [matchLoading, setMatchLoading] = useState(true);
  const [matchError, setMatchError] = useState<string | null>(null);

  // Simulation controls
  const [quota, setQuota] = useState<string>('');
  const [simCutoff, setSimCutoff] = useState<number | undefined>(undefined);
  const [simBudget, setSimBudget] = useState<number | undefined>(undefined);
  const [targetCourse, setTargetCourse] = useState<string>('all');
  const [matchBucket, setMatchBucket] = useState<'target' | 'reach' | 'safe'>('target');

  // Directory State
  const [directoryColleges, setDirectoryColleges] = useState<CollegeListItem[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [dirLoading, setDirLoading] = useState(false);
  const [dirError, setDirError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal State
  const [selectedCollegeSlug, setSelectedCollegeSlug] = useState<string | null>(null);
  const [collegeDetail, setCollegeDetail] = useState<CollegeDetail | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Fetch matches
  const fetchMatchingData = async () => {
    try {
      setMatchLoading(true);
      setMatchError(null);
      const params: any = {};
      if (quota) params.quota = quota;
      if (simCutoff !== undefined && simCutoff > 0) params.custom_cutoff = simCutoff;
      if (simBudget !== undefined && simBudget > 0) params.custom_budget = simBudget;
      if (targetCourse !== 'all') params.target_course = targetCourse;

      const data = await collegeApi.getCollegeMatches(params);
      setMatchingData(data);
      if (!quota && data.student_quota) {
        setQuota(data.student_quota);
      }
      if (simCutoff === undefined) {
        setSimCutoff(data.student_cutoff);
      }
      if (simBudget === undefined) {
        setSimBudget(data.student_budget);
      }
    } catch (err: any) {
      setMatchError(err?.response?.data?.detail || err?.message || 'Failed to load college matches');
    } finally {
      setMatchLoading(false);
    }
  };

  // Fetch directory
  const fetchDirectoryData = async () => {
    try {
      setDirLoading(true);
      setDirError(null);
      const [colleges, dists] = await Promise.all([
        collegeApi.getColleges({ limit: 100 }),
        collegeApi.getDistricts().catch(() => [] as string[]),
      ]);
      setDirectoryColleges(colleges);
      setDistricts(dists);
    } catch (err: any) {
      setDirError(err?.response?.data?.detail || err?.message || 'Failed to load colleges directory');
    } finally {
      setDirLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchingData();
    fetchDirectoryData();
  }, [quota, targetCourse]);

  const handleOpenDetail = async (slug: string) => {
    setSelectedCollegeSlug(slug);
    setModalLoading(true);
    setModalError(null);
    try {
      const data = await collegeApi.getCollegeDetail(slug);
      setCollegeDetail(data);
    } catch (err: any) {
      setModalError(err?.response?.data?.detail || err?.message || 'Failed to load college details');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedCollegeSlug(null);
    setCollegeDetail(null);
  };

  const formatLPA = (amount: number) => {
    return `₹${(amount / 100000).toFixed(1)} LPA`;
  };

  const formatINR = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Filter directory
  const filteredDirectory = directoryColleges.filter((c) => {
    if (selectedDistrict !== 'all' && c.district !== selectedDistrict) return false;
    if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchDist = c.district.toLowerCase().includes(q);
      const matchCode = c.tnea_code?.toLowerCase().includes(q);
      if (!matchName && !matchDist && !matchCode) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Page Header */}
      <PageHeader
        title="Tamil Nadu College Intelligence & Matching"
        subtitle="Match accredited engineering colleges and universities across Tamil Nadu based on verified TNEA cut-off scores, district preferences, reservation quota, and education budget."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Colleges', path: '/colleges' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === 'match' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('match')}
              className="flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              Smart Matching
            </Button>
            <Button
              variant={activeTab === 'directory' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('directory')}
              className="flex items-center gap-1.5"
            >
              <Building2 className="w-4 h-4" />
              State Directory ({directoryColleges.length})
            </Button>
          </div>
        }
      />

      {/* TAB 1: SMART MATCHING */}
      {activeTab === 'match' && (
        <div className="space-y-6">
          {/* Match Simulator Control Panel */}
          <Card className="p-5 border-zinc-200/80 shadow-sm bg-white">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-zinc-100 gap-2">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                    TNEA Single-Window Counseling Parameters
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={fetchMatchingData} className="text-xs h-8">
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  Recalculate Matches
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Simulated Cut-Off */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-zinc-600">
                      TNEA Cut-off Mark
                    </label>
                    <span className="text-xs font-bold text-indigo-600">
                      {simCutoff ? `${simCutoff.toFixed(1)} / 200` : '185.0'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="140"
                    max="200"
                    step="0.5"
                    value={simCutoff || 185}
                    onChange={(e) => setSimCutoff(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-[10px] text-zinc-400">
                    Maths + (Physics/2) + (Chemistry/2)
                  </span>
                </div>

                {/* Quota Category */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1">
                    Reservation Quota
                  </label>
                  <select
                    value={quota}
                    onChange={(e) => setQuota(e.target.value)}
                    className="w-full text-xs font-medium py-2 px-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-indigo-500 outline-none"
                  >
                    <option value="OC">Open Competition (OC)</option>
                    <option value="BC">Backward Class (BC)</option>
                    <option value="BCM">BC Muslim (BCM)</option>
                    <option value="MBC">Most Backward Class (MBC/DNC)</option>
                    <option value="SC">Scheduled Caste (SC)</option>
                    <option value="ST">Scheduled Tribe (ST)</option>
                  </select>
                  <span className="text-[10px] text-zinc-400">State Quota Matrix</span>
                </div>

                {/* Annual Budget Filter */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1">
                    Annual Budget Limit
                  </label>
                  <select
                    value={simBudget || 120000}
                    onChange={(e) => setSimBudget(Number(e.target.value))}
                    className="w-full text-xs font-medium py-2 px-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-indigo-500 outline-none"
                  >
                    <option value={50000}>Under ₹50k (Govt Colleges)</option>
                    <option value={90000}>Under ₹90k (Govt-Aided)</option>
                    <option value={150000}>Under ₹1.5 Lakhs</option>
                    <option value={220000}>Under ₹2.2 Lakhs</option>
                    <option value={350000}>₹3.5+ Lakhs (All Institutions)</option>
                  </select>
                  <span className="text-[10px] text-zinc-400">Tuition + Hostel</span>
                </div>

                {/* Target Course Filter */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1">
                    Preferred Degree
                  </label>
                  <select
                    value={targetCourse}
                    onChange={(e) => setTargetCourse(e.target.value)}
                    className="w-full text-xs font-medium py-2 px-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-indigo-500 outline-none"
                  >
                    <option value="all">All Engineering Degrees</option>
                    <option value="B.Tech AI & DS">B.Tech AI & Data Science</option>
                    <option value="B.E. CSE">B.E. Computer Science</option>
                    <option value="B.E. ECE">B.E. Electronics & Communication</option>
                    <option value="B.E. EEE">B.E. Electrical & Electronics</option>
                    <option value="B.E. Biomedical">B.E. Biomedical Engineering</option>
                    <option value="B.E. Mech">B.E. Mechanical & Automation</option>
                  </select>
                  <span className="text-[10px] text-zinc-400">Filter By Specialization</span>
                </div>
              </div>
            </div>
          </Card>

          {matchLoading && (
            <div className="py-12">
              <LoadingState message="Matching cut-offs against Tamil Nadu Directorate of Technical Education seat matrix..." />
            </div>
          )}

          {matchError && (
            <div className="py-8">
              <ErrorState
                title="Could Not Compute College Matches"
                message={matchError}
                onRetry={fetchMatchingData}
              />
            </div>
          )}

          {matchingData && !matchLoading && (
            <div className="space-y-6">
              {/* Category Tabs: Target, Reach, Safe */}
              <div className="flex flex-wrap items-center gap-2 p-1.5 bg-zinc-100/90 rounded-2xl border border-zinc-200/80">
                <button
                  onClick={() => setMatchBucket('target')}
                  className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    matchBucket === 'target'
                      ? 'bg-white text-indigo-700 shadow-sm border border-zinc-200/60'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Target Matches ({matchingData.target_colleges.length})
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-full">
                    High Probability
                  </span>
                </button>

                <button
                  onClick={() => setMatchBucket('reach')}
                  className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    matchBucket === 'reach'
                      ? 'bg-white text-amber-700 shadow-sm border border-zinc-200/60'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  Reach Colleges ({matchingData.reach_colleges.length})
                  <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full">
                    Aspirational
                  </span>
                </button>

                <button
                  onClick={() => setMatchBucket('safe')}
                  className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    matchBucket === 'safe'
                      ? 'bg-white text-emerald-700 shadow-sm border border-zinc-200/60'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Safe Backups ({matchingData.safe_colleges.length})
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full">
                    Secure Admission
                  </span>
                </button>
              </div>

              {/* Match Cards List */}
              {(() => {
                const list =
                  matchBucket === 'target'
                    ? matchingData.target_colleges
                    : matchBucket === 'reach'
                    ? matchingData.reach_colleges
                    : matchingData.safe_colleges;

                if (list.length === 0) {
                  return (
                    <EmptyState
                      title={`No ${matchBucket.toUpperCase()} Colleges Found`}
                      description="Try adjusting your simulated cut-off mark, expanding reservation quotas, or switching target degrees."
                      actionText="Reset Parameters"
                      onAction={() => {
                        setSimCutoff(188.0);
                        setTargetCourse('all');
                      }}
                    />
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {list.map((item, idx) => {
                      const isReach = item.match_category === 'Reach';
                      const isTarget = item.match_category === 'Target';

                      return (
                        <Card
                          key={`${item.college_id}-${item.course_id}-${idx}`}
                          className="flex flex-col justify-between border-zinc-200/80 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 bg-white group"
                        >
                          <div className="p-6 space-y-4">
                            {/* Top Badges */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex flex-wrap gap-1.5">
                                <Badge variant="secondary" className="text-[10px] font-semibold">
                                  {item.district}
                                </Badge>
                                {item.tnea_code && (
                                  <Badge variant="outline" className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border-indigo-200">
                                    TNEA: {item.tnea_code}
                                  </Badge>
                                )}
                              </div>

                              <Badge
                                variant={isReach ? 'warning' : isTarget ? 'primary' : 'success'}
                                className="text-[10px] font-bold uppercase tracking-wider"
                              >
                                {item.match_category}
                              </Badge>
                            </div>

                            {/* College & Course Title */}
                            <div>
                              <h3
                                onClick={() => handleOpenDetail(item.college_slug)}
                                className="text-sm font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors cursor-pointer line-clamp-2"
                              >
                                {item.college_name}
                              </h3>
                              <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50/70 px-2 py-1 rounded-md">
                                <GraduationCap className="w-3.5 h-3.5" />
                                <span>{item.course_name} ({item.course_short_code})</span>
                              </div>
                            </div>

                            {/* Cut-Off Delta Badge */}
                            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-zinc-500">Cut-Off Requirement</span>
                                <span className="font-bold text-zinc-900">
                                  {item.required_cutoff.toFixed(1)} / 200
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-zinc-500">Your Score Delta</span>
                                <span
                                  className={`font-bold flex items-center gap-1 ${
                                    item.cutoff_delta >= 0 ? 'text-emerald-700' : 'text-amber-700'
                                  }`}
                                >
                                  {item.cutoff_delta >= 0 ? `+${item.cutoff_delta.toFixed(1)}` : `${item.cutoff_delta.toFixed(1)}`} Marks
                                </span>
                              </div>
                            </div>

                            {/* Placement CTC & Total Cost */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="p-2.5 bg-emerald-50/70 rounded-lg">
                                <span className="text-[10px] uppercase font-semibold text-emerald-700 block">
                                  Avg Placement
                                </span>
                                <span className="font-bold text-emerald-900">
                                  {formatLPA(item.average_placement_ctc)}
                                </span>
                              </div>
                              <div className="p-2.5 bg-zinc-50 rounded-lg">
                                <span className="text-[10px] uppercase font-semibold text-zinc-500 block">
                                  Total Annual Fee
                                </span>
                                <span className="font-bold text-zinc-800">
                                  {formatINR(item.total_annual_cost)}
                                </span>
                              </div>
                            </div>

                            {/* Financial Status Indicator */}
                            <div className="flex items-center justify-between pt-1 text-xs">
                              <span className="text-zinc-500">Budget Fit:</span>
                              <span
                                className={`font-semibold text-[11px] px-2 py-0.5 rounded-full ${
                                  item.financial_status === 'Affordable'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : item.financial_status === 'Moderate Stretch'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {item.financial_status}
                              </span>
                            </div>

                            {/* Top Recruiters */}
                            {item.top_recruiters && item.top_recruiters.length > 0 && (
                              <div className="pt-2 border-t border-zinc-100">
                                <span className="text-[10px] uppercase font-semibold text-zinc-400 block mb-1">
                                  Top Recruiters
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {item.top_recruiters.slice(0, 4).map((rec, i) => (
                                    <span
                                      key={i}
                                      className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-medium"
                                    >
                                      {rec}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Card Footer */}
                          <div className="p-4 bg-zinc-50/80 border-t border-zinc-100 rounded-b-2xl flex items-center justify-between">
                            <span className="text-xs text-zinc-500 font-medium">
                              NIRF #{item.nirf_rank || 'N/A'} • {item.naac_grade || 'A'}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDetail(item.college_slug)}
                              className="text-xs font-semibold"
                            >
                              View Cutoffs
                              <ChevronRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STATE DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <Card className="p-5 border-zinc-200/80 shadow-sm bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search college name, district, or TNEA code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-zinc-200 text-xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* District Filter */}
              <div>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-medium focus:bg-white focus:border-indigo-500 outline-none"
                >
                  <option value="all">All Tamil Nadu Districts ({districts.length})</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-medium focus:bg-white focus:border-indigo-500 outline-none"
                >
                  <option value="all">All Institution Categories</option>
                  <option value="Anna University Campus">Anna University Campus</option>
                  <option value="Govt-Aided Autonomous">Govt-Aided Autonomous</option>
                  <option value="Government Autonomous">Government Autonomous</option>
                  <option value="Private Autonomous">Private Autonomous</option>
                  <option value="Institute of National Importance">Institute of National Importance (INI)</option>
                  <option value="Deemed University">Deemed University</option>
                </select>
              </div>
            </div>
          </Card>

          {dirError && (
            <div className="py-8">
              <ErrorState
                title="Failed to Load Colleges Directory"
                message={dirError}
                onRetry={fetchDirectoryData}
              />
            </div>
          )}

          {dirLoading && (
            <div className="py-12">
              <LoadingState message="Loading Tamil Nadu institution catalog..." />
            </div>
          )}

          {filteredDirectory.length === 0 && !dirLoading && (
            <EmptyState
              title="No Colleges Found"
              description="Try broadening your search query or selecting a different district filter."
              actionText="Reset Filters"
              onAction={() => {
                setSearchQuery('');
                setSelectedDistrict('all');
                setSelectedCategory('all');
              }}
            />
          )}

          {/* Directory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDirectory.map((college) => (
              <Card
                key={college.id}
                className="flex flex-col justify-between border-zinc-200/80 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 bg-white group"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="secondary" className="text-[10px] font-semibold">
                      {college.district}
                    </Badge>
                    {college.tnea_code && (
                      <Badge variant="outline" className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border-indigo-200">
                        TNEA: {college.tnea_code}
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h3
                      onClick={() => handleOpenDetail(college.slug)}
                      className="text-base font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors cursor-pointer line-clamp-2"
                    >
                      {college.name}
                    </h3>
                    <span className="text-xs text-zinc-500 block mt-1">
                      {college.category}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-zinc-100">
                    <div className="p-2.5 bg-zinc-50 rounded-lg">
                      <span className="text-[10px] uppercase font-semibold text-zinc-400 block">
                        Annual Tuition
                      </span>
                      <span className="font-bold text-zinc-800">
                        {formatINR(college.tuition_fee_annual)}
                      </span>
                    </div>
                    <div className="p-2.5 bg-emerald-50/70 rounded-lg">
                      <span className="text-[10px] uppercase font-semibold text-emerald-700 block">
                        Avg Placement
                      </span>
                      <span className="font-bold text-emerald-900">
                        {formatLPA(college.average_placement_ctc)}
                      </span>
                    </div>
                  </div>

                  {/* Badges strip */}
                  <div className="flex items-center gap-2 text-xs text-zinc-600">
                    <span className="px-2 py-0.5 rounded bg-zinc-100 font-semibold text-[11px]">
                      NIRF: #{college.nirf_rank || 'N/A'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold text-[11px]">
                      NAAC: {college.naac_grade || 'A'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold text-[11px]">
                      {college.courses_count} Programs
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-zinc-50/80 border-t border-zinc-100 rounded-b-2xl flex items-center justify-between">
                  <span className="text-xs text-zinc-500 font-medium">
                    Placement: {college.placement_percentage}%
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenDetail(college.slug)}
                    className="text-xs font-semibold"
                  >
                    View Details
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* College Detail Modal */}
      <Modal
        isOpen={Boolean(selectedCollegeSlug)}
        onClose={handleCloseDetail}
        title={collegeDetail?.name || 'Institution Details'}
        description={collegeDetail ? `${collegeDetail.category} • ${collegeDetail.district}` : ''}
        maxWidth="2xl"
      >
        {modalLoading && (
          <div className="py-8">
            <LoadingState message="Fetching campus cutoffs and seat matrix..." />
          </div>
        )}

        {modalError && (
          <div className="py-6">
            <ErrorState
              title="Failed to Load Details"
              message={modalError}
              onRetry={() => selectedCollegeSlug && handleOpenDetail(selectedCollegeSlug)}
            />
          </div>
        )}

        {collegeDetail && !modalLoading && (
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block">TNEA Code</span>
                <span className="text-sm font-bold text-zinc-900 block mt-0.5">
                  {collegeDetail.tnea_code || 'Direct / INI'}
                </span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block">NIRF Rank</span>
                <span className="text-sm font-bold text-zinc-900 block mt-0.5">
                  #{collegeDetail.nirf_rank || 'N/A'}
                </span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block">Avg Placement</span>
                <span className="text-sm font-bold text-emerald-700 block mt-0.5">
                  {formatLPA(collegeDetail.average_placement_ctc)}
                </span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block">Highest CTC</span>
                <span className="text-sm font-bold text-purple-700 block mt-0.5">
                  {formatLPA(collegeDetail.highest_placement_ctc)}
                </span>
              </div>
            </div>

            {/* Overview */}
            {collegeDetail.overview && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  About Institution
                </h4>
                <p className="text-xs text-zinc-700 leading-relaxed bg-zinc-50/70 p-3.5 rounded-xl border border-zinc-100">
                  {collegeDetail.overview}
                </p>
              </div>
            )}

            {/* Annual Fee Structure */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <span className="text-[10px] uppercase font-semibold text-indigo-700 block">
                  Annual Tuition Fee
                </span>
                <span className="text-base font-bold text-indigo-950 block mt-0.5">
                  {formatINR(collegeDetail.tuition_fee_annual)}
                </span>
              </div>
              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                <span className="text-[10px] uppercase font-semibold text-purple-700 block">
                  Annual Hostel Fee
                </span>
                <span className="text-base font-bold text-purple-950 block mt-0.5">
                  {formatINR(collegeDetail.hostel_fee_annual)}
                </span>
              </div>
            </div>

            {/* TNEA Course Cut-off Seat Matrix Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Offered Programs & TNEA Cut-Off Marks (Out of 200)
              </h4>
              <div className="overflow-x-auto rounded-xl border border-zinc-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-100/80 text-zinc-600 font-semibold border-b border-zinc-200">
                    <tr>
                      <th className="py-2.5 px-3">Degree Program</th>
                      <th className="py-2.5 px-2 text-center">OC</th>
                      <th className="py-2.5 px-2 text-center">BC</th>
                      <th className="py-2.5 px-2 text-center">MBC</th>
                      <th className="py-2.5 px-2 text-center">SC</th>
                      <th className="py-2.5 px-2 text-center">ST</th>
                      <th className="py-2.5 px-2 text-center">Seats</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {collegeDetail.offered_courses.map((course) => (
                      <tr key={course.id} className="hover:bg-zinc-50/80">
                        <td className="py-2.5 px-3 font-semibold text-zinc-800">
                          {course.course_name} ({course.short_code})
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-indigo-700">
                          {course.cutoff_marks_oc.toFixed(1)}
                        </td>
                        <td className="py-2.5 px-2 text-center font-medium text-zinc-700">
                          {course.cutoff_marks_bc.toFixed(1)}
                        </td>
                        <td className="py-2.5 px-2 text-center font-medium text-zinc-700">
                          {course.cutoff_marks_mbc.toFixed(1)}
                        </td>
                        <td className="py-2.5 px-2 text-center font-medium text-zinc-700">
                          {course.cutoff_marks_sc.toFixed(1)}
                        </td>
                        <td className="py-2.5 px-2 text-center font-medium text-zinc-700">
                          {course.cutoff_marks_st.toFixed(1)}
                        </td>
                        <td className="py-2.5 px-2 text-center text-zinc-500">
                          {course.intake_seats}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Campus Facilities */}
            {collegeDetail.campus_facilities && collegeDetail.campus_facilities.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Specialized Laboratories & Innovation Hubs
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {collegeDetail.campus_facilities.map((fac, i) => (
                    <span
                      key={i}
                      className="text-xs font-medium px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-700 border border-zinc-200/60"
                    >
                      {fac}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Top Recruiters */}
            {collegeDetail.top_recruiters && collegeDetail.top_recruiters.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Key Campus Placement Recruiters
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {collegeDetail.top_recruiters.map((rec, i) => (
                    <span
                      key={i}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60"
                    >
                      {rec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Bottom Close & Link */}
            <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
              {collegeDetail.website_url ? (
                <a
                  href={collegeDetail.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
                >
                  Official College Website
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <span />
              )}
              <Button variant="outline" size="md" onClick={handleCloseDetail}>
                Close Details
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
