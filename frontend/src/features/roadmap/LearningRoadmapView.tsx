import React, { useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Award,
  Briefcase,
  Sparkles,
  Printer
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { roadmapApi } from '../../services/api';
import type { LearningRoadmap } from '../../types/more_features';

export const LearningRoadmapView: React.FC = () => {
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await roadmapApi.getRoadmap();
      setRoadmap(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to generate roadmap');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      <PageHeader
        title="Personalized Learning Roadmap"
        subtitle="12-month structured milestone track connecting your current skill level to production readiness, featuring NPTEL, Naan Mudhalvan portal coursework, capstones, and Tamil Nadu internships."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Roadmap', path: '/roadmap' },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => window.print()} className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Print Plan
          </Button>
        }
      />

      {loading && (
        <div className="py-12">
          <LoadingState message="Generating structured 12-month skill acquisition track..." />
        </div>
      )}

      {error && (
        <div className="py-8">
          <ErrorState title="Could Not Generate Roadmap" message={error} onRetry={fetchRoadmap} />
        </div>
      )}

      {roadmap && !loading && (
        <div className="space-y-8">
          {/* Hero Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-900 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-semibold text-purple-200">Career Learning Track</span>
              <h2 className="text-2xl font-extrabold text-white mt-0.5">{roadmap.target_career}</h2>
              <span className="text-xs text-purple-100/90 mt-1 block">
                {roadmap.total_duration} • Recommended Effort: {roadmap.estimated_weekly_commitment}
              </span>
            </div>

            <Badge variant="primary" className="bg-white/20 text-white text-xs border-white/30 px-3 py-1">
              4 Active Phases
            </Badge>
          </div>

          {/* Stepper Timeline */}
          <div className="relative pl-6 sm:pl-8 border-l-2 border-indigo-200 space-y-8">
            {roadmap.phases.map((phase) => (
              <div key={phase.phase_number} className="relative group">
                <div className="absolute -left-[35px] sm:-left-[43px] top-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md border-2 border-white">
                  {phase.phase_number}
                </div>

                <Card className="p-6 border-zinc-200/90 shadow-sm bg-white hover:border-indigo-300 transition-all space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                      Phase {phase.phase_number}: {phase.timeline}
                    </span>
                    <span className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Quarterly Milestone
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-zinc-900">{phase.title}</h3>
                    <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{phase.focus_objective}</p>
                  </div>

                  {/* Milestones Checklist */}
                  <div className="space-y-1.5 pt-2 border-t border-zinc-100 text-xs">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      Required Milestones
                    </span>
                    {phase.milestones.map((m, i) => (
                      <div key={i} className="flex items-start gap-2 text-zinc-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>

                  {/* Curated Resources */}
                  <div className="space-y-2 pt-2 border-t border-zinc-100 text-xs">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Curated Tamil Nadu & Global Learning Resources
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {phase.curated_resources.map((res, i) => (
                        <a
                          key={i}
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 hover:border-indigo-300 transition-all flex items-start justify-between gap-2 group/res"
                        >
                          <div>
                            <span className="font-bold text-zinc-900 group-hover/res:text-indigo-600 block line-clamp-1">
                              {res.title}
                            </span>
                            <span className="text-[11px] text-zinc-500 block">{res.provider}</span>
                          </div>
                          <Badge variant={res.is_free ? 'success' : 'secondary'} className="text-[9px] uppercase">
                            {res.is_free ? 'Free' : 'Certificate'}
                          </Badge>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Hands-on Deliverable */}
                  <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-950 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Deliverable / Portfolio Output:</span>
                      <span className="mt-0.5 block text-indigo-900 leading-relaxed font-medium">
                        {phase.hands_on_deliverable}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          {/* Certifications & Internship Hubs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <Card className="p-5 border-zinc-200/80 shadow-sm bg-white space-y-3">
              <h4 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600" />
                Recommended Industry Credentials
              </h4>
              <ul className="space-y-2">
                {roadmap.recommended_certifications.map((cert, i) => (
                  <li key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-50 border border-zinc-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-semibold text-zinc-800">{cert}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5 border-zinc-200/80 shadow-sm bg-white space-y-3">
              <h4 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                Tamil Nadu Tech Internship Exchanges
              </h4>
              <ul className="space-y-2">
                {roadmap.tamil_nadu_internship_portals.map((portal, i) => (
                  <li key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-50 border border-zinc-100">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                    <span className="font-semibold text-zinc-800">{portal}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
