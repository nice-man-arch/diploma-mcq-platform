// src/utils/quizEngine.js

/**
 * Fisher-Yates shuffle algorithm
 */
export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Selects randomized, non-repeating questions according to user criteria
 */
export function selectRandomQuestions({
  bank,
  totalCount = 70,
  difficulty = 'all', // 'easy' | 'normal' | 'hard' | 'all'
  selectedUnits = [], // empty array means all units
  distractorMode = 'standard', // 'standard' | 'challenger'
  specificIds = null // for mistake drill re-test
}) {
  if (!bank || bank.length === 0) return [];

  let pool = [...bank];

  // If specific IDs provided (e.g. from Mistake Notebook)
  if (specificIds && specificIds.length > 0) {
    const idSet = new Set(specificIds);
    pool = pool.filter(q => idSet.has(q.id));
  } else {
    // Filter by units if specified
    if (selectedUnits && selectedUnits.length > 0) {
      const unitSet = new Set(selectedUnits.map(Number));
      pool = pool.filter(q => unitSet.has(q.unit));
    }

    // Filter by difficulty if specified
    if (difficulty && difficulty !== 'all') {
      const filteredByDiff = pool.filter(q => q.difficulty === difficulty);
      // If we don't have enough questions of that specific difficulty, fall back gracefully
      if (filteredByDiff.length >= totalCount) {
        pool = filteredByDiff;
      } else if (filteredByDiff.length > 0) {
        // use available difficulty questions and pad with rest
        const remainder = pool.filter(q => q.difficulty !== difficulty);
        pool = [...shuffleArray(filteredByDiff), ...shuffleArray(remainder)];
      }
    }
  }

  // Shuffle without replacement (zero duplicates guaranteed)
  const shuffled = shuffleArray(pool);
  const selected = shuffled.slice(0, Math.min(totalCount, shuffled.length));

  // Map option mode
  return selected.map(q => {
    const activeOptions = (distractorMode === 'challenger' && q.challengerOptions) 
      ? q.challengerOptions 
      : q.options;

    return {
      ...q,
      activeOptions
    };
  });
}

/**
 * Calculates score and detailed breakdown
 */
export function evaluateExam({ questions, userAnswers, markPerQuestion = 1.0 }) {
  let correctCount = 0;
  let wrongCount = 0;
  let unattemptedCount = 0;

  const unitStats = {};

  const details = questions.map((q, index) => {
    const selected = userAnswers[q.id];
    const isAttempted = selected !== undefined && selected !== null && selected !== '';
    const isCorrect = isAttempted && selected === q.answer;

    if (!isAttempted) {
      unattemptedCount++;
    } else if (isCorrect) {
      correctCount++;
    } else {
      wrongCount++;
    }

    // Unit analytics
    if (!unitStats[q.unit]) {
      unitStats[q.unit] = {
        unit: q.unit,
        unitName: q.unitName,
        total: 0,
        correct: 0,
        wrong: 0,
        unattempted: 0
      };
    }
    unitStats[q.unit].total++;
    if (isCorrect) unitStats[q.unit].correct++;
    else if (isAttempted) unitStats[q.unit].wrong++;
    else unitStats[q.unit].unattempted++;

    return {
      index: index + 1,
      id: q.id,
      qNum: q.qNum,
      unit: q.unit,
      unitName: q.unitName,
      question: q.question,
      options: q.activeOptions || q.options,
      correctAnswer: q.answer,
      correctText: q.correctText,
      userAnswer: selected || null,
      isCorrect,
      isAttempted,
      explanation: q.explanation,
      memoryTip: q.memoryTip,
      difficulty: q.difficulty
    };
  });

  const totalQuestions = questions.length;
  const marksObtained = Number((correctCount * markPerQuestion).toFixed(2));
  const maxMarks = Number((totalQuestions * markPerQuestion).toFixed(2));
  const accuracy = (correctCount + wrongCount) > 0 
    ? Math.round((correctCount / (correctCount + wrongCount)) * 100) 
    : 0;

  return {
    totalQuestions,
    markPerQuestion,
    maxMarks,
    marksObtained,
    percentage: maxMarks > 0 ? Math.round((marksObtained / maxMarks) * 100) : 0,
    correctCount,
    wrongCount,
    unattemptedCount,
    accuracy,
    unitStats: Object.values(unitStats),
    details
  };
}
