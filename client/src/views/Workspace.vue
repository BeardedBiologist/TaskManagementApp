<template>
  <Layout>
    <div class="workspace-page">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>

      <div v-else-if="error" class="error-alert">
        {{ error }}
      </div>

      <template v-else-if="workspaceStore.currentWorkspace">
        <header class="page-header">
          <div class="header-left">
            <div class="workspace-avatar-lg">{{ workspaceStore.currentWorkspace.name[0] }}</div>
            <div>
              <h1>{{ workspaceStore.currentWorkspace.name }}</h1>
              <p class="subtitle">{{ workspaceStore.currentWorkspace.description || 'No description' }}</p>
            </div>
          </div>
          <div class="header-actions">
            <button class="btn btn-primary" @click="openCreateModal">
              + New Project
            </button>
          </div>
        </header>

        <div class="workspace-tabs">
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'projects' }"
            @click="activeTab = 'projects'"
          >
            Projects
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'members' }"
            @click="activeTab = 'members'"
          >
            Members ({{ workspaceStore.currentWorkspace.members?.length || 0 }})
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'settings' }"
            @click="activeTab = 'settings'"
          >
            Settings
          </button>
        </div>

        <!-- Projects Tab -->
        <div v-if="activeTab === 'projects'" class="tab-content">
          <div v-if="projects.length === 0" class="empty-state">
            <div class="empty-icon">📁</div>
            <h3>No projects yet</h3>
            <p>Create your first project to start organizing tasks.</p>
            <button class="btn btn-primary" @click="openCreateModal">
              Create Project
            </button>
          </div>

          <div v-else class="projects-grid">
            <router-link 
              v-for="project in projects" 
              :key="project._id"
              :to="`/projects/${project._id}`"
              class="project-card"
            >
              <h3>{{ project.name }}</h3>
              <p>{{ project.description || 'No description' }}</p>
              <div class="project-meta">
                <span class="status-badge" :class="{ archived: project.settings?.isArchived }">
                  {{ project.settings?.isArchived ? 'Archived' : 'Active' }}
                </span>
                <span class="date">{{ formatDate(project.createdAt, authStore.userTimezone) }}</span>
              </div>
            </router-link>
          </div>
        </div>

        <!-- Members Tab -->
        <div v-if="activeTab === 'members'" class="tab-content">
          <div class="card">
            <div class="card-header">
              <h3>Workspace Members</h3>
              <button class="btn btn-primary btn-sm" @click="showAddMember = true">
                + Add Member
              </button>
            </div>
            
            <div class="members-list">
              <div 
                v-for="member in workspaceStore.currentWorkspace.members" 
                :key="member.user._id"
                class="member-item"
              >
                <div class="avatar">{{ getInitials(member.user.name.first, member.user.name.last) }}</div>
                <div class="member-info">
                  <span class="member-name">{{ member.user.name.first }} {{ member.user.name.last }}</span>
                  <span class="member-email">{{ member.user.email }}</span>
                </div>
                <span class="badge" :class="member.role">{{ member.role }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Settings Tab -->
        <div v-if="activeTab === 'settings'" class="tab-content">
          <div class="card settings-card">
            <h3>Workspace Settings</h3>
            <form @submit.prevent="updateSettings">
              <div class="form-group">
                <label class="form-label">Workspace Name</label>
                <input v-model="settings.name" type="text" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea v-model="settings.description" class="form-input" rows="3"></textarea>
              </div>
              <div class="form-actions">
                <button type="submit" class="btn btn-primary" :disabled="savingSettings">
                  {{ savingSettings ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </template>

      <!-- Create Project Modal -->
      <div v-if="showCreateProject" class="modal-overlay" @click="closeCreateModal">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h2>Create New Project</h2>
            <button class="btn-icon" @click="closeCreateModal">✕</button>
          </div>
          <form @submit.prevent="createProject">
            <div v-if="error" class="modal-error">{{ error }}</div>
            <div class="form-group">
              <label class="form-label">Project Name *</label>
              <input v-model="newProject.name" type="text" class="form-input" required />
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea v-model="newProject.description" class="form-input" rows="3"></textarea>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeCreateModal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="creatingProject">
                {{ creatingProject ? 'Creating...' : 'Create Project' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Add Member Modal -->
      <div v-if="showAddMember" class="modal-overlay" @click="showAddMember = false">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h2>Add Member</h2>
            <button class="btn-icon" @click="showAddMember = false">✕</button>
          </div>
          <form @submit.prevent="addMember">
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input v-model="memberEmail" type="email" class="form-input" placeholder="colleague@example.com" required />
            </div>
            <div class="form-group">
              <label class="form-label">Role</label>
              <select v-model="memberRole" class="form-input">
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showAddMember = false">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="addingMember">
                {{ addingMember ? 'Adding...' : 'Add Member' }}
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
import { useRoute } from 'vue-router'
import Layout from '../components/Layout.vue'
import { useWorkspaceStore } from '../stores/workspace'
import { useProjectStore } from '../stores/project'
import { useSocketStore } from '../stores/socket'
import { useAuthStore } from '../stores/auth'
import { formatDate, getInitials } from '../utils/helpers'

const route = useRoute()
const workspaceStore = useWorkspaceStore()
const projectStore = useProjectStore()
const socketStore = useSocketStore()
const authStore = useAuthStore()

const loading = ref(true)
const activeTab = ref('projects')
const error = ref(null)

const showCreateProject = ref(false)
const showAddMember = ref(false)
const creatingProject = ref(false)
const addingMember = ref(false)
const savingSettings = ref(false)

const newProject = ref({ name: '', description: '' })
const memberEmail = ref('')
const memberRole = ref('member')
const settings = ref({ name: '', description: '' })

const projects = computed(() => {
  return projectStore.projects.filter(p => {
    const projectWorkspaceId = typeof p.workspace === 'object' ? p.workspace._id : p.workspace
    return projectWorkspaceId === route.params.id
  })
})

onMounted(async () => {
  await loadWorkspace()
})

onUnmounted(() => {
  if (workspaceStore.currentWorkspace) {
    socketStore.leaveWorkspace(workspaceStore.currentWorkspace._id)
  }
})

watch(() => route.params.id, loadWorkspace)

async function loadWorkspace() {
  loading.value = true
  try {
    await workspaceStore.fetchWorkspace(route.params.id)
    await projectStore.fetchProjects(route.params.id)
    socketStore.joinWorkspace(route.params.id)
    
    // Initialize settings form
    if (workspaceStore.currentWorkspace) {
      settings.value = {
        name: workspaceStore.currentWorkspace.name,
        description: workspaceStore.currentWorkspace.description || ''
      }
    }
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  error.value = null
  newProject.value = { name: '', description: '' }
  showCreateProject.value = true
}

function closeCreateModal() {
  showCreateProject.value = false
  error.value = null
}

async function createProject() {
  creatingProject.value = true
  error.value = null
  try {
    await projectStore.createProject({
      name: newProject.value.name,
      description: newProject.value.description,
      workspaceId: route.params.id
    })
    closeCreateModal()
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to create project'
  } finally {
    creatingProject.value = false
  }
}

async function addMember() {
  addingMember.value = true
  try {
    // This would need a user search endpoint to get the user ID from email
    // For now, just showing the structure
    showAddMember.value = false
    memberEmail.value = ''
    memberRole.value = 'member'
  } finally {
    addingMember.value = false
  }
}

async function updateSettings() {
  savingSettings.value = true
  try {
    await workspaceStore.updateWorkspace(route.params.id, settings.value)
  } finally {
    savingSettings.value = false
  }
}
</script>

<style scoped>
.workspace-page {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.workspace-avatar-lg {
  width: 4rem;
  height: 4rem;
  border-radius: 1rem;
  background-color: var(--primary-500);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
}

.page-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.subtitle {
  color: var(--text-secondary);
}

.workspace-tabs {
  display: flex;
  gap: var(--space-2);
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: var(--space-6);
}

.tab-btn {
  padding: var(--space-3) var(--space-4);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: var(--text-primary);
}

.tab-btn.active {
  color: var(--primary-400);
  border-bottom-color: var(--primary-500);
}

.tab-content {
  min-height: 300px;
}

.error-alert {
  background-color: var(--accent-rose-alpha-10, rgba(244, 63, 94, 0.1));
  color: var(--accent-rose);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-4);
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.project-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}

.project-card:hover {
  border-color: var(--primary-500);
  box-shadow: var(--shadow-md);
}

.project-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.project-card p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: var(--space-4);
}

.project-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-badge {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
  background-color: var(--accent-emerald-alpha-15, rgba(16, 185, 129, 0.15));
  color: var(--accent-emerald);
}

.status-badge.archived {
  background-color: var(--bg-tertiary);
  color: var(--text-tertiary);
}

.date {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border-subtle);
}

.card-header h3 {
  font-size: 1rem;
  font-weight: 600;
}

.members-list {
  padding: 0.5rem 0;
}

.member-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-6);
  border-bottom: 1px solid var(--border-subtle);
}

.member-item:last-child {
  border-bottom: none;
}

.member-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.member-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.member-email {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.badge {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.badge.owner {
  background-color: var(--accent-amber-alpha-15, rgba(245, 158, 11, 0.15));
  color: var(--accent-amber);
}

.badge.admin {
  background-color: var(--primary-500-alpha-15, rgba(139, 92, 246, 0.15));
  color: var(--primary-400);
}

.badge.member {
  background-color: var(--bg-elevated);
  color: var(--text-secondary);
}

.settings-card {
  padding: var(--space-6);
  max-width: 600px;
}

.settings-card h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: var(--space-6);
}

.form-actions {
  margin-top: var(--space-6);
}

.empty-state {
  text-align: center;
  padding: var(--space-12) var(--space-8);
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--space-4);
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

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: var(--overlay-bg, rgba(0, 0, 0, 0.5));
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal {
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 400px;
  margin: 1rem;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--border-subtle);
}

.modal-header h2 {
  font-size: 1.125rem;
  font-weight: 600;
}

.modal form {
  padding: var(--space-6);
}

.modal-error {
  background-color: var(--accent-rose-alpha-10, rgba(244, 63, 94, 0.1));
  color: var(--accent-rose);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-4);
  font-size: 0.875rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-6);
}
</style>
