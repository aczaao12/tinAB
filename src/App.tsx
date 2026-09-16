import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TEST_SUITES } from './data/testsData';
import type { Question, UserAnswer, AttemptRecord } from './data/types';
import { getUserName, setUserName, getAttempts, saveAttempt } from './utils/storage';

import { Navbar } from './components/Navbar';
import { QuestionCard } from './components/QuestionCard';
import { QuestionGrid } from './components/QuestionGrid';
import { NameModal } from './components/NameModal';
import { HistoryModal } from './components/HistoryModal';
import { ExamResultModal } from './components/ExamResultModal';

export const App: React.FC = () => {
  const [selectedTestId, setSelectedTestId] = useState<string>('test-1');
  const [mode, setMode] = useState<'practice' | 'exam'>('practice');
  const [userName, setUserNameState] = useState<string>('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isShuffled, setIsShuffled] = useState<boolean>(false);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);
  const [examScore, setExamScore] = useState<number>(0);

  // Timer
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const timerRef = useRef<any>(null);

  // Modals
  const [isNameModalOpen, setIsNameModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);

  // Questions
  const [rawQuestions, setRawQuestions] = useState<Question[]>([]);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);

  // Reset quiz state
  const resetQuizState = useCallback(
    (qs: Question[], shuffle: boolean) => {
      let list = [...qs];
      if (shuffle) {
        list = list.sort(() => Math.random() - 0.5);
      }
      setActiveQuestions(list);
      setCurrentIndex(0);
      setAnswers({});
      setIsExamSubmitted(false);
      setExamScore(0);
      setTimerSeconds(0);
    },
    []
  );

  // Load test questions
  const loadTestQuestions = useCallback(
    (testId: string, shuffle: boolean = isShuffled) => {
      let qs: Question[] = [];
      if (testId === 'all') {
        qs = TEST_SUITES.flatMap((t) => t.questions);
      } else {
        const suite = TEST_SUITES.find((t) => t.id === testId);
        qs = suite ? suite.questions : TEST_SUITES[0]?.questions || [];
      }
      setRawQuestions(qs);
      resetQuizState(qs, shuffle);
    },
    [isShuffled, resetQuizState]
  );

  // Initial load
  useEffect(() => {
    const storedName = getUserName();
    if (storedName) {
      setUserNameState(storedName);
    } else {
      setIsNameModalOpen(true);
    }

    setAttempts(getAttempts());

    const prefersDark =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('tinab_theme') as 'light' | 'dark' | null;
    const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);

    loadTestQuestions('test-1', false);
  }, []);

  // Timer effect for exam mode
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (mode === 'exam' && !isExamSubmitted) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, isExamSubmitted]);

  // Current question
  const currentQuestion = activeQuestions[currentIndex];

  // Option selection
  const handleSelectOption = (optId: string) => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;
    const existing = answers[qId] || {
      selectedOptionIds: [],
      isSubmitted: false,
      marked: false,
    };

    let newSelected: string[];
    if (currentQuestion.type === 'multiple') {
      if (existing.selectedOptionIds.includes(optId)) {
        newSelected = existing.selectedOptionIds.filter((id) => id !== optId);
      } else {
        newSelected = [...existing.selectedOptionIds, optId];
      }
    } else {
      newSelected = [optId];
    }

    const correctIds = currentQuestion.options.filter((o) => o.isCorrect).map((o) => o.id).sort();
    const chosenSorted = [...newSelected].sort();
    const isCorrect =
      correctIds.length === chosenSorted.length &&
      correctIds.every((val, idx) => val === chosenSorted[idx]);

    setAnswers((prev) => ({
      ...prev,
      [qId]: {
        ...existing,
        selectedOptionIds: newSelected,
        isCorrect,
        isSubmitted: mode === 'practice',
      },
    }));
  };

  // Toggle flag
  const handleToggleFlag = () => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;
    const existing = answers[qId] || {
      selectedOptionIds: [],
      isSubmitted: false,
      marked: false,
    };
    setAnswers((prev) => ({
      ...prev,
      [qId]: {
        ...existing,
        marked: !existing.marked,
      },
    }));
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Switch test
  const handleSelectTest = (testId: string) => {
    setSelectedTestId(testId);
    loadTestQuestions(testId);
  };

  // Switch mode
  const handleSelectMode = (newMode: 'practice' | 'exam') => {
    if (newMode === mode) return;
    if (mode === 'exam' && !isExamSubmitted && Object.keys(answers).length > 0) {
      if (!confirm('Chuyển chế độ sẽ bắt đầu lại bài làm. Bạn có muốn tiếp tục?')) {
        return;
      }
    }
    setMode(newMode);
    loadTestQuestions(selectedTestId);
  };

  // Toggle shuffle
  const handleToggleShuffle = () => {
    const nextShuffle = !isShuffled;
    setIsShuffled(nextShuffle);
    resetQuizState(rawQuestions, nextShuffle);
  };

  // Toggle theme
  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('tinab_theme', nextTheme);
  };

  // Submit Exam
  const handleSubmitExam = () => {
    if (isExamSubmitted) return;

    const answeredCount = activeQuestions.filter(
      (q) => (answers[q.id]?.selectedOptionIds || []).length > 0
    ).length;
    const totalCount = activeQuestions.length;

    if (answeredCount < totalCount) {
      const confirmSubmit = confirm(
        `Bạn mới trả lời ${answeredCount}/${totalCount} câu hỏi. Bạn có chắc chắn muốn nộp bài ngay không?`
      );
      if (!confirmSubmit) return;
    }

    if (timerRef.current) clearInterval(timerRef.current);

    let correctTotal = 0;
    const answersRecord: Record<string, string[]> = {};
    const updatedAnswers: Record<string, UserAnswer> = {};

    activeQuestions.forEach((q) => {
      const a = answers[q.id];
      const selected = a ? a.selectedOptionIds : [];
      answersRecord[q.id] = selected;

      const correctIds = q.options.filter((o) => o.isCorrect).map((o) => o.id).sort();
      const chosenSorted = [...selected].sort();
      const isRight =
        correctIds.length === chosenSorted.length &&
        correctIds.every((val, idx) => val === chosenSorted[idx]);

      if (isRight) {
        correctTotal += 1;
      }

      updatedAnswers[q.id] = {
        selectedOptionIds: selected,
        isSubmitted: true,
        isCorrect: isRight,
        marked: a?.marked || false,
      };
    });

    setAnswers(updatedAnswers);
    setExamScore(correctTotal);
    setIsExamSubmitted(true);

    const suite = TEST_SUITES.find((t) => t.id === selectedTestId);
    const testTitle =
      selectedTestId === 'all' ? 'Tất cả đề thi' : suite?.shortTitle || selectedTestId;

    const record: AttemptRecord = {
      id: 'att_' + Date.now(),
      timestamp: Date.now(),
      userName: userName || 'Ẩn danh',
      testId: selectedTestId,
      testTitle: testTitle,
      mode: 'exam',
      score: correctTotal,
      totalQuestions: totalCount,
      percentage: Math.round((correctTotal / totalCount) * 100),
      timeSpentSeconds: timerSeconds,
      answers: answersRecord,
    };

    saveAttempt(record);
    setAttempts(getAttempts());
    setIsResultModalOpen(true);
  };

  // Retry full test
  const handleRetry = () => {
    setIsResultModalOpen(false);
    loadTestQuestions(selectedTestId);
  };

  // Retry only mistakes
  const handleRetryMistakes = () => {
    setIsResultModalOpen(false);
    const mistakes = activeQuestions.filter((q) => answers[q.id]?.isCorrect === false);
    if (mistakes.length === 0) return;
    setMode('practice');
    setActiveQuestions(mistakes);
    setCurrentIndex(0);
    setAnswers({});
    setIsExamSubmitted(false);
  };

  const handleSaveName = (name: string) => {
    setUserNameState(name);
    setUserName(name);
    setIsNameModalOpen(false);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const num = parseInt(e.key) - 1;
        if (currentQuestion && currentQuestion.options[num]) {
          handleSelectOption(currentQuestion.options[num].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [currentIndex, activeQuestions, currentQuestion]);

  return (
    <div className="app-layout">
      {/* Navbar */}
      <Navbar
        testSuites={TEST_SUITES}
        selectedTestId={selectedTestId}
        mode={mode}
        userName={userName}
        isShuffled={isShuffled}
        theme={theme}
        timerSeconds={timerSeconds}
        onSelectTest={handleSelectTest}
        onSelectMode={handleSelectMode}
        onToggleShuffle={handleToggleShuffle}
        onOpenNameModal={() => setIsNameModalOpen(true)}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Quiz Area */}
      <main className="main-content">
        {currentQuestion ? (
          <QuestionCard
            question={currentQuestion}
            currentIndex={currentIndex}
            totalQuestions={activeQuestions.length}
            userAnswer={answers[currentQuestion.id]}
            mode={mode}
            isExamSubmitted={isExamSubmitted}
            onSelectOption={handleSelectOption}
            onToggleFlag={handleToggleFlag}
            onPrev={handlePrev}
            onNext={handleNext}
            onSubmitExam={handleSubmitExam}
            canPrev={currentIndex > 0}
            canNext={currentIndex < activeQuestions.length - 1}
          />
        ) : (
          <div className="quiz-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Không tìm thấy câu hỏi nào.</p>
          </div>
        )}

        {/* Sidebar Grid */}
        <QuestionGrid
          questions={activeQuestions}
          currentIndex={currentIndex}
          answers={answers}
          mode={mode}
          isExamSubmitted={isExamSubmitted}
          onSelectIndex={(idx) => setCurrentIndex(idx)}
        />
      </main>

      {/* Modals */}
      <NameModal
        isOpen={isNameModalOpen}
        initialName={userName}
        onSave={handleSaveName}
        onClose={() => setIsNameModalOpen(false)}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        attempts={attempts}
        onClose={() => setIsHistoryModalOpen(false)}
        onRefresh={() => setAttempts(getAttempts())}
      />

      <ExamResultModal
        isOpen={isResultModalOpen}
        score={examScore}
        totalQuestions={activeQuestions.length}
        timeSpentSeconds={timerSeconds}
        userName={userName}
        hasMistakes={examScore < activeQuestions.length}
        onReview={() => setIsResultModalOpen(false)}
        onRetry={handleRetry}
        onRetryMistakes={handleRetryMistakes}
        onClose={() => setIsResultModalOpen(false)}
      />
    </div>
  );
};

export default App;
