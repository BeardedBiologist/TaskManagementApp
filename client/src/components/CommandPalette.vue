<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="command-palette-overlay" @click="close">
        <div class="command-palette" @click.stop>
          <div class="search-header">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              ref="inputRef"
              v-model="searchQuery"
              type="text"
              placeholder="Search or jump to..."
              @keydown.down.prevent="navigateDown"
              @keydown.up.prevent="navigateUp"
              @keydown.enter.prevent="selectCurrent"
              @keydown.esc="close"
            />
            <kbd class="shortcut-hint">ESC</kbd>
          </div>
          
          <div class="results-container">
            <!-- Quick Actions -->
            <div v-if="!searchQuery" class="section">
              <div class="section-title">Quick Actions</div>
              <div
                v-for="(action, index) in quickActions"
                :key="action.id"
                class="result-item"
                :class="{ selected: selectedIndex === index }"
                @click="executeAction(action)"
                @mouseenter="selectedIndex = index"
              >
                <div class="icon" :style="{ background: action.color + '20', color: action.color }">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="action.icon"/>
                </div>
                <div class="content">
                  <span class="title">{{ action.title }}</span>
                  <span class="description">{{ action.description }}</span>
                </div>
                <kbd v-if="action.shortcut" class="shortcut">{{ action.shortcut }}</kbd>
              </div>
            </div>
            
            <!-- Search Results -->
            <template v-if="searchQuery">
              <!-- Tasks -->
              <div v-if="filteredTasks.length" class="section">
                <div class="section-title">Tasks ({{ filteredTasks.length }})</div>
                <div
                  v-for="(task, idx) in filteredTasks.slice(0, 5)"
                  :key="task._id"
                  class="result-item"
                  :class="{ selected: selectedIndex === getIndex('task', idx) }"
                  @click="openTask(task)"
                  @mouseenter="selectedIndex = getIndex('task', idx)"
                >
                  <div class="icon" :class="task.priority">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    </svg>
                  </div>
                  <div class="content">
                    <span class="title">{{ task.title }}</span>
                    <span class="description">{{ getProjectName(task.project) }} • Due {{ formatDueDate(task.dueDate) }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Projects -->
              <div v-if="filteredProjects.length" class="section">
                <div class="section-title">Projects ({{ filteredProjects.length }})</div>
                <div
                  v-for="(project, idx) in filteredProjects.slice(0, 5)"
                  :key="project._id"
                  class="result-item"
                  :class="{ selected: selectedIndex === getIndex('project', idx) }"
                  @click="openProject(project)"
                  @mouseenter="selectedIndex = getIndex('project', idx)"
                >
                  <div class="icon" style="background: var(--primary-500-alpha-20, rgba(139, 92, 246, 0.2)); color: var(--primary-400);">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="7" height="7"/>
                      <rect x="14" y="3" width="7" height="7"/>
                      <rect x="14" y="14" width="7" height="7"/>
                      <rect x="3" y="14" width="7" height="7"/>
                    </svg>
                  </div>
                  <div class="content">
                    <span class="title">{{ project.name }}</span>
                    <span class="description">{{ project.workspace?.name || 'Workspace' }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Workspaces -->
              <div v-if="filteredWorkspaces.length" class="section">
                <div class="section-title">Workspaces ({{ filteredWorkspaces.length }})</div>
                <div
                  v-for="(workspace, idx) in filteredWorkspaces.slice(0, 5)"
                  :key="workspace._id"
                  class="result-item"
                  :class="{ selected: selectedIndex === getIndex('workspace', idx) }"
                  @click="openWorkspace(workspace)"
                  @mouseenter="selectedIndex = getIndex('workspace', idx)"
                >
                  <div class="icon" :style="{ background: generateColor(workspace.name) + '30', color: generateColor(workspace.name) }">
                    <span class="initial">{{ workspace.name[0] }}</span>
                  </div>
                  <div class="content">
                    <span class="title">{{ workspace.name }}</span>
                    <span class="description">{{ workspace.projects?.length || 0 }} projects</span>
                  </div>
                </div>
              </div>
              
              <!-- No Results -->
              <div v-if="!hasResults" class="no-results">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <p>No results found for "{{ searchQuery }}"</p>
              </div>
            </template>
          </div>
          
          <div class="footer">
            <div class="footer-hint">
              <kbd>↑</kbd>
              <kbd>↓</kbd>
              <span>to navigate</span>
            </div>
            <div class="footer-hint">
              <kbd>↵</kbd>
              <span>to select</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkspaceStore } from '../stores/workspace'
import { useProjectStore } from '../stores/project'
import { useAuthStore } from '../stores/auth'
import { formatDate } from '../utils/helpers'

const router = useRouter()
const workspaceStore = useWorkspaceStore()
const projectStore = useProjectStore()
const authStore = useAuthStore()

const isOpen = ref(false)
const searchQuery = ref('')
const selectedIndex = ref(0)
const inputRef = ref(null)

// Quick actions
const quickActions = [
  {
    id: 'new-task',
    title: 'Create New Task',
    description: 'Add a task to the current project',
    icon: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    color: 'var(--accent-emerald)',
    shortcut: 'N',
    action: () => {
      // Emit event to parent or use global state
      window.dispatchEvent(new CustomEvent('create-task'))
    }
  },
  {
    id: 'new-workspace',
    title: 'Create New Workspace',
    description: 'Start a new team workspace',
    icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/>',
    color: 'var(--primary-500)',
    action: () => router.push('/workspaces')
  },
  {
    id: 'go-calendar',
    title: 'Go to Calendar',
    description: 'View your schedule',
    icon: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    color: 'var(--accent-amber)',
    shortcut: 'C',
    action: () => router.push('/calendar')
  },
  {
    id: 'go-dashboard',
    title: 'Go to Dashboard',
    description: 'Back to home',
    icon: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    color: 'var(--accent-cyan)',
    shortcut: 'D',
    action: () => router.push('/')
  }
]

// Data from stores
const allTasks = ref([])
const allProjects = ref([])
const timeZone = computed(() => authStore.userTimezone)

const filteredTasks = computed(() => {
  if (!searchQuery.value) return []
  const q = searchQuery.value.toLowerCase()
  return allTasks.value.filter(t => 
    t.title?.toLowerCase().includes(q) || 
    t.description?.toLowerCase().includes(q)
  )
})

const filteredProjects = computed(() => {
  if (!searchQuery.value) return []
  const q = searchQuery.value.toLowerCase()
  return allProjects.value.filter(p => 
    p.name?.toLowerCase().includes(q) || 
    p.description?.toLowerCase().includes(q)
  )
})

const filteredWorkspaces = computed(() => {
  if (!searchQuery.value) return []
  const q = searchQuery.value.toLowerCase()
  return workspaceStore.workspaces.filter(w => 
    w.name?.toLowerCase().includes(q) || 
    w.description?.toLowerCase().includes(q)
  )
})

const hasResults = computed(() => {
  return filteredTasks.value.length > 0 || 
         filteredProjects.value.length > 0 || 
         filteredWorkspaces.value.length > 0
})

const totalItems = computed(() => {
  if (!searchQuery.value) return quickActions.length
  return filteredTasks.value.slice(0, 5).length + 
         filteredProjects.value.slice(0, 5).length + 
         filteredWorkspaces.value.slice(0, 5).length
})

watch(searchQuery, () => {
  selectedIndex.value = 0
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  loadData()
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

function handleKeydown(e) {
  // Cmd/Ctrl + K
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    toggle()
  }
}

async function loadData() {
  // Load workspaces
  await workspaceStore.fetchWorkspaces()
  
  // Load projects and tasks from all workspaces
  for (const workspace of workspaceStore.workspaces) {
    for (const projectRef of workspace.projects || []) {
      const projectId = typeof projectRef === 'object' ? projectRef._id : projectRef
      if (!projectId) continue
      
      try {
        await projectStore.fetchProject(projectId)
        
        // Add project if not exists
        if (!allProjects.value.find(p => p._id === projectStore.currentProject?._id)) {
          allProjects.value.push({
            ...projectStore.currentProject,
            workspace: { name: workspace.name }
          })
        }
        
        // Add tasks
        for (const task of projectStore.tasks) {
          if (!allTasks.value.find(t => t._id === task._id)) {
            allTasks.value.push({
              ...task,
              project: projectId
            })
          }
        }
      } catch (err) {
        console.error('Failed to load project:', err)
      }
    }
  }
}

function toggle() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
}

function close() {
  isOpen.value = false
  searchQuery.value = ''
  selectedIndex.value = 0
}

function navigateDown() {
  selectedIndex.value = (selectedIndex.value + 1) % totalItems.value
}

function navigateUp() {
  selectedIndex.value = (selectedIndex.value - 1 + totalItems.value) % totalItems.value
}

function selectCurrent() {
  if (!searchQuery.value) {
    const action = quickActions[selectedIndex.value]
    if (action) {
      executeAction(action)
    }
  }
}

function getIndex(type, idx) {
  let offset = 0
  if (type === 'task') return idx
  if (type === 'project') return filteredTasks.value.slice(0, 5).length + idx
  if (type === 'workspace') return filteredTasks.value.slice(0, 5).length + filteredProjects.value.slice(0, 5).length + idx
  return 0
}

function executeAction(action) {
  close()
  action.action()
}

function openTask(task) {
  close()
  router.push(`/projects/${task.project}?task=${task._id}`)
}

function openProject(project) {
  close()
  router.push(`/projects/${project._id}`)
}

function openWorkspace(workspace) {
  close()
  router.push(`/workspaces/${workspace._id}`)
}

function getProjectName(projectId) {
  const project = allProjects.value.find(p => p._id === projectId)
  return project?.name || 'Unknown Project'
}

function formatDueDate(date) {
  if (!date) return 'No date'
  return formatDate(date, timeZone.value)
}

function generateColor(str) {
  const colors = ['var(--primary-500)', 'var(--accent-cyan)', 'var(--accent-pink)', 'var(--accent-amber)', 'var(--accent-emerald)']
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
</script>

<style scoped>
.command-palette-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay-bg, rgba(0, 0, 0, 0.7));
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
  z-index: 1000;
}

