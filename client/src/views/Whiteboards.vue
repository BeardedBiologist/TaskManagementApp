<template>
  <Layout>
    <div class="whiteboards-view">
      <header class="view-header">
        <div class="header-content">
          <h1>Whiteboards</h1>
          <p>Collaborative canvases for brainstorming and planning</p>
        </div>
        <button class="btn-primary" @click="createNewWhiteboard">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Whiteboard
        </button>
      </header>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <span>Loading whiteboards...</span>
      </div>

      <div v-else-if="whiteboards.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <circle cx="15.5" cy="15.5" r="1.5"/>
          </svg>
        </div>
        <h3>No whiteboards yet</h3>
        <p>Create your first whiteboard to start collaborating visually.</p>
        <button class="btn-primary" @click="createNewWhiteboard">
          Create Whiteboard
        </button>
      </div>

      <div v-else class="whiteboards-grid">
        <div
          v-for="whiteboard in whiteboards"
          :key="whiteboard._id"
          class="whiteboard-card"
          @click="openWhiteboard(whiteboard)"
        >
          <div class="card-preview">
            <div class="preview-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <circle cx="15.5" cy="15.5" r="1.5"/>
              </svg>
            </div>
          </div>
          <div class="card-info">
            <h4>{{ whiteboard.name }}</h4>
            <p class="card-meta">
              {{ whiteboard.elements?.length || 0 }} elements • 
              {{ formatDate(whiteboard.updatedAt) }}
            </p>
            <div class="card-project" v-if="whiteboard.project">
              <span class="project-dot" :style="{ background: getProjectColor(whiteboard.project) }"></span>
              {{ getProjectName(whiteboard.project) }}
            </div>
          </div>
          <button class="delete-btn" @click.stop="deleteWhiteboard(whiteboard._id)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Create Modal -->
      <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
        <div class="modal">
          <div class="modal-header">
            <h3>Create Whiteboard</h3>
            <button class="close-btn" @click="showCreateModal = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <form @submit.prevent="handleCreate">
            <div class="form-group">
              <label>Name</label>
              <input
                v-model="newWhiteboard.name"
                type="text"
                placeholder="My Whiteboard"
                required
                autofocus
              />
            </div>
            <div class="form-group">
              <label>Project</label>
              <select v-model="newWhiteboard.projectId" required>
                <option v-for="project in projects" :key="project._id" :value="project._id">
                  {{ project.name }}
                </option>
              </select>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-secondary" @click="showCreateModal = false">
                Cancel
              </button>
              <button type="submit" class="btn-primary" :disabled="creating">
                {{ creating ? 'Creating...' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Layout from '../components/Layout.vue'
import { useProjectStore } from '../stores/project'
import api from '../utils/api'

const router = useRouter()
const projectStore = useProjectStore()

const whiteboards = ref([])
const projects = ref([])
const loading = ref(true)
const showCreateModal = ref(false)
const creating = ref(false)
const newWhiteboard = ref({ name: '', projectId: '' })

onMounted(async () => {
  await Promise.all([loadWhiteboards(), loadProjects()])
  loading.value = false
})

async function loadWhiteboards() {
  try {
    const { data } = await api.get('/whiteboards')
    whiteboards.value = data
  } catch (err) {
    console.error('Failed to load whiteboards:', err)
  }
}

async function loadProjects() {
  await projectStore.fetchProjects()
  projects.value = projectStore.projects
}

function createNewWhiteboard() {
  newWhiteboard.value = { name: '', projectId: projects.value[0]?._id || '' }
  showCreateModal.value = true
}

async function handleCreate() {
  creating.value = true
  try {
    const { data } = await api.post('/whiteboards', {
      name: newWhiteboard.value.name,
      projectId: newWhiteboard.value.projectId
    })
    showCreateModal.value = false
    router.push(`/projects/${newWhiteboard.value.projectId}?view=whiteboard&id=${data._id}`)
  } catch (err) {
    console.error('Failed to create whiteboard:', err)
  } finally {
    creating.value = false
  }
}

function openWhiteboard(whiteboard) {
  router.push(`/projects/${whiteboard.project}?view=whiteboard&id=${whiteboard._id}`)
}

async function deleteWhiteboard(id) {
  if (!confirm('Delete this whiteboard?')) return
  try {
    await api.delete(`/whiteboards/${id}`)
    whiteboards.value = whiteboards.value.filter(w => w._id !== id)
  } catch (err) {
    console.error('Failed to delete whiteboard:', err)
  }
}

function getProjectColor(projectId) {
  const project = projects.value.find(p => p._id === projectId)
  if (!project) return '#8b5cf6'
  const colors = ['#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981']
  let hash = 0
  for (let i = 0; i < project.name.length; i++) {
    hash = project.name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function getProjectName(projectId) {
  const project = projects.value.find(p => p._id === projectId)
  return project?.name || 'Unknown Project'
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<style scoped>
.whiteboards-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
}

.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-8);
}

.header-content h1 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: var(--space-1);
}

.header-content p {
  color: var(--text-secondary);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
  border: none;
  border-radius: var(--radius-md);
  color: white;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
}

.btn-primary svg {
  width: 18px;
  height: 18px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16);
  gap: var(--space-4);
  color: var(--text-muted);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-subtle);
  border-top-color: var(--primary-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16);
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border: 2px dashed var(--border-subtle);
  border-radius: var(--radius-xl);
  margin-bottom: var(--space-6);
  color: var(--text-tertiary);
}

.empty-icon svg {
  width: 40px;
  height: 40px;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: var(--space-2);
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
}

.whiteboards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
}

.whiteboard-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.whiteboard-card:hover {
  transform: translateY(-4px);
  border-color: var(--border-default);
  box-shadow: var(--shadow-lg);
}

.card-preview {
  height: 160px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-placeholder {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-tertiary);
}

.preview-placeholder svg {
  width: 32px;
  height: 32px;
}

.card-info {
  padding: var(--space-4);
}

.card-info h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: var(--space-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-meta {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  margin-bottom: var(--space-2);
}

.card-project {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.project-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.delete-btn {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-elevated);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--text-tertiary);
  opacity: 0;
  transition: all 0.15s ease;
}

.whiteboard-card:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: var(--accent-rose-alpha-10, rgba(244, 63, 94, 0.1));
  color: var(--accent-rose);
}

.delete-btn svg {
  width: 14px;
  height: 14px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  width: 100%;
  max-width: 400px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-6);
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  width: 32px;
  height: 32px;
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
  background: var(--bg-hover);
  color: var(--text-primary);
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-group label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: var(--space-3);
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 0.9375rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-500);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-6);
}

.btn-secondary {
  padding: var(--space-2) var(--space-4);
  background: transparent;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}
</style>
