<template>
  <div class="landing-page">
    <!-- Navigation -->
    <nav class="nav" :class="{ 'nav--scrolled': scrolled, 'nav--hidden': navHidden }">
      <div class="nav__container">
        <router-link to="/" class="nav__brand">
          <div class="nav__logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span class="nav__brand-text">Orbit</span>
        </router-link>
        
        <div class="nav__menu" :class="{ 'nav__menu--open': mobileMenuOpen }">
          <a href="#features" class="nav__link" @click="mobileMenuOpen = false">Features</a>
          <a href="#how-it-works" class="nav__link" @click="mobileMenuOpen = false">How it works</a>
          <router-link to="/login" class="nav__link" @click="mobileMenuOpen = false">Sign in</router-link>
          <router-link to="/register" class="nav__cta" @click="mobileMenuOpen = false">
            Get Started
          </router-link>
        </div>
        
        <button class="nav__toggle" @click="mobileMenuOpen = !mobileMenuOpen" aria-label="Toggle menu">
          <span :class="{ 'open': mobileMenuOpen }"></span>
          <span :class="{ 'open': mobileMenuOpen }"></span>
          <span :class="{ 'open': mobileMenuOpen }"></span>
        </button>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero__bg">
        <div class="hero__gradient"></div>
        <div class="hero__grid"></div>
      </div>
      
      <div class="hero__container">
        <div class="hero__content" ref="heroContent">
          <div class="hero__badge" :class="{ 'animate-in': heroVisible }">
            <span class="hero__badge-dot"></span>
            <span>Now in open beta</span>
          </div>
          
          <h1 class="hero__title" :class="{ 'animate-in': heroVisible }">
            Work in perfect<br />
            <span class="text-gradient">harmony</span>
          </h1>
          
          <p class="hero__subtitle" :class="{ 'animate-in': heroVisible }">
            Orbit brings together tasks, notes, and collaboration in one beautiful workspace. 
            Designed for teams who want to move fast without the chaos.
          </p>
          
          <div class="hero__actions" :class="{ 'animate-in': heroVisible }">
            <router-link to="/register" class="btn btn--primary btn--lg">
              Start for free
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </router-link>
            <button class="btn btn--ghost" @click="showVideo = true">
              <span class="btn__play">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              </span>
              Watch demo
            </button>
          </div>
          
          <div class="hero__social-proof" :class="{ 'animate-in': heroVisible }">
            <div class="avatars">
              <div class="avatar" v-for="(initial, i) in ['JD', 'MK', 'AS', '+2k']" :key="i">
                {{ initial }}
              </div>
            </div>
            <p>Trusted by <strong>2,000+</strong> teams worldwide</p>
          </div>
        </div>
        
        <div class="hero__visual" :class="{ 'animate-in': heroVisible }">
          <div class="app-preview">
            <div class="app-preview__header">
              <div class="app-preview__dots">
                <span></span><span></span><span></span>
              </div>
              <span class="app-preview__title">Product Launch</span>
            </div>
            <div class="app-preview__body">
              <div class="app-preview__sidebar">
                <div class="app-preview__nav-item active">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                  </svg>
                </div>
                <div class="app-preview__nav-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div class="app-preview__nav-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                  </svg>
                </div>
              </div>
              <div class="app-preview__main">
                <div class="board">
                  <div class="board__column">
                    <div class="board__header">To Do</div>
                    <div class="board__card">
                      <div class="board__card-tag" style="background: #8b5cf6;"></div>
                      <div class="board__card-text">Design system</div>
                    </div>
                    <div class="board__card">
                      <div class="board__card-tag" style="background: #06b6d4;"></div>
                      <div class="board__card-text">User research</div>
                    </div>
                  </div>
                  <div class="board__column">
                    <div class="board__header">In Progress</div>
                    <div class="board__card">
                      <div class="board__card-tag" style="background: #f59e0b;"></div>
                      <div class="board__card-text">API integration</div>
                    </div>
                  </div>
                  <div class="board__column">
                    <div class="board__header">Done</div>
                    <div class="board__card board__card--done">
                      <div class="board__card-tag" style="background: #10b981;"></div>
                      <div class="board__card-text">Project setup</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Floating elements -->
          <div class="float-card float-card--1">
            <div class="float-card__icon">✓</div>
            <span>Task completed</span>
          </div>
          <div class="float-card float-card--2">
            <div class="float-card__avatars">
              <span>JD</span><span>MK</span>
            </div>
            <span>2 comments</span>
          </div>
        </div>
      </div>
      
      <div class="hero__scroll" :class="{ 'hero__scroll--hidden': scrolled }">
        <div class="mouse">
          <div class="mouse__wheel"></div>
        </div>
        <span>Scroll</span>
      </div>
    </section>

    <!-- Logos Section -->
    <section class="logos">
      <div class="logos__container">
        <p class="logos__title">Trusted by innovative teams</p>
        <div class="logos__grid">
          <div class="logo" v-for="n in 5" :key="n">
            <div class="logo__placeholder">Company {{ n }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features" ref="featuresSection">
      <div class="features__container">
        <div class="section-header" :class="{ 'in-view': featuresInView }">
          <span class="section-header__eyebrow">Features</span>
          <h2 class="section-header__title">
            Everything you need to<br /><span class="text-gradient">ship faster</span>
          </h2>
          <p class="section-header__desc">
            Powerful tools that adapt to how your team works, not the other way around.
          </p>
        </div>
        
        <div class="features__grid">
          <div class="feature-card" 
               v-for="(feature, i) in features" 
               :key="i"
               :class="{ 'in-view': featuresInView }"
               :style="{ transitionDelay: (i * 100) + 'ms' }">
            <div class="feature-card__icon" :class="'feature-card__icon--' + feature.color">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="feature.icon"/>
            </div>
            <h3 class="feature-card__title">{{ feature.title }}</h3>
            <p class="feature-card__desc">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section id="how-it-works" class="how-it-works" ref="howItWorksSection">
      <div class="how-it-works__container">
        <div class="section-header" :class="{ 'in-view': howItWorksInView }">
          <span class="section-header__eyebrow">How it works</span>
          <h2 class="section-header__title">
            Get started in<br /><span class="text-gradient">minutes</span>
          </h2>
        </div>
        
        <div class="steps">
          <div class="step" 
               v-for="(step, i) in steps" 
               :key="i"
               :class="{ 'in-view': howItWorksInView }"
               :style="{ transitionDelay: (i * 150) + 'ms' }">
            <div class="step__number">{{ i + 1 }}</div>
            <div class="step__content">
              <h3 class="step__title">{{ step.title }}</h3>
              <p class="step__desc">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="testimonials" ref="testimonialsSection">
      <div class="testimonials__container">
        <div class="section-header" :class="{ 'in-view': testimonialsInView }">
          <span class="section-header__eyebrow">Testimonials</span>
          <h2 class="section-header__title">
            Loved by teams<br /><span class="text-gradient">worldwide</span>
          </h2>
        </div>
        
        <div class="testimonials__grid">
          <div class="testimonial" 
               v-for="(item, i) in testimonials" 
               :key="i"
               :class="{ 'in-view': testimonialsInView }"
               :style="{ transitionDelay: (i * 100) + 'ms' }">
            <div class="testimonial__stars">
              <svg v-for="n in 5" :key="n" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <p class="testimonial__text">{{ item.text }}</p>
            <div class="testimonial__author">
              <div class="testimonial__avatar">{{ item.initials }}</div>
              <div class="testimonial__info">
                <div class="testimonial__name">{{ item.name }}</div>
                <div class="testimonial__role">{{ item.role }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta" ref="ctaSection">
      <div class="cta__container">
        <div class="cta__card" :class="{ 'in-view': ctaInView }">
          <div class="cta__bg">
            <div class="cta__orb cta__orb--1"></div>
            <div class="cta__orb cta__orb--2"></div>
          </div>
          <div class="cta__content">
            <h2 class="cta__title">Ready to transform your workflow?</h2>
            <p class="cta__desc">Join thousands of teams already shipping faster with Orbit.</p>
            <router-link to="/register" class="btn btn--white btn--lg">
              Get started for free
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </router-link>
            <p class="cta__note">No credit card required</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer__container">
        <div class="footer__main">
          <div class="footer__brand">
            <div class="footer__logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div class="footer__brand-info">
              <span class="footer__brand-name">Orbit</span>
              <span class="footer__brand-tagline">Work in perfect harmony</span>
            </div>
          </div>
          <div class="footer__links">
            <div class="footer__column">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How it works</a>
              <router-link to="/register">Get Started</router-link>
            </div>
            <div class="footer__column">
              <h4>Company</h4>
              <a href="#testimonials">Stories</a>
              <router-link to="/login">Sign In</router-link>
            </div>
          </div>
        </div>
        <div class="footer__bottom">
          <p>© 2025 Orbit. All rights reserved.</p>
          <div class="footer__social">
            <a href="#" aria-label="Twitter">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            </a>
            <a href="#" aria-label="GitHub">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>

    <!-- Video Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showVideo" class="modal" @click.self="showVideo = false">
          <div class="modal__content">
            <button class="modal__close" @click="showVideo = false" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <div class="modal__placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              <p>Demo video coming soon</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// State
const scrolled = ref(false)
const navHidden = ref(false)
const mobileMenuOpen = ref(false)
const heroVisible = ref(false)
const showVideo = ref(false)
const lastScrollY = ref(0)

// Section refs for intersection observer
const featuresSection = ref(null)
const howItWorksSection = ref(null)
const testimonialsSection = ref(null)
const ctaSection = ref(null)

// Visibility states
const featuresInView = ref(false)
const howItWorksInView = ref(false)
const testimonialsInView = ref(false)
const ctaInView = ref(false)

// Data
const features = [
  {
    icon: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    title: 'Kanban Boards',
    desc: 'Visualize your workflow with customizable boards. Drag and drop tasks between columns as they progress.',
    color: 'purple'
  },
  {
    icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
    title: 'Notes & Docs',
    desc: 'Write specs, meeting notes, and documentation with our powerful block-based editor.',
    color: 'cyan'
  },
  {
    icon: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    title: 'Timeline View',
    desc: 'Plan sprints and track deadlines with a visual timeline that keeps everyone aligned.',
    color: 'pink'
  },
  {
    icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    title: 'Team Workspaces',
    desc: 'Organize projects by team or department with dedicated workspaces and permissions.',
    color: 'amber'
  },
  {
    icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><circle cx="15.5" cy="15.5" r="1.5"/>',
    title: 'Whiteboards',
    desc: 'Brainstorm and visualize ideas with infinite canvas whiteboards for your team.',
    color: 'emerald'
  },
  {
    icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    title: 'Real-time Chat',
    desc: 'Communicate instantly with built-in messaging. No need to switch between apps.',
    color: 'rose'
  }
]

const steps = [
  {
    title: 'Create your workspace',
    desc: 'Set up a workspace for your team in seconds. Invite members and configure permissions.'
  },
  {
    title: 'Add your projects',
    desc: 'Create projects, add tasks, and organize everything in a way that makes sense for your team.'
  },
  {
    title: 'Start collaborating',
    desc: 'Work together in real-time. Comment, assign tasks, and track progress all in one place.'
  }
]

const testimonials = [
  {
    text: "Orbit completely transformed how our team works. We've cut meeting time in half and everyone knows exactly what they need to focus on.",
    name: "Sarah Chen",
    role: "Product Lead at TechCorp",
    initials: "SC"
  },
  {
    text: "The best project management tool we've ever used. Beautiful, fast, and actually enjoyable to use every day.",
    name: "Marcus Johnson",
    role: "Engineering Manager",
    initials: "MJ"
  },
  {
    text: "We tried everything from Asana to Notion. Orbit is the first tool that actually stuck with our team. Game changer.",
    name: "Emily Rodriguez",
    role: "Founder at StartupXYZ",
    initials: "ER"
  }
]

// Scroll handler
function handleScroll() {
  const currentY = window.scrollY
  scrolled.value = currentY > 50
  navHidden.value = currentY > lastScrollY.value && currentY > 200 && !mobileMenuOpen.value
  lastScrollY.value = currentY
}

// Intersection Observer setup
onMounted(() => {
  // Trigger hero animation
  setTimeout(() => {
    heroVisible.value = true
  }, 100)
  
  // Scroll listener
  window.addEventListener('scroll', handleScroll, { passive: true })
  
  // Intersection Observer for sections
  const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -10% 0px'
  }
  
  const createObserver = (el, stateRef) => {
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) stateRef.value = true
    }, observerOptions)
    observer.observe(el)
  }
  
  createObserver(featuresSection.value, featuresInView)
  createObserver(howItWorksSection.value, howItWorksInView)
  createObserver(testimonialsSection.value, testimonialsInView)
  createObserver(ctaSection.value, ctaInView)
  
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');

