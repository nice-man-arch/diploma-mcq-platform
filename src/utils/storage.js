// src/utils/storage.js

const MISTAKES_KEY = 'diploma_mcq_mistakes';
const BOOKMARKS_KEY = 'diploma_mcq_bookmarks';
const HISTORY_KEY = 'diploma_mcq_history';

export function getMistakes() {
  try {
    const raw = localStorage.getItem(MISTAKES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load mistakes:', e);
    return [];
  }
}

export function saveMistake(questionId, selectedOption, correctOption) {
  try {
    const list = getMistakes();
    const existingIndex = list.findIndex(m => m.id === questionId);
    const now = Date.now();
    if (existingIndex >= 0) {
      list[existingIndex].count = (list[existingIndex].count || 1) + 1;
      list[existingIndex].lastFailedAt = now;
      list[existingIndex].lastSelected = selectedOption;
    } else {
      list.push({
        id: questionId,
        count: 1,
        lastFailedAt: now,
        lastSelected: selectedOption,
        correctOption
      });
    }
    localStorage.setItem(MISTAKES_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save mistake:', e);
  }
}

export function removeMistake(questionId) {
  try {
    const list = getMistakes().filter(m => m.id !== questionId);
    localStorage.setItem(MISTAKES_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to remove mistake:', e);
  }
}

export function clearAllMistakes() {
  localStorage.removeItem(MISTAKES_KEY);
}

export function getBookmarks() {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function toggleBookmark(questionId) {
  try {
    const list = getBookmarks();
    let updated;
    if (list.includes(questionId)) {
      updated = list.filter(id => id !== questionId);
    } else {
      updated = [...list, questionId];
    }
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return [];
  }
}

export function getQuizHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveQuizResult(record) {
  try {
    const list = getQuizHistory();
    list.unshift({ ...record, id: Date.now() });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 30)));
  } catch (e) {
    console.error('Failed to save history:', e);
  }
}
