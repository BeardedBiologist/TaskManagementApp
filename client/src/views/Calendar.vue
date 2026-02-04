<template>
  <Layout>
    <div class="calendar-page">
      <header class="page-header">
        <div class="header-content">
          <h1>Calendar</h1>
          <p class="subtitle">View and manage your tasks by due date.</p>
        </div>
        <div class="calendar-controls">
          <button class="btn btn-secondary" @click="resetToToday">Today</button>
          <div class="month-nav">
            <button class="btn btn-icon btn-ghost" @click="prevMonth">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <span class="current-month">{{ currentMonthName }} {{ currentYear }}</span>
            <button class="btn btn-icon btn-ghost" @click="nextMonth">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div class="calendar-layout">
        <!-- Main Calendar -->
        <div class="calendar-container card">
          <div class="weekdays-grid">
            <div v-for="day in weekDays" :key="day" class="weekday-header">
              {{ day }}
            </div>
          </div>
          <div class="days-grid">
            <div 
              v-for="(day, index) in calendarDays" 
              :key="index"
              class="day-cell"
              :class="{
                'other-month': !day.isCurrentMonth,
                'today': day.isToday,
                'selected': isSelected(day.date)
              }"
              @click="selectDate(day.date)"
            >
              <div class="day-number">{{ day.date.getDate() }}</div>
              <div class="day-tasks">
                <div
                  v-for="task in getTasksForDate(day.date).slice(0, 3)"
                  :key="task._id"
                  class="calendar-task"
                  :class="[task.priority, { overdue: isOverdue(task.dueDate) && !isCompleted(task) }]"
                  :style="{ borderLeftColor: getProjectColor(task.project) }"
                  @click.stop="openTask(task)"
                  draggable="true"
                  @dragstart="handleDragStart($event, task)"
                >
                  <span class="task-dot" :class="task.priority"></span>
                  <span class="task-title">{{ task.title }}</span>
                </div>
                <div v-if="getTasksForDate(day.date).length > 3" class="more-tasks">
                  +{{ getTasksForDate(day.date).length - 3 }} more
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Side Panel - Upcoming Tasks -->
        <div class="upcoming-panel card">
          <div class="panel-header">
            <h3>Upcoming</h3>
            <span class="task-count">{{ upcomingTasks.length }} tasks</span>
          </div>
          
          <div class="upcoming-list">
            <div 
              v-for="task in upcomingTasks.slice(0, 10)" 
              :key="task._id"
              class="upcoming-task"
              :class="{ overdue: isOverdue(task.dueDate) && !isCompleted(task) }"
              @click="openTask(task)"
            >
              <div class="task-meta">
                <span class="due-date" :class="getDueDateClass(task.dueDate)">
                  {{ formatDueDate(task.dueDate) }}
                </span>
                <span class="project-badge" :style="{ background: getProjectColor(task.project) + '20', color: getProjectColor(task.project) }">
                  {{ getProjectName(task.project) }}
                </span>
              </div>
              <p class="task-title">{{ task.title }}</p>
              <div class="task-footer">
                <span class="priority-badge" :class="task.priority">{{ task.priority }}</span>
                <div v-if="task.assignees?.length" class="assignee-avatars">
                  <div 
                    v-for="assignee in task.assignees.slice(0, 2)" 
                    :key="assignee._id"
                    class="avatar avatar-sm"
                  >
                    {{ getInitials(assignee.name.first, assignee.name.last) }}
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="upcomingTasks.length === 0" class="empty-upcoming">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <p>No upcoming tasks</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Task Detail Panel -->
    <Transition name="slide">
      <TaskPanel
        v-if="selectedTask"
        :task="selectedTask"
        :columns="getTaskColumns(selectedTask)"
        @close="selectedTask = null"
        @update="updateTask"
        @delete="deleteTask"
      />
    </Transition>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { format, isSameDay, isToday, isTomorrow, isPast, addDays } from 'date-fns'
import Layout from '../components/Layout.vue'
import TaskPanel from '../components/TaskPanel.vue'
import { useProjectStore } from '../stores/project'
import { useWorkspaceStore } from '../stores/workspace'
import { getInitials } from '../utils/helpers'

const projectStore = useProjectStore()
const workspaceStore = useWorkspaceStore()

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const currentDate = ref(new Date())
const selectedDate = ref(new Date())
const selectedTask = ref(null)
const allTasks = ref([])
const projectColors = new Map()

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonthName = computed(() => {
  return currentDate.value.toLocaleString('default', { month: 'long' })
})

// Get all tasks from all projects
const tasks = computed(() => {
  return allTasks.value.filter(task => !task.isArchived && task.dueDate)
})

