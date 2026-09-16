import React from 'react';
import type { AttemptRecord } from '../data/types';
import { deleteAttempt, clearAllAttempts } from '../utils/storage';
import { IconHistory, IconX, IconTrash, IconTimer, IconUser } from './icons';

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
    if (mins === 0) return `${secs}s`;
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
      className="modal-backdrop"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      <div
        className="modal-surface"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px' }}
      >
        <div className="modal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <IconHistory size={20} color="var(--accent-primary)" />
            <h2 className="modal-heading">Lịch sử làm bài</h2>
          </div>
          <button className="btn-icon-square" onClick={onClose} aria-label="Đóng">
            <IconX size={16} />
          </button>
        </div>

        {attempts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)' }}>
            <div style={{ marginBottom: '0.5rem', opacity: 0.5 }}>
              <IconHistory size={40} />
            </div>
            <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
              Chưa có dữ liệu bài làm
            </p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Kết quả các lần thi thử sẽ được lưu trữ tự động tại đây.
            </p>
          </div>
        ) : (
          <>
            {/* Statistics Bar */}
            <div className="stats-row">
              <div className="stat-box">
                <div className="stat-label">Lần thi</div>
                <div className="stat-value" style={{ color: 'var(--accent-primary)' }}>
                  {attempts.length}
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Trung bình</div>
                <div className="stat-value" style={{ color: 'var(--accent-warning)' }}>
                  {avgScore}đ
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Cao nhất</div>
                <div className="stat-value" style={{ color: 'var(--accent-success)' }}>
                  {bestScore}đ
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.8rem',
                color: 'var(--text-tertiary)',
              }}
            >
              <span>Lưu tối đa 50 lần gần nhất trên thiết bị</span>
              <button
                className="btn-pill"
                style={{ color: 'var(--accent-danger)', borderColor: 'var(--accent-danger-border)' }}
                onClick={handleClearAll}
              >
                <IconTrash size={13} />
                <span>Xoá tất cả</span>
              </button>
            </div>

            {/* History List */}
            <div className="history-scroll">
              {attempts.map((item) => (
                <div key={item.id} className="history-card">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {item.testTitle}
                      </span>
                      <span
                        className={`pill-badge ${item.mode === 'exam' ? 'pill-primary' : 'pill-default'}`}
                        style={{ fontSize: '0.65rem' }}
                      >
                        {item.mode === 'exam' ? 'Thi thử' : 'Ôn tập'}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        gap: '0.65rem',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <IconUser size={12} />
                        {item.userName || 'Ẩn danh'}
                      </span>
                      <span>{formatDate(item.timestamp)}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <IconTimer size={12} />
                        {formatTime(item.timeSpentSeconds)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 800,
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--accent-primary)',
                        }}
                      >
                        {item.score}/{item.totalQuestions}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color:
                            item.percentage >= 80
                              ? 'var(--accent-success)'
                              : item.percentage >= 50
                              ? 'var(--accent-warning)'
                              : 'var(--accent-danger)',
                        }}
                      >
                        {((item.score / item.totalQuestions) * 10).toFixed(1)}đ ({item.percentage}%)
                      </div>
                    </div>

                    <button
                      className="btn-icon-square"
                      style={{ color: 'var(--text-tertiary)' }}
                      onClick={() => handleDelete(item.id)}
                      title="Xoá lần này"
                      aria-label="Xoá lần thi này"
                    >
                      <IconX size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
          <button className="btn-action btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
