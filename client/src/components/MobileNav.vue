<template>
  <nav class="mobile-nav">
    <router-link 
      v-for="item in navItems" 
      :key="item.path"
      :to="item.path"
      class="nav-item"
      :class="{ active: isActive(item.path) }"
    >
      <div class="nav-icon-wrapper">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="item.icon"/>
        <span v-if="item.showBadge && unreadCount > 0" class="nav-badge">
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </span>
      </div>
      <span>{{ item.label }}</span>
    </router-link>
    
    <button class="nav-item menu-btn" @click="showMenu = true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
      <span>More</span>
    </button>
    
    <!-- Full Screen Menu -->
    <Transition name="slide-up">
      <div v-if="showMenu" class="mobile-menu" @click.self="showMenu = false">
        <div class="menu-header">
          <div class="brand">
            <div class="brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span class="brand-text">Orbit</span>
          </div>
          <button class="close-btn" @click="showMenu = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="menu-content">
          <div class="menu-section">
            <h4>Navigation</h4>
            <router-link to="/tasks" class="menu-link" @click="showMenu = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
              All Tasks
            </router-link>
            <router-link to="/notes" class="menu-link" @click="showMenu = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              All Notes
            </router-link>
            <router-link to="/calendar" class="menu-link" @click="showMenu = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Calendar
            </router-link>
          </div>
          
          <div class="menu-section">
            <h4>Workspaces</h4>
            <router-link
              v-for="workspace in workspaceStore.workspaces.slice(0, 5)"
              :key="workspace._id"
              :to="`/workspaces/${workspace._id}`"
              class="menu-link"
              @click="showMenu = false"
            >
              <span class="dot" :style="{ background: generateColor(workspace.name) }"></span>
              {{ workspace.name }}
            </router-link>
          </div>
          
          <div class="menu-section">
            <h4>Account</h4>
            <router-link to="/profile" class="menu-link" @click="showMenu = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Profile
            </router-link>
            <button class="menu-link danger" @click="handleLogout">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkspaceStore } from '../stores/workspace'
import { useAuthStore } from '../stores/auth'
import { useChatStore } from '../stores/chat'

const route = useRoute()
const router = useRouter()
const workspaceStore = useWorkspaceStore()
const authStore = useAuthStore()
const chatStore = useChatStore()

const showMenu = ref(false)
const unreadCount = computed(() => chatStore.totalUnreadCount)

const navItems = [
  { 
    path: '/dashboard', 
    label: 'Home',
    icon: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>'
  },
  { 
    path: '/workspaces', 
    label: 'Work',
    icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'
  },
  { 
    path: '/chat', 
    label: 'Messages',
    icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    showBadge: true
  },
  { 
    path: '/activity', 
    label: 'Activity',
    icon: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>'
  }
]

function isActive(path) {
  if (path === '/dashboard') {
    return route.path === '/dashboard'
  }
  return route.path.startsWith(path)
}

function generateColor(str) {
  const colors = ['#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981']
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function handleLogout() {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: var(--bg-elevated);
  border-top: 1px solid var(--border-subtle);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0 var(--space-2);
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: var(--space-2);
  color: var(--text-tertiary);
  text-decoration: none;
  font-size: 11px;
  font-weight: 500;
  flex: 1;
  max-width: 80px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: color 0.15s ease;
}

.nav-item svg {
  width: 24px;
  height: 24px;
}

.nav-item.active {
  color: var(--primary-500);
}

.nav-item.active svg {
  stroke-width: 2.5;
}

/* Mobile Menu */
.mobile-menu {
  position: fixed;
  inset: 0;
  background: var(--bg-primary);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
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

.close-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  color: var(--text-secondary);
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.menu-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
}

.menu-section {
  margin-bottom: var(--space-6);
}

.menu-section h4 {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
  margin-bottom: var(--space-3);
  padding-left: var(--space-2);
}

.menu-link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-2);
  color: var(--text-primary);
  text-decoration: none;
  font-size: 16px;
  border-radius: var(--radius-md);
  transition: background-color 0.15s ease;
  width: 100%;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
}

.menu-link:hover,
.menu-link:active {
  background: var(--bg-tertiary);
}

.menu-link.danger {
  color: var(--accent-rose);
}

.menu-link svg {
  width: 20px;
  height: 20px;
  color: var(--text-tertiary);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.nav-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: var(--primary-500);
  color: white;
  font-size: 10px;
  font-weight: 600;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Transition */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

/* Hide on desktop */
@media (min-width: 1024px) {
  .mobile-nav {
    display: none;
  }
}
</style>
