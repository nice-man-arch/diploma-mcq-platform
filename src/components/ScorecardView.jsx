// src/components/ScorecardView.jsx
import React, { useState } from 'react';
import { 
  Award, 
  Check, 
  X, 
  RotateCcw, 
  BookOpen, 
  Search, 
  Flame, 
  Printer,
  ChevronRight
} from 'lucide-react';
import MemoryTipCard from './MemoryTipCard';

export default function ScorecardView({
  evaluation,
  onRetestMistakes,
  onNewTest,
  onSwitchToReading
}) {
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'wrong' | 'correct' | 'unattempted'
  const [searchQuery, setSearchQuery] = useState('');

  const {
    totalQuestions,
    markPerQuestion,
    maxMarks,
    marksObtained,
    percentage,
    correctCount,
    wrongCount,
    unattemptedCount,
    accuracy,
    unitStats = [],
    details = []
  } = evaluation;

  const filteredDetails = details.filter((item) => {
    if (filterTab === 'wrong' && (item.isCorrect || !item.isAttempted)) return false;
    if (filterTab === 'correct' && !item.isCorrect) return false;
    if (filterTab === 'unattempted' && item.isAttempted) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchQ = item.question.toLowerCase().includes(q);
      const matchExp = item.explanation.toLowerCase().includes(q);
      const matchTip = (item.memoryTip || '').toLowerCase().includes(q);
      if (!matchQ && !matchExp && !matchTip) return false;
    }
    return true;
  });

  const getStatusBadge = () => {
    if (percentage >= 75) return { label: "Distinction", style: "border-emerald-800 dark:border-white/50 bg-emerald-100 dark:bg-[#24332C] text-emerald-900 dark:text-[#85B59A]" };
    if (percentage >= 50) return { label: "Pass (Second Class)", style: "border-sky-800 dark:border-white/50 bg-sky-100 dark:bg-[#22313F] text-sky-900 dark:text-[#8FAFC4]" };
    if (percentage >= 40) return { label: "Pass Grade", style: "border-amber-800 dark:border-white/50 bg-amber-100 dark:bg-[#362D1F] text-amber-900 dark:text-[#D1B280]" };
    return { label: "Review Required", style: "border-rose-800 dark:border-white/50 bg-rose-100 dark:bg-[#3B2825] text-rose-900 dark:text-[#D18E84]" };
  };

  const status = getStatusBadge();

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-10 text-zinc-900 dark:text-[#E3E3E3]">
      {/* Document Header */}
      <div className="border-b border-zinc-800 dark:border-white/45 pb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-zinc-600 dark:text-[#9B9A97]">
            <span className="font-mono font-bold">SCORECARD REPORT</span>
            <span>•</span>
            <span className="font-semibold">Diploma Applied Science</span>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            title="Print or export PDF"
            className="rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-100 dark:bg-[#202020] px-3 py-1.5 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-[#9B9A97] hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </button>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-[#E3E3E3] tracking-tight">
          Exam Performance Summary
        </h1>

        {/* Primary Metric Strip */}
        <div className="flex flex-wrap items-baseline gap-5 pt-2">
          <div className="flex items-baseline gap-2.5">
            <span className="text-4xl sm:text-5xl font-mono font-extrabold text-zinc-900 dark:text-[#E3E3E3]">{marksObtained}</span>
            <span className="text-base sm:text-lg font-mono font-semibold text-zinc-500 dark:text-[#6F6E6B]">/ {maxMarks} Marks</span>
          </div>

          <span className={`rounded-sm border px-3 py-1 text-sm font-mono font-bold ${status.style}`}>
            {percentage}% — {status.label}
          </span>
        </div>
      </div>

      {/* Metrics Table Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-zinc-800 dark:divide-white/45 rounded-md border border-zinc-800 dark:border-white/50 bg-white dark:bg-[#202020] text-sm overflow-hidden">
        <div className="p-4 sm:p-5 text-center">
          <div className="text-xs font-bold uppercase text-zinc-600 dark:text-[#9B9A97]">Accuracy</div>
          <div className="mt-1.5 text-2xl sm:text-3xl font-mono font-extrabold text-zinc-900 dark:text-[#E3E3E3]">{accuracy}%</div>
        </div>
        <div className="p-4 sm:p-5 text-center">
          <div className="text-xs font-bold uppercase text-emerald-700 dark:text-[#85B59A]">Correct</div>
          <div className="mt-1.5 text-2xl sm:text-3xl font-mono font-extrabold text-emerald-700 dark:text-[#85B59A]">{correctCount}</div>
        </div>
        <div className="p-4 sm:p-5 text-center">
          <div className="text-xs font-bold uppercase text-rose-700 dark:text-[#D18E84]">Wrong</div>
          <div className="mt-1.5 text-2xl sm:text-3xl font-mono font-extrabold text-rose-700 dark:text-[#D18E84]">{wrongCount}</div>
        </div>
        <div className="p-4 sm:p-5 text-center">
          <div className="text-xs font-bold uppercase text-zinc-600 dark:text-[#9B9A97]">Unattempted</div>
          <div className="mt-1.5 text-2xl sm:text-3xl font-mono font-extrabold text-zinc-500 dark:text-[#6F6E6B]">{unattemptedCount}</div>
        </div>
      </div>

      {/* Action Buttons Strip */}
      <div className="flex flex-wrap items-center gap-3">
        {wrongCount > 0 && (
          <button
            type="button"
            onClick={onRetestMistakes}
            className="rounded-sm border border-rose-800 dark:border-white/50 bg-rose-100 dark:bg-[#3B2825] px-4 py-2.5 text-sm sm:text-base font-bold text-rose-800 dark:text-[#D18E84] hover:bg-rose-200 dark:hover:bg-[#47302C] transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Flame className="h-4 w-4" />
            <span>Drill {wrongCount} Missed Questions Now</span>
          </button>
        )}

        <button
          type="button"
          onClick={onNewTest}
          className="rounded-sm border border-zinc-800 dark:border-white/45 bg-white dark:bg-[#202020] px-4 py-2.5 text-sm sm:text-base font-semibold text-zinc-900 dark:text-[#E3E3E3] hover:bg-zinc-100 dark:hover:bg-[#282828] dark:hover:border-white transition-colors flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw className="h-4 w-4 text-zinc-600 dark:text-[#9B9A97]" />
          <span>Take New Exam</span>
        </button>

        <button
          type="button"
          onClick={onSwitchToReading}
          className="rounded-sm border border-zinc-800 dark:border-white/45 bg-white dark:bg-[#202020] px-4 py-2.5 text-sm sm:text-base font-semibold text-zinc-700 dark:text-[#9B9A97] hover:text-zinc-900 dark:hover:text-[#E3E3E3] hover:bg-zinc-100 dark:hover:bg-[#282828] dark:hover:border-white transition-colors flex items-center gap-2 cursor-pointer"
        >
          <BookOpen className="h-4 w-4 text-emerald-600 dark:text-[#85B59A]" />
          <span>Switch to Reading Mode</span>
        </button>
      </div>

      {/* Unit-Wise Mastery */}
      {unitStats.length > 0 && (
        <div className="space-y-4">
          <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-[#9B9A97]">
            Unit-Wise Performance
          </div>

          <div className="rounded-md border border-zinc-800 dark:border-white/45 bg-white dark:bg-[#202020] divide-y divide-zinc-800 dark:divide-white/45 p-3">
            {unitStats.map(stat => {
              const uPct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
              return (
                <div key={stat.unit} className="p-3.5 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-900 dark:text-[#E3E3E3] font-bold">{stat.unitName}</span>
                    <span className="font-mono font-semibold text-zinc-600 dark:text-[#9B9A97]">
                      {stat.correct}/{stat.total} ({uPct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-zinc-200 dark:bg-[#191919] rounded-xs overflow-hidden border border-zinc-800 dark:border-white/30">
                    <div
                      className={`h-full ${uPct >= 70 ? 'bg-emerald-600 dark:bg-[#85B59A]' : uPct >= 40 ? 'bg-amber-500 dark:bg-[#D1B280]' : 'bg-rose-500 dark:bg-[#D18E84]'}`}
                      style={{ width: `${uPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed Answer Key */}
      <div className="space-y-5 pt-6 border-t border-zinc-800 dark:border-white/45">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-[#E3E3E3]">
              Answer Key & Memory Methods
            </h2>
            <p className="text-sm text-zinc-600 dark:text-[#9B9A97]">
              Review questions, selected answers, and core memorization rules
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500 dark:text-[#9B9A97]" />
            <input
              type="text"
              placeholder="Search in answer key..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#202020] py-2 pl-9 pr-3 text-sm text-zinc-900 dark:text-[#E3E3E3] focus:border-zinc-900 dark:focus:border-white focus:outline-hidden"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          {[
            { id: 'all', label: `All (${details.length})` },
            { id: 'wrong', label: `Missed (${wrongCount})` },
            { id: 'correct', label: `Correct (${correctCount})` },
            { id: 'unattempted', label: `Skipped (${unattemptedCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterTab(tab.id)}
              className={`rounded-sm border px-3.5 py-1.5 font-bold transition-all cursor-pointer ${
                filterTab === tab.id
                  ? 'border-zinc-950 dark:border-white bg-zinc-900 dark:bg-[#282828] text-white dark:text-[#E3E3E3]'
                  : 'border-zinc-800 dark:border-white/45 bg-white dark:bg-[#191919] text-zinc-600 dark:text-[#9B9A97] hover:border-zinc-950 dark:hover:border-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Question Cards List */}
        <div className="space-y-4">
          {filteredDetails.length === 0 ? (
            <div className="rounded-md border border-zinc-800 dark:border-white/45 bg-white dark:bg-[#202020] p-10 text-center text-sm text-zinc-500 dark:text-[#9B9A97]">
              No questions found matching this filter.
            </div>
          ) : (
            filteredDetails.map((item) => {
              const options = item.options || {};
              return (
                <div
                  key={item.id}
                  className="rounded-md border border-zinc-800 dark:border-white/50 bg-white dark:bg-[#202020] p-5 sm:p-6 text-sm space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 dark:border-white/45 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-zinc-900 dark:text-[#E3E3E3] font-bold text-base">Q{item.index}.</span>
                      <span className="text-zinc-600 dark:text-[#9B9A97] font-semibold">{item.unitName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.isCorrect ? (
                        <span className="inline-flex items-center gap-1 rounded-sm border border-emerald-800 dark:border-white/45 bg-emerald-100 dark:bg-[#24332C] px-2 py-0.5 text-xs font-bold text-emerald-900 dark:text-[#85B59A]">
                          <Check className="h-3.5 w-3.5 stroke-[3]" /> Correct (+{item.markPerQuestion})
                        </span>
                      ) : item.isAttempted ? (
                        <span className="inline-flex items-center gap-1 rounded-sm border border-rose-800 dark:border-white/45 bg-rose-100 dark:bg-[#3B2825] px-2 py-0.5 text-xs font-bold text-rose-900 dark:text-[#D18E84]">
                          <X className="h-3.5 w-3.5 stroke-[3]" /> Missed (0)
                        </span>
                      ) : (
                        <span className="rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-100 dark:bg-[#191919] px-2 py-0.5 text-xs font-mono font-medium text-zinc-500 dark:text-[#6F6E6B]">
                          Skipped
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-[#E3E3E3] leading-relaxed">
                    {item.question}
                  </h3>

                  {/* Options readout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {['A', 'B', 'C', 'D'].map(key => {
                      const text = options[key];
                      if (!text) return null;
                      const isCorrectChoice = item.answer === key;
                      const isUserChoice = item.userAnswer === key;

                      let optStyle = "border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#191919] text-zinc-800 dark:text-[#9B9A97]";
                      if (isCorrectChoice) {
                        optStyle = "border-emerald-700 dark:border-emerald-400 bg-emerald-50 dark:bg-[#24332C] text-emerald-950 dark:text-[#85B59A] font-bold";
                      } else if (isUserChoice) {
                        optStyle = "border-rose-700 dark:border-rose-400 bg-rose-50 dark:bg-[#3B2825] text-rose-950 dark:text-[#D18E84] font-bold line-through";
                      }

                      return (
                        <div
                          key={key}
                          className={`rounded-sm border p-2.5 text-xs sm:text-sm flex items-start gap-2.5 ${optStyle}`}
                        >
                          <span className="font-mono font-bold shrink-0">{key}.</span>
                          <span className="flex-1">{text}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Memory Tip & Explanation */}
                  {(item.memoryTip || item.explanation) && (
                    <MemoryTipCard
                      tip={item.memoryTip}
                      explanation={item.explanation}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
