import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TEST_SUITES } from './data/testsData';
import {
  getAttempts,
  saveAttempt,
  saveQuizSession,
  getQuizSession,
  clearQuizSession,
} from './utils/quizDb';
import { logStartQuiz, logSubmitExam } from './utils/telegram';
import { triggerVibrate } from './utils/haptics';

import { Navbar } from './components/Navbar';
import { QuestionCard } from './components/QuestionCard';
import { QuestionGrid } from './components/QuestionGrid';
import { NameModal } from './components/NameModal';
import { HistoryModal } from './components/HistoryModal';
import { ExamResultModal } from './components/ExamResultModal';
import { MobileTestSheet } from './components/MobileTestSheet';
import { MobileMenuSheet } from './components/MobileMenuSheet';
import { WelcomeScreen } from './components/WelcomeScreen';
import {
  IconArrowLeft,
  IconArrowRight,
  IconGrid,
  IconCheckCircle,
  IconX,
} from './components/icons';
import { useQuizEngine } from './hooks/useQuizEngine';
import { useSession } from './hooks/useSession';

const App: React.FC = () => {
  const quiz = useQuizEngine();
  const session = useSession();
  const [showWelcome, setShowWelcome] = useState(true);

  const initialLoadDone = useRef(false);
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      quiz.loadTestQuestions('test-1', false);
    }
  }, []);

  const handleSelectTest = useCallback(
    (testId: string) => {
      quiz.handleSelectTest(testId);
    },
    []
  );

  const handleSaveName = useCallback(
    (name: string) => {
      session.handleSaveName(name, quiz.selectedTestId, quiz.mode, quiz.activeQuestions.length);
    },
    []
  );

  const handleStartQuiz = useCallback(
    (testId: string, mode: 'practice' | 'exam') => {
      quiz.handleSelectTest(testId);
      quiz.setMode(mode);
      setShowWelcome(false);
    },
    []
  );

  const syncAttempts = useCallback(() => {
    quiz.setAttempts(getAttempts());
  }, []);

  if (showWelcome) {
    return (
      <WelcomeScreen
        onStart={handleStartQuiz}
        theme={session.theme}
        onToggleTheme={session.handleToggleTheme}
      />
    );
  }

  return (
    <div className="app-container">
      <Navbar
        testSuites={TEST_SUITES}
        selectedTestId={quiz.selectedTestId}
        isMistakePractice={quiz.isMistakePractice}
        mistakesCount={quiz.activeQuestions.length}
        mode={quiz.mode}
        userName={session.userName}
        isShuffled={quiz.isShuffled}
        theme={session.theme}
        timerSeconds={quiz.timerSeconds}
        currentIndex={quiz.currentIndex}
        totalQuestions={quiz.activeQuestions.length}
        isCurrentFlagged={quiz.isCurrentFlagged}
        onToggleFlag={quiz.handleToggleFlag}
        onSelectTest={handleSelectTest}
        onExitMistakePractice={quiz.handleExitMistakePractice}
        onSelectMode={quiz.handleSelectMode}
        onToggleShuffle={quiz.handleToggleShuffle}
        onOpenNameModal={session.openNameModal}
        onOpenHistoryModal={session.openHistoryModal}
        onToggleTheme={session.handleToggleTheme}
        onOpenMobileTestSheet={() => {}}
        onOpenMobileMenuSheet={() => {}}
      />

      <main className="workspace-grid">
        {quiz.currentQuestion ? (
          <QuestionCard
            question={quiz.currentQuestion}
            currentIndex={quiz.currentIndex}
            totalQuestions={quiz.activeQuestions.length}
            userAnswer={quiz.answers[quiz.currentQuestion.id]}
            mode={quiz.mode}
            isExamSubmitted={quiz.isExamSubmitted}
            onSelectOption={quiz.handleSelectOption}
            onCheckMultiAnswer={quiz.handleCheckMultiAnswer}
            onResetCurrentAnswer={quiz.handleResetCurrentAnswer}
            onToggleFlag={quiz.handleToggleFlag}
            onPrev={quiz.handlePrev}
            onNext={quiz.handleNext}
            onSubmitExam={() => quiz.handleSubmitExam(session.userName)}
            canPrev={quiz.currentIndex > 0}
            canNext={quiz.currentIndex < quiz.activeQuestions.length - 1}
          />
        ) : (
          <div className="stage-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Không tìm thấy câu hỏi.</p>
          </div>
        )}

        <QuestionGrid
          questions={quiz.activeQuestions}
          currentIndex={quiz.currentIndex}
          answers={quiz.answers}
          mode={quiz.mode}
          isExamSubmitted={quiz.isExamSubmitted}
          onSelectIndex={(idx) => quiz.setCurrentIndex(idx)}
        />
      </main>

      <nav className="mobile-bottom-bar mobile-only" aria-label="Điều hướng câu hỏi">
        <button
          className="btn-action btn-secondary"
          style={{ padding: '0.45rem 0.6rem', minWidth: '42px' }}
          onClick={quiz.handlePrev}
          disabled={quiz.currentIndex === 0}
          aria-label="Câu trước"
        >
          <IconArrowLeft size={16} />
        </button>

        <button
          className="mobile-grid-trigger"
          onClick={() => {}}
          aria-label="Mở bảng câu hỏi"
        >
          <IconGrid size={16} />
          <span>
            {quiz.currentIndex + 1} / {quiz.activeQuestions.length}
          </span>
          {quiz.isCurrentFlagged && (
            <span style={{ color: 'var(--accent-warning)', fontSize: '0.8rem' }}>★</span>
          )}
        </button>

        <button
          className="btn-action btn-secondary"
          style={{ padding: '0.45rem 0.6rem', minWidth: '42px' }}
          onClick={quiz.handleNext}
          disabled={quiz.currentIndex === quiz.activeQuestions.length - 1}
          aria-label="Câu sau"
        >
          <IconArrowRight size={16} />
        </button>

        {(!quiz.isExamSubmitted || quiz.mode === 'practice') && (
          <button
            className="btn-action btn-success"
            style={{ padding: '0.45rem 0.75rem', fontWeight: 700 }}
            onClick={() => quiz.handleSubmitExam(session.userName)}
            aria-label="Nộp bài"
            title={quiz.mode === 'exam' ? 'Nộp bài thi' : 'Hoàn thành bài ôn tập'}
          >
            <IconCheckCircle size={15} />
            <span>Nộp</span>
          </button>
        )}
      </nav>

      <MobileTestSheet
        isOpen={false}
        testSuites={TEST_SUITES}
        selectedTestId={quiz.selectedTestId}
        onSelectTest={handleSelectTest}
        onClose={() => {}}
      />

      <MobileMenuSheet
        isOpen={false}
        mode={quiz.mode}
        isShuffled={quiz.isShuffled}
        theme={session.theme}
        userName={session.userName}
        onSelectMode={quiz.handleSelectMode}
        onToggleShuffle={quiz.handleToggleShuffle}
        onOpenHistoryModal={session.openHistoryModal}
        onOpenNameModal={session.openNameModal}
        onToggleTheme={session.handleToggleTheme}
        onClose={() => {}}
      />

      <NameModal
        isOpen={session.isNameModalOpen}
        initialName={session.userName}
        onSave={handleSaveName}
        onClose={session.openNameModal}
      />

      <HistoryModal
        isOpen={session.isHistoryModalOpen}
        attempts={quiz.attempts}
        onClose={session.closeHistoryModal}
        onRefresh={syncAttempts}
      />

      <ExamResultModal
        isOpen={session.isResultModalOpen}
        score={quiz.examScore}
        totalQuestions={quiz.activeQuestions.length}
        timeSpentSeconds={quiz.timerSeconds}
        userName={session.userName}
        hasMistakes={quiz.examScore < quiz.activeQuestions.length}
        mode={quiz.mode}
        onReview={quiz.handleReview}
        onRetry={quiz.handleRetry}
        onRetryMistakes={quiz.handleRetryMistakes}
        onClose={() => session.setIsResultModalOpen(false)}
      />
    </div>
  );
};

export default App;