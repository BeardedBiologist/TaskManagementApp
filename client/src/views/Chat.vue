<template>
  <Layout>
    <div class="chat-page">
      <div class="chat-layout">
        <!-- Sidebar - Conversation List -->
        <aside class="chat-sidebar" :class="{ 'mobile-hidden': mobileChatOpen }">
          <div class="sidebar-header">
            <h1>Messages</h1>
            <button class="btn btn-primary btn-sm" @click="showNewChat = true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New
            </button>
          </div>

          <div class="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search messages..."
            />
          </div>

          <div class="conversations-list">
            <div v-if="loading && !conversations.length" class="loading-state">
              <div class="spinner"></div>
            </div>

            <div v-else-if="filteredConversations.length === 0" class="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <p>{{ searchQuery ? 'No conversations found' : 'No messages yet' }}</p>
              <button v-if="!searchQuery" class="btn btn-primary" @click="showNewChat = true">
                Start a conversation
              </button>
            </div>

            <div v-else class="conversations">
              <div
                v-for="conv in filteredConversations"
                :key="conv._id"
                class="conversation-card"
                :class="{ 
                  active: currentConversation?._id === conv._id,
                  unread: conv.unreadCount > 0 
                }"
                @click="openConversation(conv)"
              >
                <div class="conversation-avatar">
                  {{ getParticipantInitials(conv) }}
                </div>
                <div class="conversation-details">
                  <div class="conversation-top">
                    <span class="name">{{ getParticipantName(conv) }}</span>
                    <span class="time">{{ formatTime(conv.lastMessage?.createdAt || conv.updatedAt) }}</span>
                  </div>
                  <div class="conversation-bottom">
                    <p class="preview">{{ conv.lastMessage?.content || 'No messages yet' }}</p>
                    <span v-if="conv.unreadCount > 0" class="unread-badge">
                      {{ conv.unreadCount }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Chat Area -->
        <main class="chat-main" :class="{ 'mobile-open': mobileChatOpen }">
          <template v-if="currentConversation">
            <!-- Chat Header -->
            <header class="chat-header">
              <button class="back-btn mobile-only" @click="closeMobileChat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              
              <div class="header-user">
                <div class="user-avatar">
                  {{ getParticipantInitials(currentConversation) }}
                </div>
                <div class="user-info">
                  <h3>{{ getParticipantName(currentConversation) }}</h3>
                  <span class="status" :class="{ online: isOnline }">{{ isOnline ? 'Online' : 'Offline' }}</span>
                </div>
              </div>

              <div class="header-actions">
                <button class="action-btn" title="Voice call">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </button>
                <button class="action-btn" title="Video call">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="23 7 16 12 23 17 23 7"/>
                    <rect x="1" y="5" width="15" height="14" rx="2"/>
                  </svg>
                </button>
                <button class="action-btn" title="More options" @click="showConversationMenu = !showConversationMenu">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="1"/>
                    <circle cx="19" cy="12" r="1"/>
                    <circle cx="5" cy="12" r="1"/>
                  </svg>
                </button>

                <!-- Conversation Menu -->
                <div v-if="showConversationMenu" class="dropdown-menu">
                  <button class="dropdown-item" @click="clearHistory">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v-2a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2"/>
                      <path d="M10 11v6"/>
                      <path d="M14 11v6"/>
                    </svg>
                    Clear history
                  </button>
                  <button class="dropdown-item danger" @click="blockUser">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                    </svg>
                    Block user
                  </button>
                </div>
              </div>
            </header>

            <!-- Messages -->
            <div ref="messagesContainer" class="messages-container">
              <div v-if="messagesLoading" class="messages-loading">
                <div class="spinner"></div>
              </div>

              <div v-else-if="messages.length === 0" class="empty-conversation">
                <div class="empty-illustration">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <h3>No messages yet</h3>
                <p>Start the conversation by sending a message below.</p>
              </div>

              <div v-else class="messages">
                <div
                  v-for="(message, index) in messages"
                  :key="message._id"
                  class="message"
                  :class="{ 
                    sent: isSentByMe(message),
                    'first-in-group': isFirstInGroup(message, index),
                    'last-in-group': isLastInGroup(message, index)
                  }"
                >
                  <div v-if="!isSentByMe(message) && isFirstInGroup(message, index)" class="message-avatar">
                    {{ getSenderInitials(message) }}
                  </div>
                  <div class="message-wrapper">
                    <div class="message-bubble">
                      <p class="message-text">{{ message.content }}</p>
                      <div class="message-meta">
                        <span class="message-time">{{ formatFullTime(message.createdAt) }}</span>
                        <span v-if="isSentByMe(message)" class="read-status">
                          <svg v-if="message.read" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Message Input -->
            <div class="chat-input-area">
              <div class="input-actions">
                <button class="input-action-btn" title="Attach file">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                  </svg>
                </button>
                <button class="input-action-btn" title="Emoji">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                    <line x1="9" y1="9" x2="9.01" y2="9"/>
                    <line x1="15" y1="9" x2="15.01" y2="9"/>
                  </svg>
                </button>
              </div>
              <div class="message-input-wrapper">
                <textarea
                  v-model="newMessage"
                  rows="1"
                  placeholder="Type a message..."
                  @keydown.enter.prevent="sendMessage"
                  @input="autoResize"
                  ref="messageInput"
                ></textarea>
                <button 
                  class="send-btn"
                  :disabled="!newMessage.trim()"
                  @click="sendMessage"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
            </div>
          </template>

          <div v-else class="no-conversation">
            <div class="no-conversation-content">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the sidebar or start a new one.</p>
              <button class="btn btn-primary" @click="showNewChat = true">
                New Message
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- New Chat Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showNewChat" class="modal-overlay" @click.self="showNewChat = false">
          <Transition name="scale">
            <div v-if="showNewChat" class="modal">
              <div class="modal-header">
                <h3>New Message</h3>
                <button class="btn btn-icon btn-ghost" @click="showNewChat = false">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              
              <div class="modal-body">
                <div class="form-group">
                  <label class="form-label">Search people</label>
                  <div class="search-input-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="11" cy="11" r="8"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input
                      v-model="newChatSearch"
                      type="text"
                      class="form-input"
                      placeholder="Type a name or email..."
                      autofocus
                    />
                  </div>
                </div>

                <div class="users-list">
                  <div v-if="filteredUsers.length === 0" class="no-users">
                    No users found
                  </div>
                  <div
                    v-for="user in filteredUsers"
                    :key="user._id"
                    class="user-card"
                    @click="startChatWith(user)"
                  >
                    <div class="user-avatar">
                      {{ getInitials(user.name?.first, user.name?.last) }}
                    </div>
                    <div class="user-details">
                      <span class="user-name">{{ user.name?.first }} {{ user.name?.last }}</span>
                      <span class="user-email">{{ user.email }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import Layout from '../components/Layout.vue'
import { useChatStore } from '../stores/chat'
import { useAuthStore } from '../stores/auth'
import { useSocketStore } from '../stores/socket'
import api from '../utils/api'

const route = useRoute()
const router = useRouter()
const chatStore = useChatStore()
const authStore = useAuthStore()
const socketStore = useSocketStore()

const messagesContainer = ref(null)
const messageInput = ref(null)
const newMessage = ref('')
const showNewChat = ref(false)
const newChatSearch = ref('')
const searchQuery = ref('')
const showConversationMenu = ref(false)
const mobileChatOpen = ref(false)
const messagesLoading = ref(false)
const users = ref([])
const isOnline = ref(true)

// Use storeToRefs to maintain reactivity for state properties
const { conversations, currentConversation, messages, loading } = storeToRefs(chatStore)

const filteredConversations = computed(() => {
  let convs = chatStore.sortedConversations
  if (!searchQuery.value) return convs
  const q = searchQuery.value.toLowerCase()
  return convs.filter(c => {
    const name = getParticipantName(c).toLowerCase()
    const msg = c.lastMessage?.content?.toLowerCase() || ''
    return name.includes(q) || msg.includes(q)
  })
})

const filteredUsers = computed(() => {
  if (!newChatSearch.value) return users.value
  const q = newChatSearch.value.toLowerCase()
  return users.value.filter(u => 
    u.name?.first?.toLowerCase().includes(q) ||
    u.name?.last?.toLowerCase().includes(q) ||
    u.email?.toLowerCase().includes(q)
  )
})

onMounted(async () => {
  // Socket listeners are set up globally in App.vue
  await chatStore.fetchConversations()
  await fetchUsers()
  
  // Check if conversation ID in URL
  if (route.query.conversation) {
    const conv = conversations.value.find(c => c._id === route.query.conversation)
    if (conv) {
      await openConversation(conv)
    }
  }
})

watch(messages, () => {
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true })

async function fetchUsers() {
  try {
    const { data } = await api.get('/users?limit=100')
    users.value = data.filter(u => u._id !== authStore.user?._id)
  } catch (err) {
    console.error('Failed to fetch users:', err)
  }
}

async function openConversation(conv) {
  chatStore.selectConversation(conv)
  messagesLoading.value = true
  await chatStore.fetchMessages(conv._id)
  messagesLoading.value = false
  mobileChatOpen.value = true
  
  // Update URL
  router.replace({ query: { ...route.query, conversation: conv._id } })
  
  // Focus input
  nextTick(() => {
    messageInput.value?.focus()
  })
}

function closeMobileChat() {
  mobileChatOpen.value = false
  chatStore.backToList()
  router.replace({ query: { ...route.query, conversation: undefined } })
}

async function startChatWith(user) {
  try {
    const conversation = await chatStore.startConversation(user._id)
    showNewChat.value = false
    newChatSearch.value = ''
    await openConversation(conversation)
  } catch (err) {
    console.error('Failed to start chat:', err)
  }
}

async function sendMessage() {
  if (!newMessage.value.trim() || !currentConversation.value) return
  
  try {
    await chatStore.sendMessage(
      currentConversation.value._id,
      newMessage.value.trim()
    )
    newMessage.value = ''
    autoResize()
  } catch (err) {
    console.error('Failed to send message:', err)
  }
}

function autoResize() {
  const textarea = messageInput.value
  if (!textarea) return
  textarea.style.height = 'auto'
  textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function isSentByMe(message) {
  return message.sender?._id === authStore.user?._id || message.sender === authStore.user?._id
}

function isFirstInGroup(message, index) {
  if (index === 0) return true
  const prev = messages.value[index - 1]
  const prevSender = prev.sender?._id || prev.sender
  const currSender = message.sender?._id || message.sender
  return prevSender !== currSender
}

function isLastInGroup(message, index) {
  if (index === messages.value.length - 1) return true
  const next = messages.value[index + 1]
  const nextSender = next.sender?._id || next.sender
  const currSender = message.sender?._id || message.sender
  return nextSender !== currSender
}

function getParticipantInitials(conv) {
  const participant = conv.participants?.find(p => p._id !== authStore.user?._id)
  if (!participant) return '?'
  return `${participant.name?.first?.[0] || ''}${participant.name?.last?.[0] || ''}`.toUpperCase()
}

function getParticipantName(conv) {
  const participant = conv.participants?.find(p => p._id !== authStore.user?._id)
  if (!participant) return 'Unknown'
  return `${participant.name?.first || ''} ${participant.name?.last || ''}`.trim()
}

function getSenderInitials(message) {
  const sender = message.sender
  if (!sender || typeof sender === 'string') return '?'
  return `${sender.name?.first?.[0] || ''}${sender.name?.last?.[0] || ''}`.toUpperCase()
}

function getInitials(first, last) {
  return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase()
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Now'
  if (minutes < 60) return `${minutes}m`
  
  const hours = Math.floor(diff / 3600000)
  if (hours < 24) return `${hours}h`
  
  const days = Math.floor(diff / 86400000)
  if (days < 7) return `${days}d`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatFullTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  
  if (isToday) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function clearHistory() {
  showConversationMenu.value = false
  if (!confirm('Clear all messages in this conversation?')) return
  // API call to clear history
}

function blockUser() {
  showConversationMenu.value = false
  if (!confirm('Block this user? You won\'t receive messages from them.')) return
  // API call to block user
}
</script>

<style scoped>
.chat-page {
  height: calc(100vh - 64px);
  overflow: hidden;
}

.chat-layout {
  display: flex;
  height: 100%;
}

/* Sidebar */
.chat-sidebar {
  width: 320px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
}

.sidebar-header h1 {
  font-size: 1.25rem;
  font-weight: 600;
}

.sidebar-header .btn svg {
  width: 16px;
  height: 16px;
}

.search-box {
  position: relative;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
}

.search-box svg {
  position: absolute;
  left: calc(var(--space-4) + var(--space-3));
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--text-tertiary);
}

.search-box input {
  width: 100%;
  padding: var(--space-2) var(--space-3) var(--space-2) var(--space-8);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
}

.search-box input:focus {
  border-color: var(--primary-500);
}

.conversations-list {
  flex: 1;
  overflow-y: auto;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  text-align: center;
  color: var(--text-tertiary);
}

.empty-state svg {
  width: 48px;
  height: 48px;
  margin-bottom: var(--space-3);
  opacity: 0.5;
}

.empty-state p {
  margin-bottom: var(--space-4);
}

.conversations {
  padding: var(--space-2);
}

.conversation-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
}

.conversation-card:hover {
  background: var(--bg-tertiary);
}

.conversation-card.active {
  background: var(--primary-500-alpha-10, rgba(139, 92, 246, 0.1));
}

.conversation-card.unread {
  background: var(--primary-500-alpha-05, rgba(139, 92, 246, 0.05));
}

.conversation-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.conversation-details {
  flex: 1;
  min-width: 0;
}

.conversation-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.conversation-top .name {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.9375rem;
}

.conversation-top .time {
  font-size: 12px;
  color: var(--text-tertiary);
}

.conversation-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-2);
}

