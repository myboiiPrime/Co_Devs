<template>
  <div class="vscode-container">
    <!-- Activity Bar (Left) -->
    <div class="activity-bar">
      <div class="activity-item" :class="{ active: activeView === 'explorer' }" @click="setActiveView('explorer')">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M14.5 3H7.71l-.85-.85L6.51 2h-5a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-10a.5.5 0 0 0-.5-.5zM6.49 3l.35.35.86.86H14v9H2V3h4.49z"/>
        </svg>
      </div>
      <div class="activity-item" :class="{ active: activeView === 'search' }" @click="setActiveView('search')">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
        </svg>
      </div>
      <div class="activity-item" :class="{ active: activeView === 'extensions' }" @click="setActiveView('extensions')">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8.5 1a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zm0 12a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z"/>
          <path d="M7.5 3a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1 0-1h3.5V3.5a.5.5 0 0 1 .5-.5z"/>
        </svg>
      </div>
      <div class="activity-item" :class="{ active: activeView === 'users' }" @click="setActiveView('users')">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
        </svg>
      </div>
    </div>

    <!-- Sidebar -->
    <div class="sidebar" v-show="sidebarVisible">
      <div class="sidebar-header">
        <h3 class="sidebar-title">{{ sidebarTitle }}</h3>
        <div class="sidebar-actions">
          <button class="action-btn" @click="toggleSidebar">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="sidebar-content">
        <!-- Explorer View -->
        <div v-if="activeView === 'explorer'" class="explorer-view">
          <div class="section">
            <div class="section-header">
              <span class="section-title">{{ sessionData.name || 'WORKSPACE' }}</span>
              <div class="section-actions">
                <button class="action-btn" title="New File">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M14.5 3a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h6a.5.5 0 0 0 .5-.5zM14.5 6a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h6a.5.5 0 0 0 .5-.5zM14.5 9a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h6a.5.5 0 0 0 .5-.5z"/>
                    <path d="M3 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H3zm0 1h10a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"/>
                  </svg>
                </button>
                <button class="action-btn" title="New Folder">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M.5 3l.04.87a1.99 1.99 0 0 0-.342 1.311l.637 7A2 2 0 0 0 2.826 14H9.81a2 2 0 0 0 1.991-1.819l.637-7a1.99 1.99 0 0 0-.342-1.311L12.5 3H3.36a1.5 1.5 0 0 1-1.483-1.277L1.85 1.5H.5a.5.5 0 0 0 0 1l.04-.87zM3.36 2a.5.5 0 0 0 .497.402l.91-.001a.5.5 0 0 0 .497-.402L5.89 1H3.36L3.36 2z"/>
                  </svg>
                </button>
              </div>
            </div>
            <FileTree 
              :sessionId="sessionId"
              :socket="socket"
              @file-selected="handleFileSelected"
              @notification="handleNotification"
              class="file-tree"
            />
          </div>
        </div>

        <!-- Users View -->
        <div v-if="activeView === 'users'" class="users-view">
          <div class="section">
            <div class="section-header">
              <span class="section-title">PARTICIPANTS ({{ participants.length }})</span>
            </div>
            <div class="participants-list">
              <div 
                v-for="participant in participants" 
                :key="participant.id || participant._id"
                class="participant-item"
                :class="{ 
                  owner: participant.isOwner, 
                  current: participant.id === currentUserId,
                  offline: !participant.isOnline 
                }"
              >
                <div class="participant-avatar">
                  {{ getParticipantUsername(participant).charAt(0).toUpperCase() }}
                </div>
                <div class="participant-info">
                  <span class="participant-name">{{ getParticipantUsername(participant) }}</span>
                  <span class="participant-status">
                    {{ participant.isOwner ? 'Owner' : 'Member' }}
                    {{ !participant.isOnline ? '(Offline)' : '' }}
                  </span>
                </div>
                <div class="participant-indicator" :class="{ online: participant.isOnline }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Search View -->
        <div v-if="activeView === 'search'" class="search-view">
          <div class="section">
            <div class="section-header">
              <span class="section-title">SEARCH</span>
            </div>
            <div class="search-content">
              <input type="text" placeholder="Search files..." class="search-input">
              <p class="search-placeholder">Search functionality coming soon...</p>
            </div>
          </div>
        </div>

        <!-- Extensions View -->
        <div v-if="activeView === 'extensions'" class="extensions-view">
          <div class="section">
            <div class="section-header">
              <span class="section-title">SESSION INFO</span>
            </div>
            <div class="session-details">
              <div class="detail-item">
                <span class="detail-label">Session ID:</span>
                <span class="detail-value">{{ sessionId }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Created:</span>
                <span class="detail-value">{{ formatDate(sessionData.createdAt) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Owner:</span>
                <span class="detail-value">{{ sessionData.owner?.username || 'Unknown' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Lifetime:</span>
                <span class="detail-value session-lifetime">{{ sessionLifetime }}</span>
              </div>
              <div class="session-actions">
                <button @click="leaveSession" class="leave-session-btn">
                  Leave Session
                </button>
                <button 
                  v-if="isSessionOwner" 
                  @click="deleteSession" 
                  class="delete-session-btn"
                  :disabled="isDeletingSession"
                >
                  {{ isDeletingSession ? 'Deleting...' : 'Delete Session' }}
                </button>
              </div>
            </div>
          </div>

          <!-- User Management Section (Owner Only) -->
          <div v-if="isSessionOwner" class="section">
            <div class="section-header">
              <span class="section-title">MANAGE USERS</span>
            </div>
            <div class="user-management">
              <div class="add-user-form">
                <input 
                  v-model="newUsername" 
                  type="text" 
                  placeholder="Enter username to add"
                  class="user-input"
                  @keyup.enter="addUser"
                >
                <button @click="addUser" class="add-user-btn" :disabled="!newUsername.trim() || isAddingUser">
                  {{ isAddingUser ? 'Adding...' : 'Add' }}
                </button>
              </div>
              
              <div v-if="userManagementError" class="error-message">
                {{ userManagementError }}
              </div>
              
              <div v-if="userManagementSuccess" class="success-message">
                {{ userManagementSuccess }}
              </div>

              <div class="participants-list">
                <div class="participants-header">Current Participants:</div>
                <div 
                  v-for="participant in participants" 
                  :key="getParticipantUsername(participant)"
                  class="participant-item"
                >
                  <div class="participant-info">
                    <span class="participant-name">{{ getParticipantUsername(participant) }}</span>
                    <span class="participant-role">{{ participant.role }}</span>
                  </div>
                  <button 
                    v-if="getParticipantUsername(participant) !== currentUsername && participant.role !== 'owner'"
                    @click="removeUser(getParticipantUsername(participant))"
                    class="remove-user-btn"
                    :disabled="isRemovingUser"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="main-content">
      <!-- Title Bar -->
      <div class="title-bar">
        <div class="title-bar-left">
          <span class="session-name clickable-title" @click="goToHome">Co-Devs</span>
        </div>
        <div class="title-bar-right">
          <button class="title-btn" @click="toggleSidebar">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Editor Area -->
      <div class="editor-area">
        <div class="editor-tabs">
          <div 
            v-if="selectedFile"
            class="tab"
            :class="{ active: activeTab === 'editor' }"
            @click="setActiveTab('editor')"
          >
            <span class="tab-label">{{ selectedFile.name }}</span>
            <button class="tab-close" @click.stop="closeFile">×</button>
          </div>
          <div 
            class="tab"
            :class="{ active: activeTab === 'terminal' }"
            @click="setActiveTab('terminal')"
          >
            <span class="tab-label">Terminal</span>
          </div>
        </div>
        <div class="editor-content">
          <keep-alive>
            <CodeEditor 
              v-if="selectedFile && activeTab === 'editor'"
              v-model="fileContent"
              :language="getFileLanguage(selectedFile.name)"
              :documentId="selectedFile.path"
              @change="handleFileContentChange"
              @cursor-change="handleCursorChange"
              @ai-request="handleAiRequest"
              @selection-change="handleSelectionChange"
              class="code-editor-component"
            />
          </keep-alive>
          <keep-alive>
            <Terminal 
              v-if="activeTab === 'terminal'"
              :sessionId="sessionId"
              :socket="socket"
              @error="handleError"
              class="terminal-component"
            />
          </keep-alive>
        </div>
      </div>
    </div>

    <!-- AI Assistant Panel (Right) -->
    <AiAssistant
      v-if="!chatVisible"
      :selectedCode="selectedCode"
      :hasSelection="hasSelection"
      :currentLanguage="currentLanguage"
      :fullCode="fileContent"
      @insert-code="handleInsertCode"
      class="ai-panel"
    />

    <!-- Session Chat Panel (Right) -->
    <SessionChat
      v-if="chatVisible"
      :sessionId="sessionId"
      :socket="socket"
      :currentUserId="currentUserId"
      :currentUsername="currentUsername"
      :participants="participants"
      @toggle-chat="toggleChat"
      class="chat-panel"
    />

    <!-- Panel Toggle Button -->
    <div class="panel-toggle">
      <button 
        @click="toggleChat" 
        class="toggle-btn"
        :class="{ active: chatVisible }"
        title="Toggle Chat"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
        </svg>
      </button>
      <button 
        @click="toggleChat" 
        class="toggle-btn"
        :class="{ active: !chatVisible }"
        title="Toggle AI Assistant"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
        </svg>
      </button>
    </div>

    <!-- Status Bar (Bottom) -->
    <div class="status-bar">
      <div class="status-left">
        <span class="status-item">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
          </svg>
          Connected
        </span>
        <span class="status-item">{{ participants.length }} participants</span>
      </div>
      <div class="status-right">
        <span class="status-item">Session: {{ sessionId.substring(0, 8) }}...</span>
        <span class="status-item">{{ formatTime(new Date()) }}</span>
      </div>
    </div>

    <!-- Notifications -->
    <div class="notifications">
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        class="notification"
        :class="notification.type"
        @click="removeNotification(notification.id)"
      >
        <div class="notification-content">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" class="notification-icon">
            <path v-if="notification.type === 'success'" d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path v-if="notification.type === 'error'" d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path v-if="notification.type === 'warning'" d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
            <path v-else d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
          </svg>
          <span class="notification-message">{{ notification.message }}</span>
        </div>
        <button class="notification-close">×</button>
      </div>
    </div>
  </div>
</template>

<script>
import Terminal from './Terminal.vue'
import FileTree from './FileTree.vue'
import CodeEditor from './CodeEditor.vue'
import AiAssistant from './AiAssistant.vue'
import SessionChat from './SessionChat.vue'
import { buildApiUrl } from '@/config/api.js'

export default {
  name: 'CollaborationManager',
  components: {
    Terminal,
    FileTree,
    CodeEditor,
    AiAssistant,
    SessionChat
  },
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
    }
  },
  data() {
    return {
      sessionData: {},
      participants: [],
      notifications: [],
      selectedFile: null,
      fileContent: '',
      activeTab: 'terminal',
      activeView: 'explorer',
      sidebarVisible: true,
      newUsername: '',
      isAddingUser: false,
      isRemovingUser: false,
      isDeletingSession: false,
      userManagementError: '',
      userManagementSuccess: '',
      selectedCode: '',
      hasSelection: false,
      currentLanguage: 'javascript',
      otherUsersCursors: [],
      chatVisible: false,
      currentTime: new Date() // Add current time for real-time updates
    }
  },
  computed: {
    sidebarTitle() {
      const titles = {
        explorer: 'EXPLORER',
        search: 'SEARCH',
        extensions: 'SESSION',
        users: 'PARTICIPANTS'
      }
      return titles[this.activeView] || 'EXPLORER'
    },
    isSessionOwner() {
      return this.sessionData.owner?.username === this.currentUsername
    },
    sessionLifetime() {
      if (!this.sessionData.createdAt) return 'Unknown'
      
      const createdAt = new Date(this.sessionData.createdAt)
      const now = this.currentTime
      const diffMs = now - createdAt
      
      if (diffMs < 0) return 'Unknown'
      
      const diffSeconds = Math.floor(diffMs / 1000)
      const diffMinutes = Math.floor(diffSeconds / 60)
      const diffHours = Math.floor(diffMinutes / 60)
      const diffDays = Math.floor(diffHours / 24)
      
      if (diffDays > 0) {
        return `${diffDays}d ${diffHours % 24}h ${diffMinutes % 60}m`
      } else if (diffHours > 0) {
        return `${diffHours}h ${diffMinutes % 60}m ${diffSeconds % 60}s`
      } else if (diffMinutes > 0) {
        return `${diffMinutes}m ${diffSeconds % 60}s`
      } else {
        return `${diffSeconds}s`
      }
    }
  },
  mounted() {
    this.setupSocketListeners()
    this.joinSession()
    
    // Update current time every second for real-time lifetime display
    this.timeInterval = setInterval(() => {
      this.currentTime = new Date()
    }, 1000)
    
    // Set a timeout to detect if session-joined event is never received
    this.joinTimeout = setTimeout(() => {
      if (!this.sessionData.sessionId) {
        console.error('❌ FRONTEND: Session join timeout - no session data received')
        this.addNotification({
          type: 'error',
          message: 'Failed to join session - timeout. Please check backend connection.'
        })
      }
    }, 10000) // 10 second timeout
  },
  beforeUnmount() {
    this.cleanup()
    if (this.timeInterval) {
      clearInterval(this.timeInterval)
    }
    if (this.joinTimeout) {
      clearTimeout(this.joinTimeout)
    }
  },
  methods: {
    setActiveView(view) {
      this.activeView = view
      if (!this.sidebarVisible) {
        this.sidebarVisible = true
      }
    },

    toggleSidebar() {
      this.sidebarVisible = !this.sidebarVisible
    },

    goToHome() {
      this.$router.push('/')
    },

    formatDate(date) {
      if (!date) return 'Unknown'
      return new Date(date).toLocaleDateString()
    },

    formatTime(date) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },

    handleSelectionChange(selection) {
      this.selectedCode = selection.text || ''
      this.hasSelection = selection.text && selection.text.length > 0
    },

    handleInsertCode(code) {
      // Emit event to CodeEditor to insert code at cursor position
      this.$refs.codeEditor?.insertCode(code)
    },

    setupSocketListeners() {
      this.socket.on('session-joined', this.handleSessionJoined)
      this.socket.on('user-joined-session', this.handleUserJoined)
      this.socket.on('user-left-session', this.handleUserLeft)
      this.socket.on('session-updated', this.handleSessionUpdated)
      this.socket.on('collaboration-notification', this.handleCollaborationNotification)
      this.socket.on('fs-read-result', this.handleFileReadResult)
      this.socket.on('fs-write-result', this.handleFileWriteResult)
      this.socket.on('cursor-moved', this.handleCursorMoved)
      this.socket.on('error', this.handleError)
      this.socket.on('test-response', (data) => {
        console.log('🧪 FRONTEND: Received test response from backend:', data)
      })
    },

    joinSession() {
      console.log('🐛 FRONTEND: Attempting to join session:', this.sessionId)
      console.log('🐛 FRONTEND: Socket exists:', !!this.socket)
      console.log('🐛 FRONTEND: Socket connected:', this.socket?.connected)
      console.log('🐛 FRONTEND: Socket ID:', this.socket?.id)
      
      if (!this.socket) {
        console.error('❌ FRONTEND: No socket available!')
        this.addNotification({
          type: 'error',
          message: 'Connection error: No socket available'
        })
        return
      }

      // If socket is not connected, wait for connection
      if (!this.socket.connected) {
        console.log('🐛 FRONTEND: Socket not connected, waiting for connection...')
        
        // Set up a one-time listener for connection
        const onConnect = () => {
          console.log('🐛 FRONTEND: Socket connected, now joining session')
          this.socket.off('connect', onConnect) // Remove listener
          this.performJoinSession()
        }
        
        this.socket.on('connect', onConnect)
        
        // Also try to connect if not already connecting
        if (!this.socket.connecting) {
          console.log('🐛 FRONTEND: Attempting to connect socket...')
          this.socket.connect()
        }
        
        return
      }
      
      // Socket is already connected, join immediately
      this.performJoinSession()
    },

    performJoinSession() {
      console.log('🐛 FRONTEND: Performing join session with connected socket')
      console.log('🐛 FRONTEND: Socket ID:', this.socket.id)
      
      // Test socket communication first
      console.log('🧪 FRONTEND: Testing socket communication...')
      this.socket.emit('test-event', { message: 'Frontend test', timestamp: Date.now() })
      
      this.socket.emit('join-collaboration', { sessionId: this.sessionId })
      console.log('🐛 FRONTEND: Emitted join-collaboration event with sessionId:', this.sessionId)
    },

    handleSessionJoined(data) {
      console.log('🐛 FRONTEND: Received session-joined data:', data)
      console.log('🐛 FRONTEND: Data type:', typeof data)
      console.log('🐛 FRONTEND: Data keys:', Object.keys(data || {}))
      console.log('🐛 FRONTEND: Session data:', data?.session)
      console.log('🐛 FRONTEND: Session data type:', typeof data?.session)
      console.log('🐛 FRONTEND: Session keys:', Object.keys(data?.session || {}))
      console.log('🐛 FRONTEND: Session owner:', data?.session?.owner)
      console.log('🐛 FRONTEND: Session createdAt:', data?.session?.createdAt)
      console.log('🐛 FRONTEND: Session sessionId:', data?.session?.sessionId)
      console.log('🐛 FRONTEND: Participants data:', data?.participants)
      
      // Clear the join timeout since we received data
      if (this.joinTimeout) {
        clearTimeout(this.joinTimeout)
        this.joinTimeout = null
      }
      
      // Defensive data handling
      if (data && data.session) {
        this.sessionData = {
          ...data.session,
          // Ensure we have the basic fields
          sessionId: data.session.sessionId || this.sessionId,
          name: data.session.name || 'Collaboration Session',
          owner: data.session.owner || null,
          createdAt: data.session.createdAt || null
        }
        console.log('🐛 FRONTEND: Updated sessionData:', this.sessionData)
      } else {
        console.error('❌ FRONTEND: Invalid session data received:', data)
        this.addNotification({
          type: 'error',
          message: 'Failed to load session data'
        })
        return
      }
      
      this.participants = data.participants || []
      
      this.addNotification({
        type: 'success',
        message: `Joined collaboration session: ${this.sessionData.name}`
      })
    },

    handleUserJoined(data) {
      console.log('🐛 FRONTEND: User joined:', data)
      
      const existingIndex = this.participants.findIndex(p => p.id === data.user.id)
      if (existingIndex === -1) {
        this.participants.push({
          ...data.user,
          isOnline: true
        })
      } else {
        this.participants[existingIndex].isOnline = true
      }

      // If session update info is provided (e.g., owner joining), update session data
      if (data.sessionUpdate) {
        this.sessionData = {
          ...this.sessionData,
          ...data.sessionUpdate
        }
        console.log('🐛 FRONTEND: Updated session data from user join:', this.sessionData)
      }

      this.addNotification({
        type: 'info',
        message: data.message
      })
    },

    handleUserLeft(data) {
      const userIndex = this.participants.findIndex(p => p.id === data.user.id)
      if (userIndex !== -1) {
        this.participants[userIndex].isOnline = false
        setTimeout(() => {
          this.participants.splice(userIndex, 1)
        }, 3000)
      }

      this.addNotification({
        type: 'warning',
        message: data.message
      })
    },

    handleSessionUpdated(data) {
      this.sessionData = { ...this.sessionData, ...data.session }
    },

    handleCollaborationNotification(data) {
      this.addNotification({
        type: data.type || 'info',
        message: data.message
      })
    },

    handleFileSelected(file) {
      this.selectedFile = file
      this.activeTab = 'editor'
      this.currentLanguage = this.getFileLanguage(file.name)
      this.loadFileContent(file.path)
    },

    loadFileContent(filePath) {
      this.socket.emit('fs-read', { 
        sessionId: this.sessionId, 
        path: filePath 
      })
    },

    handleFileReadResult(data) {
      if (data.success) {
        this.fileContent = data.content || ''
        this.addNotification({
          type: 'success',
          message: `File loaded: ${data.path}`
        })
      } else {
        this.addNotification({
          type: 'error',
          message: `Failed to read file: ${data.error || 'Unknown error'}`
        })
      }
    },

    handleFileWriteResult(data) {
      if (data.success) {
        this.addNotification({
          type: 'success',
          message: `File saved: ${data.path}`
        })
      } else {
        this.addNotification({
          type: 'error',
          message: `Failed to save file: ${data.error || 'Unknown error'}`
        })
      }
    },

    handleFileContentChange(content) {
      this.fileContent = content
      if (this.selectedFile) {
        this.socket.emit('fs-write', {
          sessionId: this.sessionId,
          path: this.selectedFile.path,
          content: content
        })
      }
    },

    setActiveTab(tab) {
      this.activeTab = tab
    },

    closeFile() {
      this.selectedFile = null
      this.fileContent = ''
      this.activeTab = 'terminal'
    },

    getFileLanguage(filename) {
      const ext = filename.split('.').pop()?.toLowerCase()
      const languageMap = {
        js: 'javascript',
        ts: 'typescript',
        py: 'python',
        java: 'java',
        cpp: 'cpp',
        c: 'c',
        html: 'html',
        css: 'css',
        json: 'json',
        md: 'markdown',
        vue: 'vue'
      }
      return languageMap[ext] || 'plaintext'
    },

    handleAiRequest(request) {
      // Handle AI requests from the code editor
      console.log('AI Request:', request)
    },

    handleError(error) {
      this.addNotification({
        type: 'error',
        message: error.message || error || 'An error occurred'
      })
    },

    handleNotification(notification) {
      this.addNotification(notification)
    },

    handleCursorChange(cursorData) {
      // Send cursor position to other users via socket
      if (this.selectedFile && this.socket) {
        this.socket.emit('cursor-position', {
          documentId: this.selectedFile.path,
          position: {
            lineNumber: cursorData.lineNumber,
            column: cursorData.column
          }
        })
      }
    },

    handleCursorMoved(data) {
      // Handle cursor movements from other users
      const { user, position } = data
      
      // Update or add cursor position for this user
      const existingIndex = this.otherUsersCursors.findIndex(cursor => cursor.userId === user.id)
      
      if (existingIndex >= 0) {
        this.otherUsersCursors[existingIndex] = {
          userId: user.id,
          username: user.username,
          position: position,
          timestamp: Date.now()
        }
      } else {
        this.otherUsersCursors.push({
          userId: user.id,
          username: user.username,
          position: position,
          timestamp: Date.now()
        })
      }

      // Remove old cursor positions (older than 30 seconds)
      const now = Date.now()
      this.otherUsersCursors = this.otherUsersCursors.filter(cursor => 
        now - cursor.timestamp < 30000
      )
    },

    addNotification(notification) {
      const id = Date.now() + Math.random()
      this.notifications.push({
        id,
        type: notification.type || 'info',
        message: notification.message,
        timestamp: new Date()
      })

      setTimeout(() => {
        this.removeNotification(id)
      }, 5000)
    },

    removeNotification(id) {
      const index = this.notifications.findIndex(n => n.id === id)
      if (index !== -1) {
        this.notifications.splice(index, 1)
      }
    },

    leaveSession() {
      this.socket.emit('leave-collaboration', { sessionId: this.sessionId })
      this.$router.push('/')
    },

    async deleteSession() {
      if (!confirm('Are you sure you want to delete this session? This action cannot be undone and will remove all session data.')) {
        return
      }

      this.isDeletingSession = true

      try {
        const response = await fetch(buildApiUrl(`/api/collaboration/workspaces/${this.sessionId}/${this.currentUsername}`), {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to delete session')
        }

        this.addNotification({
          type: 'success',
          message: 'Session deleted successfully'
        })

        // Redirect to home after a short delay
        setTimeout(() => {
          this.$router.push('/')
        }, 1500)

      } catch (error) {
        console.error('Delete session error:', error)
        this.addNotification({
          type: 'error',
          message: error.message || 'Failed to delete session'
        })
      } finally {
        this.isDeletingSession = false
      }
    },

    async addUser() {
      if (!this.newUsername.trim()) return

      this.isAddingUser = true
      this.userManagementError = ''
      this.userManagementSuccess = ''

      try {
        const response = await fetch(buildApiUrl(`/api/collaboration/${this.sessionId}/add-user`), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: this.newUsername.trim(),
            ownerUsername: this.currentUsername
          })
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to add user')
        }

        this.userManagementSuccess = result.message
        this.newUsername = ''
        
        // Update participants list
        this.participants = result.participants || this.participants

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.userManagementSuccess = ''
        }, 3000)

      } catch (error) {
        console.error('Add user error:', error)
        this.userManagementError = error.message
      } finally {
        this.isAddingUser = false
      }
    },

    async removeUser(username) {
      if (!confirm(`Are you sure you want to remove ${username} from the session?`)) {
        return
      }

      this.isRemovingUser = true
      this.userManagementError = ''
      this.userManagementSuccess = ''

      try {
        const response = await fetch(buildApiUrl(`/api/collaboration/${this.sessionId}/remove-user`), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username,
            ownerUsername: this.currentUsername
          })
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to remove user')
        }

        this.userManagementSuccess = result.message
        
        // Update participants list
        this.participants = result.participants || this.participants

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.userManagementSuccess = ''
        }, 3000)

      } catch (error) {
        console.error('Remove user error:', error)
        this.userManagementError = error.message
      } finally {
        this.isRemovingUser = false
      }
    },

    toggleChat() {
      this.chatVisible = !this.chatVisible
    },

    getParticipantUsername(participant) {
      // Handle both direct username and nested user.username structures
      return participant.username || participant.user?.username || 'Unknown'
    },

    cleanup() {
      if (this.socket) {
        this.socket.off('session-joined')
        this.socket.off('user-joined-session')
        this.socket.off('user-left-session')
        this.socket.off('session-updated')
        this.socket.off('collaboration-notification')
        this.socket.off('fs-read-result')
        this.socket.off('fs-write-result')
        this.socket.off('cursor-moved')
        this.socket.off('error')
      }
    }
  }
}
</script>

