<template>
  <div class="activity-feed" :class="{ compact, expanded }">
    <div class="feed-header">
      <h4>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
        Activity
      </h4>
      <button v-if="expanded" class="close-btn" @click="$emit('close')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    
    <div class="feed-content" ref="feedContent">
      <div v-if="loading && activities.length === 0" class="feed-loading">
        <div class="spinner-sm"></div>
        Loading activity...
      </div>
      
      <div v-else-if="activities.length === 0" class="feed-empty">
        No activity yet
      </div>
      
      <template v-else>
        <div
          v-for="activity in displayedActivities"
          :key="activity._id"
          class="activity-item"
        >
          <div class="activity-avatar">
            {{ getInitials(activity.user?.name) }}
          </div>
          <div class="activity-content">
            <p class="activity-text">
              <strong>{{ activity.user?.name || 'Someone' }}</strong>
              {{ getActivityDescription(activity) }}
              <span v-if="activity.targetName" class="activity-target">
                {{ activity.targetName }}
              </span>
            </p>
            <time class="activity-time">{{ formatTime(activity.timestamp) }}</time>
          </div>
          <div 
            v-if="getActivityIcon(activity.type)" 
            class="activity-icon"
            :class="getActivityColor(activity.type)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="getActivityIcon(activity.type)"/>
          </div>
        </div>
        
        <button 
          v-if="hasMore && !compact"
          class="load-more"
          :disabled="loading"
          @click="$emit('load-more')"
        >
          <span v-if="loading" class="spinner-sm"></span>
          <span v-else>Load more</span>
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  activities: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  hasMore: {
    type: Boolean,
    default: false
  },
  compact: {
    type: Boolean,
    default: false
  },
  expanded: {
    type: Boolean,
    default: false
  },
  limit: {
    type: Number,
    default: null
  }
})

defineEmits(['load-more', 'close'])

const displayedActivities = computed(() => {
  if (props.limit && !props.expanded) {
    return props.activities.slice(0, props.limit)
  }
  return props.activities
})

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function getActivityDescription(activity) {
  const descriptions = {
    'task.created': 'created task',
    'task.updated': 'updated task',
    'task.deleted': 'deleted task',
    'task.moved': 'moved task',
    'task.assigned': 'assigned task to',
    'task.comment.added': 'commented on',
    'task.comment.deleted': 'deleted comment on',
    'page.created': 'created page',
    'page.updated': 'updated page',
    'page.deleted': 'deleted page',
    'page.comment.added': 'commented on',
    'whiteboard.created': 'created whiteboard',
    'whiteboard.updated': 'updated whiteboard',
    'whiteboard.element.added': 'added to whiteboard',
    'whiteboard.element.updated': 'updated on whiteboard',
    'project.created': 'created project',
    'project.member.added': 'added member to',
    'user.joined': 'joined'
  }
  return descriptions[activity.type] || 'performed action'
}

function getActivityIcon(type) {
  const icons = {
    'task.created': '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    'task.updated': '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
    'task.moved': '<polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="19 9 22 12 19 15"/><polyline points="15 19 12 22 9 19"/>',
    'task.comment.added': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    'page.created': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
    'page.comment.added': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    'whiteboard.created': '<rect x="3" y="3" width="18" height="18" rx="2"/>',
    'project.created': '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    'user.joined': '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>'
  }
  return icons[type] || '<circle cx="12" cy="12" r="10"/>'
}

function getActivityColor(type) {
  if (type.includes('task')) return 'purple'
  if (type.includes('page')) return 'cyan'
  if (type.includes('whiteboard')) return 'pink'
  if (type.includes('project')) return 'amber'
  return 'default'
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.activity-feed {
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.activity-feed.compact {
  max-height: 300px;
}

.activity-feed.expanded {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 360px;
  max-height: none;
  z-index: 1000;
  border-radius: 0;
  border-left: 1px solid var(--border-subtle);
}

.feed-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
}

.feed-header h4 {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 14px;
  font-weight: 600;
  margin: 0;
}

.feed-header h4 svg {
  width: 16px;
  height: 16px;
  color: var(--primary-400);
}

.close-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--text-tertiary);
}

.close-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.close-btn svg {
  width: 16px;
  height: 16px;
}

.feed-content {
  padding: var(--space-2);
  overflow-y: auto;
  max-height: 250px;
}

.activity-feed.expanded .feed-content {
  max-height: calc(100vh - 60px);
}

.feed-loading,
.feed-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-8);
  color: var(--text-tertiary);
  font-size: 14px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  transition: background-color 0.15s ease;
}

.activity-item:hover {
  background: var(--bg-tertiary);
}

.activity-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-text {
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-secondary);
  margin: 0;
}

.activity-text strong {
  color: var(--text-primary);
  font-weight: 500;
}

.activity-target {
  color: var(--primary-400);
  font-weight: 500;
}

.activity-time {
  font-size: 11px;
  color: var(--text-tertiary);
}

.activity-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.activity-icon svg {
  width: 14px;
  height: 14px;
}

.activity-icon.purple {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
}

.activity-icon.cyan {
  background: rgba(6, 182, 212, 0.15);
  color: #06b6d4;
}

.activity-icon.pink {
  background: rgba(236, 72, 153, 0.15);
  color: #ec4899;
}

.activity-icon.amber {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.activity-icon.default {
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
}

.load-more {
  width: 100%;
  padding: var(--space-3);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.load-more:hover:not(:disabled) {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.load-more:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-sm {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-subtle);
  border-top-color: var(--primary-500);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
