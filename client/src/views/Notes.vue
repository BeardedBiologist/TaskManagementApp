<template>
  <Layout>
    <div class="notes-page">
      <header class="page-header">
        <div class="header-content">
          <h1>All Notes</h1>
          <p class="subtitle">View and manage all your notes across workspaces</p>
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
              placeholder="Search notes..."
            />
          </div>
          <button class="btn btn-primary" @click="showCreateModal = true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Note
          </button>
        </div>
      </header>

      <!-- Filters -->
      <div class="filters-bar">
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
        <div class="filter-group">
          <label>Sort By</label>
          <select v-model="sortBy">
            <option value="updatedAt">Last Updated</option>
            <option value="createdAt">Date Created</option>
            <option value="title">Title</option>
          </select>
        </div>
        <button v-if="hasActiveFilters" class="btn btn-ghost btn-sm" @click="clearFilters">
          Clear filters
        </button>
      </div>

      <!-- Stats Cards -->
      <div v-if="!loading && allNotes.length > 0" class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon total">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ allNotes.length }}</span>
            <span class="stat-label">Total Notes</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon workspaces">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ workspacesWithNotes }}</span>
            <span class="stat-label">Workspaces</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon projects">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ projectsWithNotes }}</span>
            <span class="stat-label">Projects</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon recent">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ recentlyUpdated }}</span>
            <span class="stat-label">Updated this week</span>
          </div>
        </div>
      </div>

      <!-- Notes Section Header -->
      <div v-if="!loading && (allNotes.length > 0 || hasActiveFilters)" class="notes-section-header">
        <h2>Your Notes</h2>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading notes...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredNotes.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <h3>No notes found</h3>
        <p v-if="hasActiveFilters">Try adjusting your filters or search query.</p>
        <p v-else>You don't have any notes yet. Create your first note to get started.</p>
        <button v-if="!hasActiveFilters" class="btn btn-primary" @click="showCreateModal = true">
          Create your first note
        </button>
      </div>

      <!-- Notes Grid -->
      <div v-else class="notes-grid">
        <div
          v-for="note in filteredNotes"
          :key="note._id"
          class="note-card"
          @click="openNote(note)"
        >
          <div class="note-header">
            <div class="note-icon">
              <span v-if="note.icon" class="note-icon-emoji">{{ note.icon }}</span>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div class="note-actions" @click.stop>
              <button class="btn btn-icon btn-ghost btn-sm" @click="editNote(note)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button class="btn btn-icon btn-ghost btn-sm" @click="deleteNote(note)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                </svg>
              </button>
            </div>
          </div>
          <h4 class="note-title">{{ note.title }}</h4>
          <p v-if="note.excerpt" class="note-excerpt">{{ note.excerpt }}</p>
          <div class="note-meta">
            <span class="project-badge" :style="{ background: getProjectColor(note.project) }">
              {{ getProjectName(note.project) }}
            </span>
            <span class="note-date">{{ formatDate(note.updatedAt || note.createdAt) }}</span>
          </div>
        </div>
      </div>

    </div>

    <!-- Create Note Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
          <Transition name="scale">
            <div v-if="showCreateModal" class="modal">
              <div class="modal-header">
                <h3>{{ editingNote ? 'Edit Note' : 'Create New Note' }}</h3>
                <button class="btn btn-icon btn-ghost" @click="closeModal">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <form @submit.prevent="saveNote">
                <div class="form-group">
                  <label class="form-label">Title</label>
                  <input
                    v-model="noteForm.title"
                    type="text"
                    class="form-input"
                    placeholder="Note title"
                    required
                    autofocus
                  />
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Workspace</label>
                    <select v-model="noteForm.workspaceId" class="form-select" required @change="noteForm.projectId = ''">
                      <option value="">Select workspace</option>
                      <option v-for="ws in workspaceStore.workspaces" :key="ws._id" :value="ws._id">
                        {{ ws.name }}
                      </option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Project</label>
                    <select v-model="noteForm.projectId" class="form-select" required>
                      <option value="">Select project</option>
                      <option
                        v-for="proj in availableProjects"
                        :key="proj._id"
                        :value="proj._id"
                      >
                        {{ proj.name }}
                      </option>
                    </select>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-ghost" @click="closeModal">
                    Cancel
                  </button>
                  <button type="submit" class="btn btn-primary" :disabled="saving">
                    {{ saving ? 'Saving...' : (editingNote ? 'Save Changes' : 'Create Note') }}
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
const allNotes = ref([])
const searchQuery = ref('')
const filterWorkspace = ref('')
const filterProject = ref('')
const sortBy = ref('updatedAt')
const showCreateModal = ref(false)
const saving = ref(false)
const editingNote = ref(null)

