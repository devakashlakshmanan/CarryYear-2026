import React, { useEffect, useState, useMemo } from 'react';
import {
  Search,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  TrendingUp,
  MapPin,
  GraduationCap,
  Sparkles,
  ChevronRight,
  BookOpen,
  Compass,
  CheckCircle2,
  RefreshCw,
  X
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { careerApi } from '../../services/api';
import type { CareerListItem, CareerDetail } from '../../types/career';

export const CareerExplorerView: React.FC = () => {
  const [careers, setCareers] = useState<CareerListItem[]>([]);
  const [savedCareerIds, setSavedCareerIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedCluster, setSelectedCluster] = useState<string>('all');
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [minSalaryFilter, setMinSalaryFilter] = useState<number>(0);

  // Detail Modal State
  const [selectedCareerSlug, setSelectedCareerSlug] = useState<string | null>(null);
  const [careerDetail, setCareerDetail] = useState<CareerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Toast / notification feedback
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const fetchCareersAndBookmarks = async () => {
    try {
      setLoading(true);
      setError(null);
      const [careersData, savedIds] = await Promise.all([
        careerApi.getCareers({ limit: 100 }),
        careerApi.getSavedCareerIds().catch(() => [] as number[]),
      ]);
      setCareers(careersData);
      setSavedCareerIds(new Set(savedIds));
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load career catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareersAndBookmarks();
  }, []);

  // Handle bookmark toggle
  const handleToggleBookmark = async (career: CareerListItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isSaved = savedCareerIds.has(career.id);

    // Optimistic UI update
    setSavedCareerIds((prev) => {
      const next = new Set(prev);
      if (isSaved) {
        next.delete(career.id);
      } else {
        next.add(career.id);
      }
      return next;
    });

    try {
      if (isSaved) {
        await careerApi.unsaveCareer(career.id);
        triggerToast(`Removed "${career.title}" from saved list.`);
      } else {
        await careerApi.saveCareer(career.id);
        triggerToast(`Saved "${career.title}" to your bookmarks!`);
      }
    } catch (err) {
      // Revert if error
      setSavedCareerIds((prev) => {
        const next = new Set(prev);
        if (isSaved) next.add(career.id);
        else next.delete(career.id);
        return next;
      });
      triggerToast('Failed to update bookmark. Please try again.');
    }
  };

  const triggerToast = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 3500);
  };

  // Open detail modal
  const handleOpenDetail = async (slug: string) => {
    setSelectedCareerSlug(slug);
    setDetailLoading(true);
    setDetailError(null);
    try {
      const data = await careerApi.getCareerDetail(slug);
      setCareerDetail(data);
    } catch (err: any) {
      setDetailError(err?.message || 'Failed to load career details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedCareerSlug(null);
    setCareerDetail(null);
  };

  // Extract unique industries and clusters
  const industries = useMemo(() => {
    const set = new Set<string>();
    careers.forEach((c) => {
      if (c.industry) set.add(c.industry);
    });
    return Array.from(set).sort();
  }, [careers]);

  const clusters = useMemo(() => {
    const set = new Set<string>();
    careers.forEach((c) => {
      if (c.cluster) set.add(c.cluster);
    });
    return Array.from(set).sort();
  }, [careers]);

  // Filtered careers
  const filteredCareers = useMemo(() => {
    return careers.filter((c) => {
      if (showSavedOnly && !savedCareerIds.has(c.id)) return false;
      if (selectedIndustry !== 'all' && c.industry !== selectedIndustry) return false;
      if (selectedCluster !== 'all' && c.cluster !== selectedCluster) return false;
      if (minSalaryFilter > 0 && c.salary_range_min < minSalaryFilter) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = c.title.toLowerCase().includes(query);
        const matchesDesc = c.short_description.toLowerCase().includes(query);
        const matchesInd = c.industry.toLowerCase().includes(query);
        const matchesCluster = c.cluster.toLowerCase().includes(query);
        const matchesSkills = c.key_skills.some((s) => s.toLowerCase().includes(query));
        const matchesTN = c.tamil_nadu_demand.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesInd && !matchesCluster && !matchesSkills && !matchesTN) {
          return false;
        }
      }
      return true;
    });
  }, [careers, searchQuery, selectedIndustry, selectedCluster, showSavedOnly, minSalaryFilter, savedCareerIds]);

  const formatLPA = (amount: number) => {
    return `₹${(amount / 100000).toFixed(1)} LPA`;
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedIndustry('all');
    setSelectedCluster('all');
    setShowSavedOnly(false);
    setMinSalaryFilter(0);
  };

  if (loading) {
    return (
      <div className="py-12">
        <LoadingState message="Connecting to Tamil Nadu career intelligence repository..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <ErrorState
          title="Could Not Load Career Explorer"
          message={error}
          onRetry={fetchCareersAndBookmarks}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-zinc-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-zinc-700/80 animate-slideUp text-sm">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{feedbackMessage}</span>
          <button onClick={() => setFeedbackMessage(null)} className="ml-2 text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Tamil Nadu Career Explorer"
        subtitle="Explore verified career pathways, state industrial corridors, salary benchmarks, and academic milestones tailored to Tamil Nadu students."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Career Explorer', path: '/careers' },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant={showSavedOnly ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setShowSavedOnly(!showSavedOnly)}
              className="flex items-center gap-2"
            >
              {showSavedOnly ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              Saved Careers ({savedCareerIds.size})
            </Button>
            <Button variant="outline" size="sm" onClick={fetchCareersAndBookmarks}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        }
      />

      {/* Search & Filter Command Center */}
      <Card className="p-5 border-zinc-200/80 shadow-sm bg-white">
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by career title, skill (e.g. Python, VLSI), industry, or Tamil Nadu corridor (e.g. Hosur, Chennai, Coimbatore)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm transition-all outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {/* Industry Filter */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">
                Industry Domain
              </label>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full text-xs font-medium py-2.5 px-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
              >
                <option value="all">All Industries ({industries.length})</option>
                {industries.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            {/* Cluster Filter */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">
                Career Cluster
              </label>
              <select
                value={selectedCluster}
                onChange={(e) => setSelectedCluster(e.target.value)}
                className="w-full text-xs font-medium py-2.5 px-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
              >
                <option value="all">All Career Clusters ({clusters.length})</option>
                {clusters.map((cl) => (
                  <option key={cl} value={cl}>
                    {cl}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Salary Filter */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">
                Minimum Starting Salary
              </label>
              <select
                value={minSalaryFilter}
                onChange={(e) => setMinSalaryFilter(Number(e.target.value))}
                className="w-full text-xs font-medium py-2.5 px-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
              >
                <option value={0}>Any Starting Salary</option>
                <option value={450000}>₹4.5+ LPA</option>
                <option value={500000}>₹5.0+ LPA</option>
                <option value={600000}>₹6.0+ LPA</option>
                <option value={700000}>₹7.0+ LPA</option>
                <option value={800000}>₹8.0+ LPA</option>
              </select>
            </div>

            {/* Reset Actions */}
            <div className="flex items-end">
              <Button
                variant="outline"
                size="md"
                onClick={resetFilters}
                className="w-full text-xs font-medium text-zinc-600 hover:text-zinc-900 justify-center"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Catalog Results Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Briefcase className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-zinc-900">
            {showSavedOnly ? 'Your Bookmarked Careers' : 'Career Intelligence Catalog'}
          </h2>
          <Badge variant="outline" className="ml-1 text-xs font-semibold">
            {filteredCareers.length} {filteredCareers.length === 1 ? 'Career' : 'Careers'}
          </Badge>
        </div>
        {(selectedIndustry !== 'all' || selectedCluster !== 'all' || searchQuery || minSalaryFilter > 0 || showSavedOnly) && (
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>Active filters:</span>
            {selectedIndustry !== 'all' && <Badge variant="secondary">{selectedIndustry}</Badge>}
            {showSavedOnly && <Badge variant="primary">Saved Only</Badge>}
            {minSalaryFilter > 0 && <Badge variant="outline">₹{minSalaryFilter / 100000}L+ Min</Badge>}
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredCareers.length === 0 && (
        <EmptyState
          title="No Matching Careers Found"
          description={
            showSavedOnly
              ? "You haven't bookmarked any careers yet. Browse the catalog and click the bookmark button to build your shortlist!"
              : 'Try broadening your search query or clearing active industry and salary filters.'
          }
          actionText="Reset All Filters"
          onAction={resetFilters}
        />
      )}

      {/* Career Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCareers.map((career) => {
          const isBookmarked = savedCareerIds.has(career.id);
          return (
            <Card
              key={career.id}
              className="flex flex-col justify-between border-zinc-200/80 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 group bg-white"
            >
              <div className="p-6 space-y-4">
                {/* Top Badge & Save Button */}
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="secondary" className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border-indigo-100">
                    {career.industry}
                  </Badge>
                  <button
                    onClick={(e) => handleToggleBookmark(career, e)}
                    title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Career'}
                    className={`p-2 rounded-xl transition-all ${
                      isBookmarked
                        ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                        : 'bg-zinc-100 text-zinc-400 hover:text-amber-500 hover:bg-zinc-200'
                    }`}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-600" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Title & Short Description */}
                <div>
                  <h3
                    onClick={() => handleOpenDetail(career.slug)}
                    className="text-base font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors cursor-pointer line-clamp-1"
                  >
                    {career.title}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                    {career.short_description}
                  </p>
                </div>

                {/* Key Metrics Strip */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 text-xs">
                  <div className="bg-zinc-50 rounded-lg p-2.5">
                    <span className="text-[10px] uppercase font-semibold text-zinc-400 block mb-0.5">
                      Salary Range
                    </span>
                    <span className="font-bold text-zinc-800">
                      {formatLPA(career.salary_range_min)} - {formatLPA(career.salary_range_max)}
                    </span>
                  </div>
                  <div className="bg-emerald-50/70 rounded-lg p-2.5">
                    <span className="text-[10px] uppercase font-semibold text-emerald-600 block mb-0.5">
                      Growth Rate
                    </span>
                    <span className="font-bold text-emerald-800 line-clamp-1">
                      {career.growth_rate}
                    </span>
                  </div>
                </div>

                {/* Tamil Nadu Demand Tag */}
                <div className="flex items-start gap-1.5 text-xs text-zinc-600 bg-amber-50/60 p-2.5 rounded-lg border border-amber-100/70">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span className="text-[11px] font-medium leading-tight text-amber-900 line-clamp-2">
                    {career.tamil_nadu_demand}
                  </span>
                </div>

                {/* Key Skills Pills */}
                <div>
                  <span className="text-[10px] uppercase font-semibold text-zinc-400 block mb-1.5">
                    Key Competencies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {career.key_skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200/60"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="p-4 bg-zinc-50/80 border-t border-zinc-100 rounded-b-2xl flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-medium">
                  {career.entry_education_level}
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenDetail(career.slug)}
                  className="flex items-center gap-1.5 text-xs font-semibold"
                >
                  Explore Pathway
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Comprehensive Career Detail Modal */}
      <Modal
        isOpen={Boolean(selectedCareerSlug)}
        onClose={handleCloseDetail}
        title={careerDetail?.title || 'Career Profile Details'}
        description={careerDetail?.cluster}
        maxWidth="2xl"
      >
        {detailLoading && (
          <div className="py-8">
            <LoadingState message="Fetching deep-dive career pathway and state curriculum..." />
          </div>
        )}

        {detailError && (
          <div className="py-6">
            <ErrorState
              title="Failed to Load Career Pathway"
              message={detailError}
              onRetry={() => selectedCareerSlug && handleOpenDetail(selectedCareerSlug)}
            />
          </div>
        )}

        {careerDetail && !detailLoading && (
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
            {/* Action Bar */}
            <div className="flex items-center justify-between p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/80">
              <div>
                <span className="text-xs font-bold text-zinc-800 block">
                  {careerDetail.industry}
                </span>
                <span className="text-xs text-zinc-500">
                  Entry: {careerDetail.entry_education_level}
                </span>
              </div>
              <Button
                variant={savedCareerIds.has(careerDetail.id) ? 'outline' : 'primary'}
                size="sm"
                onClick={() => handleToggleBookmark(careerDetail)}
                className="flex items-center gap-2 text-xs"
              >
                {savedCareerIds.has(careerDetail.id) ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 text-amber-500" />
                    Bookmarked
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    Bookmark Career
                  </>
                )}
              </Button>
            </div>

            {/* Overview */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-indigo-600" />
                Career Overview
              </h4>
              <p className="text-sm text-zinc-700 leading-relaxed bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
                {careerDetail.overview}
              </p>
            </div>

            {/* Typical Pathway Milestone Flow */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Standard Education & Career Progression
              </h4>
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 text-xs font-medium text-indigo-950 flex items-start gap-2 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>{careerDetail.typical_pathway}</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/80">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase block mb-1">
                  Salary Benchmark
                </span>
                <span className="text-sm font-bold text-zinc-900 block">
                  {formatLPA(careerDetail.salary_range_min)} - {formatLPA(careerDetail.salary_range_max)}
                </span>
                <span className="text-[10px] text-zinc-500 mt-1 block">Annual Gross Compensation</span>
              </div>
              <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/80">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase block mb-1">
                  Growth Outlook
                </span>
                <span className="text-sm font-bold text-emerald-700 block">
                  {careerDetail.growth_rate}
                </span>
                <span className="text-[10px] text-zinc-500 mt-1 block">Annual Market Expansion</span>
              </div>
              <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/80">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase block mb-1">
                  Work Environment
                </span>
                <span className="text-xs font-bold text-zinc-800 block line-clamp-1">
                  {careerDetail.work_environment}
                </span>
                <span className="text-[10px] text-zinc-500 mt-1 block">Operational Setup</span>
              </div>
            </div>

            {/* Tamil Nadu State Demand Corridor */}
            <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <MapPin className="w-4 h-4 text-amber-600" />
                Tamil Nadu Industrial Hubs & Recruitment Corridor
              </div>
              <p className="text-amber-800 leading-relaxed pt-1">
                {careerDetail.tamil_nadu_demand}
              </p>
            </div>

            {/* Degree Pathways & Entrance Exams */}
            {careerDetail.courses && careerDetail.courses.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  Eligible Academic Degrees & Tamil Nadu Entrance Exams
                </h4>
                <div className="space-y-3">
                  {careerDetail.courses.map((course) => (
                    <div
                      key={course.id}
                      className="p-4 rounded-xl border border-zinc-200/90 bg-white hover:border-indigo-200 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-zinc-900 block">
                            {course.name} ({course.short_code})
                          </span>
                          <span className="text-[11px] text-zinc-500">
                            {course.degree_level} • {course.duration_years} Years • {course.stream}
                          </span>
                        </div>
                        {course.is_primary && (
                          <Badge variant="primary" className="text-[10px] font-semibold">
                            Primary Degree
                          </Badge>
                        )}
                      </div>

                      {/* Entrance Exams */}
                      {course.exams && course.exams.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-zinc-100 flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-semibold text-zinc-600">
                            Entrance Exams:
                          </span>
                          {course.exams.map((exam) => (
                            <Badge
                              key={exam.id}
                              variant="outline"
                              className="text-[10px] font-bold text-indigo-700 bg-indigo-50/50 border-indigo-200"
                            >
                              {exam.short_code} ({exam.conducting_body})
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Skills & Competencies */}
            {careerDetail.skills && careerDetail.skills.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Key Skills & Core Competencies
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {careerDetail.skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="text-xs font-bold text-zinc-800">{skill.name}</span>
                        {skill.is_core && (
                          <Badge variant="accent" className="text-[9px] uppercase px-1.5 py-0.2">
                            Core
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-zinc-400">
                          <span>Importance</span>
                          <span>{Math.round(skill.importance_weight * 100)}%</span>
                        </div>
                        <ProgressBar value={Math.round(skill.importance_weight * 100)} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Higher Studies & Alternative Careers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Higher Studies */}
              {careerDetail.higher_studies_options && careerDetail.higher_studies_options.length > 0 && (
                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-2">
                  <h5 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                    Higher Studies & Masters
                  </h5>
                  <ul className="space-y-1.5 text-xs text-zinc-600">
                    {careerDetail.higher_studies_options.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Alternative Careers */}
              {careerDetail.alternative_careers && careerDetail.alternative_careers.length > 0 && (
                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-2">
                  <h5 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                    Adjacent Career Paths
                  </h5>
                  <ul className="space-y-1.5 text-xs text-zinc-600">
                    {careerDetail.alternative_careers.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Bottom Close Button */}
            <div className="pt-4 border-t border-zinc-200 flex justify-end">
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
