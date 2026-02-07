<template>
  <div class="notifications-container">
    <button
      class="notification-bell"
      :class="{ 'has-unread': notificationStore.unreadCount > 0 }"
      @click="toggleOpen"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <span v-if="notificationStore.unreadCount > 0" class="badge">{{ notificationStore.unreadCount > 9 ? '9+' : notificationStore.unreadCount }}</span>
    </button>

    <Transition name="dropdown">
      <div v-if="isOpen" class="notifications-dropdown" :class="'drop-' + props.dropDirection">
        <div class="dropdown-header">
          <h3>Notifications</h3>
          <button v-if="notificationStore.notifications.length" class="btn btn-ghost btn-sm" @click="markAllRead">
            Mark all read
          </button>
        </div>

        <div class="notifications-list">
          <div
            v-for="notification in notificationStore.notifications"
            :key="notification._id"
            class="notification-item"
            :class="{ unread: !notification.read }"
            @click="handleClick(notification)"
          >
            <div class="notification-icon" :class="notification.type">
              <!-- task-assigned -->
              <svg v-if="notification.type === 'task-assigned'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <!-- task-due-soon -->
              <svg v-else-if="notification.type === 'task-due-soon'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <!-- mention -->
              <svg v-else-if="notification.type === 'mention'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="4"/>
                <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
              </svg>
              <!-- task-comment -->
              <svg v-else-if="notification.type === 'task-comment'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
              <!-- project-member-added -->
              <svg v-else-if="notification.type === 'project-member-added'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
              <!-- fallback bell -->
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
            <div class="notification-content">
              <p class="notification-text" v-html="notification.message"/>
              <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
            </div>
            <button class="dismiss-btn" @click.stop="dismiss(notification._id)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div v-if="notificationStore.notifications.length === 0" class="empty-notifications">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <p>No notifications yet</p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { formatDistanceToNow } from 'date-fns'
import { useNotificationStore } from '../stores/notification'

const props = defineProps({
  dropDirection: { type: String, default: 'up' }
})

const router = useRouter()
const notificationStore = useNotificationStore()

const isOpen = ref(false)

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function toggleOpen() {
  isOpen.value = !isOpen.value
}

function handleClickOutside(e) {
  if (!e.target.closest('.notifications-container')) {
    isOpen.value = false
  }
}

function handleClick(notification) {
  notificationStore.markAsRead(notification._id)
  isOpen.value = false

  if (notification.link) {
    router.push(notification.link)
  }
}

function markAllRead() {
  notificationStore.markAllRead()
}

function dismiss(id) {
  notificationStore.dismiss(id)
}

function formatTime(date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}
</script>

<style scoped>
.notifications-container {
  position: relative;
}

.notification-bell {
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all 0.2s;
}

.notification-bell:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.notification-bell svg {
  width: 20px;
  height: 20px;
}

.notification-bell .badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: var(--accent-rose);
  color: white;
  font-size: 0.6875rem;
  font-weight: 600;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-bell.has-unread {
  color: var(--text-primary);
}

.notifications-dropdown {
  position: absolute;
  width: 380px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 100;
  overflow: hidden;
}

.notifications-dropdown.drop-up {
  bottom: calc(100% + var(--space-2));
  left: 0;
}

.notifications-dropdown.drop-down {
  top: calc(100% + var(--space-2));
  right: 0;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border-subtle);
}

.dropdown-header h3 {
  font-size: 1rem;
  font-weight: 600;
}

.notifications-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid var(--border-subtle);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background: var(--bg-tertiary);
}

.notification-item.unread {
  background: var(--primary-500-alpha-05, rgba(139, 92, 246, 0.05));
}

.notification-item.unread:hover {
  background: var(--primary-500-alpha-10, rgba(139, 92, 246, 0.1));
}

.notification-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-icon svg {
  width: 18px;
  height: 18px;
}

.notification-icon.task-assigned {
  background: var(--primary-500-alpha-15, rgba(139, 92, 246, 0.15));
  color: var(--primary-400);
}

.notification-icon.task-due-soon {
  background: var(--accent-amber-alpha-15, rgba(245, 158, 11, 0.15));
  color: var(--accent-amber);
}

.notification-icon.mention {
  background: var(--accent-cyan-alpha-15, rgba(6, 182, 212, 0.15));
  color: var(--accent-cyan);
}

.notification-icon.task-comment {
  background: var(--accent-emerald-alpha-15, rgba(16, 185, 129, 0.15));
  color: var(--accent-emerald);
}

.notification-icon.project-member-added {
  background: var(--accent-pink-alpha-15, rgba(236, 72, 153, 0.15));
  color: var(--accent-pink);
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-text {
  font-size: 0.875rem;
  color: var(--text-primary);
  line-height: 1.5;
  margin-bottom: var(--space-1);
}

.notification-text :deep(strong) {
  font-weight: 600;
}

.notification-time {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.dismiss-btn {
  padding: var(--space-1);
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  opacity: 0;
  transition: all 0.15s;
}

.notification-item:hover .dismiss-btn {
  opacity: 1;
}

.dismiss-btn:hover {
  color: var(--accent-rose);
}

.dismiss-btn svg {
  width: 14px;
  height: 14px;
}

.empty-notifications {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-10);
  color: var(--text-tertiary);
}

.empty-notifications svg {
  width: 40px;
  height: 40px;
  margin-bottom: var(--space-3);
  opacity: 0.5;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