// Tasks for the upcoming panel (next 30 days, not completed)
const upcomingTasks = computed(() => {
  const now = new Date()
  const thirtyDaysFromNow = addDays(now, 30)
  
  return tasks.value
    .filter(task => {
      const dueDate = new Date(task.dueDate)
      return dueDate >= now && dueDate <= thirtyDaysFromNow && !isCompleted(task)
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  
  const days = []
  
  // Previous month padding
  const paddingDays = firstDayOfMonth.getDay()
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  
  for (let i = paddingDays - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i)
    days.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDay(date, new Date())
    })
  }
  
  // Current month days
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const date = new Date(year, month, i)
    days.push({
      date,
      isCurrentMonth: true,
      isToday: isSameDay(date, new Date())
    })
  }
  
  // Next month padding
  const remainingCells = 42 - days.length
  for (let i = 1; i <= remainingCells; i++) {
    const date = new Date(year, month + 1, i)
    days.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDay(date, new Date())
    })
  }
  
  return days
})

onMounted(async () => {
  // Fetch all workspaces and their projects
  await workspaceStore.fetchWorkspaces()
  
  // Fetch tasks from all projects
  const tasksPromises = []
  for (const workspace of workspaceStore.workspaces) {
    for (const project of workspace.projects || []) {
      if (typeof project === 'string') {
        tasksPromises.push(fetchProjectTasks(project))
      } else {
        tasksPromises.push(fetchProjectTasks(project._id))
      }
    }
  }
  
  await Promise.all(tasksPromises)
})

async function fetchProjectTasks(projectId) {
  try {
    await projectStore.fetchProject(projectId)
    // Store project color
    if (!projectColors.has(projectId)) {
      projectColors.set(projectId, generateColor(projectId))
    }
    // Add tasks to allTasks
    for (const task of projectStore.tasks) {
      if (!allTasks.value.find(t => t._id === task._id)) {
        allTasks.value.push(task)
      }
    }
  } catch (err) {
    console.error('Failed to fetch project:', err)
  }
}

function getTasksForDate(date) {
  return tasks.value.filter(task => {
    if (!task.dueDate) return false
    return isSameDay(new Date(task.dueDate), date)
  }).sort((a, b) => {
    // Sort by priority: urgent > high > medium > low
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
}

function isCompleted(task) {
  // Check if task is in 'done' column
  return task.columnId === 'done' || task.columnId?.includes('done')
}

function isOverdue(date) {
  if (!date) return false
  return isPast(new Date(date)) && !isToday(new Date(date))
}

function getProjectColor(projectId) {
  if (!projectColors.has(projectId)) {
    projectColors.set(projectId, generateColor(projectId))
  }
  return projectColors.get(projectId)
}

function getProjectName(projectId) {
  // Try to find project name from workspace store
  for (const workspace of workspaceStore.workspaces) {
    const project = workspace.projects?.find(p => 
      (typeof p === 'object' ? p._id : p) === projectId
    )
    if (project) {
      return typeof project === 'object' ? project.name : 'Project'
    }
  }
  return 'Project'
}

function getTaskColumns(task) {
  // Return columns for the task's project
  // This is simplified - ideally we'd store project columns with the task
  return [
    { id: 'todo', title: 'To Do', color: '#e2e8f0' },
    { id: 'inprogress', title: 'In Progress', color: '#dbeafe' },
    { id: 'review', title: 'Review', color: '#fef3c7' },
    { id: 'done', title: 'Done', color: '#d1fae5' }
  ]
}

function generateColor(str) {
  const colors = [
    '#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', 
    '#10b981', '#f43f5e', '#6366f1', '#14b8a6'
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function formatDueDate(date) {
  if (!date) return ''
  const d = new Date(date)
  if (isToday(d)) return 'Today'
  if (isTomorrow(d)) return 'Tomorrow'
  return format(d, 'MMM d')
}

function getDueDateClass(date) {
  if (!date) return ''
  const d = new Date(date)
  if (isToday(d)) return 'today'
  if (isTomorrow(d)) return 'tomorrow'
  if (isPast(d) && !isToday(d)) return 'overdue'
  return ''
}

function isSelected(date) {
  return isSameDay(date, selectedDate.value)
}

function selectDate(date) {
  selectedDate.value = date
}

function prevMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

function resetToToday() {
  currentDate.value = new Date()
  selectedDate.value = new Date()
}

function openTask(task) {
  selectedTask.value = task
}

async function updateTask(taskId, updates) {
  await projectStore.updateTask(taskId, updates)
  // Update in our local list too
  const taskIndex = allTasks.value.findIndex(t => t._id === taskId)
  if (taskIndex !== -1) {
    allTasks.value[taskIndex] = { ...allTasks.value[taskIndex], ...updates }
  }
}

async function deleteTask(taskId) {
  await projectStore.deleteTask(taskId)
  allTasks.value = allTasks.value.filter(t => t._id !== taskId)
  if (selectedTask.value?._id === taskId) {
    selectedTask.value = null
  }
}

// Drag and drop to change due date
function handleDragStart(e, task) {
  e.dataTransfer.setData('taskId', task._id)
  e.dataTransfer.effectAllowed = 'move'
}
</script>

<style scoped>
.calendar-page {
  padding: var(--space-6) var(--space-8);
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-6);
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

.calendar-controls {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.month-nav {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--bg-secondary);
  padding: var(--space-1);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
}

.current-month {
  font-weight: 600;
  min-width: 140px;
  text-align: center;
}

.calendar-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: var(--space-5);
  flex: 1;
  min-height: 0;
}

.calendar-container {
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.weekdays-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-tertiary);
}

.weekday-header {
  padding: var(--space-3);
  text-align: center;
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(6, 1fr);
  flex: 1;
}

.day-cell {
  border-right: 1px solid var(--border-subtle);
  border-bottom: 1px solid var(--border-subtle);
  padding: var(--space-2);
  min-height: 100px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.day-cell:nth-child(7n) {
  border-right: none;
}

.day-cell:hover {
  background: var(--bg-tertiary);
}

.day-cell.other-month {
  background: rgba(0, 0, 0, 0.2);
  color: var(--text-tertiary);
}

.day-cell.today {
  background: rgba(139, 92, 246, 0.05);
}

.day-cell.today .day-number {
  background: var(--primary-600);
  color: white;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 600;
}

.day-cell.selected {
  box-shadow: inset 0 0 0 2px var(--primary-500);
}

.day-number {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: var(--space-2);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-tasks {
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow: hidden;
}

.calendar-task {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: 3px 6px;
  background: var(--bg-elevated);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  border-left: 3px solid;
  cursor: pointer;
  transition: all 0.15s;
  min-height: 22px;
}

.calendar-task:hover {
  background: var(--bg-tertiary);
  transform: translateX(2px);
}

.calendar-task.overdue {
  background: rgba(244, 63, 94, 0.1);
}

.task-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.task-dot.urgent { background: var(--accent-rose); }
.task-dot.high { background: var(--accent-amber); }
.task-dot.medium { background: var(--primary-500); }
.task-dot.low { background: var(--accent-emerald); }

.calendar-task .task-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.more-tasks {
  font-size: 0.6875rem;
  color: var(--text-tertiary);
  padding: 2px 6px;
}

/* Upcoming Panel */
.upcoming-panel {
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border-subtle);
}

.panel-header h3 {
  font-size: 1rem;
  font-weight: 600;
}

.task-count {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  background: var(--bg-tertiary);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
}

.upcoming-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-3);
}

.upcoming-task {
  padding: var(--space-4);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-3);
  cursor: pointer;
  transition: all 0.2s;
}

