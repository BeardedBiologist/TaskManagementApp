<template>
  <div class="task-panel">
    <div class="panel-header">
      <div class="header-actions">
        <button class="btn btn-icon btn-ghost" @click="$emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      
      <div class="task-status-row">
        <select 
          v-model="editedColumnId" 
          @change="updateStatus"
          class="status-select"
          :style="{ background: getColumnColor(editedColumnId) + '15', color: getColumnColor(editedColumnId), borderColor: getColumnColor(editedColumnId) + '30' }"
        >
          <option v-for="col in columns" :key="col.id" :value="col.id">{{ col.title }}</option>
        </select>
        
        <div class="task-id">#{{ task._id?.slice(-6) }}</div>
      </div>
    </div>

    <div class="panel-content">
      <!-- Title Section -->
      <div class="section">
        <div v-if="!editingTitle" class="title-display" @click="startEditingTitle">
          <h2>{{ task.title }}</h2>
          <button class="edit-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        </div>
        <div v-else class="title-edit">
          <input 
            v-model="editedTitle" 
            @blur="saveTitle"
            @keyup.enter="saveTitle"
            type="text" 
            class="form-input form-input-lg"
            ref="titleInput"
          />
        </div>
      </div>

      <!-- Quick Properties -->
      <div class="properties-grid">
        <div class="property">
          <label>Priority</label>
          <select v-model="editedPriority" @change="updatePriority" class="property-select">
            <option value="urgent">🔴 Urgent</option>
            <option value="high">🟠 High</option>
            <option value="medium">🔵 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
        </div>
        
        <div class="property">
          <label>Due Date</label>
          <input 
            v-model="editedDueDate" 
            @change="updateDueDate"
            type="date" 
            class="property-input"
          />
        </div>
      </div>

      <!-- Assignees -->
      <div class="section">
        <h3 class="section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          Assignees
        </h3>
        <div class="assignees-list">
          <div v-for="assignee in task.assignees" :key="assignee._id" class="assignee-chip">
            <div class="avatar avatar-sm">{{ getInitials(assignee.name.first, assignee.name.last) }}</div>
            <span>{{ assignee.name.first }} {{ assignee.name.last }}</span>
            <button class="remove-btn" @click="removeAssignee(assignee._id)">×</button>
          </div>
          <button class="add-assignee-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add
          </button>
        </div>
      </div>

      <!-- Description -->
      <div class="section">
        <h3 class="section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="21" y1="10" x2="3" y2="10"/>
            <line x1="21" y1="6" x2="3" y2="6"/>
            <line x1="21" y1="14" x2="3" y2="14"/>
            <line x1="21" y1="18" x2="3" y2="18"/>
          </svg>
          Description
        </h3>
        <div v-if="!editingDescription" class="description-display" @click="startEditingDescription">
          <p v-if="task.description">{{ task.description }}</p>
          <p v-else class="placeholder">Add a description...</p>
        </div>
        <div v-else class="description-edit">
          <textarea 
            v-model="editedDescription"
            rows="5"
            class="form-textarea"
            placeholder="Add a description..."
          ></textarea>
          <div class="edit-actions">
            <button class="btn btn-primary btn-sm" @click="saveDescription">Save</button>
            <button class="btn btn-ghost btn-sm" @click="cancelEditDescription">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Checklist -->
      <div class="section">
        <div class="section-header">
          <h3 class="section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            Checklist
            <span class="checklist-progress">{{ completedSubtasks }}/{{ task.subtasks?.length || 0 }}</span>
          </h3>
          <div class="progress-bar-sm">
            <div 
              class="progress-fill-sm" 
              :style="{ width: subtaskProgress + '%' }"
            />
          </div>
        </div>
        
        <div class="checklist">
          <label 
            v-for="(subtask, index) in task.subtasks" 
            :key="index"
            class="checklist-item"
          >
            <input 
              type="checkbox" 
              :checked="subtask.completed"
              @change="toggleSubtask(index)"
            />
            <span :class="{ completed: subtask.completed }">{{ subtask.title }}</span>
            <button class="remove-item" @click.stop="removeSubtask(index)">×</button>
          </label>
          
          <div v-if="addingSubtask" class="add-subtask">
            <input 
              v-model="newSubtask"
              @keyup.enter="addSubtask"
              type="text"
              class="form-input"
              placeholder="Add an item..."
              ref="subtaskInput"
              autofocus
            />
            <div class="edit-actions">
              <button class="btn btn-primary btn-sm" @click="addSubtask">Add</button>
              <button class="btn btn-ghost btn-sm" @click="cancelAddSubtask">Cancel</button>
            </div>
          </div>
          
          <button v-else class="add-check-item" @click="startAddingSubtask">
            + Add an item
          </button>
        </div>
      </div>

      <!-- Labels -->
      <div class="section">
        <h3 class="section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 0 1 0 2.828l-7 7a2 2 0 0 1-2.828 0l-7-7A1.994 1.994 0 0 1 3 12V7a4 4 0 0 1 4-4z"/>
          </svg>
          Labels
        </h3>
        <div class="labels-list">
          <span 
            v-for="label in task.labels" 
            :key="label.name"
            class="label-tag"
            :style="{ background: label.color + '20', color: label.color, borderColor: label.color + '30' }"
          >
            {{ label.name }}
            <button @click="removeLabel(label.name)">×</button>
          </span>
          <button class="add-label-btn">+ Add label</button>
        </div>
      </div>

      <!-- Activity -->
      <div class="section">
        <h3 class="section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Activity
        </h3>
        
        <div class="activity-list">
          <div v-for="comment in task.comments" :key="comment._id" class="activity-item">
            <div class="avatar avatar-sm">{{ getInitials(comment.author.name.first, comment.author.name.last) }}</div>
            <div class="activity-content">
              <div class="activity-header">
                <span class="author">{{ comment.author.name.first }} {{ comment.author.name.last }}</span>
                <span class="time">{{ formatTime(comment.createdAt) }}</span>
              </div>
              <p class="comment-text">{{ comment.content }}</p>
            </div>
          </div>
        </div>
        
        <div class="add-comment">
          <div class="avatar avatar-sm">{{ authStore.userInitials }}</div>
          <div class="comment-input-wrap">
            <textarea 
              v-model="newComment"
              rows="2"
              class="form-textarea"
              placeholder="Write a comment..."
              @keyup.enter.prevent="addComment"
            ></textarea>
            <button 
              class="btn btn-primary btn-sm" 
              @click="addComment"
              :disabled="!newComment.trim() || addingComment"
            >
              {{ addingComment ? 'Sending...' : 'Comment' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="panel-footer">
      <button class="btn btn-danger btn-full" @click="confirmDelete">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
        Delete Task
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useAuthStore } from '../stores/auth'
import { getInitials, formatTimeAgo } from '../utils/helpers'
import api from '../utils/api'

const props = defineProps({
  task: { type: Object, required: true },
  columns: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'update', 'delete'])

const authStore = useAuthStore()

// Edit states
const editingTitle = ref(false)
const editingDescription = ref(false)
const addingSubtask = ref(false)
const addingComment = ref(false)

// Values
const editedTitle = ref(props.task.title)
const editedDescription = ref(props.task.description || '')
const editedColumnId = ref(props.task.columnId)
const editedPriority = ref(props.task.priority)
const editedDueDate = ref(props.task.dueDate ? props.task.dueDate.split('T')[0] : '')
const newSubtask = ref('')
const newComment = ref('')

// Refs
const titleInput = ref(null)
const subtaskInput = ref(null)

const completedSubtasks = computed(() => {
  return props.task.subtasks?.filter(s => s.completed).length || 0
})

const subtaskProgress = computed(() => {
  if (!props.task.subtasks?.length) return 0
  return Math.round((completedSubtasks.value / props.task.subtasks.length) * 100)
})

function getColumnColor(columnId) {
  return props.columns.find(c => c.id === columnId)?.color || '#8b5cf6'
}

function formatTime(date) {
  return formatTimeAgo(date)
}

function startEditingTitle() {
  editingTitle.value = true
  editedTitle.value = props.task.title
  nextTick(() => titleInput.value?.focus())
}

function saveTitle() {
  if (editedTitle.value.trim() && editedTitle.value !== props.task.title) {
    emit('update', props.task._id, { title: editedTitle.value.trim() })
  }
  editingTitle.value = false
}

function startEditingDescription() {
  editingDescription.value = true
  editedDescription.value = props.task.description || ''
}

function saveDescription() {
  if (editedDescription.value !== props.task.description) {
    emit('update', props.task._id, { description: editedDescription.value })
  }
  editingDescription.value = false
}

function cancelEditDescription() {
  editingDescription.value = false
  editedDescription.value = props.task.description || ''
}

function updateStatus() {
  if (editedColumnId.value !== props.task.columnId) {
    emit('update', props.task._id, { columnId: editedColumnId.value })
  }
}

function updatePriority() {
  if (editedPriority.value !== props.task.priority) {
    emit('update', props.task._id, { priority: editedPriority.value })
  }
}

function updateDueDate() {
  const newDueDate = editedDueDate.value || null
  if (newDueDate !== props.task.dueDate) {
    emit('update', props.task._id, { dueDate: newDueDate })
  }
}

function removeAssignee(assigneeId) {
  const assignees = props.task.assignees.filter(a => a._id !== assigneeId).map(a => a._id)
  emit('update', props.task._id, { assignees })
}

function startAddingSubtask() {
  addingSubtask.value = true
  newSubtask.value = ''
  nextTick(() => subtaskInput.value?.focus())
}

function addSubtask() {
  if (!newSubtask.value.trim()) return
  const subtasks = [...(props.task.subtasks || []), {
    title: newSubtask.value.trim(),
    completed: false
  }]
  emit('update', props.task._id, { subtasks })
  cancelAddSubtask()
}

function cancelAddSubtask() {
  addingSubtask.value = false
  newSubtask.value = ''
}

function toggleSubtask(index) {
  const subtasks = [...props.task.subtasks]
  subtasks[index].completed = !subtasks[index].completed
  emit('update', props.task._id, { subtasks })
}

function removeSubtask(index) {
  const subtasks = props.task.subtasks.filter((_, i) => i !== index)
  emit('update', props.task._id, { subtasks })
}

function removeLabel(labelName) {
  const labels = props.task.labels.filter(l => l.name !== labelName)
  emit('update', props.task._id, { labels })
}

async function addComment() {
  if (!newComment.value.trim()) return
  addingComment.value = true
  try {
    await api.post(`/tasks/${props.task._id}/comments`, {
      content: newComment.value.trim()
    })
    newComment.value = ''
  } finally {
    addingComment.value = false
  }
}

function confirmDelete() {
  if (confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
    emit('delete', props.task._id)
  }
}
</script>

<style scoped>
.task-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 420px;
  height: 100vh;
  background: var(--bg-secondary);
  border-left: 1px solid var(--border-default);
  display: flex;
  flex-direction: column;
  z-index: 200;
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.4);
}

