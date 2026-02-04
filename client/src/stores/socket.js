import { defineStore } from 'pinia'
import { ref } from 'vue'
import { io } from 'socket.io-client'

export const useSocketStore = defineStore('socket', () => {
  const socket = ref(null)
  const connected = ref(false)

  function connect() {
    if (socket.value?.connected) return

    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    socket.value = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true
    })

    socket.value.on('connect', () => {
      console.log('Socket connected')
      connected.value = true
    })

    socket.value.on('disconnect', () => {
      console.log('Socket disconnected')
      connected.value = false
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
    if (socket.value?.connected) {
      socket.value.emit('join-workspace', workspaceId)
    }
  }

  function leaveWorkspace(workspaceId) {
    if (socket.value?.connected) {
      socket.value.emit('leave-workspace', workspaceId)
    }
  }

  function joinProject(projectId) {
    if (socket.value?.connected) {
      socket.value.emit('join-project', projectId)
    }
  }

  function leaveProject(projectId) {
    if (socket.value?.connected) {
      socket.value.emit('leave-project', projectId)
    }
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
    if (socket.value?.connected) {
      socket.value.emit(event, data)
    }
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
