import React, { useState } from 'react';
import type { Question, UserAnswer } from '../data/types';
import { IconCheck, IconX, IconStar } from './icons';

interface QuestionGridProps {
  questions: Question[];
  currentIndex: number;
  answers: Record<string, UserAnswer>;
  mode: 'practice' | 'exam';
  isExamSubmitted: boolean;
  onSelectIndex: (index: number) => void;
  isMobileDrawer?: boolean;
}

export const QuestionGrid: React.FC<QuestionGridProps> = ({
  questions,
  currentIndex,
  answers,
  mode,
  isExamSubmitted,
  onSelectIndex,
  isMobileDrawer = false,
}) => {
  const [filter, setFilter] = useState<'all' | 'unanswered' | 'flagged'>('all');

  const answeredCount = questions.filter(
    (q) => (answers[q.id]?.selectedOptionIds || []).length > 0
  ).length;

  const correctCount = questions.filter((q) => answers[q.id]?.isCorrect === true).length;

  const wrongCount = questions.filter((q) => {
    const a = answers[q.id];
    return a && a.isSubmitted && a.isCorrect === false;
  }).length;

  const flaggedCount = questions.filter((q) => answers[q.id]?.marked).length;

  const progressPct =
    questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  const getCellStatus = (q: Question, idx: number): string => {
    const a = answers[q.id];
    let classes = '';

    if (idx === currentIndex) {
      classes += ' is-active';
    }

    if (!a || a.selectedOptionIds.length === 0) {
      return classes;
    }

    if (a.marked) {
      classes += ' is-marked';
    }

    if (mode === 'practice' || isExamSubmitted) {
      if (a.isSubmitted) {
        if (a.isCorrect) {
          classes += ' is-correct';
        } else {
          classes += ' is-wrong';
        }
      } else {
        classes += ' is-answered';
      }
    } else {
      classes += ' is-answered';
    }

    return classes;
  };

  const filteredQuestions = questions.map((q, idx) => ({ q, idx })).filter(({ q }) => {
    const a = answers[q.id];
    if (filter === 'unanswered') {
      return !a || a.selectedOptionIds.length === 0;
    }
    if (filter === 'flagged') {
      return a?.marked === true;
    }
    return true;
  });

  return (
    <div className={isMobileDrawer ? 'mobile-sheet-content' : 'cockpit-panel desktop-only'}>
      <div className="cockpit-header">
        <span className="cockpit-title">Bảng câu hỏi</span>
        <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          {answeredCount}/{questions.length} ({progressPct}%)
        </span>
      </div>

      {/* Progress Track */}
      <div className="progress-track">
        <div className="progress-bar" style={{ width: `${progressPct}%` }}></div>
      </div>

      {/* Stats row */}
      {(mode === 'practice' || isExamSubmitted) && (
        <div className="stats-row">
          <div className="stat-box">
            <div className="stat-label">Đúng</div>
            <div className="stat-value" style={{ color: 'var(--accent-success)' }}>
              {correctCount}
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Sai</div>
            <div className="stat-value" style={{ color: 'var(--accent-danger)' }}>
              {wrongCount}
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Đánh dấu</div>
            <div className="stat-value" style={{ color: 'var(--accent-warning)' }}>
              {flaggedCount}
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '2px' }}>
        <button
          className={`btn-pill ${filter === 'all' ? 'active' : ''}`}
          style={{
            fontSize: '0.75rem',
            padding: '0.2rem 0.5rem',
            background: filter === 'all' ? 'var(--accent-primary-subtle)' : undefined,
            color: filter === 'all' ? 'var(--accent-primary)' : undefined,
            borderColor: filter === 'all' ? 'var(--accent-primary-border)' : undefined,
          }}
          onClick={() => setFilter('all')}
        >
          Tất cả ({questions.length})
        </button>
        <button
          className={`btn-pill ${filter === 'unanswered' ? 'active' : ''}`}
          style={{
            fontSize: '0.75rem',
            padding: '0.2rem 0.5rem',
            background: filter === 'unanswered' ? 'var(--accent-primary-subtle)' : undefined,
            color: filter === 'unanswered' ? 'var(--accent-primary)' : undefined,
            borderColor: filter === 'unanswered' ? 'var(--accent-primary-border)' : undefined,
          }}
          onClick={() => setFilter('unanswered')}
        >
          Chưa làm ({questions.length - answeredCount})
        </button>
        {flaggedCount > 0 && (
          <button
            className={`btn-pill ${filter === 'flagged' ? 'active' : ''}`}
            style={{
              fontSize: '0.75rem',
              padding: '0.2rem 0.5rem',
              background: filter === 'flagged' ? 'var(--accent-warning-subtle)' : undefined,
              color: filter === 'flagged' ? 'var(--accent-warning)' : undefined,
              borderColor: filter === 'flagged' ? 'var(--accent-warning-border)' : undefined,
            }}
            onClick={() => setFilter('flagged')}
          >
            Đánh dấu ({flaggedCount})
          </button>
        )}
      </div>

      {/* Question Number Matrix */}
      <div className="matrix-grid">
        {filteredQuestions.map(({ q, idx }) => (
          <button
            key={q.id}
            className={`matrix-cell ${getCellStatus(q, idx)}`}
            onClick={() => onSelectIndex(idx)}
            title={`Câu ${idx + 1}`}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="matrix-legend">
        {mode === 'practice' || isExamSubmitted ? (
          <>
            <div className="legend-dot">
              <span className="dot" style={{ background: 'var(--accent-success)' }}></span>
              <span>Đúng</span>
            </div>
            <div className="legend-dot">
              <span className="dot" style={{ background: 'var(--accent-danger)' }}></span>
              <span>Sai</span>
            </div>
          </>
        ) : (
          <div className="legend-dot">
            <span className="dot" style={{ background: 'var(--accent-primary)' }}></span>
            <span>Đã chọn</span>
          </div>
        )}
        <div className="legend-dot">
          <span className="dot" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}></span>
          <span>Chưa làm</span>
        </div>
        <div className="legend-dot">
          <span className="dot" style={{ background: 'var(--accent-warning)' }}></span>
          <span>Đánh dấu</span>
        </div>
      </div>
    </div>
  );
};
