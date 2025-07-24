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
    // Determine the type of request based on message content
    let response
    if (userMessage.toLowerCase().includes('explain')) {
      const codeToExplain = props.hasSelection ? props.selectedCode : props.fullCode
      response = await aiService.explainCode(codeToExplain, props.currentLanguage)
      addMessage('assistant', response)
    } else if (userMessage.toLowerCase().includes('optimize')) {
      const codeToOptimize = props.hasSelection ? props.selectedCode : props.fullCode
      response = await aiService.optimizeCode(codeToOptimize, props.currentLanguage)
      addMessage('assistant', response)
    } else if (userMessage.toLowerCase().includes('generate') || userMessage.toLowerCase().includes('create')) {
      response = await aiService.generateCode(userMessage, props.currentLanguage)
      addMessage('assistant', 'Here\'s the generated code:', response, props.currentLanguage)
    } else {
      // General chat - you can extend this to use a general AI service
      addMessage('assistant', 'I can help you with code explanation, optimization, and generation. Try asking me to "explain this code" or "generate a function that..."')
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
.ai-assistant {
  width: 350px;
  height: 100%;
  background: white;
  border-left: 1px solid #e1e5e9;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.ai-assistant.collapsed {
  width: 50px;
}

.ai-header {
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e1e5e9;
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
  color: #2d3748;
}

.ai-icon {
  font-size: 18px;
}

.typing-indicator {
  color: #4299e1;
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
  color: #718096;
  cursor: pointer;
}

.ai-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: calc(100% - 60px);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
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
  background: #f7fafc;
  padding: 12px;
  border-radius: 12px;
  position: relative;
}

.message.user .message-content {
  background: #4299e1;
  color: white;
}

.message-text {
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 4px;
}

.message-code {
  margin-top: 8px;
  background: #1a202c;
  border-radius: 6px;
  overflow: hidden;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #2d3748;
  color: #e2e8f0;
  font-size: 12px;
}

.insert-btn {
  background: #4299e1;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
}

.insert-btn:hover {
  background: #3182ce;
}

.message-code pre {
  margin: 0;
  padding: 12px;
  color: #e2e8f0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.4;
  overflow-x: auto;
}

.message-time {
  font-size: 11px;
  color: #a0aec0;
  margin-top: 4px;
}

.message.user .message-time {
  color: rgba(255, 255, 255, 0.7);
}

.chat-input {
  border-top: 1px solid #e1e5e9;
  background: white;
}

.quick-actions {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  border-bottom: 1px solid #e1e5e9;
}

.quick-btn {
  padding: 4px 8px;
  border: 1px solid #e1e5e9;
  background: white;
  border-radius: 16px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-btn:hover:not(:disabled) {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.quick-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-area {
  display: flex;
  padding: 12px;
  gap: 8px;
  align-items: flex-end;
}

.message-input {
  flex: 1;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  resize: none;
  font-family: inherit;
  line-height: 1.4;
}

.message-input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.send-btn {
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: #3182ce;
}

.send-btn:disabled {
  background: #a0aec0;
  cursor: not-allowed;
}
</style>