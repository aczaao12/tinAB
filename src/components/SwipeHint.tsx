import React, { useState, useEffect } from 'react';
import { IconSwipeGesture, IconX } from './icons';

interface SwipeHintProps {
  onDismiss?: () => void;
}

export const SwipeHint: React.FC<SwipeHintProps> = ({ onDismiss }) => {
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    // Only show on mobile screens
    const isMobile = window.innerWidth <= 1023;
    const hasSeen = localStorage.getItem('tinab_seen_swipe_hint');

    if (isMobile && !hasSeen) {
      // Small delay after loading question
      const timer = setTimeout(() => {
        setVisible(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem('tinab_seen_swipe_hint', 'true');
    if (onDismiss) onDismiss();
  };

  if (!visible) return null;

  return (
    <div
      className="mobile-only fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm pointer-events-auto transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
      role="tooltip"
      aria-label="Hướng dẫn vuốt chuyển câu hỏi"
    >
      <div className="relative flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 dark:bg-slate-800/95 text-white shadow-2xl border border-sky-500/30 backdrop-blur-md">
        {/* Animated Swipe Icon with left-right wave */}
        <div className="relative flex items-center justify-center shrink-0 w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30">
          <div className="animate-swipe-lr flex items-center justify-center">
            <IconSwipeGesture size={22} />
          </div>
        </div>

        {/* Instruction copy */}
        <div className="flex-1 text-left">
          <div className="text-xs font-semibold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>Mẹo Mobile</span>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
          </div>
          <p className="text-xs font-medium text-slate-100 mt-0.5 leading-snug">
            Vuốt <strong>trái / phải</strong> bất kỳ đâu trên câu hỏi để chuyển câu nhanh!
          </p>
        </div>

        {/* Got it action button */}
        <button
          onClick={handleClose}
          className="shrink-0 px-2.5 py-1 text-xs font-bold text-sky-200 hover:text-white bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 rounded-lg transition-colors cursor-pointer"
          aria-label="Đã hiểu"
        >
          Đã hiểu
        </button>

        {/* Dismiss 'x' */}
        <button
          onClick={handleClose}
          className="shrink-0 text-slate-400 hover:text-white p-1 -mr-1"
          aria-label="Đóng gợi ý"
        >
          <IconX size={14} />
        </button>
      </div>
    </div>
  );
};
