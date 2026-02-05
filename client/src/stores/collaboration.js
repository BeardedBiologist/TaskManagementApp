import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import { useSocketStore } from './socket'

export const useCollaborationStore = defineStore('collaboration', () => {
  const socketStore = useSocketStore()
  
  // Presence state
  const roomUsers = reactive(new Map())
  const currentRoom = ref(null)
  const userCursors = reactive(new Map())
  const userActivity = reactive(new Map())
  const listenersInitialized = ref(false)
  
  // Comments state
  const comments = ref([])
  const activeCommentId = ref(null)
  
  // Activity feed
  const activities = ref([])
  const hasMoreActivities = ref(true)
  
  // Computed
  const onlineUsers = computed(() => {
    return Array.from(roomUsers.values())
  })
  
  const userCount = computed(() => roomUsers.size)
  
  const activeComments = computed(() => {
    return comments.value.filter(c => c.status === 'open')
  })
  
  const resolvedComments = computed(() => {
    return comments.value.filter(c => c.status === 'resolved')
  })
  
  // Join a collaboration room
  function joinRoom(roomType, roomId, user) {
    currentRoom.value = { type: roomType, id: roomId }
    socketStore.emit('join-room', {
      roomId,
      roomType,
      user: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        initials: user.initials
      }
    })
    
    // Set up listeners
    if (!listenersInitialized.value) {
      setupRoomListeners()
      listenersInitialized.value = true
    }
  }
  
  function leaveRoom() {
    if (currentRoom.value) {
      socketStore.emit('leave-room', {
        roomId: currentRoom.value.id,
        roomType: currentRoom.value.type
      })
      currentRoom.value = null
      roomUsers.clear()
      userCursors.clear()
      userActivity.clear()
    }
  }
  
  function setupRoomListeners() {
    // User joined
    socketStore.on('user-joined', (data) => {
      const joinedUser = data.user || {}
      roomUsers.set(data.userId, {
        ...joinedUser,
        initials: joinedUser.initials || getInitials(joinedUser.name)
      })
    })
    
    // User left
    socketStore.on('user-left', (data) => {
      roomUsers.delete(data.userId)
      userCursors.delete(data.userId)
      userActivity.delete(data.userId)
    })
    
    // Room users list
    socketStore.on('room-users', (users) => {
      users.forEach(entry => {
        const userId = entry.userId || entry?.user?._id
        const userData = entry.user || entry
        if (!userId || !userData) return
        roomUsers.set(userId, {
          ...userData,
          initials: userData.initials || getInitials(userData.name)
        })
        if (entry.cursor) {
          userCursors.set(userId, entry.cursor)
        }
        if (entry.activity) {
          userActivity.set(userId, {
            activity: entry.activity,
            timestamp: entry.timestamp || new Date()
          })
        }
      })
    })
    
    // Cursor updates
    socketStore.on('cursor-update', (data) => {
      userCursors.set(data.userId, data.cursor)
    })
    
    // Activity updates
    socketStore.on('user-activity', (data) => {
      userActivity.set(data.userId, {
        activity: data.activity,
        timestamp: data.timestamp
      })
    })
  }

  function getInitials(name) {
    if (!name) return '?'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  
  // Update cursor position
  function updateCursor(x, y, blockId = null, selection = null) {
    if (!currentRoom.value) return
    
    socketStore.emit('cursor-move', {
      roomId: currentRoom.value.id,
      roomType: currentRoom.value.type,
      cursor: { x, y, blockId, selection }
    })
  }
  
  // Update activity status
  function updateActivity(activity) {
    if (!currentRoom.value) return
    
    socketStore.emit('activity-update', {
      roomId: currentRoom.value.id,
      roomType: currentRoom.value.type,
      activity
    })
  }
  
  // Comments
  function setComments(newComments) {
    comments.value = newComments
  }
  
  function addComment(comment) {
    comments.value.unshift(comment)
  }
  
  function updateComment(commentId, updates) {
    const index = comments.value.findIndex(c => c._id === commentId)
    if (index !== -1) {
      comments.value[index] = { ...comments.value[index], ...updates }
    }
  }
  
  function resolveComment(commentId, resolvedBy) {
    const comment = comments.value.find(c => c._id === commentId)
    if (comment) {
      comment.status = 'resolved'
      comment.resolvedBy = resolvedBy
      comment.resolvedAt = new Date()
    }
  }
  
  function deleteComment(commentId) {
    comments.value = comments.value.filter(c => c._id !== commentId)
  }
  
  function setActiveComment(id) {
    activeCommentId.value = id
  }
  
  // Activity feed
  function addActivity(activity) {
    activities.value.unshift(activity)
  }
  
  function setActivities(newActivities) {
    activities.value = newActivities
  }
  
  function appendActivities(newActivities) {
    activities.value.push(...newActivities)
  }
  
  function setHasMore(value) {
    hasMoreActivities.value = value
  }
  
  return {
    // State
    roomUsers,
    currentRoom,
    userCursors,
    userActivity,
    comments,
    activeCommentId,
    activities,
    hasMoreActivities,
    
    // Computed
    onlineUsers,
    userCount,
    activeComments,
    resolvedComments,
    
    // Actions
    joinRoom,
    leaveRoom,
    updateCursor,
    updateActivity,
    setComments,
    addComment,
    updateComment,
    resolveComment,
    deleteComment,
    setActiveComment,
    addActivity,
    setActivities,
    appendActivities,
    setHasMore
  }
})
