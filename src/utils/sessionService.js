// src/utils/sessionService.js
import { db } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'diploma_student_sessions';
const STUDENT_PROFILE_KEY = 'diploma_current_student_profile';

/**
 * Get cached student profile
 */
export function getSavedStudentProfile() {
  try {
    const raw = localStorage.getItem(STUDENT_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Save current student profile
 */
export function saveStudentProfile(profile) {
  try {
    localStorage.setItem(STUDENT_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving student profile:', e);
  }
}

/**
 * Save a completed student exam session to Firebase Firestore & local storage
 */
export async function recordStudentSession(sessionData) {
  const isOptedOut = localStorage.getItem('diploma_leaderboard_opt_out') === 'true';
  const resolvedName = isOptedOut ? 'Anonymous Scholar' : (sessionData.studentName || 'Scholar');

  // Detect exam format / tier
  const totalQ = Number(sessionData.totalQuestions) || 70;
  const markPerQ = Number(sessionData.markPerQuestion) || 1.0;
  const maxM = Number(sessionData.maxMarks) || (totalQ === 140 && markPerQ === 0.5 ? 70 : totalQ);
  
  // Calculate correct questions solved
  let correct = 0;
  if (sessionData.correctCount != null) {
    correct = Number(sessionData.correctCount);
  } else if (sessionData.marksObtained != null && markPerQ > 0) {
    correct = Math.round(Number(sessionData.marksObtained) / markPerQ);
  }

  let examType = 'custom';
  if (totalQ === 70) {
    examType = '70_marks';
  } else if (totalQ === 140) {
    examType = maxM === 140 ? '140_full' : '140_half';
  } else if (totalQ === 25) {
    examType = 'quick_25';
  }

  const sessionRecord = {
    id: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    studentName: resolvedName,
    college: sessionData.college || 'Polytechnic Student',
    examTitle: sessionData.examTitle || (totalQ === 140 ? (maxM === 140 ? '140 Marks Full Mock' : '140 Questions (Half-Mark Drill)') : '70 Marks Board Exam'),
    examType,
    totalQuestions: totalQ,
    correctCount: correct,
    wrongCount: Number(sessionData.wrongCount) || 0,
    unattemptedCount: Number(sessionData.unattemptedCount) || 0,
    maxMarks: maxM,
    marksObtained: Number(sessionData.marksObtained) || 0,
    markPerQuestion: markPerQ,
    percentage: Number(sessionData.percentage) || 0,
    accuracy: Number(sessionData.accuracy) || 0,
    timestamp: new Date().toISOString()
  };

  // 1. Cache to local storage immediately (instant synchronous write)
  try {
    const current = getLocalSessions();
    const updated = [sessionRecord, ...current.filter(s => s.id !== sessionRecord.id)];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }

  // 2. Dispatch custom event for instant zero-latency in-app update
  try {
    window.dispatchEvent(new CustomEvent('diploma_session_recorded', { detail: sessionRecord }));
  } catch {}

  // 3. Sync to Firebase Firestore cloud database (with 3.5s timeout guard)
  try {
    const syncPromise = addDoc(collection(db, 'leaderboard_sessions'), {
      studentName: sessionRecord.studentName,
      college: sessionRecord.college,
      examTitle: sessionRecord.examTitle,
      examType: sessionRecord.examType,
      totalQuestions: sessionRecord.totalQuestions,
      correctCount: sessionRecord.correctCount,
      wrongCount: sessionRecord.wrongCount,
      unattemptedCount: sessionRecord.unattemptedCount,
      maxMarks: sessionRecord.maxMarks,
      marksObtained: sessionRecord.marksObtained,
      markPerQuestion: sessionRecord.markPerQuestion,
      percentage: sessionRecord.percentage,
      accuracy: sessionRecord.accuracy,
      timestamp: sessionRecord.timestamp
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Firestore sync timeout')), 3500)
    );

    const docRef = await Promise.race([syncPromise, timeoutPromise]);
    sessionRecord.firebaseId = docRef.id;
  } catch (firebaseErr) {
    console.warn('Firebase cloud sync notice (stored locally):', firebaseErr.message);
  }

  return sessionRecord;
}

/**
 * Get sessions from localStorage and merged past test histories
 */
export function getLocalSessions() {
  const map = new Map();

  // 1. Read primary student sessions
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach(s => {
          if (s && (s.id || s.timestamp)) {
            map.set(s.id || s.timestamp, s);
          }
        });
      }
    }
  } catch {}

  // 2. Also check quiz history from localStorage (diploma_mcq_history) so any past test is never lost
  try {
    const histRaw = localStorage.getItem('diploma_mcq_history');
    const studentName = localStorage.getItem('diploma_student_name') || 'Scholar';
    if (histRaw) {
      const hist = JSON.parse(histRaw);
      if (Array.isArray(hist)) {
        hist.forEach(h => {
          const key = `hist_${h.id || h.timestamp}`;
          if (!map.has(key)) {
            const totalQ = Number(h.totalQuestions) || 70;
            const maxM = Number(h.maxMarks) || totalQ;
            const correct = Number(h.correctCount) != null ? Number(h.correctCount) : Math.round(Number(h.marksObtained) || 0);
            let examType = 'custom';
            if (totalQ === 70) examType = '70_marks';
            else if (totalQ === 140) examType = maxM === 140 ? '140_full' : '140_half';
            else if (totalQ === 25) examType = 'quick_25';

            map.set(key, {
              id: key,
              studentName,
              college: 'Polytechnic Student',
              examTitle: h.title || (totalQ === 140 ? '140 Questions Drill' : '70 Marks Board Exam'),
              examType,
              totalQuestions: totalQ,
              correctCount: correct,
              wrongCount: Number(h.wrongCount) || 0,
              unattemptedCount: Number(h.unattemptedCount) || 0,
              maxMarks: maxM,
              marksObtained: Number(h.marksObtained) || 0,
              markPerQuestion: maxM === 70 && totalQ === 140 ? 0.5 : 1.0,
              percentage: Number(h.percentage) || 0,
              accuracy: Number(h.accuracy) || 0,
              timestamp: h.timestamp ? new Date(h.timestamp).toISOString() : (h.id ? new Date(h.id).toISOString() : new Date().toISOString())
            });
          }
        });
      }
    }
  } catch {}

  return Array.from(map.values()).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Fetch all recorded sessions from Firebase Cloud Database & local storage
 */
export async function getAllStudentSessions() {
  const localSessions = getLocalSessions();

  // Try fetching shared sessions from Firebase Firestore with timeout guard
  try {
    const fetchPromise = (async () => {
      const q = query(
        collection(db, 'leaderboard_sessions'),
        orderBy('timestamp', 'desc'),
        limit(150)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      }
      return [];
    })();

    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve([]), 3000));
    const remoteSessions = await Promise.race([fetchPromise, timeoutPromise]);

    if (remoteSessions && remoteSessions.length > 0) {
      const map = new Map();
      remoteSessions.forEach(s => map.set(s.id || s.timestamp, s));
      localSessions.forEach(s => {
        if (!map.has(s.id)) map.set(s.id, s);
      });

      return Array.from(map.values()).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
  } catch (err) {
    console.warn('Firebase query fallback to local:', err.message);
  }

  return localSessions;
}

/**
 * Delete a session
 */
export async function deleteStudentSession(id) {
  try {
    const local = getLocalSessions().filter(s => s.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(local));
  } catch {}

  return true;
}

/**
 * Clear all sessions
 */
export async function clearAllStudentSessions() {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {}

  return true;
}

/**
 * Export sessions as CSV file
 */
export function exportSessionsToCSV(sessions = []) {
  if (!sessions || sessions.length === 0) {
    alert('No student test records to export.');
    return;
  }

  const headers = [
    'Date & Time',
    'Student Name',
    'College',
    'Exam Format',
    'Total Questions',
    'Solved Correctly',
    'Marks Obtained',
    'Max Marks',
    'Percentage',
    'Accuracy'
  ];

  const rows = sessions.map(s => [
    s.timestamp ? new Date(s.timestamp).toLocaleString('en-IN') : 'N/A',
    `"${(s.studentName || 'Scholar').replace(/"/g, '""')}"`,
    `"${(s.college || 'Polytechnic Student').replace(/"/g, '""')}"`,
    `"${(s.examTitle || (s.totalQuestions === 140 ? '140 Questions Drill' : '70 Marks Exam')).replace(/"/g, '""')}"`,
    s.totalQuestions || 0,
    s.correctCount || 0,
    s.marksObtained || 0,
    s.maxMarks || (s.totalQuestions || 70),
    `${s.percentage || 0}%`,
    `${s.accuracy || 0}%`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `diploma_leaderboard_sessions_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
