<template>
  <Layout>
    <div class="tasks-page">
      <header class="page-header">
        <div class="header-content">
          <h1>All Tasks</h1>
          <p class="subtitle">View and manage all your tasks across workspaces</p>
        </div>
        <div class="header-actions">
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
          <button class="btn btn-primary" @click="showCreateModal = true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Task
          </button>
        </div>
      </header>

      <!-- Filters -->
      <div class="filters-bar">
        <div class="filter-group">
          <label>Status</label>
          <select v-model="filterStatus">
            <option value="">All</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Priority</label>
          <select v-model="filterPriority">
            <option value="">All</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Workspace</label>
          <select v-model="filterWorkspace">
            <option value="">All</option>
            <option v-for="ws in workspaceStore.workspaces" :key="ws._id" :value="ws._id">
              {{ ws.name }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label>Project</label>
          <select v-model="filterProject">
            <option value="">All</option>
            <option v-for="proj in filteredProjects" :key="proj._id" :value="proj._id">
              {{ proj.name }}
            </option>
          </select>
        </div>
        <button v-if="hasActiveFilters" class="btn btn-ghost btn-sm" @click="clearFilters">
          Clear filters
        </button>
      </div>

      <!-- Stats Cards -->
      <div v-if="!loading && allTasks.length > 0" class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon total">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ allTasks.length }}</span>
            <span class="stat-label">Total Tasks</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon todo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ tasksByStatus.todo || 0 }}</span>
            <span class="stat-label">To Do</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon in-progress">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ tasksByStatus['in-progress'] || 0 }}</span>
            <span class="stat-label">In Progress</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon done">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ tasksByStatus.done || 0 }}</span>
            <span class="stat-label">Done</span>
          </div>
        </div>
        <div class="stat-card" :class="{ 'has-overdue': overdueCount > 0 }">
          <div class="stat-icon overdue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ overdueCount }}</span>
            <span class="stat-label">Overdue</span>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading tasks...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredTasks.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
        </div>
        <h3>No tasks found</h3>
        <p v-if="hasActiveFilters">Try adjusting your filters or search query.</p>
        <p v-else>You don't have any tasks yet. Create your first task to get started.</p>
        <button v-if="!hasActiveFilters" class="btn btn-primary" @click="showCreateModal = true">
          Create your first task
        </button>
      </div>

      <!-- Tasks List -->
      <div v-else class="tasks-container">
        <div class="tasks-list">
          <div
            v-for="task in filteredTasks"
            :key="task._id"
            class="task-card"
            :class="{ 'has-due-date': task.dueDate, 'is-overdue': isOverdue(task) }"
            @click="openTask(task)"
          >
            <div class="task-main">
              <div class="task-status">
                <button
                  class="status-checkbox"
                  :class="task.columnId"
                  @click.stop="toggleTaskStatus(task)"
                >
                  <svg v-if="task.columnId === 'done'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </button>
              </div>
              <div class="task-content">
                <h4 class="task-title">{{ task.title }}</h4>
                <div class="task-meta">
                  <span class="project-badge" :style="{ background: getProjectColor(task.project) }">
                    {{ getProjectName(task.project) }}
                  </span>
                  <span v-if="task.priority" class="priority-badge" :class="task.priority">
                    {{ task.priority }}
                  </span>
                  <span v-if="task.dueDate" class="due-date" :class="{ overdue: isOverdue(task) }">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {{ formatDate(task.dueDate) }}
                  </span>
                </div>
              </div>
            </div>
            <div class="task-assignees" v-if="task.assignees?.length">
              <div
                v-for="assignee in task.assignees.slice(0, 3)"
                :key="assignee._id"
                class="assignee-avatar"
                :title="assignee.name?.first + ' ' + assignee.name?.last"
              >
                {{ getInitials(assignee.name?.first, assignee.name?.last) }}
              </div>
              <span v-if="task.assignees.length > 3" class="more-assignees">
                +{{ task.assignees.length - 3 }}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Create Task Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
          <Transition name="scale">
            <div v-if="showCreateModal" class="modal">
              <div class="modal-header">
                <h3>Create New Task</h3>
                <button class="btn btn-icon btn-ghost" @click="showCreateModal = false">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <form @submit.prevent="createTask">
                <div class="form-group">
                  <label class="form-label">Task Title</label>
                  <input
                    v-model="newTask.title"
                    type="text"
                    class="form-input"
                    placeholder="What needs to be done?"
                    required
                    autofocus
                  />
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Project</label>
                    <select v-model="newTask.projectId" class="form-select" required>
                      <option value="">Select a project</option>
                      <optgroup v-for="ws in workspaceStore.workspaces" :key="ws._id" :label="ws.name">
                        <option
                          v-for="proj in getWorkspaceProjects(ws._id)"
                          :key="proj._id"
                          :value="proj._id"
                        >
                          {{ proj.name }}
                        </option>
                      </optgroup>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Priority</label>
                    <select v-model="newTask.priority" class="form-select">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Due Date</label>
                  <input
                    v-model="newTask.dueDate"
                    type="date"
                    class="form-input"
                  />
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-ghost" @click="showCreateModal = false">
                    Cancel
                  </button>
                  <button type="submit" class="btn btn-primary" :disabled="creating">
                    {{ creating ? 'Creating...' : 'Create Task' }}
                  </button>
                </div>
              </form>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Layout from '../components/Layout.vue'
