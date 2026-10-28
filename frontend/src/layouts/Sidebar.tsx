import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Compass,
  LayoutDashboard,
  User,
  Dna,
  ClipboardCheck,
  Briefcase,
  Sparkles,
  GitBranch,
  GraduationCap,
  Award,
  Wallet,
  SlidersHorizontal,
  Flame,
  Milestone,
  BotMessageSquare,
  Bookmark,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

const navSections: { sectionTitle?: string; items: NavItem[] }[] = [
  {
    items: [
      { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
      { name: 'My Profile', path: '/profile', icon: User },
      { name: 'Career DNA', path: '/career-dna', icon: Dna, badge: 'Core' },
      { name: 'Assessments', path: '/assessment', icon: ClipboardCheck },
    ]
  },
  {
    sectionTitle: 'EXPLORE & MATCH',
    items: [
      { name: 'Career Explorer', path: '/careers', icon: Briefcase },
      { name: 'Recommendations', path: '/recommendations', icon: Sparkles, badge: 'AI' },
      { name: 'Education Paths', path: '/education-paths', icon: GitBranch },
      { name: 'Colleges (TN)', path: '/colleges', icon: GraduationCap },
      { name: 'Scholarships', path: '/scholarships', icon: Award },
    ]
  },
  {
    sectionTitle: 'DECISION INTELLIGENCE',
    items: [
      { name: 'Financial Planner', path: '/finance', icon: Wallet },
      { name: 'What-If Simulator', path: '/simulator', icon: SlidersHorizontal, badge: 'New' },
      { name: 'Skill Gap', path: '/skills', icon: Flame },
      { name: 'Learning Roadmap', path: '/roadmap', icon: Milestone },
      { name: 'AI Career Advisor', path: '/ai-advisor', icon: BotMessageSquare, badge: 'Groq' },
      { name: 'Saved Items', path: '/saved', icon: Bookmark },
    ]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { logout } = useAuth();

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white border-r border-zinc-200/80 font-sans">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-zinc-100">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-md shadow-violet-500/20 flex-shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-violet-700 to-purple-600 bg-clip-text text-transparent truncate">
                  CarryYear
                </span>
                <span className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase">
                  Tamil Nadu Intel
                </span>
              </div>
            )}
          </div>

          {/* Close for mobile drawer */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="px-3 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-10rem)]">
          {navSections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              {!isCollapsed && sec.sectionTitle && (
                <div className="px-3 mb-2 text-[10px] font-bold text-zinc-400 tracking-wider">
                  {sec.sectionTitle}
                </div>
              )}
              {sec.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  title={isCollapsed ? item.name : undefined}
                  className={({ isActive }) =>
                    `flex items-center ${
                      isCollapsed ? 'justify-center px-2' : 'justify-between px-3'
                    } py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/25'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center space-x-3 truncate">
                        <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                        {!isCollapsed && <span className="truncate">{item.name}</span>}
                      </div>
                      {!isCollapsed && item.badge && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-violet-100 text-violet-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Account / Collapse Toggle */}
      <div className="p-3 border-t border-zinc-100 space-y-1">
        <NavLink
          to="/settings"
          onClick={() => setIsMobileOpen(false)}
          className={({ isActive }) =>
            `flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70 transition-colors ${
              isActive ? 'text-violet-700 bg-violet-50' : ''
            }`
          }
          title={isCollapsed ? 'Settings' : undefined}
        >
          <Settings className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </NavLink>

        <button
          onClick={logout}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center' : 'space-x-3'
          } px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors`}
          title={isCollapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>

        {/* Desktop Collapse Toggle */}
        <div className="hidden md:block pt-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center p-2 rounded-xl text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors text-xs"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden md:block sticky top-0 h-screen transition-all duration-300 z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
