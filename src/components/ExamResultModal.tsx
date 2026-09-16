import React from 'react';
import {
  IconTrophy,
  IconCheckCircle,
  IconX,
  IconRefresh,
  IconTimer,
  IconAlertCircle,
} from './icons';

interface ExamResultModalProps {
  isOpen: boolean;
  score: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  userName: string;
  hasMistakes: boolean;
  mode?: 'practice' | 'exam';
  onReview: () => void;
  onRetry: () => void;
  onRetryMistakes: () => void;
  onClose: () => void;
}

export const ExamResultModal: React.FC<ExamResultModalProps> = ({
  isOpen,
  score,
  totalQuestions,
  timeSpentSeconds,
  userName,
  hasMistakes,
  mode,
  onReview,
  onRetry,
  onRetryMistakes,
}) => {
  if (!isOpen) return null;

  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const grade10 = totalQuestions > 0 ? ((score / totalQuestions) * 10).toFixed(1) : '0.0';

  const formatTime = (sec: number): string => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    if (mins === 0) return `${s} giây`;
    return `${mins} phút ${s} giây`;
  };

  const getRating = (pct: number): { text: string; color: string } => {
    if (pct >= 90) return { text: 'Kết quả xuất sắc', color: 'var(--accent-success)' };
    if (pct >= 80) return { text: 'Đạt kết quả tốt', color: 'var(--accent-success)' };
    if (pct >= 65) return { text: 'Đạt yêu cầu', color: 'var(--accent-primary)' };
    if (pct >= 50) return { text: 'Cần ôn luyện thêm', color: 'var(--accent-warning)' };
    return { text: 'Chưa đạt yêu cầu', color: 'var(--accent-danger)' };
  };

  const rating = getRating(percentage);
  const mistakesCount = totalQuestions - score;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-surface" style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{ display: 'inline-flex', justifyContent: 'center', margin: '0 auto', color: rating.color }}>
          <IconTrophy size={48} />
        </div>

        <div>
          <h2
            style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.3px',
            }}
          >
            {rating.text}
          </h2>
          {userName && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
              Thí sinh: <strong>{userName}</strong>
            </p>
          )}
        </div>

        {/* Scorecard Showcase */}
        <div className="score-showcase">
          <div className="score-display">
            {grade10}
            <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              /10
            </span>
          </div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
            {score} / {totalQuestions} câu chính xác ({percentage}%)
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1.25rem',
              marginTop: '0.5rem',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <IconTimer size={14} />
              <span>{formatTime(timeSpentSeconds)}</span>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: mistakesCount > 0 ? 'var(--accent-danger)' : undefined }}>
              <IconAlertCircle size={14} />
              <span>{mistakesCount} câu sai</span>
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button className="btn-action btn-primary" onClick={onReview}>
            <IconCheckCircle size={16} />
            <span>{mode === 'practice' ? 'Tiếp tục làm bài / Xem lại' : 'Xem lại chi tiết bài làm'}</span>
          </button>

          {hasMistakes && (
            <button
              className="btn-action btn-secondary"
              style={{ color: 'var(--accent-warning)', borderColor: 'var(--accent-warning-border)' }}
              onClick={onRetryMistakes}
            >
              <IconRefresh size={16} />
              <span>Chỉ làm lại {mistakesCount} câu sai</span>
            </button>
          )}

          <button className="btn-action btn-secondary" onClick={onRetry}>
            <IconRefresh size={16} />
            <span>Làm lại toàn bộ đề thi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
