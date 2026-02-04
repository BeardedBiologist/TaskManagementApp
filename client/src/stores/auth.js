import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../utils/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userName = computed(() => {
    if (!user.value) return ''
    return `${user.value.name.first} ${user.value.name.last}`
  })
  const userInitials = computed(() => {
    if (!user.value) return ''
    return `${user.value.name.first[0]}${user.value.name.last[0]}`.toUpperCase()
  })

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

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    userName,
    userInitials,
    login,
    register,
    fetchCurrentUser,
    initializeAuth,
    logout
  }
})
