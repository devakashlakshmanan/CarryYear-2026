import React, { useEffect, useState } from 'react';
import {
  Sliders,
  Zap,
  Building2,
  Compass
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { simulatorApi } from '../../services/api';
import type { SimulationResult } from '../../types/more_features';

export const WhatIfSimulatorView: React.FC = () => {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Scenario state
  const [cutoffDelta, setCutoffDelta] = useState<number>(2.0);
  const [budgetDelta, setBudgetDelta] = useState<number>(30000);
  const [quota, setQuota] = useState<string>('BC');

  const runSimulation = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await simulatorApi.evaluate({
        cutoff_delta: cutoffDelta,
        budget_delta: budgetDelta,
        quota,
      });
      setResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to run simulation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [cutoffDelta, budgetDelta, quota]);

  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;
  const formatLPA = (val: number) => `₹${(val / 100000).toFixed(1)} LPA`;

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      <PageHeader
        title="What-If Pathway & Admission Simulator"
        subtitle="Simulate real-time scenario outcomes: test how cut-off mark gains, budget adjustments, and reservation category selection impact your Tamil Nadu college admissions and career ROI."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Simulator', path: '/simulator' },
        ]}
      />

      {/* Control Console */}
      <Card className="p-6 border-zinc-200/80 shadow-sm bg-white space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            Scenario Variance Sliders
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCutoffDelta(0);
              setBudgetDelta(0);
              setQuota('OC');
            }}
            className="text-xs h-8"
          >
            Reset to Baseline
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          {/* Cut-off variance */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-semibold text-zinc-700">TNEA Cut-off Variance</label>
              <span
                className={`font-bold px-2 py-0.5 rounded ${
                  cutoffDelta > 0
                    ? 'bg-emerald-50 text-emerald-700'
                    : cutoffDelta < 0
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-zinc-100 text-zinc-700'
                }`}
              >
                {cutoffDelta > 0 ? `+${cutoffDelta.toFixed(1)}` : cutoffDelta.toFixed(1)} Marks
              </span>
            </div>
            <input
              type="range"
              min="-15"
              max="15"
              step="0.5"
              value={cutoffDelta}
              onChange={(e) => setCutoffDelta(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
              <span>-15.0 Marks</span>
              <span>Baseline (0)</span>
              <span>+15.0 Marks</span>
            </div>
          </div>

          {/* Budget variance */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-semibold text-zinc-700">Annual Budget Variance</label>
              <span
                className={`font-bold px-2 py-0.5 rounded ${
                  budgetDelta > 0
                    ? 'bg-emerald-50 text-emerald-700'
                    : budgetDelta < 0
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-zinc-100 text-zinc-700'
                }`}
              >
                {budgetDelta > 0 ? `+${formatINR(budgetDelta)}` : formatINR(budgetDelta)}
              </span>
            </div>
            <input
              type="range"
              min="-60000"
              max="100000"
              step="5000"
              value={budgetDelta}
              onChange={(e) => setBudgetDelta(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
              <span>-₹60,000</span>
              <span>Baseline (0)</span>
              <span>+₹1,00,000</span>
            </div>
          </div>

          {/* Quota */}
          <div>
            <label className="font-semibold text-zinc-700 block mb-1.5">Reservation Quota</label>
            <select
              value={quota}
              onChange={(e) => setQuota(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-medium outline-none"
            >
              <option value="OC">Open Competition (OC)</option>
              <option value="BC">Backward Class (BC)</option>
              <option value="BCM">BC Muslim (BCM)</option>
              <option value="MBC">Most Backward Class (MBC/DNC)</option>
              <option value="SC">Scheduled Caste (SC)</option>
              <option value="ST">Scheduled Tribe (ST)</option>
            </select>
            <span className="text-[10px] text-zinc-400 mt-1 block">TNEA single-window seat matrix</span>
          </div>
        </div>
      </Card>

      {loading && (
        <div className="py-12">
          <LoadingState message="Simulating admission probabilities across Tamil Nadu colleges..." />
        </div>
      )}

      {error && (
        <div className="py-8">
          <ErrorState title="Simulation Failed" message={error} onRetry={runSimulation} />
        </div>
      )}

      {result && !loading && (
        <div className="space-y-6">
          {/* Outcome Comparison Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-sm space-y-1">
              <span className="text-zinc-500 font-medium">Cut-Off Shift</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-indigo-600">
                  {result.simulated_cutoff.toFixed(1)} / 200
                </span>
                <span className="text-zinc-400 text-[10px]">
                  (Base: {result.baseline_cutoff.toFixed(1)})
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-sm space-y-1">
              <span className="text-zinc-500 font-medium">Target Matches</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-emerald-600">
                  {result.target_colleges_count} Options
                </span>
                <span className="text-emerald-700 text-[10px] font-semibold">High Probability</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-sm space-y-1">
              <span className="text-zinc-500 font-medium">Reach Colleges</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-amber-600">
                  {result.reach_colleges_count} Options
                </span>
                <span className="text-amber-700 text-[10px] font-semibold">Aspirational</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-sm space-y-1">
              <span className="text-zinc-500 font-medium">Safe Backups</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-purple-600">
                  {result.safe_colleges_count} Options
                </span>
                <span className="text-purple-700 text-[10px] font-semibold">Guaranteed Seats</span>
              </div>
            </div>
          </div>

          {/* AI Simulation Insights */}
          <Card className="p-5 border-zinc-200/80 shadow-sm bg-white space-y-3">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Scenario Analysis & Insights
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {result.insights.map((insight, i) => (
                <div key={i} className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                  <span className="text-zinc-700 leading-relaxed font-medium">{insight}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Simulated Colleges & Careers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Top Simulated College Matches */}
            <Card className="p-5 border-zinc-200/80 shadow-sm bg-white space-y-3">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                Simulated College Opportunities
              </h3>
              <div className="space-y-2.5">
                {result.top_recommended_colleges.map((col, i) => (
                  <div key={i} className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-zinc-900 block">{col.college_name}</span>
                      <span className="text-[11px] text-zinc-500">{col.course} • {col.district}</span>
                    </div>
                    <Badge variant={col.category === 'Target' ? 'primary' : 'success'} className="text-[10px]">
                      {col.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Recommended Career Trajectories */}
            <Card className="p-5 border-zinc-200/80 shadow-sm bg-white space-y-3">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-600" />
                Aligned Career Trajectories
              </h3>
              <div className="space-y-2.5">
                {result.career_options.map((car, i) => (
                  <div key={i} className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-zinc-900 block">{car.career_title}</span>
                      <span className="text-[11px] text-zinc-500">{car.industry}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-700 block">{formatLPA(car.starting_ctc)}</span>
                      <span className="text-[10px] text-zinc-400">{car.match_score}% Match</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
