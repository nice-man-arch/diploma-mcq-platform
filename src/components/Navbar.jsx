// src/components/Navbar.jsx
import React from 'react';
import { 
  PanelLeft, 
  Plus, 
  Flame, 
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';

export default function Navbar({
  currentView,
  onToggleSidebar,
  onOpenExamConfig,
  activeExamTitle,
  mistakeCount = 0,
  theme = 'dark',
  onToggleTheme
}) {
  const viewTitles = {
    home: 'Dashboard',
    exam: activeExamTitle || 'Exam Session',
    scorecard: 'Exam Results & Review',
    reading: 'Reading Mode',
    instant: 'Instant Step-by-Step Practice',
    mistakes: 'Mistake Notebook',
    leaderboard: 'Scholars Leaderboard',
    admin: 'Dashboard'
  };

  return (
    <header className="sticky top-0 z-30 h-14 w-full border-b border-zinc-800 dark:border-white/45 bg-white dark:bg-[#191919] px-4 sm:px-6 flex items-center justify-between text-zinc-900 dark:text-[#E3E3E3] transition-colors">
      {/* Left: Sidebar Toggle & Breadcrumb */}
      <div className="flex items-center gap-3 text-sm">
        <button
          type="button"
          onClick={onToggleSidebar}
          title="Toggle Sidebar"
          className="rounded-sm border border-zinc-800 dark:border-white/45 p-1.5 text-zinc-600 dark:text-[#9B9A97] hover:text-zinc-900 dark:hover:text-[#E3E3E3] hover:bg-zinc-100 dark:hover:bg-[#202020] transition-colors cursor-pointer"
        >
          <PanelLeft className="h-4 w-4" />
        </button>

        <span className="text-zinc-500 dark:text-[#9B9A97] font-medium hidden sm:inline">Applied Science</span>
        <ChevronRight className="h-3.5 w-3.5 text-zinc-400 dark:text-[#6F6E6B] hidden sm:inline" />
        <span className="font-semibold text-zinc-900 dark:text-[#E3E3E3]">{viewTitles[currentView] || 'Workspace'}</span>
      </div>

      {/* Right: Actions (Theme Toggle & Launch Exam - No Admin button visible) */}
      <div className="flex items-center gap-2.5">
        {/* Theme Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#202020] px-2.5 py-1.5 text-xs font-semibold text-zinc-800 dark:text-[#E3E3E3] hover:bg-zinc-200 dark:hover:bg-[#282828] transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="h-3.5 w-3.5 text-zinc-700" />
              <span className="hidden sm:inline">Dark</span>
            </>
          )}
        </button>

        {mistakeCount > 0 && currentView !== 'mistakes' && (
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-sm border border-rose-800 dark:border-white/45 bg-rose-50 dark:bg-[#3B2825] px-2.5 py-1 text-xs font-mono font-semibold text-rose-700 dark:text-[#D18E84]">
            <Flame className="h-3.5 w-3.5" /> {mistakeCount} Missed
          </span>
        )}

        <button
          type="button"
          onClick={() => onOpenExamConfig('70_marks')}
          className="rounded-sm border border-zinc-900 dark:border-white/60 bg-zinc-900 dark:bg-[#E3E3E3] px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white dark:text-[#191919] hover:bg-zinc-800 dark:hover:bg-[#D4D4D4] transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Launch Exam</span>
        </button>
      </div>
    </header>
  );
}
