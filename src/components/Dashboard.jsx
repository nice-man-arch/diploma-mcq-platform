// src/components/Dashboard.jsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Award, 
  Clock, 
  Zap, 
  BookOpen, 
  Flame, 
  ArrowRight, 
  CheckCircle2, 
  Play,
  Sliders,
  FileText,
  Trophy,
  Search
} from 'lucide-react';

const UNITS_DATA = [
  { id: 1, code: "Unit 1", name: "Units, Measurements & Vectors", count: 298, cat: "Physics" },
  { id: 2, code: "Unit 2", name: "Electricity & Magnetism", count: 198, cat: "Physics" },
  { id: 3, code: "Unit 3", name: "Waves & Oscillations", count: 150, cat: "Physics" },
  { id: 4, code: "Unit 4", name: "Optics & Modern Physics", count: 200, cat: "Physics" },
  { id: 5, code: "Unit 5", name: "Thermometry & Heat Transfer", count: 100, cat: "Physics" },
  { id: 6, code: "Unit 6", name: "Electrochemistry, Redox & Metals", count: 100, cat: "Chemistry" },
];

export default function Dashboard({
  onLaunchPreset,
  onOpenCustomModal,
  onNavigate,
  hideLeaderboard = false,
  mistakeCount = 0,
  history = [],
  onAdminUnlock
}) {
  const [commandQuery, setCommandQuery] = useState('');
  const [commandStatus, setCommandStatus] = useState('');
  const inputRef = useRef(null);

  const triggerAdminUnlock = () => {
    if (onAdminUnlock) {
      onAdminUnlock();
    }
  };

  const handleCommandChange = (e) => {
    const val = e.target.value;
    setCommandQuery(val);
    if (commandStatus) setCommandStatus('');
  };

  const handleCommandSubmit = (e) => {
    if (e) e.preventDefault();
    const cleaned = commandQuery.trim().toLowerCase();
    if (cleaned === '/test01' || cleaned === 'test01') {
      triggerAdminUnlock();
      return;
    }
    if (cleaned.startsWith('/')) {
      setCommandStatus(`System command "${commandQuery}" processed. No active module match.`);
    } else if (cleaned.length > 0) {
      setCommandStatus(`Query "${commandQuery}" processed. Browse units below to begin practice.`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-12 text-zinc-900 dark:text-[#E3E3E3]">
      {/* Document Heading */}
      <div className="space-y-4 border-b border-zinc-800 dark:border-white/45 pb-10">
        <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm text-zinc-600 dark:text-[#9B9A97]">
          <span className="rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-100 dark:bg-[#202020] px-2 py-0.5 font-mono font-bold text-zinc-900 dark:text-[#E3E3E3]">
            PHYSICS & CHEMISTRY
          </span>
          <span>•</span>
          <span className="font-semibold text-zinc-800 dark:text-[#E3E3E3]">1,046 Verified Questions</span>
          <span>•</span>
          <span>6 Syllabus Units</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-[#E3E3E3] leading-tight">
          Diploma Applied Science Question Bank
        </h1>

        <p className="text-base sm:text-lg text-zinc-600 dark:text-[#9B9A97] leading-relaxed max-w-3xl">
          A minimalist high-retention mastery workspace for Diploma engineering students. Practice non-repeating randomized exam sets, review instant answers with memory hacks, and drill weak concepts in your mistake notebook.
        </p>

        {/* Visible Search & Command Textbox (Accessible for /test01 unlock) */}
        <div className="pt-2 pb-1">
          <form onSubmit={handleCommandSubmit} className="relative flex items-center max-w-2xl">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-zinc-500 dark:text-[#9B9A97]">
              <Search className="h-4 w-4" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={commandQuery}
              onChange={handleCommandChange}
              placeholder="Search question bank, syllabus, or enter /command..."
              className="w-full pl-10 pr-24 py-2.5 rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#1E1E1E] text-zinc-900 dark:text-[#E3E3E3] font-mono text-sm placeholder:text-zinc-500 dark:placeholder:text-[#6F6E6B] focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-white transition-all shadow-xs"
              autoComplete="off"
              spellCheck="false"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-3 py-1 rounded-sm border border-zinc-700 dark:border-white/40 bg-zinc-900 dark:bg-[#E3E3E3] text-white dark:text-[#191919] font-mono text-xs font-bold hover:bg-zinc-800 dark:hover:bg-white transition-all cursor-pointer"
            >
              Run ↵
            </button>
          </form>
          {commandStatus && (
            <p className="mt-2 text-xs font-mono text-zinc-500 dark:text-[#9B9A97] px-1">
              {commandStatus}
            </p>
          )}
        </div>

        {/* Quick Launch Buttons */}
        <div className="pt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onLaunchPreset('70_marks')}
            className="rounded-sm border border-zinc-900 dark:border-white/60 bg-zinc-900 dark:bg-[#E3E3E3] px-5 py-2.5 text-sm sm:text-base font-bold text-white dark:text-[#191919] hover:bg-zinc-800 dark:hover:bg-white transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Launch 70 Marks Exam</span>
          </button>

          <button
            type="button"
            onClick={() => onLaunchPreset('140_half')}
            className="rounded-sm border border-zinc-800 dark:border-white/45 bg-white dark:bg-[#202020] px-4 py-2.5 text-sm sm:text-base font-semibold text-zinc-900 dark:text-[#E3E3E3] hover:bg-zinc-100 dark:hover:bg-[#282828] dark:hover:border-white transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Clock className="h-4 w-4 text-sky-600 dark:text-[#8FAFC4]" />
            <span>140 Qs Drill (0.5m)</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('reading')}
            className="rounded-sm border border-zinc-800 dark:border-white/45 bg-white dark:bg-[#202020] px-4 py-2.5 text-sm sm:text-base font-semibold text-zinc-700 dark:text-[#9B9A97] hover:text-zinc-900 dark:hover:text-[#E3E3E3] hover:bg-zinc-100 dark:hover:bg-[#282828] dark:hover:border-white transition-colors flex items-center gap-2 cursor-pointer"
          >
            <BookOpen className="h-4 w-4 text-emerald-600 dark:text-[#85B59A]" />
            <span>Reading Mode</span>
          </button>

          <button
            type="button"
            onClick={onOpenCustomModal}
            className="rounded-sm border border-zinc-800 dark:border-white/45 bg-white dark:bg-[#202020] px-4 py-2.5 text-sm sm:text-base font-semibold text-zinc-700 dark:text-[#9B9A97] hover:text-zinc-900 dark:hover:text-[#E3E3E3] hover:bg-zinc-100 dark:hover:bg-[#282828] dark:hover:border-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="h-4 w-4" />
            <span>Custom Config</span>
          </button>
        </div>
      </div>

      {/* Test Formats Table-Like Section */}
      <div className="space-y-4">
        <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-[#9B9A97]">
          Exam Formats & Practice Modes
        </div>

        <div className="divide-y divide-zinc-800 dark:divide-white/45 rounded-md border border-zinc-800 dark:border-white/45 bg-white dark:bg-[#202020] overflow-hidden">
          {/* Row 1: 70 Marks Exam */}
          <div 
            onClick={() => onLaunchPreset('70_marks')}
            className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-[#262626] transition-colors cursor-pointer group"
          >
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-bold text-base sm:text-lg text-zinc-900 dark:text-[#E3E3E3]">70 Marks Board Exam</span>
                <span className="rounded-sm border border-emerald-800 dark:border-white/45 bg-emerald-100 dark:bg-[#24332C] px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:text-[#85B59A]">
                  1.0 Mark/Q
                </span>
                <span className="rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-100 dark:bg-[#191919] px-2 py-0.5 text-xs font-mono font-bold text-zinc-700 dark:text-[#9B9A97]">
                  70 Questions
                </span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-[#9B9A97] leading-relaxed">
                Official diploma exam pattern. Zero repeating questions, live timer, and detailed scorecard with memory hacks.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-zinc-700 dark:text-[#9B9A97] group-hover:text-zinc-900 dark:group-hover:text-white shrink-0">
              <span>Start</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Row 2: 140 Questions Half-Mark Drill */}
          <div 
            onClick={() => onLaunchPreset('140_half')}
            className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-[#262626] transition-colors cursor-pointer group"
          >
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-bold text-base sm:text-lg text-zinc-900 dark:text-[#E3E3E3]">140 Questions Endurance Drill</span>
                <span className="rounded-sm border border-sky-800 dark:border-white/45 bg-sky-100 dark:bg-[#22313F] px-2 py-0.5 text-xs font-semibold text-sky-800 dark:text-[#8FAFC4]">
                  0.5 Mark/Q
                </span>
                <span className="rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-100 dark:bg-[#191919] px-2 py-0.5 text-xs font-mono font-bold text-zinc-700 dark:text-[#9B9A97]">
                  Total 70 Marks
                </span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-[#9B9A97] leading-relaxed">
                Half-mark per question endurance set. Rigorous drill covering deep concepts across both physics and chemistry.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-zinc-700 dark:text-[#9B9A97] group-hover:text-zinc-900 dark:group-hover:text-white shrink-0">
              <span>Start</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Row 3: Instant Practice */}
          <div 
            onClick={() => onNavigate('instant')}
            className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-[#262626] transition-colors cursor-pointer group"
          >
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-bold text-base sm:text-lg text-zinc-900 dark:text-[#E3E3E3]">Instant Step-by-Step Practice</span>
                <span className="rounded-sm border border-amber-800 dark:border-white/45 bg-amber-100 dark:bg-[#362D1F] px-2 py-0.5 text-xs font-semibold text-amber-800 dark:text-[#D1B280]">
                  Immediate Feedback
                </span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-[#9B9A97] leading-relaxed">
                Answer question by question. Right/wrong feedback displays immediately with mnemonic rules and memory tips.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-zinc-700 dark:text-[#9B9A97] group-hover:text-zinc-900 dark:group-hover:text-white shrink-0">
              <span>Open</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Row 4: Mistake Notebook */}
          <div 
            onClick={() => onNavigate('mistakes')}
            className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-[#262626] transition-colors cursor-pointer group"
          >
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-bold text-base sm:text-lg text-zinc-900 dark:text-[#E3E3E3]">Mistake Notebook</span>
                {mistakeCount > 0 ? (
                  <span className="rounded-sm border border-rose-800 dark:border-white/50 bg-rose-100 dark:bg-[#3B2825] px-2 py-0.5 text-xs font-mono font-bold text-rose-700 dark:text-[#D18E84]">
                    {mistakeCount} Questions to Master
                  </span>
                ) : (
                  <span className="rounded-sm border border-emerald-800 dark:border-white/45 bg-emerald-100 dark:bg-[#24332C] px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:text-[#85B59A]">
                    Clean
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-600 dark:text-[#9B9A97] leading-relaxed">
                Spaced repetition. Any question you fail in an exam automatically saves here so you can re-test it until 100% correct.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-zinc-700 dark:text-[#9B9A97] group-hover:text-zinc-900 dark:group-hover:text-white shrink-0">
              <span>Review</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Competitive Leaderboard Spotlight Banner (Hidden if student prefers self-paced quiet study) */}
      {!hideLeaderboard && (
        <div 
          onClick={() => onNavigate('leaderboard')}
          className="rounded-md border border-amber-800/80 dark:border-white/45 bg-amber-500/5 dark:bg-[#202020] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-amber-600 dark:hover:border-white transition-all cursor-pointer group"
        >
          <div className="flex items-start sm:items-center gap-4">
            <div className="h-11 w-11 rounded-sm bg-amber-500/10 dark:bg-[#362D1F] border border-amber-600/30 dark:border-white/30 flex items-center justify-center shrink-0 text-amber-600 dark:text-[#D1B280]">
              <Trophy className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg text-zinc-900 dark:text-[#E3E3E3]">
                  State-Wide Scholar Leaderboard
                </span>
                <span className="rounded-sm border border-amber-800/40 dark:border-white/45 bg-amber-100 dark:bg-[#362D1F] px-2 py-0.5 text-xs font-semibold text-amber-800 dark:text-[#D1B280]">
                  Live Standings
                </span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-[#9B9A97]">
                Live rankings based on actual student exam submissions and questions solved. Complete an exam to register your rank!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-bold text-amber-700 dark:text-[#D1B280] group-hover:translate-x-1 transition-transform shrink-0">
            <span>View Rankings</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      )}

      {/* Syllabus Units Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-[#9B9A97]">
            Syllabus Units & Repository
          </span>
          <button
            type="button"
            onClick={() => onNavigate('reading')}
            className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-[#9B9A97] hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Open All in Reading Mode →
          </button>
        </div>

        <div className="overflow-x-auto rounded-md border border-zinc-800 dark:border-white/45 bg-white dark:bg-[#202020]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 dark:border-white/45 text-zinc-600 dark:text-[#9B9A97] font-bold">
                <th className="py-3 px-4 font-semibold">Unit</th>
                <th className="py-3 px-4 font-semibold">Topic</th>
                <th className="py-3 px-4 font-semibold">Subject</th>
                <th className="py-3 px-4 font-semibold text-right">MCQs</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 dark:divide-white/45">
              {UNITS_DATA.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-[#252525] transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-zinc-600 dark:text-[#9B9A97]">{u.code}</td>
                  <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-[#E3E3E3]">{u.name}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block rounded-sm px-2 py-0.5 text-xs font-semibold border ${
                      u.cat === 'Chemistry'
                        ? 'border-amber-800 dark:border-white/45 bg-amber-100 dark:bg-[#362D1F] text-amber-800 dark:text-[#D1B280]'
                        : 'border-sky-800 dark:border-white/45 bg-sky-100 dark:bg-[#22313F] text-sky-800 dark:text-[#8FAFC4]'
                    }`}>
                      {u.cat}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-right text-zinc-700 dark:text-[#9B9A97]">{u.count}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onNavigate('reading', { unit: u.id })}
                      className="rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-100 dark:bg-[#191919] px-2.5 py-1 text-xs font-semibold text-zinc-800 dark:text-[#9B9A97] hover:text-zinc-900 dark:hover:text-[#E3E3E3] hover:border-zinc-900 dark:hover:border-white transition-colors cursor-pointer"
                    >
                      Read
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent History */}
      {history && history.length > 0 && (
        <div className="space-y-4">
          <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-[#9B9A97]">
            Recent Exam Activity
          </div>
          <div className="rounded-md border border-zinc-800 dark:border-white/45 bg-white dark:bg-[#202020] divide-y divide-zinc-800 dark:divide-white/45">
            {history.slice(0, 4).map(item => (
              <div key={item.id} className="p-4 flex items-center justify-between text-sm">
                <div>
                  <div className="font-bold text-zinc-900 dark:text-[#E3E3E3]">{item.title}</div>
                  <div className="text-xs text-zinc-500 dark:text-[#9B9A97]">
                    {new Date(item.id).toLocaleDateString()} • {item.totalQuestions} questions
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-base text-zinc-900 dark:text-[#E3E3E3]">
                    {item.marksObtained} / {item.maxMarks} ({item.percentage}%)
                  </span>
                  <span className={`rounded-sm border px-2 py-0.5 text-xs font-mono font-bold ${
                    item.percentage >= 60 
                      ? 'border-emerald-800 dark:border-white/45 bg-emerald-100 dark:bg-[#24332C] text-emerald-800 dark:text-[#85B59A]'
                      : 'border-rose-800 dark:border-white/45 bg-rose-100 dark:bg-[#3B2825] text-rose-700 dark:text-[#D18E84]'
                  }`}>
                    {item.accuracy}% Acc
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
