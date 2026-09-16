<script lang="ts">
  import type { TestSuite } from '../data/types';

  let {
    testSuites = [],
    selectedTestId = 'test-1',
    mode = 'practice',
    userName = '',
    isShuffled = false,
    theme = 'light',
    timerSeconds = 0,
    onSelectTest = (id: string) => {},
    onSelectMode = (mode: 'practice' | 'exam') => {},
    onToggleShuffle = () => {},
    onOpenNameModal = () => {},
    onOpenHistoryModal = () => {},
    onToggleTheme = () => {},
  } = $props<{
    testSuites: TestSuite[];
    selectedTestId: string;
    mode: 'practice' | 'exam';
    userName: string;
    isShuffled: boolean;
    theme: string;
    timerSeconds: number;
    onSelectTest: (id: string) => void;
    onSelectMode: (mode: 'practice' | 'exam') => void;
    onToggleShuffle: () => void;
    onOpenNameModal: () => void;
    onOpenHistoryModal: () => void;
    onToggleTheme: () => void;
  }>();

  function formatTimer(sec: number): string {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
</script>

<header class="navbar">
  <div class="nav-container">
    <!-- Brand -->
    <div style="display: flex; align-items: center; gap: 0.75rem;">
      <div class="brand">
        <span class="brand-badge">tinAB</span>
        <span class="brand-text">
          Ôn Tập Tin Học
        </span>
      </div>

      <!-- Test selector -->
      <select
        class="select-input"
        value={selectedTestId}
        onchange={(e) => onSelectTest((e.target as HTMLSelectElement).value)}
      >
        {#each testSuites as suite}
          <option value={suite.id}>{suite.shortTitle} ({suite.totalQuestions} câu)</option>
        {/each}
        <option value="all">Tất cả đề thi (338 câu)</option>
      </select>
    </div>

    <!-- Mode Selector -->
    <div class="mode-tabs">
      <button
        class="mode-tab {mode === 'practice' ? 'active' : ''}"
        onclick={() => onSelectMode('practice')}
        title="Chọn đáp án xem kết quả ngay lập tức"
      >
        🎯 Ôn tập
      </button>
      <button
        class="mode-tab {mode === 'exam' ? 'active' : ''}"
        onclick={() => onSelectMode('exam')}
        title="Đếm giờ, nộp bài tính điểm tổng kết"
      >
        ⏱️ Thi thử
      </button>
    </div>

    <!-- Timer in Exam mode -->
    {#if mode === 'exam'}
      <div style="display: flex; align-items: center; gap: 0.4rem; font-weight: 800; font-size: 1.05rem; color: var(--primary); background: var(--primary-light); padding: 0.35rem 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--primary-border);">
        <span>⏳</span>
        <span>{formatTimer(timerSeconds)}</span>
      </div>
    {/if}

    <!-- Actions -->
    <div class="nav-actions">
      <!-- Shuffle toggle -->
      <button
        class="btn-icon"
        style="color: {isShuffled ? 'var(--primary)' : 'var(--text-muted)'}; border-color: {isShuffled ? 'var(--primary-border)' : 'var(--card-border)'};"
        onclick={onToggleShuffle}
        title={isShuffled ? 'Đang bật xáo trộn câu hỏi' : 'Xáo trộn ngẫu nhiên thứ tự câu'}
      >
        🔀
      </button>

      <!-- History button -->
      <button class="btn btn-secondary" onclick={onOpenHistoryModal} title="Xem lịch sử làm bài">
        📊 Lịch sử
      </button>

      <!-- User name button -->
      <button class="btn btn-secondary" onclick={onOpenNameModal} title="Đổi tên của bạn">
        👤 {userName || 'Nhập tên'}
      </button>

      <!-- Theme toggle -->
      <button class="btn-icon" onclick={onToggleTheme} title="Chuyển chế độ Sáng / Tối">
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </div>
  </div>
</header>
