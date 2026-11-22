// src/utils/sessionService.js
import { db } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, doc, updateDoc, setDoc, where } from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'diploma_student_sessions';
const STUDENT_PROFILE_KEY = 'diploma_current_student_profile';
const STUDENT_ID_KEY = 'diploma_student_id';

/**
 * Get or create a unique persistent student candidate ID
 * Allows multiple different students across devices/colleges to share the same name
 */
export function getOrCreateStudentId() {
  try {
    let id = localStorage.getItem(STUDENT_ID_KEY);
    if (!id) {
      id = 'std_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
      localStorage.setItem(STUDENT_ID_KEY, id);
    }
    return id;
  } catch {
    return 'std_' + Date.now().toString(36);
  }
}

/**
 * Helper to safely extract a non-NaN number
 */
function safeNumber(val, fallback = 0) {
  if (val === null || val === undefined) return fallback;
  const num = Number(val);
  return isNaN(num) ? fallback : num;
}

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
 * Update student display name across storage, sessions, and Firestore
 */
export async function updateStudentName(newName) {
  if (!newName || !newName.trim()) return;
  const trimmed = newName.trim();
  const oldName = localStorage.getItem('diploma_student_name') || '';
  const currentId = getOrCreateStudentId();

  // 1. Update localStorage key
  localStorage.setItem('diploma_student_name', trimmed);

  // 2. Update student profile
  try {
    const profile = getSavedStudentProfile() || {};
    profile.name = trimmed;
    profile.id = currentId;
    saveStudentProfile(profile);
  } catch {}

  // 3. Update all existing local student sessions to the new name
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const updated = parsed.map(s => {
          if (!s.studentId || s.studentId === currentId || (oldName && s.studentName === oldName)) {
            return {
              ...s,
              studentName: trimmed,
              studentId: currentId
            };
          }
          return s;
        });
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      }
    }
  } catch (e) {
    console.error('Error updating local sessions with new name:', e);
  }

  // 4. Update in Firebase Firestore in the background
  try {
    // a) Upsert student profile document for instant cross-device lookup
    setDoc(doc(db, 'student_profiles', currentId), {
      studentId: currentId,
      studentName: trimmed,
      updatedAt: new Date().toISOString()
    }, { merge: true }).catch(() => {});

    // b) Update all existing sessions for this student
    const q = query(
      collection(db, 'leaderboard_sessions'),
      where('studentId', '==', currentId)
    );
    const snap = await getDocs(q);
    snap.docs.forEach(async (d) => {
      try {
        await updateDoc(doc(db, 'leaderboard_sessions', d.id), {
          studentName: trimmed
        });
      } catch {}
    });
  } catch (err) {
    console.warn('Firestore name sync notice:', err.message);
  }

  // 5. Notify all components immediately with zero latency
  try {
    window.dispatchEvent(new CustomEvent('diploma_student_name_updated', { 
      detail: { name: trimmed, studentId: currentId } 
    }));
    window.dispatchEvent(new CustomEvent('diploma_session_recorded'));
  } catch {}

  return trimmed;
}

/**
 * Save a completed student exam session to Firebase Firestore & local storage
 */
export async function recordStudentSession(sessionData) {
  const isOptedOut = localStorage.getItem('diploma_leaderboard_opt_out') === 'true';
  const resolvedName = isOptedOut ? 'Anonymous Scholar' : (sessionData.studentName || 'Scholar');

  // Detect exam format / tier
  const totalQ = safeNumber(sessionData.totalQuestions, 70);
  const markPerQ = safeNumber(sessionData.markPerQuestion, 1.0) || 1.0;
  const maxM = safeNumber(sessionData.maxMarks, (totalQ === 140 && markPerQ === 0.5 ? 70 : totalQ));
  const marks = safeNumber(sessionData.marksObtained, 0);

  // Calculate correct questions solved safely (never NaN)
  let correct = 0;
  if (sessionData.correctCount !== undefined && sessionData.correctCount !== null && !isNaN(Number(sessionData.correctCount))) {
    correct = Number(sessionData.correctCount);
  } else if (marks > 0 && markPerQ > 0) {
    correct = Math.round(marks / markPerQ);
  }
  correct = Math.max(0, correct);

  let examType = 'custom';
  if (totalQ === 70) {
    examType = '70_marks';
  } else if (totalQ === 140) {
    examType = maxM === 140 ? '140_full' : '140_half';
  } else if (totalQ === 25) {
    examType = 'quick_25';
  }

  const studentId = sessionData.studentId || getOrCreateStudentId();

  const sessionRecord = {
    id: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    studentId,
    studentName: resolvedName,
    college: sessionData.college || 'Polytechnic Student',
    examTitle: sessionData.examTitle || (totalQ === 140 ? (maxM === 140 ? '140 Marks Full Mock' : '140 Questions (Half-Mark Drill)') : '70 Marks Board Exam'),
    examType,
    totalQuestions: totalQ,
    correctCount: correct,
    wrongCount: safeNumber(sessionData.wrongCount, 0),
    unattemptedCount: safeNumber(sessionData.unattemptedCount, 0),
    maxMarks: maxM,
    marksObtained: marks,
    markPerQuestion: markPerQ,
    percentage: safeNumber(sessionData.percentage, maxM > 0 ? Math.round((marks / maxM) * 100) : 0),
    accuracy: safeNumber(sessionData.accuracy, 0),
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
      studentId: sessionRecord.studentId,
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

    // Also upsert profile
    setDoc(doc(db, 'student_profiles', sessionRecord.studentId), {
      studentId: sessionRecord.studentId,
      studentName: sessionRecord.studentName,
      college: sessionRecord.college,
      lastActive: sessionRecord.timestamp
    }, { merge: true }).catch(() => {});
  } catch (firebaseErr) {
    console.warn('Firebase cloud sync notice (stored locally):', firebaseErr.message);
  }

  return sessionRecord;
}

