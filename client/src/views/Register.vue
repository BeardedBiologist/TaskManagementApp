<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-brand">
        <div class="brand-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h1>Create Account</h1>
        <p>Start managing your projects today</p>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">First Name</label>
            <input 
              v-model="form.firstName"
              type="text"
              class="form-input"
              placeholder="John"
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label">Last Name</label>
            <input 
              v-model="form.lastName"
              type="text"
              class="form-input"
              placeholder="Doe"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Email</label>
          <div class="input-wrap">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <input 
              v-model="form.email"
              type="email"
              class="form-input"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <div class="input-wrap">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input 
              v-model="form.password"
              type="password"
              class="form-input"
              placeholder="••••••••"
              required
              minlength="6"
            />
          </div>
          <span class="form-hint">Must be at least 6 characters</span>
        </div>

        <div v-if="authStore.error" class="error-message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ authStore.error }}
        </div>

        <button 
          type="submit" 
          class="btn btn-primary btn-lg btn-full"
          :disabled="authStore.loading"
        >
          <span v-if="authStore.loading" class="spinner-sm"></span>
          <span v-else>Create Account</span>
        </button>
      </form>

      <div class="auth-footer">
        <p>Already have an account? <router-link to="/login">Sign in</router-link></p>
      </div>
    </div>

    <!-- Background decoration -->
    <div class="bg-decoration">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useSocketStore } from '../stores/socket'

const router = useRouter()
const authStore = useAuthStore()
const socketStore = useSocketStore()

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: ''
})

async function handleRegister() {
  const success = await authStore.register({
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
    password: form.password
  })
  
  if (success) {
    socketStore.connect()
    router.push('/')
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  position: relative;
  overflow: hidden;
  background: var(--bg-primary);
}

.auth-container {
  width: 100%;
  max-width: 440px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  position: relative;
  z-index: 10;
  box-shadow: var(--shadow-lg);
}

.auth-brand {
  text-align: center;
  margin-bottom: var(--space-8);
}

.brand-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-4);
  color: white;
  box-shadow: var(--shadow-glow);
}

.brand-icon svg {
  width: 28px;
  height: 28px;
}

.auth-brand h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: var(--space-1);
  background: linear-gradient(135deg, var(--text-primary), var(--primary-400));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.auth-brand p {
  color: var(--text-secondary);
  font-size: 0.9375rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.input-wrap {
  position: relative;
}

.input-icon {
  position: absolute;
  left: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: var(--text-tertiary);
}

.input-wrap .form-input {
  padding-left: var(--space-10);
}

.form-hint {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-top: var(--space-1);
}

.error-message {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: rgba(244, 63, 94, 0.1);
  border: 1px solid rgba(244, 63, 94, 0.2);
  border-radius: var(--radius-md);
  color: var(--accent-rose);
  font-size: 0.875rem;
}

.error-message svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.spinner-sm {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.auth-footer {
  text-align: center;
  margin-top: var(--space-6);
  padding-top: var(--space-6);
  border-top: 1px solid var(--border-subtle);
}

.auth-footer p {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.auth-footer a {
  color: var(--primary-400);
  font-weight: 500;
  text-decoration: none;
}

.auth-footer a:hover {
  text-decoration: underline;
}

/* Background decoration */
.bg-decoration {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: var(--primary-600);
  top: -100px;
  right: -100px;
}

.orb-2 {
  width: 300px;
  height: 300px;
  background: var(--accent-cyan);
  bottom: -50px;
  left: -50px;
  opacity: 0.25;
}

.orb-3 {
  width: 250px;
  height: 250px;
  background: var(--accent-pink);
  top: 50%;
  left: 30%;
  opacity: 0.15;
}
</style>
