import { defineStore } from 'pinia'
import { ref } from 'vue'
import { io } from 'socket.io-client'

export const useSocketStore = defineStore('socket', () => {
  const socket = ref(null)
  const connected = ref(false)

  function connect(tokenOverride = null) {
    if (socket.value?.connected) return

    const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const socketUrl = rawUrl.replace(/\/api\/?$/, '')
    const token = tokenOverride || localStorage.getItem('token')
    socket.value = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true,
      auth: {
        token
      }
    })

    socket.value.on('connect', () => {
      console.log('Socket connected')
      connected.value = true
    })

    socket.value.on('disconnect', () => {
      console.log('Socket disconnected')
      connected.value = false
    })

    socket.value.on('connect_error', (error) => {
      console.error('Socket connect error:', error?.message || error)
    })

    socket.value.on('error', (error) => {
      console.error('Socket error:', error)
    })
  }

  function disconnect() {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      connected.value = false
    }
  }

  function joinWorkspace(workspaceId) {
    if (!socket.value) {
      connect()
    }
    socket.value?.emit('join-workspace', workspaceId)
  }

  function leaveWorkspace(workspaceId) {
    socket.value?.emit('leave-workspace', workspaceId)
  }

  function joinProject(projectId) {
    if (!socket.value) {
      connect()
    }
    socket.value?.emit('join-project', projectId)
  }

  function leaveProject(projectId) {
    socket.value?.emit('leave-project', projectId)
  }

  function on(event, callback) {
    if (socket.value) {
      socket.value.on(event, callback)
    }
  }

  function off(event, callback) {
    if (socket.value) {
      socket.value.off(event, callback)
    }
  }

  function emit(event, data) {
    if (!socket.value) {
      connect()
    }
    socket.value?.emit(event, data)
  }

  return {
    socket,
    connected,
    connect,
    disconnect,
    joinWorkspace,
    leaveWorkspace,
    joinProject,
    leaveProject,
    on,
    off,
    emit
  }
})
