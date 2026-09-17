import React, { useState, useEffect, useMemo } from 'react';
import { TEST_SUITES } from '../data/testsData';
import { getQuizSession } from '../utils/quizDb';
import {
  IconCheck,
  IconTarget,
  IconTimer,
  IconSun,
  IconMoon,
  IconArrowRight,
  IconBookOpen,
} from './icons';

export interface WelcomeScreenProps {
  onStart: (testId: string, mode: 'practice' | 'exam') => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStart,
  theme,
  onToggleTheme,
}) => {
  const [selectedTestId, setSelectedTestId] = useState<string>('test-1');
  const [mode, setMode] = useState<'practice' | 'exam'>('practice');

  // Theme state synced with HTML class and data-theme
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(() => {
    if (theme) return theme;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tinab_theme') as 'light' | 'dark' | null;
      if (saved) return saved;
      const attr = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' | null;
      if (attr) return attr;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (theme && theme !== currentTheme) {
      setCurrentTheme(theme);
    }
  }, [theme]);

  const handleToggleTheme = () => {
    const next = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      localStorage.setItem('tinab_theme', next);
    } catch {}
    if (onToggleTheme) {
      onToggleTheme();
    }
  };

  // Inspect saved test progress
  const sessionStatus = useMemo(() => {
    const statusMap: Record<string, { inProgress: boolean; answeredCount: number }> = {};
    TEST_SUITES.forEach((suite) => {
      const s = getQuizSession(suite.id);
      if (s && !s.isExamSubmitted) {
        const count = Object.keys(s.answers || {}).length;
        if (count > 0) {
          statusMap[suite.id] = { inProgress: true, answeredCount: count };
        }
      }
    });

    const allSession = getQuizSession('all');
    if (allSession && !allSession.isExamSubmitted) {
      const count = Object.keys(allSession.answers || {}).length;
      if (count > 0) {
        statusMap['all'] = { inProgress: true, answeredCount: count };
      }
    }
    return statusMap;
  }, []);

  const totalQuestionsAll = useMemo(() => {
    return TEST_SUITES.reduce((acc, s) => acc + s.totalQuestions, 0);
  }, []);

  const selectedSuite = useMemo(() => {
    if (selectedTestId === 'all') {
      return { shortTitle: 'Tất cả các đề', totalQuestions: totalQuestionsAll };
    }
    return TEST_SUITES.find((s) => s.id === selectedTestId) || TEST_SUITES[0];
  }, [selectedTestId, totalQuestionsAll]);

  const hasInProgress = sessionStatus[selectedTestId]?.inProgress;

  const handleStart = () => {
    onStart(selectedTestId, mode);
  };

  // PC Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        onStart(selectedTestId, mode);
      } else if (e.key >= '1' && e.key <= '6') {
        const idx = parseInt(e.key, 10) - 1;
        if (TEST_SUITES[idx]) {
          setSelectedTestId(TEST_SUITES[idx].id);
        }
      } else if (e.key === '0' || e.key.toLowerCase() === 'a') {
        setSelectedTestId('all');
      } else if (e.key.toLowerCase() === 'm') {
        setMode((prev) => (prev === 'practice' ? 'exam' : 'practice'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTestId, mode, onStart]);

  return (
    <div className="welcome-viewport">
      {/* ====================================================================
          1. PC WORKSTATION COCKPIT (Visible on Desktop >= 1024px)
          Aspect ratio X > Y: Centered, high-density, zero empty space
          ==================================================================== */}
      <div className="welcome-pc-layout">
        <div className="welcome-pc-card">
          {/* Top Bar */}
          <header className="welcome-pc-topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--text-on-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  letterSpacing: '0.5px',
                  flexShrink: 0,
                }}
              >
                AB
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
                tinAB
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.1rem 0.45rem',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--accent-primary-subtle)',
                  color: 'var(--accent-primary)',
                  border: '1px solid var(--accent-primary-border)',
                }}
              >
                Trắc Nghiệm Tin Học
              </span>
            </div>

            <button
              type="button"
              onClick={handleToggleTheme}
              className="welcome-theme-btn"
              title={`Chuyển sang chế độ ${currentTheme === 'dark' ? 'sáng' : 'tối'}`}
              aria-label="Chuyển chế độ giao diện sáng/tối"
            >
              {currentTheme === 'dark' ? (
                <>
                  <IconSun size={15} color="var(--accent-warning)" />
                  <span>Sáng</span>
                </>
              ) : (
                <>
                  <IconMoon size={15} color="var(--text-secondary)" />
                  <span>Tối</span>
                </>
              )}
            </button>
          </header>

          {/* 2-Column Balanced Cockpit */}
          <div className="welcome-pc-grid">
            {/* Left Column: Mode selection, Summary, Action */}
            <aside className="welcome-pc-sidebar">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <label className="welcome-section-label">
                  1. Chế độ làm bài
                </label>

                {/* Practice Mode */}
                <button
                  type="button"
                  onClick={() => setMode('practice')}
                  className={`welcome-mode-card ${mode === 'practice' ? 'is-active' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: mode === 'practice' ? 'var(--accent-primary)' : 'var(--bg-subtle)',
                        color: mode === 'practice' ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                        flexShrink: 0,
                      }}
                    >
                      <IconTarget size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.875rem', color: mode === 'practice' ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                        Luyện tập & Ôn thi
                      </div>
                      <span style={{ fontSize: '0.675rem', fontWeight: 700, color: 'var(--accent-success)' }}>
                        Xem đáp án ngay
                      </span>
                    </div>
                  </div>

                  {mode === 'practice' ? (
                    <span
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-primary)',
                        color: 'var(--text-on-accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <IconCheck size={11} color="var(--text-on-accent)" />
                    </span>
                  ) : (
                    <span
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: '1.5px solid var(--border-strong)',
                        flexShrink: 0,
                      }}
                    />
                  )}
                </button>

                {/* Exam Mode */}
                <button
                  type="button"
                  onClick={() => setMode('exam')}
                  className={`welcome-mode-card ${mode === 'exam' ? 'is-active' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: mode === 'exam' ? 'var(--accent-primary)' : 'var(--bg-subtle)',
                        color: mode === 'exam' ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                        flexShrink: 0,
                      }}
                    >
                      <IconTimer size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.875rem', color: mode === 'exam' ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                        Thi thử tính giờ
                      </div>
                      <span style={{ fontSize: '0.675rem', fontWeight: 700, color: 'var(--accent-warning)' }}>
                        Đếm ngược thời gian
                      </span>
                    </div>
                  </div>

                  {mode === 'exam' ? (
                    <span
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-primary)',
                        color: 'var(--text-on-accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <IconCheck size={11} color="var(--text-on-accent)" />
                    </span>
                  ) : (
                    <span
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: '1.5px solid var(--border-strong)',
                        flexShrink: 0,
                      }}
                    />
                  )}
                </button>
              </div>

              {/* Action & Summary Area */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {/* Summary Info */}
                <div
                  style={{
                    padding: '0.6rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    fontSize: '0.775rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Bộ đề:</span>
                    <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                      {selectedSuite.shortTitle} ({selectedSuite.totalQuestions} câu)
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Chế độ:</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {mode === 'practice' ? 'Ôn tập tự do' : 'Thi thử bấm giờ'}
                    </span>
                  </div>
                  {hasInProgress && (
                    <div style={{ marginTop: '0.15rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-warning-text)' }}>
                      ⚡ Có bài làm dở ({sessionStatus[selectedTestId].answeredCount} câu)
                    </div>
                  )}
                </div>

                {/* Start Button */}
                <button
                  type="button"
                  onClick={handleStart}
                  className="welcome-start-btn"
                  style={{ height: '42px' }}
                >
                  <span>{hasInProgress ? 'Tiếp tục làm bài' : 'Bắt đầu làm bài'}</span>
                  <IconArrowRight size={16} color="var(--text-on-accent)" />
                </button>

                {/* Shortcuts */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    fontSize: '0.675rem',
                    color: 'var(--text-tertiary)',
                  }}
                >
                  <span>[Enter] Bắt đầu</span>
                  <span>•</span>
                  <span>[1-6] Đổi đề</span>
                  <span>•</span>
                  <span>[M] Chế độ</span>
                </div>
              </div>
            </aside>

            {/* Right Column: Test Suites Grid */}
            <main className="welcome-pc-main">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label className="welcome-section-label">
                  2. Chọn bộ đề thi
                </label>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)' }}>
                  {TEST_SUITES.length} bộ đề • {totalQuestionsAll} câu
                </span>
              </div>

              {/* 3x2 Grid */}
              <div className="welcome-pc-test-grid">
                {TEST_SUITES.map((suite, idx) => {
                  const isSelected = selectedTestId === suite.id;
                  const status = sessionStatus[suite.id];
                  return (
                    <button
                      key={suite.id}
                      type="button"
                      onClick={() => setSelectedTestId(suite.id)}
                      className={`welcome-test-card ${isSelected ? 'is-active' : ''}`}
                    >
                      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                          {suite.shortTitle}
                        </span>

                        {isSelected ? (
                          <span
                            style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--accent-primary)',
                              color: 'var(--text-on-accent)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <IconCheck size={10} color="var(--text-on-accent)" />
                          </span>
                        ) : (
                          <span
                            style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              border: '1.5px solid var(--border-strong)',
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </div>

                      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.725rem', marginTop: '0.35rem' }}>
                        <span style={{ color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                          {suite.totalQuestions} câu
                        </span>
                        {status?.inProgress && (
                          <span
                            style={{
                              padding: '0.05rem 0.35rem',
                              borderRadius: '4px',
                              fontSize: '0.625rem',
                              fontWeight: 700,
                              backgroundColor: 'var(--accent-warning-subtle)',
                              color: 'var(--accent-warning-text)',
                            }}
                          >
                            Dở {status.answeredCount}c
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* All Tests Full-Width Card */}
              <div>
                <button
                  type="button"
                  onClick={() => setSelectedTestId('all')}
                  className={`welcome-test-card ${selectedTestId === 'all' ? 'is-active' : ''}`}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    minHeight: '52px',
                    padding: '0.65rem 0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: selectedTestId === 'all' ? 'var(--accent-primary)' : 'var(--bg-subtle)',
                        color: selectedTestId === 'all' ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                        flexShrink: 0,
                      }}
                    >
                      <IconBookOpen size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: selectedTestId === 'all' ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                        Tất cả các bộ đề
                      </div>
                      <div style={{ fontSize: '0.725rem', color: selectedTestId === 'all' ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                        Trọn bộ 338 câu hỏi tổng hợp
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto', flexShrink: 0 }}>
                    {sessionStatus['all']?.inProgress && (
                      <span
                        style={{
                          padding: '0.05rem 0.35rem',
                          borderRadius: '4px',
                          fontSize: '0.625rem',
                          fontWeight: 700,
                          backgroundColor: 'var(--accent-warning-subtle)',
                          color: 'var(--accent-warning-text)',
                        }}
                      >
                        Dở {sessionStatus['all'].answeredCount}c
                      </span>
                    )}
                    {selectedTestId === 'all' ? (
                      <span
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--accent-primary)',
                          color: 'var(--text-on-accent)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <IconCheck size={11} color="var(--text-on-accent)" />
                      </span>
                    ) : (
                      <span
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: '1.5px solid var(--border-strong)',
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </div>
                </button>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* ====================================================================
          2. MOBILE-FIRST APP LAYOUT (Visible on Mobile & Tablet < 1024px)
          Aspect ratio Y > X: Clean, compact, fits seamlessly in viewport
          ==================================================================== */}
      <div className="welcome-mobile-layout">
        {/* Mobile Sticky App Header */}
        <header className="welcome-mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--text-on-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.75rem',
                letterSpacing: '0.5px',
                flexShrink: 0,
              }}
            >
              AB
            </div>
            <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
              tinAB
            </span>
          </div>

          <button
            type="button"
            onClick={handleToggleTheme}
            className="welcome-theme-btn"
            title={`Chuyển sang chế độ ${currentTheme === 'dark' ? 'sáng' : 'tối'}`}
            aria-label="Chuyển chế độ giao diện sáng/tối"
          >
            {currentTheme === 'dark' ? (
              <>
                <IconSun size={14} color="var(--accent-warning)" />
                <span>Sáng</span>
              </>
            ) : (
              <>
                <IconMoon size={14} color="var(--text-secondary)" />
                <span>Tối</span>
              </>
            )}
          </button>
        </header>

        {/* Mobile Content Stream */}
        <div className="welcome-mobile-body">
          {/* Section 1: Mode Selection as a 2-segment compact control */}
          <div>
            <label className="welcome-section-label" style={{ marginBottom: '0.4rem' }}>
              Chế độ làm bài
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setMode('practice')}
                className={`welcome-mode-card ${mode === 'practice' ? 'is-active' : ''}`}
                style={{ padding: '0.55rem 0.65rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <IconTarget size={15} color={mode === 'practice' ? 'var(--accent-primary)' : 'var(--text-secondary)'} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.8rem', color: mode === 'practice' ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                      Luyện tập
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--accent-success)', fontWeight: 600 }}>
                      Xem đáp án
                    </div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('exam')}
                className={`welcome-mode-card ${mode === 'exam' ? 'is-active' : ''}`}
                style={{ padding: '0.55rem 0.65rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <IconTimer size={15} color={mode === 'exam' ? 'var(--accent-primary)' : 'var(--text-secondary)'} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.8rem', color: mode === 'exam' ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                      Thi thử
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--accent-warning)', fontWeight: 600 }}>
                      Tính giờ
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: Test Suites */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label className="welcome-section-label">
                Chọn bộ đề thi
              </label>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                {TEST_SUITES.length} đề • {totalQuestionsAll} câu
              </span>
            </div>

            {/* 2-Column Mobile Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {TEST_SUITES.map((suite) => {
                const isSelected = selectedTestId === suite.id;
                const status = sessionStatus[suite.id];
                return (
                  <button
                    key={suite.id}
                    type="button"
                    onClick={() => setSelectedTestId(suite.id)}
                    className={`welcome-test-card ${isSelected ? 'is-active' : ''}`}
                    style={{ padding: '0.55rem 0.75rem', minHeight: '54px' }}
                  >
                    <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.85rem', color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                        {suite.shortTitle}
                      </span>
                      {isSelected ? (
                        <span
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--accent-primary)',
                            color: 'var(--text-on-accent)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <IconCheck size={10} color="var(--text-on-accent)" />
                        </span>
                      ) : (
                        <span
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            border: '1.5px solid var(--border-strong)',
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </div>

                    <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.675rem', marginTop: '0.25rem' }}>
                      <span style={{ color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                        {suite.totalQuestions} câu
                      </span>
                      {status?.inProgress && (
                        <span
                          style={{
                            padding: '0.05rem 0.3rem',
                            borderRadius: '3px',
                            fontSize: '0.6rem',
                            fontWeight: 700,
                            backgroundColor: 'var(--accent-warning-subtle)',
                            color: 'var(--accent-warning-text)',
                          }}
                        >
                          Dở {status.answeredCount}c
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* All Tests Mobile Card */}
            <div style={{ marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setSelectedTestId('all')}
                className={`welcome-test-card ${selectedTestId === 'all' ? 'is-active' : ''}`}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  minHeight: '48px',
                  padding: '0.55rem 0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <IconBookOpen size={16} color={selectedTestId === 'all' ? 'var(--accent-primary)' : 'var(--text-secondary)'} />
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.825rem', color: selectedTestId === 'all' ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                      Tất cả các bộ đề
                    </span>
                    <span style={{ fontSize: '0.675rem', color: 'var(--text-tertiary)', marginLeft: '0.4rem' }}>
                      (338 câu)
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: 'auto', flexShrink: 0 }}>
                  {sessionStatus['all']?.inProgress && (
                    <span
                      style={{
                        padding: '0.05rem 0.3rem',
                        borderRadius: '3px',
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        backgroundColor: 'var(--accent-warning-subtle)',
                        color: 'var(--accent-warning-text)',
                      }}
                    >
                      Dở {sessionStatus['all'].answeredCount}c
                    </span>
                  )}
                  {selectedTestId === 'all' ? (
                    <span
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-primary)',
                        color: 'var(--text-on-accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <IconCheck size={10} color="var(--text-on-accent)" />
                    </span>
                  ) : (
                    <span
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        border: '1.5px solid var(--border-strong)',
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Thumb-Zone Bottom Action Bar */}
        <div className="welcome-mobile-bottom-bar">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
              <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{selectedSuite.shortTitle}</span>
              <span>•</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{mode === 'practice' ? 'Luyện tập' : 'Thi thử'}</span>
            </div>
            {hasInProgress ? (
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent-warning-text)' }}>
                Có bài dở ({sessionStatus[selectedTestId].answeredCount} câu)
              </span>
            ) : (
              <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                {selectedSuite.totalQuestions} câu hỏi
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleStart}
            className="welcome-start-btn"
            style={{ width: 'auto', padding: '0.55rem 1.15rem', fontSize: '0.85rem' }}
          >
            <span>{hasInProgress ? 'Tiếp tục' : 'Bắt đầu'}</span>
            <IconArrowRight size={15} color="var(--text-on-accent)" />
          </button>
        </div>
      </div>
    </div>
  );
};