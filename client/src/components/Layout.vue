<template>
  <div class="layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span class="brand-text">Orbit</span>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          <span>Dashboard</span>
        </router-link>

        <router-link to="/workspaces" class="nav-item" :class="{ active: $route.path.startsWith('/workspaces') }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span>Workspaces</span>
        </router-link>

        <router-link to="/calendar" class="nav-item" :class="{ active: $route.path === '/calendar' }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>Calendar</span>
        </router-link>
      </nav>

      <div class="sidebar-section" v-if="workspaceStore.workspaces.length">
        <div class="section-header">
          <span>Recent Workspaces</span>
        </div>
        <div class="workspace-nav">
          <router-link 
            v-for="workspace in workspaceStore.workspaces.slice(0, 4)" 
            :key="workspace._id"
            :to="`/workspaces/${workspace._id}`"
            class="workspace-link"
            :title="workspace.name"
          >
            <div class="workspace-dot" :style="{ background: generateColor(workspace.name) }"></div>
            <span class="workspace-name">{{ workspace.name }}</span>
          </router-link>
        </div>
      </div>

      <div class="sidebar-footer">
        <div class="header-actions">
          <Notifications />
        </div>
        
        <button class="user-menu" @click="showUserMenu = !showUserMenu">
          <div class="avatar">{{ authStore.userInitials }}</div>
          <div class="user-info">
            <span class="user-name">{{ authStore.userName }}</span>
            <span class="user-role">{{ authStore.user?.role }}</span>
          </div>
          <svg class="chevron" :class="{ open: showUserMenu }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        <div v-if="showUserMenu" class="user-dropdown">
          <router-link to="/profile" class="dropdown-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Profile
          </router-link>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item danger" @click="handleLogout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <main class="main">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useWorkspaceStore } from '../stores/workspace'
import { useSocketStore } from '../stores/socket'
import Notifications from './Notifications.vue'

const router = useRouter()
const authStore = useAuthStore()
const workspaceStore = useWorkspaceStore()
const socketStore = useSocketStore()

const showUserMenu = ref(false)

onMounted(async () => {
  await workspaceStore.fetchWorkspaces()
})

function handleLogout() {
  authStore.logout()
  socketStore.disconnect()
  router.push('/login')
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
.layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary);
}

.sidebar {
  width: 260px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 100;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--border-subtle);
}

.brand-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.brand-icon svg {
  width: 20px;
  height: 20px;
}

.brand-text {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--text-primary), var(--primary-400));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.sidebar-nav {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9375rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-item svg {
  width: 18px;
  height: 18px;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.nav-item:hover svg {
  opacity: 1;
  color: var(--primary-400);
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.1));
  color: var(--text-primary);
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.nav-item.active svg {
  opacity: 1;
  color: var(--primary-400);
}

.sidebar-section {
  flex: 1;
  padding: var(--space-4);
  overflow-y: auto;
}

.section-header {
  padding: 0 var(--space-4);
  margin-bottom: var(--space-3);
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-tertiary);
}

.workspace-nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.workspace-link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.workspace-link:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.workspace-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.workspace-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-footer {
  padding: var(--space-4);
  border-top: 1px solid var(--border-subtle);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.header-actions {
  display: flex;
  justify-content: flex-end;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-2);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-menu:hover {
  border-color: var(--border-strong);
}

.user-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  text-transform: capitalize;
}

.chevron {
  width: 16px;
  height: 16px;
  color: var(--text-tertiary);
  transition: transform 0.2s ease;
}

.chevron.open {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  bottom: calc(100% + var(--space-2));
  left: var(--space-4);
  right: var(--space-4);
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  animation: slideIn 0.2s ease;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-3) var(--space-4);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dropdown-item svg {
  width: 16px;
  height: 16px;
}

.dropdown-item:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.dropdown-item.danger {
  color: var(--accent-rose);
}

.dropdown-item.danger:hover {
  background: rgba(244, 63, 94, 0.1);
}

.dropdown-divider {
  height: 1px;
  background: var(--border-subtle);
  margin: var(--space-1) 0;
}

.main {
  flex: 1;
  margin-left: 260px;
  min-height: 100vh;
  overflow: auto;
}
</style>
