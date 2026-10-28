import React, { useEffect, useState } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ExternalLink,
  Filter,
  RefreshCw
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { scholarshipApi } from '../../services/api';
import type { ScholarshipMatchingResponse } from '../../types/more_features';

export const ScholarshipMatchingView: React.FC = () => {
  const [data, setData] = useState<ScholarshipMatchingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [community, setCommunity] = useState<string>('BC');
  const [isFirstGraduate, setIsFirstGraduate] = useState<boolean>(true);
  const [isGovtSchool, setIsGovtSchool] = useState<boolean>(false);
  const [tab, setTab] = useState<'eligible' | 'all'>('eligible');

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await scholarshipApi.getMatches({
        community,
        first_graduate: isFirstGraduate,
        govt_school: isGovtSchool,
      });
      setData(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to match scholarships');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [community, isFirstGraduate, isGovtSchool]);

  const handleToggleSave = async (id: number) => {
    try {
      const saved = await scholarshipApi.toggleSave(id);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          matches: prev.matches.map((m) =>
            m.scholarship.id === id ? { ...m, is_saved: saved } : m
          ),
        };
      });
    } catch {
      // Ignore
    }
  };

  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const displayedMatches =
    tab === 'eligible'
      ? (data?.matches || []).filter((m) => m.is_eligible)
      : data?.matches || [];

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      <PageHeader
        title="Tamil Nadu Scholarship & Aid Matching"
        subtitle="Discover state and national tuition fee waivers, First Graduate concessions, 7.5% government school quotas, and post-matric financial grants."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Scholarships', path: '/scholarships' },
        ]}
      />

      {/* Simulator Control Center */}
      <Card className="p-5 border-zinc-200/80 shadow-sm bg-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-zinc-100 gap-2 mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            Eligibility Rule Simulator
          </span>
          <Button variant="outline" size="sm" onClick={fetchMatches} className="text-xs h-8">
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Recalculate Aid
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-semibold text-zinc-600 block mb-1">Reservation Category</label>
            <select
              value={community}
              onChange={(e) => setCommunity(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-medium outline-none"
            >
              <option value="OC">Open Competition (OC)</option>
              <option value="BC">Backward Class (BC)</option>
              <option value="BCM">BC Muslim (BCM)</option>
              <option value="MBC">Most Backward Class (MBC/DNC)</option>
              <option value="SC">Scheduled Caste (SC/SCA)</option>
              <option value="ST">Scheduled Tribe (ST)</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="fg"
              checked={isFirstGraduate}
              onChange={(e) => setIsFirstGraduate(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600"
            />
            <label htmlFor="fg" className="font-semibold text-zinc-700 cursor-pointer">
              First Graduate in Family (TN FG Scheme)
            </label>
          </div>

          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="gs"
              checked={isGovtSchool}
              onChange={(e) => setIsGovtSchool(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600"
            />
            <label htmlFor="gs" className="font-semibold text-zinc-700 cursor-pointer">
              Classes 6-12 in TN Govt School (7.5% Quota)
            </label>
          </div>
        </div>
      </Card>

      {/* Summary Banner */}
      {data && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div>
            <span className="text-xs uppercase font-semibold text-emerald-200 block">
              Total Potential Annual Aid Available
            </span>
            <span className="text-3xl font-extrabold text-white block mt-0.5">
              {formatINR(data.total_potential_aid)} / Year
            </span>
            <span className="text-xs text-emerald-100/90 mt-1 block">
              Qualifies for {data.eligible_schemes_count} verified state welfare schemes
            </span>
          </div>

          <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-xl border border-white/20">
            <button
              onClick={() => setTab('eligible')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tab === 'eligible' ? 'bg-white text-emerald-950 shadow-sm' : 'text-emerald-100 hover:text-white'
              }`}
            >
              Eligible ({data.eligible_schemes_count})
            </button>
            <button
              onClick={() => setTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tab === 'all' ? 'bg-white text-emerald-950 shadow-sm' : 'text-emerald-100 hover:text-white'
              }`}
            >
              All Schemes ({data.total_schemes_evaluated})
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="py-12">
          <LoadingState message="Matching profile against Tamil Nadu welfare directives..." />
        </div>
      )}

      {error && (
        <div className="py-8">
          <ErrorState title="Failed to Load Scholarships" message={error} onRetry={fetchMatches} />
        </div>
      )}

      {/* Scholarship Cards Grid */}
      {!loading && displayedMatches.length === 0 && (
        <EmptyState
          title="No Scholarships Matching Selected Filters"
          description="Try switching the reservation category or turning on First Graduate / Govt School flags."
          actionText="Reset Filters"
          onAction={() => {
            setCommunity('BC');
            setIsFirstGraduate(true);
            setIsGovtSchool(false);
          }}
        />
      )}

      {!loading && displayedMatches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedMatches.map((item) => {
            const sch = item.scholarship;
            return (
              <Card
                key={sch.id}
                className="flex flex-col justify-between border-zinc-200/80 hover:border-emerald-300 hover:shadow-lg transition-all bg-white"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant={item.is_eligible ? 'success' : 'secondary'} className="text-[10px] font-bold uppercase">
                      {item.eligibility_status}
                    </Badge>
                    <button
                      onClick={() => handleToggleSave(sch.id)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        item.is_saved
                          ? 'bg-amber-50 border-amber-200 text-amber-600'
                          : 'border-zinc-200 text-zinc-400 hover:text-amber-500'
                      }`}
                    >
                      {item.is_saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-zinc-900 line-clamp-2">
                      {sch.title}
                    </h3>
                    <span className="text-xs text-zinc-500 block mt-1">
                      Provided by: {sch.provider}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-600 leading-relaxed line-clamp-3">
                    {sch.description}
                  </p>

                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-800">Annual Financial Grant</span>
                    <span className="text-sm font-extrabold text-emerald-950">
                      {formatINR(sch.amount_per_annum)} {sch.is_full_tuition_waiver && '(100% Tuition Waiver)'}
                    </span>
                  </div>

                  {/* Verification Criteria */}
                  <div className="space-y-1.5 pt-2 border-t border-zinc-100 text-xs">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Eligibility Reasons
                    </span>
                    {item.eligibility_reasons.map((r, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-zinc-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>

                  {/* Required Documents Checklist */}
                  {sch.required_documents && sch.required_documents.length > 0 && (
                    <div className="pt-2 text-xs">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        Mandatory Certificate Checklist
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {sch.required_documents.slice(0, 3).map((doc, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 bg-zinc-100 rounded text-zinc-700 font-medium">
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-zinc-50/80 border-t border-zinc-100 rounded-b-2xl flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-medium">{sch.deadline_info}</span>
                  {sch.application_portal_url && (
                    <a
                      href={sch.application_portal_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      Apply on Portal
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
