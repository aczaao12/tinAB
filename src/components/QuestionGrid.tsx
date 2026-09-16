import React from 'react';
import type { Question, UserAnswer } from '../data/types';

interface QuestionGridProps {
  questions: Question[];
  currentIndex: number;
  answers: Record<string, UserAnswer>;
  mode: 'practice' | 'exam';
  isExamSubmitted: boolean;
  onSelectIndex: (index: number) => void;
}

export const QuestionGrid: React.FC<QuestionGridProps> = ({
  questions,
  currentIndex,
  answers,
  mode,
  isExamSubmitted,
  onSelectIndex,
}) => {
  const answeredCount = questions.filter(
    (q) => (answers[q.id]?.selectedOptionIds || []).length > 0
  ).length;

  const correctCount = questions.filter((q) => answers[q.id]?.isCorrect === true).length;

  const wrongCount = questions.filter((q) => {
    const a = answers[q.id];
    return a && a.selectedOptionIds.length > 0 && a.isCorrect === false;
  }).length;

  const progressPct =
    questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  const getCellStatus = (q: Question, idx: number): string => {
    const a = answers[q.id];
    let classes = '';

    if (idx === currentIndex) {
      classes += ' active';
    }

    if (!a || a.selectedOptionIds.length === 0) {
      return classes;
    }

    if (a.marked) {
      classes += ' marked';
    }

    if (mode === 'practice' || isExamSubmitted) {
      if (a.isCorrect) {
        classes += ' correct';
      } else {
        classes += ' wrong';
      }
    } else {
      classes += ' answered';
    }

    return classes;
  };

  return (
    <div className="navigator-card">
      <div className="nav-grid-header">
        <span>📌 Danh sách câu hỏi</span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {answeredCount}/{questions.length} ({progressPct}%)
        </span>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-fill" style={{ width: `${progressPct}%` }}></div>
      </div>

      {(mode === 'practice' || isExamSubmitted) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            fontWeight: 700,
          }}
        >
          <span style={{ color: 'var(--success-text)' }}>✓ Đúng: {correctCount}</span>
          <span style={{ color: 'var(--danger-text)' }}>✗ Sai: {wrongCount}</span>
          <span style={{ color: 'var(--text-muted)' }}>Chưa: {questions.length - answeredCount}</span>
        </div>
      )}

      {/* Grid of Question Numbers */}
      <div className="nav-grid">
        {questions.map((q, idx) => (
          <button
            key={q.id}
            className={`grid-cell ${getCellStatus(q, idx)}`}
            onClick={() => onSelectIndex(idx)}
            title={`Câu ${idx + 1}`}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="legend">
        {mode === 'practice' || isExamSubmitted ? (
          <>
            <div className="legend-item">
              <span
                className="legend-color"
                style={{ background: 'var(--success-bg)', borderColor: 'var(--success-border)' }}
              ></span>
              <span>Đúng</span>
            </div>
            <div className="legend-item">
              <span
                className="legend-color"
                style={{ background: 'var(--danger-bg)', borderColor: 'var(--danger-border)' }}
              ></span>
              <span>Sai</span>
            </div>
          </>
        ) : (
          <div className="legend-item">
            <span
              className="legend-color"
              style={{ background: 'var(--primary-light)', borderColor: 'var(--primary-border)' }}
            ></span>
            <span>Đã chọn</span>
          </div>
        )}
        <div className="legend-item">
          <span className="legend-color" style={{ background: 'var(--bg)' }}></span>
          <span>Chưa làm</span>
        </div>
        <div className="legend-item">
          <span style={{ color: 'var(--warning)', fontSize: '0.85rem' }}>★</span>
          <span>Đánh dấu</span>
        </div>
      </div>
    </div>
  );
};
