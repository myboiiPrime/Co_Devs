<template>
  <div class="ai-assistant" :class="{ 'collapsed': isCollapsed }">
    <div class="ai-header" @click="toggleCollapse">
      <div class="ai-title">
        <span class="ai-icon">🤖</span>
        <span>AI Assistant</span>
        <span v-if="isTyping" class="typing-indicator">●●●</span>
      </div>
      <button class="collapse-btn">{{ isCollapsed ? '▲' : '▼' }}</button>
    </div>
    
    <div v-if="!isCollapsed" class="ai-content">
      <div class="chat-messages" ref="messagesContainer">
        <div v-for="message in messages" :key="message.id" 
             :class="['message', message.type]">
          <div class="message-content">
            <div class="message-text">{{ message.text }}</div>
            <div v-if="message.code" class="message-code">
              <div class="code-header">
                <span>{{ message.language }}</span>
                <button @click="insertCode(message.code)" class="insert-btn">
                  Insert Code
                </button>
              </div>
              <pre><code>{{ message.code }}</code></pre>
            </div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>
      </div>
      
      <div class="chat-input">
        <div class="quick-actions">
          <button @click="explainSelection" class="quick-btn" :disabled="!hasSelection">
            💡 Explain
          </button>
          <button @click="optimizeSelection" class="quick-btn" :disabled="!hasSelection">
            ⚡ Optimize
          </button>
          <button @click="generateFromPrompt" class="quick-btn">
            🎯 Generate
          </button>
        </div>
        <div class="input-area">
          <textarea 
            v-model="currentMessage" 
            @keydown.enter.prevent="sendMessage"
            @keydown.shift.enter="addNewLine"
            placeholder="Ask me anything about your code..."
            class="message-input"
            rows="2"
          ></textarea>
          <button @click="sendMessage" :disabled="!currentMessage.trim() || isTyping" 
                  class="send-btn">
            <span v-if="isTyping">⏳</span>
            <span v-else>📤</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import aiService from '@/services/aiService'

