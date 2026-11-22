// src/components/MistakeNotebook.jsx
import React, { useState } from 'react';
import { 
  Flame, 
  Trash2, 
  Search, 
  Check, 
  Play, 
  BookOpen 
} from 'lucide-react';
import MemoryTipCard from './MemoryTipCard';

export default function MistakeNotebook({
  mistakes,
  bank,
  onLaunchMistakeDrill,
  onRemoveMistake,
  onClearAll,
  onSwitchToReading
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const bankMap = new Map(bank.map(q => [q.id, q]));

  const mistakeQuestions = mistakes
    .map(m => {
      const q = bankMap.get(m.id);
      if (!q) return null;
      return {
        ...q,
        mistakeCount: m.count || 1,
        lastSelected: m.lastSelected,
        lastFailedAt: m.lastFailedAt
      };
    })
    .filter(Boolean);

  const filtered = mistakeQuestions.filter(q => {
    if (!searchQuery.trim()) return true;
    const s = searchQuery.toLowerCase();
    return q.question.toLowerCase().includes(s) ||
           q.unitName.toLowerCase().includes(s) ||
           (q.memoryTip || '').toLowerCase().includes(s);
  });

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8 text-zinc-900 dark:text-[#E3E3E3]">
      {/* Header */}
      <div className="border-b border-zinc-800 dark:border-white/45 pb-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs sm:text-sm text-zinc-600 dark:text-[#9B9A97] font-mono font-bold">
            SPACED REPETITION DRILL
          </div>

          {mistakeQuestions.length > 0 && (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onLaunchMistakeDrill}
                className="rounded-sm border border-zinc-900 dark:border-white/60 bg-zinc-900 dark:bg-[#E3E3E3] px-4 py-2 text-xs sm:text-sm font-bold text-white dark:text-[#191919] hover:bg-zinc-800 dark:hover:bg-white transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Drill {mistakeQuestions.length} Mistakes</span>
              </button>
              <button
                type="button"
                onClick={onClearAll}
                title="Clear notebook"
                className="rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-100 dark:bg-[#202020] p-2 text-zinc-600 dark:text-[#9B9A97] hover:text-rose-600 dark:hover:text-[#D18E84] transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-[#E3E3E3] tracking-tight">
          Mistake Notebook
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-[#9B9A97]">
          Every question answered incorrectly is logged here automatically. Review memory methods and re-test until your mistake list is clear.
        </p>

        {mistakeQuestions.length > 0 && (
          <div className="relative pt-2">
            <Search className="absolute left-3 top-5 h-4 w-4 text-zinc-500 dark:text-[#9B9A97]" />
            <input
              type="text"
              placeholder="Search in missed questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#202020] py-2.5 pl-9 pr-3 text-xs sm:text-sm text-zinc-900 dark:text-[#E3E3E3] focus:border-zinc-950 dark:focus:border-white focus:outline-hidden"
            />
          </div>
        )}
      </div>

      {/* Mistake List */}
      <div className="space-y-5">
        {mistakeQuestions.length === 0 ? (
          <div className="rounded-md border border-zinc-800 dark:border-white/45 bg-white dark:bg-[#202020] p-12 text-center text-sm text-zinc-500 dark:text-[#9B9A97] space-y-4">
            <div className="text-lg font-bold text-zinc-900 dark:text-[#E3E3E3]">
              Zero Mistakes Logged
            </div>
            <p className="max-w-md mx-auto text-zinc-600 dark:text-[#9B9A97] leading-relaxed">
              Any question you get wrong in an exam will appear here automatically with its memory hack for targeted practice.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onSwitchToReading}
                className="rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-100 dark:bg-[#191919] px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-[#E3E3E3] hover:bg-zinc-200 dark:hover:bg-[#282828] transition-colors cursor-pointer"
              >
                Browse Reading Mode
              </button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-md border border-zinc-800 dark:border-white/45 bg-white dark:bg-[#202020] p-10 text-center text-sm text-zinc-500 dark:text-[#9B9A97]">
            No missed questions matching "{searchQuery}".
          </div>
        ) : (
          filtered.map((q) => {
            const options = q.options || {};
            return (
              <div
                key={q.id}
                className="rounded-md border border-zinc-800 dark:border-white/50 bg-white dark:bg-[#202020] p-5 sm:p-6 text-sm space-y-4 shadow-xs"
              >
                {/* Meta */}
                <div className="flex items-center justify-between border-b border-zinc-800 dark:border-white/45 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="rounded-sm border border-rose-800 dark:border-white/45 bg-rose-100 dark:bg-[#3B2825] px-2 py-0.5 text-xs font-mono font-bold text-rose-800 dark:text-[#D18E84]">
                      Missed {q.mistakeCount}×
                    </span>
                    <span className="text-zinc-600 dark:text-[#9B9A97] font-semibold">{q.unitName}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveMistake(q.id)}
                    className="flex items-center gap-1.5 rounded-sm border border-emerald-800 dark:border-white/45 bg-emerald-50 dark:bg-[#24332C] px-2.5 py-1 text-xs font-bold text-emerald-900 dark:text-[#85B59A] hover:bg-emerald-100 dark:hover:bg-[#2C3E36] transition-colors cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                    <span>Mastered</span>
                  </button>
                </div>

                {/* Question */}
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-[#E3E3E3] leading-relaxed">
                  {q.question}
                </h3>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {['A', 'B', 'C', 'D'].map((optKey) => {
                    const text = options[optKey];
                    if (!text) return null;
                    const isTarget = q.answer === optKey;
                    const wasPicked = q.lastSelected === optKey;

                    let style = "border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#191919] text-zinc-700 dark:text-[#9B9A97]";
                    if (isTarget) {
                      style = "border-emerald-700 dark:border-emerald-400 bg-emerald-50 dark:bg-[#24332C] text-emerald-950 dark:text-[#85B59A] font-bold";
                    } else if (wasPicked) {
                      style = "border-rose-700 dark:border-rose-400 bg-rose-50 dark:bg-[#3B2825] text-rose-950 dark:text-[#D18E84] font-bold line-through";
                    }

                    return (
                      <div key={optKey} className={`rounded-sm border p-3 text-sm flex items-start gap-2.5 ${style}`}>
                        <span className="font-mono font-bold">{optKey})</span>
                        <span className="flex-1">{text}</span>
                        {isTarget && <span className="text-xs uppercase font-mono font-bold">✓ Answer</span>}
                        {wasPicked && <span className="text-xs uppercase font-mono font-bold">Your choice</span>}
                      </div>
                    );
                  })}
                </div>

                <MemoryTipCard
                  tip={q.memoryTip}
                  explanation={q.explanation}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
