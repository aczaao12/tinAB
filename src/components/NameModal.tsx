import React, { useState, useEffect } from 'react';
import { IconX, IconUser } from './icons';

interface NameModalProps {
  isOpen: boolean;
  initialName: string;
  onSave: (name: string) => void;
  onClose: () => void;
}

export const NameModal: React.FC<NameModalProps> = ({
  isOpen,
  initialName,
  onSave,
  onClose,
}) => {
  const [nameInput, setNameInput] = useState(initialName);

  useEffect(() => {
    if (isOpen) {
      setNameInput(initialName);
    }
  }, [isOpen, initialName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onSave(nameInput.trim());
    } else {
      onClose();
    }
  };

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
        style={{ maxWidth: '420px' }}
      >
        <div className="modal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <IconUser size={20} color="var(--accent-primary)" />
            <h2 className="modal-heading">Tên người học</h2>
          </div>
          <button className="btn-icon-square" onClick={onClose} aria-label="Đóng">
            <IconX size={16} />
          </button>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Nhập tên của bạn để ghi nhận kết quả và lưu lại lịch sử làm bài trên trình duyệt này:
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="text"
            className="text-field"
            placeholder="Ví dụ: Nguyễn Văn A"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            autoFocus
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="button" className="btn-action btn-secondary" onClick={onClose}>
              Bỏ qua
            </button>
            <button type="submit" className="btn-action btn-primary">
              Lưu tên
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
