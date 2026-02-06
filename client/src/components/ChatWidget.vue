<template>
  <div class="chat-widget-container">
    <!-- Floating Button -->
    <button 
      v-if="!isWidgetOpen" 
      class="chat-floating-btn"
      @click="openWidget"
      :class="{ 'has-unread': totalUnreadCount > 0 }"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <span v-if="totalUnreadCount > 0" class="unread-badge">
        {{ totalUnreadCount > 9 ? '9+' : totalUnreadCount }}
      </span>
    </button>

    <!-- Chat Widget -->
    <Transition name="widget">
      <div v-if="isWidgetOpen" class="chat-widget" :class="{ 'view-chat': widgetView === 'chat' }">
        <!-- Header -->
        <div class="chat-widget-header">
          <template v-if="widgetView === 'list'">
            <h3>Messages</h3>
            <div class="header-actions">
              <button class="header-btn" @click="showNewChat = true" title="New message">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
              <button class="header-btn" @click="closeWidget" title="Close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </template>
          <template v-else>
            <button class="back-btn" @click="backToList">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <div class="chat-header-info" v-if="currentConversation">
              <div class="participant-avatar">
                {{ getParticipantInitials(currentConversation) }}
              </div>
              <div class="participant-name">
                {{ getParticipantName(currentConversation) }}
              </div>
            </div>
            <button class="header-btn" @click="closeWidget" title="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </template>
        </div>

        <!-- Content -->
        <div class="chat-widget-body">
          <!-- Conversation List -->
          <div v-if="widgetView === 'list'" class="conversation-list">
            <div v-if="loading" class="loading-state">
              <div class="spinner"></div>
            </div>
            
            <div v-else-if="sortedConversations.length === 0" class="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <p>No messages yet</p>
              <button class="btn btn-primary btn-sm" @click="showNewChat = true">
                Start a conversation
              </button>
            </div>

            <div v-else class="conversations">
              <div
                v-for="conv in sortedConversations"
                :key="conv._id"
                class="conversation-item"
                :class="{ unread: conv.unreadCount > 0 }"
                @click="openConversation(conv)"
              >
                <div class="conversation-avatar">
                  {{ getParticipantInitials(conv) }}
                </div>
                <div class="conversation-info">
                  <div class="conversation-header">
                    <span class="name">{{ getParticipantName(conv) }}</span>
                    <span class="time">{{ formatTime(conv.lastMessage?.createdAt || conv.updatedAt) }}</span>
                  </div>
                  <div class="conversation-preview">
                    <span class="message">{{ conv.lastMessage?.content || 'No messages' }}</span>
                    <span v-if="conv.unreadCount > 0" class="unread-count">
                      {{ conv.unreadCount }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Chat View -->
          <div v-else class="chat-view">
            <div ref="messagesContainer" class="messages-list">
              <div v-if="messages.length === 0" class="empty-chat">
                <p>Start the conversation!</p>
              </div>
              
              <div
                v-for="message in messages"
                :key="message._id"
                class="message-item"
                :class="{ sent: isSentByMe(message) }"
              >
                <div class="message-bubble">
                  <p class="message-content">{{ message.content }}</p>
                  <span class="message-time">{{ formatTime(message.createdAt) }}</span>
                </div>
              </div>
            </div>

            <div class="message-input">
              <input
                v-model="newMessage"
                type="text"
                placeholder="Type a message..."
                @keydown.enter="sendMessage"
              />
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
        </div>
      </div>
    </Transition>

    <!-- New Chat Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showNewChat" class="new-chat-overlay" @click.self="showNewChat = false">
          <Transition name="scale">
            <div v-if="showNewChat" class="new-chat-modal">
              <div class="modal-header">
                <h4>New Message</h4>
                <button class="close-btn" @click="showNewChat = false">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
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
                  placeholder="Search people..."
                  autofocus
                />
              </div>

              <div class="users-list">
                <div v-if="filteredUsers.length === 0" class="no-results">
                  No users found
                </div>
                <div
                  v-for="user in filteredUsers"
                  :key="user._id"
                  class="user-item"
                  @click="startChatWith(user)"
                >
                  <div class="user-avatar">
                    {{ getInitials(user.name?.first, user.name?.last) }}
                  </div>
                  <div class="user-info">
                    <span class="user-name">{{ user.name?.first }} {{ user.name?.last }}</span>
                    <span class="user-email">{{ user.email }}</span>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '../stores/chat'
import { useAuthStore } from '../stores/auth'
import { useSocketStore } from '../stores/socket'
import api from '../utils/api'

const chatStore = useChatStore()
const authStore = useAuthStore()
const socketStore = useSocketStore()

const messagesContainer = ref(null)
const newMessage = ref('')
const showNewChat = ref(false)
const searchQuery = ref('')
const users = ref([])

// Use storeToRefs to maintain reactivity for state properties
const {
  conversations,
  sortedConversations,
  currentConversation,
  messages,
  loading,
  isWidgetOpen,
  widgetView,
  totalUnreadCount
} = storeToRefs(chatStore)

// Methods can be destructured directly
const { openWidget, closeWidget, selectConversation, backToList, sendMessage: storeSendMessage } = chatStore

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  const q = searchQuery.value.toLowerCase()
  return users.value.filter(u => 
    u.name?.first?.toLowerCase().includes(q) ||
    u.name?.last?.toLowerCase().includes(q) ||
    u.email?.toLowerCase().includes(q)
  )
})

