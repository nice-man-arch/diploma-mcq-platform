// src/components/Sidebar.jsx
import React from 'react';
import { 
  FileText, 
  BookOpen, 
  Zap, 
  Flame, 
  Award, 
  Clock, 
  Plus, 
  GraduationCap, 
  PanelLeftClose,
  Trophy
} from 'lucide-react';

const UNITS = [
  { id: 1, name: "1. Units & Measurements", count: 298 },
  { id: 2, name: "2. Electricity & Magnetism", count: 198 },
  { id: 3, name: "3. Waves & Oscillations", count: 150 },
  { id: 4, name: "4. Optics & Modern Physics", count: 200 },
  { id: 5, name: "5. Thermometry & Heat", count: 100 },
  { id: 6, name: "6. Electrochemistry & Metals", count: 100 },
];

export default function Sidebar({
  currentView,
  onNavigate,
  onOpenExamConfig,
  onSelectUnitInReading,
  hideLeaderboard = false,
  mistakeCount = 0,
  isOpen,
  onToggleSidebar
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onToggleSidebar}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-white dark:bg-[#202020] border-r border-zinc-800 dark:border-white/45 flex flex-col transition-all duration-200 ease-in-out md:static shrink-0 overflow-hidden ${
          isOpen 
            ? 'w-72 translate-x-0 opacity-100' 
            : 'w-0 -translate-x-full md:translate-x-0 opacity-0 border-r-0 pointer-events-none'
        }`}
      >
        <div className="w-72 h-full flex flex-col">
          {/* Workspace Brand / Header */}
          <div className="h-14 px-4 border-b border-zinc-800 dark:border-white/45 flex items-center justify-between shrink-0">
            <div 
              onClick={() => onNavigate('home')} 
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition-opacity"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-zinc-100 dark:bg-[#2A2A2A] border border-zinc-800 dark:border-white/45 text-zinc-900 dark:text-[#E3E3E3]">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-zinc-900 dark:text-[#E3E3E3] tracking-tight">
                  Applied Science
                </div>
                <div className="text-xs text-zinc-500 dark:text-[#9B9A97]">Diploma MCQ Bank</div>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggleSidebar}
              title="Collapse Sidebar"
              className="rounded-sm p-1.5 text-zinc-600 dark:text-[#9B9A97] hover:text-zinc-900 dark:hover:text-[#E3E3E3] hover:bg-zinc-100 dark:hover:bg-[#262626] transition-colors cursor-pointer md:hidden"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {/* Main Views */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className={`w-full flex items-center justify-between rounded-sm px-3 py-2 text-sm font-semibold transition-colors cursor-pointer border ${
                currentView === 'home'
                  ? 'bg-zinc-100 text-zinc-900 border-zinc-900 dark:bg-[#282828] dark:text-white dark:border-white/60'
                  : 'text-zinc-600 dark:text-[#9B9A97] border-transparent hover:bg-zinc-50 dark:hover:bg-[#262626] hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4" />
                <span>Dashboard</span>
              </div>
            </button>

            {/* Public Student Leaderboard (Can be hidden from settings for self-paced focus) */}
            {!hideLeaderboard && (
              <button
                type="button"
                onClick={() => onNavigate('leaderboard')}
                className={`w-full flex items-center justify-between rounded-sm px-3 py-2 text-sm font-semibold transition-colors cursor-pointer border ${
                  currentView === 'leaderboard'
                    ? 'bg-zinc-100 text-zinc-900 border-zinc-900 dark:bg-[#282828] dark:text-white dark:border-white/60'
                    : 'text-zinc-600 dark:text-[#9B9A97] border-transparent hover:bg-zinc-50 dark:hover:bg-[#262626] hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <span>Leaderboard</span>
                </div>
                <span className="rounded-xs border border-amber-600/40 bg-amber-50 dark:bg-[#282117] px-1.5 py-0.2 text-[10px] font-mono font-bold text-amber-700 dark:text-[#D1B280]">
                  RANKS
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigate('instant')}
              className={`w-full flex items-center justify-between rounded-sm px-3 py-2 text-sm font-semibold transition-colors cursor-pointer border ${
                currentView === 'instant'
                  ? 'bg-zinc-100 text-zinc-900 border-zinc-900 dark:bg-[#282828] dark:text-white dark:border-white/60'
                  : 'text-zinc-600 dark:text-[#9B9A97] border-transparent hover:bg-zinc-50 dark:hover:bg-[#262626] hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Zap className="h-4 w-4" />
                <span>Instant Practice</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('reading')}
              className={`w-full flex items-center justify-between rounded-sm px-3 py-2 text-sm font-semibold transition-colors cursor-pointer border ${
                currentView === 'reading'
                  ? 'bg-zinc-100 text-zinc-900 border-zinc-900 dark:bg-[#282828] dark:text-white dark:border-white/60'
                  : 'text-zinc-600 dark:text-[#9B9A97] border-transparent hover:bg-zinc-50 dark:hover:bg-[#262626] hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="h-4 w-4" />
                <span>Reading Mode</span>
              </div>
              <span className="text-xs text-zinc-500 dark:text-[#6F6E6B] font-mono">1,046 Qs</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('mistakes')}
              className={`w-full flex items-center justify-between rounded-sm px-3 py-2 text-sm font-semibold transition-colors cursor-pointer border ${
                currentView === 'mistakes'
                  ? 'bg-zinc-100 text-zinc-900 border-zinc-900 dark:bg-[#282828] dark:text-white dark:border-white/60'
                  : 'text-zinc-600 dark:text-[#9B9A97] border-transparent hover:bg-zinc-50 dark:hover:bg-[#262626] hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Flame className="h-4 w-4 text-rose-500" />
                <span>Mistake Notebook</span>
              </div>
              {mistakeCount > 0 && (
                <span className="rounded-sm border border-rose-800 dark:border-white/50 bg-rose-100 dark:bg-[#3B2825] px-2 py-0.5 text-xs font-mono font-bold text-rose-700 dark:text-[#D18E84]">
                  {mistakeCount}
                </span>
              )}
            </button>
          </div>

          {/* Test Presets Section */}
          <div className="space-y-1.5 pt-2">
            <div className="px-2.5 pb-1 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-[#6F6E6B]">
              Exam Sets
            </div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => onOpenExamConfig('70_marks')}
                className="w-full flex items-center justify-between rounded-sm px-3 py-2 text-xs sm:text-sm font-medium text-zinc-700 dark:text-[#9B9A97] hover:bg-zinc-100 dark:hover:bg-[#262626] hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer border border-transparent hover:border-zinc-800 dark:hover:border-white/40"
              >
                <div className="flex items-center gap-2 truncate">
                  <Award className="h-4 w-4 text-emerald-600 dark:text-[#85B59A]" />
                  <span>70 Marks Exam</span>
                </div>
                <span className="text-xs text-zinc-500 dark:text-[#6F6E6B] font-mono">1.0m/Q</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenExamConfig('140_half')}
                className="w-full flex items-center justify-between rounded-sm px-3 py-2 text-xs sm:text-sm font-medium text-zinc-700 dark:text-[#9B9A97] hover:bg-zinc-100 dark:hover:bg-[#262626] hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer border border-transparent hover:border-zinc-800 dark:hover:border-white/40"
              >
                <div className="flex items-center gap-2 truncate">
                  <Clock className="h-4 w-4 text-sky-600 dark:text-[#8FAFC4]" />
                  <span>140 Qs (Half Mark)</span>
                </div>
                <span className="text-xs text-zinc-500 dark:text-[#6F6E6B] font-mono">0.5m/Q</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenExamConfig('custom')}
                className="w-full flex items-center gap-2 rounded-sm px-3 py-2 text-xs sm:text-sm font-medium text-zinc-700 dark:text-[#9B9A97] hover:bg-zinc-100 dark:hover:bg-[#262626] hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer border border-transparent hover:border-zinc-800 dark:hover:border-white/40"
              >
                <Plus className="h-4 w-4" />
                <span>Configure Custom Exam</span>
              </button>
            </div>
          </div>

          {/* Syllabus Units (Reading Shortcuts) */}
          <div className="space-y-1.5 pt-2">
            <div className="px-2.5 pb-1 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-[#6F6E6B]">
              Syllabus Units
            </div>
            <div className="space-y-1">
              {UNITS.map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => onSelectUnitInReading(u.id)}
                  className="w-full flex items-center justify-between rounded-sm px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-[#9B9A97] hover:bg-zinc-100 dark:hover:bg-[#262626] hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer text-left border border-transparent hover:border-zinc-800 dark:hover:border-white/40"
                >
                  <span className="truncate pr-1">{u.name}</span>
                  <span className="text-xs text-zinc-500 dark:text-[#6F6E6B] font-mono shrink-0">{u.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-zinc-800 dark:border-white/45 shrink-0">
          <button
            type="button"
            onClick={() => onOpenExamConfig('70_marks')}
            className="w-full rounded-sm border border-zinc-900 dark:border-white/50 bg-zinc-900 dark:bg-[#282828] py-2.5 px-3 text-xs sm:text-sm font-semibold text-white dark:text-[#E3E3E3] hover:bg-zinc-800 dark:hover:bg-[#303030] dark:hover:border-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Exam Session</span>
          </button>
        </div>
        </div>
      </aside>
    </>
  );
}
