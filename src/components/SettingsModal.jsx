// src/components/SettingsModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  User, 
  Trophy, 
  EyeOff, 
  Eye, 
  Check, 
  HeartHandshake,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  currentStudentName,
  hideLeaderboard,
  isLeaderboardOptedOut,
  onUpdateSettings
}) {
  const [name, setName] = useState(currentStudentName || '');
  const [nameSaved, setNameSaved] = useState(false);

  useEffect(() => {
    setName(currentStudentName || '');
  }, [currentStudentName, isOpen]);

  if (!isOpen) return null;

  const handleCloseWithSave = () => {
    if (name.trim() && name.trim() !== currentStudentName) {
      onUpdateSettings({
        name: name.trim(),
        hideLeaderboard,
        isLeaderboardOptedOut
      });
    }
    onClose();
  };

  const handleSelectVisibilityMode = (optOut) => {
    onUpdateSettings({
      name: name.trim() || currentStudentName || 'Candidate',
      hideLeaderboard,
      isLeaderboardOptedOut: optOut
    });
  };

  const handleToggleHideLeaderboard = () => {
    const nextVal = !hideLeaderboard;
    onUpdateSettings({
      name: name.trim() || currentStudentName || 'Candidate',
      hideLeaderboard: nextVal,
      isLeaderboardOptedOut
    });
  };

  const handleSaveName = (e) => {
    if (e) e.preventDefault();
    if (name.trim()) {
      onUpdateSettings({
        name: name.trim(),
        hideLeaderboard,
        isLeaderboardOptedOut
      });
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl rounded-md border border-zinc-800 dark:border-white/60 bg-white dark:bg-[#202020] text-zinc-900 dark:text-[#E3E3E3] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 dark:border-white/45 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-sm bg-zinc-100 dark:bg-[#282828] border border-zinc-800 dark:border-white/45 flex items-center justify-center text-zinc-800 dark:text-[#E3E3E3]">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white leading-tight">
                Leaderboard & Privacy Preferences
              </h2>
              <p className="text-xs text-zinc-500 dark:text-[#9B9A97]">
                Choose how you want to study and compare with other students
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCloseWithSave}
            className="p-1 rounded-sm text-zinc-500 hover:text-zinc-900 dark:text-[#9B9A97] dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#282828] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Section 1: Ranking Visibility Choice Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-[#9B9A97]">
                Leaderboard Ranking Status
              </span>
              <span className="text-xs text-zinc-500 dark:text-[#6F6E6B]">
                (Click to switch immediately)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: Public Ranked */}
              <div
                onClick={() => handleSelectVisibilityMode(false)}
                className={`p-4 rounded-md border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  !isLeaderboardOptedOut
                    ? 'border-emerald-600 dark:border-[#85B59A] bg-emerald-500/10 dark:bg-[#24332C]/60 text-zinc-900 dark:text-white'
                    : 'border-zinc-300 dark:border-white/20 bg-zinc-50 dark:bg-[#191919] hover:border-zinc-400 dark:hover:border-white/40 text-zinc-600 dark:text-[#9B9A97]'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 dark:text-white">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      <span>Public Scholar</span>
                    </div>
                    {!isLeaderboardOptedOut && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-[#85B59A]" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-[#9B9A97] leading-relaxed">
                    Your name and questions solved appear on the leaderboard rankings.
                  </p>
                </div>
                <div className="pt-3">
                  <span className={`inline-block px-2 py-0.5 rounded-xs text-[11px] font-bold font-mono ${
                    !isLeaderboardOptedOut
                      ? 'bg-emerald-600 text-white dark:bg-[#85B59A] dark:text-[#191919]'
                      : 'bg-zinc-200 dark:bg-[#262626] text-zinc-600 dark:text-[#888]'
                  }`}>
                    {!isLeaderboardOptedOut ? 'ACTIVE • RANKED' : 'Click to Activate'}
                  </span>
                </div>
              </div>

              {/* Option B: Private Study Mode (Opted Out) */}
              <div
                onClick={() => handleSelectVisibilityMode(true)}
                className={`p-4 rounded-md border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isLeaderboardOptedOut
                    ? 'border-emerald-600 dark:border-[#85B59A] bg-emerald-500/10 dark:bg-[#24332C]/60 text-zinc-900 dark:text-white'
                    : 'border-zinc-300 dark:border-white/20 bg-zinc-50 dark:bg-[#191919] hover:border-zinc-400 dark:hover:border-white/40 text-zinc-600 dark:text-[#9B9A97]'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 dark:text-white">
                      <HeartHandshake className="h-4 w-4 text-emerald-500" />
                      <span>Private Study Mode</span>
                    </div>
                    {isLeaderboardOptedOut && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-[#85B59A]" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-[#9B9A97] leading-relaxed">
                    Name and score completely hidden from rankings. Zero comparison with others.
                  </p>
                </div>
                <div className="pt-3">
                  <span className={`inline-block px-2 py-0.5 rounded-xs text-[11px] font-bold font-mono ${
                    isLeaderboardOptedOut
                      ? 'bg-emerald-600 text-white dark:bg-[#85B59A] dark:text-[#191919]'
                      : 'bg-zinc-200 dark:bg-[#262626] text-zinc-600 dark:text-[#888]'
                  }`}>
                    {isLeaderboardOptedOut ? 'ACTIVE • PRIVATE' : 'Click to Opt Out'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Hide Leaderboard Entirely from UI */}
          <div className="pt-4 border-t border-zinc-800 dark:border-white/45 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
                  <EyeOff className="h-4 w-4 text-zinc-600 dark:text-[#9B9A97]" />
                  <span>Hide Leaderboard Section Entirely</span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-[#9B9A97] leading-relaxed max-w-md">
                  Removes the "Leaderboard" tab from your left sidebar and removes the rankings teaser banner on your dashboard.
                </p>
              </div>

              <button
                type="button"
                onClick={handleToggleHideLeaderboard}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  hideLeaderboard ? 'bg-emerald-600 dark:bg-[#85B59A]' : 'bg-zinc-300 dark:bg-[#333333]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    hideLeaderboard ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Section 3: Student Display Name */}
          <div className="pt-4 border-t border-zinc-800 dark:border-white/45 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-[#9B9A97]">
              Student Display Name
            </label>
            <form onSubmit={handleSaveName} className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                maxLength={40}
                className="flex-1 rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#191919] px-3 py-2 text-sm text-zinc-900 dark:text-[#E3E3E3] placeholder-zinc-400 dark:placeholder-[#6F6E6B] focus:outline-hidden focus:border-zinc-900 dark:focus:border-white transition-colors"
              />
              <button
                type="submit"
                className="rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-100 dark:bg-[#282828] px-3.5 py-2 text-xs font-bold text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-[#333333] transition-colors cursor-pointer shrink-0"
              >
                {nameSaved ? 'Saved!' : 'Update'}
              </button>
            </form>
            <p className="text-xs text-zinc-500 dark:text-[#6F6E6B]">
              Your name shown on scorecards and public leaderboard rankings.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#191919] flex items-center justify-between shrink-0">
          <div className="text-xs text-zinc-500 dark:text-[#9B9A97]">
            Changes apply instantly.
          </div>
          <button
            type="button"
            onClick={handleCloseWithSave}
            className="rounded-sm border border-zinc-900 dark:border-white/60 bg-zinc-900 dark:bg-[#E3E3E3] px-5 py-1.5 text-xs sm:text-sm font-bold text-white dark:text-[#191919] hover:bg-zinc-800 dark:hover:bg-white transition-colors cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
