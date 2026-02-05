<template>
  <div class="landing-page">
    <!-- Navigation -->
    <nav class="landing-nav" :class="{ 'scrolled': isScrolled }">
      <div class="nav-container">
        <div class="nav-brand">
          <div class="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span class="brand-text">Orbit</span>
        </div>
        <div class="nav-links">
          <a href="#features" class="nav-link">Features</a>
          <a href="#pricing" class="nav-link">Pricing</a>
          <router-link to="/login" class="nav-link">Sign in</router-link>
          <router-link to="/register" class="nav-cta">Get Started</router-link>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-bg">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
        <div class="grid-pattern"></div>
      </div>
      
      <div class="hero-content">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          Now in open beta
        </div>
        <h1 class="hero-title">
          <span class="title-line">Organize your work</span>
          <span class="title-line gradient">in perfect harmony</span>
        </h1>
        <p class="hero-subtitle">
          Orbit brings together tasks, notes, and collaboration in one beautiful workspace. 
          Designed for teams who want to move fast without the chaos.
        </p>
        <div class="hero-cta">
          <router-link to="/register" class="btn-primary btn-large">
            Start for free
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </router-link>
          <router-link to="/login" class="btn-secondary btn-large">
            Sign in
          </router-link>
        </div>
        <div class="hero-trust">
          <div class="trust-avatars">
            <div class="trust-avatar">JD</div>
            <div class="trust-avatar">MK</div>
            <div class="trust-avatar">AS</div>
            <div class="trust-avatar">+2k</div>
          </div>
          <p>Trusted by 2,000+ teams worldwide</p>
        </div>
      </div>

      <!-- Hero Visual -->
      <div class="hero-visual">
        <div class="app-preview">
          <div class="preview-header">
            <div class="preview-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="preview-title">Product Launch</div>
          </div>
          <div class="preview-content">
            <div class="preview-sidebar">
              <div class="preview-nav-item active">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
              </div>
              <div class="preview-nav-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                </svg>
              </div>
              <div class="preview-nav-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                </svg>
              </div>
            </div>
            <div class="preview-main">
              <div class="preview-columns">
                <div class="preview-column">
                  <div class="column-header">To Do</div>
                  <div class="preview-card">
                    <div class="card-tag" style="background: #8b5cf6;"></div>
                    <div class="card-text">Design system</div>
                  </div>
                  <div class="preview-card">
                    <div class="card-tag" style="background: #06b6d4;"></div>
                    <div class="card-text">User research</div>
                  </div>
                </div>
                <div class="preview-column">
                  <div class="column-header">In Progress</div>
                  <div class="preview-card">
                    <div class="card-tag" style="background: #f59e0b;"></div>
                    <div class="card-text">API integration</div>
                  </div>
                </div>
                <div class="preview-column">
                  <div class="column-header">Done</div>
                  <div class="preview-card completed">
                    <div class="card-tag" style="background: #10b981;"></div>
                    <div class="card-text">Project setup</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Floating elements -->
        <div class="float-card float-1">
          <div class="float-icon">✓</div>
          <div class="float-text">Task completed</div>
        </div>
        <div class="float-card float-2">
          <div class="float-avatars">
            <div class="float-avatar">JD</div>
            <div class="float-avatar">MK</div>
          </div>
          <div class="float-text">2 comments</div>
        </div>
      </div>
    </section>

    <!-- Features Grid -->
    <section id="features" class="features">
      <div class="section-container">
        <div class="section-header">
          <span class="section-label">Features</span>
          <h2>Everything you need to ship faster</h2>
          <p>Powerful tools that adapt to how your team works</p>
        </div>
        
        <div class="features-grid">
          <div class="feature-card large">
            <div class="feature-icon purple">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            </div>
            <h3>Kanban Boards</h3>
            <p>Visualize your workflow with customizable boards. Drag and drop tasks between columns as they progress.</p>
            <div class="feature-preview">
              <div class="mini-board">
                <div class="mini-column">
                  <div class="mini-card"></div>
                  <div class="mini-card"></div>
                </div>
                <div class="mini-column">
                  <div class="mini-card active"></div>
                </div>
                <div class="mini-column">
                  <div class="mini-card"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon cyan">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <h3>Notes & Docs</h3>
            <p>Write specs, meeting notes, and documentation with our powerful block-based editor.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon pink">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <h3>Timeline View</h3>
            <p>Plan sprints and track deadlines with a visual timeline that keeps everyone aligned.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3>Team Workspaces</h3>
            <p>Organize projects by team or department with dedicated workspaces and permissions.</p>
          </div>
          
          <div class="feature-card large">
            <div class="feature-icon emerald">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <h3>Real-time Collaboration</h3>
            <p>See changes as they happen. Comments, mentions, and live cursors keep everyone in sync.</p>
            <div class="feature-preview">
              <div class="collab-demo">
                <div class="collab-cursor" style="--color: #8b5cf6; --delay: 0s;">
                  <span>Sarah</span>
                </div>
                <div class="collab-cursor" style="--color: #06b6d4; --delay: 0.5s;">
                  <span>Mike</span>
                </div>
                <div class="collab-cursor" style="--color: #f59e0b; --delay: 1s;">
                  <span>Alex</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="section-container">
        <div class="cta-card">
          <div class="cta-bg">
            <div class="gradient-orb orb-1"></div>
            <div class="gradient-orb orb-2"></div>
          </div>
          <div class="cta-content">
            <h2>Ready to transform your workflow?</h2>
            <p>Join thousands of teams already shipping faster with Orbit.</p>
            <div class="cta-buttons">
              <router-link to="/register" class="btn-white btn-large">
                Get started for free
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </router-link>
            </div>
            <p class="cta-note">No credit card required • Free forever plan</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="landing-footer">
      <div class="footer-container">
        <div class="footer-brand">
          <div class="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span class="brand-text">Orbit</span>
        </div>
        <div class="footer-links">
          <router-link to="/login">Sign in</router-link>
          <router-link to="/register">Get started</router-link>
        </div>
        <p class="footer-copy">© 2025 Orbit. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)