<style scoped>
/* VS Code Theme Colors */
.vscode-container {
  display: grid;
  grid-template-columns: 48px auto 1fr 350px;
  grid-template-rows: 1fr 22px;
  grid-template-areas: 
    "activity sidebar main ai"
    "status status status status";
  height: 100vh;
  width: 100vw;
  background: #1e1e1e;
  color: #cccccc;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 13px;
  overflow: hidden; /* Prevent scrollbars on main container */
  position: fixed; /* Ensure it takes full viewport */
  top: 0;
  left: 0;
}

/* Activity Bar */
.activity-bar {
  grid-area: activity;
  background: #333333;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #2d2d2d;
  overflow: hidden; /* No scrollbar needed */
}

.activity-item {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #858585;
  transition: all 0.2s ease;
  position: relative;
}

.activity-item:hover {
  color: #cccccc;
}

.activity-item.active {
  color: #ffffff;
}

.activity-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #007acc;
}

/* Sidebar */
.sidebar {
  grid-area: sidebar;
  width: 300px;
  background: #252526;
  border-right: 1px solid #2d2d2d;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Prevent sidebar container from scrolling */
}

.sidebar-header {
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: #2d2d2d;
  border-bottom: 1px solid #3e3e3e;
}

.sidebar-title {
  font-size: 11px;
  font-weight: 600;
  color: #cccccc;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

.sidebar-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 22px;
  height: 22px;
  background: transparent;
  border: none;
  color: #858585;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #3e3e3e;
  color: #cccccc;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto; /* Only sidebar content should scroll */
  overflow-x: hidden;
  min-height: 0; /* Important for proper flex behavior */
}

