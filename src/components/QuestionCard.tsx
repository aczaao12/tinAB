import React from 'react';
import type { Question, UserAnswer } from '../data/types';

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  userAnswer?: UserAnswer;
  mode: 'practice' | 'exam';
  isExamSubmitted: boolean;
  onSelectOption: (optId: string) => void;
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
  onToggleFlag,
  onPrev,
  onNext,
  onSubmitExam,
  canPrev,
  canNext,
}) => {
  const selectedOptionIds = userAnswer?.selectedOptionIds || [];
  const isFlagged = userAnswer?.marked || false;

  // Show feedback if:
  // - In practice mode AND an answer is chosen
  // - Or in exam mode AND exam is submitted
  const showFeedback =
    (mode === 'practice' && selectedOptionIds.length > 0) ||
    (mode === 'exam' && isExamSubmitted);

  const getOptionClass = (optId: string, isCorrect: boolean): string => {
    const isSelected = selectedOptionIds.includes(optId);

    if (!showFeedback) {
      return isSelected ? 'selected' : '';
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

  return (
    <div className="quiz-card">
      {/* Meta bar */}
      <div className="quiz-meta-bar">
        <div className="meta-badges">
          <span className="badge badge-primary">
            Câu {currentIndex + 1} / {totalQuestions}
          </span>
          <span className={`badge ${question.type === 'multiple' ? 'badge-warning' : 'badge-info'}`}>
            {question.type === 'multiple' ? '☑️ Chọn nhiều đáp án' : '🔘 Chọn 1 đáp án'}
          </span>
          {showFeedback && (
            <span
              className={`badge ${isRight ? 'badge-primary' : 'badge-warning'}`}
              style={{
                background: isRight ? 'var(--success-bg)' : 'var(--danger-bg)',
                color: isRight ? 'var(--success-text)' : 'var(--danger-text)',
                borderColor: isRight ? 'var(--success-border)' : 'var(--danger-border)',
              }}
            >
              {isRight ? '✓ Trả lời đúng' : '✗ Trả lời sai'}
            </span>
          )}
        </div>

        {/* Flag bookmark button */}
        <button
          className="btn btn-secondary"
          style={{
            padding: '0.35rem 0.65rem',
            fontSize: '0.85rem',
            color: isFlagged ? 'var(--warning)' : 'var(--text-muted)',
            borderColor: isFlagged ? 'var(--warning-border)' : 'var(--card-border)',
          }}
          onClick={onToggleFlag}
          title="Đánh dấu câu này để xem lại"
        >
          {isFlagged ? '★ Đã đánh dấu' : '☆ Đánh dấu'}
        </button>
      </div>

      {/* Prompt */}
      <div className="question-prompt">{question.prompt}</div>

      {/* Options List */}
      <div className="options-list">
        {question.options.map((option) => {
          const isSelected = selectedOptionIds.includes(option.id);
          const optClass = getOptionClass(option.id, option.isCorrect);

          return (
            <div
              key={option.id}
              className={`option-item ${optClass}`}
              role="button"
              tabIndex={0}
              onClick={() => onSelectOption(option.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectOption(option.id);
                }
              }}
            >
              <span className="option-letter">{option.id}</span>
              <span className="option-text">{option.text}</span>

              {showFeedback && (
                <>
                  {option.isCorrect && (
                    <span
                      className="option-badge"
                      style={{ background: 'var(--success-bg)', color: 'var(--success-text)' }}
                    >
                      ✓ Đáp án đúng
                    </span>
                  )}
                  {!option.isCorrect && isSelected && (
                    <span
                      className="option-badge"
                      style={{ background: 'var(--danger-bg)', color: 'var(--danger-text)' }}
                    >
                      ✗ Bạn chọn
                    </span>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Feedback / Explanation */}
      {showFeedback && (
        <div className="explanation-box">
          <div className="explanation-title">
            <span>💡 Đáp án chuẩn xác:</span>
          </div>
          <div className="explanation-text">
            <strong>{question.correctAnswerText}</strong>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="quiz-controls">
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={onPrev} disabled={!canPrev}>
            ⬅️ Câu trước
          </button>
          <button className="btn btn-secondary" onClick={onNext} disabled={!canNext}>
            Câu tiếp ➡️
          </button>
        </div>

        <div>
          {mode === 'exam' && !isExamSubmitted ? (
            <button className="btn btn-success" onClick={onSubmitExam}>
              📝 Nộp bài thi
            </button>
          ) : canNext ? (
            <button className="btn btn-primary" onClick={onNext}>
              Tiếp theo ➔
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
