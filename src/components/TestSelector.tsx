import React from 'react';
import type { TestSuite } from '../data/types';
import { IconX, IconCheck } from './icons';

interface TestSelectorProps {
  isOpen: boolean;
  testSuites: TestSuite[];
  selectedTestId: string;
  onSelectTest: (id: string) => void;
  onClose: () => void;
}

export const TestSelector: React.FC<TestSelectorProps> = ({
  isOpen,
  testSuites,
  selectedTestId,
  onSelectTest,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Chọn bộ đề thi"
    >
      <div
        className="bg-slate-900 rounded-t-2xl w-full max-w-lg p-5 pb-8 flex flex-col gap-4 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blue-400">📚</span>
            <h2 className="text-lg font-bold text-white">Chọn bộ đề ôn tập</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/20 transition-colors"
            aria-label="Đóng"
          >
            <IconX size={16} />
          </button>
        </div>

        <p className="text-slate-400 text-sm">
          Chọn đề thi để bắt đầu ôn luyện hoặc thi thử
        </p>

        <div className="flex flex-col gap-2">
          {testSuites.map((suite) => {
            const isSelected = selectedTestId === suite.id;
            return (
              <button
                key={suite.id}
                onClick={() => {
                  onSelectTest(suite.id);
                  onClose();
                }}
                className={`
                  flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200
                  ${isSelected
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                  }
                `}
              >
                <div>
                  <div className="font-bold text-sm">{suite.shortTitle}</div>
                  <div className={`text-xs mt-0.5 ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                    {suite.totalQuestions} câu hỏi trắc nghiệm
                  </div>
                </div>
                {isSelected && (
                  <div className="text-blue-300">
                    <IconCheck size={18} />
                  </div>
                )}
              </button>
            );
          })}

          <button
            onClick={() => {
              onSelectTest('all');
              onClose();
            }}
            className={`
              flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200
              ${selectedTestId === 'all'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
              }
            `}
          >
            <div>
              <div className="font-bold text-sm">Tất cả các đề thi</div>
              <div className={`text-xs mt-0.5 ${selectedTestId === 'all' ? 'text-blue-200' : 'text-slate-500'}`}>
                Tổng hợp trọn bộ 338 câu hỏi
              </div>
            </div>
            {selectedTestId === 'all' && (
              <div className="text-blue-300">
                <IconCheck size={18} />
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};