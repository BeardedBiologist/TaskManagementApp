<template>
  <router-view />
  <CommandPalette ref="commandPaletteRef" />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useAuthStore } from './stores/auth'
import { useSocketStore } from './stores/socket'
import { useThemeStore } from './stores/theme'
import CommandPalette from './components/CommandPalette.vue'

const authStore = useAuthStore()
const socketStore = useSocketStore()
const themeStore = useThemeStore()
const commandPaletteRef = ref(null)

onMounted(() => {
  // Initialize theme first
  themeStore.initializeTheme()
  
  authStore.initializeAuth()
  if (authStore.isAuthenticated) {
    socketStore.connect()
  }
  
  // Expose toggle function globally for keyboard shortcut
  window.toggleCommandPalette = () => {
    commandPaletteRef.value?.toggle()
  }
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');

/* CSS Variables are set dynamically by the theme store */
:root {
  /* Spacing - same across all themes */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  
  /* Radii - same across all themes */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;
  --radius-full: 9999px;
}

/* Smooth transitions for theme changes */
*,
*::before,
*::after {
  transition: background-color 0.2s ease,
              border-color 0.2s ease,
              box-shadow 0.2s ease,
              color 0.2s ease;
}

/* Exclude elements that shouldn't transition */
.spinner,
.spinner *,
.animate-slide-in,
.animate-fade-in {
  transition: none !important;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  letter-spacing: -0.02em;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-primary);
}

.btn:hover {
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(0);
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
  border-color: var(--primary-500);
  box-shadow: 0 4px 14px rgba(var(--primary-600-rgb, 124, 58, 237), 0.4);
}

.btn-primary:hover {
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  box-shadow: 0 6px 20px rgba(var(--primary-600-rgb, 124, 58, 237), 0.5);
}

.btn-secondary {
  background: var(--bg-elevated);
  border-color: var(--border-default);
  color: var(--text-secondary);
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-strong);
  color: var(--text-primary);
}

.btn-ghost {
  color: var(--text-secondary);
}

.btn-ghost:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-danger {
  background: rgba(244, 63, 94, 0.1);
  border-color: rgba(244, 63, 94, 0.3);
  color: var(--accent-rose);
}

.btn-danger:hover {
  background: rgba(244, 63, 94, 0.2);
}

.btn-sm {
  padding: var(--space-1) var(--space-3);
  font-size: 0.8125rem;
}

.btn-lg {
  padding: var(--space-3) var(--space-6);
  font-size: 0.9375rem;
}

.btn-icon {
  padding: var(--space-2);
  width: 36px;
  height: 36px;
}

/* Form elements */
.form-group {
  margin-bottom: var(--space-4);
}

.form-label {
  display: block;
  margin-bottom: var(--space-2);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 0.9375rem;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(var(--primary-500-rgb, 139, 92, 246), 0.15);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--text-tertiary);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

/* Cards */
.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.card-hover {
  transition: all 0.2s ease;
}

.card-hover:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-lg);
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-purple { background: rgba(139, 92, 246, 0.15); color: var(--primary-400); }
.badge-cyan { background: rgba(6, 182, 212, 0.15); color: var(--accent-cyan); }
.badge-pink { background: rgba(236, 72, 153, 0.15); color: var(--accent-pink); }
.badge-amber { background: rgba(245, 158, 11, 0.15); color: var(--accent-amber); }
.badge-emerald { background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald); }
.badge-rose { background: rgba(244, 63, 94, 0.15); color: var(--accent-rose); }

/* Avatars */
.avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.avatar-sm { width: 24px; height: 24px; font-size: 0.625rem; }
.avatar-lg { width: 40px; height: 40px; font-size: 0.875rem; }
.avatar-xl { width: 56px; height: 56px; font-size: 1.125rem; }

/* Loading */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-12);
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--bg-elevated);
  border-top-color: var(--primary-500);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--bg-elevated);
  border-radius: var(--radius-full);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--gray-600);
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-slide-in {
  animation: slideIn 0.3s ease;
}

.animate-fade-in {
  animation: fadeIn 0.2s ease;
}

/* Utilities */
.text-gradient {
  background: linear-gradient(135deg, var(--primary-400), var(--accent-cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-subtle);
}

/* Mobile Responsive Base Styles */
@media (max-width: 1023px) {
  html {
    font-size: 15px;
  }
  
  .btn {
    padding: var(--space-2) var(--space-3);
  }
  
  .btn-icon {
    width: 32px;
    height: 32px;
  }
  
  .form-input,
  .form-textarea,
  .form-select {
    font-size: 16px; /* Prevents iOS zoom on focus */
    padding: var(--space-3);
  }
  
  /* Better touch targets */
  button, 
  a,
  input,
  select,
  textarea {
    touch-action: manipulation;
  }
  
  /* Smoother scrolling */
  * {
    -webkit-overflow-scrolling: touch;
  }
}

@media (max-width: 767px) {
  html {
    font-size: 14px;
  }
  
  .btn-lg {
    padding: var(--space-2) var(--space-4);
    font-size: 0.875rem;
  }
  
  .card {
    border-radius: var(--radius-md);
  }
  
  /* Reduced padding on mobile */
  :root {
    --space-8: 1.5rem;
    --space-10: 2rem;
    --space-12: 2.5rem;
  }
}

/* Safe area insets for notched devices */
@supports (padding-top: env(safe-area-inset-top)) {
  .mobile-header {
    padding-top: env(safe-area-inset-top);
  }
  
  .mobile-nav {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>
