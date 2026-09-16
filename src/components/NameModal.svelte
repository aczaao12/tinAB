<script lang="ts">
  let { isOpen = false, initialName = '', onSave = (name: string) => {}, onClose = () => {} } = $props<{
    isOpen: boolean;
    initialName: string;
    onSave: (name: string) => void;
    onClose: () => void;
  }>();

  let nameInput = $state('');

  $effect(() => {
    if (isOpen) {
      nameInput = initialName;
    }
  });

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (nameInput.trim()) {
      onSave(nameInput.trim());
    } else {
      onClose();
    }
  }

  function handleOverlayKey(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
    }
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div 
    class="modal-overlay" 
    onclick={onClose} 
    onkeydown={handleOverlayKey} 
    role="dialog" 
    aria-modal="true" 
    tabindex="-1"
  >
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="modal-card" onclick={(e) => e.stopPropagation()} style="max-width: 440px;">
      <div class="modal-header">
        <h2 class="modal-title">👋 Chào bạn!</h2>
        <button class="btn-icon" onclick={onClose} aria-label="Đóng">✕</button>
      </div>
      <p style="color: var(--text-muted); font-size: 0.95rem;">
        Nhập tên của bạn để ghi nhận kết quả và lưu lại lịch sử làm bài trên thiết bị này:
      </p>
      
      <form onsubmit={handleSubmit} style="display: flex; flex-direction: column; gap: 1rem;">
        <input
          type="text"
          class="text-input"
          placeholder="Ví dụ: Nguyễn Văn A"
          bind:value={nameInput}
        />
        <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button type="button" class="btn btn-secondary" onclick={onClose}>Bỏ qua</button>
          <button type="submit" class="btn btn-primary">Lưu tên & Bắt đầu</button>
        </div>
      </form>
    </div>
  </div>
{/if}
