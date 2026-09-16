import React from 'react';
import type { TestSuite } from '../data/types';

interface NavbarProps {
  testSuites: TestSuite[];
  selectedTestId: string;
  mode: 'practice' | 'exam';
  userName: string;
  isShuffled: boolean;
  theme: string;
  timerSeconds: number;
  onSelectTest: (id: string) => void;
  onSelectMode: (mode: 'practice' | 'exam') => void;
  onToggleShuffle: () => void;
  onOpenNameModal: () => void;
  onOpenHistoryModal: () => void;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  testSuites,
  selectedTestId,
  mode,
  userName,
  isShuffled,
  theme,
  timerSeconds,
  onSelectTest,
  onSelectMode,
  onToggleShuffle,
  onOpenNameModal,
  onOpenHistoryModal,
  onToggleTheme,
}) => {
  const formatTimer = (sec: number): string => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="brand">
            <span className="brand-badge">tinAB</span>
            <span className="brand-text">Ôn Tập Tin Học</span>
          </div>

          {/* Test selector */}
          <select
            className="select-input"
            value={selectedTestId}
            onChange={(e) => onSelectTest(e.target.value)}
          >
            {testSuites.map((suite) => (
              <option key={suite.id} value={suite.id}>
                {suite.shortTitle} ({suite.totalQuestions} câu)
              </option>
            ))}
            <option value="all">Tất cả đề thi (338 câu)</option>
          </select>
        </div>

        {/* Mode Selector */}
        <div className="mode-tabs">
          <button
            className={`mode-tab ${mode === 'practice' ? 'active' : ''}`}
            onClick={() => onSelectMode('practice')}
            title="Chọn đáp án xem kết quả ngay lập tức"
          >
            🎯 Ôn tập
          </button>
          <button
            className={`mode-tab ${mode === 'exam' ? 'active' : ''}`}
            onClick={() => onSelectMode('exam')}
            title="Đếm giờ, nộp bài tính điểm tổng kết"
          >
            ⏱️ Thi thử
          </button>
        </div>

        {/* Timer in Exam mode */}
        {mode === 'exam' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 800,
              fontSize: '1.05rem',
              color: 'var(--primary)',
              background: 'var(--primary-light)',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--primary-border)',
            }}
          >
            <span>⏳</span>
            <span>{formatTimer(timerSeconds)}</span>
          </div>
        )}

        {/* Actions */}
        <div className="nav-actions">
          {/* Shuffle toggle */}
          <button
            className="btn-icon"
            style={{
              color: isShuffled ? 'var(--primary)' : 'var(--text-muted)',
              borderColor: isShuffled ? 'var(--primary-border)' : 'var(--card-border)',
            }}
            onClick={onToggleShuffle}
            title={isShuffled ? 'Đang bật xáo trộn câu hỏi' : 'Xáo trộn ngẫu nhiên thứ tự câu'}
          >
            🔀
          </button>

          {/* History button */}
          <button className="btn btn-secondary" onClick={onOpenHistoryModal} title="Xem lịch sử làm bài">
            📊 Lịch sử
          </button>

          {/* User name button */}
          <button className="btn btn-secondary" onClick={onOpenNameModal} title="Đổi tên của bạn">
            👤 {userName || 'Nhập tên'}
          </button>

          {/* Theme toggle */}
          <button className="btn-icon" onClick={onToggleTheme} title="Chuyển chế độ Sáng / Tối">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  );
};
