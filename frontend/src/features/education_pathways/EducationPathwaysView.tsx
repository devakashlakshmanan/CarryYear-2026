import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Compass,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Printer,
  ChevronDown
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { educationPathwaysApi, profileApi, recommendationApi } from '../../services/api';
import type { EducationPathway, PathwayListItem } from '../../types/pathway';

export const EducationPathwaysView: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [pathwayList, setPathwayList] = useState<PathwayListItem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [pathway, setPathway] = useState<EducationPathway | null>(null);
  const [loading, setLoading] = useState(true);
  const [pathwayLoading, setPathwayLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load catalog of careers
  useEffect(() => {
    const fetchList = async () => {
      try {
        setLoading(true);
        setError(null);
        const [list, profile, recs] = await Promise.all([
          educationPathwaysApi.getPathwaysList(),
          profileApi.getProfile().catch(() => null),
          recommendationApi.getRecommendations().catch(() => null)
        ]);
        setPathwayList(list);

        // Determine initial career: check URL param > student target_career > top recommendation > first catalog item
        const paramCareer = searchParams.get('career');
        let defaultSlug = '';
        if (paramCareer && list.some((c) => c.slug === paramCareer)) {
          defaultSlug = paramCareer;
        } else if (profile?.target_career) {
          const match = list.find((c) => c.title.toLowerCase().includes(profile.target_career!.toLowerCase()));
          if (match) defaultSlug = match.slug;
        }
        if (!defaultSlug && recs?.recommendations && recs.recommendations.length > 0) {
          defaultSlug = recs.recommendations[0].slug;
        }
        if (!defaultSlug) {
          defaultSlug = list[0]?.slug || 'data-scientist';
        }

        setSelectedSlug(defaultSlug);
      } catch (err: any) {
        setError(err?.response?.data?.detail || err?.message || 'Failed to load education pathways catalog');
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, []);

  // Fetch pathway details when selectedSlug changes
  useEffect(() => {
    if (!selectedSlug) return;

    const fetchPathwayDetail = async () => {
      try {
        setPathwayLoading(true);
        setError(null);
        const data = await educationPathwaysApi.getPathway(selectedSlug);
        setPathway(data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || err?.message || `Failed to load pathway for ${selectedSlug}`);
      } finally {
        setPathwayLoading(false);
      }
    };

    fetchPathwayDetail();
  }, [selectedSlug]);

  const handleSelectCareer = (slug: string) => {
    setSelectedSlug(slug);
    setSearchParams({ career: slug });
  };

  const handlePrint = () => {
    window.print();
  };

  const formatLPA = (amount: number) => {
    return `₹${(amount / 100000).toFixed(1)} LPA`;
  };

  if (loading) {
    return (
      <div className="py-12">
        <LoadingState message="Mapping Tamil Nadu higher education pathways..." />
      </div>
    );
  }

  if (error && !pathway) {
    return (
      <div className="py-12">
        <ErrorState
          title="Could Not Load Education Pathways"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <PageHeader
        title="Education Pathways & Milestones"
        subtitle="End-to-end academic roadmap: higher secondary foundation, Tamil Nadu entrance exams (TNEA, NEET, JEE), undergraduate degrees, core skills, and placement milestones."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Career Explorer', path: '/careers' },
          { label: 'Education Pathways', path: '/education-paths' },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Roadmap
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/recommendations')}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              View Fit Score
            </Button>
          </div>
        }
      />

      {/* Career Pathway Selector Toolbar */}
      <Card className="p-4 border-zinc-200/80 shadow-sm bg-white">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <span className="text-xs font-bold text-zinc-900 block">Select Career Pathway</span>
              <span className="text-[11px] text-zinc-500">
                Explore the structured curriculum, entrance examinations, and degree milestones
              </span>
            </div>
          </div>

          <div className="relative min-w-[260px] sm:min-w-[320px]">
            <select
              value={selectedSlug}
              onChange={(e) => handleSelectCareer(e.target.value)}
              className="w-full text-xs font-semibold py-2.5 pl-3.5 pr-8 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none appearance-none cursor-pointer"
            >
              {pathwayList.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title} ({c.industry})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </Card>

      {pathwayLoading && (
        <div className="py-12">
          <LoadingState message={`Synthesizing pathway for ${selectedSlug.replace('-', ' ')}...`} />
        </div>
      )}

      {pathway && !pathwayLoading && (
        <div className="space-y-8">
          {/* Career Identity Hero Banner */}
          <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary" className="bg-white/20 text-white border-white/30 text-xs">
                  {pathway.industry}
                </Badge>
                <Badge variant="secondary" className="bg-indigo-700/60 text-indigo-100 border-indigo-500/50 text-xs">
                  {pathway.cluster}
                </Badge>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {pathway.career_title}
                </h2>
                <p className="text-sm text-indigo-100/90 max-w-3xl mt-1.5 leading-relaxed font-medium">
                  {pathway.typical_pathway_summary}
                </p>
              </div>

              {/* Quick Info Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                  <span className="text-[10px] uppercase font-semibold text-indigo-200 block">
                    Starting Compensation
                  </span>
                  <span className="text-base font-bold text-white block mt-0.5">
                    {formatLPA(pathway.salary_range_min)} - {formatLPA(pathway.salary_range_max)}
                  </span>
                  <span className="text-[10px] text-indigo-200/80">Annual Gross CTC</span>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                  <span className="text-[10px] uppercase font-semibold text-indigo-200 block">
                    Minimum Entry Level
                  </span>
                  <span className="text-base font-bold text-white block mt-0.5">
                    {pathway.entry_education_level}
                  </span>
                  <span className="text-[10px] text-indigo-200/80">Accredited Program</span>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                  <span className="text-[10px] uppercase font-semibold text-indigo-200 block">
                    Industry Expansion
                  </span>
                  <span className="text-base font-bold text-emerald-300 block mt-0.5">
                    {pathway.growth_rate}
                  </span>
                  <span className="text-[10px] text-indigo-200/80">State Projected Demand</span>
                </div>
              </div>

              {/* Regional Corridor */}
              <div className="flex items-center gap-2 text-xs bg-amber-500/20 text-amber-200 p-3 rounded-xl border border-amber-400/30">
                <MapPin className="w-4 h-4 text-amber-300 shrink-0" />
                <span className="font-semibold">Tamil Nadu Corridor: {pathway.tamil_nadu_demand}</span>
              </div>
            </div>
          </div>

          {/* Structured Multi-Stage Pathway Stepper Graph */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                5-Stage Career Pathway Blueprint
              </h3>
              <span className="text-xs text-zinc-500 font-medium">
                Structured for Tamil Nadu Board & University Systems
              </span>
            </div>

            {/* Stepper Nodes */}
            <div className="relative pl-6 sm:pl-8 border-l-2 border-indigo-200 space-y-10">
              {/* STAGE 1: School Preparation */}
              <div className="relative group">
                {/* Node Circle */}
                <div className="absolute -left-[35px] sm:-left-[43px] top-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-indigo-500/30 border-2 border-white">
                  1
                </div>

                <Card className="p-6 border-zinc-200/90 shadow-sm bg-white hover:border-indigo-300 transition-all">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                        {pathway.school_preparation.stage_name}
                      </span>
                      <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {pathway.school_preparation.duration_estimate}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-zinc-900">
                      {pathway.school_preparation.title}
                    </h4>

                    <p className="text-xs text-zinc-600 leading-relaxed">
                      {pathway.school_preparation.description}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-100">
                      {pathway.school_preparation.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-700 border border-zinc-200/60"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              {/* STAGE 2: Undergraduate Degree & Tamil Nadu Entrance Exams */}
              <div className="relative group">
                <div className="absolute -left-[35px] sm:-left-[43px] top-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-indigo-500/30 border-2 border-white">
                  2
                </div>

                <Card className="p-6 border-zinc-200/90 shadow-sm bg-white hover:border-indigo-300 transition-all space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                      {pathway.undergraduate_milestone.stage_name}
                    </span>
                    <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {pathway.undergraduate_milestone.duration_estimate}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-zinc-900">
                      {pathway.undergraduate_milestone.title}
                    </h4>
                    <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                      {pathway.undergraduate_milestone.description}
                    </p>
                  </div>

                  {/* Degree Cards Sub-Grid */}
                  <div className="space-y-3 pt-2">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Eligible Degree Programs & Entrance Routes
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {pathway.degrees.map((deg) => (
                        <div
                          key={deg.id}
                          className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/60 flex flex-col justify-between space-y-2.5"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <span className="text-xs font-bold text-zinc-900">
                                {deg.name} ({deg.short_code})
                              </span>
                              {deg.is_primary && (
                                <Badge variant="primary" className="text-[9px] uppercase px-1.5">
                                  Primary
                                </Badge>
                              )}
                            </div>
                            <span className="text-[11px] text-zinc-500 block mt-0.5">
                              {deg.duration_years} Years • {deg.stream}
                            </span>
                          </div>

                          <div className="text-[11px] text-zinc-600 pt-1 border-t border-zinc-200/60">
                            <span className="font-semibold text-zinc-800">TN Annual Fee: </span>
                            ₹{(deg.annual_fee_min / 1000).toFixed(0)}k - ₹{(deg.annual_fee_max / 100000).toFixed(1)}L
                          </div>

                          {deg.exams && deg.exams.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {deg.exams.map((exam) => (
                                <Badge
                                  key={exam.id}
                                  variant="outline"
                                  className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border-indigo-200"
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
                </Card>
              </div>

              {/* STAGE 3: Skills & Competency Roadmap */}
              <div className="relative group">
                <div className="absolute -left-[35px] sm:-left-[43px] top-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-indigo-500/30 border-2 border-white">
                  3
                </div>

                <Card className="p-6 border-zinc-200/90 shadow-sm bg-white hover:border-indigo-300 transition-all space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                      {pathway.skill_milestone.stage_name}
                    </span>
                    <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {pathway.skill_milestone.duration_estimate}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-zinc-900">
                      {pathway.skill_milestone.title}
                    </h4>
                    <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                      {pathway.skill_milestone.description}
                    </p>
                  </div>

                  {/* Skills Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                    {pathway.skills.map((skill) => (
                      <div
                        key={skill.id}
                        className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="text-xs font-bold text-zinc-800">{skill.name}</span>
                          {skill.is_core ? (
                            <Badge variant="accent" className="text-[9px] uppercase px-1.5">
                              Core
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[9px] uppercase px-1.5">
                              Specialized
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
                </Card>
              </div>

              {/* STAGE 4: Career Launch & Placement */}
              <div className="relative group">
                <div className="absolute -left-[35px] sm:-left-[43px] top-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-emerald-500/30 border-2 border-white">
                  4
                </div>

                <Card className="p-6 border-zinc-200/90 shadow-sm bg-white hover:border-emerald-300 transition-all space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                      {pathway.career_launch_milestone.stage_name}
                    </span>
                    <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {pathway.career_launch_milestone.duration_estimate}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-zinc-900">
                      {pathway.career_launch_milestone.title}
                    </h4>
                    <span className="text-xs font-semibold text-emerald-700 block mt-0.5">
                      {pathway.career_launch_milestone.subtitle}
                    </span>
                    <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                      {pathway.career_launch_milestone.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-100">
                    {pathway.career_launch_milestone.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Card>
              </div>

              {/* STAGE 5: Higher Studies & Long-Term Growth */}
              <div className="relative group">
                <div className="absolute -left-[35px] sm:-left-[43px] top-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-purple-500/30 border-2 border-white">
                  5
                </div>

                <Card className="p-6 border-zinc-200/90 shadow-sm bg-white hover:border-purple-300 transition-all space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md">
                      {pathway.higher_studies_milestone.stage_name}
                    </span>
                    <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {pathway.higher_studies_milestone.duration_estimate}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-zinc-900">
                      {pathway.higher_studies_milestone.title}
                    </h4>
                    <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                      {pathway.higher_studies_milestone.description}
                    </p>
                  </div>

                  {/* Higher Studies & Alternative Careers Split */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 space-y-1.5">
                      <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider block">
                        Higher Studies & Postgraduate Options
                      </span>
                      <ul className="space-y-1 text-xs text-purple-950 font-medium">
                        {pathway.higher_studies_options.map((opt, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span>{opt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1.5">
                      <span className="text-[11px] font-bold text-zinc-800 uppercase tracking-wider block">
                        Adjacent Lateral Career Transitions
                      </span>
                      <ul className="space-y-1 text-xs text-zinc-700 font-medium">
                        {pathway.alternative_careers.map((alt, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <ArrowRight className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span>{alt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
