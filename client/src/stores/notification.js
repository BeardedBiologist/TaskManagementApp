import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utils/api'
import { useSocketStore } from './socket'

export const useNotificationStore = defineStore('notification', () => {
  const socketStore = useSocketStore()

  // State
  const notifications = ref([])
  const unreadCount = ref(0)
  const totalCount = ref(0)
  const loading = ref(false)

  // Actions
  async function fetchNotifications(page = 1) {
    loading.value = true
    try {
      const { data } = await api.get('/notifications', { params: { page, limit: 50 } })
      if (page === 1) {
        notifications.value = data.notifications
      } else {
        // Append for pagination, dedup by _id
        const existingIds = new Set(notifications.value.map(n => n._id))
        const newOnes = data.notifications.filter(n => !existingIds.has(n._id))
        notifications.value.push(...newOnes)
      }
      totalCount.value = data.total
      unreadCount.value = data.unreadCount
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      loading.value = false
    }
  }

  async function markAsRead(id) {
    try {
      await api.put(`/notifications/${id}/read`)
      const notification = notifications.value.find(n => n._id === id)
      if (notification && !notification.read) {
        notification.read = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  async function markAllRead() {
    try {
      await api.put('/notifications/read-all')
      notifications.value.forEach(n => { n.read = true })
      unreadCount.value = 0
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  async function dismiss(id) {
    try {
      await api.delete(`/notifications/${id}`)
      const idx = notifications.value.findIndex(n => n._id === id)
      if (idx !== -1) {
        const wasUnread = !notifications.value[idx].read
        notifications.value.splice(idx, 1)
        totalCount.value = Math.max(0, totalCount.value - 1)
        if (wasUnread) {
          unreadCount.value = Math.max(0, unreadCount.value - 1)
        }
      }
    } catch (err) {
      console.error('Failed to dismiss notification:', err)
    }
  }

  function handleNotification(notification) {
    // Prepend to list, cap at 50
    notifications.value.unshift(notification)
    if (notifications.value.length > 50) {
      notifications.value = notifications.value.slice(0, 50)
    }
    unreadCount.value += 1
    totalCount.value += 1
  }

  function setupSocketListeners() {
    socketStore.on('notification', handleNotification)
  }

  function removeSocketListeners() {
    socketStore.off('notification', handleNotification)
  }

  function $reset() {
    notifications.value = []
    unreadCount.value = 0
    totalCount.value = 0
    loading.value = false
  }

  return {
    // State
    notifications,
    unreadCount,
    totalCount,
    loading,

    // Actions
    fetchNotifications,
    markAsRead,
    markAllRead,
    dismiss,
    setupSocketListeners,
    removeSocketListeners,
    $reset
  }
})
