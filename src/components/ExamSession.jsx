// src/components/ExamSession.jsx
import React, { useState, useEffect } from 'react';
import { 
  Timer, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  LayoutGrid, 
  X,
  AlertCircle
} from 'lucide-react';
import QuestionCard from './QuestionCard';

export default function ExamSession({
  questions,
  markPerQuestion = 1.0,
  durationMinutes = 70,
  isTimed = true,
  isInstantMode = false,
  onCompleteExam,
  onExitExam,
  isBookmarked,
  onToggleBookmark
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [visitedIndices, setVisitedIndices] = useState(new Set([0]));
  const [showPalette, setShowPalette] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const initialSeconds = durationMinutes ? durationMinutes * 60 : 70 * 60;
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    setVisitedIndices(prev => new Set([...prev, currentIndex]));
  }, [currentIndex]);

  useEffect(() => {
    if (!isTimed) return;
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitFinal();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimed]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || showSubmitModal) return;
      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key) && currentQ) {
        handleSelectOption(key);
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentQ, userAnswers, showSubmitModal]);

  const handleSelectOption = (optKey) => {
    if (!currentQ) return;
    setUserAnswers(prev => ({ ...prev, [currentQ.id]: optKey }));
  };

  const handleClearResponse = () => {
    if (!currentQ) return;
    setUserAnswers(prev => {
      const copy = { ...prev };
      delete copy[currentQ.id];
      return copy;
    });
  };

  const handleToggleReview = () => {
    if (!currentQ) return;
    setMarkedForReview(prev => {
      const copy = new Set(prev);
      if (copy.has(currentQ.id)) copy.delete(currentQ.id);
      else copy.add(currentQ.id);
      return copy;
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleSubmitFinal = () => {
    setShowSubmitModal(false);
    onCompleteExam({
      questions,
      userAnswers,
      markPerQuestion,
      timeTakenSeconds: initialSeconds - secondsLeft
    });
  };

  const formatTime = (totalSec) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(userAnswers).length;
  const unansweredCount = questions.length - answeredCount;
  const reviewCount = markedForReview.size;

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-6 text-zinc-900 dark:text-[#E3E3E3]">
      {/* Top Session Bar */}
      <div className="rounded-md border border-zinc-800 dark:border-white/50 bg-white dark:bg-[#202020] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExitExam}
            className="rounded-sm border border-zinc-800 dark:border-white/45 px-3 py-1.5 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-[#9B9A97] hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#282828] transition-colors"
          >
            ← Exit
          </button>
          <div>
            <div className="font-bold text-base sm:text-lg text-zinc-900 dark:text-[#E3E3E3]">
              Question {currentIndex + 1} of {questions.length}
            </div>
            <div className="text-xs text-zinc-500 dark:text-[#9B9A97]">
              {answeredCount} Answered • {unansweredCount} Left
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Palette Toggle */}
          <button
            type="button"
            onClick={() => setShowPalette(!showPalette)}
            className="md:hidden rounded-sm border border-zinc-800 dark:border-white/45 p-2 text-zinc-700 dark:text-[#9B9A97]"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>

          {isTimed && (
            <div className={`flex items-center gap-2 rounded-sm border px-3 py-1.5 text-sm sm:text-base font-mono font-bold ${
              secondsLeft < 300 
                ? 'border-rose-800 dark:border-white/50 bg-rose-100 dark:bg-[#3B2825] text-rose-800 dark:text-[#D18E84]' 
                : 'border-zinc-800 dark:border-white/45 bg-zinc-100 dark:bg-[#202020] text-zinc-800 dark:text-[#E3E3E3]'
            }`}>
              <Timer className="h-4 w-4" />
              <span>{formatTime(secondsLeft)}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="rounded-sm border border-zinc-900 dark:border-white/60 bg-zinc-900 dark:bg-[#E3E3E3] px-4 py-2 text-xs sm:text-sm font-bold text-white dark:text-[#191919] hover:bg-zinc-800 dark:hover:bg-white transition-colors cursor-pointer"
          >
            Submit Exam
          </button>
        </div>
      </div>

      {/* Main Grid: Left Question, Right Palette */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Question Area */}
        <div className="md:col-span-8 lg:col-span-9 space-y-4">
          <QuestionCard
            question={currentQ}
            questionIndex={currentIndex}
            totalQuestions={questions.length}
            markPerQuestion={markPerQuestion}
            selectedOption={currentQ ? userAnswers[currentQ.id] : null}
            onSelectOption={handleSelectOption}
            isInstantMode={isInstantMode}
            isBookmarked={currentQ ? isBookmarked(currentQ.id) : false}
            onToggleBookmark={onToggleBookmark}
          />

          {/* Bottom Action Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 dark:border-white/45 pt-4 sm:pt-5 text-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={handlePrev}
                className="flex items-center gap-1.5 rounded-sm border border-zinc-800 dark:border-white/45 bg-white dark:bg-[#202020] px-3.5 py-2 text-sm font-semibold text-zinc-700 dark:text-[#9B9A97] hover:text-zinc-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Prev</span>
              </button>

              <button
                type="button"
                onClick={handleToggleReview}
                className={`flex items-center gap-2 rounded-sm border px-3.5 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                  currentQ && markedForReview.has(currentQ.id)
                    ? 'border-amber-800 dark:border-white/50 bg-amber-100 dark:bg-[#362D1F] text-amber-900 dark:text-[#D1B280]'
                    : 'border-zinc-800 dark:border-white/45 bg-white dark:bg-[#202020] text-zinc-700 dark:text-[#9B9A97] hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Flag className={`h-4 w-4 ${currentQ && markedForReview.has(currentQ.id) ? 'fill-current' : ''}`} />
                <span>{currentQ && markedForReview.has(currentQ.id) ? 'Flagged' : 'Flag for review'}</span>
              </button>

              {currentQ && userAnswers[currentQ.id] && !isInstantMode && (
                <button
                  type="button"
                  onClick={handleClearResponse}
                  className="rounded-sm px-2.5 py-1.5 text-xs sm:text-sm font-medium text-zinc-500 dark:text-[#6F6E6B] hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex === questions.length - 1}
              className="flex items-center gap-1.5 rounded-sm border border-zinc-900 dark:border-white/60 bg-zinc-900 dark:bg-[#282828] px-5 py-2 font-bold text-white dark:text-[#E3E3E3] hover:bg-zinc-800 dark:hover:bg-[#303030] dark:hover:border-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right Palette */}
        <div
          className={`md:col-span-4 lg:col-span-3 ${
            showPalette ? 'fixed inset-0 z-50 bg-black/70 p-4 flex justify-end md:static md:p-0 md:bg-transparent' : 'hidden md:block'
          }`}
        >
          <div className="w-full max-w-sm md:max-w-none rounded-md border border-zinc-800 dark:border-white/45 bg-white dark:bg-[#202020] p-5 text-sm">
            <div className="flex items-center justify-between border-b border-zinc-800 dark:border-white/45 pb-3">
              <span className="font-bold text-zinc-900 dark:text-[#E3E3E3]">Questions Palette</span>
              <span className="font-mono font-bold text-zinc-700 dark:text-[#9B9A97]">{answeredCount}/{questions.length}</span>
              <button
                type="button"
                onClick={() => setShowPalette(false)}
                className="md:hidden text-zinc-600 dark:text-[#9B9A97]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Compact Legend */}
            <div className="my-3 grid grid-cols-2 gap-2 text-xs text-zinc-600 dark:text-[#9B9A97]">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-emerald-600 dark:bg-[#85B59A] border border-zinc-800 dark:border-white/45" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-zinc-200 dark:bg-[#191919] border border-zinc-800 dark:border-white/45" />
                <span>Unanswered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-amber-500 dark:bg-[#D1B280] border border-zinc-800 dark:border-white/45" />
                <span>Flagged ({reviewCount})</span>
              </div>
            </div>

            {/* Questions Grid */}
            <div className="mt-3 overflow-y-auto max-h-[55vh] pr-1 grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isSelected = currentIndex === idx;
                const isAns = Boolean(userAnswers[q.id]);
                const isRev = markedForReview.has(q.id);
                const isVis = visitedIndices.has(idx);

                let cellStyle = "border-zinc-800 dark:border-white/45 bg-zinc-100 dark:bg-[#191919] text-zinc-700 dark:text-[#9B9A97]";
                if (isAns && isRev) {
                  cellStyle = "border-amber-800 dark:border-white/50 bg-amber-200 dark:bg-[#362D1F] text-amber-900 dark:text-[#D1B280] font-bold";
                } else if (isAns) {
                  cellStyle = "border-emerald-800 dark:border-white/50 bg-emerald-200 dark:bg-[#24332C] text-emerald-950 dark:text-[#85B59A] font-bold";
                } else if (isRev) {
                  cellStyle = "border-amber-800 dark:border-white/50 bg-amber-100 dark:bg-[#362D1F] text-amber-900 dark:text-[#D1B280]";
                } else if (isVis) {
                  cellStyle = "border-zinc-800 dark:border-white/45 bg-zinc-200/80 dark:bg-[#282828] text-zinc-800 dark:text-[#E3E3E3]";
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowPalette(false);
                    }}
                    className={`h-8 w-full rounded-xs border text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center ${cellStyle} ${
                      isSelected ? 'ring-2 ring-zinc-950 dark:ring-white scale-105' : 'hover:border-zinc-950 dark:hover:border-white'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
          <div className="w-full max-w-md rounded-md border-2 border-zinc-900 dark:border-white/60 bg-white dark:bg-[#202020] p-6 text-sm space-y-5">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-[#D1B280]" />
              <h4 className="font-bold text-lg text-zinc-900 dark:text-[#E3E3E3]">
                Submit Examination?
              </h4>
            </div>

            <div className="space-y-2 rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#191919] p-4 text-xs sm:text-sm font-mono font-semibold">
              <div className="flex justify-between text-emerald-700 dark:text-[#85B59A]">
                <span>Answered:</span>
                <span>{answeredCount}</span>
              </div>
              <div className="flex justify-between text-rose-700 dark:text-[#D18E84]">
                <span>Unanswered:</span>
                <span>{unansweredCount}</span>
              </div>
              <div className="flex justify-between text-amber-700 dark:text-[#D1B280]">
                <span>Flagged for Review:</span>
                <span>{reviewCount}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-100 dark:bg-[#191919] px-4 py-2 font-semibold text-zinc-700 dark:text-[#9B9A97] hover:text-zinc-900 dark:hover:text-white"
              >
                Keep Testing
              </button>
              <button
                type="button"
                onClick={handleSubmitFinal}
                className="rounded-sm border border-zinc-900 dark:border-white/60 bg-zinc-900 dark:bg-[#E3E3E3] px-5 py-2 font-bold text-white dark:text-[#191919] hover:bg-zinc-800 dark:hover:bg-white cursor-pointer"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
