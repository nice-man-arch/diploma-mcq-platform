// src/components/SettingsModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  User, 
  Trophy, 
  EyeOff, 
  Eye, 
  Trash2, 
  Check,
  HeartHandshake,
  Sparkles,
  BookOpen
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
  const [hideRankings, setHideRankings] = useState(hideLeaderboard);
  const [optOut, setOptOut] = useState(isLeaderboardOptedOut);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setName(currentStudentName || '');
    setHideRankings(hideLeaderboard);
    setOptOut(isLeaderboardOptedOut);
  }, [currentStudentName, hideLeaderboard, isLeaderboardOptedOut, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    if (e) e.preventDefault();
    onUpdateSettings({
      name: name.trim() || 'Candidate',
      hideLeaderboard: hideRankings,
      isLeaderboardOptedOut: optOut
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleQuickRemoveFromRankings = () => {
    if (window.confirm("Remove your name from the public leaderboard? Your past exam marks will remain saved in your private history, but you will not appear on rankings.")) {
      setOptOut(true);
      onUpdateSettings({
        name: name.trim() || 'Candidate',
        hideLeaderboard: hideRankings,
        isLeaderboardOptedOut: true
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 1200);
    }
  };

  const handleQuickHideLeaderboardEntirely = () => {
    setHideRankings(true);
    setOptOut(true);
    onUpdateSettings({
      name: name.trim() || 'Candidate',
      hideLeaderboard: true,
      isLeaderboardOptedOut: true
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl rounded-md border border-zinc-800 dark:border-white/60 bg-white dark:bg-[#202020] text-zinc-900 dark:text-[#E3E3E3] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 dark:border-white/45 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-sm bg-zinc-100 dark:bg-[#282828] border border-zinc-800 dark:border-white/45 flex items-center justify-center text-zinc-800 dark:text-[#E3E3E3]">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white leading-tight">
                Study & Privacy Settings
              </h2>
              <p className="text-xs text-zinc-500 dark:text-[#9B9A97]">
                Personalize your workspace and social comparison preferences
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-sm text-zinc-500 hover:text-zinc-900 dark:text-[#9B9A97] dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#282828] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Mindful Study Banner */}
          <div className="rounded-sm border border-emerald-800/40 dark:border-white/40 bg-emerald-500/5 dark:bg-[#24332C]/50 p-4 flex items-start gap-3">
            <HeartHandshake className="h-5 w-5 text-emerald-600 dark:text-[#85B59A] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm">
                Self-Paced & Pressure-Free Study
              </div>
              <p className="text-xs text-zinc-600 dark:text-[#9B9A97] leading-relaxed">
                Comparison with others can be distracting and discouraging. If you prefer preparing quietly at your own pace, you can remove your name from rankings or hide the leaderboard completely below.
              </p>
            </div>
          </div>

          {/* Section 1: Display Name */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-[#9B9A97]">
              Student Display Name
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={40}
                  className="w-full rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#191919] px-3 py-2 text-sm text-zinc-900 dark:text-[#E3E3E3] placeholder-zinc-400 dark:placeholder-[#6F6E6B] focus:outline-hidden focus:border-zinc-900 dark:focus:border-white transition-colors"
                />
              </div>
            </div>
            <p className="text-xs text-zinc-500 dark:text-[#6F6E6B]">
              Shown on your scorecards and private exam audit sessions.
            </p>
          </div>

          {/* Section 2: Leaderboard Participation Toggle */}
          <div className="pt-2 border-t border-zinc-800 dark:border-white/45 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-600 dark:text-[#D1B280]" />
                  <span className="font-bold text-zinc-900 dark:text-white">
                    Appear on Public Leaderboard
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-[#9B9A97] leading-relaxed max-w-md">
                  When turned OFF, your name, score, and questions solved are completely removed from the public rankings board.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOptOut(!optOut)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  !optOut ? 'bg-emerald-600 dark:bg-[#85B59A]' : 'bg-zinc-300 dark:bg-[#333333]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    !optOut ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Section 3: Hide Leaderboard Completely */}
            <div className="flex items-start justify-between gap-4 pt-3 border-t border-zinc-200 dark:border-white/20">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <EyeOff className="h-4 w-4 text-zinc-600 dark:text-[#9B9A97]" />
                  <span className="font-bold text-zinc-900 dark:text-white">
                    Hide Leaderboard UI Entirely
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-[#9B9A97] leading-relaxed max-w-md">
                  Completely removes the "Leaderboard" tab from the sidebar and hides the rankings banner on the dashboard. No ranks will ever be shown to you.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setHideRankings(!hideRankings)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  hideRankings ? 'bg-emerald-600 dark:bg-[#85B59A]' : 'bg-zinc-300 dark:bg-[#333333]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    hideRankings ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Quick 1-Click Privacy Actions */}
          <div className="pt-2 border-t border-zinc-800 dark:border-white/45 space-y-2">
            <span className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-[#9B9A97]">
              Quick Privacy Shortcuts
            </span>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleQuickRemoveFromRankings}
                className="rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#282828] px-3 py-1.5 text-xs font-semibold text-zinc-800 dark:text-[#E3E3E3] hover:bg-zinc-200 dark:hover:bg-[#303030] dark:hover:border-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                <span>Remove My Name From Rankings</span>
              </button>

              <button
                type="button"
                onClick={handleQuickHideLeaderboardEntirely}
                className="rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#282828] px-3 py-1.5 text-xs font-semibold text-zinc-800 dark:text-[#E3E3E3] hover:bg-zinc-200 dark:hover:bg-[#303030] dark:hover:border-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <EyeOff className="h-3.5 w-3.5 text-amber-500" />
                <span>Hide All Rankings & Quiet Study</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#191919] flex items-center justify-between">
          <div className="text-xs text-zinc-500 dark:text-[#6F6E6B]">
            {savedSuccess && (
              <span className="text-emerald-600 dark:text-[#85B59A] font-bold flex items-center gap-1">
                <Check className="h-4 w-4" /> Preferences Saved!
              </span>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-sm border border-zinc-800 dark:border-white/45 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-[#9B9A97] hover:bg-zinc-100 dark:hover:bg-[#282828] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-sm border border-zinc-900 dark:border-white/60 bg-zinc-900 dark:bg-[#E3E3E3] px-4 py-1.5 text-xs sm:text-sm font-bold text-white dark:text-[#191919] hover:bg-zinc-800 dark:hover:bg-white transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Check className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
