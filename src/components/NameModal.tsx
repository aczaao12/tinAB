import React, { useState, useEffect } from 'react';

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
        style={{ maxWidth: '440px' }}
      >
        <div className="modal-header">
          <h2 className="modal-title">👋 Chào bạn!</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Nhập tên của bạn để ghi nhận kết quả và lưu lại lịch sử làm bài trên thiết bị này:
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="text"
            className="text-input"
            placeholder="Ví dụ: Nguyễn Văn A"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            autoFocus
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Bỏ qua
            </button>
            <button type="submit" className="btn btn-primary">
              Lưu tên & Bắt đầu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