.conversation-bottom .preview {
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.unread-badge {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: var(--primary-500);
  color: white;
  font-size: 12px;
  font-weight: 600;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Main Chat Area */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.chat-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-secondary);
}

.back-btn {
  display: none;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

.header-user {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.user-info h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.user-info .status {
  font-size: 13px;
  color: var(--text-tertiary);
}

.user-info .status.online {
  color: var(--accent-emerald);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  position: relative;
}

.action-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + var(--space-2));
  right: 0;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  min-width: 180px;
  z-index: 100;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dropdown-item:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.dropdown-item.danger {
  color: var(--accent-rose);
}

.dropdown-item.danger:hover {
  background: var(--accent-rose-alpha-10, rgba(244, 63, 94, 0.1));
}

.dropdown-item svg {
  width: 16px;
  height: 16px;
}

/* Messages */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
}

.messages-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.empty-conversation {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: var(--text-tertiary);
}

.empty-illustration {
  width: 80px;
  height: 80px;
  margin-bottom: var(--space-4);
  opacity: 0.5;
}

.empty-illustration svg {
  width: 100%;
  height: 100%;
}

.empty-conversation h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.messages {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.message {
  display: flex;
  align-items: flex-end;
  gap: var(--space-2);
  max-width: 70%;
}

.message.sent {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
  margin-bottom: var(--space-1);
}

.message-wrapper {
  display: flex;
  flex-direction: column;
}

.message-bubble {
  padding: var(--space-2) var(--space-3);
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  border-bottom-left-radius: 4px;
}

.message.sent .message-bubble {
  background: var(--primary-500);
  color: white;
  border-bottom-left-radius: var(--radius-lg);
  border-bottom-right-radius: 4px;
}

.message-text {
  font-size: 14px;
  line-height: 1.4;
  margin: 0;
  word-break: break-word;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin-top: 4px;
  justify-content: flex-end;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
}

.read-status svg {
  width: 12px;
  height: 12px;
}

/* Input Area */
.chat-input-area {
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-secondary);
}