function handleScroll() {
  isScrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  overflow-x: hidden;
}

/* Navigation */
.landing-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: var(--space-4) 0;
  transition: all 0.3s ease;
}

.landing-nav.scrolled {
  background: rgba(var(--bg-primary-rgb, 10, 10, 15), 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-subtle);
  padding: var(--space-3) 0;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.nav-brand .brand-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.nav-brand .brand-icon svg {
  width: 20px;
  height: 20px;
}

.nav-brand .brand-text {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--text-primary), var(--primary-400));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9375rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: var(--text-primary);
}

.nav-cta {
  padding: var(--space-2) var(--space-4);
  background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
  border-radius: var(--radius-md);
  color: white;
  text-decoration: none;
  font-size: 0.9375rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.nav-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
}

/* Hero Section */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(var(--space-20) + 60px) var(--space-6) var(--space-20);
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
  top: -200px;
  right: -100px;
  animation: float 8s ease-in-out infinite;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, var(--accent-cyan), var(--primary-600));
  bottom: -100px;
  left: -100px;
  animation: float 10s ease-in-out infinite 1s;
}

.orb-3 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, var(--accent-pink), var(--primary-600));
  top: 50%;
  left: 30%;
  animation: float 12s ease-in-out infinite 2s;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-30px) scale(1.05); }
}

.grid-pattern {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  text-align: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.hero-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: var(--space-6);
}

.title-line {
  display: block;
}

.title-line.gradient {
  background: linear-gradient(135deg, var(--primary-400), var(--accent-cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto var(--space-8);
  line-height: 1.7;
}

.hero-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
  border: none;
  border-radius: var(--radius-md);
  color: white;
  font-size: 0.9375rem;
  font-weight: 600;
  text-decoration: none;
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

.btn-secondary {
  display: inline-flex;
  align-items: center;
  padding: var(--space-3) var(--space-6);
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 0.9375rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-default);
}

.btn-large {
  padding: var(--space-4) var(--space-8);
  font-size: 1rem;
}

.hero-trust {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
}

.trust-avatars {
  display: flex;
}

.trust-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  border: 2px solid var(--bg-primary);
  margin-left: -8px;
}

.trust-avatar:first-child {
  margin-left: 0;
}

.hero-trust p {
  font-size: 0.875rem;
  color: var(--text-tertiary);
}

/* Hero Visual */
.hero-visual {
  position: absolute;
  right: -100px;
  top: 50%;
  transform: translateY(-50%);
  width: 600px;
  opacity: 0.15;
  pointer-events: none;
}

@media (min-width: 1400px) {
  .hero-visual {
    opacity: 0.3;
    right: 5%;
  }
}

.app-preview {
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.preview-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-subtle);
}

.preview-dots {
  display: flex;
  gap: 6px;
}

.preview-dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--border-default);
}

