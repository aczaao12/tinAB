import React from 'react';
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

  // Feedback is displayed when:
  // - In practice mode: single-choice answer selected, OR multi-choice answer confirmed (isSubmitted = true)
  // - In exam mode: exam is submitted
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
    <div className="stage-card">
      {/* Header bar with question number, type, feedback, and flag */}
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
              {/* Option letter and key hint */}
              <div className="choice-key" title={`Phím tắt: ${idx + 1} hoặc ${option.id}`}>
                {option.id}
              </div>

              {/* Option text */}
              <div className="choice-text">{option.text}</div>

              {/* Status Badge in Feedback mode */}
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

      {/* Desktop Stage Footer Controls */}
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

        <div>
          {mode === 'exam' && !isExamSubmitted ? (
            <button className="btn-action btn-success" onClick={onSubmitExam}>
              <IconCheckCircle size={16} />
              <span>Nộp bài thi</span>
            </button>
          ) : canNext ? (
            <button className="btn-action btn-primary" onClick={onNext}>
              <span>Tiếp theo</span>
              <IconArrowRight size={16} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
