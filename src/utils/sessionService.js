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

  const sessionRecord = {
    id: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    studentName: resolvedName,
    totalQuestions: Number(sessionData.totalQuestions) || 0,
    marksObtained: Number(sessionData.marksObtained) || 0,
    percentage: Number(sessionData.percentage) || 0,
    accuracy: Number(sessionData.accuracy) || 0,
    examPreset: sessionData.examPreset || 'Practice Exam',
    timestamp: new Date().toISOString()
  };

  // 1. Cache to local storage immediately
  try {
    const current = getLocalSessions();
    const updated = [sessionRecord, ...current];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }

  // 2. Sync to Firebase Firestore cloud database (Shared across all students)
  try {
    const docRef = await addDoc(collection(db, 'leaderboard_sessions'), {
      studentName: sessionRecord.studentName,
      totalQuestions: sessionRecord.totalQuestions,
      marksObtained: sessionRecord.marksObtained,
      percentage: sessionRecord.percentage,
      accuracy: sessionRecord.accuracy,
      examPreset: sessionRecord.examPreset,
      timestamp: sessionRecord.timestamp
    });
    sessionRecord.firebaseId = docRef.id;
  } catch (firebaseErr) {
    console.warn('Firebase cloud sync note (saved locally):', firebaseErr.message);
  }

  return sessionRecord;
}

/**
 * Fetch all recorded sessions from Firebase Cloud Database & local storage
 */
export async function getAllStudentSessions() {
  const localSessions = getLocalSessions();

  // Try fetching shared sessions from Firebase Firestore
  try {
    const q = query(
      collection(db, 'leaderboard_sessions'),
      orderBy('timestamp', 'desc'),
      limit(150)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const remoteSessions = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Merge remote cloud sessions with local session cache
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
 * Get sessions from localStorage
 */
export function getLocalSessions() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Delete a session
 */
export async function deleteStudentSession(id) {
  try {
    const local = getLocalSessions().filter(s => s.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(local));
  } catch {}

  try {
    await fetch(`/api/sessions/${id}`, { method: 'DELETE', signal: AbortSignal.timeout(3000) });
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

  try {
    await fetch('/api/sessions', { method: 'DELETE', signal: AbortSignal.timeout(3000) });
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
    'Session ID',
    'Date & Time',
    'Student Name',
    'Roll Number',
    'College / Dept',
    'City',
    'Region',
    'Country',
    'Latitude',
    'Longitude',
    'IP Address',
    'Location Source',
    'Exam Title',
    'Total Questions',
    'Marks Obtained',
    'Max Marks',
    'Percentage (%)',
    'Accuracy (%)',
    'Correct Count',
    'Wrong Count',
    'Time Taken (Sec)'
  ];

  const rows = sessions.map(s => {
    const loc = s.location || {};
    return [
      `"${s.id || ''}"`,
      `"${s.timestamp ? new Date(s.timestamp).toLocaleString() : ''}"`,
      `"${(s.studentName || 'Anonymous').replace(/"/g, '""')}"`,
      `"${(s.studentId || 'N/A').replace(/"/g, '""')}"`,
      `"${(s.college || 'N/A').replace(/"/g, '""')}"`,
      `"${(loc.city || '').replace(/"/g, '""')}"`,
      `"${(loc.region || '').replace(/"/g, '""')}"`,
      `"${(loc.country || '').replace(/"/g, '""')}"`,
      loc.latitude || '',
      loc.longitude || '',
      `"${loc.ip || ''}"`,
      `"${loc.source || ''}"`,
      `"${(s.examTitle || '').replace(/"/g, '""')}"`,
      s.totalQuestions || 0,
      s.marksObtained || 0,
      s.maxMarks || 0,
      s.percentage || 0,
      s.accuracy || 0,
      s.correctCount || 0,
      s.wrongCount || 0,
      s.timeTakenSeconds || 0
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Diploma_Students_Exam_Results_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
