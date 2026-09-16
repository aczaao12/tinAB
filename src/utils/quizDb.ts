import type { AttemptRecord, UserAnswer } from '../data/types';

export interface QuizSessionState {
  testId: string;
  mode: 'practice' | 'exam';
  currentIndex: number;
  answers: Record<string, UserAnswer>;
  isExamSubmitted: boolean;
  examScore: number;
  timerSeconds: number;
  isShuffled: boolean;
  lastUpdated: number;
}

const DB_KEYS = {
  USER_NAME: 'tinab_db_user_name',
  THEME: 'tinab_db_theme',
  ATTEMPTS: 'tinab_db_attempts',
  SESSIONS_PREFIX: 'tinab_db_session_',
  MISTAKES: 'tinab_db_mistakes_bank',
  QUESTION_STATS: 'tinab_db_q_stats',
};

// ================= USER PROFILE =================
export function getUserName(): string {
  try {
    return localStorage.getItem(DB_KEYS.USER_NAME) || '';
  } catch {
    return '';
  }
}

export function setUserName(name: string): void {
  try {
    localStorage.setItem(DB_KEYS.USER_NAME, name.trim());
  } catch (e) {
    console.error('quizDb: Failed to save username', e);
  }
}

// ================= TEST SESSIONS (PERSIST IN-PROGRESS WORK) =================
export function saveQuizSession(testId: string, state: QuizSessionState): void {
  try {
    localStorage.setItem(DB_KEYS.SESSIONS_PREFIX + testId, JSON.stringify(state));
  } catch (e) {
    console.error(`quizDb: Failed to save session for ${testId}`, e);
  }
}

export function getQuizSession(testId: string): QuizSessionState | null {
  try {
    const raw = localStorage.getItem(DB_KEYS.SESSIONS_PREFIX + testId);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearQuizSession(testId: string): void {
  try {
    localStorage.removeItem(DB_KEYS.SESSIONS_PREFIX + testId);
  } catch (e) {
    console.error(`quizDb: Failed to clear session for ${testId}`, e);
  }
}

// ================= ATTEMPTS HISTORY (AUDIT LOGS) =================
export function getAttempts(): AttemptRecord[] {
  try {
    const raw = localStorage.getItem(DB_KEYS.ATTEMPTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveAttempt(attempt: AttemptRecord): void {
  try {
    const history = getAttempts();
    history.unshift(attempt);
    const trimmed = history.slice(0, 100); // Store up to 100 records
    localStorage.setItem(DB_KEYS.ATTEMPTS, JSON.stringify(trimmed));
  } catch (e) {
    console.error('quizDb: Failed to save attempt', e);
  }
}

export function deleteAttempt(id: string): void {
  try {
    const history = getAttempts().filter((a) => a.id !== id);
    localStorage.setItem(DB_KEYS.ATTEMPTS, JSON.stringify(history));
  } catch (e) {
    console.error('quizDb: Failed to delete attempt', e);
  }
}

export function clearAllAttempts(): void {
  try {
    localStorage.removeItem(DB_KEYS.ATTEMPTS);
  } catch (e) {
    console.error('quizDb: Failed to clear attempts', e);
  }
}

// ================= MISTAKES BANK (PERSISTENT WRONG ANSWERS) =================
export function getMistakeQuestionIds(): string[] {
  try {
    const raw = localStorage.getItem(DB_KEYS.MISTAKES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveMistakeQuestionIds(ids: string[]): void {
  try {
    const unique = Array.from(new Set(ids));
    localStorage.setItem(DB_KEYS.MISTAKES, JSON.stringify(unique));
  } catch (e) {
    console.error('quizDb: Failed to save mistakes', e);
  }
}

export function addMistakeQuestionId(id: string): void {
  const current = getMistakeQuestionIds();
  if (!current.includes(id)) {
    current.push(id);
    saveMistakeQuestionIds(current);
  }
}

export function removeMistakeQuestionId(id: string): void {
  const current = getMistakeQuestionIds().filter((mId) => mId !== id);
  saveMistakeQuestionIds(current);
}
