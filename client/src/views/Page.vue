<template>
  <Layout>
    <div class="page-container">
      <!-- Loading State -->
      <div v-if="pageStore.loading" class="loading">
        <div class="spinner"></div>
        <span>Loading page...</span>
      </div>

      <template v-else-if="pageStore.currentPage">
        <!-- Breadcrumbs -->
        <div class="breadcrumbs">
          <template v-for="(crumb, index) in pageStore.breadcrumb" :key="crumb._id">
            <router-link 
              v-if="index < pageStore.breadcrumb.length - 1"
              :to="crumb.path"
              class="crumb-link"
            >
              <span v-if="crumb.icon" class="crumb-icon">{{ crumb.icon }}</span>
              <span class="crumb-name">{{ crumb.name }}</span>
            </router-link>
            <span v-else class="crumb-current">
              <span v-if="crumb.icon" class="crumb-icon">{{ crumb.icon }}</span>
              <span class="crumb-name">{{ crumb.name }}</span>
            </span>
            <svg 
              v-if="index < pageStore.breadcrumb.length - 1" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="2"
              class="crumb-separator"
            >
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </template>
          <button
            class="btn btn-icon btn-ghost page-delete-btn"
            type="button"
            @click="deleteCurrentPage"
            title="Delete page"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
          <button 
            class="btn btn-icon btn-ghost activity-toggle"
            type="button"
            @click="toggleActivity"
            :title="showActivity ? 'Hide activity' : 'Show activity'"
          >
            <svg v-if="showActivity" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

        <!-- Cover Image -->
        <div v-if="pageStore.currentPage.cover" class="cover-image" :style="{ backgroundImage: `url(${pageStore.currentPage.cover})` }">
          <button class="cover-change" @click="promptCover">
            Change cover
          </button>
          <button class="cover-remove" @click="updatePage({ cover: null })">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="page-content-wrapper" :class="{ 'activity-hidden': !showActivity }">
          <div class="page-main">
            <div class="page-content">
              <div class="page-meta-actions">
                <button class="meta-btn" @click="promptCover">
                  {{ pageStore.currentPage.cover ? 'Change cover' : 'Add cover' }}
                </button>
                <button class="meta-btn" @click="showIconPicker = true">
                  {{ pageStore.currentPage.icon ? 'Change icon' : 'Add icon' }}
                </button>
                <button class="meta-btn" @click="showTemplateMenu = !showTemplateMenu">
                  Templates
                </button>
                <button class="meta-btn" @click="duplicatePage">
                  Duplicate
                </button>
              </div>
              <div v-if="showTemplateMenu" class="template-menu" @click.self="showTemplateMenu = false">
                <div class="template-panel">
                  <div class="template-header">
                    <span>Insert template</span>
                    <button class="btn btn-icon btn-ghost" @click="showTemplateMenu = false">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                  <div class="template-list">
                    <button
                      v-for="template in templates"
                      :key="template.id"
                      class="template-item"
                      @click="applyTemplate(template)"
                    >
                      <div class="template-name">{{ template.name }}</div>
                      <div class="template-desc">{{ template.description }}</div>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Page Icon -->
              <div class="page-icon-container">
                <button 
                  class="page-icon-btn"
                  @click="showIconPicker = true"
                  :class="{ 'empty': !pageStore.currentPage.icon }"
                >
                  {{ pageStore.currentPage.icon || '➕' }}
                </button>
              </div>

              <!-- Icon Picker Modal -->
              <div v-if="showIconPicker" class="icon-picker-modal" @click.self="showIconPicker = false">
                <div class="icon-picker-content">
                  <div class="icon-picker-header">
                    <h4>Choose Icon</h4>
                    <button class="close-btn" @click="showIconPicker = false">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                  <div class="icon-picker-actions">
                    <button class="remove-icon-btn" @click="updatePage({ icon: null })">
                      Remove icon
                    </button>
                  </div>
                  <div class="icon-grid">
                    <button 
                      v-for="icon in commonIcons" 
                      :key="icon"
                      class="icon-option"
                      @click="updatePage({ icon })"
                    >
                      {{ icon }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Online Users -->
              <div class="online-users-bar">
                <LiveCursors :show-avatars="true" />
              </div>

              <!-- Page Title -->
              <input
                ref="titleRef"
                v-model="pageTitle"
                class="page-title"
                placeholder="Untitled"
                @blur="updateTitle"
                @keydown.enter.prevent="blurTitle"
                @focus="updateActivity('typing')"
                @input="updateActivity('typing')"
              />

              <!-- Block Editor -->
              <div class="editor-wrapper" ref="editorWrapper">
                <BlockEditor
                  :initial-blocks="pageStore.currentPage.content"
                  :available-pages="allProjectPages"
                  @update="updateContent"
                  @cursor-move="handleCursorMove"
                />
              </div>

              <!-- Tasks Section -->
              <div class="page-section">
                <div class="section-header">
                  <div class="section-icon">✓</div>
                  <h3>Tasks in this page</h3>
                  <span class="task-count">{{ pageTasks.length }}</span>
                </div>
                <div v-if="pageTasks.length > 0" class="page-tasks">
                  <div
                    v-for="task in pageTasks"
                    :key="task._id"
                    class="task-item"
                    @click="openTask(task)"
                  >
                    <div class="task-status" :class="task.columnId">
                      <svg v-if="task.columnId === 'done'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <span class="task-title">{{ task.title }}</span>
                    <div class="task-priority" :class="task.priority">{{ task.priority }}</div>
                  </div>
                </div>
                <button class="add-task-btn" @click="createTaskFromPage">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add a task
                </button>
              </div>

              <!-- Calendar Events Section -->
              <div v-if="calendarTasks.length > 0" class="page-section">
                <div class="section-header">
                  <div class="section-icon">📅</div>
                  <h3>Calendar Events</h3>
                </div>
                <div class="calendar-events">
                  <div
                    v-for="task in calendarTasks"
                    :key="task._id"
                    class="event-item"
                    @click="openTask(task)"
                  >
                    <div class="event-date">
                      <span class="event-day">{{ formatDay(task.dueDate) }}</span>
                      <span class="event-month">{{ formatMonth(task.dueDate) }}</span>
                    </div>
                    <span class="event-title">{{ task.title }}</span>
                  </div>
                </div>
              </div>

              <!-- Comments Section -->
              <div class="page-section comments-section">
                <div class="section-header">
                  <div class="section-icon">💬</div>
                  <h3>Comments</h3>
                  <span class="task-count">{{ collaborationStore.activeComments.length }}</span>
                </div>
                
                <!-- Comment List -->
                <div class="comments-list">
                  <div
                    v-for="comment in collaborationStore.comments"
                    :key="comment._id"
                    class="comment-item"
                    :class="{ resolved: comment.status === 'resolved' }"
                  >
                    <div class="comment-avatar">
                      {{ getInitials(comment.author?.name) }}
                    </div>
                    <div class="comment-content">
                      <div class="comment-header">
                        <strong>{{ comment.author?.name || 'Unknown' }}</strong>
                        <time>{{ formatTime(comment.createdAt) }}</time>
                      </div>
                      <p class="comment-text">{{ comment.content }}</p>
                      <div class="comment-actions">
                        <button 
                          v-if="comment.status === 'open'" 
                          class="resolve-btn"
                          @click="resolveComment(comment._id)"
                        >
                          Resolve
                        </button>
                        <span v-else class="resolved-badge">✓ Resolved</span>
                      </div>
                      
                      <!-- Replies -->
                      <div v-if="comment.replies?.length" class="comment-replies">
                        <div
                          v-for="reply in comment.replies"
                          :key="reply._id"
                          class="reply-item"
                        >
                          <strong>{{ reply.author?.name }}</strong>
                          <p>{{ reply.content }}</p>
                        </div>
                      </div>
                      
                      <!-- Reply Input -->
                      <div class="reply-input">
                        <input
                          v-model="replyTexts[comment._id]"
                          type="text"
                          placeholder="Reply..."
                          @keydown.enter="addReply(comment._id)"
                        />
                        <button @click="addReply(comment._id)">Reply</button>
                      </div>
                    </div>
                  </div>
                  
                  <div v-if="collaborationStore.comments.length === 0" class="no-comments">
                    No comments yet. Be the first to comment!
                  </div>
                </div>
                
                <!-- New Comment -->
                <div class="new-comment">
                  <input
                    v-model="newCommentText"
                    type="text"
                    placeholder="Add a comment... (use @ to mention)"
                    @keydown.enter="addComment"
                  />
                  <button class="btn-primary" @click="addComment" :disabled="!newCommentText.trim()">
                    Comment
                  </button>
                </div>
              </div>

              <!-- Backlinks -->
              <div v-if="backlinks.length" class="page-section backlinks-section">
                <div class="section-header">
                  <div class="section-icon">🔗</div>
                  <h3>Backlinks</h3>
                  <span class="task-count">{{ backlinks.length }}</span>
                </div>
                <div class="backlinks-list">
                  <router-link
                    v-for="link in backlinks"
                    :key="link._id"
                    :to="`/projects/${route.params.id}/pages/${link._id}`"
                    class="backlink-item"
                  >
                    <span class="page-icon">{{ link.icon || '📄' }}</span>
                    <span class="backlink-title">{{ link.title || 'Untitled' }}</span>
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar Activity Feed -->
          <aside class="page-sidebar" v-if="showActivity">
            <div class="activity-header">
              <span>Activity</span>
              <button class="btn btn-icon btn-ghost" type="button" @click="toggleActivity" title="Hide activity">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <ActivityFeed
              :activities="collaborationStore.activities"
              :compact="true"
              :limit="10"
              @load-more="loadMoreActivities"
            />
          </aside>
          <button
            v-if="!showActivity"
            class="btn btn-icon btn-ghost activity-reopen"
            type="button"
            @click="toggleActivity"
            title="Show activity"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </template>

      <div v-else class="error">
        Page not found
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePageStore } from '../stores/page'
import { useProjectStore } from '../stores/project'
import { useAuthStore } from '../stores/auth'
import { useSocketStore } from '../stores/socket'
import { useCollaborationStore } from '../stores/collaboration'
import Layout from '../components/Layout.vue'
import BlockEditor from '../components/BlockEditor.vue'
import LiveCursors from '../components/LiveCursors.vue'
import ActivityFeed from '../components/ActivityFeed.vue'
import api from '../utils/api'