/* Section Styling */
.section {
  margin-bottom: 8px;
}

.section-header {
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  color: #cccccc;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-title {
  flex: 1;
}

.section-actions {
  display: flex;
  gap: 2px;
}

/* File Tree */
.file-tree {
  padding: 0 8px;
}

/* Participants */
.participants-list {
  padding: 0 8px;
}

.participant-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.participant-item:hover {
  background: #2a2d2e;
}

.participant-item.current {
  background: #094771;
}

.participant-item.owner {
  border-left: 2px solid #f9c23c;
  padding-left: 6px;
}

.participant-item.offline {
  opacity: 0.6;
}

.participant-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #007acc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 10px;
}

.participant-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.participant-name {
  font-size: 13px;
  color: #cccccc;
  font-weight: 600;
}

.clickable-title {
  cursor: pointer;
  transition: color 0.3s ease;
  color: #007acc !important;
  font-weight: 700;
}

.clickable-title:hover {
  color: #1177dd !important;
}

.participant-item.current {
  background: #094771;
}

.participant-item.owner {
  border-left: 2px solid #f9c23c;
  padding-left: 6px;
}

.participant-item.offline {
  opacity: 0.6;
}

.participant-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #007acc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 10px;
}

.participant-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.participant-name {
  font-size: 13px;
  color: #cccccc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.participant-status {
  font-size: 11px;
  color: #858585;
}

