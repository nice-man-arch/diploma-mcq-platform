// src/components/ReadingMode.jsx
import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Bookmark, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  Check 
} from 'lucide-react';
import MemoryTipCard from './MemoryTipCard';

const UNITS = [
  { id: 0, name: "All Units (1,046 Qs)" },
  { id: 1, name: "Unit 1: Units, Measurements & Vectors" },
  { id: 2, name: "Unit 2: Electricity & Magnetism" },
  { id: 3, name: "Unit 3: Waves & Oscillations" },
  { id: 4, name: "Unit 4: Optics & Modern Physics" },
  { id: 5, name: "Unit 5: Thermometry & Heat Transfer" },
  { id: 6, name: "Unit 6: Electrochemistry, Redox & Metals" },
];

export default function ReadingMode({
  bank,
  initialUnit = 0,
  isBookmarked,
  onToggleBookmark
}) {
  const [selectedUnit, setSelectedUnit] = useState(initialUnit);
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [studyStyle, setStudyStyle] = useState('open'); // 'open' | 'flashcard'
  const [revealedIds, setRevealedIds] = useState(new Set());
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);

  const toggleReveal = (id) => {
    setRevealedIds(prev => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  const revealAll = () => {
    setRevealedIds(new Set(filteredQuestions.map(q => q.id)));
  };

  const hideAll = () => {
    setRevealedIds(new Set());
  };

  const filteredQuestions = useMemo(() => {
    return bank.filter((q) => {
      if (selectedUnit !== 0 && q.unit !== selectedUnit) return false;
      if (difficultyFilter !== 'all' && q.difficulty !== difficultyFilter) return false;
      if (onlyBookmarks && !isBookmarked(q.id)) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchQ = q.question.toLowerCase().includes(query);
        const matchAns = q.correctText.toLowerCase().includes(query);
        const matchExp = (q.explanation || '').toLowerCase().includes(query);
        const matchTip = (q.memoryTip || '').toLowerCase().includes(query);
        if (!matchQ && !matchAns && !matchExp && !matchTip) return false;
      }

      return true;
    });
  }, [bank, selectedUnit, difficultyFilter, onlyBookmarks, searchQuery, isBookmarked]);

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8 text-zinc-900 dark:text-[#E3E3E3]">
      {/* Header */}
      <div className="border-b border-zinc-800 dark:border-white/45 pb-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs sm:text-sm text-zinc-600 dark:text-[#9B9A97] font-mono font-bold">
            READING & REVISION BANK
          </div>

          {/* Flashcard vs Direct Mode */}
          <div className="flex rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-100 dark:bg-[#202020] p-1 text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => setStudyStyle('open')}
              className={`rounded-xs px-3 py-1.5 font-bold transition-colors cursor-pointer ${
                studyStyle === 'open' 
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-[#191919]' 
                  : 'text-zinc-600 dark:text-[#9B9A97]'
              }`}
            >
              Direct View
            </button>
            <button
              type="button"
              onClick={() => setStudyStyle('flashcard')}
              className={`rounded-xs px-3 py-1.5 font-bold transition-colors cursor-pointer ${
                studyStyle === 'flashcard' 
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-[#191919]' 
                  : 'text-zinc-600 dark:text-[#9B9A97]'
              }`}
            >
              Active Recall
            </button>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-[#E3E3E3] tracking-tight">
          Syllabus Reading Mode
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-[#9B9A97]">
          Read questions and verified answers directly with memory tips to memorize effortlessly without test fatigue.
        </p>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-4">
          <div className="sm:col-span-5 relative">
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(Number(e.target.value))}
              className="w-full appearance-none rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#202020] py-2.5 pl-3.5 pr-8 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-[#E3E3E3] focus:border-zinc-950 dark:focus:border-white focus:outline-hidden cursor-pointer"
            >
              {UNITS.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-zinc-500 dark:text-[#9B9A97]" />
          </div>

          <div className="sm:col-span-3 relative">
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full appearance-none rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#202020] py-2.5 pl-3.5 pr-8 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-[#E3E3E3] focus:border-zinc-950 dark:focus:border-white focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="normal">Normal</option>
              <option value="hard">Hard</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-zinc-500 dark:text-[#9B9A97]" />
          </div>

          <div className="sm:col-span-4 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500 dark:text-[#9B9A97]" />
            <input
              type="text"
              placeholder="Search concepts, formulas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#202020] py-2.5 pl-9 pr-3 text-xs sm:text-sm text-zinc-900 dark:text-[#E3E3E3] focus:border-zinc-950 dark:focus:border-white focus:outline-hidden"
            />
          </div>
        </div>

        {/* Status Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs sm:text-sm text-zinc-600 dark:text-[#9B9A97]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOnlyBookmarks(!onlyBookmarks)}
              className={`flex items-center gap-1.5 rounded-sm border px-3 py-1 font-semibold transition-colors cursor-pointer ${
                onlyBookmarks
                  ? 'border-amber-800 dark:border-white/50 bg-amber-100 dark:bg-[#362D1F] text-amber-900 dark:text-[#D1B280]'
                  : 'border-zinc-800 dark:border-white/45 bg-white dark:bg-[#202020] text-zinc-700 dark:text-[#9B9A97] hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Bookmark className={`h-3.5 w-3.5 ${onlyBookmarks ? 'fill-current' : ''}`} />
              <span>Bookmarked Only</span>
            </button>

            <span>
              Showing <strong className="text-zinc-900 dark:text-[#E3E3E3]">{filteredQuestions.length}</strong> questions
            </span>
          </div>

          {studyStyle === 'flashcard' && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={revealAll}
                className="text-emerald-700 dark:text-[#85B59A] font-bold hover:underline cursor-pointer"
              >
                Reveal All
              </button>
              <span className="text-zinc-400">•</span>
              <button
                type="button"
                onClick={hideAll}
                className="text-zinc-600 dark:text-[#9B9A97] font-semibold hover:underline cursor-pointer"
              >
                Hide All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Questions Reading Cards List */}
      <div className="space-y-5">
        {filteredQuestions.length === 0 ? (
          <div className="rounded-md border border-zinc-800 dark:border-white/45 bg-white dark:bg-[#202020] p-12 text-center text-sm text-zinc-500 dark:text-[#9B9A97]">
            No questions found matching your filter criteria.
          </div>
        ) : (
          filteredQuestions.map((q, index) => {
            const isRevealed = studyStyle === 'open' || revealedIds.has(q.id);
            const bookmarked = isBookmarked(q.id);

            return (
              <div
                key={q.id}
                className="rounded-md border border-zinc-800 dark:border-white/50 bg-white dark:bg-[#202020] p-6 text-sm space-y-4 shadow-xs"
              >
                {/* Meta Header */}
                <div className="flex items-center justify-between border-b border-zinc-800 dark:border-white/45 pb-3 text-zinc-600 dark:text-[#9B9A97]">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono font-bold text-zinc-900 dark:text-[#E3E3E3]">#{index + 1}</span>
                    <span className="font-semibold text-zinc-700 dark:text-[#9B9A97]">{q.unitName}</span>
                    <span className="rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-100 dark:bg-[#191919] px-2 py-0.5 text-xs font-mono font-semibold capitalize">
                      {q.difficulty}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleBookmark(q.id)}
                    className={`rounded-sm p-1.5 transition-colors cursor-pointer border ${
                      bookmarked 
                        ? 'text-amber-700 border-amber-800 dark:border-white/50 bg-amber-100 dark:bg-[#362D1F] dark:text-[#D1B280]' 
                        : 'text-zinc-500 border-zinc-800 dark:border-white/45 dark:text-[#9B9A97] hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Question */}
                <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-[#E3E3E3] leading-relaxed">
                  {q.question}
                </h3>

                {/* Options List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {['A', 'B', 'C', 'D'].map((optKey) => {
                    const text = q.options[optKey];
                    if (!text) return null;
                    const isTarget = isRevealed && q.answer === optKey;

                    return (
                      <div
                        key={optKey}
                        className={`rounded-sm border p-3 text-sm flex items-start gap-2.5 ${
                          isTarget
                            ? 'border-emerald-700 dark:border-emerald-400 bg-emerald-50 dark:bg-[#24332C] text-emerald-950 dark:text-[#85B59A] font-bold'
                            : 'border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#191919] text-zinc-700 dark:text-[#9B9A97]'
                        }`}
                      >
                        <span className="font-mono font-bold shrink-0">{optKey}.</span>
                        <span className="flex-1 leading-snug">{text}</span>
                        {isTarget && (
                          <Check className="h-4 w-4 text-emerald-700 dark:text-[#85B59A] shrink-0 stroke-[3]" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Flashcard Toggle Button */}
                {studyStyle === 'flashcard' && !isRevealed && (
                  <button
                    type="button"
                    onClick={() => toggleReveal(q.id)}
                    className="w-full py-2.5 rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-100 dark:bg-[#282828] text-xs sm:text-sm font-bold text-zinc-900 dark:text-[#E3E3E3] hover:bg-zinc-200 dark:hover:bg-[#303030] dark:hover:border-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Reveal Correct Answer & Memory Trick</span>
                  </button>
                )}

                {/* Memory Tip & Explanation (Shown directly or when revealed) */}
                {isRevealed && (
                  <MemoryTipCard
                    tip={q.memoryTip}
                    explanation={q.explanation}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
