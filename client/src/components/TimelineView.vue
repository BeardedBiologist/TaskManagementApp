<template>
  <div class="timeline-view" :class="{ 'is-dragging': draggedTask }">
    <!-- Timeline Header -->
    <div class="timeline-toolbar">
      <div class="zoom-controls">
        <button class="btn btn-icon btn-ghost" @click="zoomOut" title="Zoom out">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>
        <span class="zoom-level">{{ zoomLabel }}</span>
        <button class="btn btn-icon btn-ghost" @click="zoomIn" title="Zoom in">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="14"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>
      </div>
      
      <div class="view-options">
        <button 
          v-for="view in viewModes" 
          :key="view.id"
          class="btn btn-sm"
          :class="currentView === view.id ? 'btn-primary' : 'btn-ghost'"
          @click="currentView = view.id"
        >
          {{ view.label }}
        </button>
      </div>
    </div>

    <!-- Timeline Container -->
    <div class="timeline-container" ref="timelineContainer">
      <!-- Sticky Sidebar -->
      <div class="timeline-sidebar">
        <div class="sidebar-header">
          <span>Task</span>
        </div>
        <div class="sidebar-list">
          <div 
            v-for="task in sortedTasks" 
            :key="task._id"
            class="sidebar-item"
            :class="{ selected: selectedTask?._id === task._id }"
            @click="$emit('select-task', task)"
          >
            <div class="task-info">
              <span class="task-title" :title="task.title">{{ task.title }}</span>
              <div class="task-meta">
                <span class="priority-dot" :class="task.priority"></span>
                <span v-if="task.assignees?.length" class="assignee-count">
                  {{ task.assignees.length }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline Grid -->
      <div class="timeline-grid" @scroll="handleScroll" ref="gridRef">
        <div class="grid-content" :style="{ width: `${totalWidth}px` }">
          <!-- Header Row -->
          <div class="timeline-header">
            <div 
              v-for="date in dateColumns" 
              :key="`header-${date.key}`"
              class="date-cell"
              :class="{ 
                'is-today': date.isToday,
                'is-weekend': date.isWeekend,
                'is-month-start': date.isMonthStart
              }"
              :style="{ left: `${date.index * columnWidth}px`, width: `${columnWidth}px` }"
            >
              <span class="date-day">{{ date.day }}</span>
              <span class="date-weekday">{{ date.weekday }}</span>
              <span v-if="date.isMonthStart" class="month-label">{{ date.month }}</span>
            </div>
          </div>

          <!-- Grid Lines with Drop Zones -->
          <div 
            class="grid-lines"
            @dragover.prevent="handleContainerDragOver"
            @drop="handleContainerDrop"
          >
            <div 
              v-for="date in dateColumns" 
              :key="`line-${date.key}`"
              class="grid-line"
              :class="{ 
                'is-today': date.isToday, 
                'is-weekend': date.isWeekend,
                'active': dragOverDate === date.key 
              }"
              :style="{ left: `${date.index * columnWidth}px`, width: `${columnWidth}px` }"
              @dragenter.prevent="handleDragEnter(date)"
              @dragover.prevent="handleDragOver(date)"
              @dragleave="handleDragLeave(date)"
            />
            
            <!-- Today Indicator -->
            <div 
              v-if="todayPosition !== null"
              class="today-line"
              :style="{ left: `${todayPosition}px` }"
            >
              <span class="today-label">TODAY</span>
            </div>
            
            <!-- Drop Indicator -->
            <div v-if="dragOverDate && draggedTask" class="drop-preview">
              <div 
                class="drop-indicator-line"
                :style="dropIndicatorStyle"
              >
                <span class="drop-date">{{ dropPreviewDate }}</span>
              </div>
            </div>
          </div>

          <!-- Task Bars -->
          <div class="task-bars">
            <div 
              v-for="(task, index) in sortedTasks" 
              :key="task._id"
              class="task-bar-row"
              :style="{ top: `${index * rowHeight}px`, height: `${rowHeight}px` }"
            >
              <div
                v-if="getTaskPosition(task)"
                class="task-bar"
                :class="[task.priority, { 'no-dates': !task.dueDate, 'dragging': draggedTask?._id === task._id }]"
                :style="getTaskBarStyle(task)"
                @click="$emit('select-task', task)"
                draggable="true"
                @dragstart="handleDragStart($event, task)"
                @dragend="handleDragEnd"
              >
                <div class="bar-content">
                  <span class="bar-title">{{ task.title }}</span>
                  <div v-if="task.assignees?.length" class="bar-avatars">
                    <div 
                      v-for="assignee in task.assignees.slice(0, 2)" 
                      :key="assignee._id"
                      class="bar-avatar"
                    >
                      {{ getInitials(assignee.name.first, assignee.name.last) }}
                    </div>
                  </div>
                </div>
                <div class="resize-handle left" @mousedown.stop="startResize($event, task, 'left')"/>
                <div class="resize-handle right" @mousedown.stop="startResize($event, task, 'right')"/>
              </div>
              
              <div v-else class="no-date-badge">
                <span>No due date</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="timeline-legend">
      <div class="legend-item">
        <span class="legend-dot urgent"></span>
        <span>Urgent</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot high"></span>
        <span>High</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot medium"></span>
        <span>Medium</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot low"></span>
        <span>Low</span>
      </div>
      <div class="legend-divider"></div>
      <div class="legend-hint">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        <span>Drag tasks to reschedule</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useAuthStore } from '../stores/auth'
