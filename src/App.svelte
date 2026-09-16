<script lang="ts">
  import { onMount } from 'svelte';
  import { TEST_SUITES } from './data/testsData';
  import type { Question, UserAnswer, AttemptRecord, TestSuite } from './data/types';
  import { getUserName, setUserName, getAttempts, saveAttempt } from './utils/storage';

  import Navbar from './components/Navbar.svelte';
  import QuestionCard from './components/QuestionCard.svelte';
  import QuestionGrid from './components/QuestionGrid.svelte';
  import NameModal from './components/NameModal.svelte';
  import HistoryModal from './components/HistoryModal.svelte';
  import ExamResultModal from './components/ExamResultModal.svelte';

  // --- States ---
  let selectedTestId = $state('test-1');
  let mode = $state<'practice' | 'exam'>('practice');
  let userName = $state('');
  let theme = $state<'light' | 'dark'>('light');
  let isShuffled = $state(false);

  let currentIndex = $state(0);
  let answers = $state<Record<string, UserAnswer>>({});
  let isExamSubmitted = $state(false);
  let examScore = $state(0);

  // Timer
  let timerSeconds = $state(0);
  let timerInterval: any = null;

  // Modals
  let isNameModalOpen = $state(false);
  let isHistoryModalOpen = $state(false);
  let isResultModalOpen = $state(false);
  let attempts = $state<AttemptRecord[]>([]);

  // Current Questions List
  let rawQuestions = $state<Question[]>([]);
  let activeQuestions = $state<Question[]>([]);

  // Load active test questions
  function loadTestQuestions(testId: string) {
    let qs: Question[] = [];
    if (testId === 'all') {
      qs = TEST_SUITES.flatMap(t => t.questions);
    } else {
      const suite = TEST_SUITES.find(t => t.id === testId);
      qs = suite ? suite.questions : (TEST_SUITES[0]?.questions || []);
    }
    rawQuestions = qs;
    resetQuizState(qs, isShuffled);
  }

  function resetQuizState(qs: Question[], shuffle: boolean) {
    if (shuffle) {
      activeQuestions = [...qs].sort(() => Math.random() - 0.5);
    } else {
      activeQuestions = [...qs];
    }
    currentIndex = 0;
    answers = {};
    isExamSubmitted = false;
    examScore = 0;
    timerSeconds = 0;
    resetTimer();
  }

  function resetTimer() {
    if (timerInterval) clearInterval(timerInterval);
    if (mode === 'exam' && !isExamSubmitted) {
      timerInterval = setInterval(() => {
        timerSeconds += 1;
      }, 1000);
    }
  }

  onMount(() => {
    // Load user name
    const storedName = getUserName();
    if (storedName) {
      userName = storedName;
    } else {
      isNameModalOpen = true;
    }

    // Load attempts
    attempts = getAttempts();

    // Check system color scheme preference
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('tinab_theme') as 'light' | 'dark' | null;
    theme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);

    // Initial test load
    loadTestQuestions(selectedTestId);

    // Keyboard navigation listener
    const handleKeydown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const num = parseInt(e.key) - 1;
        const currentQ = activeQuestions[currentIndex];
        if (currentQ && currentQ.options[num]) {
          handleSelectOption(currentQ.options[num].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
      if (timerInterval) clearInterval(timerInterval);
    };
  });

  // Handle switching test
  function handleSelectTest(testId: string) {
    selectedTestId = testId;
    loadTestQuestions(testId);
  }

  // Handle switching mode
  function handleSelectMode(newMode: 'practice' | 'exam') {
    if (newMode === mode) return;
    if (mode === 'exam' && !isExamSubmitted && Object.keys(answers).length > 0) {
      if (!confirm('Chuyển chế độ sẽ bắt đầu lại bài làm. Bạn có muốn tiếp tục?')) {
        return;
      }
    }
    mode = newMode;
    loadTestQuestions(selectedTestId);
  }

  // Toggle shuffle
  function handleToggleShuffle() {
    isShuffled = !isShuffled;
    resetQuizState(rawQuestions, isShuffled);
  }

  // Toggle theme
  function handleToggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tinab_theme', theme);
  }

  // Current Question
  let currentQuestion = $derived(activeQuestions[currentIndex]);

  // Handle option selection
  function handleSelectOption(optId: string) {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;
    const existing = answers[qId] || {
      selectedOptionIds: [],
      isSubmitted: false,
      marked: false,
    };

    let newSelected: string[];

    if (currentQuestion.type === 'multiple') {
      // Toggle
      if (existing.selectedOptionIds.includes(optId)) {
        newSelected = existing.selectedOptionIds.filter(id => id !== optId);
      } else {
        newSelected = [...existing.selectedOptionIds, optId];
      }
    } else {
      // Single choice
      newSelected = [optId];
    }

    // Check correctness
    const correctIds = currentQuestion.options.filter(o => o.isCorrect).map(o => o.id).sort();
    const chosenSorted = [...newSelected].sort();
    const isCorrect = (
      correctIds.length === chosenSorted.length &&
      correctIds.every((val, idx) => val === chosenSorted[idx])
    );

    answers = {
      ...answers,
      [qId]: {
        ...existing,
        selectedOptionIds: newSelected,
        isCorrect,
        isSubmitted: mode === 'practice',
      }
    };
  }

  // Toggle Flag
  function handleToggleFlag() {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;
    const existing = answers[qId] || {
      selectedOptionIds: [],
      isSubmitted: false,
      marked: false,
    };
    answers = {
      ...answers,
      [qId]: {
        ...existing,
        marked: !existing.marked,
      }
    };
  }

  // Navigation
  function handleNext() {
    if (currentIndex < activeQuestions.length - 1) {
      currentIndex += 1;
    }
  }

  function handlePrev() {
    if (currentIndex > 0) {
      currentIndex -= 1;
    }
  }

  function handleSelectIndex(idx: number) {
    if (idx >= 0 && idx < activeQuestions.length) {
      currentIndex = idx;
    }
  }

  // Submit Exam
  function handleSubmitExam() {
    if (isExamSubmitted) return;

    const answeredCount = activeQuestions.filter(q => (answers[q.id]?.selectedOptionIds || []).length > 0).length;
    const totalCount = activeQuestions.length;

    if (answeredCount < totalCount) {
      const confirmSubmit = confirm(`Bạn mới trả lời ${answeredCount}/${totalCount} câu hỏi. Bạn có chắc chắn muốn nộp bài ngay không?`);
      if (!confirmSubmit) return;
    }

    // Stop timer
    if (timerInterval) clearInterval(timerInterval);

    // Calculate score
    let correctTotal = 0;
    const answersRecord: Record<string, string[]> = {};

    activeQuestions.forEach(q => {
      const a = answers[q.id];
      const selected = a ? a.selectedOptionIds : [];
      answersRecord[q.id] = selected;

      const correctIds = q.options.filter(o => o.isCorrect).map(o => o.id).sort();
      const chosenSorted = [...selected].sort();
      const isRight = (
        correctIds.length === chosenSorted.length &&
        correctIds.every((val, idx) => val === chosenSorted[idx])
      );

      if (isRight) {
        correctTotal += 1;
      }

      answers[q.id] = {
        selectedOptionIds: selected,
        isSubmitted: true,
        isCorrect: isRight,
        marked: a?.marked || false,
      };
    });

    examScore = correctTotal;
    isExamSubmitted = true;

    // Save record to LocalStorage
    const suite = TEST_SUITES.find(t => t.id === selectedTestId);
    const testTitle = selectedTestId === 'all' ? 'Tất cả đề thi' : (suite?.shortTitle || selectedTestId);

    const record: AttemptRecord = {
      id: 'att_' + Date.now(),
      timestamp: Date.now(),
      userName: userName || 'Ẩn danh',
      testId: selectedTestId,
      testTitle: testTitle,
      mode: 'exam',
      score: correctTotal,
      totalQuestions: totalCount,
      percentage: Math.round((correctTotal / totalCount) * 100),
      timeSpentSeconds: timerSeconds,
      answers: answersRecord,
    };

    saveAttempt(record);
    attempts = getAttempts();
    isResultModalOpen = true;
  }

  // Retry full test
  function handleRetry() {
    isResultModalOpen = false;
    loadTestQuestions(selectedTestId);
  }

  // Retry only mistakes
  function handleRetryMistakes() {
    isResultModalOpen = false;
    const mistakes = activeQuestions.filter(q => answers[q.id]?.isCorrect === false);
    if (mistakes.length === 0) return;
    mode = 'practice';
    activeQuestions = mistakes;
    currentIndex = 0;
    answers = {};
    isExamSubmitted = false;
  }

  function handleSaveName(name: string) {
    userName = name;
    setUserName(name);
    isNameModalOpen = false;
  }

  function handleRefreshAttempts() {
    attempts = getAttempts();
  }