/* ========================================
   CSS Variables & Base
   ======================================== */
.landing-page {
  --lp-bg: #0a0a0f;
  --lp-bg-elevated: #14141f;
  --lp-bg-card: #1c1c2e;
  --lp-border: rgba(255, 255, 255, 0.1);
  --lp-text: #ffffff;
  --lp-text-secondary: rgba(255, 255, 255, 0.75);
  --lp-text-muted: rgba(255, 255, 255, 0.55);
  --lp-primary: #8b5cf6;
  --lp-primary-light: #a78bfa;
  --lp-cyan: #06b6d4;
  --lp-pink: #ec4899;
  --lp-amber: #f59e0b;
  --lp-emerald: #10b981;
  --lp-rose: #f43f5e;
  
  min-height: 100vh;
  background: linear-gradient(180deg, #0a0a0f 0%, #050508 100%);
  color: var(--lp-text);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  line-height: 1.6;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.text-gradient {
  background: linear-gradient(135deg, var(--lp-primary-light), var(--lp-cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ========================================
   Navigation
   ======================================== */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 1.25rem 0;
  transition: all 0.3s ease;
}

.nav--scrolled {
  background: rgba(10, 10, 15, 0.9);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--lp-border);
  padding: 0.875rem 0;
}

.nav--hidden {
  transform: translateY(-100%);
}

.nav__container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav__brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--lp-text);
}

.nav__logo {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, var(--lp-primary), #7c3aed);
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav__logo svg {
  width: 1.25rem;
  height: 1.25rem;
  color: white;
}

.nav__brand-text {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
}

.nav__menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav__link {
  padding: 0.5rem 1rem;
  color: var(--lp-text-secondary);
  text-decoration: none;
  font-size: 0.9375rem;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.nav__link:hover {
  color: var(--lp-text);
  background: rgba(255, 255, 255, 0.05);
}

.nav__cta {
  padding: 0.625rem 1.25rem;
  margin-left: 0.5rem;
  background: linear-gradient(135deg, var(--lp-primary), #7c3aed);
  border-radius: 0.5rem;
  color: white;
  text-decoration: none;
  font-size: 0.9375rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.nav__cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
}

.nav__toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  width: 44px;
  height: 44px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 10px;
}

.nav__toggle span {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--lp-text);
  transition: all 0.3s ease;
  transform-origin: center;
}

.nav__toggle span.open:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.nav__toggle span.open:nth-child(2) {
  opacity: 0;
}

.nav__toggle span.open:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* ========================================
   Hero Section
   ======================================== */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 10rem 0 6rem;
  overflow: hidden;
  background: radial-gradient(ellipse at top, rgba(139, 92, 246, 0.08) 0%, transparent 50%);
}

.hero__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero__gradient {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%);
  filter: blur(60px);
  animation: pulse-glow 8s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}

