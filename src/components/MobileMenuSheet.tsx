import React from 'react';
import {
  IconX,
  IconTarget,
  IconTimer,
  IconShuffle,
  IconHistory,
  IconUser,
  IconSun,
  IconMoon,
  IconSliders,
} from './icons';

interface MobileMenuSheetProps {
  isOpen: boolean;
  mode: 'practice' | 'exam';
  isShuffled: boolean;
  theme: string;
  userName: string;
  onSelectMode: (mode: 'practice' | 'exam') => void;
  onToggleShuffle: () => void;
  onOpenHistoryModal: () => void;
  onOpenNameModal: () => void;
  onToggleTheme: () => void;
  onClose: () => void;
}

export const MobileMenuSheet: React.FC<MobileMenuSheetProps> = ({
  isOpen,
  mode,
  isShuffled,
  theme,
  userName,
  onSelectMode,
  onToggleShuffle,
  onOpenHistoryModal,
  onOpenNameModal,
  onToggleTheme,
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
            <IconSliders size={18} color="var(--accent-primary)" />
            <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
              Tùy chọn ôn tập
            </span>
          </div>
          <button className="btn-icon-square" onClick={onClose} aria-label="Đóng">
            <IconX size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
          {/* Mode Switcher */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              Chế độ làm bài
            </div>
            <div className="segmented-control" style={{ width: '100%' }}>
              <button
                className={`segmented-btn ${mode === 'practice' ? 'active' : ''}`}
                style={{ flex: 1, justifyContent: 'center', padding: '0.55rem' }}
                onClick={() => {
                  onSelectMode('practice');
                  onClose();
                }}
              >
                <IconTarget size={16} />
                <span>Ôn tập</span>
              </button>
              <button
                className={`segmented-btn ${mode === 'exam' ? 'active' : ''}`}
                style={{ flex: 1, justifyContent: 'center', padding: '0.55rem' }}
                onClick={() => {
                  onSelectMode('exam');
                  onClose();
                }}
              >
                <IconTimer size={16} />
                <span>Thi thử</span>
              </button>
            </div>
          </div>

          {/* User Name item */}
          <button
            className="mobile-sheet-item"
            onClick={() => {
              onClose();
              onOpenNameModal();
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <IconUser size={18} color="var(--accent-primary)" />
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  Người học
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {userName || 'Chưa nhập tên (Ẩn danh)'}
                </span>
              </div>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600, marginLeft: 'auto' }}>
              Đổi tên
            </span>
          </button>

          {/* Shuffle questions */}
          <button
            className="mobile-sheet-item"
            onClick={() => {
              onToggleShuffle();
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <IconShuffle size={18} color={isShuffled ? 'var(--accent-primary)' : 'var(--text-secondary)'} />
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                Xáo trộn thứ tự câu hỏi
              </span>
            </div>
            <span
              className={`pill-badge ${isShuffled ? 'pill-primary' : 'pill-default'}`}
              style={{ marginLeft: 'auto' }}
            >
              {isShuffled ? 'Đang Bật' : 'Tắt'}
            </span>
          </button>

          {/* History */}
          <button
            className="mobile-sheet-item"
            onClick={() => {
              onClose();
              onOpenHistoryModal();
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <IconHistory size={18} color="var(--accent-primary)" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                Xem lịch sử làm bài
              </span>
            </div>
          </button>

          {/* Theme Switcher */}
          <button
            className="mobile-sheet-item"
            onClick={() => {
              onToggleTheme();
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {theme === 'dark' ? <IconSun size={18} color="var(--accent-warning)" /> : <IconMoon size={18} color="var(--accent-primary)" />}
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                Giao diện hiển thị
              </span>
            </div>
            <span className="pill-badge pill-default" style={{ marginLeft: 'auto' }}>
              {theme === 'dark' ? 'Chế độ Tối' : 'Chế độ Sáng'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
