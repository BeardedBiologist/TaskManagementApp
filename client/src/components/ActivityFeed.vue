<template>
  <div class="activity-feed" :class="{ compact, expanded }">
    <div v-if="showHeader" class="feed-header">
      <h4>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
        Activity
      </h4>
      <button v-if="expanded || showClose" class="close-btn" @click="$emit('close')">
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
              <strong>{{ getUserDisplayName(activity.user) }}</strong>
              {{ getActivityDescription(activity) }}
              <span v-if="activity.targetName" class="activity-target">
                {{ activity.targetName }}
              </span>
              <span v-if="activity.count && activity.count > 1" class="activity-count">
                ×{{ activity.count }}
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
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  showClose: {
    type: Boolean,
    default: false
  }
})

defineEmits(['load-more', 'close'])

const displayedActivities = computed(() => {
  if (props.limit && !props.expanded) {
    return normalizeActivities(props.activities.slice(0, props.limit))
  }
  return normalizeActivities(props.activities)
})

function getUserDisplayName(user) {
  if (!user) return 'Someone'
  const name = user.name ?? user
  if (typeof name === 'string') {
    const looksLikeId = /^[0-9a-f]{24}$/i.test(name.trim())
    return looksLikeId ? 'Someone' : name
  }
  if (name && (name.first || name.last)) {
    return `${name.first || ''} ${name.last || ''}`.trim() || 'Someone'
  }
  return 'Someone'
}

function getInitials(name) {
  if (!name) return '?'
  if (typeof name !== 'string') {
    if (typeof name?.first === 'string' || typeof name?.last === 'string') {
      const first = name.first || ''
      const last = name.last || ''
      return `${first[0] || ''}${last[0] || ''}`.toUpperCase() || '?'
    }
    return '?'
  }
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function getActivityDescription(activity) {
  if (activity.type === 'task.moved') {
    const fromName = activity.metadata?.fromName || activity.metadata?.from
    const toName = activity.metadata?.toName || activity.metadata?.to
    if (fromName && toName) {
      return `moved task from ${fromName} to ${toName}`
    }
    return 'moved task'
  }

  if (activity.type === 'task.updated' && activity.metadata?.changes?.length) {
    return `updated task ${formatTaskChanges(activity.metadata.changes)}`
  }

  if (activity.type === 'whiteboard.element.added') {
    const typeLabel = activity.metadata?.elementType ? ` ${formatElementType(activity.metadata.elementType)}` : ''
    return `added${typeLabel} to whiteboard`
  }
  if (activity.type === 'whiteboard.element.updated') {
    const typeLabel = activity.metadata?.elementType ? ` ${formatElementType(activity.metadata.elementType)}` : ''
    return `updated${typeLabel} on whiteboard`
  }
  if (activity.type === 'whiteboard.element.deleted') {
    return 'removed item from whiteboard'
  }

  const descriptions = {
    'task.created': 'created task',
    'task.updated': 'updated task',
    'task.deleted': 'deleted task',
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

function formatElementType(type) {
  const label = type.replace(/_/g, ' ').toLowerCase()
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function formatTaskChanges(changes) {
  const parts = []
  changes.forEach(change => {
    const field = change.field
    if (Object.prototype.hasOwnProperty.call(change, 'from') || Object.prototype.hasOwnProperty.call(change, 'to')) {
      const from = formatChangeValue(change.from)
      const to = formatChangeValue(change.to)
      parts.push(`${field}: ${from ?? '—'} → ${to ?? '—'}`)
      return
    }
    if (change.added || change.removed || change.toggled) {
      const detailParts = []
      if (change.added?.length) detailParts.push(`+${change.added.join(', ')}`)
      if (change.removed?.length) detailParts.push(`-${change.removed.join(', ')}`)
      if (change.toggled?.length) {
        const toggles = change.toggled.map(item => `${item.completed ? '✓' : '☐'} ${item.title}`)
        detailParts.push(toggles.join(', '))
      }
      if (detailParts.length) {
        parts.push(`${field}: ${detailParts.join(' | ')}`)
      }
    }
  })
  return parts.length ? `(${parts.join(' · ')})` : ''
}

function formatChangeValue(value) {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return value.toString()
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}

function normalizeActivities(items) {
  const consolidated = []
  const windowMs = 10 * 60 * 1000

  for (const activity of items) {
    const last = consolidated[consolidated.length - 1]
    const sameActor = last && (last.user?._id || last.userId) === (activity.user?._id || activity.userId)
    const sameTarget = last && last.targetId === activity.targetId && last.targetName === activity.targetName
    const sameType = last && last.type === activity.type
    const withinWindow = last && Math.abs(new Date(last.timestamp) - new Date(activity.timestamp)) <= windowMs

    if (last && sameActor && sameTarget && sameType && withinWindow) {
      last.count = (last.count || 1) + 1
      continue
    }

    consolidated.push({ ...activity })
  }

  return consolidated
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
  height: 100%;
  display: flex;
  flex-direction: column;
}

.activity-feed.compact {
  max-height: none;
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
  max-height: none;
  flex: 1;
}

.activity-feed.expanded .feed-content {
  max-height: none;
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

.activity-count {
  margin-left: var(--space-2);
  font-weight: 600;
  color: var(--text-tertiary);
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
