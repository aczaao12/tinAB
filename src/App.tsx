import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TEST_SUITES } from './data/testsData';
import type { Question, UserAnswer, AttemptRecord } from './data/types';
import {
  getUserName,
  setUserName,
  getAttempts,
  saveAttempt,
  saveQuizSession,
  getQuizSession,
  clearQuizSession,
} from './utils/quizDb';

import { Navbar } from './components/Navbar';
import { QuestionCard } from './components/QuestionCard';
import { QuestionGrid } from './components/QuestionGrid';
import { NameModal } from './components/NameModal';
import { HistoryModal } from './components/HistoryModal';
import { ExamResultModal } from './components/ExamResultModal';
import { MobileTestSheet } from './components/MobileTestSheet';
import { MobileMenuSheet } from './components/MobileMenuSheet';
import {
  IconArrowLeft,
  IconArrowRight,
  IconGrid,
  IconCheckCircle,
  IconX,
} from './components/icons';
import { logStartQuiz, logSubmitExam } from './utils/telegram';
import { triggerVibrate } from './utils/haptics';

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

  // Mistake practice state
  const [isMistakePractice, setIsMistakePractice] = useState<boolean>(false);

  // Mobile Bottom Sheets
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState<boolean>(false);
  const [isMobileTestSheetOpen, setIsMobileTestSheetOpen] = useState<boolean>(false);
  const [isMobileMenuSheetOpen, setIsMobileMenuSheetOpen] = useState<boolean>(false);

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
    (testId: string, shuffle: boolean = isShuffled, forcedMode?: 'practice' | 'exam') => {
      let qs: Question[] = [];
      if (testId === 'all') {
        qs = TEST_SUITES.flatMap((t) => t.questions);
      } else {
        const suite = TEST_SUITES.find((t) => t.id === testId);
        qs = suite ? suite.questions : TEST_SUITES[0]?.questions || [];
      }
      setIsMistakePractice(false);
      setRawQuestions(qs);

      const targetMode = forcedMode || mode;

      // Check if session exists in LocalStorage database
      const savedSession = getQuizSession(testId);
      if (savedSession && Object.keys(savedSession.answers || {}).length > 0 && !shuffle) {
        setActiveQuestions(qs);
        setCurrentIndex(Math.min(savedSession.currentIndex || 0, qs.length - 1));

        const loadedAnswers = { ...(savedSession.answers || {}) };
        if (targetMode === 'practice') {
          // Clean up any falsely submitted empty answers from previous sessions
          Object.keys(loadedAnswers).forEach((qId) => {
            if (!loadedAnswers[qId]?.selectedOptionIds || loadedAnswers[qId].selectedOptionIds.length === 0) {
              loadedAnswers[qId] = {
                ...loadedAnswers[qId],
                isSubmitted: false,
                isCorrect: undefined,
              };
            }
          });
        }
        setAnswers(loadedAnswers);
        // In practice mode, never lock quiz with isExamSubmitted
        const examSubmitted = targetMode === 'practice' ? false : (savedSession.isExamSubmitted || false);
        setIsExamSubmitted(examSubmitted);
        setExamScore(savedSession.examScore || 0);
        setTimerSeconds(savedSession.timerSeconds || 0);
        setMode(targetMode);
      } else {
        setMode(targetMode);
        resetQuizState(qs, shuffle);
      }
    },
    [isShuffled, mode, resetQuizState]
  );

  // Initial setup
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

  // Auto-save test session to LocalStorage (acting as persistent database)
  useEffect(() => {
    if (selectedTestId && activeQuestions.length > 0 && !isMistakePractice) {
      saveQuizSession(selectedTestId, {
        testId: selectedTestId,
        mode,
        currentIndex,
        answers,
        isExamSubmitted,
        examScore,
        timerSeconds,
        isShuffled,
        lastUpdated: Date.now(),
      });
    }
  }, [
    selectedTestId,
    mode,
    currentIndex,
    answers,
    isExamSubmitted,
    examScore,
    timerSeconds,
    isShuffled,
    isMistakePractice,
    activeQuestions.length,
  ]);

  // Current question
  const currentQuestion = activeQuestions[currentIndex];
  const isCurrentFlagged = currentQuestion ? answers[currentQuestion.id]?.marked : false;

  // Option selection
  const handleSelectOption = (optId: string) => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;
    const existing = answers[qId] || {
      selectedOptionIds: [],
      isSubmitted: false,
      marked: false,
    };

    // If exam is submitted, lock answers
    if (mode === 'exam' && isExamSubmitted) return;

    let newSelected: string[];
    const isMulti = currentQuestion.type === 'multiple';

    if (isMulti) {
      if (existing.selectedOptionIds.includes(optId)) {
        newSelected = existing.selectedOptionIds.filter((id) => id !== optId);
      } else {
        newSelected = [...existing.selectedOptionIds, optId];
      }

      setAnswers((prev) => ({
        ...prev,
        [qId]: {
          ...existing,
          selectedOptionIds: newSelected,
          isSubmitted: false,
        },
      }));
    } else {
      newSelected = [optId];
      const correctOption = currentQuestion.options.find((o) => o.isCorrect);
      const isRight = correctOption?.id === optId;

      if (mode === 'practice') {
        triggerVibrate(isRight ? 'correct' : 'wrong');
      } else {
        triggerVibrate('tap');
      }

      setAnswers((prev) => ({
        ...prev,
        [qId]: {
          ...existing,
          selectedOptionIds: newSelected,
          isCorrect: isRight,
          isSubmitted: mode === 'practice',
        },
      }));
    }
  };

  // Confirm multi-choice answer in Practice mode
  const handleCheckMultiAnswer = () => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;
    const existing = answers[qId];
    if (!existing || existing.selectedOptionIds.length === 0) return;

    const correctIds = currentQuestion.options
      .filter((o) => o.isCorrect)
      .map((o) => o.id)
      .sort();
    const chosenSorted = [...existing.selectedOptionIds].sort();
    const isRight =
      correctIds.length === chosenSorted.length &&
      correctIds.every((val, idx) => val === chosenSorted[idx]);

    triggerVibrate(isRight ? 'correct' : 'wrong');

    setAnswers((prev) => ({
      ...prev,
      [qId]: {
        ...existing,
        isCorrect: isRight,
        isSubmitted: true,
      },
    }));
  };

  // Reset answer for current question to try again
  const handleResetCurrentAnswer = () => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;
    const existing = answers[qId];
    if (!existing) return;

    setAnswers((prev) => ({
      ...prev,
      [qId]: {
        ...existing,
        selectedOptionIds: [],
        isSubmitted: false,
        isCorrect: undefined,
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
    if (newMode === 'practice') {
      setIsExamSubmitted(false);
    }
    loadTestQuestions(selectedTestId, isShuffled, newMode);
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

  // Submit Exam / Practice session
  const handleSubmitExam = () => {
    if (isExamSubmitted && mode === 'exam') return;

    const answeredCount = activeQuestions.filter(
      (q) => (answers[q.id]?.selectedOptionIds || []).length > 0
    ).length;
    const totalCount = activeQuestions.length;

    if (answeredCount < totalCount) {
      const actionName = mode === 'exam' ? 'nộp bài thi' : 'hoàn thành bài ôn tập';
      const confirmSubmit = confirm(
        `Bạn mới trả lời ${answeredCount}/${totalCount} câu hỏi. Bạn có chắc chắn muốn ${actionName} sớm không?`
      );
      if (!confirmSubmit) return;
    }

    triggerVibrate('submit');

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
        isSubmitted: mode === 'exam' ? true : (a ? a.isSubmitted : false),
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
      mode: mode,
      score: correctTotal,
      totalQuestions: totalCount,
      percentage: Math.round((correctTotal / totalCount) * 100),
      timeSpentSeconds: timerSeconds,
      answers: answersRecord,
    };

    saveAttempt(record);
    setAttempts(getAttempts());
    setIsResultModalOpen(true);

    // Send Telegram Notification
    logSubmitExam({
      userName: userName || 'Ẩn danh',
      testTitle,
      score: correctTotal,
      totalQuestions: totalCount,
      percentage: Math.round((correctTotal / totalCount) * 100),
      timeSpentSeconds: timerSeconds,
    });
  };

  // Retry full test
  const handleRetry = () => {
    setIsResultModalOpen(false);
    clearQuizSession(selectedTestId);
    resetQuizState(rawQuestions, isShuffled);
  };

  // Retry only mistakes
  const handleRetryMistakes = () => {
    setIsResultModalOpen(false);
    // Any question not correctly answered (including unanswered questions) is a mistake!
    const mistakes = activeQuestions.filter((q) => answers[q.id]?.isCorrect !== true);
    if (mistakes.length === 0) return;
    setIsMistakePractice(true);
    setMode('practice');
    setActiveQuestions(mistakes);
    setCurrentIndex(0);
    setAnswers({});
    setIsExamSubmitted(false);
  };

  // Exit mistake practice
  const handleExitMistakePractice = () => {
    setIsMistakePractice(false);
    loadTestQuestions(selectedTestId);
  };

  // Handle reviewing after results
  const handleReview = () => {
    setIsResultModalOpen(false);
    if (mode === 'practice') {
      setIsExamSubmitted(false);
    }
  };

  const handleCloseResultModal = () => {
    setIsResultModalOpen(false);
    if (mode === 'practice') {
      setIsExamSubmitted(false);
    }
  };

  const handleSaveName = (name: string) => {
    setUserNameState(name);
    setUserName(name);
    setIsNameModalOpen(false);

    const suite = TEST_SUITES.find((t) => t.id === selectedTestId);
    const testTitle =
      selectedTestId === 'all' ? 'Tất cả đề thi' : suite?.shortTitle || selectedTestId;

    logStartQuiz({
      userName: name,
      testTitle,
      mode,
      totalQuestions: activeQuestions.length,
    });
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
    <div className="app-container">
      {/* Navbar with mobile app bar & desktop workstation bar */}
      <Navbar
        testSuites={TEST_SUITES}
        selectedTestId={selectedTestId}
        isMistakePractice={isMistakePractice}
        mistakesCount={activeQuestions.length}
        mode={mode}
        userName={userName}
        isShuffled={isShuffled}
        theme={theme}
        timerSeconds={timerSeconds}
        currentIndex={currentIndex}
        totalQuestions={activeQuestions.length}
        isCurrentFlagged={isCurrentFlagged}
        onToggleFlag={handleToggleFlag}
        onSelectTest={handleSelectTest}
        onExitMistakePractice={handleExitMistakePractice}
        onSelectMode={handleSelectMode}
        onToggleShuffle={handleToggleShuffle}
        onOpenNameModal={() => setIsNameModalOpen(true)}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        onToggleTheme={handleToggleTheme}
        onOpenMobileTestSheet={() => setIsMobileTestSheetOpen(true)}
        onOpenMobileMenuSheet={() => setIsMobileMenuSheetOpen(true)}
      />

      {/* Main Workspace */}
      <main className="workspace-grid">
        {currentQuestion ? (
          <QuestionCard
            question={currentQuestion}
            currentIndex={currentIndex}
            totalQuestions={activeQuestions.length}
            userAnswer={answers[currentQuestion.id]}
            mode={mode}
            isExamSubmitted={isExamSubmitted}
            onSelectOption={handleSelectOption}
            onCheckMultiAnswer={handleCheckMultiAnswer}
            onResetCurrentAnswer={handleResetCurrentAnswer}
            onToggleFlag={handleToggleFlag}
            onPrev={handlePrev}
            onNext={handleNext}
            onSubmitExam={handleSubmitExam}
            canPrev={currentIndex > 0}
            canNext={currentIndex < activeQuestions.length - 1}
          />
        ) : (
          <div className="stage-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Không tìm thấy câu hỏi nào.</p>
          </div>
        )}

        {/* Desktop Cockpit Sidebar */}
        <QuestionGrid
          questions={activeQuestions}
          currentIndex={currentIndex}
          answers={answers}
          mode={mode}
          isExamSubmitted={isExamSubmitted}
          onSelectIndex={(idx) => setCurrentIndex(idx)}
        />
      </main>

      {/* Mobile-Native Fixed Thumb-Zone Bottom Action Bar */}
      <nav className="mobile-bottom-bar mobile-only" aria-label="Điều hướng câu hỏi">
        <button
          className="btn-action btn-secondary"
          style={{ padding: '0.45rem 0.6rem', minWidth: '42px' }}
          onClick={handlePrev}
          disabled={currentIndex === 0}
          aria-label="Câu trước"
        >
          <IconArrowLeft size={16} />
        </button>

        {/* Center Grid Trigger */}
        <button
          className="mobile-grid-trigger"
          onClick={() => setIsMobileSheetOpen(true)}
          aria-label="Mở bảng câu hỏi"
        >
          <IconGrid size={16} />
          <span>
            {currentIndex + 1} / {activeQuestions.length}
          </span>
          {isCurrentFlagged && (
            <span style={{ color: 'var(--accent-warning)', fontSize: '0.8rem' }}>★</span>
          )}
        </button>

        <button
          className="btn-action btn-secondary"
          style={{ padding: '0.45rem 0.6rem', minWidth: '42px' }}
          onClick={handleNext}
          disabled={currentIndex === activeQuestions.length - 1}
          aria-label="Câu sau"
        >
          <IconArrowRight size={16} />
        </button>

        {(!isExamSubmitted || mode === 'practice') && (
          <button
            className="btn-action btn-success"
            style={{ padding: '0.45rem 0.75rem', fontWeight: 700 }}
            onClick={handleSubmitExam}
            aria-label="Nộp bài"
            title={mode === 'exam' ? 'Nộp bài thi' : 'Hoàn thành bài ôn tập'}
          >
            <IconCheckCircle size={15} />
            <span>Nộp</span>
          </button>
        )}
      </nav>

      {/* Mobile Bottom Sheet: Question Number Matrix */}
      {isMobileSheetOpen && (
        <div
          className="bottom-sheet-overlay mobile-only"
          onClick={() => setIsMobileSheetOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle"></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                Bảng số câu hỏi
              </span>
              <button
                className="btn-icon-square"
                onClick={() => setIsMobileSheetOpen(false)}
                aria-label="Đóng"
              >
                <IconX size={16} />
              </button>
            </div>
            <QuestionGrid
              questions={activeQuestions}
              currentIndex={currentIndex}
              answers={answers}
              mode={mode}
              isExamSubmitted={isExamSubmitted}
              onSelectIndex={(idx) => {
                setCurrentIndex(idx);
                setIsMobileSheetOpen(false);
              }}
              isMobileDrawer={true}
            />
          </div>
        </div>
      )}

      {/* Mobile Bottom Sheet: Test Selector */}
      <MobileTestSheet
        isOpen={isMobileTestSheetOpen}
        testSuites={TEST_SUITES}
        selectedTestId={selectedTestId}
        onSelectTest={handleSelectTest}
        onClose={() => setIsMobileTestSheetOpen(false)}
      />

      {/* Mobile Bottom Sheet: Settings & Options */}
      <MobileMenuSheet
        isOpen={isMobileMenuSheetOpen}
        mode={mode}
        isShuffled={isShuffled}
        theme={theme}
        userName={userName}
        onSelectMode={handleSelectMode}
        onToggleShuffle={handleToggleShuffle}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        onOpenNameModal={() => setIsNameModalOpen(true)}
        onToggleTheme={handleToggleTheme}
        onClose={() => setIsMobileMenuSheetOpen(false)}
      />

      {/* Desktop & Mobile Modals */}
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
        mode={mode}
        onReview={handleReview}
        onRetry={handleRetry}
        onRetryMistakes={handleRetryMistakes}
        onClose={handleCloseResultModal}
      />
    </div>
  );
};

export default App;
