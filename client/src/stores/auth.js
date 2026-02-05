import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import api from '../utils/api'
import { getBrowserTimeZone } from '../utils/helpers'
import { useThemeStore } from './theme'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  const userName = computed(() => {
    if (!user.value) return ''
    return `${user.value.name.first} ${user.value.name.last}`
  })
  const userInitials = computed(() => {
    if (!user.value) return ''
    return `${user.value.name.first[0]}${user.value.name.last[0]}`.toUpperCase()
  })
  const userTimezone = computed(() => {
    return user.value?.settings?.timezone || getBrowserTimeZone()
  })

  // Sync user settings with theme store
  function syncUserTheme() {
    if (user.value?.settings) {
      const themeStore = useThemeStore()
      const { theme, darkMode } = user.value.settings
      
      if (theme && theme !== themeStore.currentTheme) {
        themeStore.setTheme(theme)
      }
      
      if (darkMode !== undefined && darkMode !== themeStore.isDarkMode) {
        themeStore.setDarkMode(darkMode)
      }
    }
  }

  // Watch for user changes and sync theme
  watch(user, (newUser) => {
    if (newUser) {
      syncUserTheme()
    }
  }, { immediate: true })

  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('token', newToken)
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
  }

  function clearAuth() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
  }

  async function login(email, password) {
    loading.value = true
    error.value = null
    
    try {
      const { data } = await api.post('/auth/login', { email, password })
      setToken(data.token)
      user.value = data.user
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed'
      return false
    } finally {
      loading.value = false
    }
  }

  async function register(userData) {
    loading.value = true
    error.value = null
    
    try {
      const { data } = await api.post('/auth/register', userData)
      setToken(data.token)
      user.value = data.user
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Registration failed'
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchCurrentUser() {
    try {
      const { data } = await api.get('/users/me')
      user.value = data
      return true
    } catch (err) {
      clearAuth()
      return false
    }
  }

  async function initializeAuth() {
    if (token.value) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
      await fetchCurrentUser()
    }
  }

  function logout() {
    clearAuth()
  }

  async function updateProfile(updates) {
    const { data } = await api.put('/users/me', updates)
    user.value = data
    return data
  }

  // Save theme preferences to server
  async function saveThemePreference(theme, darkMode) {
    const updates = {}
    if (theme !== undefined) updates.theme = theme
    if (darkMode !== undefined) updates.darkMode = darkMode
    
    if (Object.keys(updates).length > 0) {
      return await updateProfile(updates)
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    userName,
    userInitials,
    userTimezone,
    login,
    register,
    fetchCurrentUser,
    initializeAuth,
    logout,
    updateProfile,
    saveThemePreference,
    syncUserTheme
  }
})
