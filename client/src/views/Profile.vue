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
            <div class="form-group">
              <label class="form-label">Time Zone</label>
              <select v-model="profile.timezone" class="form-input">
                <option v-for="tz in timezones" :key="tz" :value="tz">
                  {{ tz }}
                </option>
              </select>
              <span class="form-hint">Used to render dates and "today/tomorrow" correctly</span>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="updating">
                {{ updating ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>

        <div class="card appearance-card">
          <h3>Appearance</h3>
          <p class="section-description">Customize how TaskFlow looks for you.</p>
          
          <div class="form-group">
            <label class="form-label">Theme</label>
            <div class="theme-grid">
              <button
                v-for="theme in themeStore.availableThemes"
                :key="theme.key"
                class="theme-option"
                :class="{ active: themeStore.currentTheme === theme.key }"
                @click="selectTheme(theme.key)"
              >
                <div class="theme-preview" :style="{ background: theme.preview }"></div>
                <div class="theme-info">
                  <span class="theme-name">{{ theme.name }}</span>
                  <span class="theme-description">{{ theme.description }}</span>
                </div>
                <div v-if="themeStore.currentTheme === theme.key" class="theme-check">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
              </button>
            </div>
          </div>

          <div class="form-group dark-mode-section">
            <label class="form-label">Color Mode</label>
            <div class="color-mode-toggle">
              <button
                class="mode-btn"
                :class="{ active: themeStore.isDarkMode }"
                @click="setDarkMode(true)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
                <span>Dark</span>
              </button>
              <button
                class="mode-btn"
                :class="{ active: !themeStore.isDarkMode }"
                @click="setDarkMode(false)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
                </svg>
                <span>Light</span>
              </button>
            </div>
            <span class="form-hint">Choose your preferred color scheme</span>
          </div>
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
import { useThemeStore } from '../stores/theme'
import { getBrowserTimeZone } from '../utils/helpers'

const router = useRouter()
const authStore = useAuthStore()
const workspaceStore = useWorkspaceStore()
const socketStore = useSocketStore()
const themeStore = useThemeStore()

const updating = ref(false)
const profile = ref({
  firstName: '',
  lastName: '',
  email: '',
  timezone: ''
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
      email: authStore.user.email,
      timezone: authStore.user.settings?.timezone || getBrowserTimeZone()
    }
  }
})

const timezones = computed(() => {
  if (typeof Intl.supportedValuesOf === 'function') {
    return Intl.supportedValuesOf('timeZone')
  }
  return [
    'UTC',
    'Europe/Oslo',
    'Europe/London',
    'Europe/Berlin',
    'America/New_York',
    'America/Chicago',
    'America/Los_Angeles',
    'Asia/Tokyo',
    'Australia/Sydney'
  ]
})

async function selectTheme(themeKey) {
  themeStore.setTheme(themeKey)
  // Save to server
  await authStore.saveThemePreference(themeKey, undefined)
}

async function setDarkMode(value) {
  themeStore.setDarkMode(value)
  // Save to server
  await authStore.saveThemePreference(undefined, value)
}

async function updateProfile() {
  updating.value = true
  try {
    await authStore.updateProfile({
      firstName: profile.value.firstName,
      lastName: profile.value.lastName,
      timezone: profile.value.timezone
    })
  } finally {
    updating.value = false
  }
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
  background-color: var(--primary-500-alpha-15, rgba(139, 92, 246, 0.15));
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

.settings-card h3,
.appearance-card h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: var(--space-6);
}

.section-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: var(--space-6);
  margin-top: calc(-1 * var(--space-4));
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
  display: block;
}

.form-actions {
  margin-top: var(--space-6);
}

/* Theme Selection Styles */
.theme-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}

.theme-option {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--bg-tertiary);
  border: 2px solid var(--border-default);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  position: relative;
}

.theme-option:hover {
  border-color: var(--border-strong);
  background: var(--bg-elevated);
}

.theme-option.active {
  border-color: var(--primary-500);
  background: var(--bg-elevated);
}

.theme-preview {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

.theme-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  flex: 1;
  min-width: 0;
}

.theme-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
}

.theme-description {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  line-height: 1.4;
}

.theme-check {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  width: 20px;
  height: 20px;
  color: var(--primary-400);
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
  padding: 2px;
}

/* Dark Mode Toggle */
.dark-mode-section {
  margin-top: var(--space-6);
  padding-top: var(--space-6);
  border-top: 1px solid var(--border-subtle);
}

.color-mode-toggle {
  display: flex;
  gap: var(--space-2);
  background: var(--bg-tertiary);
  padding: var(--space-1);
  border-radius: var(--radius-md);
  width: fit-content;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-btn svg {
  width: 18px;
  height: 18px;
}

.mode-btn:hover {
  color: var(--text-primary);
}

.mode-btn.active {
  background: var(--bg-elevated);
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
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
  background-color: var(--accent-rose-alpha-10, rgba(244, 63, 94, 0.1));
  border-radius: var(--radius-md);
  border: 1px solid var(--error-border, rgba(244, 63, 94, 0.2));
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

@media (max-width: 480px) {
  .theme-grid {
    grid-template-columns: 1fr;
  }
}
</style>