/**
 * Get sessions from localStorage and merged past test histories, sanitized against NaN
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
            const marks = safeNumber(s.marksObtained, 0);
            const markPerQ = safeNumber(s.markPerQuestion, 1.0) || 1.0;
            let correct = 0;
            if (s.correctCount !== undefined && s.correctCount !== null && !isNaN(Number(s.correctCount))) {
              correct = Number(s.correctCount);
            } else if (marks > 0 && markPerQ > 0) {
              correct = Math.round(marks / markPerQ);
            }

            map.set(s.id || s.timestamp, {
              ...s,
              studentId: s.studentId || getOrCreateStudentId(),
              totalQuestions: safeNumber(s.totalQuestions, 70),
              correctCount: Math.max(0, correct),
              marksObtained: marks,
              maxMarks: safeNumber(s.maxMarks, 70),
              percentage: safeNumber(s.percentage, 0),
              accuracy: safeNumber(s.accuracy, 0)
            });
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
            const totalQ = safeNumber(h.totalQuestions, 70);
            const maxM = safeNumber(h.maxMarks, totalQ);
            const marks = safeNumber(h.marksObtained, 0);
            let correct = 0;
            if (h.correctCount !== undefined && h.correctCount !== null && !isNaN(Number(h.correctCount))) {
              correct = Number(h.correctCount);
            } else if (marks > 0) {
              correct = Math.round(marks);
            }

            let examType = 'custom';
            if (totalQ === 70) examType = '70_marks';
            else if (totalQ === 140) examType = maxM === 140 ? '140_full' : '140_half';
            else if (totalQ === 25) examType = 'quick_25';

            map.set(key, {
              id: key,
              studentId: getOrCreateStudentId(),
              studentName,
              college: 'Polytechnic Student',
              examTitle: h.title || (totalQ === 140 ? '140 Questions Drill' : '70 Marks Board Exam'),
              examType,
              totalQuestions: totalQ,
              correctCount: Math.max(0, correct),
              wrongCount: safeNumber(h.wrongCount, 0),
              unattemptedCount: safeNumber(h.unattemptedCount, 0),
              maxMarks: maxM,
              marksObtained: marks,
              markPerQuestion: maxM === 70 && totalQ === 140 ? 0.5 : 1.0,
              percentage: safeNumber(h.percentage, 0),
              accuracy: safeNumber(h.accuracy, 0),
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
        return snap.docs.map(doc => {
          const d = doc.data();
          const marks = safeNumber(d.marksObtained, 0);
          const markPerQ = safeNumber(d.markPerQuestion, 1.0) || 1.0;
          let correct = 0;
          if (d.correctCount !== undefined && d.correctCount !== null && !isNaN(Number(d.correctCount))) {
            correct = Number(d.correctCount);
          } else if (marks > 0 && markPerQ > 0) {
            correct = Math.round(marks / markPerQ);
          }

          return {
            id: doc.id,
            studentId: d.studentId || doc.id,
            ...d,
            totalQuestions: safeNumber(d.totalQuestions, 70),
            correctCount: Math.max(0, correct),
            marksObtained: marks,
            maxMarks: safeNumber(d.maxMarks, 70),
            percentage: safeNumber(d.percentage, 0),
            accuracy: safeNumber(d.accuracy, 0)
          };
        });
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

const SYNCED_IDS_KEY = 'diploma_synced_session_ids';
let isSyncInProgress = false;

function getSyncedIds() {
  try {
    const raw = localStorage.getItem(SYNCED_IDS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function recordSyncedId(id) {
  try {
    const set = getSyncedIds();
    set.add(id);
    localStorage.setItem(SYNCED_IDS_KEY, JSON.stringify(Array.from(set).slice(-500)));
  } catch {}
}

/**
 * Automatically sync un-uploaded local sessions to Cloud Firestore when database is active
 */
export async function syncLocalSessionsToCloud() {
  if (isSyncInProgress) return 0;
  isSyncInProgress = true;

  try {
    const local = getLocalSessions();
    if (!local || local.length === 0) return 0;

    const syncedSet = getSyncedIds();
    let syncedCount = 0;
    const myId = getOrCreateStudentId();
    const currentName = localStorage.getItem('diploma_student_name');

    for (const s of local) {
      const sessionId = s.id || s.timestamp;
      if (!s.firebaseSynced && !s.firebaseId && !syncedSet.has(sessionId)) {
        try {
          const resolvedName = (s.studentId === myId && currentName && currentName.trim())
            ? currentName.trim()
            : (s.studentName || 'Scholar');

          const docRef = await addDoc(collection(db, 'leaderboard_sessions'), {
            studentId: s.studentId || myId,
            studentName: resolvedName,
            college: s.college || 'Polytechnic Student',
            examTitle: s.examTitle,
            examType: s.examType,
            totalQuestions: s.totalQuestions,
            correctCount: s.correctCount || 0,
            wrongCount: s.wrongCount || 0,
            unattemptedCount: s.unattemptedCount || 0,
            maxMarks: s.maxMarks,
            marksObtained: s.marksObtained,
            markPerQuestion: s.markPerQuestion || 1.0,
            percentage: s.percentage,
            accuracy: s.accuracy,
            timestamp: s.timestamp
          });
          s.firebaseSynced = true;
          s.firebaseId = docRef.id;
          recordSyncedId(sessionId);
          syncedCount++;
        } catch (err) {
          break; // Stop if Firestore rejects or API disabled
        }
      }
    }

    if (syncedCount > 0) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(local));
      } catch {}
    }
    return syncedCount;
  } finally {
    isSyncInProgress = false;
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
