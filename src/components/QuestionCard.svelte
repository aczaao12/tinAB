<script lang="ts">
  import type { Question, UserAnswer } from '../data/types';

  let {
    question,
    currentIndex = 0,
    totalQuestions = 0,
    userAnswer,
    mode = 'practice',
    isExamSubmitted = false,
    onSelectOption = (optId: string) => {},
    onToggleFlag = () => {},
    onPrev = () => {},
    onNext = () => {},
    onSubmitExam = () => {},
    canPrev = false,
    canNext = false,
  } = $props<{
    question: Question;
    currentIndex: number;
    totalQuestions: number;
    userAnswer?: UserAnswer;
    mode: 'practice' | 'exam';
    isExamSubmitted: boolean;
    onSelectOption: (optId: string) => void;
    onToggleFlag: () => void;
    onPrev: () => void;
    onNext: () => void;
    onSubmitExam: () => void;
    canPrev: boolean;
    canNext: boolean;
  }>();

  let selectedOptionIds = $derived(userAnswer?.selectedOptionIds || []);
  let isFlagged = $derived(userAnswer?.marked || false);

  // Show feedback if:
  // - In practice mode AND an answer is chosen
  // - Or in exam mode AND exam is submitted
  let showFeedback = $derived(
    (mode === 'practice' && selectedOptionIds.length > 0) ||
    (mode === 'exam' && isExamSubmitted)
  );

  function getOptionClass(optId: string, isCorrect: boolean): string {
    const isSelected = selectedOptionIds.includes(optId);

    if (!showFeedback) {
      return isSelected ? 'selected' : '';
    }

    if (isCorrect) {
      return 'is-correct';
    }

    if (isSelected && !isCorrect) {
      return 'is-wrong';
    }

    return '';
  }
</script>

<div class="quiz-card">
  <!-- Meta bar -->
  <div class="quiz-meta-bar">
    <div class="meta-badges">
      <span class="badge badge-primary">
        Câu {currentIndex + 1} / {totalQuestions}
      </span>
      <span class="badge {question.type === 'multiple' ? 'badge-warning' : 'badge-info'}">
        {question.type === 'multiple' ? '☑️ Chọn nhiều đáp án' : '🔘 Chọn 1 đáp án'}
      </span>
      {#if showFeedback}
        {@const isRight = userAnswer?.isCorrect}
        <span class="badge {isRight ? 'badge-primary' : 'badge-warning'}" style="background: {isRight ? 'var(--success-bg)' : 'var(--danger-bg)'}; color: {isRight ? 'var(--success-text)' : 'var(--danger-text)'}; border-color: {isRight ? 'var(--success-border)' : 'var(--danger-border)'};">
          {isRight ? '✓ Trả lời đúng' : '✗ Trả lời sai'}
        </span>
      {/if}
    </div>

    <!-- Flag bookmark button -->
    <button
      class="btn btn-secondary"
      style="padding: 0.35rem 0.65rem; font-size: 0.85rem; color: {isFlagged ? 'var(--warning)' : 'var(--text-muted)'}; border-color: {isFlagged ? 'var(--warning-border)' : 'var(--card-border)'};"
      onclick={onToggleFlag}
      title="Đánh dấu câu này để xem lại"
    >
      {isFlagged ? '★ Đã đánh dấu' : '☆ Đánh dấu'}
    </button>
  </div>

  <!-- Prompt -->
  <div class="question-prompt">
    {question.prompt}
  </div>

  <!-- Options List -->
  <div class="options-list">
    {#each question.options as option (option.id)}
      {@const isSelected = selectedOptionIds.includes(option.id)}
      {@const optClass = getOptionClass(option.id, option.isCorrect)}
      
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div
        class="option-item {optClass}"
        role="button"
        tabindex="0"
        onclick={() => onSelectOption(option.id)}
      >
        <span class="option-letter">{option.id}</span>
        <span class="option-text">{option.text}</span>

        {#if showFeedback}
          {#if option.isCorrect}
            <span class="option-badge" style="background: var(--success-bg); color: var(--success-text);">
              ✓ Đáp án đúng
            </span>
          {:else if isSelected}
            <span class="option-badge" style="background: var(--danger-bg); color: var(--danger-text);">
              ✗ Bạn chọn
            </span>
          {/if}
        {/if}
      </div>
    {/each}
  </div>

  <!-- Feedback / Explanation -->
  {#if showFeedback}
    <div class="explanation-box">
      <div class="explanation-title">
        <span>💡 Đáp án chuẩn xác:</span>
      </div>
      <div class="explanation-text">
        <strong>{question.correctAnswerText}</strong>
      </div>
    </div>
  {/if}

  <!-- Controls -->
  <div class="quiz-controls">
    <div style="display: flex; gap: 0.5rem;">
      <button class="btn btn-secondary" onclick={onPrev} disabled={!canPrev}>
        ⬅️ Câu trước
      </button>
      <button class="btn btn-secondary" onclick={onNext} disabled={!canNext}>
        Câu tiếp ➡️
      </button>
    </div>

    <div>
      {#if mode === 'exam' && !isExamSubmitted}
        <button class="btn btn-success" onclick={onSubmitExam}>
          📝 Nộp bài thi
        </button>
      {:else if canNext}
        <button class="btn btn-primary" onclick={onNext}>
          Tiếp theo ➔
        </button>
      {/if}
    </div>
  </div>
</div>
