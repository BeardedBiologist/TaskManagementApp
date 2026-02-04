<template>
  <Layout>
    <div class="profile-page">
      <header class="page-header">
        <h1>Profile</h1>
      </header>

      <div class="profile-content">
        <div class="card">
          <div class="profile-header">
            <div class="avatar avatar-lg">{{ authStore.userInitials }}</div>
            <div class="profile-info">
              <h2>{{ authStore.userName }}</h2>
              <p>{{ authStore.user?.email }}</p>
              <span class="role-badge">{{ authStore.user?.role }}</span>
            </div>
          </div>

          <div class="profile-stats">
            <div class="stat">
              <span class="stat-value">{{ workspaceStore.workspaces.length }}</span>
              <span class="stat-label">Workspaces</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ totalProjects }}</span>
              <span class="stat-label">Projects</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ memberSince }}</span>
              <span class="stat-label">Member Since</span>
            </div>
          </div>
        </div>

        <div class="card settings-card">
          <h3>Account Settings</h3>
          <form @submit.prevent="updateProfile">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">First Name</label>
                <input v-model="profile.firstName" type="text" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Last Name</label>
                <input v-model="profile.lastName" type="text" class="form-input" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input v-model="profile.email" type="email" class="form-input" disabled />
              <span class="form-hint">Email cannot be changed</span>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="updating">
                {{ updating ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>

        <div class="card danger-zone">
          <h3>Danger Zone</h3>
          <div class="danger-item">
            <div>
              <h4>Sign Out</h4>
              <p>Sign out from all devices</p>
            </div>
            <button class="btn btn-secondary" @click="handleLogout">Sign Out</button>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import Layout from '../components/Layout.vue'
import { useAuthStore } from '../stores/auth'
import { useWorkspaceStore } from '../stores/workspace'
import { useSocketStore } from '../stores/socket'

const router = useRouter()
const authStore = useAuthStore()
const workspaceStore = useWorkspaceStore()
const socketStore = useSocketStore()

const updating = ref(false)
const profile = ref({
  firstName: '',
  lastName: '',
  email: ''
})

const totalProjects = computed(() => {
  return workspaceStore.workspaces.reduce((acc, w) => acc + (w.projects?.length || 0), 0)
})

const memberSince = computed(() => {
  if (!authStore.user?.createdAt) return ''
  return format(new Date(authStore.user.createdAt), 'MMM yyyy')
})

onMounted(() => {
  if (authStore.user) {
    profile.value = {
      firstName: authStore.user.name.first,
      lastName: authStore.user.name.last,
      email: authStore.user.email
    }
  }
})

async function updateProfile() {
  updating.value = true
  // This would need an API endpoint to update profile
  await new Promise(resolve => setTimeout(resolve, 500))
  updating.value = false
}

function handleLogout() {
  authStore.logout()
  socketStore.disconnect()
  router.push('/login')
}
</script>

<style scoped>
.profile-page {
  padding: 2rem;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-primary);
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 600px;
}

.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  margin-bottom: var(--space-6);
}

.profile-info h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.profile-info p {
  color: var(--text-secondary);
  margin-top: var(--space-1);
}

.role-badge {
  display: inline-block;
  margin-top: var(--space-2);
  padding: var(--space-1) var(--space-3);
  background-color: rgba(139, 92, 246, 0.15);
  color: var(--primary-400);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
  padding-top: var(--space-6);
  border-top: 1px solid var(--border-subtle);
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.settings-card h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: var(--space-6);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.form-hint {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-top: var(--space-1);
}

.form-actions {
  margin-top: var(--space-6);
}

.danger-zone h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--accent-rose);
  margin-bottom: var(--space-4);
}

.danger-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  background-color: rgba(244, 63, 94, 0.1);
  border-radius: var(--radius-md);
  border: 1px solid rgba(244, 63, 94, 0.2);
}

.danger-item h4 {
  font-weight: 500;
  color: var(--text-primary);
}

.danger-item p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: var(--space-1);
}
</style>