import { getInitials, normalizeDateKey, addDaysToDateKey, formatDateKey, getTodayKey } from '../utils/helpers'

const props = defineProps({
  tasks: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] },
  selectedTask: { type: Object, default: null }
})

const emit = defineEmits(['select-task', 'update-task'])

const authStore = useAuthStore()
const timeZone = computed(() => authStore.userTimezone)
const todayKey = computed(() => getTodayKey(timeZone.value))

// View state
const currentView = ref('week')
const viewModes = [
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'quarter', label: 'Quarter' }
]

// Zoom levels (pixels per day)
const zoomLevels = [30, 50, 80, 120]
const zoomIndex = ref(2)
const columnWidth = computed(() => zoomLevels[zoomIndex.value])
const zoomLabel = computed(() => `${columnWidth.value}px/d`)

// Auto-adjust zoom based on view
watch(currentView, (newView) => {
  switch (newView) {
    case 'week':
      zoomIndex.value = 2
      break
    case 'month':
      zoomIndex.value = 1
      break
    case 'quarter':
      zoomIndex.value = 0
      break
  }
  nextTick(() => scrollToToday())
})

// Dimensions
const rowHeight = 48

// Drag state
const draggedTask = ref(null)
const dragOverDate = ref(null)
const isResizing = ref(false)

// Refs
const gridRef = ref(null)

// Sort tasks
const sortedTasks = computed(() => {
  return [...props.tasks]
    .filter(t => !t.isArchived)
    .sort((a, b) => {
      if (!a.dueDate && b.dueDate) return 1
      if (a.dueDate && !b.dueDate) return -1
      if (!a.dueDate && !b.dueDate) return 0
      const aKey = normalizeDateKey(a.dueDate)
      const bKey = normalizeDateKey(b.dueDate)
      return aKey.localeCompare(bKey)
    })
})

// Date range
const dateRange = computed(() => {
  const tasksWithDates = props.tasks.filter(t => t.dueDate && !t.isArchived)
  let startKey = ''
  let endKey = ''

  if (currentView.value === 'week') {
    startKey = addDaysToDateKey(todayKey.value, -14)
    endKey = addDaysToDateKey(todayKey.value, 21)
  } else if (currentView.value === 'month') {
    const startMonth = addMonthsToDateKey(todayKey.value, -1)
    startKey = `${startMonth.year}-${pad(startMonth.month)}-01`
    const endMonth = addMonthsToDateKey(todayKey.value, 1)
    endKey = endOfMonthKey(endMonth.year, endMonth.month)
  } else {
    const startSeed = addMonthsToDateKey(todayKey.value, -1)
    const startQuarter = getQuarterStart(startSeed.year, startSeed.month)
    startKey = `${startQuarter.year}-${pad(startQuarter.month)}-01`
    const endSeed = addMonthsToDateKey(todayKey.value, 1)
    endKey = getQuarterEndKey(endSeed.year, endSeed.month)
  }

  if (tasksWithDates.length > 0) {
    const keys = tasksWithDates
      .map(t => normalizeDateKey(t.dueDate))
      .filter(Boolean)
      .sort()
    const minKey = keys[0]
    const maxKey = keys[keys.length - 1]

    if (minKey && minKey < startKey) startKey = addDaysToDateKey(minKey, -7)
    if (maxKey && maxKey > endKey) endKey = addDaysToDateKey(maxKey, 14)
  }

  return { startKey, endKey }
})

