<template>
  <Layout>
    <div class="dashboard">
      <header class="page-header">
        <div class="header-content">
          <h1>Dashboard</h1>
          <p class="subtitle">Welcome back, {{ authStore.userName }}! Here's what's happening.</p>
        </div>
        <button class="btn btn-primary" @click="showCreateWorkspace = true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Workspace
        </button>
      </header>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>

      <div v-else class="dashboard-content">
        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(139, 92, 246, 0.15); color: #a78bfa;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ workspaceStore.workspaces.length }}</span>
              <span class="stat-label">Workspaces</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(6, 182, 212, 0.15); color: #22d3ee;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ totalProjects }}</span>
              <span class="stat-label">Projects</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(16, 185, 129, 0.15); color: #34d399;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ totalTasks }}</span>
              <span class="stat-label">Active Tasks</span>
            </div>
          </div>
        </div>

        <!-- Recent Workspaces -->
        <section class="section">
          <div class="section-header">
            <h2>Your Workspaces</h2>
            <router-link to="/workspaces" class="view-all">
              View All
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </router-link>
          </div>
          
          <div v-if="workspaceStore.workspaces.length === 0" class="empty-card">
            <div class="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3>No workspaces yet</h3>
            <p>Create your first workspace to start collaborating with your team.</p>
            <button class="btn btn-primary" @click="showCreateWorkspace = true">
              Create Workspace
            </button>
          </div>
          
          <div v-else class="workspaces-grid">
            <router-link 
              v-for="workspace in workspaceStore.workspaces.slice(0, 6)" 
              :key="workspace._id"
              :to="`/workspaces/${workspace._id}`"
              class="workspace-card card-hover"
            >
              <div class="workspace-header">
                <div class="workspace-avatar" :style="{ background: generateColor(workspace.name) }">
                  {{ workspace.name[0] }}
                </div>
                <div class="workspace-meta">
                  <h3>{{ workspace.name }}</h3>
                  <p>{{ workspace.projects?.length || 0 }} projects</p>
                </div>
              </div>
              <p class="workspace-desc">{{ workspace.description || 'No description' }}</p>
              <div class="workspace-footer">
                <div class="member-avatars">
                  <div 
                    v-for="member in workspace.members?.slice(0, 3)" 
                    :key="member.user._id"
                    class="avatar avatar-sm"
                  >
                    {{ getInitials(member.user.name.first, member.user.name.last) }}
                  </div>
                  <span v-if="workspace.members?.length > 3" class="more-count">
                    +{{ workspace.members.length - 3 }}
                  </span>
                </div>
                <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </router-link>
          </div>
        </section>
      </div>

      <!-- Create Workspace Modal -->
      <div v-if="showCreateWorkspace" class="modal-overlay" @click.self="showCreateWorkspace = false">
        <div class="modal">
          <div class="modal-header">
            <h3>Create Workspace</h3>
            <button class="btn btn-icon btn-ghost" @click="showCreateWorkspace = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <form @submit.prevent="createWorkspace">
            <div class="form-group">
              <label class="form-label">Workspace Name</label>
              <input 
                v-model="newWorkspace.name" 
                type="text" 
                class="form-input"
                placeholder="e.g., Engineering Team"
                required
                autofocus
              />
            </div>
            <div class="form-group">
              <label class="form-label">Description <span class="optional">(optional)</span></label>
              <textarea 
                v-model="newWorkspace.description" 
                class="form-textarea"
                rows="3"
                placeholder="What is this workspace for?"
              ></textarea>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-ghost" @click="showCreateWorkspace = false">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="creating">
                {{ creating ? 'Creating...' : 'Create Workspace' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Layout from '../components/Layout.vue'
import { useAuthStore } from '../stores/auth'
import { useWorkspaceStore } from '../stores/workspace'
import { getInitials } from '../utils/helpers'

const authStore = useAuthStore()
const workspaceStore = useWorkspaceStore()

const loading = ref(true)
const showCreateWorkspace = ref(false)
const creating = ref(false)
const newWorkspace = ref({ name: '', description: '' })

const totalProjects = computed(() => {
  return workspaceStore.workspaces.reduce((acc, w) => acc + (w.projects?.length || 0), 0)
})

const totalTasks = computed(() => {
  return 0 // Would need to fetch from API
})

onMounted(async () => {
  await workspaceStore.fetchWorkspaces()
  loading.value = false
})

async function createWorkspace() {
  if (!newWorkspace.value.name.trim()) return
  creating.value = true
  try {
    await workspaceStore.createWorkspace({
      name: newWorkspace.value.name,
      description: newWorkspace.value.description
    })
    showCreateWorkspace.value = false
    newWorkspace.value = { name: '', description: '' }
  } finally {
    creating.value = false
  }
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
</script>

<style scoped>
.dashboard {
  padding: var(--space-6) var(--space-8);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-8);
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

.page-header .btn svg {
  width: 16px;
  height: 16px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-5);
  margin-bottom: var(--space-10);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-5);
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon svg {
  width: 22px;
  height: 22px;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Section */
.section {
  margin-bottom: var(--space-8);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-5);
}

.section-header h2 {
  font-size: 1.125rem;
  font-weight: 600;
}

.view-all {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--primary-400);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
}

.view-all:hover {
  color: var(--primary-300);
}

.view-all svg {
  width: 16px;
  height: 16px;
}

/* Empty Card */
.empty-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-12);
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--space-5);
  color: var(--text-tertiary);
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: var(--space-2);
}

.empty-card p {
  color: var(--text-secondary);
  margin-bottom: var(--space-5);
}

/* Workspaces Grid */
.workspaces-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-4);
}

.workspace-card {
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  text-decoration: none;
  color: inherit;
}

.workspace-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.workspace-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

.workspace-meta h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.workspace-meta p {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
}

.workspace-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: var(--space-4);
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.workspace-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-subtle);
}

.member-avatars {
  display: flex;
  align-items: center;
}

.member-avatars .avatar {
  margin-left: -8px;
  border: 2px solid var(--bg-secondary);
}

.member-avatars .avatar:first-child {
  margin-left: 0;
}

.more-count {
  margin-left: var(--space-2);
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.arrow {
  width: 18px;
  height: 18px;
  color: var(--text-tertiary);
  transition: all 0.2s;
}

.workspace-card:hover .arrow {
  color: var(--primary-400);
  transform: translateX(4px);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
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
  max-width: 440px;
  box-shadow: var(--shadow-lg);
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

.optional {
  color: var(--text-tertiary);
  font-weight: 400;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-subtle);
}
</style>