.participant-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #858585;
  flex-shrink: 0;
}

.participant-indicator.online {
  background: #89d185;
}

/* Search View */
.search-content {
  padding: 8px 16px;
}

.search-input {
  width: 100%;
  padding: 6px 8px;
  background: #3c3c3c;
  border: 1px solid #3e3e3e;
  border-radius: 3px;
  color: #cccccc;
  font-size: 13px;
}

.search-input:focus {
  outline: none;
  border-color: #007acc;
}

.search-placeholder {
  margin-top: 16px;
  color: #858585;
  font-style: italic;
  text-align: center;
}

/* Session Details */
.session-details {
  padding: 8px 16px;
}

.session-lifetime {
  color: #4ec9b0 !important;
  font-weight: 500;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px solid #2d2d30;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  color: #858585;
  font-size: 11px;
  text-transform: uppercase;
}

.detail-value {
  color: #cccccc;
  font-size: 12px;
  font-weight: 400;
}

.session-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.leave-session-btn {
  width: 100%;
  padding: 8px;
  background: #d73a49;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s ease;
}

.leave-session-btn:hover {
  background: #cb2431;
}

.delete-session-btn {
  width: 100%;
  padding: 8px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s ease;
}

.delete-session-btn:hover:not(:disabled) {
  background: #c82333;
}

