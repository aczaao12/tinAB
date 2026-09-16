import React from 'react';

interface ExamResultModalProps {
  isOpen: boolean;
  score: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  userName: string;
  hasMistakes: boolean;
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

  const getRating = (pct: number): { text: string; icon: string; color: string } => {
    if (pct >= 90) return { text: 'Xuất sắc!', icon: '🏆', color: 'var(--success)' };
    if (pct >= 80) return { text: 'Rất tốt!', icon: '🎉', color: 'var(--success)' };
    if (pct >= 65) return { text: 'Đạt yêu cầu!', icon: '👍', color: 'var(--primary)' };
    if (pct >= 50) return { text: 'Cần ôn thêm!', icon: '📚', color: 'var(--warning)' };
    return { text: 'Chưa đạt, hãy luyện tập lại nhé!', icon: '💪', color: 'var(--danger)' };
  };

  const rating = getRating(percentage);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card" style={{ textAlign: 'center', maxWidth: '520px' }}>
        <div style={{ fontSize: '3.5rem', lineHeight: 1 }}>{rating.icon}</div>
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            marginTop: '-0.5rem',
          }}
        >
          {rating.text}
        </h2>
        {userName && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '-0.5rem' }}>
            Chúc mừng <strong>{userName}</strong> đã hoàn thành bài thi!
          </p>
        )}

        {/* Score Hero Box */}
        <div className="score-hero">
          <div className="score-number">
            {grade10}
            <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              /10
            </span>
          </div>
          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1.1rem' }}>
            {score} / {totalQuestions} câu đúng ({percentage}%)
          </div>
          <div className="score-details">
            <span>
              ⏱️ Thời gian: <strong>{formatTime(timeSpentSeconds)}</strong>
            </span>
            <span>
              ❌ Sai: <strong>{totalQuestions - score}</strong>
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
          <button className="btn btn-primary" style={{ padding: '0.75rem 1rem' }} onClick={onReview}>
            🔍 Xem chi tiết đáp án & giải thích
          </button>

          {hasMistakes && (
            <button
              className="btn btn-secondary"
              style={{
                padding: '0.75rem 1rem',
                borderColor: 'var(--warning-border)',
                color: 'var(--warning)',
              }}
              onClick={onRetryMistakes}
            >
              ⚡ Chỉ làm lại {totalQuestions - score} câu sai
            </button>
          )}

          <button className="btn btn-secondary" style={{ padding: '0.75rem 1rem' }} onClick={onRetry}>
            🔄 Làm lại toàn bộ đề thi này
          </button>
        </div>
      </div>
    </div>
  );
};
