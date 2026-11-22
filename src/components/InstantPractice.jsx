// src/components/InstantPractice.jsx
import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  ChevronRight, 
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import QuestionCard from './QuestionCard';
import { shuffleArray } from '../utils/quizEngine';

export default function InstantPractice({
  bank,
  onSaveMistake,
  isBookmarked,
  onToggleBookmark
}) {
  const [selectedUnit, setSelectedUnit] = useState(0);
  const [difficulty, setDifficulty] = useState('all');
  const [distractorMode, setDistractorMode] = useState('challenger');
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const [activePool, setActivePool] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    let pool = [...bank];
    if (selectedUnit !== 0) pool = pool.filter(q => q.unit === selectedUnit);
    if (difficulty !== 'all') pool = pool.filter(q => q.difficulty === difficulty);

    const shuffled = shuffleArray(pool).map(q => ({
      ...q,
      activeOptions: distractorMode === 'challenger' && q.challengerOptions ? q.challengerOptions : q.options
    }));

    setActivePool(shuffled);
    setCurrentIndex(0);
    setSelectedOption(null);
  }, [bank, selectedUnit, difficulty, distractorMode]);

  const currentQ = activePool[currentIndex];

  const handleSelectOption = (optKey) => {
    if (!currentQ || selectedOption) return;
    setSelectedOption(optKey);

    const isCorrect = optKey === currentQ.answer;
    if (isCorrect) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > bestStreak) setBestStreak(nextStreak);
    } else {
      setStreak(0);
      onSaveMistake(currentQ.id, optKey, currentQ.answer);
    }
  };

  const handleNext = () => {
    if (currentIndex < activePool.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
    } else {
      setActivePool(shuffleArray(activePool));
      setCurrentIndex(0);
      setSelectedOption(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8 text-zinc-900 dark:text-[#E3E3E3]">
      {/* Header */}
      <div className="border-b border-zinc-800 dark:border-white/45 pb-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs sm:text-sm text-zinc-600 dark:text-[#9B9A97] font-mono font-bold">
            INTERACTIVE TRAINING
          </div>

          <div className="flex items-center gap-2 rounded-sm border border-amber-800 dark:border-white/50 bg-amber-100 dark:bg-[#362D1F] px-3 py-1 text-xs sm:text-sm font-mono font-bold text-amber-900 dark:text-[#D1B280]">
            <Zap className="h-4 w-4" />
            <span>Streak: {streak}</span>
            <span className="text-zinc-500 dark:text-[#6F6E6B]">(Best: {bestStreak})</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-[#E3E3E3] tracking-tight">
          Instant Step-by-Step Practice
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-[#9B9A97]">
          Immediate answer validation and memory hacks with each response for accelerated learning.
        </p>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <div className="relative">
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(Number(e.target.value))}
              className="w-full appearance-none rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#202020] py-2.5 pl-3.5 pr-8 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-[#E3E3E3] focus:border-zinc-950 dark:focus:border-white focus:outline-hidden cursor-pointer"
            >
              <option value={0}>All Units (Full Syllabus)</option>
              <option value={1}>Unit 1: Units, Measurements & Vectors</option>
              <option value={2}>Unit 2: Electricity & Magnetism</option>
              <option value={3}>Unit 3: Waves & Oscillations</option>
              <option value={4}>Unit 4: Optics & Modern Physics</option>
              <option value={5}>Unit 5: Thermometry & Heat Transfer</option>
              <option value={6}>Unit 6: Electrochemistry & Metals</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-zinc-500 dark:text-[#9B9A97]" />
          </div>

          <div className="relative">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full appearance-none rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#202020] py-2.5 pl-3.5 pr-8 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-[#E3E3E3] focus:border-zinc-950 dark:focus:border-white focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy (Fundamentals)</option>
              <option value="normal">Normal (Standard)</option>
              <option value="hard">Hard (Competitive Challenger)</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-zinc-500 dark:text-[#9B9A97]" />
          </div>

          <div className="relative">
            <select
              value={distractorMode}
              onChange={(e) => setDistractorMode(e.target.value)}
              className="w-full appearance-none rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#202020] py-2.5 pl-3.5 pr-8 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-[#E3E3E3] focus:border-zinc-950 dark:focus:border-white focus:outline-hidden cursor-pointer"
            >
              <option value="challenger">Challenger Options (Realistic Distractors)</option>
              <option value="standard">Standard PDF Options</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-zinc-500 dark:text-[#9B9A97]" />
          </div>
        </div>
      </div>

      {/* Main Card View */}
      {currentQ ? (
        <div className="space-y-4">
          <QuestionCard
            question={currentQ}
            questionIndex={currentIndex}
            totalQuestions={activePool.length}
            markPerQuestion={1.0}
            selectedOption={selectedOption}
            onSelectOption={handleSelectOption}
            isInstantMode={true}
            isBookmarked={isBookmarked(currentQ.id)}
            onToggleBookmark={onToggleBookmark}
          />

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs sm:text-sm text-zinc-500 dark:text-[#9B9A97]">
              {selectedOption ? 'Review feedback and click next' : 'Select an option to verify immediately'}
            </span>

            <button
              type="button"
              onClick={handleNext}
              disabled={!selectedOption}
              className="rounded-sm border border-zinc-900 dark:border-white/60 bg-zinc-900 dark:bg-[#E3E3E3] px-5 py-2.5 text-sm sm:text-base font-bold text-white dark:text-[#191919] hover:bg-zinc-800 dark:hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Next Question</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-md border border-zinc-800 dark:border-white/45 bg-white dark:bg-[#202020] p-12 text-center text-sm text-zinc-500 dark:text-[#9B9A97]">
          No questions available in this filter.
        </div>
      )}
    </div>
  );
}