// Date columns
const dateColumns = computed(() => {
  const columns = []
  if (!dateRange.value.startKey || !dateRange.value.endKey) return columns

  const dayFormatter = new Intl.DateTimeFormat(undefined, { timeZone: 'UTC', day: 'numeric' })
  const weekdayFormatter = new Intl.DateTimeFormat(undefined, { timeZone: 'UTC', weekday: 'short' })
  const monthFormatter = new Intl.DateTimeFormat(undefined, { timeZone: 'UTC', month: 'short' })

  let currentKey = dateRange.value.startKey
  let index = 0

  while (currentKey && currentKey <= dateRange.value.endKey) {
    const date = dateFromKeyUTC(currentKey)
    columns.push({
      date,
      key: currentKey,
      day: dayFormatter.format(date),
      weekday: weekdayFormatter.format(date),
      month: monthFormatter.format(date),
      isToday: currentKey === todayKey.value,
      isWeekend: isWeekendKey(currentKey),
      isMonthStart: currentKey.endsWith('-01'),
      index
    })

    currentKey = addDaysToDateKey(currentKey, 1)
    index++
  }

  return columns
})

const totalWidth = computed(() => dateColumns.value.length * columnWidth.value)

const todayPosition = computed(() => {
  const todayCol = dateColumns.value.find(col => col.key === todayKey.value)
  if (!todayCol) return null
  return todayCol.index * columnWidth.value + columnWidth.value / 2
})

const dropPreviewDate = computed(() => {
  if (!dragOverDate.value) return ''
  const date = dateColumns.value.find(d => d.key === dragOverDate.value)
  return date ? formatDateKey(date.key, { month: 'short', day: 'numeric' }) : ''
})

const dropIndicatorStyle = computed(() => {
  if (!dragOverDate.value) return {}
  const date = dateColumns.value.find(d => d.key === dragOverDate.value)
  if (!date) return {}
  return {
    left: `${date.index * columnWidth.value}px`,
    width: `${columnWidth.value}px`
  }
})

function pad(value) {
  return String(value).padStart(2, '0')
}

function dateFromKeyUTC(key) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, 12))
}

function isWeekendKey(key) {
  const day = dateFromKeyUTC(key).getUTCDay()
  return day === 0 || day === 6
}

function addMonthsToDateKey(dateKey, months) {
  const [year, month] = dateKey.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, 15))
  date.setUTCMonth(date.getUTCMonth() + months)
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 }
}

function endOfMonthKey(year, month) {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return `${year}-${pad(month)}-${pad(lastDay)}`
}

function getQuarterStart(year, month) {
  const startMonth = Math.floor((month - 1) / 3) * 3 + 1
  return { year, month: startMonth }
}

function getQuarterEndKey(year, month) {
  const quarterStart = getQuarterStart(year, month)
  return endOfMonthKey(quarterStart.year, quarterStart.month + 2)
}

function getTaskPosition(task) {
  if (!task.dueDate) return null
  const dueKey = normalizeDateKey(task.dueDate)
  const endCol = dateColumns.value.find(col => col.key === dueKey)
  if (!endCol) return null
  
  const duration = task.timeTracking?.estimated 
    ? Math.max(1, Math.ceil(task.timeTracking.estimated / 3600 / 8))
    : 1
  
  return {
    startIndex: Math.max(0, endCol.index - duration + 1),
    endIndex: endCol.index,
    duration
  }
}

function getTaskBarStyle(task) {
  const pos = getTaskPosition(task)
  if (!pos) return {}
  
  return {
    left: `${pos.startIndex * columnWidth.value + 4}px`,
    width: `${pos.duration * columnWidth.value - 8}px`
  }
}

function zoomIn() {
  if (zoomIndex.value < zoomLevels.length - 1) zoomIndex.value++
}

function zoomOut() {
  if (zoomIndex.value > 0) zoomIndex.value--
}