.preview-dots span:first-child { background: #f43f5e; }
.preview-dots span:nth-child(2) { background: #f59e0b; }
.preview-dots span:nth-child(3) { background: #10b981; }

.preview-title {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.preview-content {
  display: flex;
  height: 350px;
}

.preview-sidebar {
  width: 60px;
  background: var(--bg-tertiary);
  border-right: 1px solid var(--border-subtle);
  padding: var(--space-3) var(--space-2);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.preview-nav-item {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  color: var(--text-tertiary);
  transition: all 0.2s ease;
}

.preview-nav-item.active {
  background: var(--primary-500-alpha-15, rgba(139, 92, 246, 0.15));
  color: var(--primary-400);
}

.preview-nav-item svg {
  width: 18px;
  height: 18px;
}

.preview-main {
  flex: 1;
  padding: var(--space-4);
}

.preview-columns {
  display: flex;
  gap: var(--space-3);
  height: 100%;
}

.preview-column {
  flex: 1;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  padding: var(--space-3);
}

.column-header {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-3);
}

.preview-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  margin-bottom: var(--space-2);
}

.preview-card.completed {
  opacity: 0.6;
}

.card-tag {
  width: 24px;
  height: 4px;
  border-radius: var(--radius-full);
  margin-bottom: var(--space-2);
}

.card-text {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.float-card {
  position: absolute;
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: float-card 6s ease-in-out infinite;
}

.float-1 {
  top: 20%;
  right: 10%;
  animation-delay: 0s;
}

.float-2 {
  bottom: 20%;
  right: 5%;
  animation-delay: 1s;
}

@keyframes float-card {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.float-icon {
  width: 28px;
  height: 28px;
  background: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.875rem;
}

.float-avatars {
  display: flex;
}

.float-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  font-weight: 600;
  color: white;
  border: 2px solid var(--bg-secondary);
  margin-left: -8px;
}

.float-text {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Features Section */
.features {
  padding: var(--space-20) var(--space-6);
  background: var(--bg-secondary);
  position: relative;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: var(--space-12);
}

.section-label {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  background: var(--primary-500-alpha-15, rgba(139, 92, 246, 0.15));
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--primary-400);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: var(--space-4);
}

.section-header h2 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  margin-bottom: var(--space-3);
}

.section-header p {
  font-size: 1.125rem;
  color: var(--text-secondary);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
}

@media (max-width: 900px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
}

.feature-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  border-color: var(--border-default);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.feature-card.large {
  grid-column: span 2;
}

@media (max-width: 900px) {
  .feature-card.large {
    grid-column: span 1;
  }
}

.feature-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-4);
}

.feature-icon svg {
  width: 24px;
  height: 24px;
  color: white;
}

.feature-icon.purple { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.feature-icon.cyan { background: linear-gradient(135deg, #06b6d4, #0891b2); }
.feature-icon.pink { background: linear-gradient(135deg, #ec4899, #db2777); }
.feature-icon.amber { background: linear-gradient(135deg, #f59e0b, #d97706); }
.feature-icon.emerald { background: linear-gradient(135deg, #10b981, #059669); }

.feature-card h3 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: var(--space-2);
}

.feature-card p {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.feature-preview {
  margin-top: var(--space-6);
}

.mini-board {
  display: flex;
  gap: var(--space-3);
}

.mini-column {
  flex: 1;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  min-height: 120px;
}

.mini-card {
  height: 32px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-2);
}

.mini-card.active {
  background: var(--primary-500-alpha-30, rgba(139, 92, 246, 0.3));
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.collab-demo {
  position: relative;
  height: 60px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.collab-cursor {
  position: absolute;
  top: 50%;
  width: 2px;
  height: 24px;
  background: var(--color);
  transform: translateY(-50%);
  animation: cursor-move 4s ease-in-out infinite;
  animation-delay: var(--delay);
}

.collab-cursor span {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 2px 8px;
  background: var(--color);
  border-radius: var(--radius-sm);
  font-size: 0.625rem;
  font-weight: 600;
  color: white;
  white-space: nowrap;
}

@keyframes cursor-move {
  0%, 100% { left: 10%; }
  50% { left: 80%; }
}

/* CTA Section */
.cta-section {
  padding: var(--space-20) var(--space-6);
}

.cta-card {
  position: relative;
  background: linear-gradient(135deg, var(--primary-700), var(--primary-900));
  border-radius: var(--radius-2xl);
  padding: var(--space-12);
  overflow: hidden;
  text-align: center;
}

.cta-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.cta-bg .orb-1 {
  width: 400px;
  height: 400px;
  background: var(--accent-cyan);
  top: -100px;
  left: -100px;
}

.cta-bg .orb-2 {
  width: 300px;
  height: 300px;
  background: var(--accent-pink);
  bottom: -50px;
  right: -50px;
}

.cta-content {
  position: relative;
  z-index: 1;
}

.cta-content h2 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  color: white;
  margin-bottom: var(--space-3);
}

.cta-content p {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: var(--space-8);
}

.btn-white {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-8);
  background: white;
  border: none;
  border-radius: var(--radius-md);
  color: var(--primary-700);
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-white:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.btn-white svg {
  width: 20px;
  height: 20px;
}

.cta-note {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: var(--space-4);
}

/* Footer */
.landing-footer {
  padding: var(--space-8) var(--space-6);
  border-top: 1px solid var(--border-subtle);
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.footer-brand .brand-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.footer-brand .brand-icon svg {
  width: 18px;
  height: 18px;
}

.footer-brand .brand-text {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

.footer-links a {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9375rem;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: var(--text-primary);
}

.footer-copy {
  font-size: 0.875rem;
  color: var(--text-tertiary);
}

@media (max-width: 768px) {
  .hero {
    padding-top: calc(var(--space-16) + 60px);
  }
  
  .nav-links {
    display: none;
  }
  
  .hero-visual {
    display: none;
  }
  
  .hero-cta {
    flex-direction: column;
  }
  
  .hero-trust {
    flex-direction: column;
    text-align: center;
  }
  
  .footer-container {
    flex-direction: column;
    text-align: center;
  }
}
</style>
