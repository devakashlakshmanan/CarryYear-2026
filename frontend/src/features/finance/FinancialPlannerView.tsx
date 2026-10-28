import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  Percent,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Calculator
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { financeApi, profileApi } from '../../services/api';
import type { FinancialPlan } from '../../types/more_features';

export const FinancialPlannerView: React.FC = () => {
  const [plan, setPlan] = useState<FinancialPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Simulation controls
  const [loanInterest, setLoanInterest] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(7);
  const [customBudget, setCustomBudget] = useState<number>(120000);

  // Load student's saved budget from profile on mount
  useEffect(() => {
    const loadStudentBudget = async () => {
      try {
        const p = await profileApi.getProfile();
        if (p && p.max_education_budget) {
          setCustomBudget(p.max_education_budget);
        }
      } catch (e) {
        // use default
      } finally {
        setProfileLoaded(true);
      }
    };
    loadStudentBudget();
  }, []);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await financeApi.getPlan({
        loan_interest_rate: loanInterest,
        loan_tenure_years: tenureYears,
        custom_budget: customBudget,
      });
      setPlan(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to calculate financial plan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profileLoaded) {
      fetchPlan();
    }
  }, [profileLoaded, loanInterest, tenureYears, customBudget]);

  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      <PageHeader
        title="Financial Feasibility & Education Loan Planner"
        subtitle="Comprehensive ROI and cost-benefit analysis: degree tuition, hostel living expenses, scholarship deductions, and loan amortization amortized against expected starting CTC in Tamil Nadu."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Finance Planner', path: '/finance' },
        ]}
      />

      {/* Simulator Inputs */}
      <Card className="p-5 border-zinc-200/80 shadow-sm bg-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-zinc-100 gap-2 mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-violet-600" />
            Financial Scenario Inputs
          </span>
          <Button variant="outline" size="sm" onClick={fetchPlan} className="text-xs h-8">
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Recalculate
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-zinc-600">Annual Family Budget</label>
              <span className="font-bold text-violet-700">{formatINR(customBudget)}</span>
            </div>
            <input
              type="range"
              min="20000"
              max="350000"
              step="10000"
              value={customBudget}
              onChange={(e) => setCustomBudget(Number(e.target.value))}
              className="w-full accent-violet-700"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-zinc-600">Loan Interest Rate</label>
              <span className="font-bold text-violet-700">{loanInterest}% p.a.</span>
            </div>
            <input
              type="range"
              min="7.0"
              max="13.5"
              step="0.25"
              value={loanInterest}
              onChange={(e) => setLoanInterest(Number(e.target.value))}
              className="w-full accent-violet-700"
            />
            <span className="text-[10px] text-zinc-400">SBI Scholar / Canara Vidya rates</span>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-zinc-600">Repayment Tenure</label>
              <span className="font-bold text-violet-700">{tenureYears} Years</span>
            </div>
            <input
              type="range"
              min="3"
              max="15"
              step="1"
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full accent-violet-700"
            />
            <span className="text-[10px] text-zinc-400">Post-moratorium repayment period</span>
          </div>
        </div>
      </Card>

      {loading && (
        <div className="py-12">
          <LoadingState message="Computing loan amortization and ROI metrics..." />
        </div>
      )}

      {error && (
        <div className="py-8">
          <ErrorState title="Could Not Load Plan" message={error} onRetry={fetchPlan} />
        </div>
      )}

      {plan && !loading && (
        <div className="space-y-6">
          {/* Executive Overview Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-900 to-purple-900 text-white shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs uppercase font-semibold text-violet-200">Financial Feasibility Status</span>
                <h2 className="text-2xl font-extrabold text-white mt-0.5">{plan.financial_feasibility_tier}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary" className="bg-white/20 text-white text-xs border-white/30">
                  {plan.college_name}
                </Badge>
                {plan.fee_source && (
                  <span className="px-2.5 py-1 bg-violet-800/80 text-[10px] font-medium rounded-full text-violet-100 border border-violet-400/30">
                    Source: {plan.fee_source} ({plan.academic_year || '2024-2025'})
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                <span className="text-[10px] uppercase font-semibold text-violet-200 block">Total Degree Cost</span>
                <span className="text-lg font-bold text-white block mt-0.5">{formatINR(plan.total_degree_cost)}</span>
                <span className="text-[10px] text-violet-200/80">4 Years (Tuition + Living)</span>
              </div>

              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                <span className="text-[10px] uppercase font-semibold text-violet-200 block">Net Loan Needed</span>
                <span className="text-lg font-bold text-amber-300 block mt-0.5">{formatINR(plan.loan_principal)}</span>
                <span className="text-[10px] text-violet-200/80">After Budget & Aid</span>
              </div>

              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                <span className="text-[10px] uppercase font-semibold text-violet-200 block">Monthly Loan EMI</span>
                <span className="text-lg font-bold text-emerald-300 block mt-0.5">{formatINR(plan.monthly_emi_amount)} / mo</span>
                <span className="text-[10px] text-violet-200/80">{plan.emi_to_income_ratio_percent}% of Starting Salary</span>
              </div>

              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                <span className="text-[10px] uppercase font-semibold text-violet-200 block">Payback Period</span>
                <span className="text-lg font-bold text-purple-200 block mt-0.5">{plan.investment_payback_years} Years</span>
                <span className="text-[10px] text-violet-200/80">To break even on CTC</span>
              </div>
            </div>
          </div>

          {/* Breakdown Tables & Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Degree Cost vs Available Funding */}
            <Card className="p-5 border-zinc-200/80 shadow-sm bg-white space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-violet-700" />
                Comprehensive 4-Year Cost vs. Available Funding
              </h3>

              <div className="space-y-2.5">
                <div className="flex justify-between py-1.5 border-b border-zinc-100">
                  <span className="text-zinc-600">Annual Tuition Fee</span>
                  <span className="font-bold text-zinc-900">{formatINR(plan.annual_tuition_fee)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100">
                  <span className="text-zinc-600">Annual Hostel & Accommodation</span>
                  <span className="font-bold text-zinc-900">{formatINR(plan.annual_hostel_fee)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100">
                  <span className="text-zinc-600">Annual Food & Living Expenses</span>
                  <span className="font-bold text-zinc-900">{formatINR(plan.annual_food_living || 15000)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100">
                  <span className="text-zinc-600">Annual Books, Supplies & Transport</span>
                  <span className="font-bold text-zinc-900">{formatINR((plan.annual_books_equipment || 10000) + (plan.annual_transport || 8000))}</span>
                </div>
                <div className="flex justify-between py-2 bg-violet-50/60 px-2 rounded-lg font-bold text-violet-950">
                  <span>Total 4-Year Degree Expenditure</span>
                  <span>{formatINR(plan.total_degree_cost)}</span>
                </div>

                <div className="pt-2 space-y-1.5">
                  <div className="flex justify-between text-zinc-600">
                    <span>(-) Total Family Budget Commitment</span>
                    <span className="font-semibold text-emerald-700">{formatINR(plan.total_student_budget)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>(-) Total Matched Scholarships Aid</span>
                    <span className="font-semibold text-emerald-700">{formatINR(plan.total_scholarships_aid)}</span>
                  </div>
                  <div className="flex justify-between py-2 bg-amber-50 px-2 rounded-lg font-bold text-amber-950 border border-amber-200">
                    <span>Net Funding Requirement (Loan)</span>
                    <span>{formatINR(plan.net_funding_gap)}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Loan Amortization & Repayment */}
            <Card className="p-5 border-zinc-200/80 shadow-sm bg-white space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Percent className="w-4 h-4 text-violet-700" />
                Education Loan Amortization Details
              </h3>

              <div className="space-y-2.5">
                <div className="flex justify-between py-1.5 border-b border-zinc-100">
                  <span className="text-zinc-600">Loan Sanction Principal</span>
                  <span className="font-bold text-zinc-900">{formatINR(plan.loan_principal)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100">
                  <span className="text-zinc-600">Interest Rate & Tenure</span>
                  <span className="font-bold text-zinc-900">{plan.loan_interest_rate_percent}% p.a. • {plan.loan_tenure_years} Years</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100">
                  <span className="text-zinc-600">Course Moratorium Period</span>
                  <span className="font-bold text-zinc-900">{plan.moratorium_years} Years (No EMI during college)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100">
                  <span className="text-zinc-600">Total Interest Payable</span>
                  <span className="font-bold text-zinc-900">{formatINR(plan.total_interest_payable)}</span>
                </div>
                <div className="flex justify-between py-2 bg-purple-50 px-2 rounded-lg font-bold text-purple-950">
                  <span>Total Repayment Over Tenure</span>
                  <span>{formatINR(plan.total_loan_repayment_amount)}</span>
                </div>
                <div className="flex justify-between py-2 bg-emerald-50 px-2 rounded-lg font-bold text-emerald-950">
                  <span>Monthly EMI Burden</span>
                  <span>{formatINR(plan.monthly_emi_amount)} / Month</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Actionable Recommendations */}
          <Card className="p-5 border-zinc-200/80 shadow-sm bg-white space-y-3">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-700" />
              Strategic Financial Recommendations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {plan.actionable_recommendations.map((rec, i) => (
                <div key={i} className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-zinc-700 leading-relaxed font-medium">{rec}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Legal / Estimates Disclaimer */}
          <div className="p-3.5 rounded-xl bg-violet-50/70 border border-violet-100 text-[11px] text-zinc-600 leading-relaxed">
            <span className="font-semibold text-violet-900 mr-1">Planning Notice:</span>
            {plan.disclaimer || 'Projections and EMI calculations are decision-support estimates based on published fee schedules and user assumptions, not formal financial advice or loan guarantees.'}
          </div>
        </div>
      )}
    </div>
  );
};