.panel-header {
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.header-actions {
  display: flex;
  justify-content: flex-end;
}

.task-status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid;
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  background: transparent;
}

.task-id {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  font-family: monospace;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-5);
}

.section {
  margin-bottom: var(--space-8);
}

.section-header {
  margin-bottom: var(--space-3);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
}

.section-title svg {
  width: 14px;
  height: 14px;
}

.checklist-progress {
  margin-left: auto;
  font-size: 0.6875rem;
  color: var(--text-tertiary);
}

.progress-bar-sm {
  height: 3px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill-sm {
  height: 100%;
  background: var(--accent-emerald);
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

/* Title Section */
.title-display {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-2);
  margin: calc(-1 * var(--space-2));
  border-radius: var(--radius-md);
  cursor: pointer;
}

.title-display:hover {
  background: var(--bg-tertiary);
}

.title-display h2 {
  font-size: 1.375rem;
  font-weight: 600;
  line-height: 1.3;
  flex: 1;
}

.edit-btn {
  opacity: 0;
  padding: var(--space-1);
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all 0.2s;
}

.title-display:hover .edit-btn {
  opacity: 1;
}

.edit-btn svg {
  width: 16px;
  height: 16px;
}

.title-edit {
  margin-bottom: var(--space-2);
}

/* Properties Grid */
.properties-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.property label {
  display: block;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-tertiary);
  margin-bottom: var(--space-2);
}

