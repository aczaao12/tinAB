export interface Option {
  id: string; // 'A', 'B', 'C', 'D' etc.
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  testId: string;
  testTitle: string;
  questionNumber: number;
  prompt: string;
  type: 'single' | 'multiple';
  options: Option[];
  correctAnswerText: string;
}

export interface TestSuite {
  id: string;
  title: string;
  shortTitle: string;
  filename: string;
  totalQuestions: number;
  questions: Question[];
}

export interface UserAnswer {
  selectedOptionIds: string[]; // e.g. ['A'] or ['A', 'C']
  isSubmitted: boolean;
  isCorrect?: boolean;
  marked?: boolean; // Flagged for review
}

export interface AttemptRecord {
  id: string;
  timestamp: number;
  userName: string;
  testId: string;
  testTitle: string;
  mode: 'practice' | 'exam';
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpentSeconds: number;
  answers: Record<string, string[]>; // questionId -> selectedOptionIds
}
