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
                <span class="date">{{ formatDate(project.createdAt) }}</span>
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
import { formatDate, getInitials } from '../utils/helpers'

const route = useRoute()
const workspaceStore = useWorkspaceStore()
const projectStore = useProjectStore()
const socketStore = useSocketStore()

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
  background-color: #3b82f6;
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
  color: #1f2937;
}

.subtitle {
  color: #6b7280;
}

.workspace-tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
}

.tab-btn {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #374151;
}

.tab-btn.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.tab-content {
  min-height: 300px;
}

.error-alert {
  background-color: #fee2e2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.project-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.25rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
}

.project-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.project-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.project-card p {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.project-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.archived {
  background-color: #e5e7eb;
  color: #4b5563;
}

.date {
  font-size: 0.75rem;
  color: #9ca3af;
}

.card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
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
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
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
}

.member-email {
  font-size: 0.75rem;
  color: #6b7280;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.badge.owner {
  background-color: #fef3c7;
  color: #92400e;
}

.badge.admin {
  background-color: #dbeafe;
  color: #1e40af;
}

.badge.member {
  background-color: #e5e7eb;
  color: #4b5563;
}

.settings-card {
  padding: 1.5rem;
  max-width: 600px;
}

.settings-card h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.form-actions {
  margin-top: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal {
  background: white;
  border-radius: 0.75rem;
  width: 100%;
  max-width: 400px;
  margin: 1rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 1.125rem;
  font-weight: 600;
}

.modal form {
  padding: 1.5rem;
}

.modal-error {
  background-color: #fee2e2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}
</style>