.input-actions {
  display: flex;
  gap: var(--space-1);
  margin-bottom: var(--space-2);
}

.input-action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.input-action-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.input-action-btn svg {
  width: 18px;
  height: 18px;
}

.message-input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: var(--space-2);
  background: var(--bg-primary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-2) var(--space-3);
}

.message-input-wrapper textarea {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  outline: none;
  min-height: 24px;
  max-height: 120px;
}

.message-input-wrapper textarea::placeholder {
  color: var(--text-tertiary);
}

.send-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-500);
  border: none;
  border-radius: var(--radius-md);
  color: white;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  background: var(--primary-600);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-btn svg {
  width: 16px;
  height: 16px;
}

/* No Conversation State */
.no-conversation {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
}

.no-conversation-content {
  text-align: center;
  color: var(--text-tertiary);
}

.no-conversation-content svg {
  width: 64px;
  height: 64px;
  margin-bottom: var(--space-4);
  opacity: 0.5;
}

.no-conversation-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.no-conversation-content p {
  margin-bottom: var(--space-4);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay-bg, rgba(0, 0, 0, 0.6));
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-4);
}

.modal {
  width: 100%;
  max-width: 480px;
  max-height: 80vh;
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border-subtle);
}

.modal-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
}

.modal-body {
  padding: var(--space-4) var(--space-5);
  overflow-y: auto;
}

