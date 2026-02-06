import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../utils/api'
import { useSocketStore } from './socket'

export const useChatStore = defineStore('chat', () => {
  const socketStore = useSocketStore()
  
  // State
  const conversations = ref([])
  const currentConversation = ref(null)
  const messages = ref([])
  const unreadCount = ref(0)
  const loading = ref(false)
  const error = ref(null)
  const isWidgetOpen = ref(false)
  const widgetView = ref('list') // 'list' | 'chat'

  // Getters
  const sortedConversations = computed(() => {
    return [...conversations.value].sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || a.updatedAt
      const bTime = b.lastMessage?.createdAt || b.updatedAt
      return new Date(bTime) - new Date(aTime)
    })
  })

  const totalUnreadCount = computed(() => {
    return conversations.value.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0)
  })

  // Actions
  async function fetchConversations() {
    loading.value = true
    try {
      const { data } = await api.get('/conversations')
      conversations.value = data
      updateUnreadCount()
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch conversations:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchMessages(conversationId) {
    loading.value = true
    try {
      const { data } = await api.get(`/conversations/${conversationId}/messages`)
      messages.value = data
      // Mark as read
      await markAsRead(conversationId)
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch messages:', err)
    } finally {
      loading.value = false
    }
  }

  async function startConversation(participantId, type = 'direct') {
    try {
      const { data } = await api.post('/conversations', {
        participantId,
        type
      })
      
      // Add to list if new
      const existing = conversations.value.find(c => c._id === data._id)
      if (!existing) {
        conversations.value.unshift(data)
      }
      
      return data
    } catch (err) {
      error.value = err.message
      console.error('Failed to start conversation:', err)
      throw err
    }
  }

  async function sendMessage(conversationId, content, attachments = []) {
    try {
      const { data } = await api.post(`/conversations/${conversationId}/messages`, {
        content,
        attachments
      })
      
      messages.value.push(data)
      
      // Update conversation's last message
      const conv = conversations.value.find(c => c._id === conversationId)
      if (conv) {
        conv.lastMessage = data
        conv.updatedAt = data.createdAt
      }
      
      // Emit via socket for real-time
      socketStore.emit('message-sent', {
        conversationId,
        message: data
      })
      
      return data
    } catch (err) {
      error.value = err.message
      console.error('Failed to send message:', err)
      throw err
    }
  }

  async function markAsRead(conversationId) {
    try {
      await api.put(`/conversations/${conversationId}/read`)
      
      const conv = conversations.value.find(c => c._id === conversationId)
      if (conv) {
        conv.unreadCount = 0
      }
      
      updateUnreadCount()
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  function updateUnreadCount() {
    unreadCount.value = conversations.value.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0)
  }

  function selectConversation(conversation) {
    currentConversation.value = conversation
    widgetView.value = 'chat'
    if (conversation?.unreadCount > 0) {
      markAsRead(conversation._id)
    }
  }

  function backToList() {
    widgetView.value = 'list'
    currentConversation.value = null
    messages.value = []
  }

  function openWidget() {
    isWidgetOpen.value = true
    fetchConversations()
  }

  function closeWidget() {
    isWidgetOpen.value = false
    widgetView.value = 'list'
    currentConversation.value = null
    messages.value = []
  }

  function toggleWidget() {
    if (isWidgetOpen.value) {
      closeWidget()
    } else {
      openWidget()
    }
  }

  // Socket event handlers
  function handleNewMessage({ conversationId, message }) {
    console.log('New message received:', conversationId, message)
    
    // If we're in this conversation, add to messages
    if (currentConversation.value?._id === conversationId) {
      messages.value.push(message)
      markAsRead(conversationId)
    } else {
      // Update unread count
      const conv = conversations.value.find(c => c._id === conversationId)
      if (conv) {
        conv.unreadCount = (conv.unreadCount || 0) + 1
        conv.lastMessage = message
        conv.updatedAt = message.createdAt
        updateUnreadCount()
        console.log('Updated unread count for conversation:', conv._id, conv.unreadCount)
      } else {
        // New conversation, fetch all
        console.log('New conversation detected, fetching all conversations')
        fetchConversations()
      }
    }
  }

  function setupSocketListeners() {
    // Join user-specific room for direct messages
    socketStore.joinUserRoom()
    
    // Set up listeners for new messages
    socketStore.on('new-message', handleNewMessage)
    socketStore.on('message-read', ({ conversationId, userId }) => {
      // Handle read receipts if needed
    })
    
    console.log('Chat socket listeners set up')
  }

  function removeSocketListeners() {
    socketStore.off('new-message')
    socketStore.off('message-read')
    socketStore.leaveUserRoom()
  }

  return {
    // State
    conversations,
    currentConversation,
    messages,
    unreadCount,
    loading,
    error,
    isWidgetOpen,
    widgetView,
    
    // Getters
    sortedConversations,
    totalUnreadCount,
    
    // Actions
    fetchConversations,
    fetchMessages,
    startConversation,
    sendMessage,
    markAsRead,
    selectConversation,
    backToList,
    openWidget,
    closeWidget,
    toggleWidget,
    setupSocketListeners,
    removeSocketListeners
  }
})
