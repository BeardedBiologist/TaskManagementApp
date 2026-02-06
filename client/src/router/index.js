import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('../views/LandingPage.vue'),
    meta: { public: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { guest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/workspaces',
    name: 'Workspaces',
    component: () => import('../views/Workspaces.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/workspaces/:id',
    name: 'Workspace',
    component: () => import('../views/Workspace.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/projects/:id',
    name: 'Project',
    component: () => import('../views/Project.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('../views/Calendar.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/activity',
    name: 'Activity',
    component: () => import('../views/Activity.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('../views/Chat.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/whiteboards',
    name: 'Whiteboards',
    component: () => import('../views/Whiteboards.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pages/:id',
    name: 'Page',
    component: () => import('../views/Page.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/projects/:id/pages/:pageId',
    name: 'ProjectPage',
    component: () => import('../views/Page.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Redirect authenticated users away from landing/login/register
  if (to.meta.guest && authStore.isAuthenticated) {
    next('/dashboard')
    return
  }
  
  // Redirect authenticated users from landing to dashboard
  if (to.path === '/' && authStore.isAuthenticated) {
    next('/dashboard')
    return
  }
  
  // Redirect unauthenticated users to landing page (not login)
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/')
    return
  }
  
  next()
})

export default router