import { useWorkspaceStore } from '../stores/workspace'
import { useProjectStore } from '../stores/project'
import api from '../utils/api'

const router = useRouter()
const workspaceStore = useWorkspaceStore()
const projectStore = useProjectStore()

const loading = ref(true)
const allTasks = ref([])
const searchQuery = ref('')
const filterStatus = ref('')
const filterPriority = ref('')
const filterWorkspace = ref('')
const filterProject = ref('')
const showCreateModal = ref(false)
const creating = ref(false)

const newTask = ref({
  title: '',
  projectId: '',
  priority: 'medium',
  dueDate: ''
})

const hasActiveFilters = computed(() => {
  return filterStatus.value || filterPriority.value || filterWorkspace.value || filterProject.value || searchQuery.value
})

const filteredProjects = computed(() => {
  if (!filterWorkspace.value) return projectStore.projects
  return projectStore.projects.filter(p => {
    const wsId = p.workspace?._id || p.workspace
    return wsId === filterWorkspace.value
  })
})

const filteredTasks = computed(() => {
  let tasks = allTasks.value

  // Search filter
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    tasks = tasks.filter(t => t.title.toLowerCase().includes(q))
  }

  // Status filter
  if (filterStatus.value) {
    tasks = tasks.filter(t => t.columnId === filterStatus.value)
  }

  // Priority filter
  if (filterPriority.value) {
    tasks = tasks.filter(t => t.priority === filterPriority.value)
  }

  // Workspace filter
  if (filterWorkspace.value) {
    tasks = tasks.filter(t => {
      const proj = projectStore.projects.find(p => p._id === (t.project?._id || t.project))
      return proj && (proj.workspace?._id || proj.workspace) === filterWorkspace.value
    })
  }

  // Project filter
  if (filterProject.value) {
    tasks = tasks.filter(t => (t.project?._id || t.project) === filterProject.value)
  }

  return tasks.sort((a, b) => {
    // Sort by due date (nulls last), then by priority
    if (a.dueDate && !b.dueDate) return -1
    if (!a.dueDate && b.dueDate) return 1
    if (a.dueDate && b.dueDate) {
      return a.dueDate.localeCompare(b.dueDate)
    }
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
})

const tasksByStatus = computed(() => {
  return allTasks.value.reduce((acc, task) => {
    const status = task.columnId || 'todo'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})
})

const overdueCount = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return allTasks.value.filter(t => {
    return t.dueDate && t.dueDate < today && t.columnId !== 'done'
  }).length
})

onMounted(async () => {
  await Promise.all([
    workspaceStore.fetchWorkspaces(),
    projectStore.fetchProjects(),
    fetchAllTasks()
  ])
})

async function fetchAllTasks() {
  loading.value = true
  try {
    const { data } = await api.get('/tasks')
    allTasks.value = data
  } catch (err) {
    console.error('Failed to fetch tasks:', err)
  } finally {
    loading.value = false
  }
}

function getWorkspaceProjects(workspaceId) {
  return projectStore.projects.filter(p => {
    const pWsId = p.workspace?._id || p.workspace
    return pWsId === workspaceId
  })
}

