import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Compass, LogOut, User, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPreview: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#FAF9FF] text-zinc-900 font-sans">
      {/* Header */}
      <header className="border-b border-zinc-200/80 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-md shadow-violet-500/20">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-violet-700 to-purple-600 bg-clip-text text-transparent">
                CarryYear
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800">
                Decision Intelligence
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-zinc-700">
              <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs">
                {user?.name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <span className="hidden sm:inline font-medium">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-xl text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-1 text-xs font-medium"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white p-8 rounded-2xl border border-zinc-200/80 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-zinc-100">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Authenticated Session Active</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">
                Vanakkam, {user?.name}!
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                Account ID #{user?.id} • {user?.email} • State: Tamil Nadu
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <span className="px-3 py-1 rounded-full bg-violet-50 text-violet-700 font-semibold text-xs border border-violet-200">
                JWT Auth Verified
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-violet-50/50 border border-violet-100">
              <h3 className="text-sm font-bold text-violet-900 flex items-center space-x-2">
                <User className="w-4 h-4 text-violet-600" />
                <span>Student Onboarding Status</span>
              </h3>
              <p className="text-xs text-zinc-600 mt-2">
                {user?.onboarding_completed
                  ? 'Your student profile is active and synced with the decision engine.'
                  : 'Your profile has not completed the multi-step onboarding wizard yet.'}
              </p>
              <Link
                to="/onboarding"
                className="mt-4 inline-flex items-center space-x-1.5 text-xs font-semibold text-violet-700 hover:text-violet-800"
              >
                <span>Continue to Onboarding Wizard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-5 rounded-xl bg-zinc-50 border border-zinc-200/70">
              <h3 className="text-sm font-bold text-zinc-900">Security & Session Status</h3>
              <ul className="text-xs text-zinc-600 mt-2 space-y-1">
                <li>• Password hashed using Bcrypt</li>
                <li>• JWT Access Token active in Authorization headers</li>
                <li>• Current User retrieved via <code className="bg-zinc-200 px-1 py-0.5 rounded">GET /api/auth/me</code></li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