const noteForm = ref({
  title: '',
  workspaceId: '',
  projectId: ''
})

const hasActiveFilters = computed(() => {
  return filterWorkspace.value || filterProject.value || searchQuery.value
})

const filteredProjects = computed(() => {
  if (!filterWorkspace.value) return projectStore.projects
  return projectStore.projects.filter(p => {
    const wsId = p.workspace?._id || p.workspace
    return wsId === filterWorkspace.value
  })
})

const availableProjects = computed(() => {
  if (!noteForm.value.workspaceId) return []
  return projectStore.projects.filter(p => {
    const wsId = p.workspace?._id || p.workspace
    return wsId === noteForm.value.workspaceId
  })
})

const filteredNotes = computed(() => {
  let notes = [...allNotes.value]

  // Search filter
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    notes = notes.filter(n => n.title.toLowerCase().includes(q))
  }

  // Workspace filter
  if (filterWorkspace.value) {
    notes = notes.filter(n => {
      const proj = projectStore.projects.find(p => p._id === (n.project?._id || n.project))
      return proj && (proj.workspace?._id || proj.workspace) === filterWorkspace.value
    })
  }

  // Project filter
  if (filterProject.value) {
    notes = notes.filter(n => (n.project?._id || n.project) === filterProject.value)
  }

  // Sort
  notes.sort((a, b) => {
    if (sortBy.value === 'title') {
      return a.title.localeCompare(b.title)
    }
    const dateA = new Date(a[sortBy.value] || a.createdAt)
    const dateB = new Date(b[sortBy.value] || b.createdAt)
    return dateB - dateA
  })

  return notes
})

const workspacesWithNotes = computed(() => {
  const wsIds = new Set()
  allNotes.value.forEach(note => {
    const proj = projectStore.projects.find(p => p._id === (note.project?._id || note.project))
    if (proj) {
      wsIds.add(proj.workspace?._id || proj.workspace)
    }
  })
  return wsIds.size
})

const projectsWithNotes = computed(() => {
  const projIds = new Set(allNotes.value.map(n => n.project?._id || n.project))
  return projIds.size
})

const recentlyUpdated = computed(() => {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  return allNotes.value.filter(n => {
    const updated = new Date(n.updatedAt || n.createdAt)
    return updated > oneWeekAgo
  }).length
})

onMounted(async () => {
  await Promise.all([
    workspaceStore.fetchWorkspaces(),
    projectStore.fetchProjects(),
    fetchAllNotes()
  ])
})

async function fetchAllNotes() {
  loading.value = true
  try {
    const { data } = await api.get('/pages')
    allNotes.value = data.map(note => ({
      ...note,
      excerpt: generateExcerpt(note.content)
    }))
  } catch (err) {
    console.error('Failed to fetch notes:', err)
  } finally {
    loading.value = false
  }
}

function generateExcerpt(content) {
  if (!content || !content.blocks) return ''
  const text = content.blocks
    .filter(b => b.type === 'text' || b.type === 'heading')
    .map(b => b.content)
    .join(' ')
    .slice(0, 120)
  return text.length === 120 ? text + '...' : text
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

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  
  // Less than 24 hours
  if (diff < 24 * 60 * 60 * 1000) {
    if (diff < 60 * 60 * 1000) {
      const mins = Math.floor(diff / (60 * 1000))
      return mins < 1 ? 'Just now' : `${mins}m ago`
    }
    const hours = Math.floor(diff / (60 * 60 * 1000))
    return `${hours}h ago`
  }
  
  // Less than 7 days
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return days === 1 ? 'Yesterday' : `${days}d ago`
  }
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function openNote(note) {
  const projectId = note.project?._id || note.project
  if (projectId) {
    router.push(`/projects/${projectId}/pages/${note._id}?from=notes`)
  }
}

