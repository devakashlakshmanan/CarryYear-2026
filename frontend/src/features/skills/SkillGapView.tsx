import React, { useEffect, useState } from 'react';
import {
  Target,
  ArrowRight
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { skillsApi } from '../../services/api';
import type { SkillGapAnalysis } from '../../types/more_features';

export const SkillGapView: React.FC = () => {
  const [data, setData] = useState<SkillGapAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await skillsApi.getGapAnalysis();
      setData(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to analyze skill gaps');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      <PageHeader
        title="Skill-Gap Analyzer & Competency Matrix"
        subtitle="Compare your current verified skills against industry benchmarks for your target career in Tamil Nadu tech hubs, identifying critical blockers and hours needed to reach mastery."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Skill Gap', path: '/skills' },
        ]}
      />

      {loading && (
        <div className="py-12">
          <LoadingState message="Evaluating skill proficiencies against target career competency matrices..." />
        </div>
      )}

      {error && (
        <div className="py-8">
          <ErrorState title="Skill Gap Evaluation Failed" message={error} onRetry={fetchAnalysis} />
        </div>
      )}

      {data && !loading && (
        <div className="space-y-6">
          {/* Readiness Summary Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900 to-violet-900 text-white shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs uppercase font-semibold text-indigo-200">
                  Target Career Analysis
                </span>
                <h2 className="text-2xl font-extrabold text-white mt-0.5">
                  {data.target_career_title}
                </h2>
                <span className="text-xs text-indigo-200/90">{data.target_career_industry}</span>
              </div>

              <div className="text-right">
                <span className="text-3xl font-extrabold text-emerald-300">
                  {data.overall_skill_readiness_percent}%
                </span>
                <span className="text-xs text-indigo-200 block">Overall Skill Readiness</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                <span className="text-[10px] uppercase font-semibold text-indigo-200 block">
                  Core Skills Acquired
                </span>
                <span className="text-lg font-bold text-white block mt-0.5">
                  {data.core_skills_acquired} / {data.total_core_skills} Skills
                </span>
                <span className="text-[10px] text-indigo-200/80">Essential Job Blockers</span>
              </div>

              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                <span className="text-[10px] uppercase font-semibold text-indigo-200 block">
                  Time-to-Bridge Gap
                </span>
                <span className="text-lg font-bold text-amber-300 block mt-0.5">
                  ~{data.estimated_study_hours_to_bridge} Hours
                </span>
                <span className="text-[10px] text-indigo-200/80">Structured Practice Needed</span>
              </div>

              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                <span className="text-[10px] uppercase font-semibold text-indigo-200 block">
                  Priority Focus
                </span>
                <span className="text-xs font-bold text-white block mt-1 line-clamp-1">
                  {data.top_priority_skills_to_learn.join(', ')}
                </span>
                <span className="text-[10px] text-indigo-200/80">Highest Market Impact</span>
              </div>
            </div>
          </div>

          {/* Competency Gap Breakdown List */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              Detailed Competency Breakdown
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.gap_items.map((item, i) => {
                const isAcquired = item.status === 'Acquired';
                const isCritical = item.status === 'Critical Gap';

                return (
                  <Card
                    key={i}
                    className="p-5 border-zinc-200/80 shadow-sm bg-white flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-zinc-900 text-sm">{item.skill_name}</span>
                          <span className="text-[11px] text-zinc-400 block">{item.category}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {item.is_core ? (
                            <Badge variant="accent" className="text-[9px] uppercase">
                              Core
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[9px] uppercase">
                              Secondary
                            </Badge>
                          )}
                          <Badge
                            variant={isAcquired ? 'success' : isCritical ? 'error' : 'warning'}
                            className="text-[10px]"
                          >
                            {item.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Proficiency Comparison Meters */}
                      <div className="pt-3 space-y-1 text-xs">
                        <div className="flex justify-between text-zinc-500">
                          <span>Current Mastery: {item.current_proficiency_percent}%</span>
                          <span>Required: {item.required_proficiency_percent}%</span>
                        </div>
                        <ProgressBar value={item.current_proficiency_percent} size="sm" />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-zinc-50 text-xs text-zinc-600 border border-zinc-100 flex items-start gap-2">
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span className="font-medium leading-relaxed">{item.recommended_action}</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