function getProjectName(projectId) {
  if (!projectId) return 'Unknown'
  const id = projectId._id || projectId
  const proj = projectStore.projects.find(p => p._id === id)
  return proj?.name || 'Unknown'
}

function getProjectColor(projectId) {
  if (!projectId) return '#8b5cf6'
  const id = projectId._id || projectId
  const proj = projectStore.projects.find(p => p._id === id)
  const name = proj?.name || ''
  const colors = ['#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981', '#f43f5e']
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function getInitials(first, last) {
  return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase()
}

function formatDate(dateKey) {
  if (!dateKey) return ''
  const date = new Date(dateKey)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (dateKey === today.toISOString().split('T')[0]) return 'Today'
  if (dateKey === tomorrow.toISOString().split('T')[0]) return 'Tomorrow'

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function isOverdue(task) {
  if (!task.dueDate || task.columnId === 'done') return false
  const today = new Date().toISOString().split('T')[0]
  return task.dueDate < today
}

function openTask(task) {
  const projectId = task.project?._id || task.project
  if (projectId) {
    router.push(`/projects/${projectId}?task=${task._id}`)
  }
}

async function toggleTaskStatus(task) {
  const newStatus = task.columnId === 'done' ? 'todo' : 'done'
  try {
    await api.put(`/tasks/${task._id}`, { columnId: newStatus })
    task.columnId = newStatus
  } catch (err) {
    console.error('Failed to update task:', err)
  }
}

async function createTask() {
  if (!newTask.value.title.trim() || !newTask.value.projectId) return

  creating.value = true
  try {
    await api.post('/tasks', {
      title: newTask.value.title,
      projectId: newTask.value.projectId,
      priority: newTask.value.priority,
      dueDate: newTask.value.dueDate || undefined,
      columnId: 'todo'
    })

    showCreateModal.value = false
    newTask.value = { title: '', projectId: '', priority: 'medium', dueDate: '' }
    await fetchAllTasks()
  } catch (err) {
    console.error('Failed to create task:', err)
  } finally {
    creating.value = false
  }
}

function clearFilters() {
  searchQuery.value = ''
  filterStatus.value = ''
  filterPriority.value = ''
  filterWorkspace.value = ''
  filterProject.value = ''
}
</script>

<style scoped>
.tasks-page {
  padding: var(--space-6) var(--space-8);
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-6);
  gap: var(--space-4);
}

.header-content h1 {
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: var(--space-1);
}

.subtitle {
  color: var(--text-secondary);
  font-size: 0.9375rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
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

.page-header .btn svg {
  width: 16px;
  height: 16px;
}

/* Filters */
.filters-bar {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.filter-group label {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
}

.filter-group select {
  padding: var(--space-2) var(--space-3);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 0.875rem;
  min-width: 140px;
}

.filter-group select:focus {
  outline: none;
  border-color: var(--primary-500);
}

/* Loading & Empty States */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16);
  color: var(--text-tertiary);
}

.loading-state p {
  margin-top: var(--space-3);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16);
  text-align: center;
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: var(--text-tertiary);
  margin-bottom: var(--space-4);
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-state h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: var(--space-2);
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: var(--space-4);
  max-width: 400px;
}

/* Tasks List */
.tasks-container {
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.tasks-list {
  display: flex;
  flex-direction: column;
}

.task-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border-subtle);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.task-card:last-child {
  border-bottom: none;
}

.task-card:hover {
  background: var(--bg-tertiary);
}

.task-card.is-overdue {
  background: var(--accent-rose-alpha-05, rgba(244, 63, 94, 0.05));
}

.task-card.is-overdue:hover {
  background: var(--accent-rose-alpha-10, rgba(244, 63, 94, 0.1));
}

.task-main {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
  min-width: 0;
}

