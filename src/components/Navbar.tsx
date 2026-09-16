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
  IconChevronDown,
  IconMenu,
  IconStar,
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
  currentIndex: number;
  totalQuestions: number;
  isCurrentFlagged?: boolean;
  onToggleFlag?: () => void;
  onSelectTest: (id: string) => void;
  onExitMistakePractice?: () => void;
  onSelectMode: (mode: 'practice' | 'exam') => void;
  onToggleShuffle: () => void;
  onOpenNameModal: () => void;
  onOpenHistoryModal: () => void;
  onToggleTheme: () => void;
  onOpenMobileTestSheet: () => void;
  onOpenMobileMenuSheet: () => void;
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
  currentIndex,
  totalQuestions,
  isCurrentFlagged = false,
  onToggleFlag,
  onSelectTest,
  onExitMistakePractice,
  onSelectMode,
  onToggleShuffle,
  onOpenNameModal,
  onOpenHistoryModal,
  onToggleTheme,
  onOpenMobileTestSheet,
  onOpenMobileMenuSheet,
}) => {
  const formatTimer = (sec: number): string => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentSuite = testSuites.find((t) => t.id === selectedTestId);
  const currentTitle = isMistakePractice
    ? `Ôn ${mistakesCount} câu sai`
    : selectedTestId === 'all'
    ? 'Tất cả đề (338 câu)'
    : currentSuite?.shortTitle || 'Chọn đề';

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* ===================== MOBILE BAR (App Header) ===================== */}
        <div className="mobile-header-bar mobile-only">
          {/* Left: Test Selector Pill Button */}
          <button
            className="mobile-test-pill"
            onClick={onOpenMobileTestSheet}
            aria-label="Chọn đề thi"
          >
            <span className="brand-tag" style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem' }}>
              tinAB
            </span>
            <span className="mobile-test-title">{currentTitle}</span>
            <IconChevronDown size={14} />
          </button>

          {/* Right: Quick Timer (if exam) + Flag + Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: 'auto' }}>
            {mode === 'exam' && (
              <div className="timer-badge" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                <IconTimer size={13} />
                <span>{formatTimer(timerSeconds)}</span>
              </div>
            )}

            {onToggleFlag && (
              <button
                className={`btn-icon-square ${isCurrentFlagged ? 'active' : ''}`}
                style={{ width: '32px', height: '32px', color: isCurrentFlagged ? 'var(--accent-warning)' : undefined }}
                onClick={onToggleFlag}
                title="Đánh dấu câu"
                aria-label="Đánh dấu câu hỏi"
              >
                <IconStar size={16} filled={isCurrentFlagged} />
              </button>
            )}

            <button
              className="btn-icon-square"
              style={{ width: '32px', height: '32px' }}
              onClick={onOpenMobileMenuSheet}
              title="Mở menu tuỳ chọn"
              aria-label="Mở menu tuỳ chọn"
            >
              <IconMenu size={16} />
            </button>
          </div>
        </div>

        {/* ===================== DESKTOP WORKSTATION BAR ===================== */}
        <div className="desktop-header-group desktop-only">
          <div className="brand-mark">
            <span className="brand-tag">tinAB</span>
            <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.3px' }}>
              Trắc Nghiệm Tin Học
            </span>
          </div>

          {isMistakePractice ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="pill-badge pill-warning">
                Đang ôn {mistakesCount} câu sai
              </span>
              <button
                className="btn-pill"
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                onClick={onExitMistakePractice}
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
              <option value="all">Tất cả đề thi (338 câu)</option>
            </select>
          )}
        </div>

        {/* Desktop Mode Segmented Control */}
        <div className="segmented-control desktop-only">
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

        {/* Desktop Timer in Exam mode */}
        {mode === 'exam' && (
          <div className="timer-badge desktop-only">
            <IconTimer size={14} />
            <span>{formatTimer(timerSeconds)}</span>
          </div>
        )}

        {/* Desktop Actions */}
        <div className="header-actions desktop-only">
          <button
            className={`btn-icon-square ${isShuffled ? 'active' : ''}`}
            onClick={onToggleShuffle}
            title={isShuffled ? 'Đang bật xáo trộn' : 'Xáo trộn ngẫu nhiên'}
            aria-label="Xáo trộn câu hỏi"
          >
            <IconShuffle size={16} />
          </button>

          <button className="btn-pill" onClick={onOpenHistoryModal} title="Lịch sử làm bài">
            <IconHistory size={15} />
            <span>Lịch sử</span>
          </button>

          <button className="btn-pill" onClick={onOpenNameModal} title="Tên người học">
            <IconUser size={15} />
            <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userName || 'Nhập tên'}
            </span>
          </button>

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

      {/* Thin linear progress bar right below header on mobile */}
      <div className="mobile-header-progress mobile-only">
        <div
          className="mobile-progress-fill"
          style={{ width: `${totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0}%` }}
        ></div>
      </div>
    </header>
  );
};