.hero__grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse at 70% 30%, black 0%, transparent 60%);
}

.hero__container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero__content {
  max-width: 560px;
}

.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--lp-border);
  border-radius: 2rem;
  font-size: 0.875rem;
  color: var(--lp-text-secondary);
  margin-bottom: 1.5rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease;
}

.hero__badge.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.hero__badge-dot {
  width: 8px;
  height: 8px;
  background: var(--lp-emerald);
  border-radius: 50%;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
}

.hero__title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: 1.25rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease 0.1s;
}

.hero__title.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.hero__subtitle {
  font-size: clamp(1rem, 1.5vw, 1.25rem);
  color: var(--lp-text-secondary);
  margin-bottom: 2rem;
  line-height: 1.7;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease 0.2s;
}

.hero__subtitle.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.hero__actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2.5rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease 0.3s;
  flex-wrap: wrap;
}

.hero__actions.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.hero__social-proof {
  display: flex;
  align-items: center;
  gap: 1rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease 0.4s;
}

.hero__social-proof.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.hero__social-proof p {
  font-size: 0.9375rem;
  color: var(--lp-text-muted);
}

.hero__social-proof strong {
  color: var(--lp-text);
  font-weight: 600;
}

.avatars {
  display: flex;
}

.avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--lp-primary), #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  border: 2px solid var(--lp-bg);
  margin-left: -0.5rem;
}

