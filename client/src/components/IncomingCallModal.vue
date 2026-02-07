<template>
  <Teleport to="body">
    <Transition name="slide-down">
      <div v-if="callStore.callState === 'incoming'" class="incoming-call-modal">
        <div class="caller-info">
          <div class="caller-avatar-wrapper">
            <div class="pulse-ring"></div>
            <div class="caller-avatar">
              {{ callStore.remoteUser?.initials || '?' }}
            </div>
          </div>
          <div class="caller-details">
            <span class="caller-name">
              {{ callerDisplayName }}
            </span>
            <span class="call-type-label">
              {{ callStore.callType === 'video' ? 'Video Call' : 'Voice Call' }}
            </span>
          </div>
        </div>
        <div class="call-actions">
          <button class="call-btn accept" @click="callStore.acceptCall()" title="Accept">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </button>
          <button class="call-btn decline" @click="callStore.rejectCall()" title="Decline">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useCallStore } from '../stores/call'

const callStore = useCallStore()

const callerDisplayName = computed(() => {
  const u = callStore.remoteUser
  if (!u) return 'Unknown'
  if (u.name) {
    return `${u.name.first || ''} ${u.name.last || ''}`.trim() || 'Unknown'
  }
  return 'Unknown'
})
</script>

<style scoped>
.incoming-call-modal {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 3000;
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  min-width: 320px;
}

.caller-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
}

.caller-avatar-wrapper {
  position: relative;
  width: 56px;
  height: 56px;
  flex-shrink: 0;
}

.pulse-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid var(--accent-emerald);
  animation: pulse-ring 1.5s ease-out infinite;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.9);
    opacity: 1;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

.caller-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
}

.caller-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.caller-name {
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--text-primary);
}

.call-type-label {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.call-actions {
  display: flex;
  gap: var(--space-3);
}

.call-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.call-btn svg {
  width: 22px;
  height: 22px;
}

.call-btn.accept {
  background: var(--accent-emerald);
  color: white;
}

.call-btn.accept:hover {
  background: #059669;
  transform: scale(1.05);
}

.call-btn.decline {
  background: var(--accent-rose);
  color: white;
}

.call-btn.decline:hover {
  background: #e11d48;
  transform: scale(1.05);
}

/* Transition */
.slide-down-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-down-leave-active {
  transition: all 0.2s ease-in;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@media (max-width: 767px) {
  .incoming-call-modal {
    top: 10px;
    left: 10px;
    right: 10px;
    min-width: auto;
  }
}
</style>
