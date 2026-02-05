<template>
  <Layout>
    <div class="project-container">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>

      <template v-else-if="projectStore.currentProject">
        <!-- Project Header -->
        <header class="project-header">
          <div class="header-main">
            <router-link :to="`/workspaces/${workspaceId}`" class="back-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
              {{ projectStore.currentProject.workspace?.name || 'Back' }}
            </router-link>
            
            <div class="project-title-row">
              <div class="project-identity">
                <div class="project-icon" :style="{ background: projectColor }">
                  {{ projectStore.currentProject.name[0] }}
                </div>
                <div>
                  <h1>{{ projectStore.currentProject.name }}</h1>
                  <p class="project-desc">{{ projectStore.currentProject.description || 'No description' }}</p>
                </div>
              </div>
              
              <div class="project-actions">
                <div class="member-stack">
                  <div 
                    v-for="member in projectStore.currentProject.members?.slice(0, 3)" 
                    :key="member.user._id"
                    class="avatar avatar-sm"
                    :title="member.user.name.first + ' ' + member.user.name.last"
                  >
                    {{ getInitials(member.user.name.first, member.user.name.last) }}
                  </div>
                  <button v-if="projectStore.currentProject.members?.length > 3" class="member-more">
                    +{{ projectStore.currentProject.members.length - 3 }}
                  </button>
                  <button class="btn btn-icon btn-ghost" title="Add member">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </button>
                </div>
                <button class="btn btn-primary" @click="openCreateTask">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  New Task
                </button>
              </div>
            </div>
          </div>

          <!-- View Tabs & Filters -->
          <div class="header-controls">
            <div class="view-tabs">
              <button 
                v-for="view in views" 
                :key="view.id"
                class="tab-btn"
                :class="{ active: currentView === view.id }"
                @click="setView(view.id)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="view.icon"/>
                {{ view.label }}
              </button>
            </div>

            <div class="filters">
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
              <div class="search-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input 
                  v-model="searchQuery" 
                  type="text" 
                  placeholder="Search tasks..."
                />
              </div>
              
              <select v-model="filterStatus" class="filter-select">
                <option value="">All Status</option>
                <option v-for="col in columns" :key="col.id" :value="col.id">{{ col.title }}</option>
              </select>
              
              <select v-model="filterPriority" class="filter-select">
                <option value="">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="progress-section">
            <div class="progress-stats">
              <span class="progress-label">Project Progress</span>
              <span class="progress-value">{{ completedTasks }} / {{ filteredTasks.length }} completed</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: progressPercent + '%', background: projectColor }"
              />
            </div>
          </div>
        </header>

        <!-- Main Content Area -->
        <div class="project-content-wrapper">
          <div class="project-main">
          <!-- Empty State -->
          <div v-if="filteredTasks.length === 0 && currentView !== 'whiteboard'" class="empty-state">
            <div class="empty-illustration">
              <svg viewBox="0 0 120 120" fill="none">
                <circle cx="60" cy="60" r="50" stroke="currentColor" stroke-width="1" opacity="0.2"/>
                <circle cx="60" cy="60" r="35" stroke="currentColor" stroke-width="1" opacity="0.3"/>
                <circle cx="60" cy="60" r="20" fill="currentColor" opacity="0.1"/>
                <path d="M45 60L55 70L75 50" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3>No tasks found</h3>
            <p>Get started by creating your first task for this project.</p>
            <button class="btn btn-primary" @click="openCreateTask">
              Create Task
            </button>
          </div>

          <!-- List View -->
          <div v-else-if="currentView === 'list'" class="task-list">
            <div class="list-header">
              <span class="col-status">Status</span>
              <span class="col-task">Task</span>
              <span class="col-assignee">Assignee</span>
              <span class="col-priority">Priority</span>
              <span class="col-due">Due Date</span>
            </div>
            
            <div class="list-content">
              <div 
                v-for="task in filteredTasks" 
                :key="task._id"
                class="task-row"
                :class="{ selected: selectedTask?._id === task._id }"
                @click="selectTask(task)"
              >
                <div class="col-status">
                  <span class="status-pill" :style="{ background: getColumnColor(task.columnId) + '20', color: getColumnColor(task.columnId) }">
                    {{ getColumnName(task.columnId) }}
                  </span>
                </div>
                
                <div class="col-task">
                  <span class="task-title">{{ task.title }}</span>
                  <div v-if="task.labels?.length" class="task-labels">
                    <span 
                      v-for="label in task.labels.slice(0, 2)" 
                      :key="label.name"
                      class="mini-label"
                      :style="{ background: label.color }"
                    >
                      {{ label.name }}
                    </span>
                  </div>
                </div>
                
                <div class="col-assignee">
                  <div v-if="task.assignees?.length" class="assignee-group">
                    <div 
                      v-for="assignee in task.assignees.slice(0, 2)" 
                      :key="assignee._id"
                      class="avatar avatar-sm"
                      :title="assignee.name.first + ' ' + assignee.name.last"
                    >
                      {{ getInitials(assignee.name.first, assignee.name.last) }}
                    </div>
                    <span v-if="task.assignees.length > 2" class="more">+{{ task.assignees.length - 2 }}</span>
                  </div>
                  <span v-else class="unassigned">—</span>
                </div>
                
                <div class="col-priority">
                  <span class="priority-dot" :class="task.priority"></span>
                  <span class="priority-text">{{ task.priority }}</span>
                </div>
                
                <div class="col-due">
                  <span :class="{ overdue: isOverdue(task.dueDate, timeZone) }">
                    {{ task.dueDate ? formatDate(task.dueDate, timeZone) : '—' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Board View (Compact) -->
          <div v-else-if="currentView === 'board'" class="board-view">
            <div 
              v-for="column in columns" 
              :key="column.id"
              class="board-column"
              :class="{ 'drag-over': dragOverColumn === column.id }"
              @dragover.prevent="handleColumnDragOver($event, column.id)"
              @dragleave="handleColumnDragLeave"
              @drop="handleColumnDrop($event, column.id)"
            >
              <div class="column-header" :style="{ borderColor: column.color }">
                <div class="column-title">
                  <span class="dot" :style="{ background: column.color }"></span>
                  {{ column.title }}
                </div>
                <span class="count">{{ getTasksByColumn(column.id).length }}</span>
              </div>
              
              <div class="column-tasks">
                <div
                  v-for="task in getTasksByColumn(column.id)"
                  :key="task._id"
                  class="board-card"
                  :class="{ selected: selectedTask?._id === task._id, dragging: draggingTask === task._id }"
                  @click="selectTask(task)"
                  draggable="true"
                  @dragstart="handleDragStart($event, task)"
                  @dragend="handleDragEnd"
                >
                  <div class="card-top">
                    <span class="priority-indicator" :class="task.priority"></span>
                    <span v-if="task.dueDate" class="due-badge" :class="{ overdue: isOverdue(task.dueDate, timeZone) }">
                      {{ formatShortDate(task.dueDate, timeZone) }}
                    </span>
                  </div>
                  <p class="card-title">{{ task.title }}</p>
                  <div class="card-bottom">
                    <div v-if="task.assignees?.length" class="card-assignees">
                      <div 
                        v-for="assignee in task.assignees.slice(0, 2)" 
                        :key="assignee._id"
                        class="avatar avatar-sm"
                      >
                        {{ getInitials(assignee.name.first, assignee.name.last) }}
                      </div>
                    </div>
                    <div class="card-meta">
                      <span v-if="task.comments?.length">💬 {{ task.comments.length }}</span>
                      <span v-if="task.subtasks?.length">☑️ {{ task.subtasks.filter(s => s.completed).length }}/{{ task.subtasks.length }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <button class="add-card-btn" @click="openCreateTaskForColumn(column.id)">
                + Add task
              </button>
            </div>
          </div>

          <!-- Timeline View -->
          <TimelineView
            v-else-if="currentView === 'timeline'"
            :tasks="filteredTasks"
            :columns="columns"
            :selected-task="selectedTask"
            @select-task="selectTask"
            @update-task="updateTask"
          />
          
          <!-- Whiteboard View -->
          <div v-else-if="currentView === 'whiteboard'" class="whiteboard-view">
            <Whiteboard
              :initial-elements="whiteboardElements"
              @update="updateWhiteboard"
              @element-add="addWhiteboardElement"
              @element-update="updateWhiteboardElement"
              @element-delete="deleteWhiteboardElement"
            />
            <LiveCursors class="whiteboard-cursors" />
          </div>
          </div>
          
          <!-- Activity Feed Sidebar -->
          <aside class="project-sidebar" v-if="currentView !== 'whiteboard' && showActivity">
            <div class="activity-header">
              <span>Activity</span>
              <button class="btn btn-icon btn-ghost" type="button" @click="showActivity = false" title="Hide activity">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <ActivityFeed
              :activities="collaborationStore.activities"
              :compact="true"
              :limit="15"
              @load-more="loadMoreActivities"
            />
          </aside>
          <button
            v-if="currentView !== 'whiteboard' && !showActivity"
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

      <!-- Task Detail Slide-out Panel -->
      <Transition name="fade">
        <div 
          v-if="selectedTask" 
          class="panel-overlay"
          @click="selectedTask = null"
        ></div>
      </Transition>

      <Transition name="slide">
        <TaskPanel
          v-if="selectedTask"
          :task="selectedTask"
          :columns="columns"
          @close="selectedTask = null"
          @update="updateTask"
          @delete="deleteTask"
        />
      </Transition>

      <!-- Create Task Modal (Simple) -->
      <div v-if="showCreateTask" class="modal-overlay" @click.self="showCreateTask = false">
        <div class="modal modal-sm">
          <div class="modal-header">
            <h3>Create Task</h3>
            <button class="btn btn-icon btn-ghost" @click="showCreateTask = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <form @submit.prevent="createTask">
            <div class="form-group">
              <input 
                v-model="newTask.title" 
                type="text" 
                class="form-input form-input-lg"
                placeholder="What needs to be done?"
                required
                autofocus
              />
            </div>
            <div class="form-row">
              <select v-model="newTask.columnId" class="form-select">
                <option v-for="col in columns" :key="col.id" :value="col.id">{{ col.title }}</option>
              </select>
              <select v-model="newTask.priority" class="form-select">
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-ghost" @click="showCreateTask = false">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="creating">
                {{ creating ? 'Creating...' : 'Create Task' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Layout from '../components/Layout.vue'
import TaskPanel from '../components/TaskPanel.vue'
import TimelineView from '../components/TimelineView.vue'
import Whiteboard from '../components/Whiteboard.vue'
import ActivityFeed from '../components/ActivityFeed.vue'
import LiveCursors from '../components/LiveCursors.vue'
import { useProjectStore } from '../stores/project'
import { useSocketStore } from '../stores/socket'
import { useAuthStore } from '../stores/auth'
import { useCollaborationStore } from '../stores/collaboration'
import { formatDate, formatShortDate, getInitials, isOverdue } from '../utils/helpers'
import api from '../utils/api'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const socketStore = useSocketStore()
const authStore = useAuthStore()
const collaborationStore = useCollaborationStore()

const loading = ref(true)
const currentView = ref('list')
const selectedTask = ref(null)
const showCreateTask = ref(false)
const savedActivity = localStorage.getItem('projectActivityVisible')
const showActivity = ref(savedActivity ? JSON.parse(savedActivity) : true)
const creating = ref(false)
const searchQuery = ref('')
const filterStatus = ref('')
const filterPriority = ref('')
const whiteboardElements = ref([])

// Drag and drop state
const draggingTask = ref(null)
const dragOverColumn = ref(null)

const views = [
  { 
    id: 'list', 
    label: 'List',
    icon: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>'
  },
  { 
    id: 'board', 
    label: 'Board',
    icon: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>'
  },
  { 
    id: 'timeline', 
    label: 'Timeline',
    icon: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 12h8"/>'
  },
  { 
    id: 'whiteboard', 
    label: 'Whiteboard',
    icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><circle cx="15.5" cy="15.5" r="1.5"/>'
  }
]

const newTask = ref({
  title: '',
  columnId: 'todo',
  priority: 'medium'
})

const workspaceId = computed(() => projectStore.currentProject?.workspace?._id)

const columns = computed(() => projectStore.currentProject?.columns || [])
const timeZone = computed(() => authStore.userTimezone)

const projectColor = computed(() => {
  const colors = ['#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981']
  const name = projectStore.currentProject?.name || ''
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
})

const filteredTasks = computed(() => {
  let tasks = projectStore.tasks.filter(t => !t.isArchived)
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    tasks = tasks.filter(t => t.title.toLowerCase().includes(q))
  }
  
  if (filterStatus.value) {
    tasks = tasks.filter(t => t.columnId === filterStatus.value)
  }
  
  if (filterPriority.value) {
    tasks = tasks.filter(t => t.priority === filterPriority.value)
  }
  
  return tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const completedTasks = computed(() => {
  const doneColumn = columns.value.find(c => c.id === 'done' || c.title.toLowerCase().includes('done'))
  if (!doneColumn) return 0
  return filteredTasks.value.filter(t => t.columnId === doneColumn.id).length
})

const progressPercent = computed(() => {
  if (filteredTasks.value.length === 0) return 0
  return Math.round((completedTasks.value / filteredTasks.value.length) * 100)
})

function getTasksByColumn(columnId) {
  return filteredTasks.value
    .filter(t => t.columnId === columnId)
    .sort((a, b) => a.order - b.order)
}

function getColumnName(columnId) {
  return columns.value.find(c => c.id === columnId)?.title || columnId
}

function getColumnColor(columnId) {
  return columns.value.find(c => c.id === columnId)?.color || '#8b5cf6'
}

onMounted(async () => {
  // Set view from URL query if present
  if (route.query.view && ['list', 'board', 'timeline', 'whiteboard'].includes(route.query.view)) {
    currentView.value = route.query.view
  }
  await projectStore.fetchProject(route.params.id)
  await loadActivities()
  socketStore.joinProject(route.params.id)
  collaborationStore.joinRoom('project', route.params.id, {
    _id: authStore.user?._id,
    name: authStore.userName,
    initials: authStore.userInitials
  })
  setupSocketListeners()
  loading.value = false
})

onUnmounted(() => {
  socketStore.leaveProject(route.params.id)
  collaborationStore.leaveRoom()
  removeSocketListeners()
})

// Watch for view changes in URL
watch(() => route.query.view, (newView) => {
  if (newView && ['list', 'board', 'timeline'].includes(newView)) {
    currentView.value = newView
  }
})

function setView(viewId) {
  currentView.value = viewId
  // Update URL without reloading
  router.replace({ query: { ...route.query, view: viewId } })
}

function toggleActivity() {
  showActivity.value = !showActivity.value
  localStorage.setItem('projectActivityVisible', JSON.stringify(showActivity.value))
}

function setupSocketListeners() {
  socketStore.on('task-created', (task) => projectStore.addTaskToState(task))
  socketStore.on('task-updated', (task) => projectStore.updateTaskInState(task))
  socketStore.on('task-deleted', ({ taskId }) => projectStore.removeTaskFromState(taskId))
  
  // Whiteboard real-time updates
  socketStore.on('whiteboard-element-added', ({ element }) => {
    whiteboardElements.value.push(element)
  })
  socketStore.on('whiteboard-element-updated', ({ elementId, updates }) => {
    const el = whiteboardElements.value.find(e => e.id === elementId)
    if (el) Object.assign(el, updates)
  })
  socketStore.on('whiteboard-element-deleted', ({ elementId }) => {
    whiteboardElements.value = whiteboardElements.value.filter(e => e.id !== elementId)
  })
}

// Whiteboard functions
function updateWhiteboard(elements) {
  whiteboardElements.value = elements
}

function addWhiteboardElement(element) {
  socketStore.emit('whiteboard-element-add', {
    whiteboardId: route.params.id,
    element
  })
}

function updateWhiteboardElement({ elementId, updates }) {
  socketStore.emit('whiteboard-element-update', {
    whiteboardId: route.params.id,
    elementId,
    updates
  })
}

function deleteWhiteboardElement(elementId) {
  socketStore.emit('whiteboard-element-delete', {
    whiteboardId: route.params.id,
    elementId
  })
}

// Activity feed
async function loadActivities() {
  try {
    const { data } = await api.get(`/activities/project/${route.params.id}?limit=20`)
    collaborationStore.setActivities(data)
  } catch (err) {
    console.error('Failed to load activities:', err)
  }
}

async function loadMoreActivities() {
  // Load more with pagination
}

function removeSocketListeners() {
  socketStore.off('task-created')
  socketStore.off('task-updated')
  socketStore.off('task-deleted')
}

function selectTask(task) {
  selectedTask.value = task
}

function openCreateTask() {
  newTask.value = { title: '', columnId: columns.value[0]?.id || 'todo', priority: 'medium' }
  showCreateTask.value = true
}

function openCreateTaskForColumn(columnId) {
  newTask.value = { title: '', columnId, priority: 'medium' }
  showCreateTask.value = true
}

async function createTask() {
  if (!newTask.value.title.trim()) return
  creating.value = true
  try {
    await projectStore.createTask({
      title: newTask.value.title,
      projectId: route.params.id,
      columnId: newTask.value.columnId,
      priority: newTask.value.priority
    })
    showCreateTask.value = false
    newTask.value = { title: '', columnId: 'todo', priority: 'medium' }
  } finally {
    creating.value = false
  }
}

async function updateTask(taskId, updates) {
  await projectStore.updateTask(taskId, updates)
}

async function deleteTask(taskId) {
  await projectStore.deleteTask(taskId)
  if (selectedTask.value?._id === taskId) {
    selectedTask.value = null
  }
}

// Drag & Drop
function handleDragStart(e, task) {
  draggingTask.value = task._id
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('taskId', task._id)
  e.dataTransfer.setData('sourceColumnId', task.columnId)
}

function handleDragEnd() {
  draggingTask.value = null
  dragOverColumn.value = null
}

function handleColumnDragOver(e, columnId) {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
  dragOverColumn.value = columnId
}

function handleColumnDragLeave() {
  dragOverColumn.value = null
}

async function handleColumnDrop(e, targetColumnId) {
  e.preventDefault()
  dragOverColumn.value = null
  
  const taskId = e.dataTransfer.getData('taskId')
  const sourceColumnId = e.dataTransfer.getData('sourceColumnId')
  
  if (!taskId || sourceColumnId === targetColumnId) {
    draggingTask.value = null
    return
  }
  
  try {
    const columnTasks = getTasksByColumn(targetColumnId)
    await projectStore.moveTask(taskId, targetColumnId, columnTasks.length)
  } catch (err) {
    console.error('Failed to move task:', err)
  } finally {
    draggingTask.value = null
  }
}
</script>

<style scoped>
.project-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.project-header {
  flex-shrink: 0;
  padding: var(--space-6) var(--space-8) 0;
}

.header-main {
  margin-bottom: var(--space-6);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-tertiary);
  text-decoration: none;
  font-size: 0.875rem;
  margin-bottom: var(--space-4);
  transition: color 0.2s;
}

.back-link:hover {
  color: var(--text-secondary);
}

.back-link svg {
  width: 16px;
  height: 16px;
}

.project-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-6);
}

.project-identity {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.project-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  box-shadow: var(--shadow-md);
}

.project-identity h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: var(--space-1);
}

.project-desc {
  color: var(--text-secondary);
  font-size: 0.9375rem;
}

.project-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.member-stack {
  display: flex;
  align-items: center;
}

.member-stack .avatar {
  margin-left: -8px;
  border: 2px solid var(--bg-primary);
}

.member-stack .avatar:first-child {
  margin-left: 0;
}

.member-more {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  border: 2px solid var(--bg-primary);
  color: var(--text-secondary);
  font-size: 0.6875rem;
  font-weight: 600;
  margin-left: -8px;
  cursor: pointer;
}

.project-actions .btn svg {
  width: 18px;
  height: 18px;
}

.header-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) 0;
  border-top: 1px solid var(--border-subtle);
  border-bottom: 1px solid var(--border-subtle);
}