.avatar:first-child {
  margin-left: 0;
}

/* Hero Visual */
.hero__visual {
  position: relative;
  opacity: 0;
  transform: translateX(30px);
  transition: all 0.8s ease 0.3s;
}

.hero__visual.animate-in {
  opacity: 1;
  transform: translateX(0);
}

.app-preview {
  background: var(--lp-bg-card);
  border: 1px solid var(--lp-border);
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.app-preview__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid var(--lp-border);
}

.app-preview__dots {
  display: flex;
  gap: 6px;
}

.app-preview__dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.app-preview__dots span:nth-child(1) { background: #f43f5e; }
.app-preview__dots span:nth-child(2) { background: #f59e0b; }
.app-preview__dots span:nth-child(3) { background: #10b981; }

.app-preview__title {
  font-size: 0.75rem;
  color: var(--lp-text-muted);
  font-weight: 500;
}

.app-preview__body {
  display: flex;
  height: 320px;
}

.app-preview__sidebar {
  width: 3.5rem;
  background: rgba(255, 255, 255, 0.02);
  border-right: 1px solid var(--lp-border);
  padding: 1rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.app-preview__nav-item {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  color: var(--lp-text-muted);
  transition: all 0.2s ease;
}

.app-preview__nav-item.active {
  background: rgba(139, 92, 246, 0.15);
  color: var(--lp-primary-light);
}

.app-preview__nav-item svg {
  width: 1.25rem;
  height: 1.25rem;
}

.app-preview__main {
  flex: 1;
  padding: 1.25rem;
}

.board {
  display: flex;
  gap: 0.75rem;
  height: 100%;
}

.board__column {
  flex: 1;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.5rem;
  padding: 0.875rem;
}

.board__header {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--lp-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.875rem;
}

.board__card {
  background: var(--lp-bg-elevated);
  border: 1px solid var(--lp-border);
  border-radius: 0.375rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
}

.board__card--done {
  opacity: 0.5;
}

.board__card-tag {
  width: 1.5rem;
  height: 3px;
  border-radius: 2px;
  margin-bottom: 0.5rem;
}

.board__card-text {
  font-size: 0.8125rem;
  color: var(--lp-text-secondary);
}

/* Float Cards */
.float-card {
  position: absolute;
  background: var(--lp-bg-card);
  border: 1px solid var(--lp-border);
  border-radius: 0.75rem;
  padding: 0.875rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: var(--lp-text-secondary);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: float 6s ease-in-out infinite;
}

.float-card--1 {
  top: 10%;
  right: -10%;
  animation-delay: 0s;
}

.float-card--2 {
  bottom: 15%;
  right: 5%;
  animation-delay: -3s;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.float-card__icon {
  width: 1.75rem;
  height: 1.75rem;
  background: var(--lp-emerald);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
}

.float-card__avatars {
  display: flex;
}

.float-card__avatars span {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--lp-primary), #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  font-weight: 600;
  color: white;
  border: 2px solid var(--lp-bg-card);
  margin-left: -0.5rem;
}

/* Scroll Indicator */
.hero__scroll {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: var(--lp-text-muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: opacity 0.5s ease;
}

.hero__scroll--hidden {
  opacity: 0;
  pointer-events: none;
}

.mouse {
  width: 22px;
  height: 36px;
  border: 2px solid var(--lp-text-muted);
  border-radius: 11px;
  display: flex;
  justify-content: center;
  padding-top: 6px;
}

.mouse__wheel {
  width: 4px;
  height: 8px;
  background: var(--lp-text-muted);
  border-radius: 2px;
  animation: scroll-wheel 1.5s ease-in-out infinite;
}

@keyframes scroll-wheel {
  0%, 100% { transform: translateY(0); opacity: 1; }
  50% { transform: translateY(6px); opacity: 0; }
}

/* ========================================
   Buttons
   ======================================== */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn--lg {
  padding: 1rem 2rem;
  font-size: 1rem;
}

.btn--primary {
  background: linear-gradient(135deg, var(--lp-primary), #7c3aed);
  color: white;
  box-shadow: 0 4px 14px 0 rgba(139, 92, 246, 0.25);
}

.btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
}

.btn--primary svg {
  width: 1.25rem;
  height: 1.25rem;
  transition: transform 0.2s ease;
}

.btn--primary:hover svg {
  transform: translateX(4px);
}

.btn--ghost {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--lp-border);
  color: var(--lp-text);
}

.btn--ghost:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.btn--white {
  background: white;
  color: #7c3aed;
  box-shadow: 0 4px 14px 0 rgba(255, 255, 255, 0.15);
}

.btn--white:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(255, 255, 255, 0.25);
}

.btn--white svg {
  width: 1.25rem;
  height: 1.25rem;
  transition: transform 0.2s ease;
}

.btn--white:hover svg {
  transform: translateX(4px);
}

.btn__play {
  width: 2rem;
  height: 2rem;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn__play svg {
  width: 0.75rem;
  height: 0.75rem;
  color: var(--lp-bg);
  margin-left: 2px;
}

/* ========================================
   Logos Section
   ======================================== */
.logos {
  padding: 4rem 0;
  border-top: 1px solid var(--lp-border);
  border-bottom: 1px solid var(--lp-border);
  background: rgba(255, 255, 255, 0.02);
}

.logos__container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
  text-align: center;
}

.logos__title {
  font-size: 0.875rem;
  color: var(--lp-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1.5rem;
}

.logos__grid {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3rem;
  flex-wrap: wrap;
}

.logo__placeholder {
  font-size: 1rem;
  color: var(--lp-text-muted);
  opacity: 0.5;
  font-weight: 500;
}

/* ========================================
   Section Header
   ======================================== */
.section-header {
  text-align: center;
  margin-bottom: 4rem;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s ease;
}

.section-header.in-view {
  opacity: 1;
  transform: translateY(0);
}

.section-header__eyebrow {
  display: inline-block;
  padding: 0.375rem 1rem;
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--lp-primary-light);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1rem;
}

.section-header__title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.section-header__desc {
  font-size: 1.125rem;
  color: var(--lp-text-secondary);
  max-width: 500px;
  margin: 0 auto;
}

/* ========================================
   Features Section
   ======================================== */
.features {
  padding: 8rem 0;
  background: linear-gradient(180deg, transparent 0%, rgba(139, 92, 246, 0.03) 50%, transparent 100%);
}

.features__container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.features__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.feature-card {
  background: var(--lp-bg-card);
  border: 1px solid var(--lp-border);
  border-radius: 1rem;
  padding: 2rem;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(30px);
}

.feature-card.in-view {
  opacity: 1;
  transform: translateY(0);
}

.feature-card:hover {
  transform: translateY(-8px);
  border-color: rgba(139, 92, 246, 0.4);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(139, 92, 246, 0.1);
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, var(--lp-bg-card) 100%);
}

.feature-card__icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.feature-card__icon svg {
  width: 1.75rem;
  height: 1.75rem;
  color: white;
}

.feature-card__icon--purple { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.feature-card__icon--cyan { background: linear-gradient(135deg, #06b6d4, #0891b2); }
.feature-card__icon--pink { background: linear-gradient(135deg, #ec4899, #db2777); }
.feature-card__icon--amber { background: linear-gradient(135deg, #f59e0b, #d97706); }
.feature-card__icon--emerald { background: linear-gradient(135deg, #10b981, #059669); }
.feature-card__icon--rose { background: linear-gradient(135deg, #f43f5e, #e11d48); }

.feature-card__title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.feature-card__desc {
  font-size: 0.9375rem;
  color: var(--lp-text-secondary);
  line-height: 1.6;
}

/* ========================================
   How It Works Section
   ======================================== */
.how-it-works {
  padding: 8rem 0;
  background: linear-gradient(180deg, rgba(10, 10, 15, 0.5) 0%, rgba(20, 20, 31, 0.8) 100%);
  border-top: 1px solid var(--lp-border);
  border-bottom: 1px solid var(--lp-border);
}

.how-it-works__container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.step {
  text-align: center;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s ease;
}

.step.in-view {
  opacity: 1;
  transform: translateY(0);
}

.step__number {
  width: 4rem;
  height: 4rem;
  background: linear-gradient(135deg, var(--lp-primary), #7c3aed);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0 auto 1.5rem;
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
}

.step__title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.step__desc {
  font-size: 0.9375rem;
  color: var(--lp-text-secondary);
  line-height: 1.6;
}

/* ========================================
   Testimonials Section
   ======================================== */
.testimonials {
  padding: 8rem 0;
  background: radial-gradient(ellipse at center, rgba(6, 182, 212, 0.05) 0%, transparent 70%);
}

.testimonials__container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.testimonials__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.testimonial {
  background: var(--lp-bg-card);
  border: 1px solid var(--lp-border);
  border-radius: 1rem;
  padding: 2rem;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(30px);
}

.testimonial.in-view {
  opacity: 1;
  transform: translateY(0);
}

.testimonial:hover {
  transform: translateY(-6px);
  border-color: rgba(139, 92, 246, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.03) 0%, var(--lp-bg-card) 100%);
}

.testimonial__stars {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.testimonial__stars svg {
  width: 1.25rem;
  height: 1.25rem;
  color: #fbbf24;
}

.testimonial__text {
  font-size: 1rem;
  color: var(--lp-text-secondary);
  line-height: 1.7;
  margin-bottom: 1.5rem;
}

.testimonial__author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.testimonial__avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--lp-primary), #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
}

.testimonial__name {
  font-weight: 600;
  color: var(--lp-text);
}

.testimonial__role {
  font-size: 0.875rem;
  color: var(--lp-text-muted);
}

/* ========================================
   CTA Section
   ======================================== */
.cta {
  padding: 8rem 0 6rem;
}

.cta__container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.cta__card {
  position: relative;
  background: linear-gradient(135deg, #7c3aed, #4c1d95);
  border-radius: 1.5rem;
  padding: 4rem 2rem;
  overflow: hidden;
  text-align: center;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s ease;
}

.cta__card.in-view {
  opacity: 1;
  transform: translateY(0);
}

.cta__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.cta__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
}

.cta__orb--1 {
  width: 300px;
  height: 300px;
  background: var(--lp-cyan);
  top: -100px;
  left: -50px;
}

.cta__orb--2 {
  width: 250px;
  height: 250px;
  background: var(--lp-pink);
  bottom: -50px;
  right: -50px;
}

.cta__content {
  position: relative;
  z-index: 1;
  max-width: 500px;
  margin: 0 auto;
}

.cta__title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
}

.cta__desc {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
}

.cta__note {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 1rem;
}

/* ========================================
   Footer
   ======================================== */
.footer {
  padding: 4rem 0 2rem;
  border-top: 1px solid var(--lp-border);
}

.footer__container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.footer__main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 3rem;
  gap: 2rem;
}

.footer__brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.footer__logo {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, var(--lp-primary), #7c3aed);
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer__logo svg {
  width: 1.25rem;
  height: 1.25rem;
  color: white;
}

.footer__brand-name {
  display: block;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
}

.footer__brand-tagline {
  display: block;
  font-size: 0.875rem;
  color: var(--lp-text-muted);
}

.footer__links {
  display: flex;
  gap: 4rem;
}

.footer__column {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer__column h4 {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--lp-text-muted);
  margin-bottom: 0.25rem;
}

.footer__column a {
  color: var(--lp-text-secondary);
  text-decoration: none;
  font-size: 0.9375rem;
  transition: color 0.2s ease;
}

.footer__column a:hover {
  color: var(--lp-text);
}

.footer__bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid var(--lp-border);
}

.footer__bottom p {
  font-size: 0.875rem;
  color: var(--lp-text-muted);
}

.footer__social {
  display: flex;
  gap: 1rem;
}

.footer__social a {
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--lp-text-secondary);
  transition: all 0.2s ease;
}

.footer__social a:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--lp-text);
}

.footer__social svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* ========================================
   Modal
   ======================================== */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1.5rem;
}

.modal__content {
  position: relative;
  width: 100%;
  max-width: 800px;
  aspect-ratio: 16/9;
  background: var(--lp-bg-card);
  border-radius: 1rem;
  overflow: hidden;
}

.modal__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.2s ease;
}

.modal__close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal__close svg {
  width: 1.25rem;
  height: 1.25rem;
}

.modal__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--lp-text-muted);
}

.modal__placeholder svg {
  width: 4rem;
  height: 4rem;
  margin-bottom: 1rem;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ========================================
   Responsive Design
   ======================================== */
@media (max-width: 1024px) {
  .hero__container {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 3rem;
  }
  
  .hero__content {
    max-width: 600px;
    margin: 0 auto;
  }
  
  .hero__actions {
    justify-content: center;
  }
  
  .hero__social-proof {
    justify-content: center;
  }
  
  .hero__visual {
    max-width: 500px;
    margin: 0 auto;
  }
  
  .float-card {
    display: none;
  }
  
  .features__grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .steps {
    grid-template-columns: 1fr;
    max-width: 400px;
  }
  
  .testimonials__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .nav__menu {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 280px;
    background: var(--lp-bg);
    flex-direction: column;
    padding: 5rem 1.5rem 1.5rem;
    gap: 0.5rem;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    border-left: 1px solid var(--lp-border);
  }
  
  .nav__menu--open {
    transform: translateX(0);
  }
  
  .nav__link {
    padding: 0.875rem 0;
    font-size: 1.125rem;
  }
  
  .nav__cta {
    margin-left: 0;
    margin-top: 1rem;
    text-align: center;
    justify-content: center;
  }
  
  .nav__toggle {
    display: flex;
    z-index: 1001;
  }
  
  .hero {
    padding-top: 6rem;
  }
  
  .hero__title {
    font-size: 2.25rem;
  }
  
  .hero__actions {
    flex-direction: column;
    width: 100%;
  }
  
  .btn--lg {
    width: 100%;
    justify-content: center;
  }
  
  .features__grid,
  .testimonials__grid {
    grid-template-columns: 1fr;
  }
  
  .feature-card,
  .testimonial {
    max-width: 400px;
    margin: 0 auto;
    width: 100%;
  }
  
  .footer__main {
    flex-direction: column;
    text-align: center;
  }
  
  .footer__brand {
    justify-content: center;
  }
  
  .footer__links {
    justify-content: center;
    gap: 3rem;
  }
  
  .footer__bottom {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .app-preview__body {
    height: 260px;
  }
  
  .board {
    gap: 0.5rem;
  }
  
  .board__card {
    padding: 0.625rem;
  }
}

@media (max-width: 480px) {
  .hero__title {
    font-size: 2rem;
  }
  
  .section-header__title {
    font-size: 1.75rem;
  }
  
  .logos__grid {
    gap: 1.5rem;
  }
  
  .cta__card {
    padding: 2.5rem 1.5rem;
  }
  
  .app-preview__sidebar {
    width: 3rem;
  }
  
  .app-preview__nav-item {
    width: 2rem;
    height: 2rem;
  }
  
  .app-preview__nav-item svg {
    width: 1rem;
    height: 1rem;
  }
}

/* ========================================
   Reduced Motion
   ======================================== */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
