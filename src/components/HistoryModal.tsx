import React from 'react';
import type { AttemptRecord } from '../data/types';
import { deleteAttempt, clearAllAttempts } from '../utils/storage';

interface HistoryModalProps {
  isOpen: boolean;
  attempts: AttemptRecord[];
  onClose: () => void;
  onRefresh: () => void;
  onRetakeMistakes?: (attempt: AttemptRecord) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  attempts,
  onClose,
  onRefresh,
}) => {
  if (!isOpen) return null;

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xoá lần thi này?')) {
      deleteAttempt(id);
      onRefresh();
    }
  };

  const handleClearAll = () => {
    if (confirm('Bạn có chắc muốn xoá toàn bộ lịch sử làm bài?')) {
      clearAllAttempts();
      onRefresh();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} giây`;
    return `${mins}p ${secs}s`;
  };

  const formatDate = (ts: number): string => {
    const d = new Date(ts);
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const avgScore =
    attempts.length > 0
      ? (
          attempts.reduce((acc, cur) => acc + (cur.score / cur.totalQuestions) * 10, 0) /
          attempts.length
        ).toFixed(1)
      : '0.0';

  const bestScore =
    attempts.length > 0
      ? Math.max(...attempts.map((a) => (a.score / a.totalQuestions) * 10)).toFixed(1)
      : '0.0';

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px' }}
      >
        <div className="modal-header">
          <h2 className="modal-title">📊 Lịch sử làm bài</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </div>

        {attempts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📝</div>
            <p style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-main)' }}>
              Chưa có lịch sử làm bài nào
            </p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Hãy bắt đầu làm bài và nộp bài để xem lịch sử và tiến độ ở đây!
            </p>
          </div>
        ) : (
          <>
            {/* Statistics Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--card-border)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Số lần làm</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {attempts.length}
                </div>
              </div>
              <div
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--card-border)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Điểm trung bình</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--warning)' }}>
                  {avgScore}/10
                </div>
              </div>
              <div
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--card-border)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Điểm cao nhất</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>
                  {bestScore}/10
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '0.5rem',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Lưu tối đa 50 lần gần nhất trên trình duyệt (LocalStorage)
              </span>
              <button
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.25rem 0.6rem', color: 'var(--danger)' }}
                onClick={handleClearAll}
              >
                🗑️ Xoá tất cả
              </button>
            </div>

            {/* History List */}
            <div className="history-list">
              {attempts.map((item) => (
                <div key={item.id} className="history-item">
                  <div className="history-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="history-title">{item.testTitle}</span>
                      <span
                        className={`badge ${item.mode === 'exam' ? 'badge-primary' : 'badge-info'}`}
                        style={{ fontSize: '0.7rem' }}
                      >
                        {item.mode === 'exam' ? 'Thi thử' : 'Ôn tập'}
                      </span>
                    </div>
                    <div className="history-meta">
                      <span>👤 {item.userName || 'Ẩn danh'}</span>
                      <span>📅 {formatDate(item.timestamp)}</span>
                      <span>⏱️ {formatTime(item.timeSpentSeconds)}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div className="history-score">
                        {item.score}/{item.totalQuestions}
                      </div>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color:
                            item.percentage >= 80
                              ? 'var(--success)'
                              : item.percentage >= 50
                              ? 'var(--warning)'
                              : 'var(--danger)',
                        }}
                      >
                        {((item.score / item.totalQuestions) * 10).toFixed(1)}đ ({item.percentage}%)
                      </div>
                    </div>

                    <button
                      className="btn-icon"
                      style={{ color: 'var(--danger)', borderColor: 'transparent' }}
                      onClick={() => handleDelete(item.id)}
                      title="Xoá lần này"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