.delete-session-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

/* Main Content */
.main-content {
  grid-area: main;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  overflow: hidden; /* Prevent main content from scrolling */
  min-width: 0; /* Important for grid items */
}

/* Title Bar */
.title-bar {
  height: 35px;
  background: #2d2d2d;
  border-bottom: 1px solid #3e3e3e;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  flex-shrink: 0; /* Don't shrink */
}

.title-bar-left {
  display: flex;
  align-items: center;
}

.session-name {
  font-size: 13px;
  color: #cccccc;
  font-weight: 600;
}

.clickable-title {
  cursor: pointer;
  transition: color 0.3s ease;
  color: #007acc !important;
  font-weight: 700;
}

.clickable-title:hover {
  color: #1177dd !important;
}

.title-bar-right {
  display: flex;
  gap: 4px;
}

.title-btn {
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  color: #858585;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  transition: all 0.2s ease;
}

.title-btn:hover {
  background: #3e3e3e;
  color: #cccccc;
}

/* Editor Area */
.editor-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* Important for proper flex behavior */
  overflow: hidden; /* Prevent editor area from scrolling */
}

.editor-tabs {
  height: 35px;
  background: #2d2d2d;
  border-bottom: 1px solid #3e3e3e;
  display: flex;
  align-items: center;
  padding: 0 8px;
  gap: 4px;
  flex-shrink: 0; /* Don't shrink */
  overflow-x: auto; /* Allow horizontal scrolling for tabs if needed */
  overflow-y: hidden;
}

