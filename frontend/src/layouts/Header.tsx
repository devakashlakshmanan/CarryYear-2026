import React from 'react';
import { Menu, Sparkles, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface HeaderProps {
  setIsMobileOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ setIsMobileOpen }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-zinc-200/80 sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between font-sans">
      <div className="flex items-center space-x-3">
        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileOpen(true)}
          className="md:hidden p-2 rounded-xl text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Region & Edition Tag */}
        <div className="hidden sm:flex items-center space-x-2 text-xs text-zinc-600 bg-violet-50/80 border border-violet-100 px-3 py-1.5 rounded-full">
          <MapPin className="w-3.5 h-3.5 text-violet-600" />
          <span className="font-semibold text-violet-900">Tamil Nadu Decision Engine</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        {/* Onboarding Pill */}
        {!user?.onboarding_completed && (
          <Link
            to="/onboarding"
            className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-200/70 text-pink-700 text-xs font-semibold hover:bg-pink-100 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            <span>Complete Onboarding</span>
          </Link>
        )}

        {/* User Avatar */}
        <Link
          to="/profile"
          className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-zinc-100/80 transition-colors"
        >
          <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-violet-500/30">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-zinc-900 leading-none truncate max-w-[120px]">
              {user?.name}
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5 leading-none">
              {user?.onboarding_completed ? 'Student Profile' : 'Setup Pending'}
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
};
