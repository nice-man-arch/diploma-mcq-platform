// src/components/ExamSetupModal.jsx
import React, { useState } from 'react';
import { X, Check, Sliders, Timer, Zap } from 'lucide-react';

const UNITS = [
  { id: 1, name: "Unit 1: Units, Measurements & Vectors", count: 298 },
  { id: 2, name: "Unit 2: Electricity & Magnetism", count: 198 },
  { id: 3, name: "Unit 3: Waves & Oscillations", count: 150 },
  { id: 4, name: "Unit 4: Optics & Modern Physics", count: 200 },
  { id: 5, name: "Unit 5: Thermometry & Heat Transfer", count: 100 },
  { id: 6, name: "Unit 6: Electrochemistry, Redox & Metals", count: 100 },
];

export default function ExamSetupModal({ isOpen, onClose, onStartExam }) {
  if (!isOpen) return null;

  const [examType, setExamType] = useState('70_marks');
  const [difficulty, setDifficulty] = useState('all');
  const [distractorMode, setDistractorMode] = useState('challenger');
  const [selectedUnits, setSelectedUnits] = useState([1, 2, 3, 4, 5, 6]);
  const [isTimed, setIsTimed] = useState(true);

  const toggleUnit = (unitId) => {
    if (selectedUnits.includes(unitId)) {
      if (selectedUnits.length > 1) {
        setSelectedUnits(selectedUnits.filter(u => u !== unitId));
      }
    } else {
      setSelectedUnits([...selectedUnits, unitId]);
    }
  };

  const selectAllUnits = () => setSelectedUnits([1, 2, 3, 4, 5, 6]);

  const handleLaunch = () => {
    let totalQuestions = 70;
    let markPerQuestion = 1.0;
    let durationMinutes = 70;
    let title = '70 Marks Board Exam';

    if (examType === '70_marks') {
      totalQuestions = 70;
      markPerQuestion = 1.0;
      durationMinutes = 70;
      title = '70 Marks Board Exam';
    } else if (examType === '140_half') {
      totalQuestions = 140;
      markPerQuestion = 0.5;
      durationMinutes = 120;
      title = '140 Questions (Half-Mark Drill)';
    } else if (examType === '140_full') {
      totalQuestions = 140;
      markPerQuestion = 1.0;
      durationMinutes = 140;
      title = '140 Marks Full Mock';
    } else if (examType === 'quick_25') {
      totalQuestions = 25;
      markPerQuestion = 1.0;
      durationMinutes = 25;
      title = '25 Questions Quick Sprint';
    }

    onStartExam({
      totalCount: totalQuestions,
      markPerQuestion,
      difficulty,
      distractorMode,
      selectedUnits,
      isTimed,
      durationMinutes: isTimed ? durationMinutes : null,
      title
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
      <div className="w-full max-w-2xl rounded-md border-2 border-zinc-900 dark:border-white/60 bg-white dark:bg-[#202020] text-zinc-900 dark:text-[#E3E3E3] p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 dark:border-white/45 pb-4">
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-[#E3E3E3]">
              Configure Exam Session
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-[#9B9A97]">
              Sampled randomly without repetition from 1,046 verified syllabus questions
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-sm border border-zinc-800 dark:border-white/45 p-1.5 text-zinc-600 dark:text-[#9B9A97] hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#282828] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-6 text-sm">
          {/* Preset Selector */}
          <div>
            <label className="font-bold uppercase tracking-wider text-zinc-600 dark:text-[#9B9A97] text-xs">
              Pattern & Marking Scheme
            </label>
            <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setExamType('70_marks')}
                className={`rounded-md border p-4 text-left transition-all cursor-pointer ${
                  examType === '70_marks'
                    ? 'border-zinc-950 dark:border-white bg-zinc-100 dark:bg-[#2B2B2B] text-zinc-950 dark:text-white ring-1 ring-zinc-950 dark:ring-white'
                    : 'border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#191919] text-zinc-700 dark:text-[#9B9A97] hover:border-zinc-950 dark:hover:border-white'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-sm sm:text-base text-zinc-900 dark:text-[#E3E3E3]">
                  <span>70 Marks Exam</span>
                  <span className="font-mono text-xs font-bold text-emerald-700 dark:text-[#85B59A]">70 Qs @ 1.0m</span>
                </div>
                <p className="mt-1.5 text-xs text-zinc-600 dark:text-[#9B9A97] leading-relaxed">
                  Standard board exam format. 1.0 mark per question.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setExamType('140_half')}
                className={`rounded-md border p-4 text-left transition-all cursor-pointer ${
                  examType === '140_half'
                    ? 'border-zinc-950 dark:border-white bg-zinc-100 dark:bg-[#2B2B2B] text-zinc-950 dark:text-white ring-1 ring-zinc-950 dark:ring-white'
                    : 'border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#191919] text-zinc-700 dark:text-[#9B9A97] hover:border-zinc-950 dark:hover:border-white'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-sm sm:text-base text-zinc-900 dark:text-[#E3E3E3]">
                  <span>140 Qs Half-Mark</span>
                  <span className="font-mono text-xs font-bold text-sky-700 dark:text-[#8FAFC4]">140 Qs @ 0.5m</span>
                </div>
                <p className="mt-1.5 text-xs text-zinc-600 dark:text-[#9B9A97] leading-relaxed">
                  0.5 marks per question = 70 marks total drill.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setExamType('140_full')}
                className={`rounded-md border p-4 text-left transition-all cursor-pointer ${
                  examType === '140_full'
                    ? 'border-zinc-950 dark:border-white bg-zinc-100 dark:bg-[#2B2B2B] text-zinc-950 dark:text-white ring-1 ring-zinc-950 dark:ring-white'
                    : 'border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#191919] text-zinc-700 dark:text-[#9B9A97] hover:border-zinc-950 dark:hover:border-white'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-sm sm:text-base text-zinc-900 dark:text-[#E3E3E3]">
                  <span>140 Marks Mock</span>
                  <span className="font-mono text-xs font-bold text-amber-700 dark:text-[#D1B280]">140 Qs @ 1.0m</span>
                </div>
                <p className="mt-1.5 text-xs text-zinc-600 dark:text-[#9B9A97] leading-relaxed">
                  Full 140 questions mock at 1.0 mark each.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setExamType('quick_25')}
                className={`rounded-md border p-4 text-left transition-all cursor-pointer ${
                  examType === 'quick_25'
                    ? 'border-zinc-950 dark:border-white bg-zinc-100 dark:bg-[#2B2B2B] text-zinc-950 dark:text-white ring-1 ring-zinc-950 dark:ring-white'
                    : 'border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#191919] text-zinc-700 dark:text-[#9B9A97] hover:border-zinc-950 dark:hover:border-white'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-sm sm:text-base text-zinc-900 dark:text-[#E3E3E3]">
                  <span>Quick Sprint</span>
                  <span className="font-mono text-xs font-bold text-zinc-600 dark:text-[#9B9A97]">25 Qs @ 1.0m</span>
                </div>
                <p className="mt-1.5 text-xs text-zinc-600 dark:text-[#9B9A97] leading-relaxed">
                  Rapid 25 question session for fast review.
                </p>
              </button>
            </div>
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="font-bold uppercase tracking-wider text-zinc-600 dark:text-[#9B9A97] text-xs">
              Difficulty Tier
            </label>
            <div className="mt-2.5 grid grid-cols-4 gap-2.5">
              {[
                { id: 'all', label: 'All Levels' },
                { id: 'easy', label: 'Easy' },
                { id: 'normal', label: 'Normal' },
                { id: 'hard', label: 'Hard' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setDifficulty(id)}
                  className={`rounded-md border py-2.5 text-center font-bold transition-all cursor-pointer text-xs sm:text-sm ${
                    difficulty === id
                      ? 'border-zinc-950 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-[#191919]'
                      : 'border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#191919] text-zinc-700 dark:text-[#9B9A97] hover:border-zinc-950 dark:hover:border-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Distractor Engine Toggle */}
          <div className="rounded-md border border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#191919] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-sm text-zinc-900 dark:text-[#E3E3E3]">
                Distractor Options Engine
              </div>
              <p className="text-xs text-zinc-600 dark:text-[#9B9A97] leading-relaxed">
                {distractorMode === 'challenger'
                  ? 'Hard traps active: replaces simple PDF choices with realistic competitive distractors.'
                  : 'Standard: Original unmodified choices from the PDF.'}
              </p>
            </div>
            <div className="flex rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-100 dark:bg-[#202020] p-1 shrink-0">
              <button
                type="button"
                onClick={() => setDistractorMode('standard')}
                className={`rounded-xs px-3 py-1 text-xs font-bold transition-colors cursor-pointer ${
                  distractorMode === 'standard' ? 'bg-zinc-900 text-white dark:bg-white dark:text-[#191919]' : 'text-zinc-600 dark:text-[#9B9A97]'
                }`}
              >
                Original
              </button>
              <button
                type="button"
                onClick={() => setDistractorMode('challenger')}
                className={`rounded-xs px-3 py-1 text-xs font-bold transition-colors cursor-pointer ${
                  distractorMode === 'challenger' ? 'bg-zinc-900 text-white dark:bg-white dark:text-[#191919]' : 'text-zinc-600 dark:text-[#9B9A97]'
                }`}
              >
                Challenger
              </button>
            </div>
          </div>

          {/* Syllabus Units */}
          <div>
            <div className="flex items-center justify-between">
              <label className="font-bold uppercase tracking-wider text-zinc-600 dark:text-[#9B9A97] text-xs">
                Syllabus Inclusions ({selectedUnits.length} selected)
              </label>
              <button
                type="button"
                onClick={selectAllUnits}
                className="text-xs font-semibold text-zinc-700 dark:text-[#9B9A97] hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Select All
              </button>
            </div>

            <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {UNITS.map(u => {
                const checked = selectedUnits.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggleUnit(u.id)}
                    className={`flex items-center gap-2.5 rounded-sm border p-2.5 text-xs text-left transition-colors cursor-pointer ${
                      checked
                        ? 'border-zinc-950 dark:border-white/60 bg-zinc-100 dark:bg-[#262626] text-zinc-900 dark:text-[#E3E3E3] font-semibold'
                        : 'border-zinc-800 dark:border-white/30 bg-zinc-50 dark:bg-[#191919] text-zinc-500 dark:text-[#6F6E6B] opacity-60'
                    }`}
                  >
                    <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-xs border ${
                      checked ? 'border-zinc-950 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-[#191919]' : 'border-zinc-400'
                    }`}>
                      {checked && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <span className="truncate flex-1">{u.name}</span>
                    <span className="font-mono text-zinc-500 dark:text-[#6F6E6B] text-[10px]">{u.count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timer Toggle */}
          <div className="flex items-center justify-between border-t border-zinc-800 dark:border-white/45 pt-4">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-zinc-600 dark:text-[#9B9A97]" />
              <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-[#E3E3E3]">Enable Exam Timer</span>
            </div>
            <input
              type="checkbox"
              checked={isTimed}
              onChange={(e) => setIsTimed(e.target.checked)}
              className="h-4 w-4 rounded-xs border-zinc-800 accent-zinc-900 dark:accent-white cursor-pointer"
            />
          </div>
        </div>

        {/* Action Footer */}
        <div className="mt-8 flex justify-end gap-3 border-t border-zinc-800 dark:border-white/45 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-100 dark:bg-[#191919] px-4 py-2 font-semibold text-xs sm:text-sm text-zinc-700 dark:text-[#9B9A97] hover:text-zinc-900 dark:hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLaunch}
            className="rounded-sm border border-zinc-900 dark:border-white/60 bg-zinc-900 dark:bg-[#E3E3E3] px-6 py-2 font-bold text-xs sm:text-sm text-white dark:text-[#191919] hover:bg-zinc-800 dark:hover:bg-white transition-colors cursor-pointer"
          >
            Start Exam Session
          </button>
        </div>
      </div>
    </div>
  );
}
