import { useState, useEffect, useCallback } from 'react';
import { getUserName, setUserName } from '../utils/quizDb';
import { logStartQuiz } from '../utils/telegram';
import { TEST_SUITES } from '../data/testsData';
import type { TestSuite } from '../data/types';

export function useSession() {
  const [userName, setUserNameState] = useState<string>('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isNameModalOpen, setIsNameModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const storedName = getUserName();
    if (storedName) {
      setUserNameState(storedName);
    } else {
      setIsNameModalOpen(true);
    }

    const prefersDark =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('tinab_theme') as 'light' | 'dark' | null;
    const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.documentElement.classList.toggle('dark', currentTheme === 'dark');
  }, []);

  const handleSaveName = useCallback(
    (name: string, testId: string, m: 'practice' | 'exam', totalQuestions: number) => {
      setUserNameState(name);
      setUserName(name);
      setIsNameModalOpen(false);

      const suite = TEST_SUITES.find((t) => t.id === testId);
      const testTitle = testId === 'all' ? 'Tất cả đề thi' : suite?.shortTitle || testId;

      logStartQuiz({
        userName: name,
        testTitle,
        mode: m,
        totalQuestions,
      });
    },
    []
  );

  const handleToggleTheme = useCallback(() => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    localStorage.setItem('tinab_theme', nextTheme);
  }, [theme]);

  const openHistoryModal = useCallback(() => setIsHistoryModalOpen(true));
  const closeHistoryModal = useCallback(() => setIsHistoryModalOpen(false));
  const openNameModal = useCallback(() => setIsNameModalOpen(true));

  return {
    userName,
    theme,
    isNameModalOpen,
    isHistoryModalOpen,
    isResultModalOpen,
    handleSaveName,
    handleToggleTheme,
    openHistoryModal,
    closeHistoryModal,
    openNameModal,
    setIsResultModalOpen,
  };
}