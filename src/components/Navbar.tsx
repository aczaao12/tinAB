import React from 'react';
import type { TestSuite } from '../data/types';
import {
  IconTarget,
  IconTimer,
  IconShuffle,
  IconHistory,
  IconUser,
  IconSun,
  IconMoon,
} from './icons';

interface NavbarProps {
  testSuites: TestSuite[];
  selectedTestId: string;
  isMistakePractice?: boolean;
  mistakesCount?: number;
  mode: 'practice' | 'exam';
  userName: string;
  isShuffled: boolean;
  theme: string;
  timerSeconds: number;
  onSelectTest: (id: string) => void;
  onExitMistakePractice?: () => void;
  onSelectMode: (mode: 'practice' | 'exam') => void;
  onToggleShuffle: () => void;
  onOpenNameModal: () => void;
  onOpenHistoryModal: () => void;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  testSuites,
  selectedTestId,
  isMistakePractice = false,
  mistakesCount = 0,
  mode,
  userName,
  isShuffled,
  theme,
  timerSeconds,
  onSelectTest,
  onExitMistakePractice,
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
    <header className="site-header">
      <div className="header-inner">
        {/* Brand & Test Picker */}
        <div className="brand-group">
          <div className="brand-mark">
            <span className="brand-tag">tinAB</span>
            <span className="desktop-only" style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              Trắc Nghiệm
            </span>
          </div>

          {isMistakePractice ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="pill-badge pill-warning">
                Ôn {mistakesCount} câu sai
              </span>
              <button
                className="btn-pill"
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                onClick={onExitMistakePractice}
                title="Quay lại toàn bộ bài thi"
              >
                ✕ Thoát
              </button>
            </div>
          ) : (
            <select
              className="test-selector-dropdown"
              value={selectedTestId}
              onChange={(e) => onSelectTest(e.target.value)}
            >
              {testSuites.map((suite) => (
                <option key={suite.id} value={suite.id}>
                  {suite.shortTitle} ({suite.totalQuestions} câu)
                </option>
              ))}
              <option value="all">Tất cả đề (338 câu)</option>
            </select>
          )}
        </div>

        {/* Mode Segmented Control */}
        <div className="segmented-control">
          <button
            className={`segmented-btn ${mode === 'practice' ? 'active' : ''}`}
            onClick={() => onSelectMode('practice')}
            title="Luyện tập xem đáp án ngay"
          >
            <IconTarget size={15} />
            <span>Ôn tập</span>
          </button>
          <button
            className={`segmented-btn ${mode === 'exam' ? 'active' : ''}`}
            onClick={() => onSelectMode('exam')}
            title="Thi thử tính điểm và thời gian"
          >
            <IconTimer size={15} />
            <span>Thi thử</span>
          </button>
        </div>

        {/* Timer in Exam mode */}
        {mode === 'exam' && (
          <div className="timer-badge">
            <IconTimer size={14} />
            <span>{formatTimer(timerSeconds)}</span>
          </div>
        )}

        {/* Header Tools */}
        <div className="header-actions">
          {/* Shuffle Button */}
          <button
            className={`btn-icon-square ${isShuffled ? 'active' : ''}`}
            onClick={onToggleShuffle}
            title={isShuffled ? 'Đang bật xáo trộn ngẫu nhiên' : 'Xáo trộn câu hỏi'}
            aria-label="Xáo trộn câu hỏi"
          >
            <IconShuffle size={16} />
          </button>

          {/* History Button */}
          <button
            className="btn-pill desktop-only"
            onClick={onOpenHistoryModal}
            title="Lịch sử làm bài"
          >
            <IconHistory size={15} />
            <span>Lịch sử</span>
          </button>

          <button
            className="btn-icon-square mobile-only"
            onClick={onOpenHistoryModal}
            title="Lịch sử làm bài"
            aria-label="Lịch sử làm bài"
          >
            <IconHistory size={16} />
          </button>

          {/* User Name */}
          <button
            className="btn-pill desktop-only"
            onClick={onOpenNameModal}
            title="Tên người làm"
          >
            <IconUser size={15} />
            <span style={{ maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userName || 'Nhập tên'}
            </span>
          </button>

          {/* Theme Switcher */}
          <button
            className="btn-icon-square"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
            aria-label="Chuyển chế độ giao diện"
          >
            {theme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
};
