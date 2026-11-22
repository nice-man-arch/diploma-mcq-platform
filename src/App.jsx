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
import StudentIdentificationModal from './components/StudentIdentificationModal';
import AdminPanel from './components/AdminPanel';

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
  recordStudentSession 
} from './utils/sessionService';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  // Local storage state
  const [mistakes, setMistakes] = useState(getMistakes);
  const [bookmarks, setBookmarks] = useState(getBookmarks);
  const [history, setHistory] = useState(getQuizHistory);

  // Student Profile & Verification Modal
  const [currentStudent, setCurrentStudent] = useState(getSavedStudentProfile);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [pendingExamConfig, setPendingExamConfig] = useState(null);

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

  // Initiate Start Exam (with Student Verification check)
  const handleStartExam = (config) => {
    // If student identity is not verified or if user wants to confirm candidate name, prompt modal
    if (!currentStudent || !currentStudent.name) {
      setPendingExamConfig(config);
      setIsStudentModalOpen(true);
      return;
    }

    executeStartExam(config);
  };

  // Internal execution of starting exam after student verification
  const executeStartExam = ({
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

  const handleConfirmStudent = (studentProfile) => {
    setCurrentStudent(studentProfile);
    setIsStudentModalOpen(false);
    if (pendingExamConfig) {
      executeStartExam(pendingExamConfig);
      setPendingExamConfig(null);
    }
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

  // Complete exam
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

    // Record to Central Admin Sessions with Student Name & Geolocation
    recordStudentSession({
      studentName: currentStudent?.name || 'Anonymous Student',
      studentId: currentStudent?.rollNo || '',
      college: currentStudent?.college || '',
      location: currentStudent?.location || { city: 'Local Area', country: 'India' },
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
      {/* Notion Collapsible Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          setSidebarOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenExamConfig={handleOpenExamConfig}
        onSelectUnitInReading={handleSelectUnitInReading}
        mistakeCount={mistakes.length}
        isOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Minimal Notion Navbar */}
        <Navbar
          currentView={currentView}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenExamConfig={handleOpenExamConfig}
          onNavigateAdmin={() => {
            setCurrentView('admin');
            setSidebarOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          activeExamTitle={activeExamTitle}
          mistakeCount={mistakes.length}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Workspace Canvas with Generous Padding */}
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

          {currentView === 'admin' && (
            <AdminPanel
              onNavigateHome={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
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

      {/* Candidate Verification & Location Detection Modal */}
      <StudentIdentificationModal
        isOpen={isStudentModalOpen}
        onClose={() => {
          setIsStudentModalOpen(false);
          setPendingExamConfig(null);
        }}
        onConfirmStudent={handleConfirmStudent}
        examTitle={pendingExamConfig?.title || 'Diploma Science Examination'}
      />

      {/* Global Exam Configuration Modal */}
      <ExamSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onStartExam={handleStartExam}
      />
    </div>
  );
}