.property-select,
.property-input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 0.875rem;
}

/* Assignees */
.assignees-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.assignee-chip {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2) var(--space-1) var(--space-1);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  font-size: 0.8125rem;
}

.remove-btn {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
}

.remove-btn:hover {
  color: var(--accent-rose);
}

.add-assignee-btn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  background: transparent;
  border: 1px dashed var(--border-default);
  border-radius: var(--radius-full);
  color: var(--text-tertiary);
  font-size: 0.8125rem;
  cursor: pointer;
}

.add-assignee-btn:hover {
  border-color: var(--primary-500);
  color: var(--primary-400);
}

.add-assignee-btn svg {
  width: 14px;
  height: 14px;
}

/* Description */
.description-display {
  padding: var(--space-3);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  min-height: 80px;
  cursor: pointer;
  transition: all 0.2s;
}

.description-display:hover {
  border-color: var(--border-strong);
}

.description-display p {
  color: var(--text-primary);
  line-height: 1.6;
}

.description-display .placeholder {
  color: var(--text-tertiary);
}

.description-edit {
  margin-bottom: var(--space-2);
}

.edit-actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-3);
}

/* Checklist */
.checklist {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s;
}

.checklist-item:hover {
  background: var(--bg-elevated);
}

.checklist-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.checklist-item span {
  flex: 1;
  font-size: 0.9375rem;
}