.status-checkbox {
  width: 20px;
  height: 20px;
  border-radius: var(--radius-sm);
  border: 2px solid var(--border-default);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.status-checkbox:hover {
  border-color: var(--primary-500);
}

.status-checkbox.done {
  background: var(--accent-emerald);
  border-color: var(--accent-emerald);
  color: white;
}

.status-checkbox svg {
  width: 12px;
  height: 12px;
}

.task-content {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--space-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-card.is-overdue .task-title {
  color: var(--accent-rose);
}

.task-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.project-badge {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.6875rem;
  font-weight: 600;
  color: white;
}

.priority-badge {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
}

.priority-badge.urgent {
  background: var(--accent-rose-alpha-15, rgba(244, 63, 94, 0.15));
  color: var(--accent-rose);
}

.priority-badge.high {
  background: var(--accent-amber-alpha-15, rgba(245, 158, 11, 0.15));
  color: var(--accent-amber);
}

.priority-badge.medium {
  background: var(--primary-500-alpha-15, rgba(139, 92, 246, 0.15));
  color: var(--primary-500);
}

.priority-badge.low {
  background: var(--accent-emerald-alpha-15, rgba(16, 185, 129, 0.15));
  color: var(--accent-emerald);
}

.due-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.due-date svg {
  width: 12px;
  height: 12px;
}

.due-date.overdue {
  color: var(--accent-rose);
  font-weight: 500;
}

.task-assignees {
  display: flex;
  align-items: center;
  margin-left: var(--space-3);
}

.assignee-avatar {
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
  margin-left: -8px;
  border: 2px solid var(--bg-secondary);
}

.assignee-avatar:first-child {
  margin-left: 0;
}

.more-assignees {
  font-size: 0.6875rem;
  color: var(--text-tertiary);
  margin-left: var(--space-1);
}

/* Stats Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-5);
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.stat-card:hover {
  border-color: var(--border-default);
  box-shadow: var(--shadow-sm);
}

.stat-card.has-overdue {
  border-color: var(--accent-rose-alpha-30, rgba(244, 63, 94, 0.3));
  background: var(--accent-rose-alpha-05, rgba(244, 63, 94, 0.05));
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon svg {
  width: 20px;
  height: 20px;
}

.stat-icon.total {
  background: var(--primary-500-alpha-15, rgba(139, 92, 246, 0.15));
  color: var(--primary-500);
}

.stat-icon.todo {
  background: var(--accent-cyan-alpha-15, rgba(6, 182, 212, 0.15));
  color: var(--accent-cyan);
}

.stat-icon.in-progress {
  background: var(--accent-amber-alpha-15, rgba(245, 158, 11, 0.15));
  color: var(--accent-amber);
}

.stat-icon.done {
  background: var(--accent-emerald-alpha-15, rgba(16, 185, 129, 0.15));
  color: var(--accent-emerald);
}

.stat-icon.overdue {
  background: var(--accent-rose-alpha-15, rgba(244, 63, 94, 0.15));
  color: var(--accent-rose);
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.stat-value {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.stat-card.has-overdue .stat-value {
  color: var(--accent-rose);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  white-space: nowrap;
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
  z-index: 1000;
  padding: var(--space-4);
}

.modal {
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 480px;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-subtle);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.2s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Mobile Responsive */
@media (max-width: 1023px) {
  .tasks-page {
    padding: var(--space-4) var(--space-4);
  }

  .page-header {
    flex-direction: column;
    gap: var(--space-3);
  }

  .header-content h1 {
    font-size: 1.5rem;
  }

  .header-actions {
    width: 100%;
  }

  .search-box {
    flex: 1;
  }

  .search-box input {
    width: 100%;
  }

  .filters-bar {
    gap: var(--space-3);
  }

  .filter-group select {
    min-width: 120px;
  }

  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 767px) {
  .tasks-page {
    padding: var(--space-3);
  }

  .filters-bar {
    padding: var(--space-3);
  }

  .filter-group {
    flex: 1;
    min-width: calc(50% - var(--space-3));
  }

  .filter-group select {
    width: 100%;
    min-width: unset;
  }

  .task-card {
    padding: var(--space-3);
  }

  .task-meta {
    gap: var(--space-1);
  }

  .project-badge,
  .priority-badge {
    font-size: 0.625rem;
    padding: 1px 6px;
  }

  .task-assignees {
    display: none;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-3);
  }

  .stats-grid .stat-card:last-child {
    grid-column: span 2;
  }

  .stat-card {
    padding: var(--space-3) var(--space-4);
  }

  .stat-icon {
    width: 36px;
    height: 36px;
  }

  .stat-icon svg {
    width: 18px;
    height: 18px;
  }

  .stat-value {
    font-size: 1.125rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
