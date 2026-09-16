import React, { useState } from 'react';
import type { Question, UserAnswer } from '../data/types';

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

  // Count answered questions (has at least 1 selection)
  const answeredCount = questions.filter(
    (q) => (answers[q.id]?.selectedOptionIds || []).length > 0
  ).length;

  // Correct count
  const correctCount = questions.filter((q) => answers[q.id]?.isCorrect === true).length;

  // Wrong count
  const wrongCount = isExamSubmitted
    ? questions.length - correctCount
    : questions.filter((q) => {
        const a = answers[q.id];
        return a && a.isSubmitted && a.isCorrect === false;
      }).length;

  // Flagged count
  const flaggedCount = questions.filter((q) => answers[q.id]?.marked).length;

  const progressPct =
    questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  const getCellStatus = (q: Question, idx: number): string => {
    const a = answers[q.id];
    const classList: string[] = ['matrix-cell'];

    if (idx === currentIndex) {
      classList.push('is-active');
    }

    if (a?.marked) {
      classList.push('is-marked');
    }

    const hasAnswer = a && a.selectedOptionIds && a.selectedOptionIds.length > 0;

    if (mode === 'practice') {
      if (a?.isSubmitted) {
        if (a.isCorrect) {
          classList.push('is-correct');
        } else {
          classList.push('is-wrong');
        }
      } else if (hasAnswer) {
        classList.push('is-answered');
      }
    } else if (mode === 'exam') {
      if (isExamSubmitted) {
        if (a?.isCorrect) {
          classList.push('is-correct');
        } else {
          classList.push('is-wrong');
        }
      } else if (hasAnswer) {
        classList.push('is-answered');
      }
    }

    return classList.join(' ');
  };

  const filteredQuestions = questions
    .map((q, idx) => ({ q, idx }))
    .filter(({ q }) => {
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
      {/* Sticky Top Header of Cockpit */}
      <div className="cockpit-header-sticky">
        <div className="cockpit-header">
          <span className="cockpit-title">Bảng số câu hỏi</span>
          <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            {answeredCount}/{questions.length} ({progressPct}%)
          </span>
        </div>

        {/* Progress Track */}
        <div className="progress-track" style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
          <div className="progress-bar" style={{ width: `${progressPct}%` }}></div>
        </div>

        {/* Stats row */}
        {(mode === 'practice' || isExamSubmitted) && (
          <div className="stats-row" style={{ marginBottom: '0.5rem' }}>
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
            Chưa ({questions.length - answeredCount})
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
              ★ ({flaggedCount})
            </button>
          )}
        </div>
      </div>

      {/* Independently Scrollable Matrix Area */}
      <div className="cockpit-content-scroll">
        <div className="matrix-grid">
          {filteredQuestions.map(({ q, idx }) => {
            const a = answers[q.id];
            return (
              <button
                key={q.id}
                className={getCellStatus(q, idx)}
                onClick={() => onSelectIndex(idx)}
                title={`Câu ${idx + 1}`}
              >
                <span>{idx + 1}</span>
                {a?.marked && <span className="cell-star-badge">★</span>}
              </button>
            );
          })}
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
              <span>Đã làm</span>
            </div>
          )}
          <div className="legend-dot">
            <span className="dot" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}></span>
            <span>Chưa làm</span>
          </div>
          <div className="legend-dot">
            <span style={{ color: 'var(--accent-warning)', fontSize: '0.85rem' }}>★</span>
            <span>Đánh dấu</span>
          </div>
        </div>
      </div>
    </div>
  );
};
