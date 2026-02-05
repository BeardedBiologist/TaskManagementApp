<template>
  <div class="live-cursors-container">
    <!-- Cursors for each user -->
    <div
      v-for="[userId, user] in roomUsers"
      :key="userId"
      class="remote-cursor"
      :style="getCursorStyle(userId)"
    >
      <div class="cursor-pointer" :style="{ color: getUserColor(userId) }">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
        </svg>
      </div>
      <div 
        class="cursor-label"
        :style="{ backgroundColor: getUserColor(userId) }"
      >
        {{ user.name || 'User' }}
      </div>
      
      <!-- Activity indicator -->
      <div 
        v-if="getUserActivity(userId)"
        class="activity-indicator"
        :class="getUserActivity(userId)"
      >
        {{ getActivityLabel(getUserActivity(userId)) }}
      </div>
    </div>
    
    <!-- User avatars list -->
    <div v-if="showAvatars" class="presence-avatars">
      <div 
        v-for="[userId, user] in roomUsers"
        :key="userId"
        class="presence-avatar"
        :style="{ borderColor: getUserColor(userId) }"
        :title="user.name"
      >
        {{ user.initials || getInitials(user.name) }}
      </div>
      <div v-if="roomUsers.size === 0" class="presence-count">
        Just you
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCollaborationStore } from '../stores/collaboration'

const props = defineProps({
  showAvatars: {
    type: Boolean,
    default: true
  },
  containerRef: {
    type: Object,
    default: null
  }
})

const collaborationStore = useCollaborationStore()

const roomUsers = computed(() => collaborationStore.roomUsers)
const userCursors = computed(() => collaborationStore.userCursors)
const userActivity = computed(() => collaborationStore.userActivity)

// Color palette for users
const userColors = [
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#f43f5e', // rose
  '#6366f1', // indigo
  '#14b8a6'  // teal
]

function getUserColor(userId) {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return userColors[Math.abs(hash) % userColors.length]
}

function getCursorStyle(userId) {
  const cursor = userCursors.value.get(userId)
  if (!cursor) return { display: 'none' }
  
  return {
    transform: `translate(${cursor.x}px, ${cursor.y}px)`
  }
}

function getUserActivity(userId) {
  const activity = userActivity.value.get(userId)
  if (!activity) return null
  
  // Only show activity if it's recent (within last 5 seconds)
  const fiveSecondsAgo = Date.now() - 5000
  if (new Date(activity.timestamp).getTime() < fiveSecondsAgo) {
    return null
  }
  
  return activity.activity
}

function getActivityLabel(activity) {
  const labels = {
    idle: '',
    typing: 'Typing...',
    drawing: 'Drawing...',
    scrolling: 'Scrolling...',
    selecting: 'Selecting...'
  }
  return labels[activity] || ''
}

function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

<style scoped>
.live-cursors-container {
  position: relative;
  pointer-events: none;
}

.remote-cursor {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  transition: transform 0.1s ease-out;
}

.cursor-pointer {
  width: 20px;
  height: 20px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.cursor-pointer svg {
  width: 100%;
  height: 100%;
}

.cursor-label {
  position: absolute;
  left: 14px;
  top: 14px;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.activity-indicator {
  position: absolute;
  left: 14px;
  top: 34px;
  padding: 2px 8px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  font-size: 10px;
  color: var(--text-secondary);
  white-space: nowrap;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Presence Avatars */
.presence-avatars {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
}

.presence-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  border: 2px solid var(--primary-500);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  margin-left: -8px;
}

.presence-avatar:first-child {
  margin-left: 0;
}

.presence-count {
  font-size: 13px;
  color: var(--text-tertiary);
  margin-left: var(--space-2);
}
</style>