.view-tabs {
  display: flex;
  gap: var(--space-1);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn svg {
  width: 16px;
  height: 16px;
}

.tab-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.tab-btn.active {
  background: var(--bg-tertiary);
  border-color: var(--border-default);
  color: var(--text-primary);
}

.filters {
  display: flex;
  gap: var(--space-3);
  align-items: center;
}

.search-box {
  position: relative;
}

.search-box svg {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--text-tertiary);
}

.search-box input {
  width: 240px;
  padding: var(--space-2) var(--space-3) var(--space-2) var(--space-8);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 0.875rem;
}

.search-box input:focus {
  outline: none;
  border-color: var(--primary-500);
}

.filter-select {
  padding: var(--space-2) var(--space-3);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
}

.progress-section {
  margin-top: var(--space-4);
  margin-bottom: var(--space-6);
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.progress-label {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.progress-value {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-primary);
}

.progress-bar {
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.5s ease;
}

.project-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; 
  padding: 0 var(--space-8) var(--space-6);
  overflow: hidden;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16);
  text-align: center;
  flex: 1;
}

.empty-illustration {
  width: 120px;
  height: 120px;
  color: var(--text-tertiary);
  margin-bottom: var(--space-6);
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: var(--space-2);
  color: var(--text-primary);
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
}

