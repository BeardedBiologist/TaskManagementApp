<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showOverlay" class="call-overlay">
        <!-- Status bar -->
        <div class="call-status-bar">
          <span class="status-text">{{ statusText }}</span>
          <span v-if="callStore.callState === 'connected'" class="duration">
            {{ formattedDuration }}
          </span>
        </div>

        <!-- Video / Avatar area -->
        <div class="call-media-area">
          <!-- Remote video -->
          <video
            v-show="callStore.callType === 'video' && remoteStreamActive"
            ref="remoteVideoEl"
            class="remote-video"
            autoplay
            playsinline
          />

          <!-- Avatar fallback (audio call or no remote video) -->
          <div v-if="callStore.callType === 'audio' || !remoteStreamActive" class="avatar-fallback">
            <div class="fallback-avatar">
              {{ callStore.remoteUser?.initials || '?' }}
            </div>
            <span class="fallback-name">{{ remoteDisplayName }}</span>
          </div>

          <!-- Local PiP video -->
          <video
            v-show="callStore.callType === 'video' && callStore.isVideoEnabled && localStreamActive"
            ref="localVideoEl"
            class="local-video"
            autoplay
            playsinline
            muted
          />
        </div>

        <!-- Controls bar -->
        <div class="call-controls">
          <div class="controls-inner">
            <button
              class="control-btn"
              :class="{ active: !callStore.isAudioEnabled }"
              @click="callStore.toggleAudio()"
              :title="callStore.isAudioEnabled ? 'Mute mic' : 'Unmute mic'"
            >
              <svg v-if="callStore.isAudioEnabled" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="1" y1="1" x2="23" y2="23"/>
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.13 1.49-.35 2.17"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </button>

            <button
              v-if="callStore.callType === 'video'"
              class="control-btn"
              :class="{ active: !callStore.isVideoEnabled }"
              @click="callStore.toggleVideo()"
              :title="callStore.isVideoEnabled ? 'Turn off camera' : 'Turn on camera'"
            >
              <svg v-if="callStore.isVideoEnabled" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16.5 7.5L23 7v10l-6.5-.5"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
                <path d="M1 10.185V17a2 2 0 0 0 2 2h10.5M16 3H3a2 2 0 0 0-2 2v.5"/>
              </svg>
            </button>

            <button
              class="control-btn hangup"
              @click="callStore.endCall()"
              title="End call"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useCallStore } from '../stores/call'

const callStore = useCallStore()

const localVideoEl = ref(null)
const remoteVideoEl = ref(null)
const localStreamActive = ref(false)
const remoteStreamActive = ref(false)

let streamPollInterval = null

const showOverlay = computed(() =>
  ['outgoing', 'connecting', 'connected'].includes(callStore.callState)
)

const statusText = computed(() => {
  switch (callStore.callState) {
    case 'outgoing': return 'Calling...'
    case 'connecting': return 'Connecting...'
    case 'connected': return ''
    default: return ''
  }
})

const formattedDuration = computed(() => {
  const s = callStore.callDuration
  const mins = Math.floor(s / 60).toString().padStart(2, '0')
  const secs = (s % 60).toString().padStart(2, '0')
  return `${mins}:${secs}`
})

const remoteDisplayName = computed(() => {
  const u = callStore.remoteUser
  if (!u) return 'Unknown'
  if (u.name) {
    return `${u.name.first || ''} ${u.name.last || ''}`.trim() || 'Unknown'
  }
  return 'Unknown'
})

function syncStreams() {
  const localStream = callStore.getLocalStream()
  const remoteStream = callStore.getRemoteStream()

  if (localVideoEl.value && localStream) {
    if (localVideoEl.value.srcObject !== localStream) {
      localVideoEl.value.srcObject = localStream
    }
    localStreamActive.value = true
  } else {
    localStreamActive.value = false
  }

  if (remoteVideoEl.value && remoteStream) {
    if (remoteVideoEl.value.srcObject !== remoteStream) {
      remoteVideoEl.value.srcObject = remoteStream
    }
    remoteStreamActive.value = true
  } else {
    remoteStreamActive.value = false
  }
}

watch(showOverlay, (visible) => {
  if (visible) {
    streamPollInterval = setInterval(syncStreams, 200)
  } else {
    clearInterval(streamPollInterval)
    streamPollInterval = null
    localStreamActive.value = false
    remoteStreamActive.value = false
  }
}, { immediate: true })

onBeforeUnmount(() => {
  clearInterval(streamPollInterval)
})
</script>

<style scoped>
.call-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: var(--bg-primary, #0f0f17);
  display: flex;
  flex-direction: column;
}

.call-status-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: rgba(0, 0, 0, 0.4);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
}

.status-text {
  font-size: 0.9375rem;
  font-weight: 500;
  color: white;
}

.duration {
  font-size: 0.9375rem;
  font-weight: 600;
  color: white;
  font-variant-numeric: tabular-nums;
}

.call-media-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.remote-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

.fallback-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 600;
  color: white;
}

.fallback-name {
  font-size: 1.25rem;
  font-weight: 500;
  color: white;
}

.local-video {
  position: absolute;
  bottom: 100px;
  right: 20px;
  width: 180px;
  height: 240px;
  object-fit: cover;
  border-radius: var(--radius-lg);
  border: 2px solid rgba(255, 255, 255, 0.2);
  z-index: 2;
}

.call-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;
  display: flex;
  justify-content: center;
  padding: var(--space-6) var(--space-4);
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
}

.controls-inner {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-6);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-full);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.control-btn {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.control-btn svg {
  width: 22px;
  height: 22px;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.control-btn.active {
  background: rgba(255, 255, 255, 0.9);
  color: #1a1a2e;
}

.control-btn.hangup {
  background: var(--accent-rose, #f43f5e);
  color: white;
  width: 60px;
  height: 60px;
}

.control-btn.hangup svg {
  width: 26px;
  height: 26px;
  transform: rotate(135deg);
}

.control-btn.hangup:hover {
  background: #e11d48;
  transform: scale(1.05);
}

/* Transition */
.fade-enter-active {
  transition: opacity 0.3s ease;
}

.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 767px) {
  .local-video {
    width: 120px;
    height: 160px;
    bottom: 120px;
    right: 12px;
  }

  .control-btn {
    width: 46px;
    height: 46px;
  }

  .control-btn.hangup {
    width: 54px;
    height: 54px;
  }

  .controls-inner {
    gap: var(--space-3);
    padding: var(--space-3) var(--space-5);
  }

  .fallback-avatar {
    width: 96px;
    height: 96px;
    font-size: 2rem;
  }
}
</style>
