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
        </div>

        <!-- Cover Image -->
        <div v-if="pageStore.currentPage.cover" class="cover-image" :style="{ backgroundImage: `url(${pageStore.currentPage.cover})` }">
          <button class="cover-remove" @click="updatePage({ cover: null })">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="page-content">
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

          <!-- Page Title -->
          <input
            ref="titleRef"
            v-model="pageTitle"
            class="page-title"
            placeholder="Untitled"
            @blur="updateTitle"
            @keydown.enter.prevent="blurTitle"
          />

          <!-- Block Editor -->
          <div class="editor-wrapper">
            <BlockEditor
              :initial-blocks="pageStore.currentPage.content"
              @update="updateContent"
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
        </div>
      </template>

      <div v-else class="error">
        Page not found
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePageStore } from '../stores/page'
import { useProjectStore } from '../stores/project'
import { useSocketStore } from '../stores/socket'
import { useThemeStore } from '../stores/theme'
import Layout from '../components/Layout.vue'
import BlockEditor from '../components/BlockEditor.vue'

const route = useRoute()
const router = useRouter()
const pageStore = usePageStore()
const projectStore = useProjectStore()
const socketStore = useSocketStore()
const themeStore = useThemeStore()

const titleRef = ref(null)
const pageTitle = ref('')
const showIconPicker = ref(false)
const isCreatingTask = ref(false)

const commonIcons = [
  '📄', '📝', '📋', '📑', '📂', '📁', '📊', '📈',
  '✅', '⚡', '💡', '🔥', '⭐', '📌', '📍', '🔔',
  '🎨', '🎬', '🎵', '📸', '🎮', '⚽', '🏆', '🎯',
  '💼', '💰', '💳', '📞', '✉️', '📦', '🎁', '🚀',
  '🏠', '📍', '🗺️', '🌍', '🌟', '☀️', '🌙', '⚙️',
  '🔒', '🔑', '🔍', '💻', '📱', '🖥️', '📡', '🔗'
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

onMounted(async () => {
  const { id: projectId, pageId } = route.params
  
  if (pageId) {
    await loadPage(pageId)
    // Load tasks for this project
    await projectStore.fetchProject(projectId)
  }
  
  // Setup socket listeners for real-time updates
  socketStore.on('page_updated', handlePageUpdate)
  socketStore.on('task_updated', handleTaskUpdate)
})

watch(() => route.params.pageId, async (newPageId) => {
  if (newPageId) {
    await loadPage(newPageId)
    await projectStore.fetchProject(route.params.id)
  }
})

async function loadPage(pageId) {
  try {
    await pageStore.fetchPage(pageId)
    await pageStore.fetchBreadcrumb(pageId)
    pageTitle.value = pageStore.currentPage?.title || ''
    
    // Auto-focus title for new pages
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
    if (updates.icon) {
      showIconPicker.value = false
    }
    socketStore.emit('page_update', {
      pageId: pageStore.currentPage._id,
      updates
    })
  } catch (err) {
    console.error('Failed to update page:', err)
  }
}

async function updateContent(content) {
  // Debounce content updates
  if (updateContent.timeout) {
    clearTimeout(updateContent.timeout)
  }
  updateContent.timeout = setTimeout(async () => {
    await updatePage({ content })
  }, 1000)
}

function openTask(task) {
  // Open task in project view or task panel
  router.push(`/projects/${route.params.id}?task=${task._id}`)
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

function formatDay(date) {
  return new Date(date).getDate()
}

function formatMonth(date) {
  return new Date(date).toLocaleString('default', { month: 'short' })
}
</script>

<style scoped>
.page-container {
  max-width: 900px;
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

/* Page Content */
.page-content {
  position: relative;
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
  margin-bottom: var(--space-6);
  padding: 0;
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

.error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: var(--text-muted);
  font-size: 16px;
}
</style>
