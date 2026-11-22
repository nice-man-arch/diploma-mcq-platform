// src/components/QuestionCard.jsx
import React from 'react';
import { Bookmark, Check, X } from 'lucide-react';
import MemoryTipCard from './MemoryTipCard';

export default function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  markPerQuestion = 1.0,
  selectedOption,
  onSelectOption,
  isInstantMode = false,
  showAnswer = false,
  isBookmarked = false,
  onToggleBookmark
}) {
  if (!question) return null;

  const options = question.activeOptions || question.options || {};
  const isAnswered = Boolean(selectedOption);
  const isCorrect = isAnswered && selectedOption === question.answer;

  const difficultyBadges = {
    easy: 'bg-emerald-100 text-emerald-900 border-emerald-800 dark:bg-[#24332C] dark:text-[#85B59A] dark:border-white/45',
    normal: 'bg-sky-100 text-sky-900 border-sky-800 dark:bg-[#22313F] dark:text-[#8FAFC4] dark:border-white/45',
    hard: 'bg-rose-100 text-rose-900 border-rose-800 dark:bg-[#3B2825] dark:text-[#D18E84] dark:border-white/45'
  };

  return (
    <div className="rounded-md border border-zinc-800 dark:border-white/50 bg-white dark:bg-[#202020] p-6 sm:p-8 text-zinc-900 dark:text-[#E3E3E3] shadow-xs">
      {/* Meta Top Line */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 dark:border-white/45 pb-4 sm:pb-5">
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <span className="rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-100 dark:bg-[#191919] px-2.5 py-1 text-xs sm:text-sm font-mono font-bold text-zinc-900 dark:text-[#E3E3E3]">
            Q{questionIndex !== undefined ? questionIndex + 1 : question.qNum}
            {totalQuestions ? `/${totalQuestions}` : ''}
          </span>
          <span className="rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-100 dark:bg-[#191919] px-2.5 py-1 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-[#9B9A97]">
            {question.unitName || `Unit ${question.unit}`}
          </span>
          <span className={`rounded-sm border px-2.5 py-1 text-xs sm:text-sm font-bold capitalize ${difficultyBadges[question.difficulty] || difficultyBadges.normal}`}>
            {question.difficulty || 'Normal'}
          </span>
          <span className="rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-100 dark:bg-[#191919] px-2.5 py-1 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-[#9B9A97]">
            {markPerQuestion} Mark{markPerQuestion === 1 ? '' : 's'}
          </span>
        </div>

        {onToggleBookmark && (
          <button
            type="button"
            onClick={() => onToggleBookmark(question.id)}
            title={isBookmarked ? "Remove Bookmark" : "Bookmark Question"}
            className={`rounded-sm p-2 transition-colors cursor-pointer border ${
              isBookmarked
                ? 'text-amber-700 bg-amber-100 border-amber-700 dark:text-[#D1B280] dark:bg-[#362D1F] dark:border-white/50'
                : 'text-zinc-500 border-zinc-800 dark:border-white/45 dark:text-[#9B9A97] hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#262626]'
            }`}
          >
            <Bookmark className={`h-4 w-4 sm:h-5 sm:w-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Question Prompt - Big, Bold, Highly Legible */}
      <div className="my-6 sm:my-8">
        <h2 className="text-xl sm:text-2xl font-bold leading-relaxed text-zinc-900 dark:text-[#E3E3E3] tracking-tight select-text">
          {question.question}
        </h2>
      </div>

      {/* Options List */}
      <div className="space-y-3 sm:space-y-3.5">
        {['A', 'B', 'C', 'D'].map((key) => {
          const optText = options[key];
          if (!optText) return null;

          const isSelected = selectedOption === key;
          const isTargetCorrect = question.answer === key;

          let containerStyle = "border-zinc-800 dark:border-white/45 bg-zinc-50/60 dark:bg-[#191919] text-zinc-900 dark:text-[#E3E3E3] hover:bg-zinc-100 dark:hover:bg-[#242424] hover:border-zinc-950 dark:hover:border-white";
          let keyStyle = "border-zinc-800 dark:border-white/45 bg-zinc-200 dark:bg-[#242424] text-zinc-800 dark:text-[#9B9A97]";

          if (isInstantMode && isAnswered) {
            if (isTargetCorrect) {
              containerStyle = "border-emerald-700 dark:border-emerald-400 bg-emerald-50 dark:bg-[#24332C] text-emerald-950 dark:text-[#85B59A]";
              keyStyle = "border-emerald-800 dark:border-emerald-400 bg-emerald-200 dark:bg-[#1B2621] text-emerald-900 dark:text-[#85B59A]";
            } else if (isSelected && !isCorrect) {
              containerStyle = "border-rose-700 dark:border-rose-400 bg-rose-50 dark:bg-[#3B2825] text-rose-950 dark:text-[#D18E84]";
              keyStyle = "border-rose-800 dark:border-rose-400 bg-rose-200 dark:bg-[#2B1D1B] text-rose-900 dark:text-[#D18E84]";
            } else {
              containerStyle = "border-zinc-800/40 dark:border-white/20 bg-zinc-50 dark:bg-[#191919] opacity-40 text-zinc-400 dark:text-[#6F6E6B]";
              keyStyle = "border-zinc-800/40 dark:border-white/20 bg-zinc-100 dark:bg-[#1C1C1C] text-zinc-400 dark:text-[#6F6E6B]";
            }
          } else if (showAnswer) {
            if (isTargetCorrect) {
              containerStyle = "border-emerald-700 dark:border-emerald-400 bg-emerald-50 dark:bg-[#24332C] text-emerald-950 dark:text-[#85B59A]";
              keyStyle = "border-emerald-800 dark:border-emerald-400 bg-emerald-200 dark:bg-[#1B2621] text-emerald-900 dark:text-[#85B59A]";
            } else if (isSelected) {
              containerStyle = "border-rose-700 dark:border-rose-400 bg-rose-50 dark:bg-[#3B2825] text-rose-950 dark:text-[#D18E84]";
              keyStyle = "border-rose-800 dark:border-rose-400 bg-rose-200 dark:bg-[#2B1D1B] text-rose-900 dark:text-[#D18E84]";
            }
          } else if (isSelected) {
            containerStyle = "border-zinc-950 dark:border-white bg-zinc-200/80 dark:bg-[#2B2B2B] text-zinc-950 dark:text-white font-medium ring-1 ring-zinc-950 dark:ring-white";
            keyStyle = "border-zinc-950 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-[#191919] font-bold";
          }

          return (
            <button
              key={key}
              type="button"
              disabled={isInstantMode && isAnswered}
              onClick={() => onSelectOption && onSelectOption(key)}
              className={`w-full text-left rounded-md border p-4 sm:p-4.5 text-base sm:text-lg transition-all flex items-start gap-3 sm:gap-4 cursor-pointer disabled:cursor-default ${containerStyle}`}
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border text-sm font-mono font-bold ${keyStyle}`}>
                {(isInstantMode || showAnswer) && isTargetCorrect ? (
                  <Check className="h-4 w-4 stroke-[2.5]" />
                ) : (isInstantMode || showAnswer) && isSelected && !isCorrect ? (
                  <X className="h-4 w-4 stroke-[2.5]" />
                ) : (
                  key
                )}
              </div>

              <div className="flex-1 pt-0.5 leading-snug">
                {optText}
              </div>

              {isInstantMode && isAnswered && isTargetCorrect && (
                <span className="self-center rounded-sm border border-emerald-800 dark:border-emerald-400 bg-emerald-100 dark:bg-[#1B2621] px-2.5 py-1 text-xs font-bold text-emerald-900 dark:text-[#85B59A]">
                  Correct
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Instant Feedback: Answer & Memory Tip */}
      {isInstantMode && isAnswered && (
        <MemoryTipCard
          question={question}
          isCorrect={isCorrect}
          userSelected={selectedOption}
        />
      )}
    </div>
  );
}
