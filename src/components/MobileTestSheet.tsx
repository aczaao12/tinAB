import React from 'react';
import type { TestSuite } from '../data/types';
import { IconX, IconCheck, IconBookOpen } from './icons';

interface MobileTestSheetProps {
  isOpen: boolean;
  testSuites: TestSuite[];
  selectedTestId: string;
  onSelectTest: (id: string) => void;
  onClose: () => void;
}

export const MobileTestSheet: React.FC<MobileTestSheetProps> = ({
  isOpen,
  testSuites,
  selectedTestId,
  onSelectTest,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="bottom-sheet-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle"></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <IconBookOpen size={18} color="var(--accent-primary)" />
            <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
              Chọn bộ đề ôn tập
            </span>
          </div>
          <button className="btn-icon-square" onClick={onClose} aria-label="Đóng">
            <IconX size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
          {testSuites.map((suite) => {
            const isSelected = selectedTestId === suite.id;
            return (
              <button
                key={suite.id}
                className={`mobile-sheet-item ${isSelected ? 'is-selected' : ''}`}
                onClick={() => {
                  onSelectTest(suite.id);
                  onClose();
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', gap: '0.15rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    {suite.shortTitle}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {suite.totalQuestions} câu hỏi trắc nghiệm
                  </span>
                </div>
                {isSelected && (
                  <div style={{ color: 'var(--accent-primary)', marginLeft: 'auto' }}>
                    <IconCheck size={18} />
                  </div>
                )}
              </button>
            );
          })}

          {/* Option for All 338 questions */}
          <button
            className={`mobile-sheet-item ${selectedTestId === 'all' ? 'is-selected' : ''}`}
            onClick={() => {
              onSelectTest('all');
              onClose();
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', gap: '0.15rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                Tất cả các đề thi
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Tổng hợp trọn bộ 338 câu hỏi
              </span>
            </div>
            {selectedTestId === 'all' && (
              <div style={{ color: 'var(--accent-primary)', marginLeft: 'auto' }}>
                <IconCheck size={18} />
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