/* Task List View */
.task-list {
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.list-header {
  display: grid;
  grid-template-columns: 120px 1fr 100px 100px 120px;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-5);
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-subtle);
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.list-content {
  overflow-y: auto;
  flex: 1;
}

.task-row {
  display: grid;
  grid-template-columns: 120px 1fr 100px 100px 120px;
  gap: var(--space-4);
  align-items: center;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border-subtle);
  cursor: pointer;
  transition: all 0.15s ease;
}

.task-row:last-child {
  border-bottom: none;
}

.task-row:hover {
  background: var(--bg-tertiary);
}

.task-row.selected {
  background: var(--primary-500-alpha-10, rgba(139, 92, 246, 0.1));
}

.col-status {
  display: flex;
  align-items: center;
}

.status-pill {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
}

.col-task {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.task-title {
  font-weight: 500;
  color: var(--text-primary);
}

.task-labels {
  display: flex;
  gap: var(--space-1);
}

.mini-label {
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: 0.625rem;
  font-weight: 600;
  color: white;
}

.col-assignee {
  display: flex;
  align-items: center;
}

.assignee-group {
  display: flex;
  align-items: center;
}

.assignee-group .avatar {
  margin-left: -6px;
  border: 2px solid var(--bg-secondary);
}

.assignee-group .avatar:first-child {
  margin-left: 0;
}

.more {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-left: var(--space-2);
}

.unassigned {
  color: var(--text-tertiary);
}

.col-priority {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  text-transform: capitalize;
  font-size: 0.875rem;
}

.priority-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.priority-dot.urgent { background: var(--accent-rose); }
.priority-dot.high { background: var(--accent-amber); }
.priority-dot.medium { background: var(--primary-500); }
.priority-dot.low { background: var(--accent-emerald); }

.col-due {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.col-due .overdue {
  color: var(--accent-rose);
}

/* Board View */
.board-view {
  display: flex;
  gap: var(--space-4);
  overflow-x: auto;
  padding-bottom: var(--space-2);
  height: 100%;
}

.board-column {
  width: 280px;
  flex-shrink: 0;
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: all 0.2s ease;
}

.board-column.drag-over {
  border-color: var(--primary-500);
  background: var(--primary-500-alpha-05, rgba(139, 92, 246, 0.05));
  box-shadow: 0 0 0 2px var(--primary-500-alpha-30, rgba(139, 92, 246, 0.3));
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  border-bottom: 2px solid;
  flex-shrink: 0;
}

.column-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: 600;
  font-size: 0.9375rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.count {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  background: var(--bg-tertiary);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.column-tasks {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.board-card {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  cursor: pointer;
  transition: all 0.2s ease;
}

.board-card:hover {
  border-color: var(--border-strong);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.board-card.selected {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 2px var(--primary-500-alpha-30, rgba(139, 92, 246, 0.3));
}

.board-card.dragging {
  opacity: 0.5;
  transform: rotate(2deg);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.priority-indicator {
  width: 4px;
  height: 16px;
  border-radius: var(--radius-full);
}

.priority-indicator.urgent { background: var(--accent-rose); }
.priority-indicator.high { background: var(--accent-amber); }
.priority-indicator.medium { background: var(--primary-500); }
.priority-indicator.low { background: var(--accent-emerald); }

.due-badge {
  font-size: 0.6875rem;
  padding: 2px 6px;
  background: var(--bg-elevated);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  transition: all 0.2s;
}

.due-badge:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.due-badge.overdue {
  background: var(--accent-rose-alpha-15, rgba(244, 63, 94, 0.15));
  color: var(--accent-rose);
}

.card-title {
  font-size: 0.9375rem;
  font-weight: 500;
  margin-bottom: var(--space-4);
  line-height: 1.4;
}

.card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-assignees {
  display: flex;
}

.card-assignees .avatar {
  margin-left: -6px;
  border: 2px solid var(--bg-tertiary);
}

.card-assignees .avatar:first-child {
  margin-left: 0;
}

.card-meta {
  display: flex;
  gap: var(--space-3);
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.add-card-btn {
  margin: var(--space-3);
  padding: var(--space-3);
  background: transparent;
  border: 1px dashed var(--border-default);
  border-radius: var(--radius-md);
  color: var(--text-tertiary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.add-card-btn:hover {
  border-color: var(--primary-500);
  color: var(--primary-400);
  background: rgba(139, 92, 246, 0.05);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay-bg, rgba(0, 0, 0, 0.6));
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 480px;
  box-shadow: var(--shadow-lg);
}

.modal-sm {
  max-width: 420px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-5) var(--space-6) var(--space-4);
}

.modal-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
}

.modal form {
  padding: 0 var(--space-6) var(--space-6);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.form-input-lg {
  font-size: 1.125rem;
  padding: var(--space-4);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-subtle);
}

/* Slide Panel Animation */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

/* Panel Overlay */
.panel-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay-bg-light, rgba(0, 0, 0, 0.4));
  backdrop-filter: blur(2px);
  z-index: 150; /* Below panel (z-index: 200 in TaskPanel) */
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Whiteboard View */
.whiteboard-view {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
  height: calc(100vh - 220px);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
}

.whiteboard-cursors {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 100;
}

/* Project Content Wrapper */
.project-content-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.project-main {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  padding: 0 var(--space-8) var(--space-6);
}

/* Project Sidebar (Activity Feed) */
.project-sidebar {
  width: 280px;
  flex-shrink: 0;
  padding: var(--space-6);
  overflow-y: auto;
  border-left: 1px solid var(--border-subtle);
}

.activity-toggle {
  margin-right: var(--space-2);
}

.activity-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) 0 var(--space-5);
  font-weight: 600;
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: var(--space-6);
}

.activity-reopen {
  position: sticky;
  top: var(--space-4);
  align-self: flex-start;
  margin-left: auto;
  margin-right: var(--space-6);
}

@media (max-width: 1200px) {
  .project-sidebar {
    display: none;
  }
}
</style>