.upcoming-task:hover {
  border-color: var(--border-strong);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.upcoming-task.overdue {
  border-color: rgba(244, 63, 94, 0.3);
  background: rgba(244, 63, 94, 0.05);
}

.task-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.due-date {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.due-date.today {
  color: var(--accent-emerald);
}

.due-date.tomorrow {
  color: var(--accent-cyan);
}

.due-date.overdue {
  color: var(--accent-rose);
}

.project-badge {
  font-size: 0.6875rem;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-weight: 500;
}

.upcoming-task .task-title {
  font-size: 0.9375rem;
  font-weight: 500;
  margin-bottom: var(--space-3);
  line-height: 1.4;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.priority-badge {
  font-size: 0.6875rem;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  font-weight: 600;
}

.priority-badge.urgent { background: rgba(244, 63, 94, 0.15); color: var(--accent-rose); }
.priority-badge.high { background: rgba(245, 158, 11, 0.15); color: var(--accent-amber); }
.priority-badge.medium { background: rgba(139, 92, 246, 0.15); color: var(--primary-400); }
.priority-badge.low { background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald); }

.assignee-avatars {
  display: flex;
}

.assignee-avatars .avatar {
  margin-left: -6px;
  border: 2px solid var(--bg-tertiary);
}

.assignee-avatars .avatar:first-child {
  margin-left: 0;
}

.empty-upcoming {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-10);
  color: var(--text-tertiary);
}

.empty-upcoming svg {
  width: 48px;
  height: 48px;
  margin-bottom: var(--space-3);
  opacity: 0.5;
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

/* Responsive */
@media (max-width: 1024px) {
  .calendar-layout {
    grid-template-columns: 1fr;
  }
  
  .upcoming-panel {
    display: none;
  }
}

@media (max-width: 768px) {
  .calendar-page {
    padding: var(--space-4);
  }
  
  .days-grid {
    grid-template-rows: repeat(6, minmax(80px, 1fr));
  }
  
  .page-header {
    flex-direction: column;
    gap: var(--space-4);
  }
  
  .calendar-controls {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
