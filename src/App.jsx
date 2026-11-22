// src/App.jsx
import React, { useState, useEffect } from 'react';
import questionsBank from './data/questions.json';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ExamSetupModal from './components/ExamSetupModal';
import ExamSession from './components/ExamSession';
import ScorecardView from './components/ScorecardView';
import ReadingMode from './components/ReadingMode';
import InstantPractice from './components/InstantPractice';
import MistakeNotebook from './components/MistakeNotebook';
import FirstBootModal from './components/FirstBootModal';
import Leaderboard from './components/Leaderboard';
import SettingsModal from './components/SettingsModal';

import { selectRandomQuestions, evaluateExam } from './utils/quizEngine';
import { 
  getMistakes, 
  saveMistake, 
  removeMistake, 
  clearAllMistakes,
  getBookmarks,
  toggleBookmark,
  getQuizHistory,
  saveQuizResult
} from './utils/storage';
import { 
  getSavedStudentProfile, 
  saveStudentProfile, 
  recordStudentSession,
  getOrCreateStudentId,
  updateStudentName
} from './utils/sessionService';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Theme setup
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('diploma_theme') || 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('diploma_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Clean URL: Strip any residual hash or parameters so URL stays strictly clean
  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    sessionStorage.removeItem('diploma_admin_auth');
    localStorage.removeItem('diploma_admin_auth');
  }, []);

  // First boot check: Prompt for student name ONLY on the very first visit
  const [isFirstBoot, setIsFirstBoot] = useState(() => {
    return !localStorage.getItem('diploma_student_name');
  });

  // Current student profile
  const [currentStudent, setCurrentStudent] = useState(getSavedStudentProfile);

  // Settings & Mindful Privacy Mode
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hideLeaderboard, setHideLeaderboard] = useState(() => {
    return localStorage.getItem('diploma_hide_leaderboard') === 'true';
  });
  const [isLeaderboardOptedOut, setIsLeaderboardOptedOut] = useState(() => {
    return localStorage.getItem('diploma_leaderboard_opt_out') === 'true';
  });

  const handleUpdateSettings = ({ name, hideLeaderboard: hideL, isLeaderboardOptedOut: optOut }) => {
    if (name && name.trim()) {
      updateStudentName(name.trim());
      setCurrentStudent(prev => ({ ...(prev || {}), name: name.trim() }));
    }
    localStorage.setItem('diploma_hide_leaderboard', hideL ? 'true' : 'false');
    localStorage.setItem('diploma_leaderboard_opt_out', optOut ? 'true' : 'false');
    setHideLeaderboard(hideL);
    setIsLeaderboardOptedOut(optOut);

    if (hideL && currentView === 'leaderboard') {
      setCurrentView('home');
    }
  };

  // Local storage state
  const [mistakes, setMistakes] = useState(getMistakes);
  const [bookmarks, setBookmarks] = useState(getBookmarks);
  const [history, setHistory] = useState(getQuizHistory);

  // Setup Modal
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [setupInitialType, setSetupInitialType] = useState('70_marks');

  // Active Exam state
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [activeMarkPerQuestion, setActiveMarkPerQuestion] = useState(1.0);
  const [activeDurationMinutes, setActiveDurationMinutes] = useState(70);
  const [isTimed, setIsTimed] = useState(true);
  const [activeExamTitle, setActiveExamTitle] = useState('70 Marks Board Exam');

  // Scorecard state
  const [evaluation, setEvaluation] = useState(null);

  // Reading mode initial unit
  const [readingInitialUnit, setReadingInitialUnit] = useState(0);

  // Sync state helpers
  const handleToggleBookmark = (id) => {
    const updated = toggleBookmark(id);
    setBookmarks(updated);
  };

  const isBookmarked = (id) => bookmarks.includes(id);

  const handleSaveMistake = (qId, selectedOpt, correctOpt) => {
    saveMistake(qId, selectedOpt, correctOpt);
    setMistakes(getMistakes());
  };

  const handleRemoveMistake = (qId) => {
    removeMistake(qId);
    setMistakes(getMistakes());
  };

  const handleClearAllMistakes = () => {
    if (window.confirm('Clear all logged mistakes from your notebook?')) {
      clearAllMistakes();
      setMistakes([]);
    }
  };

  const handleOpenExamConfig = (preset = '70_marks') => {
    setSetupInitialType(preset);
    setIsSetupOpen(true);
  };

  const handleSelectUnitInReading = (unitId) => {
    setReadingInitialUnit(unitId);
    setCurrentView('reading');
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Start Exam directly (Instant 1-click launch - no modal prompts!)
  const handleStartExam = ({
    totalCount = 70,
    markPerQuestion = 1.0,
    difficulty = 'all',
    distractorMode = 'challenger',
    selectedUnits = [],
    isTimed = true,
    durationMinutes = 70,
    specificIds = null,
    title = 'Diploma Science Exam'
  }) => {
    const selected = selectRandomQuestions({
      bank: questionsBank,
      totalCount,
      difficulty,
      selectedUnits,
      distractorMode,
      specificIds
    });

    if (selected.length === 0) {
      alert('No questions match the selected criteria.');
      return;
    }

    setActiveQuestions(selected);
    setActiveMarkPerQuestion(markPerQuestion);
    setActiveDurationMinutes(durationMinutes);
    setIsTimed(isTimed);
    setActiveExamTitle(title);
    setIsSetupOpen(false);
    setSidebarOpen(false);
    setCurrentView('exam');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Preset launch from dashboard
  const handleLaunchPreset = (presetKey, extra = {}) => {
    if (presetKey === '70_marks') {
      handleStartExam({
        totalCount: 70,
        markPerQuestion: 1.0,
        difficulty: 'all',
        distractorMode: 'challenger',
        selectedUnits: [1, 2, 3, 4, 5, 6],
        isTimed: true,
        durationMinutes: 70,
        title: '70 Marks Board Examination'
      });
    } else if (presetKey === '140_half') {
      handleStartExam({
        totalCount: 140,
        markPerQuestion: 0.5,
        difficulty: 'all',
        distractorMode: 'challenger',
        selectedUnits: [1, 2, 3, 4, 5, 6],
        isTimed: true,
        durationMinutes: 120,
        title: '140 Questions (Half-Mark Drill)'
      });
    } else if (presetKey === 'unit_quick' && extra.unit) {
      handleStartExam({
        totalCount: 25,
        markPerQuestion: 1.0,
        difficulty: 'all',
        distractorMode: 'challenger',
        selectedUnits: [extra.unit],
        isTimed: true,
        durationMinutes: 25,
        title: `Unit ${extra.unit} Quick Test`
      });
    }
  };

  // Retest mistakes
  const handleLaunchMistakeDrill = () => {
    const ids = mistakes.map(m => m.id);
    if (ids.length === 0) return;

    handleStartExam({
      totalCount: ids.length,
      markPerQuestion: 1.0,
      difficulty: 'all',
      distractorMode: 'challenger',
      specificIds: ids,
      isTimed: false,
      title: 'Mistake Clearance Drill'
    });
  };

  // Complete exam & silently record student session with IP address in background
  const handleCompleteExam = (examPayload) => {
    const userAnswers = examPayload?.userAnswers || examPayload || {};
    const timeTakenSeconds = examPayload?.timeTakenSeconds || 0;

    const evalResult = evaluateExam({
      questions: activeQuestions,
      userAnswers,
      markPerQuestion: activeMarkPerQuestion
    });

    evalResult.details.forEach(item => {
      if (!item.isCorrect && item.isAttempted) {
        saveMistake(item.id, item.userAnswer, item.correctAnswer);
      }
    });
    setMistakes(getMistakes());

    saveQuizResult({
      title: activeExamTitle,
      marksObtained: evalResult.marksObtained,
      maxMarks: evalResult.maxMarks,
      percentage: evalResult.percentage,
      accuracy: evalResult.accuracy,
      correctCount: evalResult.correctCount,
      wrongCount: evalResult.wrongCount,
      totalQuestions: evalResult.totalQuestions
    });
    setHistory(getQuizHistory());

    // Record student exam session for Leaderboard ranking
    const studentName = localStorage.getItem('diploma_student_name') || currentStudent?.name || 'Candidate';
    const studentId = localStorage.getItem('diploma_student_id') || currentStudent?.id || getOrCreateStudentId();
    recordStudentSession({
      studentName,
      studentId,
      college: currentStudent?.college || 'Polytechnic Student',
      examTitle: activeExamTitle,
      totalQuestions: evalResult.totalQuestions,
      markPerQuestion: activeMarkPerQuestion,
      maxMarks: evalResult.maxMarks,
      marksObtained: evalResult.marksObtained,
      percentage: evalResult.percentage,
      accuracy: evalResult.accuracy,
      correctCount: evalResult.correctCount,
      wrongCount: evalResult.wrongCount,
      unattemptedCount: evalResult.unattemptedCount,
      timeTakenSeconds
    });

    setEvaluation(evalResult);
    setCurrentView('scorecard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] dark:bg-[#191919] text-zinc-900 dark:text-[#E3E3E3] flex antialiased transition-colors duration-150">
      {/* Notion Collapsible Sidebar - No Admin buttons visible */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          setSidebarOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenExamConfig={handleOpenExamConfig}
        onSelectUnitInReading={handleSelectUnitInReading}
        hideLeaderboard={hideLeaderboard}
        mistakeCount={mistakes.length}
        isOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Minimal Notion Navbar - No Admin button visible */}
        <Navbar
          currentView={currentView}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenExamConfig={handleOpenExamConfig}
          activeExamTitle={activeExamTitle}
          mistakeCount={mistakes.length}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Workspace Canvas */}
        <main className="flex-1 px-4 sm:px-8 py-8 overflow-y-auto">
          {currentView === 'home' && (
            <Dashboard
              onLaunchPreset={handleLaunchPreset}
              onOpenCustomModal={() => handleOpenExamConfig('custom')}
              onNavigate={(view, extra) => {
                if (extra && extra.unit !== undefined) {
                  setReadingInitialUnit(extra.unit);
                }
                setCurrentView(view);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              hideLeaderboard={hideLeaderboard}
              mistakeCount={mistakes.length}
              history={history}
            />
          )}

          {currentView === 'exam' && (
            <ExamSession
              questions={activeQuestions}
              markPerQuestion={activeMarkPerQuestion}
              durationMinutes={activeDurationMinutes}
              isTimed={isTimed}
              isInstantMode={false}
              onCompleteExam={handleCompleteExam}
              onExitExam={() => setCurrentView('home')}
              isBookmarked={isBookmarked}
              onToggleBookmark={handleToggleBookmark}
            />
          )}

          {currentView === 'scorecard' && evaluation && (
            <ScorecardView
              evaluation={evaluation}
              onRetestMistakes={handleLaunchMistakeDrill}
              onNewTest={() => handleOpenExamConfig('70_marks')}
              onSwitchToReading={() => setCurrentView('reading')}
            />
          )}

          {currentView === 'reading' && (
            <ReadingMode
              bank={questionsBank}
              initialUnit={readingInitialUnit}
              isBookmarked={isBookmarked}
              onToggleBookmark={handleToggleBookmark}
            />
          )}

          {currentView === 'instant' && (
            <InstantPractice
              bank={questionsBank}
              onSaveMistake={handleSaveMistake}
              isBookmarked={isBookmarked}
              onToggleBookmark={handleToggleBookmark}
            />
          )}

          {currentView === 'mistakes' && (
            <MistakeNotebook
              mistakes={mistakes}
              bank={questionsBank}
              onLaunchMistakeDrill={handleLaunchMistakeDrill}
              onRemoveMistake={handleRemoveMistake}
              onClearAll={handleClearAllMistakes}
              onSwitchToReading={() => setCurrentView('reading')}
            />
          )}

          {/* Student Leaderboard */}
          {currentView === 'leaderboard' && (
            <Leaderboard
              currentStudentName={localStorage.getItem('diploma_student_name') || currentStudent?.name}
              currentStudentId={localStorage.getItem('diploma_student_id') || currentStudent?.id || getOrCreateStudentId()}
              onLaunchExam={(preset) => handleLaunchPreset(preset || '70_marks')}
              isOptedOut={isLeaderboardOptedOut}
              onToggleOptOut={() => {
                const nextVal = !isLeaderboardOptedOut;
                localStorage.setItem('diploma_leaderboard_opt_out', nextVal ? 'true' : 'false');
                setIsLeaderboardOptedOut(nextVal);
              }}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          )}
        </main>

        {/* Clean Minimalist Footer */}
        <footer className="border-t border-zinc-800 dark:border-white/45 bg-white dark:bg-[#191919] py-5 px-6 text-center text-xs sm:text-sm text-zinc-500 dark:text-[#6F6E6B]">
          <p>
            Applied Science Question Bank • 1,046 Questions Across Units 1–6 • Minimalist High-Retention Workspace
          </p>
        </footer>
      </div>

      {/* First-Boot Welcome Name Dialog (Shown ONLY once on first visit) */}
      <FirstBootModal
        isOpen={isFirstBoot}
        onComplete={(profile) => {
          setCurrentStudent(profile);
          setIsFirstBoot(false);
        }}
      />

      {/* Global Exam Configuration Modal */}
      <ExamSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onStartExam={handleStartExam}
      />

      {/* Mindful Study & Privacy Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentStudentName={localStorage.getItem('diploma_student_name') || currentStudent?.name}
        hideLeaderboard={hideLeaderboard}
        isLeaderboardOptedOut={isLeaderboardOptedOut}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
}
