// src/utils/sessionService.js

const LOCAL_STORAGE_KEY = 'diploma_admin_student_sessions';
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
 * Save a completed student exam session to backend API & localStorage
 */
export async function recordStudentSession(sessionData) {
  const sessionRecord = {
    id: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...sessionData
  };

  // 1. Save to localStorage cache immediately
  try {
    const current = getLocalSessions();
    const updated = [sessionRecord, ...current];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }

  // 2. Send to backend endpoint /api/sessions
  try {
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionRecord),
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      const saved = await res.json();
      return saved;
    }
  } catch (err) {
    console.warn('Backend /api/sessions offline, session preserved in localStorage cache:', err.message);
  }

  return sessionRecord;
}

/**
 * Fetch all recorded sessions for the Admin Panel
 */
export async function getAllStudentSessions() {
  let serverSessions = null;

  // Try fetching from backend API
  try {
    const res = await fetch('/api/sessions', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      serverSessions = await res.json();
    }
  } catch (e) {
    // API not available, will use localStorage
  }

  const localSessions = getLocalSessions();

  if (serverSessions && Array.isArray(serverSessions)) {
    // Merge server and local by ID
    const map = new Map();
    serverSessions.forEach(s => map.set(s.id, s));
    localSessions.forEach(s => {
      if (!map.has(s.id)) map.set(s.id, s);
    });
    const merged = Array.from(map.values()).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    // sync back to local storage
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
    } catch {}
    return merged;
  }

  return localSessions;
}

/**
 * Get sessions from localStorage
 */
function getLocalSessions() {
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