function editNote(note) {
  editingNote.value = note
  const proj = projectStore.projects.find(p => p._id === (note.project?._id || note.project))
  noteForm.value = {
    title: note.title,
    workspaceId: proj?.workspace?._id || proj?.workspace || '',
    projectId: note.project?._id || note.project
  }
  showCreateModal.value = true
}

function closeModal() {
  showCreateModal.value = false
  editingNote.value = null
  noteForm.value = { title: '', workspaceId: '', projectId: '' }
}

async function saveNote() {
  if (!noteForm.value.title.trim() || !noteForm.value.projectId) return

  saving.value = true
  try {
    if (editingNote.value) {
      await api.put(`/pages/${editingNote.value._id}`, {
        title: noteForm.value.title,
        projectId: noteForm.value.projectId
      })
    } else {
      await api.post('/pages', {
        title: noteForm.value.title,
        projectId: noteForm.value.projectId,
        content: {
          blocks: [{
            id: crypto.randomUUID(),
            type: 'text',
            content: ''
          }]
        }
      })
    }

    closeModal()
    await fetchAllNotes()
  } catch (err) {
    console.error('Failed to save note:', err)
  } finally {
    saving.value = false
  }
}

async function deleteNote(note) {
  if (!confirm(`Are you sure you want to delete "${note.title}"?`)) return

  try {
    await api.delete(`/pages/${note._id}`)
    await fetchAllNotes()
  } catch (err) {
    console.error('Failed to delete note:', err)
  }
}

function clearFilters() {
  searchQuery.value = ''
  filterWorkspace.value = ''
  filterProject.value = ''
}
</script>

<style scoped>
.notes-page {
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

/* Stats Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-5);
  background: var(--bg-elevated);
  border: 1px solid transparent; /* Removed border to differentiate */
  border-radius: var(--radius-xl); /* Rounded more */
  transition: all 0.15s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  background: var(--bg-secondary);
  box-shadow: var(--shadow-sm);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon svg {
  width: 24px;
  height: 24px;
}

.stat-icon.total { background: rgba(139, 92, 246, 0.1); color: var(--primary-500); }
.stat-icon.workspaces { background: rgba(6, 182, 212, 0.1); color: var(--accent-cyan); }
.stat-icon.projects { background: rgba(245, 158, 11, 0.1); color: var(--accent-amber); }
.stat-icon.recent { background: rgba(16, 185, 129, 0.1); color: var(--accent-emerald); }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Notes Section Header */
.notes-section-header {
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--border-subtle);
}

.notes-section-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
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

/* Notes Grid */
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-4);
}

.note-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  cursor: pointer;
  transition: all 0.2s ease;
}

.note-card:hover {
  border-color: var(--primary-500);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-3);
}

.note-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--primary-500-alpha-15, rgba(139, 92, 246, 0.15)), var(--primary-600-alpha-15, rgba(124, 58, 237, 0.15)));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-500);
}

.note-icon svg {
  width: 20px;
  height: 20px;
}

.note-icon-emoji {
  font-size: 18px;
  line-height: 1;
}

.note-actions {
  display: flex;
  gap: var(--space-1);
  opacity: 0;
  transition: opacity 0.15s ease;
}

.note-card:hover .note-actions {
  opacity: 1;
}

.note-actions .btn svg {
  width: 14px;
  height: 14px;
}

.note-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.note-excerpt {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: var(--space-3);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.note-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.project-badge {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.6875rem;
  font-weight: 600;
  color: white;
}

.note-date {
  font-size: 0.75rem;
  color: var(--text-tertiary);
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
  .notes-page {
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

  .notes-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  }

  .note-actions {
    opacity: 1;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767px) {
  .notes-page {
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

  .notes-grid {
    grid-template-columns: 1fr;
  }

  .note-card {
    padding: var(--space-4);
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-3);
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
