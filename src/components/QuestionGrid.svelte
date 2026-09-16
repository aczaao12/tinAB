<script lang="ts">
  import type { Question, UserAnswer } from '../data/types';

  let {
    questions = [],
    currentIndex = 0,
    answers = {},
    mode = 'practice',
    isExamSubmitted = false,
    onSelectIndex = (index: number) => {},
  } = $props<{
    questions: Question[];
    currentIndex: number;
    answers: Record<string, UserAnswer>;
    mode: 'practice' | 'exam';
    isExamSubmitted: boolean;
  }>();

  let answeredCount = $derived(
    questions.filter(q => (answers[q.id]?.selectedOptionIds || []).length > 0).length
  );

  let correctCount = $derived(
    questions.filter(q => answers[q.id]?.isCorrect === true).length
  );

  let wrongCount = $derived(
    questions.filter(q => {
      const a = answers[q.id];
      return a && (a.selectedOptionIds.length > 0) && a.isCorrect === false;
    }).length
  );

  let progressPct = $derived(
    questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0
  );

  function getCellStatus(q: Question, idx: number): string {
    const a = answers[q.id];
    let classes = '';

    if (idx === currentIndex) {
      classes += ' active';
    }

    if (!a || a.selectedOptionIds.length === 0) {
      return classes;
    }

    if (a.marked) {
      classes += ' marked';
    }

    if (mode === 'practice' || isExamSubmitted) {
      if (a.isCorrect) {
        classes += ' correct';
      } else {
        classes += ' wrong';
      }
    } else {
      // In unsubmitted exam mode
      classes += ' answered';
    }

    return classes;
  }
</script>

<div class="navigator-card">
  <div class="nav-grid-header">
    <span>📌 Danh sách câu hỏi</span>
    <span style="font-size: 0.85rem; color: var(--text-muted);">
      {answeredCount}/{questions.length} ({progressPct}%)
    </span>
  </div>

  <!-- Progress Bar -->
  <div class="progress-container">
    <div class="progress-fill" style="width: {progressPct}%;"></div>
  </div>

  {#if mode === 'practice' || isExamSubmitted}
    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700;">
      <span style="color: var(--success-text);">✓ Đúng: {correctCount}</span>
      <span style="color: var(--danger-text);">✗ Sai: {wrongCount}</span>
      <span style="color: var(--text-muted);">Chưa: {questions.length - answeredCount}</span>
    </div>
  {/if}

  <!-- Grid of Question Numbers -->
  <div class="nav-grid">
    {#each questions as q, idx (q.id)}
      <button
        class="grid-cell {getCellStatus(q, idx)}"
        onclick={() => onSelectIndex(idx)}
        title="Câu {idx + 1}"
      >
        {idx + 1}
      </button>
    {/each}
  </div>

  <!-- Legend -->
  <div class="legend">
    {#if mode === 'practice' || isExamSubmitted}
      <div class="legend-item">
        <span class="legend-color" style="background: var(--success-bg); border-color: var(--success-border);"></span>
        <span>Đúng</span>
      </div>
      <div class="legend-item">
        <span class="legend-color" style="background: var(--danger-bg); border-color: var(--danger-border);"></span>
        <span>Sai</span>
      </div>
    {:else}
      <div class="legend-item">
        <span class="legend-color" style="background: var(--primary-light); border-color: var(--primary-border);"></span>
        <span>Đã chọn</span>
      </div>
    {/if}
    <div class="legend-item">
      <span class="legend-color" style="background: var(--bg);"></span>
      <span>Chưa làm</span>
    </div>
    <div class="legend-item">
      <span style="color: var(--warning); font-size: 0.85rem;">★</span>
      <span>Đánh dấu</span>
    </div>
  </div>
</div>