.search-input-wrapper {
  position: relative;
}

.search-input-wrapper svg {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--text-tertiary);
}

.search-input-wrapper input {
  padding-left: var(--space-8);
}

.users-list {
  margin-top: var(--space-4);
}

.no-users {
  text-align: center;
  padding: var(--space-4);
  color: var(--text-tertiary);
}

.user-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
}

.user-card:hover {
  background: var(--bg-tertiary);
}

.user-card .user-avatar {
  width: 44px;
  height: 44px;
  font-size: 14px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-details .user-name {
  font-weight: 500;
  color: var(--text-primary);
}

.user-details .user-email {
  font-size: 13px;
  color: var(--text-tertiary);
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.2s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Mobile Responsive */
@media (max-width: 1023px) {
  .chat-sidebar {
    width: 100%;
  }
  
  .chat-sidebar.mobile-hidden {
    display: none;
  }
  
  .chat-main {
    display: none;
  }
  
  .chat-main.mobile-open {
    display: flex;
    position: fixed;
    inset: 56px 0 64px 0;
    z-index: 100;
  }
  
  .back-btn.mobile-only {
    display: flex;
  }
  
  .chat-page {
    height: calc(100vh - 120px);
  }
}

@media (max-width: 767px) {
  .chat-header {
    padding: var(--space-2) var(--space-3);
  }
  
  .messages-container {
    padding: var(--space-3);
  }
  
  .message {
    max-width: 85%;
  }
  
  .chat-input-area {
    padding: var(--space-2) var(--space-3);
  }
  
  .modal {
    max-height: 90vh;
  }
}
</style>