const route = useRoute()
const router = useRouter()
const pageStore = usePageStore()
const projectStore = useProjectStore()
const authStore = useAuthStore()
const socketStore = useSocketStore()
const collaborationStore = useCollaborationStore()

const titleRef = ref(null)
const pageTitle = ref('')
const showIconPicker = ref(false)
const showTemplateMenu = ref(false)
const isCreatingTask = ref(false)
const newCommentText = ref('')
const replyTexts = ref({})
const savedActivity = localStorage.getItem('pageActivityVisible')
const showActivity = ref(savedActivity ? JSON.parse(savedActivity) : true)
const allProjectPages = ref([])

const commonIcons = [
  '📄', '📝', '📋', '📑', '📂', '📁', '📊', '📈',
  '✅', '⚡', '💡', '🔥', '⭐', '📌', '📍', '🔔',
  '🎨', '🎬', '🎵', '📸', '🎮', '⚽', '🏆', '🎯',
  '💼', '💰', '💳', '📞', '✉️', '📦', '🎁', '🚀',
  '🏠', '📍', '🗺️', '🌍', '🌟', '☀️', '🌙', '⚙️',
  '🔒', '🔑', '🔍', '💻', '📱', '🖥️', '📡', '🔗'
]

const templates = [
  {
    id: 'meeting',
    name: 'Meeting Notes',
    description: 'Agenda, notes, decisions, action items.',
    blocks: [
      { type: 'heading1', content: 'Meeting Notes' },
      { type: 'heading2', content: 'Agenda' },
      { type: 'bullet', content: '' },
      { type: 'heading2', content: 'Notes' },
      { type: 'text', content: '' },
      { type: 'heading2', content: 'Decisions' },
      { type: 'bullet', content: '' },
      { type: 'heading2', content: 'Action Items' },
      { type: 'todo', content: '' }
    ]
  },
  {
    id: 'spec',
    name: 'Product Spec',
    description: 'Problem, goals, scope, solution, risks.',
    blocks: [
      { type: 'heading1', content: 'Product Spec' },
      { type: 'heading2', content: 'Problem' },
      { type: 'text', content: '' },
      { type: 'heading2', content: 'Goals' },
      { type: 'bullet', content: '' },
      { type: 'heading2', content: 'Non-Goals' },
      { type: 'bullet', content: '' },
      { type: 'heading2', content: 'Solution' },
      { type: 'text', content: '' },
      { type: 'heading2', content: 'Risks' },
      { type: 'bullet', content: '' }
    ]
  }
]

