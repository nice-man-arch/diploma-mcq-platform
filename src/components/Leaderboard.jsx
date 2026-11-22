// src/components/Leaderboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  Award, 
  Medal, 
  Flame, 
  CheckCircle2, 
  Zap, 
  User, 
  Search,
  ArrowUpRight,
  Sparkles,
  Settings,
  EyeOff,
  HeartHandshake,
  Layers,
  Target,
  Clock,
  RotateCcw,
  CloudOff,
  CloudCheck
} from 'lucide-react';
import { getAllStudentSessions, getLocalSessions, syncLocalSessionsToCloud, getOrCreateStudentId } from '../utils/sessionService';
import { db } from '../utils/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

export default function Leaderboard({ 
  currentStudentName, 
  currentStudentId,
  onLaunchExam, 
  isOptedOut = false,
  onToggleOptOut,
  onOpenSettings 
}) {
  const [sessions, setSessions] = useState(() => getLocalSessions());
  const [searchQuery, setSearchQuery] = useState('');
  const [examTab, setExamTab] = useState('all'); // 'all' | '70_marks' | '140_drill'
  const [cloudSyncStatus, setCloudSyncStatus] = useState('checking'); // 'checking' | 'connected' | 'pending_setup'
  const resolvedStudentId = currentStudentId || getOrCreateStudentId();

  // Load and listen for session updates
  useEffect(() => {
    // 1. Immediately reload local sessions
    setSessions(getLocalSessions());

    // 2. Listen for immediate zero-latency in-app exam completion and name change events
    const handleLocalUpdate = () => {
      const freshLocal = getLocalSessions();
      setSessions(freshLocal);
    };
    window.addEventListener('diploma_session_recorded', handleLocalUpdate);
    window.addEventListener('diploma_student_name_updated', handleLocalUpdate);
    window.addEventListener('storage', handleLocalUpdate);

    // 3. Attach Firebase Firestore real-time subscription
    let unsubscribe = () => {};
    try {
      const q = query(
        collection(db, 'leaderboard_sessions'),
        orderBy('timestamp', 'desc'),
        limit(150)
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          setCloudSyncStatus('connected');
          const remoteSessions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          const local = getLocalSessions();
          const map = new Map();
          remoteSessions.forEach(s => map.set(s.id || s.timestamp, s));
          local.forEach(s => {
            if (!map.has(s.id)) map.set(s.id, s);
          });

          setSessions(Array.from(map.values()).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        },
        (err) => {
          setCloudSyncStatus('pending_setup');
          console.warn('Firestore live listener notice (local mode active):', err.message);
          getAllStudentSessions().then(data => {
            if (data && Array.isArray(data)) {
              setSessions(data);
            }
          });
        }
      );
    } catch (err) {
      setCloudSyncStatus('pending_setup');
      console.warn('Firestore listener setup fallback:', err.message);
      getAllStudentSessions().then(data => {
        if (data && Array.isArray(data)) {
          setSessions(data);
        }
      });
    }

    return () => {
      window.removeEventListener('diploma_session_recorded', handleLocalUpdate);
      window.removeEventListener('diploma_student_name_updated', handleLocalUpdate);
      window.removeEventListener('storage', handleLocalUpdate);
      try {
        unsubscribe();
      } catch {}
    };
  }, []);

  // Compute live ranking table strictly from actual student exam sessions
  const allStudentStats = useMemo(() => {
    const studentStats = new Map();
    const currId = resolvedStudentId;
    const currNameKey = currentStudentName ? currentStudentName.toLowerCase().trim() : '';

    // Deduplicate sessions (collapses any duplicate uploads or rapid sync loop repeats)
    const seenSessions = new Set();
    const deduplicatedSessions = [];

    sessions.forEach(s => {
      if (!s) return;
      const totalQ = (!isNaN(Number(s.totalQuestions)) && Number(s.totalQuestions) > 0) ? Number(s.totalQuestions) : 70;
      const marks = !isNaN(Number(s.marksObtained)) ? Number(s.marksObtained) : 0;
      const idKey = s.studentId || (s.studentName || 'Scholar').toLowerCase().trim();
      const examTitle = s.examTitle || '';
      // Group by 10-minute time window to merge identical duplicate sync sessions
      const timeWindow = s.timestamp ? Math.floor(new Date(s.timestamp).getTime() / (10 * 60 * 1000)) : 0;
      
      const sig = `${idKey}_${examTitle}_${totalQ}_${marks}_${timeWindow}`;
      if (!seenSessions.has(sig)) {
        seenSessions.add(sig);
        deduplicatedSessions.push(s);
      }
    });

    deduplicatedSessions.forEach(s => {
      const name = s.studentName ? s.studentName.trim() : 'Scholar';
      // Identify each student by studentId to allow multiple people to share the exact same name
      const studentKey = s.studentId || (s.id ? `sess_${s.id}` : `sess_${name}_${s.timestamp}`);
      
      const isCurrentUser = !isOptedOut && (
        (currId && s.studentId && s.studentId === currId) ||
        (!s.studentId && currNameKey && name.toLowerCase() === currNameKey) ||
        (currNameKey && name.toLowerCase() === currNameKey)
      );

      // If current student has opted out, exclude their sessions from public leaderboard
      if (isOptedOut && isCurrentUser) {
        return;
      }

      const resolvedDisplayName = (isCurrentUser && currentStudentName && currentStudentName.trim())
        ? currentStudentName.trim()
        : name;

      const existing = studentStats.get(studentKey) || {
        id: studentKey,
        studentId: s.studentId || studentKey,
        name: resolvedDisplayName,
        college: s.college || 'Polytechnic Student',
        isCurrentUser: false,
        totalQuestionsAttempted: 0,
        totalQuestionsSolved: 0,
        totalMarksObtained: 0,
        accuracySum: 0,
        examsCount: 0,
        
        // 70 Marks Board Exam metrics
        count70: 0,
        best70Solved: 0,
        best70Marks: 0,
        best70Percentage: 0,

        // 140 Questions Drill metrics
        count140: 0,
        best140Solved: 0,
        best140Marks: 0,
        best140MaxMarks: 70,
        best140Percentage: 0,

        // Recent session
        lastSession: null
      };

      if (isCurrentUser) {
        existing.isCurrentUser = true;
        if (currentStudentName && currentStudentName.trim()) {
          existing.name = currentStudentName.trim();
        }
      }

      const totalQ = (!isNaN(Number(s.totalQuestions)) && Number(s.totalQuestions) > 0) ? Number(s.totalQuestions) : 70;
      const maxM = (!isNaN(Number(s.maxMarks)) && Number(s.maxMarks) > 0) ? Number(s.maxMarks) : totalQ;
      const marks = !isNaN(Number(s.marksObtained)) ? Number(s.marksObtained) : 0;
      
      // Calculate questions correctly solved safely without NaN
      let correct = 0;
      if (s.correctCount !== undefined && s.correctCount !== null && !isNaN(Number(s.correctCount))) {
        correct = Number(s.correctCount);
      } else if (marks > 0) {
        const markPerQ = (!isNaN(Number(s.markPerQuestion)) && Number(s.markPerQuestion) > 0) ? Number(s.markPerQuestion) : 1.0;
        correct = Math.round(marks / markPerQ);
      }
      correct = Math.max(0, correct);

      const rawPct = Number(s.percentage);
      const pct = (!isNaN(rawPct) && rawPct >= 0) ? rawPct : (maxM > 0 ? Math.round((marks / maxM) * 100) : 0);
      const rawAcc = Number(s.accuracy);
      const acc = (!isNaN(rawAcc) && rawAcc >= 0) ? rawAcc : pct;

      existing.totalQuestionsAttempted += totalQ;
      existing.totalQuestionsSolved = (Number(existing.totalQuestionsSolved) || 0) + correct;
      existing.totalMarksObtained = Math.round(((Number(existing.totalMarksObtained) || 0) + marks) * 10) / 10;
      existing.accuracySum += acc;
      existing.examsCount += 1;

      // Detect 70 Marks vs 140 Questions Drill reliably
      const is70 = totalQ === 70 || s.examType === '70_marks' || (s.examTitle && s.examTitle.toLowerCase().includes('70'));
      const is140 = totalQ === 140 || s.examType === '140_half' || s.examType === '140_full' || (s.examTitle && s.examTitle.toLowerCase().includes('140'));

      // Track 70 Marks Exam performance
      if (is70) {
        existing.count70 += 1;
        if (existing.count70 === 1 || marks > existing.best70Marks || (marks === existing.best70Marks && correct > existing.best70Solved)) {
          existing.best70Marks = marks;
          existing.best70Solved = correct;
          existing.best70Percentage = pct;
        }
      }

      // Track 140 Questions Drill performance
      if (is140) {
        existing.count140 += 1;
        if (existing.count140 === 1 || correct > existing.best140Solved || (correct === existing.best140Solved && marks > existing.best140Marks)) {
          existing.best140Solved = correct;
          existing.best140Marks = marks;
          existing.best140MaxMarks = maxM;
          existing.best140Percentage = pct;
        }
      }

      if (!existing.lastSession || new Date(s.timestamp) > new Date(existing.lastSession.timestamp)) {
        existing.lastSession = s;
      }

      studentStats.set(studentKey, existing);
    });

    // If current student has no exam yet, show with 0 Qs if not opted out
    if (!isOptedOut && currId && !studentStats.has(currId)) {
      studentStats.set(currId, {
        id: currId,
        studentId: currId,
        name: currentStudentName || 'Candidate',
        college: "Your Institution",
        isCurrentUser: true,
        totalQuestionsAttempted: 0,
        totalQuestionsSolved: 0,
        totalMarksObtained: 0,
        accuracySum: 0,
        examsCount: 0,
        count70: 0,
        best70Solved: 0,
        best70Marks: 0,
        best70Percentage: 0,
        count140: 0,
        best140Solved: 0,
        best140Marks: 0,
        best140MaxMarks: 70,
        best140Percentage: 0,
        lastSession: null
      });
    }

    if (isOptedOut && currId) {
      studentStats.delete(currId);
    }

    // Compute average accuracy
    Array.from(studentStats.values()).forEach(item => {
      item.accuracy = item.examsCount > 0 ? Math.round(item.accuracySum / item.examsCount) : 0;
      item.totalQuestionsSolved = Number(item.totalQuestionsSolved) || 0;
      item.totalMarksObtained = Math.round((Number(item.totalMarksObtained) || 0) * 10) / 10;
    });

    return Array.from(studentStats.values());
  }, [sessions, currentStudentName, resolvedStudentId, isOptedOut]);

  // Filter and sort rankings according to selected exam tab
  const tabRankings = useMemo(() => {
    let list = [...allStudentStats];

    if (examTab === '70_marks') {
      // Show only students who have attempted 70 Marks Board Exam (or current student)
      list = list.filter(s => s.count70 > 0 || (s.isCurrentUser && s.examsCount === 0));
      list.sort((a, b) => {
        if (b.best70Marks !== a.best70Marks) return b.best70Marks - a.best70Marks;
        if (b.best70Solved !== a.best70Solved) return b.best70Solved - a.best70Solved;
        return b.best70Percentage - a.best70Percentage;
      });
    } else if (examTab === '140_drill') {
      // Show only students who have attempted 140 Questions Drill (or current student)
      list = list.filter(s => s.count140 > 0 || (s.isCurrentUser && s.examsCount === 0));
      list.sort((a, b) => {
        if (b.best140Solved !== a.best140Solved) return b.best140Solved - a.best140Solved;
        if (b.best140Marks !== a.best140Marks) return b.best140Marks - a.best140Marks;
        return b.best140Percentage - a.best140Percentage;
      });
    } else {
      // Overall: sorted by total questions solved, then total marks obtained
      list.sort((a, b) => {
        const aSolved = Number(a.totalQuestionsSolved) || 0;
        const bSolved = Number(b.totalQuestionsSolved) || 0;
        if (bSolved !== aSolved) {
          return bSolved - aSolved;
        }
        return (Number(b.totalMarksObtained) || 0) - (Number(a.totalMarksObtained) || 0);
      });
    }

    return list.map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));
  }, [allStudentStats, examTab]);

  const filteredRankings = useMemo(() => {
    if (!searchQuery.trim()) return tabRankings;
    const q = searchQuery.toLowerCase();
    return tabRankings.filter(r => 
      r.name.toLowerCase().includes(q) || 
      (r.college || '').toLowerCase().includes(q)
    );
  }, [tabRankings, searchQuery]);

  const currentUserStanding = allStudentStats.find(r => r.isCurrentUser);
  const currentUserInTab = tabRankings.find(r => r.isCurrentUser);

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8 text-zinc-900 dark:text-[#E3E3E3]">
      {/* Header */}
      <div className="border-b border-zinc-800 dark:border-white/45 pb-6 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold text-amber-700 dark:text-[#D1B280]">
              <Trophy className="h-4 w-4" />
              <span>DIPLOMA HALL OF FAME</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight mt-1">
              Top Scholar Leaderboard
            </h1>
            <p className="text-sm text-zinc-600 dark:text-[#9B9A97] mt-1 leading-relaxed">
              Real-time rankings tracking <strong className="text-zinc-900 dark:text-white">70 Marks Board Exams</strong> and <strong className="text-zinc-900 dark:text-white">140 Questions Drills</strong> with verified questions solved across polytechnics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#202020] px-3 py-2 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-[#9B9A97] hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#282828] transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Leaderboard & Privacy Settings"
              >
                <Settings className="h-4 w-4" />
                <span>Opt-out / Settings</span>
              </button>
            )}

            {onLaunchExam && (
              <button
                type="button"
                onClick={() => onLaunchExam(examTab === '140_drill' ? '140_half' : '70_marks')}
                className="rounded-sm border border-zinc-900 dark:border-white/60 bg-zinc-900 dark:bg-white px-4 py-2 text-xs sm:text-sm font-bold text-white dark:text-[#191919] hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Zap className="h-4 w-4 text-amber-400 fill-current" />
                <span>{examTab === '140_drill' ? 'Solve 140 Qs Drill' : 'Solve 70 Marks Exam'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cloud Sync Status Notice */}
      {cloudSyncStatus === 'pending_setup' && (
        <div className="rounded-md border border-amber-600/50 bg-amber-50/60 dark:bg-[#261E14] p-3 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-800 dark:text-[#D1B280]">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <div>
              <span className="font-bold">Device Local Mode Active</span>: To sync exams between your phone and laptop in real-time, click <strong>"Create database"</strong> in your open Firebase Console tab (under <em>Build → Firestore Database → Start in test mode</em>).
            </div>
          </div>
          <span className="text-[11px] font-mono text-zinc-500 shrink-0">Auto-merges upon creation</span>
        </div>
      )}

      {cloudSyncStatus === 'connected' && (
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 dark:text-[#85B59A] bg-emerald-500/10 dark:bg-[#1D2B22] border border-emerald-600/30 px-3 py-1.5 rounded-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
          <span>Live Multi-Device Cloud Sync Active — Scores sync across all mobile and desktop devices in real time.</span>
        </div>
      )}

      {/* Mindful Private Study Mode Notice (If student opted out of comparison) */}
      {isOptedOut && (
        <div className="rounded-md border border-emerald-800/50 dark:border-white/50 bg-emerald-500/10 dark:bg-[#24332C]/60 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <HeartHandshake className="h-5 w-5 text-emerald-600 dark:text-[#85B59A] shrink-0" />
            <div>
              <div className="text-sm font-bold text-zinc-900 dark:text-white">
                Private Study Mode Active
              </div>
              <div className="text-xs text-zinc-600 dark:text-[#9B9A97]">
                Your name and scores are completely hidden from this leaderboard. You are preparing quietly at your own pace without peer pressure.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            {onToggleOptOut && (
              <button
                type="button"
                onClick={onToggleOptOut}
                className="rounded-sm border border-emerald-800 dark:border-white/50 bg-emerald-700 dark:bg-[#24332C] px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 dark:hover:bg-[#2f4339] transition-colors cursor-pointer shadow-xs"
              >
                Turn Off Private Mode
              </button>
            )}
            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="text-xs font-semibold text-emerald-700 dark:text-[#85B59A] hover:underline cursor-pointer"
              >
                Preferences →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Current Student's Rank & Performance Overview Card */}
      {currentUserStanding && (
        <div className="rounded-md border-2 border-amber-600 dark:border-amber-400 bg-amber-50/60 dark:bg-[#2A2318] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-amber-500 text-white font-mono font-black text-xl shadow-xs">
                #{currentUserInTab?.rank || 1}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base sm:text-lg text-zinc-900 dark:text-white">
                    {currentUserStanding.name} (You)
                  </span>
                  <span className="rounded-xs border border-amber-700 bg-amber-100 dark:bg-[#3E3220] px-2 py-0.5 text-xs font-bold text-amber-800 dark:text-[#D1B280]">
                    Your Standing
                  </span>
                </div>
                <div className="text-xs text-zinc-600 dark:text-[#9B9A97]">
                  {currentUserStanding.examsCount === 0 
                    ? "Take a 70 Marks or 140 Questions exam to record your first points!" 
                    : `${currentUserStanding.examsCount} tests completed • ${currentUserStanding.accuracy || 0}% overall accuracy`}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div>
                <div className="text-xs font-bold text-zinc-500 uppercase">Total Questions Solved</div>
                <div className="text-2xl font-mono font-extrabold text-zinc-900 dark:text-white">
                  {Number(currentUserStanding.totalQuestionsSolved) || 0} Qs
                </div>
              </div>
              <div className="border-l border-zinc-300 dark:border-zinc-700 pl-4">
                <div className="text-xs font-bold text-zinc-500 uppercase">Total Points</div>
                <div className="text-2xl font-mono font-extrabold text-amber-600 dark:text-[#D1B280]">
                  {Number(currentUserStanding.totalMarksObtained) || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Exam Tier Badges for Current Student */}
          <div className="pt-3 border-t border-amber-600/30 dark:border-amber-400/30 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-sm border border-amber-600/40 dark:border-amber-400/30 bg-white/70 dark:bg-[#1E1912] p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-600 dark:text-[#85B59A]" />
                <span className="font-bold text-zinc-800 dark:text-zinc-200">70 Marks Board Exam:</span>
              </div>
              <span className="font-mono font-bold text-zinc-900 dark:text-white">
                {currentUserStanding.count70 > 0 
                  ? `${currentUserStanding.best70Solved || 0} / 70 Solved (${currentUserStanding.best70Marks || 0}/70 M)`
                  : 'Not Attempted Yet'}
              </span>
            </div>

            <div className="rounded-sm border border-amber-600/40 dark:border-amber-400/30 bg-white/70 dark:bg-[#1E1912] p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-sky-600 dark:text-[#8FAFC4]" />
                <span className="font-bold text-zinc-800 dark:text-zinc-200">140 Questions Drill:</span>
              </div>
              <span className="font-mono font-bold text-zinc-900 dark:text-white">
                {currentUserStanding.count140 > 0 
                  ? `${currentUserStanding.best140Solved || 0} / 140 Solved (${currentUserStanding.best140Marks || 0}/${currentUserStanding.best140MaxMarks || 70} M)`
                  : 'Not Attempted Yet'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Exam Format Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="inline-flex rounded-md border border-zinc-800 dark:border-white/45 bg-zinc-100 dark:bg-[#202020] p-1 text-xs sm:text-sm font-semibold">
          <button
            type="button"
            onClick={() => setExamTab('all')}
            className={`px-3 py-1.5 rounded-sm transition-all cursor-pointer flex items-center gap-1.5 ${
              examTab === 'all'
                ? 'bg-white dark:bg-[#2C2C2C] text-zinc-900 dark:text-white shadow-xs font-bold'
                : 'text-zinc-600 dark:text-[#9B9A97] hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>All Formats</span>
          </button>

          <button
            type="button"
            onClick={() => setExamTab('70_marks')}
            className={`px-3 py-1.5 rounded-sm transition-all cursor-pointer flex items-center gap-1.5 ${
              examTab === '70_marks'
                ? 'bg-white dark:bg-[#2C2C2C] text-zinc-900 dark:text-white shadow-xs font-bold'
                : 'text-zinc-600 dark:text-[#9B9A97] hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Target className="h-3.5 w-3.5 text-emerald-600 dark:text-[#85B59A]" />
            <span>70 Marks Board Exam</span>
          </button>

          <button
            type="button"
            onClick={() => setExamTab('140_drill')}
            className={`px-3 py-1.5 rounded-sm transition-all cursor-pointer flex items-center gap-1.5 ${
              examTab === '140_drill'
                ? 'bg-white dark:bg-[#2C2C2C] text-zinc-900 dark:text-white shadow-xs font-bold'
                : 'text-zinc-600 dark:text-[#9B9A97] hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-sky-600 dark:text-[#8FAFC4]" />
            <span>140 Questions Drill</span>
          </button>
        </div>

        {/* Search Filter */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500 dark:text-[#9B9A97]" />
          <input
            type="text"
            placeholder="Search student or college..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#202020] py-1.5 pl-9 pr-3 text-xs sm:text-sm text-zinc-900 dark:text-[#E3E3E3] focus:border-zinc-950 dark:focus:border-white focus:outline-hidden"
          />
        </div>
      </div>

      {/* Main Leaderboard Table or Empty State */}
      {filteredRankings.length === 0 ? (
        <div className="rounded-md border border-zinc-800 dark:border-white/45 bg-white dark:bg-[#202020] p-12 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-sm bg-amber-500/10 dark:bg-[#362D1F] border border-amber-600/30 text-amber-600 dark:text-[#D1B280]">
            <Trophy className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {examTab === '70_marks' 
                ? 'No 70 Marks Submissions Yet' 
                : examTab === '140_drill' 
                ? 'No 140 Questions Submissions Yet' 
                : 'No Exam Submissions Yet'}
            </h3>
            <p className="text-sm text-zinc-600 dark:text-[#9B9A97] max-w-md mx-auto">
              Complete your exam now to register your score, see how many you solved out of {examTab === '140_drill' ? '140' : '70'}, and claim Rank #1!
            </p>
          </div>
          {onLaunchExam && (
            <button
              type="button"
              onClick={() => onLaunchExam(examTab === '140_drill' ? '140_half' : '70_marks')}
              className="rounded-sm border border-zinc-900 dark:border-white/60 bg-zinc-900 dark:bg-white px-5 py-2 text-sm font-bold text-white dark:text-[#191919] hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <Zap className="h-4 w-4 text-amber-400 fill-current" />
              <span>{examTab === '140_drill' ? 'Start 140 Questions Drill' : 'Start 70 Marks Board Exam'}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-zinc-800 dark:border-white/50 bg-white dark:bg-[#202020] shadow-xs">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-zinc-800 dark:border-white/45 text-zinc-600 dark:text-[#9B9A97] font-bold bg-zinc-50 dark:bg-[#191919]">
                <th className="py-3 px-4 font-bold text-center w-16">Rank</th>
                <th className="py-3 px-4 font-bold">Candidate Scholar</th>
                
                {examTab === '70_marks' && (
                  <>
                    <th className="py-3 px-4 font-bold text-center">70M Solved</th>
                    <th className="py-3 px-4 font-bold text-center">Score (70M)</th>
                    <th className="py-3 px-4 font-bold text-center">Percentage</th>
                    <th className="py-3 px-4 font-bold text-right">Attempts</th>
                  </>
                )}

                {examTab === '140_drill' && (
                  <>
                    <th className="py-3 px-4 font-bold text-center">140Q Solved</th>
                    <th className="py-3 px-4 font-bold text-center">Marks Scored</th>
                    <th className="py-3 px-4 font-bold text-center">Accuracy</th>
                    <th className="py-3 px-4 font-bold text-right">Attempts</th>
                  </>
                )}

                {examTab === 'all' && (
                  <>
                    <th className="py-3 px-4 font-bold text-center">Questions Solved</th>
                    <th className="py-3 px-4 font-bold text-center">Total Points</th>
                    <th className="py-3 px-4 font-bold text-center">Accuracy</th>
                    <th className="py-3 px-4 font-bold text-right">Tests Taken</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 dark:divide-white/45">
              {filteredRankings.map((student) => {
                const isFirst = student.rank === 1;
                const isSecond = student.rank === 2;
                const isThird = student.rank === 3;

                return (
                  <tr
                    key={student.id || student.studentId || `${student.name}_${student.rank}`}
                    className={`transition-colors ${
                      student.isCurrentUser
                        ? 'bg-amber-100/50 dark:bg-[#2B2317] font-semibold'
                        : 'hover:bg-zinc-50 dark:hover:bg-[#252525]'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-sm sm:text-base">
                      {isFirst ? '🥇 #1' : isSecond ? '🥈 #2' : isThird ? '🥉 #3' : `#${student.rank}`}
                    </td>

                    {/* Candidate Scholar & Format Badges */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900 dark:text-white text-sm sm:text-base">
                          {student.name}
                        </span>
                        {student.isCurrentUser && (
                          <span className="rounded-xs border border-amber-700 bg-amber-100 dark:bg-[#362D1F] px-1.5 py-0.2 text-[10px] font-bold text-amber-800 dark:text-[#D1B280]">
                            YOU
                          </span>
                        )}
                      </div>
                      
                      <div className="text-xs text-zinc-500 dark:text-[#9B9A97] flex flex-wrap items-center gap-2 mt-0.5">
                        <span>{student.college}</span>
                        {examTab === 'all' && (
                          <>
                            {student.count70 > 0 && (
                              <span className="rounded-xs border border-emerald-800/40 dark:border-white/30 bg-emerald-50 dark:bg-[#202B24] px-1.5 py-0.2 text-[10px] font-mono text-emerald-800 dark:text-[#85B59A]">
                                70M: {student.best70Solved || 0}/70
                              </span>
                            )}
                            {student.count140 > 0 && (
                              <span className="rounded-xs border border-sky-800/40 dark:border-white/30 bg-sky-50 dark:bg-[#1E2933] px-1.5 py-0.2 text-[10px] font-mono text-sky-800 dark:text-[#8FAFC4]">
                                140Q: {student.best140Solved || 0}/140
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>

                    {/* 70 Marks Columns */}
                    {examTab === '70_marks' && (
                      <>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
                          {student.best70Solved || 0} / 70 Solved
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-sm sm:text-base text-amber-600 dark:text-[#D1B280]">
                          {student.best70Marks || 0} / 70 M
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="rounded-sm border border-emerald-800/40 dark:border-white/30 bg-emerald-50 dark:bg-[#191919] px-2 py-0.5 text-xs font-mono font-bold text-emerald-800 dark:text-[#85B59A]">
                            {student.best70Percentage || 0}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-zinc-600 dark:text-[#9B9A97]">
                          {student.count70} {student.count70 === 1 ? 'Exam' : 'Exams'}
                        </td>
                      </>
                    )}

                    {/* 140 Questions Columns */}
                    {examTab === '140_drill' && (
                      <>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
                          {student.best140Solved || 0} / 140 Solved
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-sm sm:text-base text-amber-600 dark:text-[#D1B280]">
                          {student.best140Marks || 0} / {student.best140MaxMarks || 70} M
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="rounded-sm border border-sky-800/40 dark:border-white/30 bg-sky-50 dark:bg-[#191919] px-2 py-0.5 text-xs font-mono font-bold text-sky-800 dark:text-[#8FAFC4]">
                            {student.best140Percentage || 0}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-zinc-600 dark:text-[#9B9A97]">
                          {student.count140} {student.count140 === 1 ? 'Drill' : 'Drills'}
                        </td>
                      </>
                    )}

                    {/* Overall All-Formats Columns */}
                    {examTab === 'all' && (
                      <>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
                          {Number(student.totalQuestionsSolved) || 0} Qs
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-sm sm:text-base text-amber-600 dark:text-[#D1B280]">
                          {Number(student.totalMarksObtained) || 0}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="rounded-sm border border-zinc-800 dark:border-white/30 bg-zinc-100 dark:bg-[#191919] px-2 py-0.5 text-xs font-mono font-bold">
                            {student.accuracy || 0}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-zinc-600 dark:text-[#9B9A97]">
                          {student.examsCount} {student.examsCount === 1 ? 'Exam' : 'Exams'}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
