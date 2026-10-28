import React, { useState } from 'react';
import { 
  Settings, 
  Bell, 
  GraduationCap, 
  CheckCircle2, 
  Save, 
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export const SettingsView: React.FC = () => {
  const { user } = useAuth();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [cutoffAlerts, setCutoffAlerts] = useState(true);
  const [scholarshipAlerts, setScholarshipAlerts] = useState(true);
  const [savedNotification, setSavedNotification] = useState(false);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 rounded-2xl border border-indigo-500/20 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400 shadow-inner">
            <Settings className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Profile & Preferences</h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage your academic profile, counseling quotas, and notification alerts.
            </p>
          </div>
        </div>
      </div>

      {savedNotification && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Preferences updated successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/20 mb-4">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <h2 className="text-lg font-bold text-white">{user?.name || 'Tamil Nadu Aspirant'}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{user?.email || 'student@carryyear.tn'}</p>

          <div className="w-full mt-6 pt-4 border-t border-slate-800 space-y-2 text-left text-xs">
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Account Type:</span>
              <span className="font-semibold text-slate-200">Class 12th Student</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Jurisdiction:</span>
              <span className="font-semibold text-indigo-400">Tamil Nadu (TNEA / DoTE)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Status:</span>
              <span className="font-semibold text-emerald-400">Profile Verified</span>
            </div>
          </div>

          <Link
            to="/assessment"
            className="w-full mt-6 py-2.5 px-4 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-xl text-xs font-semibold text-indigo-300 flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retake Career Assessment
          </Link>
        </div>

        {/* Academic Details & Notifications */}
        <div className="md:col-span-2 space-y-6">
          {/* Academic Quota Badges */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              Academic Quota & Eligibility Setup
            </h3>
            <p className="text-xs text-slate-400">
              These verified parameters are used by our deterministic TNEA engine to match cutoff ranks and scholarship fee waivers.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <span className="text-[11px] text-slate-400">Community Category</span>
                <div className="text-sm font-bold text-white mt-1">BC / MBC / SC / OC</div>
              </div>
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <span className="text-[11px] text-slate-400">First Graduate Waiver</span>
                <div className="text-sm font-bold text-emerald-400 mt-1">Eligible (₹25k waiver)</div>
              </div>
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <span className="text-[11px] text-slate-400">7.5% Govt School Quota</span>
                <div className="text-sm font-bold text-purple-400 mt-1">Auto-evaluated</div>
              </div>
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <span className="text-[11px] text-slate-400">TNEA Cutoff Scale</span>
                <div className="text-sm font-bold text-indigo-400 mt-1">200.00 Standard</div>
              </div>
            </div>
          </div>

          {/* Preferences Form */}
          <form onSubmit={handleSavePreferences} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              Alerts & Notifications
            </h3>

            <div className="space-y-3 pt-1">
              <label className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
                <div>
                  <div className="text-xs font-semibold text-slate-200">TNEA Cutoff Updates</div>
                  <div className="text-[11px] text-slate-400">Receive alerts when college cutoff trends are revised</div>
                </div>
                <input
                  type="checkbox"
                  checked={cutoffAlerts}
                  onChange={(e) => setCutoffAlerts(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded bg-slate-800 border-slate-700 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Scholarship Deadline Reminders</div>
                  <div className="text-[11px] text-slate-400">Get notified 7 days before Tamil Nadu portal deadlines close</div>
                </div>
                <input
                  type="checkbox"
                  checked={scholarshipAlerts}
                  onChange={(e) => setScholarshipAlerts(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded bg-slate-800 border-slate-700 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Career Insights Digest</div>
                  <div className="text-[11px] text-slate-400">Weekly curated high-growth skill recommendations</div>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded bg-slate-800 border-slate-700 focus:ring-indigo-500"
                />
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                Save Preferences
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default SettingsView;
