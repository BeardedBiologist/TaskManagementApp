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
      // Process any pending listeners
      processPendingListeners()
      // Join user room for messages
      joinUserRoom()
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
      attachedListeners.clear()
      pendingListeners = []
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

  const attachedListeners = new Map()

  function on(event, callback) {
    // Prevent duplicate listeners for the same event/callback pair
    const key = `${event}-${callback.toString()}`
    if (attachedListeners.has(key)) {
      return
    }
    attachedListeners.set(key, true)
    
    if (socket.value) {
      socket.value.on(event, callback)
      console.log(`Socket listener attached for: ${event}`)
    } else {
      // Store pending listeners
      if (!pendingListeners) pendingListeners = []
      pendingListeners.push({ event, callback, key })
      console.log(`Socket listener queued for: ${event}`)
    }
  }
  
  // Process pending listeners when socket connects
  let pendingListeners = []
  
  function processPendingListeners() {
    if (pendingListeners && pendingListeners.length > 0) {
      pendingListeners.forEach(({ event, callback, key }) => {
        socket.value?.on(event, callback)
        if (key) attachedListeners.set(key, true)
        console.log(`Pending socket listener attached for: ${event}`)
      })
      pendingListeners = []
    }
  }

  function off(event, callback) {
    if (socket.value) {
      if (callback) {
        socket.value.off(event, callback)
        const key = `${event}-${callback.toString()}`
        attachedListeners.delete(key)
      } else {
        socket.value.off(event)
        // Remove all keys for this event
        for (const key of attachedListeners.keys()) {
          if (key.startsWith(`${event}-`)) {
            attachedListeners.delete(key)
          }
        }
      }
    }
  }

  function disconnect() {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      connected.value = false
      attachedListeners.clear()
      pendingListeners = []
    }
  }

  function joinUserRoom() {
    if (!socket.value) {
      connect()
    }
    socket.value?.emit('join-user-room')
  }

  function leaveUserRoom() {
    socket.value?.emit('leave-user-room')
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
    joinUserRoom,
    leaveUserRoom,
    on,
    off,
    emit
  }
})
