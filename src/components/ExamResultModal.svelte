<script lang="ts">
  let {
    isOpen = false,
    score = 0,
    totalQuestions = 0,
    timeSpentSeconds = 0,
    userName = '',
    onReview = () => {},
    onRetry = () => {},
    onRetryMistakes = () => {},
    hasMistakes = false,
    onClose = () => {}
  } = $props<{
    isOpen: boolean;
    score: number;
    totalQuestions: number;
    timeSpentSeconds: number;
    userName: string;
    onReview: () => void;
    onRetry: () => void;
    onRetryMistakes: () => void;
    hasMistakes: boolean;
    onClose: () => void;
  }>();

  let percentage = $derived(totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0);
  let grade10 = $derived(totalQuestions > 0 ? ((score / totalQuestions) * 10).toFixed(1) : '0.0');

  function formatTime(sec: number): string {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    if (mins === 0) return `${s} giây`;
    return `${mins} phút ${s} giây`;
  }

  function getRating(pct: number): { text: string; icon: string; color: string } {
    if (pct >= 90) return { text: 'Xuất sắc!', icon: '🏆', color: 'var(--success)' };
    if (pct >= 80) return { text: 'Rất tốt!', icon: '🎉', color: 'var(--success)' };
    if (pct >= 65) return { text: 'Đạt yêu cầu!', icon: '👍', color: 'var(--primary)' };
    if (pct >= 50) return { text: 'Cần ôn thêm!', icon: '📚', color: 'var(--warning)' };
    return { text: 'Chưa đạt, hãy luyện tập lại nhé!', icon: '💪', color: 'var(--danger)' };
  }

  let rating = $derived(getRating(percentage));
</script>

{#if isOpen}
  <div class="modal-overlay" role="dialog" aria-modal="true">
    <div class="modal-card" style="text-align: center; max-width: 520px;">
      <div style="font-size: 3.5rem; line-height: 1;">{rating.icon}</div>
      <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--text-main); margin-top: -0.5rem;">
        {rating.text}
      </h2>
      {#if userName}
        <p style="color: var(--text-muted); font-size: 0.95rem; margin-top: -0.5rem;">
          Chúc mừng <strong>{userName}</strong> đã hoàn thành bài thi!
        </p>
      {/if}

      <!-- Score Hero Box -->
      <div class="score-hero">
        <div class="score-number">{grade10}<span style="font-size: 1.25rem; font-weight: 600; color: var(--text-muted);">/10</span></div>
        <div style="font-weight: 700; color: var(--text-main); font-size: 1.1rem;">
          {score} / {totalQuestions} câu đúng ({percentage}%)
        </div>
        <div class="score-details">
          <span>⏱️ Thời gian: <strong>{formatTime(timeSpentSeconds)}</strong></span>
          <span>❌ Sai: <strong>{totalQuestions - score}</strong></span>
        </div>
      </div>

      <!-- Action buttons -->
      <div style="display: flex; flex-direction: column; gap: 0.65rem; margin-top: 0.5rem;">
        <button class="btn btn-primary" style="padding: 0.75rem 1rem;" onclick={onReview}>
          🔍 Xem chi tiết đáp án & giải thích
        </button>

        {#if hasMistakes}
          <button class="btn btn-secondary" style="padding: 0.75rem 1rem; border-color: var(--warning-border); color: var(--warning);" onclick={onRetryMistakes}>
            ⚡ Chỉ làm lại {totalQuestions - score} câu sai
          </button>
        {/if}

        <button class="btn btn-secondary" style="padding: 0.75rem 1rem;" onclick={onRetry}>
          🔄 Làm lại toàn bộ đề thi này
        </button>
      </div>
    </div>
  </div>
{/if}