.tab {
  height: 35px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  background: #1e1e1e;
  border-top: 2px solid #007acc;
  color: #ffffff;
  cursor: pointer;
  font-size: 13px;
}

.tab.active {
  background: #1e1e1e;
}

.tab-label {
  font-size: 13px;
}

.tab-close {
  width: 16px;
  height: 16px;
  background: transparent;
  border: none;
  color: #858585;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  font-size: 16px;
  line-height: 1;
}

.tab-close:hover {
  background: #3e3e3e;
  color: #cccccc;
}

.editor-content {
  flex: 1;
  min-width: 0;
  min-height: 0; /* Important for proper flex behavior */
  background: #1e1e1e;
  width: 100%;
  overflow: hidden; /* Let child components handle their own scrolling */
}

.code-editor-component {
  height: 100%;
  width: 100%;
  overflow: hidden; /* CodeEditor handles its own scrolling */
}

.terminal-component {
  height: 100%;
  overflow: hidden; /* Terminal handles its own scrolling */
}

/* AI Assistant Panel */
.ai-panel {
  grid-area: ai;
  background: #252526;
  border-left: 1px solid #2d2d2d;
  overflow: hidden;
}

/* Chat Panel */
.chat-panel {
  grid-area: ai;
  background: #252526;
  border-left: 1px solid #2d2d2d;
  overflow: hidden;
}