onMounted(() => {
  // Socket listeners are set up globally in App.vue
  fetchUsers()
})

watch(messages, () => {
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true })

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

async function fetchUsers() {
  try {
    const { data } = await api.get('/users?limit=100')
    // Filter out current user
    users.value = data.filter(u => u._id !== authStore.user?._id)
  } catch (err) {
    console.error('Failed to fetch users:', err)
  }
}

async function openConversation(conv) {
  try {
    selectConversation(conv)
    await chatStore.fetchMessages(conv._id)
  } catch (err) {
    console.error('Failed to open conversation:', err)
  }
}

async function startChatWith(user) {
  try {
    const conversation = await chatStore.startConversation(user._id)
    showNewChat.value = false
    searchQuery.value = ''
    await openConversation(conversation)
  } catch (err) {
    console.error('Failed to start chat:', err)
  }
}

async function sendMessage() {
  if (!newMessage.value.trim() || !currentConversation.value) return
  
  try {
    await storeSendMessage(
      currentConversation.value._id,
      newMessage.value.trim()
    )
    newMessage.value = ''
  } catch (err) {
    console.error('Failed to send message:', err)
  }
}

function isSentByMe(message) {
  return message.sender?._id === authStore.user?._id || message.sender === authStore.user?._id
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
</script>

<style scoped>
.chat-widget-container {
  position: fixed;
  bottom: var(--space-4);
  right: var(--space-4);
  z-index: 1000;
}

/* Floating Button */
.chat-floating-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
  transition: all 0.3s ease;
  position: relative;
}

.chat-floating-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 24px rgba(139, 92, 246, 0.5);
}

.chat-floating-btn svg {
  width: 24px;
  height: 24px;
}

.unread-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: var(--accent-rose);
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* Chat Widget */
.chat-widget {
  width: 360px;
  height: 500px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-widget-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-elevated);
}

.chat-widget-header h3 {
  flex: 1;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: var(--space-1);
}

.header-btn,
.back-btn {
  width: 32px;
  height: 32px;
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

.header-btn:hover,
.back-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.header-btn svg,
.back-btn svg {
  width: 18px;
  height: 18px;
}

.chat-header-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.participant-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.participant-name {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary);
}

/* Widget Body */
.chat-widget-body {
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* Conversation List */
.conversation-list {
  height: 100%;
  overflow-y: auto;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
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

.conversation-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
}

.conversation-item:hover {
  background: var(--bg-tertiary);
}

.conversation-item.unread {
  background: var(--primary-500-alpha-05, rgba(139, 92, 246, 0.05));
}

.conversation-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.conversation-info {
  flex: 1;
  min-width: 0;
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.conversation-header .name {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.9375rem;
}

.conversation-header .time {
  font-size: 12px;
  color: var(--text-tertiary);
}

.conversation-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-2);
}

.conversation-preview .message {
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unread-count {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: var(--primary-500);
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Chat View */
.chat-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.messages-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.empty-chat {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-tertiary);
  font-size: 14px;
}

.message-item {
  display: flex;
}

.message-item.sent {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 75%;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-lg);
  background: var(--bg-tertiary);
}

.message-item.sent .message-bubble {
  background: var(--primary-500);
  color: white;
}

.message-content {
  font-size: 14px;
  line-height: 1.4;
  margin: 0;
  word-break: break-word;
}

.message-time {
  display: block;
  font-size: 11px;
  opacity: 0.7;
  margin-top: 4px;
  text-align: right;
}

/* Message Input */
.message-input {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-elevated);
}

.message-input input {
  flex: 1;
  padding: var(--space-2) var(--space-3);
  background: var(--bg-primary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
}

.message-input input:focus {
  border-color: var(--primary-500);
}

.message-input input::placeholder {
  color: var(--text-tertiary);
}

.send-btn {
  width: 36px;
  height: 36px;
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
  width: 18px;
  height: 18px;
}

/* New Chat Modal */
.new-chat-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay-bg, rgba(0, 0, 0, 0.6));
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: var(--space-4);
}

.new-chat-modal {
  width: 100%;
  max-width: 400px;
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
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
}

.modal-header h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
}

.close-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.close-btn svg {
  width: 18px;
  height: 18px;
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

.users-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-2);
}

.no-results {
  padding: var(--space-4);
  text-align: center;
  color: var(--text-tertiary);
  font-size: 14px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
}

.user-item:hover {
  background: var(--bg-tertiary);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 14px;
}

.user-email {
  font-size: 12px;
  color: var(--text-tertiary);
}

/* Animations */
.widget-enter-active,
.widget-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.widget-enter-from,
.widget-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

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
@media (max-width: 767px) {
  .chat-widget-container {
    left: var(--space-3);
    right: var(--space-3);
    bottom: 80px; /* Above mobile nav */
  }
  
  .chat-widget {
    width: 100%;
    height: calc(100vh - 200px);
    max-height: 500px;
  }
  
  .chat-floating-btn {
    width: 48px;
    height: 48px;
  }
  
  .new-chat-modal {
    max-height: 70vh;
  }
}
</style>