// Drag and drop handlers
function handleDragStart(e, task) {
  if (isResizing.value) {
    e.preventDefault()
    return
  }
  draggedTask.value = task
  e.dataTransfer.effectAllowed = 'move'
}

function handleDragEnd() {
  draggedTask.value = null
  dragOverDate.value = null
}

function handleDragEnter(date) {
  dragOverDate.value = date.key
}

function handleDragOver(date) {
  dragOverDate.value = date.key
  return false
}

function handleDragLeave(date) {
  if (dragOverDate.value === date.key) {
    dragOverDate.value = null
  }
}

function handleContainerDragOver(e) {
  if (!draggedTask.value) return
  
  // Calculate which date column we're over
  const rect = e.currentTarget.getBoundingClientRect()
  const x = e.clientX - rect.left + e.currentTarget.scrollLeft
  const colIndex = Math.floor(x / columnWidth.value)
  
  const date = dateColumns.value[colIndex]
  if (date) {
    dragOverDate.value = date.key
  }
}

function handleContainerDrop(e) {
  e.preventDefault()
  
  const task = draggedTask.value
  draggedTask.value = null
  dragOverDate.value = null
  
  if (!task) return
  
  // Calculate drop position
  const rect = e.currentTarget.getBoundingClientRect()
  const x = e.clientX - rect.left + e.currentTarget.scrollLeft
  const colIndex = Math.floor(x / columnWidth.value)
  
  const date = dateColumns.value[colIndex]
  if (!date) return
  
  emit('update-task', task._id, { dueDate: date.key })
}

// Resize
function startResize(e, task, side) {
  e.stopPropagation()
  isResizing.value = true
  
  const startX = e.clientX
  const pos = getTaskPosition(task)
  const startDuration = pos?.duration || 1
  
  function onMouseMove(e) {
    const deltaX = e.clientX - startX
    const deltaDays = Math.round(deltaX / columnWidth.value)
    
    if (side === 'right') {
      const newDuration = Math.max(1, startDuration + deltaDays)
      const dueKey = normalizeDateKey(task.dueDate)
      const startKey = addDaysToDateKey(dueKey, -(startDuration - 1))
      const newDueKey = addDaysToDateKey(startKey, newDuration - 1)
      
      emit('update-task', task._id, { 
        dueDate: newDueKey,
        timeTracking: {
          ...task.timeTracking,
          estimated: newDuration * 8 * 3600
        }
      })
    }
  }
  
  function onMouseUp() {
    isResizing.value = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }
  
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

function handleScroll() {}

function scrollToToday() {
  if (todayPosition.value && gridRef.value) {
    const containerWidth = gridRef.value.clientWidth
    gridRef.value.scrollLeft = todayPosition.value - containerWidth / 2
  }
}

onMounted(() => scrollToToday())
</script>

<style scoped>
.timeline-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.timeline-view.is-dragging .timeline-sidebar,
.timeline-view.is-dragging .timeline-header {
  opacity: 0.7;
}

.timeline-view.is-dragging .task-bar:not(.dragging) {
  opacity: 0.6;
}

/* Toolbar */
.timeline-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-tertiary);
  flex-shrink: 0;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.zoom-level {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  min-width: 60px;
  text-align: center;
}

.view-options {
  display: flex;
  gap: var(--space-1);
}