/* Panel Toggle Button */
.panel-toggle {
  position: fixed;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 1000;
}

.toggle-btn {
  width: 40px;
  height: 40px;
  background: #2d2d2d;
  border: 1px solid #3e3e3e;
  border-radius: 6px;
  color: #858585;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.toggle-btn:hover {
  background: #3e3e3e;
  color: #cccccc;
  border-color: #007acc;
}

.toggle-btn.active {
  background: #007acc;
  color: white;
  border-color: #007acc;
}

/* Status Bar (Bottom) */
.status-bar {
  grid-area: status;
  height: 22px;
  background: #007acc;
  color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  font-size: 12px;
  flex-shrink: 0; /* Don't shrink */
  overflow: hidden; /* No scrolling needed */
}

.status-left,
.status-right {
  display: flex;
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Notifications */
.notifications {
  position: fixed;
  top: 8px;
  right: 8px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 400px;
}

.notification {
  background: #2d2d2d;
  border: 1px solid #3e3e3e;
  border-radius: 3px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification:hover {
  background: #3e3e3e;
}

.notification.success {
  border-left: 3px solid #89d185;
}

.notification.error {
  border-left: 3px solid #f48771;
}

.notification.warning {
  border-left: 3px solid #f9c23c;
}

.notification.info {
  border-left: 3px solid #75beff;
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex: 1;
}

.notification-icon {
  margin-top: 2px;
  flex-shrink: 0;
}

.notification-message {
  font-size: 13px;
  color: #cccccc;
  line-height: 1.4;
}

.notification-close {
  width: 16px;
  height: 16px;
  background: transparent;
  border: none;
  color: #858585;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  font-size: 14px;
  line-height: 1;
  flex-shrink: 0;
}

.notification-close:hover {
  color: #cccccc;
}

/* User Management Styles */
.user-management {
  padding: 8px 16px;
}

.add-user-form {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.user-input {
  flex: 1;
  background: #3c3c3c;
  border: 1px solid #464647;
  color: #cccccc;
  padding: 6px 8px;
  font-size: 12px;
  border-radius: 3px;
}

.user-input:focus {
  outline: none;
  border-color: #007acc;
}

.add-user-btn {
  background: #007acc;
  color: white;
  border: none;
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-user-btn:hover:not(:disabled) {
  background: #005a9e;
}

.add-user-btn:disabled {
  background: #464647;
  cursor: not-allowed;
}

.error-message {
  background: #5a1d1d;
  border: 1px solid #be1100;
  color: #f48771;
  padding: 6px 8px;
  border-radius: 3px;
  font-size: 11px;
  margin-bottom: 8px;
}

.success-message {
  background: #1e3a1e;
  border: 1px solid #14432a;
  color: #89d185;
  padding: 6px 8px;
  border-radius: 3px;
  font-size: 11px;
  margin-bottom: 8px;
}

.participants-list {
  margin-top: 12px;
}

.participants-header {
  color: #858585;
  font-size: 11px;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.participant-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  margin-bottom: 4px;
  background: #2d2d30;
  border-radius: 3px;
}

.participant-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.participant-name {
  color: #cccccc;
  font-size: 12px;
  font-weight: 500;
}

.participant-role {
  color: #858585;
  font-size: 10px;
  text-transform: uppercase;
}

.remove-user-btn {
  background: #a1260d;
  color: white;
  border: none;
  width: 20px;
  height: 20px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.remove-user-btn:hover:not(:disabled) {
  background: #be1100;
}

.remove-user-btn:disabled {
  background: #464647;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .vscode-container {
    grid-template-columns: 48px auto 1fr 300px;
  }
}

@media (max-width: 768px) {
  .vscode-container {
    grid-template-columns: 40px 250px 1fr;
    grid-template-areas: 
      "activity sidebar main"
      "status status status";
  }
  
  .ai-panel {
    display: none;
  }
  
  .activity-bar {
    width: 40px;
  }
  
  .activity-item {
    width: 40px;
    height: 40px;
  }
  
  .sidebar {
    width: 250px;
  }
}
</style>