.command-palette {
  width: 100%;
  max-width: 640px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg), 0 0 0 1px var(--primary-500-alpha-10, rgba(139, 92, 246, 0.1));
  overflow: hidden;
}

.search-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border-subtle);
}

.search-icon {
  width: 20px;
  height: 20px;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.search-header input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 1rem;
  outline: none;
}

.search-header input::placeholder {
  color: var(--text-tertiary);
}

.shortcut-hint {
  padding: var(--space-1) var(--space-2);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--text-tertiary);
}

.results-container {
  max-height: 400px;
  overflow-y: auto;
  padding: var(--space-2);
}

.section {
  margin-bottom: var(--space-2);
}

.section-title {
  padding: var(--space-2) var(--space-3);
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-tertiary);
}

.result-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s;
}

.result-item:hover,
.result-item.selected {
  background: var(--bg-tertiary);
}

.result-item .icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.result-item .icon svg {
  width: 18px;
  height: 18px;
}

.result-item .icon .initial {
  font-size: 1rem;
  font-weight: 600;
}

.result-item .icon.urgent {
  background: var(--accent-rose-alpha-15, rgba(244, 63, 94, 0.15));
  color: var(--accent-rose);
}

.result-item .icon.high {
  background: var(--accent-amber-alpha-15, rgba(245, 158, 11, 0.15));
  color: var(--accent-amber);
}

.result-item .icon.medium {
  background: var(--primary-500-alpha-15, rgba(139, 92, 246, 0.15));
  color: var(--primary-400);
}

.result-item .icon.low {
  background: var(--accent-emerald-alpha-15, rgba(16, 185, 129, 0.15));
  color: var(--accent-emerald);
}

.result-item .content {
  flex: 1;
  min-width: 0;
}

.result-item .title {
  display: block;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-item .description {
  display: block;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

.result-item .shortcut {
  padding: var(--space-1) var(--space-2);
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--text-tertiary);
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-10);
  color: var(--text-tertiary);
}

.no-results svg {
  width: 48px;
  height: 48px;
  margin-bottom: var(--space-3);
  opacity: 0.5;
}

.footer {
  display: flex;
  gap: var(--space-6);
  padding: var(--space-3) var(--space-5);
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-tertiary);
}

.footer-hint {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.footer-hint kbd {
  padding: 2px 6px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  font-size: 0.6875rem;
  font-weight: 600;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