// Get tasks associated with this page
const pageTasks = computed(() => {
  if (!pageStore.currentPage) return []
  return projectStore.tasks.filter(t => t.page === pageStore.currentPage._id)
})

// Get tasks with due dates for calendar
const calendarTasks = computed(() => {
  return pageTasks.value
    .filter(t => t.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
})

const backlinks = computed(() => {
  const current = pageStore.currentPage
  if (!current) return []
  const tokenTitle = `[[${current.title || 'Untitled'}]]`
  const tokenId = `[[${current._id}]]`
  return allProjectPages.value.filter(page => {
    if (page._id === current._id) return false
    const content = Array.isArray(page.content) ? page.content : []
    return content.some(block => {
      const text = block?.content || ''
      return text.includes(tokenTitle) || text.includes(tokenId)
    })
  })
})

onMounted(async () => {
  const { id: projectId, pageId } = route.params
  
  if (pageId) {
    await loadPage(pageId)
    await projectStore.fetchProject(projectId)
    await fetchAllProjectPages(projectId)
    
    // Join collaboration room
    if (pageStore.currentPage) {
      collaborationStore.joinRoom('page', pageId, {
        _id: authStore.user?._id,
        name: authStore.userName,
        initials: authStore.userInitials
      })
    }
    
    // Load comments
    await loadComments()
    
    // Load activities
    await loadActivities()
  }
  
  // Setup socket listeners
  socketStore.on('page_updated', handlePageUpdate)
  socketStore.on('task_updated', handleTaskUpdate)
  socketStore.on('comment-added', handleCommentAdded)
  socketStore.on('comment-resolved', handleCommentResolved)
})

function toggleActivity() {
  showActivity.value = !showActivity.value
  localStorage.setItem('pageActivityVisible', JSON.stringify(showActivity.value))
}

onUnmounted(() => {
  collaborationStore.leaveRoom()
  socketStore.off('page_updated')
  socketStore.off('task_updated')
  socketStore.off('comment-added')
  socketStore.off('comment-resolved')
})

watch(() => route.params.pageId, async (newPageId) => {
  if (newPageId) {
    collaborationStore.leaveRoom()
    await loadPage(newPageId)
    await projectStore.fetchProject(route.params.id)
    await fetchAllProjectPages(route.params.id)
    
    collaborationStore.joinRoom('page', newPageId, {
      _id: authStore.user?._id,
      name: authStore.userName,
      initials: authStore.userInitials
    })
    
    await loadComments()
    await loadActivities()
  }
})

async function loadPage(pageId) {
  try {
    await pageStore.fetchPage(pageId)
    await pageStore.fetchBreadcrumb(pageId)
    pageTitle.value = pageStore.currentPage?.title || ''
    
    if (pageTitle.value === 'Untitled' || !pageStore.currentPage?.content?.length) {
      nextTick(() => {
        titleRef.value?.focus()
        titleRef.value?.select()
      })
    }
  } catch (err) {
    console.error('Failed to load page:', err)
  }
}

async function fetchAllProjectPages(projectId) {
  try {
    const { data } = await api.get(`/pages/project/${projectId}/all`)
    allProjectPages.value = data
  } catch (err) {
    console.error('Failed to load project pages:', err)
    allProjectPages.value = []
  }
}

async function loadComments() {
  try {
    const { data } = await api.get(`/comments/page/${route.params.pageId}`)
    collaborationStore.setComments(data)
  } catch (err) {
    console.error('Failed to load comments:', err)
  }
}

async function loadActivities() {
  try {
    const { data } = await api.get(`/activities/project/${route.params.id}?limit=20`)
    collaborationStore.setActivities(data)
  } catch (err) {
    console.error('Failed to load activities:', err)
  }
}

async function loadMoreActivities() {
  // Implementation for pagination
}

async function addComment() {
  if (!newCommentText.value.trim()) return
  
  try {
    const { data } = await api.post('/comments', {
      targetType: 'page',
      targetId: route.params.pageId,
      content: newCommentText.value,
      projectId: route.params.id,
      workspaceId: projectStore.currentProject?.workspace
    })
    
    collaborationStore.addComment(data)
    newCommentText.value = ''
    
    // Emit via socket
    socketStore.emit('comment-add', data)
  } catch (err) {
    console.error('Failed to add comment:', err)
  }
}

async function addReply(commentId) {
  const text = replyTexts.value[commentId]
  if (!text?.trim()) return
  
  try {
    const { data } = await api.post(`/comments/${commentId}/replies`, {
      content: text
    })
    
    collaborationStore.updateComment(commentId, { replies: data.replies })
    replyTexts.value[commentId] = ''
  } catch (err) {
    console.error('Failed to add reply:', err)
  }
}

async function resolveComment(commentId) {
  try {
    await api.put(`/comments/${commentId}/resolve`)
    collaborationStore.resolveComment(commentId, authStore.user)
    
    socketStore.emit('comment-resolve', {
      targetType: 'page',
      targetId: route.params.pageId,
      commentId
    })
  } catch (err) {
    console.error('Failed to resolve comment:', err)
  }
}

function handleCommentAdded(comment) {
  collaborationStore.addComment(comment)
}

function handleCommentResolved({ commentId, resolvedBy }) {
  collaborationStore.resolveComment(commentId, resolvedBy)
}

function updateTitle() {
  if (pageTitle.value !== pageStore.currentPage?.title) {
    updatePage({ title: pageTitle.value || 'Untitled' })
  }
}

function blurTitle() {
  titleRef.value?.blur()
}

async function updatePage(updates) {
  try {
    await pageStore.updatePage(pageStore.currentPage._id, updates)
    if (updates.icon !== undefined) {
      showIconPicker.value = false
    }
    socketStore.emit('page_update', {
      pageId: pageStore.currentPage._id,
      updates
    })
    if (updates.title || updates.content) {
      await fetchAllProjectPages(route.params.id)
    }
  } catch (err) {
    console.error('Failed to update page:', err)
  }
}

function promptCover() {
  const url = window.prompt('Paste a cover image URL')
  if (!url) return
  updatePage({ cover: url })
}

async function updateContent(content) {
  if (updateContent.timeout) {
    clearTimeout(updateContent.timeout)
  }
  updateContent.timeout = setTimeout(async () => {
    await updatePage({ content })
    
    // Emit real-time content update
    socketStore.emit('page-content-update', {
      pageId: route.params.pageId,
      content
    })
  }, 1000)
}

function handleCursorMove({ x, y, blockId }) {
  collaborationStore.updateCursor(x, y, blockId)
}

function updateActivity(activity) {
  collaborationStore.updateActivity(activity)
}

function openTask(task) {
  router.push(`/projects/${route.params.id}?task=${task._id}`)
}

async function deleteCurrentPage() {
  const current = pageStore.currentPage
  if (!current) return
  if (!confirm(`Delete "${current.title || 'Untitled'}"? This cannot be undone.`)) return
  try {
    await pageStore.deletePage(current._id)
    router.push(`/projects/${route.params.id}`)
  } catch (err) {
    console.error('Failed to delete page:', err)
  }
}

async function createTaskFromPage() {
  if (isCreatingTask.value) return
  isCreatingTask.value = true
  
  try {
    const projectId = route.params.id
    const pageId = route.params.pageId
    
    await projectStore.createTask({
      title: `Task from "${pageStore.currentPage.title || 'Untitled'}"`,
      projectId,
      pageId,
      columnId: 'todo'
    })
  } catch (err) {
    console.error('Failed to create task:', err)
  } finally {
    isCreatingTask.value = false
  }
}

function handlePageUpdate({ pageId, updates }) {
  if (pageId === pageStore.currentPage?._id) {
    Object.assign(pageStore.currentPage, updates)
    if (updates.title !== undefined) {
      pageTitle.value = updates.title
    }
  }
}

function handleTaskUpdate(task) {
  // Task store handles the update
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(diff / 3600000)
  if (hours < 24) return `${hours}h ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDay(date) {
  return new Date(date).getDate()
}

function formatMonth(date) {
  return new Date(date).toLocaleString('default', { month: 'short' })
}

function applyTemplate(template) {
  if (!pageStore.currentPage) return
  const replace = window.confirm('Replace current content with this template? Click Cancel to insert at the end.')
  const blocks = template.blocks.map(block => ({
    id: window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).slice(2),
    type: block.type,
    content: block.content || '',
    checked: block.type === 'todo' ? false : undefined
  }))
  const current = pageStore.currentPage.content || []
  const next = replace ? blocks : [...current, ...blocks]
  updatePage({ content: next })
  showTemplateMenu.value = false
}

async function duplicatePage() {
  const current = pageStore.currentPage
  if (!current) return
  try {
    const page = await pageStore.createPage({
      project: current.project?._id || current.project,
      parent: current.parent?._id || current.parent || null,
      title: `${current.title || 'Untitled'} copy`,
      icon: current.icon || '📄',
      cover: current.cover || null,
      content: current.content || []
    })
    router.push(`/projects/${route.params.id}/pages/${page._id}`)
  } catch (err) {
    console.error('Failed to duplicate page:', err)
  }
}
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: var(--space-4);
  color: var(--text-muted);
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-subtle);
  border-top-color: var(--primary-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Breadcrumbs */
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin-bottom: var(--space-6);
  font-size: 14px;
}

.activity-toggle {
  margin-left: 0;
}

.page-delete-btn {
  margin-left: auto;
}

.crumb-link {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--text-secondary);
  text-decoration: none;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  transition: all 0.15s ease;
}

.crumb-link:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.crumb-current {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--text-primary);
  font-weight: 500;
  padding: var(--space-1) var(--space-2);
}

.crumb-icon {
  font-size: 14px;
}

.crumb-name {
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.crumb-separator {
  width: 12px;
  height: 12px;
  color: var(--text-muted);
}

/* Cover Image */
.cover-image {
  width: 100%;
  height: 200px;
  background-size: cover;
  background-position: center;
  border-radius: var(--radius-xl);
  margin-bottom: var(--space-6);
  position: relative;
}

.cover-change {
  position: absolute;
  top: var(--space-3);
  left: var(--space-3);
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-size: 12px;
  cursor: pointer;
}

.cover-remove {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: white;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.cover-image:hover .cover-remove {
  opacity: 1;
}

.cover-remove svg {
  width: 16px;
  height: 16px;
}

/* Page Layout */
.page-content-wrapper {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: var(--space-8);
}

.page-content-wrapper.activity-hidden {
  grid-template-columns: 1fr;
}

@media (max-width: 1024px) {
  .page-content-wrapper {
    grid-template-columns: 1fr;
  }
  
  .page-sidebar {
    display: none;
  }
}

.page-main {
  min-width: 0;
}

.page-sidebar {
  position: sticky;
  top: var(--space-4);
  height: fit-content;
}

.activity-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) 0 var(--space-5);
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: var(--space-6);
  font-weight: 600;
}

.activity-reopen {
  position: sticky;
  top: var(--space-4);
  align-self: flex-start;
  margin-left: auto;
}

/* Online Users */
.online-users-bar {
  margin-bottom: var(--space-4);
  padding: var(--space-2);
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
}

/* Page Content */
.page-content {
  position: relative;
}

.page-meta-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.meta-btn {
  padding: 6px 10px;
  font-size: 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.meta-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.template-menu {
  position: relative;
  margin-bottom: var(--space-4);
}

.template-panel {
  max-width: 420px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--space-3);
}

.template-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  margin-bottom: var(--space-3);
}

.template-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.template-item {
  text-align: left;
  padding: var(--space-3);
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
}

.template-item:hover {
  background: var(--bg-hover);
  border-color: var(--border-default);
}

.template-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.template-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.page-icon-container {
  margin-bottom: var(--space-4);
}

.page-icon-btn {
  width: 64px;
  height: 64px;
  font-size: 40px;
  background: transparent;
  border: 1px dashed var(--border-default);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-icon-btn:hover {
  background: var(--bg-hover);
  border-color: var(--border-hover);
}

.page-icon-btn.empty {
  font-size: 20px;
  color: var(--text-muted);
}

/* Icon Picker Modal */
.icon-picker-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.icon-picker-content {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  min-width: 320px;
  max-width: 400px;
  max-height: 400px;
  overflow: auto;
}

.icon-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.icon-picker-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.icon-picker-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--space-2);
}

.remove-icon-btn {
  font-size: 12px;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: var(--radius-sm);
}

.remove-icon-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
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
  color: var(--text-secondary);
}

.close-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.close-btn svg {
  width: 16px;
  height: 16px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: var(--space-1);
}

.icon-option {
  width: 36px;
  height: 36px;
  font-size: 20px;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.icon-option:hover {
  background: var(--bg-hover);
}

/* Page Title */
.page-title {
  width: 100%;
  font-size: 40px;
  font-weight: 700;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  margin-bottom: var(--space-1);
  padding: 0;
  line-height: 1.1;
  letter-spacing: -0.01em;
}

.page-title::placeholder {
  color: var(--text-placeholder);
}

/* Editor */
.editor-wrapper {
  margin-bottom: var(--space-12);
}

/* Page Sections */
.page-section {
  margin-top: var(--space-8);
  padding-top: var(--space-6);
  border-top: 1px solid var(--border-subtle);
}

.backlinks-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.backlink-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  text-decoration: none;
  transition: all 0.15s ease;
}

.backlink-item:hover {
  background: var(--bg-hover);
  border-color: var(--border-default);
}

.backlink-title {
  font-size: 14px;
  color: var(--text-primary);
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.section-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-500);
  color: white;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
}

.task-count {
  font-size: 13px;
  color: var(--text-secondary);
  background: var(--bg-tertiary);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

/* Page Tasks */
.page-tasks {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.task-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.15s ease;
}

.task-item:hover {
  background: var(--bg-hover);
  border-color: var(--border-default);
}

.task-status {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-default);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.task-status.done {
  background: var(--success-500);
  border-color: var(--success-500);
  color: white;
}

.task-status svg {
  width: 12px;
  height: 12px;
}

.task-title {
  flex: 1;
  font-size: 14px;
  color: var(--text-primary);
}

.task-priority {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-weight: 500;
  text-transform: uppercase;
}

.task-priority.low {
  background: var(--success-500-20);
  color: var(--success-500);
}

.task-priority.medium {
  background: var(--primary-500-20);
  color: var(--primary-500);
}

.task-priority.high {
  background: var(--warning-500-20);
  color: var(--warning-500);
}

.task-priority.urgent {
  background: var(--danger-500-20);
  color: var(--danger-500);
}

.add-task-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: transparent;
  border: 1px dashed var(--border-default);
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.add-task-btn:hover {
  background: var(--bg-hover);
  border-color: var(--border-hover);
  color: var(--text-primary);
}

.add-task-btn svg {
  width: 16px;
  height: 16px;
}

/* Calendar Events */
.calendar-events {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.event-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.15s ease;
}

.event-item:hover {
  background: var(--bg-hover);
  border-color: var(--border-default);
}

.event-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--primary-500);
  color: white;
  border-radius: var(--radius-md);
}

.event-day {
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
}

.event-month {
  font-size: 10px;
  text-transform: uppercase;
  opacity: 0.9;
}

.event-title {
  flex: 1;
  font-size: 14px;
  color: var(--text-primary);
}

/* Comments Section */
.comments-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
  max-height: 400px;
  overflow-y: auto;
}

.comment-item {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--bg-primary);
  border-radius: var(--radius-md);
}

.comment-item.resolved {
  opacity: 0.6;
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}

.comment-header strong {
  font-size: 13px;
  color: var(--text-primary);
}

.comment-header time {
  font-size: 11px;
  color: var(--text-tertiary);
}

.comment-text {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 var(--space-2) 0;
  line-height: 1.5;
}

.comment-actions {
  display: flex;
  gap: var(--space-2);
}

.resolve-btn {
  padding: var(--space-1) var(--space-3);
  background: transparent;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.resolve-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.resolved-badge {
  font-size: 12px;
  color: var(--success-500);
}

.comment-replies {
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.reply-item {
  padding: var(--space-2);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  font-size: 13px;
}

.reply-item strong {
  color: var(--text-primary);
  font-size: 12px;
}

.reply-item p {
  color: var(--text-secondary);
  margin: var(--space-1) 0 0 0;
}

.reply-input {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.reply-input input {
  flex: 1;
  padding: var(--space-2);
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 13px;
}

.reply-input button {
  padding: var(--space-2) var(--space-3);
  background: var(--primary-500);
  border: none;
  border-radius: var(--radius-md);
  color: white;
  font-size: 12px;
  cursor: pointer;
}

.no-comments {
  text-align: center;
  padding: var(--space-6);
  color: var(--text-tertiary);
  font-size: 14px;
}

.new-comment {
  display: flex;
  gap: var(--space-2);
  padding-top: var(--space-3);
  border-top: 1px solid var(--border-subtle);
}

.new-comment input {
  flex: 1;
  padding: var(--space-3);
  background: var(--bg-primary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 14px;
}

.new-comment input::placeholder {
  color: var(--text-tertiary);
}

.btn-primary {
  padding: var(--space-3) var(--space-4);
  background: var(--primary-500);
  border: none;
  border-radius: var(--radius-md);
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: var(--text-muted);
  font-size: 16px;
}
</style>
