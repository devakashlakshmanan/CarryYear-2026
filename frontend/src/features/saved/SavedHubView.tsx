import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bookmark, 
  Briefcase, 
  Award, 
  Trash2, 
  ArrowRight,
  Loader2,
  TrendingUp,
  Building,
  CheckCircle2
} from 'lucide-react';
import { savedApi, careerApi, scholarshipApi } from '../../services/api';
import type { UnifiedSavedHub } from '../../types/more_features';

export const SavedHubView: React.FC = () => {
  const [data, setData] = useState<UnifiedSavedHub | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'careers' | 'scholarships'>('all');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    loadSavedHub();
  }, []);

  const loadSavedHub = async () => {
    try {
      setLoading(true);
      const res = await savedApi.getAllSaved();
      setData(res);
    } catch (err) {
      console.error("Failed to load saved items", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveCareer = async (careerId: number, title: string) => {
    try {
      await careerApi.unsaveCareer(careerId);
      setActionMessage(`Removed "${title}" from saved careers.`);
      setTimeout(() => setActionMessage(null), 3500);
      loadSavedHub();
    } catch (err) {
      console.error("Failed to unsave career", err);
    }
  };

  const handleUnsaveScholarship = async (scholarshipId: number, name: string) => {
    try {
      await scholarshipApi.toggleSave(scholarshipId);
      setActionMessage(`Removed "${name}" from saved scholarships.`);
      setTimeout(() => setActionMessage(null), 3500);
      loadSavedHub();
    } catch (err) {
      console.error("Failed to unsave scholarship", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
      </div>
    );
  }

  const careers = data?.saved_careers || [];
  const scholarships = data?.saved_scholarships || [];
  const totalCount = (data?.total_saved_count ?? (careers.length + scholarships.length));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-violet-50 via-purple-50 to-white p-6 rounded-2xl border border-violet-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center border border-violet-200 text-violet-700 shadow-sm">
            <Bookmark className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
              Saved Hub & Bookmarks
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-violet-100 text-violet-800 border border-violet-200">
                {totalCount} Total
              </span>
            </h1>
            <p className="text-sm text-zinc-600 mt-1">
              Your curated shortlist of target careers and qualified Tamil Nadu educational scholarships.
            </p>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-zinc-200 shadow-xs self-start md:self-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-violet-700 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab('careers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'careers'
                ? 'bg-violet-700 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Careers ({careers.length})
          </button>
          <button
            onClick={() => setActiveTab('scholarships')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'scholarships'
                ? 'bg-violet-700 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Scholarships ({scholarships.length})
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Empty State */}
      {totalCount === 0 && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-sm">
          <Bookmark className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-900">No Saved Items Yet</h3>
          <p className="text-sm text-zinc-600 mt-2 mb-6 leading-relaxed">
            Bookmark careers from the Career Explorer or save qualifying Tamil Nadu welfare scholarships to monitor your target goals.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/careers"
              className="px-4 py-2 text-xs font-medium rounded-xl bg-violet-700 hover:bg-violet-800 text-white transition-colors shadow-xs"
            >
              Browse Careers
            </Link>
            <Link
              to="/scholarships"
              className="px-4 py-2 text-xs font-medium rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition-colors"
            >
              Check Scholarships
            </Link>
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="space-y-6">
        {/* Careers Section */}
        {(activeTab === 'all' || activeTab === 'careers') && careers.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-violet-600" />
              Saved Careers ({careers.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {careers.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-zinc-200 hover:border-violet-300 rounded-2xl p-5 flex flex-col justify-between transition-all group hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-semibold text-violet-700 bg-violet-50 border border-violet-200 px-2.5 py-0.5 rounded-full">
                        {item.career?.industry || item.career?.cluster || 'Technology'}
                      </span>
                      <button
                        onClick={() => handleUnsaveCareer(item.career_id, item.career?.title || 'Career')}
                        className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                        title="Remove bookmark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-base font-bold text-zinc-900 mt-3 group-hover:text-violet-700 transition-colors">
                      {item.career?.title || `Career #${item.career_id}`}
                    </h3>

                    <div className="mt-4 space-y-1.5 text-xs text-zinc-600">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Demand: <strong className="text-emerald-700">{item.career?.tamil_nadu_demand || 'High'}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400 font-semibold">₹</span>
                        <span>Salary: <strong className="text-zinc-900">₹{item.career?.salary_range_min || 4}L - ₹{item.career?.salary_range_max || 12}L</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400">
                      Saved {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently'}
                    </span>
                    <Link
                      to={`/careers`}
                      className="text-xs font-medium text-violet-700 hover:text-violet-800 flex items-center gap-1"
                    >
                      View Details <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scholarships Section */}
        {(activeTab === 'all' || activeTab === 'scholarships') && scholarships.length > 0 && (
          <div className="space-y-3 pt-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              Saved Scholarships ({scholarships.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scholarships.map((sch) => (
                <div
                  key={sch.id}
                  className="bg-white border border-zinc-200 hover:border-emerald-300 rounded-2xl p-5 flex flex-col justify-between transition-all group hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {sch.provider}
                      </span>
                      <button
                        onClick={() => handleUnsaveScholarship(sch.scholarship_id, sch.title)}
                        className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                        title="Remove bookmark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-base font-bold text-zinc-900 mt-3 group-hover:text-emerald-700 transition-colors">
                      {sch.title}
                    </h3>

                    <div className="mt-4 p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                      <div className="text-xs text-zinc-500">Award Amount:</div>
                      <div className="text-lg font-bold text-emerald-700">
                        ₹{sch.amount_per_annum.toLocaleString('en-IN')}{' '}
                        <span className="text-xs font-normal text-zinc-500">/ year</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400">
                      {sch.deadline_info || 'Annual Cycle'}
                    </span>
                    <Link
                      to="/scholarships"
                      className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                    >
                      Apply / Rules <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default SavedHubView;
