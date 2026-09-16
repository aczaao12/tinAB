import type { AttemptRecord } from '../data/types';

const STORAGE_KEYS = {
  USER_NAME: 'tinab_user_name',
  ATTEMPTS: 'tinab_attempts_history',
  SAVED_PROGRESS: 'tinab_saved_progress',
  THEME: 'tinab_theme',
};

export function getUserName(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.USER_NAME) || '';
  } catch {
    return '';
  }
}

export function setUserName(name: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_NAME, name.trim());
  } catch (e) {
    console.error('Failed to save user name', e);
  }
}

export function getAttempts(): AttemptRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveAttempt(attempt: AttemptRecord): void {
  try {
    const history = getAttempts();
    history.unshift(attempt); // Add new attempt at start
    // Limit to last 50 attempts to avoid quota issues
    const trimmed = history.slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save attempt', e);
  }
}

export function deleteAttempt(id: string): void {
  try {
    const history = getAttempts().filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to delete attempt', e);
  }
}

export function clearAllAttempts(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
  } catch (e) {
    console.error('Failed to clear attempts', e);
  }
}
