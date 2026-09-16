import React, { useRef } from 'react';
import type { Question, UserAnswer } from '../data/types';
import {
  IconStar,
  IconCheck,
  IconX,
  IconArrowLeft,
  IconArrowRight,
  IconLightbulb,
  IconCheckCircle,
  IconAlertCircle,
  IconRefresh,
} from './icons';

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  userAnswer?: UserAnswer;
  mode: 'practice' | 'exam';
  isExamSubmitted: boolean;
  onSelectOption: (optId: string) => void;
  onCheckMultiAnswer?: () => void;
  onResetCurrentAnswer?: () => void;
  onToggleFlag: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSubmitExam: () => void;
  canPrev: boolean;
  canNext: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
  userAnswer,
  mode,
  isExamSubmitted,
  onSelectOption,
  onCheckMultiAnswer,
  onResetCurrentAnswer,
  onToggleFlag,
  onPrev,
  onNext,
  onSubmitExam,
  canPrev,
  canNext,
}) => {
  const selectedOptionIds = userAnswer?.selectedOptionIds || [];
  const isFlagged = userAnswer?.marked || false;
  const isSubmitted = userAnswer?.isSubmitted || false;

  // Swipe detection references
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Minimum swipe threshold of 45px and predominantly horizontal
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
      try {
        localStorage.setItem('tinab_seen_swipe_hint', 'true');
      } catch {}
      if (deltaX < 0 && canNext) {
        // Swiped left -> Next
        onNext();
      } else if (deltaX > 0 && canPrev) {
        // Swiped right -> Previous
        onPrev();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const showFeedback =
    (mode === 'practice' && isSubmitted) ||
    (mode === 'exam' && isExamSubmitted);

  const getOptionClass = (optId: string, isCorrect: boolean): string => {
    const isSelected = selectedOptionIds.includes(optId);

    if (!showFeedback) {
      return isSelected ? 'is-selected' : '';
    }

    if (isCorrect) {
      return 'is-correct';
    }

    if (isSelected && !isCorrect) {
      return 'is-wrong';
    }

    return '';
  };

  const isRight = userAnswer?.isCorrect;
  const isMulti = question.type === 'multiple';

  return (
    <div
      className="stage-card"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pinned Stage Header (Sticky) */}
      <div className="stage-header">
        <div className="stage-tags">
          <span className="pill-badge pill-primary">
            Câu {currentIndex + 1} / {totalQuestions}
          </span>
          <span className={`pill-badge ${isMulti ? 'pill-warning' : 'pill-default'}`}>
            {isMulti ? 'Nhiều đáp án' : '1 đáp án'}
          </span>
          {showFeedback && (
            <span
              className={`pill-badge ${isRight ? 'pill-success' : 'pill-danger'}`}
            >
              {isRight ? (
                <>
                  <IconCheckCircle size={13} />
                  <span>Chính xác</span>
                </>
              ) : (
                <>
                  <IconAlertCircle size={13} />
                  <span>Chưa đúng</span>
                </>
              )}
            </span>
          )}
        </div>

        {/* Flag Bookmark */}
        <button
          className={`btn-flag ${isFlagged ? 'flagged' : ''}`}
          onClick={onToggleFlag}
          title="Đánh dấu câu hỏi để xem lại"
          aria-label="Đánh dấu câu hỏi"
        >
          <IconStar size={15} filled={isFlagged} />
          <span>{isFlagged ? 'Đã đánh dấu' : 'Đánh dấu'}</span>
        </button>
      </div>

      {/* Scrollable Stage Content Body */}
      <div className="stage-content-scroll">
        {/* Mobile-Only Swipe Indicator Cue */}
        <div className="mobile-only flex items-center justify-between text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-2 px-1 select-none">
          <span className="flex items-center gap-1 opacity-70">
            {canPrev ? '‹ Vuốt sang phải' : ''}
          </span>
          <span className="flex items-center gap-1 opacity-60">
            <span className="inline-block animate-swipe-lr">‹ Vuốt chuyển câu ›</span>
          </span>
          <span className="flex items-center gap-1 opacity-70">
            {canNext ? 'Vuốt sang trái ›' : ''}
          </span>
        </div>

        {/* Question Prompt */}
        <h2 className="question-heading">{question.prompt}</h2>

        {/* Options Stack */}
        <div className="choices-stack">
          {question.options.map((option, idx) => {
            const isSelected = selectedOptionIds.includes(option.id);
            const optClass = getOptionClass(option.id, option.isCorrect);

            return (
              <div
                key={option.id}
                className={`choice-card ${optClass}`}
                role="button"
                tabIndex={0}
                onClick={() => onSelectOption(option.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelectOption(option.id);
                  }
                }}
              >
                <div className="choice-key" title={`Phím tắt: ${idx + 1} hoặc ${option.id}`}>
                  {option.id}
                </div>

                <div className="choice-text">{option.text}</div>

                {showFeedback && (
                  <>
                    {option.isCorrect && (
                      <span
                        className="choice-status-badge"
                        style={{
                          background: 'var(--accent-success-subtle)',
                          color: 'var(--accent-success-text)',
                        }}
                      >
                        <IconCheck size={14} />
                        <span className="desktop-only">Đáp án đúng</span>
                      </span>
                    )}
                    {!option.isCorrect && isSelected && (
                      <span
                        className="choice-status-badge"
                        style={{
                          background: 'var(--accent-danger-subtle)',
                          color: 'var(--accent-danger-text)',
                        }}
                      >
                        <IconX size={14} />
                        <span className="desktop-only">Đã chọn</span>
                      </span>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Multi-choice Confirmation in Practice Mode */}
        {mode === 'practice' && isMulti && !isSubmitted && (
          <div className="multi-action-bar">
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Đã chọn <strong>{selectedOptionIds.length}</strong> phương án
            </span>
            <button
              className="btn-action btn-primary"
              disabled={selectedOptionIds.length === 0}
              onClick={onCheckMultiAnswer}
            >
              <IconCheck size={16} />
              <span>Kiểm tra đáp án</span>
            </button>
          </div>
        )}

        {/* Feedback explanation box */}
        {showFeedback && (
          <div className="solution-panel">
            <div className="solution-header">
              <IconLightbulb size={16} />
              <span>Đáp án chuẩn xác</span>
            </div>
            <div className="solution-content">
              {question.correctAnswerText}
            </div>
            {mode === 'practice' && !isRight && onResetCurrentAnswer && (
              <div style={{ marginTop: '0.25rem' }}>
                <button
                  className="btn-pill"
                  style={{ fontSize: '0.8rem', padding: '0.3rem 0.65rem' }}
                  onClick={onResetCurrentAnswer}
                >
                  <IconRefresh size={14} />
                  <span>Thử chọn lại câu này</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pinned Stage Footer (Sticky at bottom on Desktop) */}
      <div className="stage-footer desktop-only">
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-action btn-secondary" onClick={onPrev} disabled={!canPrev}>
            <IconArrowLeft size={16} />
            <span>Câu trước</span>
          </button>
          <button className="btn-action btn-secondary" onClick={onNext} disabled={!canNext}>
            <span>Câu sau</span>
            <IconArrowRight size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {/* Submit / Finish button always available */}
          {!isExamSubmitted && (
            <button
              className="btn-action btn-success"
              onClick={onSubmitExam}
              title={mode === 'exam' ? 'Nộp bài thi' : 'Hoàn thành & Tổng kết điểm ôn tập'}
            >
              <IconCheckCircle size={16} />
              <span>{mode === 'exam' ? 'Nộp bài thi' : 'Nộp / Tổng kết điểm'}</span>
            </button>
          )}

          {canNext && (
            <button className="btn-action btn-primary" onClick={onNext}>
              <span>Tiếp theo</span>
              <IconArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
