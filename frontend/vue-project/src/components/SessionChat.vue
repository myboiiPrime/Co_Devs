<template>
  <div class="session-chat">
    <div class="chat-header">
      <div class="chat-title">
        <span class="chat-icon">💬</span>
        <span class="title-text">Session Chat</span>
        <span class="online-count">({{ onlineCount }})</span>
      </div>
      <button class="minimize-btn" @click="$emit('toggle-chat')">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z"/>
        </svg>
      </button>
    </div>

    <div class="chat-messages" ref="messagesContainer">
      <div 
        v-for="message in messages" 
        :key="message.id"
        class="message"
        :class="{ 
          'own-message': message.userId === currentUserId,
          'system-message': message.type === 'system'
        }"
      >
        <div v-if="message.type === 'system'" class="system-content">
          <span class="system-icon">ℹ️</span>
          <span class="system-text">{{ message.content }}</span>
          <span class="message-time">{{ formatTime(message.timestamp) }}</span>
        </div>
        <div v-else class="user-message">
          <div class="message-header">
            <span class="username" :style="{ color: getUserColor(message.username) }">
              {{ message.username }}
            </span>
            <span class="message-time">{{ formatTime(message.timestamp) }}</span>
          </div>
          <div class="message-content">{{ message.content }}</div>
        </div>
      </div>
      
      <!-- Typing indicators -->
      <div v-if="typingUsers.length > 0" class="typing-indicator">
        <div class="typing-content">
          <span class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </span>
          <span class="typing-text">
            {{ getTypingText() }}
          </span>
        </div>
      </div>
    </div>

    <div class="chat-input">
      <div class="input-container">
        <input
          v-model="currentMessage"
          @keydown.enter="sendMessage"
          @input="handleTyping"
          placeholder="Type a message..."
          class="message-input"
          maxlength="500"
        />
        <button 
          @click="sendMessage" 
          :disabled="!currentMessage.trim()"
          class="send-btn"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/>
          </svg>
        </button>
      </div>
      <div class="input-footer">
        <span class="char-count">{{ currentMessage.length }}/500</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SessionChat',
  props: {
    sessionId: {
      type: String,
      required: true
    },
    socket: {
      type: Object,
      required: true
    },
    currentUserId: {
      type: String,
      required: true
    },
    currentUsername: {
      type: String,
      required: true
    },
    participants: {
      type: Array,
      default: () => []
    }
  },
  emits: ['toggle-chat'],
  data() {
    return {
      messages: [],
      currentMessage: '',
      typingUsers: [],
      typingTimeout: null,
      userColors: {}
    }
  },
  computed: {
    onlineCount() {
      return this.participants.length
    }
  },
  mounted() {
    this.setupSocketListeners()
    this.loadChatHistory()
    
    // Test: Add a sample message to verify display works
    setTimeout(() => {
      console.log('🔵 CHAT: Adding test message to verify display')
      this.messages.push({
        id: 'test-' + Date.now(),
        userId: 'test-user',
        username: 'Test User',
        content: 'This is a test message to verify chat display works',
        timestamp: new Date(),
        type: 'user'
      })
      this.scrollToBottom()
    }, 2000)
  },
  beforeUnmount() {
    this.cleanup()
  },
  methods: {
    setupSocketListeners() {
      console.log('🔵 CHAT: Setting up socket listeners')
      this.socket.on('chat-message', this.handleChatMessage)
      this.socket.on('user-typing', this.handleUserTyping)
      this.socket.on('user-stopped-typing', this.handleUserStoppedTyping)
      this.socket.on('chat-history', this.handleChatHistory)
      
      // Test listener to see if ANY events are being received
      this.socket.onAny((eventName, ...args) => {
        if (eventName.includes('chat') || eventName.includes('message')) {
          console.log('🟡 CHAT: Received socket event:', eventName, args)
        }
      })
    },

    cleanup() {
      this.socket.off('chat-message', this.handleChatMessage)
      this.socket.off('user-typing', this.handleUserTyping)
      this.socket.off('user-stopped-typing', this.handleUserStoppedTyping)
      this.socket.off('chat-history', this.handleChatHistory)
    },

    loadChatHistory() {
      this.socket.emit('get-chat-history', { sessionId: this.sessionId })
    },

    sendMessage() {
      const message = this.currentMessage.trim()
      if (!message) return

      console.log('🔵 CHAT: Sending message:', message)
      console.log('🔵 CHAT: Session ID:', this.sessionId)
      console.log('🔵 CHAT: Socket connected:', this.socket?.connected)
      console.log('🔵 CHAT: Current user:', this.currentUsername)

      const messageData = {
        sessionId: this.sessionId,
        content: message,
        timestamp: new Date()
      }

      console.log('🔵 CHAT: Message data:', messageData)
      this.socket.emit('send-chat-message', messageData)
      console.log('🔵 CHAT: Message emitted to backend')
      
      this.currentMessage = ''
      this.stopTyping()
    },

    handleTyping() {
      if (!this.typingTimeout) {
        this.socket.emit('user-typing', { sessionId: this.sessionId })
      }

      clearTimeout(this.typingTimeout)
      this.typingTimeout = setTimeout(() => {
        this.stopTyping()
      }, 2000)
    },

    stopTyping() {
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout)
        this.typingTimeout = null
        this.socket.emit('user-stopped-typing', { sessionId: this.sessionId })
      }
    },

    handleChatMessage(data) {
      console.log('🟢 CHAT: Received chat message:', data)
      this.messages.push({
        id: data.id || Date.now() + Math.random(),
        userId: data.user.id,
        username: data.user.username,
        content: data.content,
        timestamp: new Date(data.timestamp),
        type: 'user'
      })
      this.scrollToBottom()
    },

    handleUserTyping(data) {
      if (data.user.id !== this.currentUserId) {
        const existingIndex = this.typingUsers.findIndex(u => u.id === data.user.id)
        if (existingIndex === -1) {
          this.typingUsers.push(data.user)
        }
      }
    },

    handleUserStoppedTyping(data) {
      this.typingUsers = this.typingUsers.filter(u => u.id !== data.user.id)
    },

    handleChatHistory(data) {
      this.messages = data.messages.map(msg => ({
        id: msg._id || msg.id,
        userId: msg.user.id,
        username: msg.user.username,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        type: 'user'
      }))
      this.scrollToBottom()
    },

    addSystemMessage(content) {
      this.messages.push({
        id: Date.now() + Math.random(),
        content,
        timestamp: new Date(),
        type: 'system'
      })
      this.scrollToBottom()
    },

    getUserColor(username) {
      if (!this.userColors[username]) {
        const colors = [
          '#007acc', '#28a745', '#dc3545', '#ffc107', 
          '#17a2b8', '#6f42c1', '#e83e8c', '#fd7e14'
        ]
        this.userColors[username] = colors[Object.keys(this.userColors).length % colors.length]
      }
      return this.userColors[username]
    },

    getTypingText() {
      if (this.typingUsers.length === 1) {
        return `${this.typingUsers[0].username} is typing...`
      } else if (this.typingUsers.length === 2) {
        return `${this.typingUsers[0].username} and ${this.typingUsers[1].username} are typing...`
      } else {
        return `${this.typingUsers.length} people are typing...`
      }
    },

    formatTime(timestamp) {
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
    },

    getParticipantUsername(participant) {
      // Handle both direct username and nested user.username structures
      return participant.username || participant.user?.username || 'Unknown'
    }
  },

  watch: {
    participants: {
      handler(newParticipants, oldParticipants) {
        if (oldParticipants && oldParticipants.length > 0) {
          // Check for new users
          newParticipants.forEach(participant => {
            if (!oldParticipants.find(old => old.id === participant.id)) {
              this.addSystemMessage(`${this.getParticipantUsername(participant)} joined the session`)
            }
          })

          // Check for users who left
          oldParticipants.forEach(oldParticipant => {
            if (!newParticipants.find(current => current.id === oldParticipant.id)) {
              this.addSystemMessage(`${this.getParticipantUsername(oldParticipant)} left the session`)
            }
          })
        }
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.session-chat {
  width: 100%;
  height: 100%;
  background: #252526;
  border-left: 1px solid #2d2d2d;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 13px;
  color: #cccccc;
}

.chat-header {
  height: 35px;
  padding: 0 12px;
  background: #2d2d2d;
  border-bottom: 1px solid #3e3e3e;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.chat-icon {
  font-size: 14px;
}

.online-count {
  color: #858585;
  font-weight: normal;
}

.minimize-btn {
  background: none;
  border: none;
  color: #858585;
  cursor: pointer;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  transition: all 0.2s ease;
}

.minimize-btn:hover {
  background: #3e3e3e;
  color: #cccccc;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: #424242 #1e1e1e;
}

.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #1e1e1e;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #424242;
  border-radius: 3px;
}

.message {
  margin-bottom: 4px;
}

.system-message .system-content {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #2d2d2d;
  border-radius: 4px;
  font-size: 11px;
  color: #858585;
}

.system-icon {
  font-size: 12px;
}

.user-message {
  max-width: 100%;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}

.username {
  font-weight: 600;
  font-size: 12px;
}

.message-time {
  font-size: 10px;
  color: #858585;
}

.message-content {
  background: #3c3c3c;
  padding: 8px 12px;
  border-radius: 8px;
  word-wrap: break-word;
  line-height: 1.4;
  max-width: 80%;
}

.own-message .message-content {
  background: #007acc;
  color: white;
  margin-left: auto;
  margin-right: 0;
}

.own-message .message-header {
  justify-content: flex-end;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  color: #858585;
  font-size: 11px;
}

.typing-dots {
  display: flex;
  gap: 2px;
}

.typing-dots span {
  width: 4px;
  height: 4px;
  background: #858585;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 80%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}

.chat-input {
  flex-shrink: 0;
  border-top: 1px solid #3e3e3e;
  background: #252526;
}

.input-container {
  display: flex;
  padding: 12px;
  gap: 8px;
}

.message-input {
  flex: 1;
  background: #3c3c3c;
  border: 1px solid #3e3e3e;
  border-radius: 4px;
  padding: 8px 12px;
  color: #cccccc;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s ease;
}

.message-input:focus {
  border-color: #007acc;
}

.message-input::placeholder {
  color: #858585;
}

.send-btn {
  background: #007acc;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.send-btn:hover:not(:disabled) {
  background: #005a9e;
}

.send-btn:disabled {
  background: #3e3e3e;
  color: #858585;
  cursor: not-allowed;
}

.input-footer {
  padding: 0 12px 12px;
  display: flex;
  justify-content: flex-end;
}

.char-count {
  font-size: 10px;
  color: #858585;
}
</style>