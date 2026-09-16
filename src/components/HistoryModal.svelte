<script lang="ts">
  import type { AttemptRecord } from '../data/types';
  import { deleteAttempt, clearAllAttempts } from '../utils/storage';

  let { 
    isOpen = false, 
    attempts = [], 
    onClose = () => {},
    onRefresh = () => {},
    onRetakeMistakes = (attempt: AttemptRecord) => {}
  } = $props<{
    isOpen: boolean;
    attempts: AttemptRecord[];
    onClose: () => void;
    onRefresh: () => void;
    onRetakeMistakes: (attempt: AttemptRecord) => void;
  }>();

  function handleDelete(id: string) {
    if (confirm('Bạn có chắc muốn xoá lần thi này?')) {
      deleteAttempt(id);
      onRefresh();
    }
  }

  function handleClearAll() {
    if (confirm('Bạn có chắc muốn xoá toàn bộ lịch sử làm bài?')) {
      clearAllAttempts();
      onRefresh();
    }
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} giây`;
    return `${mins}p ${secs}s`;
  }

  function formatDate(ts: number): string {
    const d = new Date(ts);
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  let avgScore = $derived(
    attempts.length > 0
      ? (attempts.reduce((acc, cur) => acc + (cur.score / cur.totalQuestions) * 10, 0) / attempts.length).toFixed(1)
      : '0.0'
  );

  let bestScore = $derived(
    attempts.length > 0
      ? Math.max(...attempts.map(a => (a.score / a.totalQuestions) * 10)).toFixed(1)
      : '0.0'
  );
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div class="modal-overlay" onclick={onClose} onkeydown={(e) => e.key === 'Escape' && onClose()} role="dialog" aria-modal="true" tabindex="-1">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="modal-card" onclick={(e) => e.stopPropagation()} style="max-width: 680px;">
      <div class="modal-header">
        <h2 class="modal-title">📊 Lịch sử làm bài</h2>
        <button class="btn-icon" onclick={onClose} aria-label="Đóng">✕</button>
      </div>

      {#if attempts.length === 0}
        <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 0.5rem;">📝</div>
          <p style="font-weight: 600; font-size: 1.1rem; color: var(--text-main);">Chưa có lịch sử làm bài nào</p>
          <p style="font-size: 0.9rem; margin-top: 0.25rem;">Hãy bắt đầu làm bài và nộp bài để xem lịch sử và tiến độ ở đây!</p>
        </div>
      {:else}
        <!-- Statistics Bar -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; text-align: center;">
          <div style="background: var(--bg); border: 1px solid var(--card-border); padding: 0.75rem; border-radius: var(--radius-md);">
            <div style="font-size: 0.8rem; color: var(--text-muted);">Số lần làm</div>
            <div style="font-size: 1.4rem; font-weight: 800; color: var(--primary);">{attempts.length}</div>
          </div>
          <div style="background: var(--bg); border: 1px solid var(--card-border); padding: 0.75rem; border-radius: var(--radius-md);">
            <div style="font-size: 0.8rem; color: var(--text-muted);">Điểm trung bình</div>
            <div style="font-size: 1.4rem; font-weight: 800; color: var(--warning);">{avgScore}/10</div>
          </div>
          <div style="background: var(--bg); border: 1px solid var(--card-border); padding: 0.75rem; border-radius: var(--radius-md);">
            <div style="font-size: 0.8rem; color: var(--text-muted);">Điểm cao nhất</div>
            <div style="font-size: 1.4rem; font-weight: 800; color: var(--success);">{bestScore}/10</div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
          <span style="font-size: 0.85rem; color: var(--text-muted);">
            Lưu tối đa 50 lần gần nhất trên trình duyệt (LocalStorage)
          </span>
          <button class="btn btn-secondary" style="font-size: 0.8rem; padding: 0.25rem 0.6rem; color: var(--danger);" onclick={handleClearAll}>
            🗑️ Xoá tất cả
          </button>
        </div>

        <!-- History List -->
        <div class="history-list">
          {#each attempts as item (item.id)}
            <div class="history-item">
              <div class="history-info">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span class="history-title">{item.testTitle}</span>
                  <span class="badge {item.mode === 'exam' ? 'badge-primary' : 'badge-info'}" style="font-size: 0.7rem;">
                    {item.mode === 'exam' ? 'Thi thử' : 'Ôn tập'}
                  </span>
                </div>
                <div class="history-meta">
                  <span>👤 {item.userName || 'Ẩn danh'}</span>
                  <span>📅 {formatDate(item.timestamp)}</span>
                  <span>⏱️ {formatTime(item.timeSpentSeconds)}</span>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="text-align: right;">
                  <div class="history-score">{item.score}/{item.totalQuestions}</div>
                  <div style="font-size: 0.8rem; font-weight: 700; color: {item.percentage >= 80 ? 'var(--success)' : item.percentage >= 50 ? 'var(--warning)' : 'var(--danger)'};">
                    {((item.score / item.totalQuestions) * 10).toFixed(1)}đ ({item.percentage}%)
                  </div>
                </div>

                <button class="btn-icon" style="color: var(--danger); border-color: transparent;" onclick={() => handleDelete(item.id)} title="Xoá lần này">
                  ✕
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}

      <div style="display: flex; justify-content: flex-end; margin-top: 0.5rem;">
        <button class="btn btn-secondary" onclick={onClose}>Đóng</button>
      </div>
    </div>
  </div>
{/if}
