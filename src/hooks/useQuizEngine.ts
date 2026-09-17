import { useState, useEffect, useCallback, useRef } from 'react';
import type { Question, UserAnswer, AttemptRecord } from '../data/types';
import { TEST_SUITES } from '../data/testsData';
import {
  getQuizSession,
  saveQuizSession,
  saveAttempt,
  clearQuizSession,
} from '../utils/quizDb';
import { logSubmitExam } from '../utils/telegram';
import { triggerVibrate } from '../utils/haptics';

export function useQuizEngine() {
  const [selectedTestId, setSelectedTestId] = useState<string>('test-1');
  const [mode, setMode] = useState<'practice' | 'exam'>('practice');
  const [isShuffled, setIsShuffled] = useState<boolean>(false);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);
  const [examScore, setExamScore] = useState<number>(0);

  const [isMistakePractice, setIsMistakePractice] = useState<boolean>(false);

  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const timerRef = useRef<any>(null);

  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);

  const [rawQuestions, setRawQuestions] = useState<Question[]>([]);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);

  const resetQuizState = useCallback((qs: Question[], shuffle: boolean) => {
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
  }, []);

  const loadTestQuestions = useCallback(
    (testId: string, shuffle?: boolean, forcedMode?: 'practice' | 'exam') => {
      let qs: Question[] = [];
      if (testId === 'all') {
        qs = TEST_SUITES.flatMap((t) => t.questions);
      } else {
        const suite = TEST_SUITES.find((t) => t.id === testId);
        qs = suite ? suite.questions : TEST_SUITES[0]?.questions || [];
      }
      setIsMistakePractice(false);
      setRawQuestions(qs);

      const shuf = shuffle ?? isShuffled;
      const targetMode = forcedMode || mode;

      const savedSession = getQuizSession(testId);
      if (savedSession && Object.keys(savedSession.answers || {}).length > 0 && !shuf) {
        setActiveQuestions(qs);
        setCurrentIndex(Math.min(savedSession.currentIndex || 0, qs.length - 1));

        const loadedAnswers = { ...(savedSession.answers || {}) };
        if (targetMode === 'practice') {
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
        const examSubmitted = targetMode === 'practice' ? false : (savedSession.isExamSubmitted || false);
        setIsExamSubmitted(examSubmitted);
        setExamScore(savedSession.examScore || 0);
        setTimerSeconds(savedSession.timerSeconds || 0);
        setMode(targetMode);
      } else {
        setMode(targetMode);
        resetQuizState(qs, shuf);
      }
    },
    [isShuffled, mode, resetQuizState]
  );

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

  const currentQuestion = activeQuestions[currentIndex];
  const isCurrentFlagged = currentQuestion ? answers[currentQuestion.id]?.marked : false;

  const handleSelectOption = useCallback(
    (optId: string) => {
      if (!currentQuestion) return;
      const qId = currentQuestion.id;
      const existing = answers[qId] || {
        selectedOptionIds: [],
        isSubmitted: false,
        marked: false,
      };

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
          [qId]: { ...existing, selectedOptionIds: newSelected, isSubmitted: false },
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
    },
    [currentQuestion, answers, mode, isExamSubmitted]
  );

  const handleCheckMultiAnswer = useCallback(() => {
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
      [qId]: { ...existing, isCorrect: isRight, isSubmitted: true },
    }));
  }, [currentQuestion, answers]);

  const handleResetCurrentAnswer = useCallback(() => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;
    const existing = answers[qId];
    if (!existing) return;

    setAnswers((prev) => ({
      ...prev,
      [qId]: { ...existing, selectedOptionIds: [], isSubmitted: false, isCorrect: undefined },
    }));
  }, [currentQuestion, answers]);

  const handleToggleFlag = useCallback(() => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;
    const existing = answers[qId] || { selectedOptionIds: [], isSubmitted: false, marked: false };
    setAnswers((prev) => ({
      ...prev,
      [qId]: { ...existing, marked: !existing.marked },
    }));
  }, [currentQuestion, answers]);

  const handleNext = useCallback(() => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, activeQuestions.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleSelectTest = useCallback(
    (testId: string) => {
      setSelectedTestId(testId);
      loadTestQuestions(testId);
    },
    [loadTestQuestions]
  );

  const handleSelectMode = useCallback(
    (newMode: 'practice' | 'exam') => {
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
    },
    [mode, isExamSubmitted, answers, selectedTestId, isShuffled, loadTestQuestions]
  );

  const handleToggleShuffle = useCallback(() => {
    const nextShuffle = !isShuffled;
    setIsShuffled(nextShuffle);
    resetQuizState(rawQuestions, nextShuffle);
  }, [isShuffled, rawQuestions, resetQuizState]);

  const handleSubmitExam = useCallback(
    (userName: string) => {
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
      const testTitle = selectedTestId === 'all' ? 'Tất cả đề thi' : suite?.shortTitle || selectedTestId;

      const record: AttemptRecord = {
        id: 'att_' + Date.now(),
        timestamp: Date.now(),
        userName,
        testId: selectedTestId,
        testTitle,
        mode,
        score: correctTotal,
        totalQuestions: totalCount,
        percentage: Math.round((correctTotal / totalCount) * 100),
        timeSpentSeconds: timerSeconds,
        answers: answersRecord,
      };

      saveAttempt(record);
      setAttempts(getAttempts());

      logSubmitExam({
        userName,
        testTitle,
        score: correctTotal,
        totalQuestions: totalCount,
        percentage: Math.round((correctTotal / totalCount) * 100),
        timeSpentSeconds: timerSeconds,
      });
    },
    [isExamSubmitted, mode, activeQuestions, answers, selectedTestId, timerSeconds]
  );

  const handleRetry = useCallback(() => {
    setIsExamSubmitted(false);
    clearQuizSession(selectedTestId);
    resetQuizState(rawQuestions, isShuffled);
  }, [selectedTestId, rawQuestions, isShuffled, resetQuizState]);

  const handleRetryMistakes = useCallback(() => {
    const mistakes = activeQuestions.filter((q) => answers[q.id]?.isCorrect !== true);
    if (mistakes.length === 0) return;
    setIsMistakePractice(true);
    setMode('practice');
    setActiveQuestions(mistakes);
    setCurrentIndex(0);
    setAnswers({});
    setIsExamSubmitted(false);
  }, [activeQuestions, answers]);

  const handleExitMistakePractice = useCallback(() => {
    setIsMistakePractice(false);
    loadTestQuestions(selectedTestId);
  }, [selectedTestId, loadTestQuestions]);

  const handleReview = useCallback(() => {
    if (mode === 'practice') {
      setIsExamSubmitted(false);
    }
  }, [mode]);

  const handleCloseResultModal = useCallback(() => {
    if (mode === 'practice') {
      setIsExamSubmitted(false);
    }
  }, [mode]);

  return {
    selectedTestId,
    mode,
    isShuffled,
    currentIndex,
    answers,
    isExamSubmitted,
    examScore,
    isMistakePractice,
    timerSeconds,
    attempts,
    rawQuestions,
    activeQuestions,
    currentQuestion,
    isCurrentFlagged,
    resetQuizState,
    loadTestQuestions,
    handleSelectOption,
    handleCheckMultiAnswer,
    handleResetCurrentAnswer,
    handleToggleFlag,
    handleNext,
    handlePrev,
    handleSelectTest,
    handleSelectMode,
    handleToggleShuffle,
    handleSubmitExam,
    handleRetry,
    handleRetryMistakes,
    handleExitMistakePractice,
    handleReview,
    handleCloseResultModal,
    setIsExamSubmitted,
    setAnswers,
    setCurrentIndex,
    setExamScore,
    setTimerSeconds,
    setMode,
    setIsMistakePractice,
    setRawQuestions,
    setActiveQuestions,
    setAttempts,
  };
}