/* Container */
.timeline-container {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* Sidebar */
.timeline-sidebar {
  width: 280px;
  flex-shrink: 0;
  background: var(--bg-tertiary);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  z-index: 10;
}

.sidebar-header {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.sidebar-list {
  flex: 1;
  overflow-y: auto;
}

.sidebar-item {
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 var(--space-4);
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid var(--border-subtle);
}

.sidebar-item:hover {
  background: var(--bg-elevated);
}

.sidebar-item.selected {
  background: rgba(139, 92, 246, 0.1);
}

.task-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-width: 0;
}

.task-title {
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
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

.assignee-count {
  font-size: 0.6875rem;
  color: var(--text-tertiary);
  background: var(--bg-elevated);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

/* Grid */
.timeline-grid {
  flex: 1;
  overflow: auto;
  position: relative;
}

.grid-content {
  position: relative;
  min-height: 100%;
}

/* Header */
.timeline-header {
  position: sticky;
  top: 0;
  height: 60px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-subtle);
  z-index: 20;
}

.date-cell {
  position: absolute;
  top: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 1px solid var(--border-subtle);
}

.date-cell.is-today {
  background: rgba(139, 92, 246, 0.1);
}

.date-cell.is-weekend {
  background: rgba(0, 0, 0, 0.2);
}

.date-day {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.date-cell.is-today .date-day {
  color: var(--primary-400);
}

.date-weekday {
  font-size: 0.6875rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
}

.month-label {
  position: absolute;
  top: 2px;
  left: 4px;
  font-size: 0.625rem;
  font-weight: 600;
  color: var(--primary-400);
  text-transform: uppercase;
}

/* Grid Lines */
.grid-lines {
  position: absolute;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
}

.grid-line {
  position: absolute;
  top: 0;
  bottom: 0;
  border-right: 1px solid var(--border-subtle);
  pointer-events: auto;
}

.grid-line.is-today {
  border-right-color: var(--primary-500);
  border-right-width: 2px;
}

.grid-line.is-weekend {
  background: rgba(0, 0, 0, 0.1);
}

.grid-line.active {
  background: rgba(139, 92, 246, 0.2);
}

.today-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--primary-500);
  z-index: 15;
  pointer-events: none;
}

.today-label {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary-500);
  color: white;
  font-size: 0.625rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

/* Drop Preview */
.drop-preview {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 50;
}

.drop-indicator-line {
  position: absolute;
  top: 0;
  bottom: 0;
  background: rgba(139, 92, 246, 0.3);
  border: 2px dashed var(--primary-500);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 8px;
}

.drop-date {
  background: var(--primary-500);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: var(--radius-md);
}

/* Task Bars */
.task-bars {
  position: absolute;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.task-bar-row {
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.task-bar {
  position: absolute;
  height: 32px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  padding: 0 var(--space-2);
  cursor: grab;
  transition: all 0.15s;
  border: 1px solid transparent;
  overflow: hidden;
  pointer-events: auto;
}

.task-bar:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
  z-index: 10;
  overflow: visible;
  min-width: max-content;
  width: auto !important;
}

.task-bar:active {
  cursor: grabbing;
}

.task-bar.urgent {
  background: linear-gradient(135deg, rgba(244, 63, 94, 0.9), rgba(244, 63, 94, 0.7));
  border-color: rgba(244, 63, 94, 0.5);
}

.task-bar.high {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.9), rgba(245, 158, 11, 0.7));
  border-color: rgba(245, 158, 11, 0.5);
}

.task-bar.medium {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(139, 92, 246, 0.7));
  border-color: rgba(139, 92, 246, 0.5);
}

.task-bar.low {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(16, 185, 129, 0.7));
  border-color: rgba(16, 185, 129, 0.5);
}

.task-bar.dragging {
  opacity: 0.5;
  cursor: grabbing;
  transform: scale(0.98);
}

.bar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-width: 0;
}

.bar-title {
  font-size: 0.8125rem;
  font-weight: 500;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.bar-avatars {
  display: flex;
  margin-left: var(--space-2);
}

.bar-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  font-weight: 600;
  color: white;
  margin-left: -6px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.bar-avatar:first-child {
  margin-left: 0;
}

.resize-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 8px;
  cursor: col-resize;
  opacity: 0;
  transition: opacity 0.15s;
}

.task-bar:hover .resize-handle {
  opacity: 1;
}

.resize-handle.left {
  left: 0;
}

.resize-handle.right {
  right: 0;
}

.resize-handle::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 3px;
  height: 16px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 2px;
}

.no-date-badge {
  position: absolute;
  left: 20px;
  padding: var(--space-1) var(--space-3);
  background: var(--bg-elevated);
  border: 1px dashed var(--border-default);
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

/* Legend */
.timeline-legend {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-tertiary);
  flex-shrink: 0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-dot.urgent { background: var(--accent-rose); }
.legend-dot.high { background: var(--accent-amber); }
.legend-dot.medium { background: var(--primary-500); }
.legend-dot.low { background: var(--accent-emerald); }

.legend-divider {
  width: 1px;
  height: 20px;
  background: var(--border-subtle);
}

.legend-hint {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  margin-left: auto;
}

.legend-hint svg {
  width: 16px;
  height: 16px;
}
</style>