.checklist-item span.completed {
  text-decoration: line-through;
  color: var(--text-tertiary);
}

.remove-item {
  opacity: 0;
  padding: var(--space-1);
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  font-size: 1.125rem;
  line-height: 1;
}

.checklist-item:hover .remove-item {
  opacity: 1;
}

.remove-item:hover {
  color: var(--accent-rose);
}

.add-check-item {
  padding: var(--space-2) var(--space-3);
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  font-size: 0.9375rem;
  text-align: left;
  cursor: pointer;
}

.add-check-item:hover {
  color: var(--primary-400);
}

.add-subtask {
  margin-top: var(--space-2);
}

/* Labels */
.labels-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.label-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  border: 1px solid;
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  font-weight: 500;
}

.label-tag button {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  line-height: 1;
  opacity: 0.7;
}

.label-tag button:hover {
  opacity: 1;
}

.add-label-btn {
  padding: var(--space-1) var(--space-3);
  background: transparent;
  border: 1px dashed var(--border-default);
  border-radius: var(--radius-md);
  color: var(--text-tertiary);
  font-size: 0.8125rem;
  cursor: pointer;
}

.add-label-btn:hover {
  border-color: var(--primary-500);
  color: var(--primary-400);
}

/* Activity */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.activity-item {
  display: flex;
  gap: var(--space-3);
}

.activity-content {
  flex: 1;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-1);
}

.author {
  font-size: 0.875rem;
  font-weight: 500;
}

.time {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.comment-text {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.5;
  background: var(--bg-tertiary);
  padding: var(--space-3);
  border-radius: var(--radius-md);
}

.add-comment {
  display: flex;
  gap: var(--space-3);
}

.comment-input-wrap {
  flex: 1;
}

.comment-input-wrap .btn {
  margin-top: var(--space-2);
}

/* Panel Footer */
.panel-footer {
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--border-subtle);
}

.btn-full {
  width: 100%;
  justify-content: center;
}

.btn-full svg {
  width: 16px;
  height: 16px;
}
</style>