const props = defineProps({
  selectedCode: {
    type: String,
    default: ''
  },
  hasSelection: {
    type: Boolean,
    default: false
  },
  currentLanguage: {
    type: String,
    default: 'javascript'
  },
  fullCode: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['insert-code'])

const isCollapsed = ref(false)
const isTyping = ref(false)
const currentMessage = ref('')
const messages = ref([
  {
    id: 1,
    type: 'assistant',
    text: 'Hi! I\'m your AI coding assistant. I can help you explain, optimize, or generate code. Just ask me anything!',
    timestamp: new Date()
  }
])
const messagesContainer = ref(null)

let messageIdCounter = 2

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const addMessage = (type, text, code = null, language = null) => {
  messages.value.push({
    id: messageIdCounter++,
    type,
    text,
    code,
    language,
    timestamp: new Date()
  })
  scrollToBottom()
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const sendMessage = async () => {
  if (!currentMessage.value.trim() || isTyping.value) return
  
  const userMessage = currentMessage.value.trim()
  addMessage('user', userMessage)
  currentMessage.value = ''
  
  isTyping.value = true
  
  try {
    // For now, we'll use the generate endpoint as a general chat endpoint
    // since it can handle various types of requests and conversations
    const response = await aiService.generateCode(userMessage, props.currentLanguage)
    
    // Check if the response looks like code (contains common code patterns)
    const codePatterns = [
      /function\s+\w+/,
      /class\s+\w+/,
      /def\s+\w+/,
      /const\s+\w+\s*=/,
      /let\s+\w+\s*=/,
      /var\s+\w+\s*=/,
      /<\w+.*>/,
      /import\s+/,
      /from\s+['"`]/
    ]
    
    const looksLikeCode = codePatterns.some(pattern => pattern.test(response))
    
    if (looksLikeCode) {
      addMessage('assistant', 'Here\'s what I generated:', response, props.currentLanguage)
    } else {
      addMessage('assistant', response)
    }
  } catch (error) {
    addMessage('assistant', `Sorry, I encountered an error: ${error.message}`)
  } finally {
    isTyping.value = false
  }
}

const addNewLine = () => {
  currentMessage.value += '\n'
}

const explainSelection = async () => {
  if (!props.hasSelection) return
  
  addMessage('user', `Explain this code: ${props.selectedCode}`)
  isTyping.value = true
  
  try {
    const explanation = await aiService.explainCode(props.selectedCode, props.currentLanguage)
    addMessage('assistant', explanation)
  } catch (error) {
    addMessage('assistant', `Error explaining code: ${error.message}`)
  } finally {
    isTyping.value = false
  }
}

const optimizeSelection = async () => {
  if (!props.hasSelection) return
  
  addMessage('user', `Optimize this code: ${props.selectedCode}`)
  isTyping.value = true
  
  try {
    const optimization = await aiService.optimizeCode(props.selectedCode, props.currentLanguage)
    addMessage('assistant', optimization)
  } catch (error) {
    addMessage('assistant', `Error optimizing code: ${error.message}`)
  } finally {
    isTyping.value = false
  }
}

const generateFromPrompt = () => {
  currentMessage.value = 'Generate a function that '
  document.querySelector('.message-input').focus()
}

const insertCode = (code) => {
  emit('insert-code', code)
  addMessage('assistant', 'Code inserted into editor!')
}

const formatTime = (timestamp) => {
  return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Auto-scroll when new messages are added
watch(() => messages.value.length, () => {
  scrollToBottom()
})
</script>

<style scoped>
/* VS Code Dark Theme for AI Assistant */
.ai-assistant {
  width: 350px;
  height: 100%;
  background: #252526;
  border-left: 1px solid #2d2d2d;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 13px;
  color: #cccccc;
}

.ai-assistant.collapsed {
  width: 50px;
}

.ai-header {
  height: 35px;
  padding: 0 16px;
  background: #2d2d2d;
  border-bottom: 1px solid #3e3e3e;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.ai-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #cccccc;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ai-icon {
  font-size: 16px;
}

.typing-indicator {
  color: #007acc;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.collapse-btn {
  background: none;
  border: none;
  font-size: 12px;
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

.collapse-btn:hover {
  background: #3e3e3e;
  color: #cccccc;
}

.ai-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: calc(100% - 35px);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #1e1e1e;
}

.message {
  max-width: 85%;
}

.message.user {
  align-self: flex-end;
}

.message.assistant {
  align-self: flex-start;
}

.message-content {
  background: #2d2d2d;
  padding: 12px;
  border-radius: 8px;
  position: relative;
  border: 1px solid #3e3e3e;
}

.message.user .message-content {
  background: #007acc;
  color: #ffffff;
  border-color: #005a9e;
}

.message-text {
  font-size: 13px;
  line-height: 1.4;
  margin-bottom: 4px;
  color: inherit;
}

.message-code {
  margin-top: 8px;
  background: #1a1a1a;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #3e3e3e;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #2d2d2d;
  color: #cccccc;
  font-size: 11px;
  border-bottom: 1px solid #3e3e3e;
}

.insert-btn {
  background: #007acc;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 11px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.insert-btn:hover {
  background: #005a9e;
}

.message-code pre {
  margin: 0;
  padding: 12px;
  color: #cccccc;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.4;
  overflow-x: auto;
  background: #1a1a1a;
}

.message-time {
  font-size: 11px;
  color: #858585;
  margin-top: 4px;
}

.message.user .message-time {
  color: rgba(255, 255, 255, 0.7);
}

.chat-input {
  border-top: 1px solid #3e3e3e;
  background: #252526;
}

.quick-actions {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  border-bottom: 1px solid #3e3e3e;
  background: #2d2d2d;
}

.quick-btn {
  padding: 4px 8px;
  border: 1px solid #3e3e3e;
  background: #252526;
  color: #cccccc;
  border-radius: 3px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-btn:hover:not(:disabled) {
  background: #3e3e3e;
  border-color: #007acc;
}

.quick-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: #858585;
}

.input-area {
  display: flex;
  padding: 12px;
  gap: 8px;
  align-items: flex-end;
  background: #252526;
}

.message-input {
  flex: 1;
  border: 1px solid #3e3e3e;
  border-radius: 3px;
  padding: 8px 12px;
  font-size: 13px;
  resize: none;
  font-family: inherit;
  line-height: 1.4;
  background: #1e1e1e;
  color: #cccccc;
}

.message-input::placeholder {
  color: #858585;
}

.message-input:focus {
  outline: none;
  border-color: #007acc;
  box-shadow: 0 0 0 1px #007acc;
}

.send-btn {
  background: #007acc;
  color: white;
  border: none;
  border-radius: 3px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s ease;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn:hover:not(:disabled) {
  background: #005a9e;
}

.send-btn:disabled {
  background: #464647;
  cursor: not-allowed;
}

/* Scrollbar styling to match VS Code */
.chat-messages::-webkit-scrollbar {
  width: 10px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #1e1e1e;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #424242;
  border-radius: 5px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #4f4f4f;
}
</style>