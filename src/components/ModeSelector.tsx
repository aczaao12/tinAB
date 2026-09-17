import React from 'react';

interface ModeSelectorProps {
  mode: 'practice' | 'exam';
  onSelectMode: (mode: 'practice' | 'exam') => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, onSelectMode }) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={() => onSelectMode('practice')}
        className={`
          rounded-lg px-3 py-3 text-center transition-all duration-200
          ${mode === 'practice'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'bg-white/[0.03] border border-white/5 text-slate-400 hover:bg-white/[0.06] hover:text-slate-300'
          }
        `}
      >
        <div className="text-lg mb-1">🎯</div>
        <div className="text-xs font-semibold">Ôn tập</div>
        <div className={`text-[11px] mt-0.5 ${mode === 'practice' ? 'text-slate-500' : 'text-slate-600'}`}>
          Xem đáp án ngay
        </div>
      </button>
      <button
        onClick={() => onSelectMode('exam')}
        className={`
          rounded-lg px-3 py-3 text-center transition-all duration-200
          ${mode === 'exam'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'bg-white/[0.03] border border-white/5 text-slate-400 hover:bg-white/[0.06] hover:text-slate-300'
          }
        `}
      >
        <div className="text-lg mb-1">⏱️</div>
        <div className="text-xs font-semibold">Thi thử</div>
        <div className={`text-[11px] mt-0.5 ${mode === 'exam' ? 'text-slate-500' : 'text-slate-600'}`}>
          Tính điểm & thời gian
        </div>
      </button>
    </div>
  );
};