<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="callStore.callState === 'ended' && callStore.endReason" class="call-ended-toast">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useCallStore } from '../stores/call'

const callStore = useCallStore()

const toastMessage = computed(() => {
  switch (callStore.endReason) {
    case 'hangup': return 'Call ended'
    case 'declined': return 'Call declined'
    case 'busy': return 'User is busy'
    case 'timeout': return 'No answer'
    case 'error': return 'Call failed'
    case 'permissions': return 'Camera/microphone access denied'
    default: return 'Call ended'
  }
})
</script>

<style scoped>
.call-ended-toast {
  position: fixed;
  bottom: 100px;
  right: 20px;
  z-index: 3001;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5);
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  color: var(--text-primary);
  font-size: 0.9375rem;
  font-weight: 500;
}

.call-ended-toast svg {
  width: 18px;
  height: 18px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-leave-active {
  transition: all 0.2s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 767px) {
  .call-ended-toast {
    left: 20px;
    right: 20px;
    bottom: 90px;
    justify-content: center;
  }
}
</style>