</script>

<div class="app-layout">
  <!-- Navbar -->
  <Navbar
    testSuites={TEST_SUITES}
    {selectedTestId}
    {mode}
    {userName}
    {isShuffled}
    {theme}
    {timerSeconds}
    onSelectTest={handleSelectTest}
    onSelectMode={handleSelectMode}
    onToggleShuffle={handleToggleShuffle}
    onOpenNameModal={() => isNameModalOpen = true}
    onOpenHistoryModal={() => isHistoryModalOpen = true}
    onToggleTheme={handleToggleTheme}
  />

  <!-- Main Quiz Area -->
  <main class="main-content">
    {#if currentQuestion}
      <QuestionCard
        question={currentQuestion}
        {currentIndex}
        totalQuestions={activeQuestions.length}
        userAnswer={answers[currentQuestion.id]}
        {mode}
        {isExamSubmitted}
        onSelectOption={handleSelectOption}
        onToggleFlag={handleToggleFlag}
        onPrev={handlePrev}
        onNext={handleNext}
        onSubmitExam={handleSubmitExam}
        canPrev={currentIndex > 0}
        canNext={currentIndex < activeQuestions.length - 1}
      />
    {:else}
      <div class="quiz-card" style="text-align: center; padding: 3rem;">
        <p>Không tìm thấy câu hỏi nào.</p>
      </div>
    {/if}

    <!-- Sidebar Grid -->
    <QuestionGrid
      questions={activeQuestions}
      {currentIndex}
      {answers}
      {mode}
      {isExamSubmitted}
      onSelectIndex={handleSelectIndex}
    />
  </main>
</div>

<!-- Modals -->
<NameModal
  isOpen={isNameModalOpen}
  initialName={userName}
  onSave={handleSaveName}
  onClose={() => isNameModalOpen = false}
/>

<HistoryModal
  isOpen={isHistoryModalOpen}
  {attempts}
  onClose={() => isHistoryModalOpen = false}
  onRefresh={handleRefreshAttempts}
  onRetakeMistakes={() => {}}
/>

<ExamResultModal
  isOpen={isResultModalOpen}
  score={examScore}
  totalQuestions={activeQuestions.length}
  timeSpentSeconds={timerSeconds}
  {userName}
  hasMistakes={examScore < activeQuestions.length}
  onReview={() => isResultModalOpen = false}
  onRetry={handleRetry}
  onRetryMistakes={handleRetryMistakes}
  onClose={() => isResultModalOpen = false}
/>
