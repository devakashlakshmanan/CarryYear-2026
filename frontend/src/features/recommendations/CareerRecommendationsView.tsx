import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recommendationApi } from '../../services/api';
import type { RecommendationResponse } from '../../types/recommendation';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  IndianRupee,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Compass,
  Briefcase
} from 'lucide-react';

export function CareerRecommendationsView() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RecommendationResponse | null>(null);

  // Filters
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await recommendationApi.getRecommendations();
      setData(res);
      // Expand top 2 recommendations by default
      if (res.recommendations && res.recommendations.length > 0) {
        const initialExpanded: Record<number, boolean> = {};
        res.recommendations.slice(0, 2).forEach((r) => {
          initialExpanded[r.career_id] = true;
        });
        setExpandedCards(initialExpanded);
      }
    } catch (err: any) {
      console.error('Failed to load career recommendations:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to load career recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (careerId: number) => {
    setExpandedCards((prev) => ({
      ...prev,
      [careerId]: !prev[careerId],
    }));
  };

  if (loading) {
    return <LoadingState message="Executing deterministic multi-factor recommendation engine..." />;
  }

  if (error && !data) {
    return (
      <ErrorState
        title="Recommendations Unavailable"
        message={error}
        onRetry={loadRecommendations}
      />
    );
  }

  const recommendations = data?.recommendations || [];

  // Collect distinct industries for filtering
  const industries = ['All', ...Array.from(new Set(recommendations.map((r) => r.industry)))];

  // Filter recommendations
  const filteredRecs = recommendations.filter((r) => {
    if (selectedIndustry !== 'All' && r.industry !== selectedIndustry) return false;
    if (selectedTier !== 'All' && r.match_tier !== selectedTier) return false;
    return true;
  });

  const topMatch = recommendations.length > 0 ? recommendations[0] : null;

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-16">
      <PageHeader
        badge={<Badge variant="primary">Deterministic Decision Intelligence</Badge>}
        title="Personalized Career Recommendations"
        subtitle="Transparent multi-factor match scores computed from your Class 12 academic performance, cognitive reasoning assessment, expressed interests, declared skills, and regional Tamil Nadu feasibility."
        actions={
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/career-dna')}
              leftIcon={<Compass className="w-4 h-4" />}
            >
              View Career DNA
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/education-paths')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Explore Education Pathways
            </Button>
          </div>
        }
      />

      {/* Summary Highlight Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-950 via-indigo-900 to-purple-900 p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-violet-200">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Multi-Factor Synthesis Complete</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Dominant Cluster: <span className="text-violet-300">{data?.dominant_cluster}</span>
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Analyzed {data?.total_evaluated} career pathways across Tamil Nadu against your cognitive traits, financial feasibility, and target career goals.
            </p>
          </div>

          {topMatch && (
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md min-w-[210px] text-center">
              <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Top Recommendation</span>
              <span className="text-xl font-bold text-white mt-1">{topMatch.career_title}</span>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-3xl font-black text-emerald-400">{topMatch.match_score}%</span>
                <span className="text-xs text-emerald-300 font-semibold uppercase tracking-wider">Match</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Switcher Controls */}
      <Card className="p-4 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Industry Filter Pills */}
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mr-1">Industry:</span>
            {industries.map((ind) => (
              <button
                key={ind}
                onClick={() => setSelectedIndustry(ind)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  selectedIndustry === ind
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {ind}
              </button>
            ))}
          </div>

          {/* Tier Filter Pills */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mr-1">Tier:</span>
            {['All', 'High Match', 'Moderate Match'].map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  selectedTier === tier
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Recommendations Cards List */}
      <div className="space-y-6">
        {filteredRecs.map((rec, index) => {
          const isExpanded = !!expandedCards[rec.career_id];
          const isHighMatch = rec.match_score >= 80.0;

          return (
            <Card
              key={rec.career_id}
              className={`p-6 transition-all duration-200 border-2 ${
                isHighMatch
                  ? 'border-violet-200/90 shadow-soft hover:shadow-premium'
                  : 'border-zinc-200/80 shadow-xs hover:border-zinc-300'
              }`}
            >
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-zinc-100">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-zinc-900 text-white text-xs font-bold">
                      #{index + 1}
                    </span>
                    <Badge variant={isHighMatch ? 'primary' : 'secondary'} size="sm">
                      {rec.match_tier}
                    </Badge>
                    <Badge variant="outline" size="sm">
                      {rec.industry}
                    </Badge>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">
                    {rec.career_title}
                  </h3>

                  <p className="text-xs text-zinc-500 max-w-2xl leading-relaxed">
                    Cluster: <strong className="text-zinc-700">{rec.cluster}</strong>
                  </p>
                </div>

                {/* Match Score Badge */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0">
                  <div className="flex items-baseline space-x-1">
                    <span
                      className={`text-3xl sm:text-4xl font-black ${
                        isHighMatch ? 'text-violet-600' : 'text-zinc-700'
                      }`}
                    >
                      {rec.match_score}%
                    </span>
                    <span className="text-xs font-bold text-zinc-400">Match</span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-0.5">Deterministic 6-Factor Model</span>
                </div>
              </div>

              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-b border-zinc-100 text-xs">
                <div className="flex items-center space-x-2 text-zinc-600">
                  <IndianRupee className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Est. Salary: <strong>₹{(rec.salary_range_min / 100000).toFixed(1)}L – ₹{(rec.salary_range_max / 100000).toFixed(1)}L / yr</strong>
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-zinc-600">
                  <TrendingUp className="w-4 h-4 text-violet-600 shrink-0" />
                  <span>
                    Expansion: <strong>{rec.growth_rate}</strong>
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-zinc-600">
                  <MapPin className="w-4 h-4 text-pink-600 shrink-0" />
                  <span className="truncate" title={rec.tamil_nadu_demand}>
                    TN Demand: <strong>{rec.tamil_nadu_demand}</strong>
                  </span>
                </div>
              </div>

              {/* Explainable "Why this career matches" summary */}
              <div className="mt-4 p-4 rounded-xl bg-violet-50/70 border border-violet-100 flex items-start space-x-3.5">
                <Lightbulb className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs text-violet-950 leading-relaxed">
                  <span className="font-bold text-violet-900">Why this matches your profile:</span>
                  <p>{rec.explanation}</p>
                </div>
              </div>

              {/* Expandable Factor Breakdown & Skill Gaps */}
              {isExpanded && (
                <div className="mt-6 pt-6 border-t border-zinc-100 space-y-6 animate-fadeIn">
                  {/* Factor Breakdown Grid */}
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-4">
                      Deterministic 6-Factor Breakdown
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-600 font-semibold">Academic Fit (20%)</span>
                          <span className="font-extrabold text-zinc-900">{rec.factors.academic_fit}%</span>
                        </div>
                        <ProgressBar value={rec.factors.academic_fit} size="sm" showPercentage={false} />
                      </div>

                      <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-600 font-semibold">Aptitude Fit (25%)</span>
                          <span className="font-extrabold text-zinc-900">{rec.factors.aptitude_fit}%</span>
                        </div>
                        <ProgressBar value={rec.factors.aptitude_fit} size="sm" showPercentage={false} />
                      </div>

                      <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-600 font-semibold">Interest Alignment (20%)</span>
                          <span className="font-extrabold text-zinc-900">{rec.factors.interest_alignment}%</span>
                        </div>
                        <ProgressBar value={rec.factors.interest_alignment} size="sm" showPercentage={false} />
                      </div>

                      <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-600 font-semibold">Skill Match (15%)</span>
                          <span className="font-extrabold text-zinc-900">{rec.factors.skill_match}%</span>
                        </div>
                        <ProgressBar value={rec.factors.skill_match} size="sm" showPercentage={false} />
                      </div>

                      <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-600 font-semibold">Financial Feasibility (10%)</span>
                          <span className="font-extrabold text-zinc-900">{rec.factors.financial_feasibility}%</span>
                        </div>
                        <ProgressBar value={rec.factors.financial_feasibility} size="sm" showPercentage={false} />
                      </div>

                      <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-600 font-semibold">Location Fit (10%)</span>
                          <span className="font-extrabold text-zinc-900">{rec.factors.location_fit}%</span>
                        </div>
                        <ProgressBar value={rec.factors.location_fit} size="sm" showPercentage={false} />
                      </div>
                    </div>
                  </div>

                  {/* Skills Match vs Skill Gaps */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Matching Skills */}
                    <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-2.5">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                          Skills You Already Have ({rec.matching_skills.length})
                        </span>
                      </div>
                      {rec.matching_skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {rec.matching_skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-semibold"
                            >
                              ✓ {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-400 italic">No direct matches declared yet.</p>
                      )}
                    </div>

                    {/* Skill Gaps */}
                    <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100 space-y-2.5">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                          Identified Skill Gaps to Acquire ({rec.skill_gaps.length})
                        </span>
                      </div>
                      {rec.skill_gaps.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {rec.skill_gaps.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-semibold"
                            >
                              + {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-emerald-600 font-semibold">
                          Zero skill gaps! Full baseline coverage.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Typical Pathway preview */}
                  <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center space-x-3 text-xs text-zinc-600">
                    <GraduationCap className="w-4 h-4 text-violet-600 shrink-0" />
                    <span>
                      Pathway: <strong className="text-zinc-800">{rec.typical_pathway}</strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Card Footer Actions */}
              <div className="mt-4 pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => toggleExpand(rec.career_id)}
                  className="text-xs font-semibold text-violet-600 hover:text-violet-800 flex items-center space-x-1 transition-colors"
                >
                  <span>{isExpanded ? 'Hide Factor Breakdown' : 'View Factor Breakdown & Skill Gaps'}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/simulator')}
                  >
                    Simulate What-If
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/education-paths')}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Explore Pathway
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}

        {filteredRecs.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-zinc-200/80 shadow-soft space-y-4">
            <Briefcase className="w-10 h-10 text-zinc-300 mx-auto" />
            <h3 className="text-base font-bold text-zinc-700">No careers match the selected filters</h3>
            <p className="text-xs text-zinc-400">Try switching your industry filter or lowering the minimum match tier.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setSelectedIndustry('All'); setSelectedTier('All'); }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
