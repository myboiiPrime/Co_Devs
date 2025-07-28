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
                :key="participant.id"
                class="participant-item"
                :class="{ 
                  owner: participant.isOwner, 
                  current: participant.id === currentUserId,
                  offline: !participant.isOnline 
                }"
              >
                <div class="participant-avatar">
                  {{ participant.username.charAt(0).toUpperCase() }}
                </div>
                <div class="participant-info">
                  <span class="participant-name">{{ participant.username }}</span>
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
              <button @click="leaveSession" class="leave-session-btn">
                Leave Session
              </button>
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
                  :key="participant.username"
                  class="participant-item"
                >
                  <div class="participant-info">
                    <span class="participant-name">{{ participant.username }}</span>
                    <span class="participant-role">{{ participant.role }}</span>
                  </div>
                  <button 
                    v-if="participant.username !== currentUsername && participant.role !== 'owner'"
                    @click="removeUser(participant.username)"
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
          <CodeEditor 
            v-if="selectedFile && activeTab === 'editor'"
            v-model="fileContent"
            :language="getFileLanguage(selectedFile.name)"
            :documentId="selectedFile.path"
            @change="handleFileContentChange"
            @ai-request="handleAiRequest"
            class="code-editor-component"
          />
          <Terminal 
            v-if="activeTab === 'terminal'"
            :sessionId="sessionId"
            :socket="socket"
            @error="handleError"
            class="terminal-component"
          />
        </div>
      </div>
    </div>

    <!-- Status Bar -->
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
import { buildApiUrl } from '@/config/api.js'

export default {
  name: 'CollaborationManager',
  components: {
    Terminal,
    FileTree,
    CodeEditor
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
      userManagementError: '',
      userManagementSuccess: '',
      currentUsername: ''
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
    }
  },
  mounted() {
    this.setupSocketListeners()
    this.joinSession()
    // Get current username from route query or props
    this.currentUsername = this.$route.query.username || this.currentUserId || 'Anonymous'
  },
  beforeUnmount() {
    this.cleanup()
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

    setupSocketListeners() {
      this.socket.on('session-joined', this.handleSessionJoined)
      this.socket.on('user-joined-session', this.handleUserJoined)
      this.socket.on('user-left-session', this.handleUserLeft)
      this.socket.on('session-updated', this.handleSessionUpdated)
      this.socket.on('collaboration-notification', this.handleCollaborationNotification)
      this.socket.on('fs-read-result', this.handleFileReadResult)
      this.socket.on('fs-write-result', this.handleFileWriteResult)
    },

    joinSession() {
      this.socket.emit('join-collaboration', { sessionId: this.sessionId })
    },

    handleSessionJoined(data) {
      this.sessionData = data.session
      this.participants = data.participants || []
      
      this.addNotification({
        type: 'success',
        message: `Joined collaboration session: ${data.session.name}`
      })
    },

    handleUserJoined(data) {
      const existingIndex = this.participants.findIndex(p => p.id === data.user.id)
      if (existingIndex === -1) {
        this.participants.push({
          ...data.user,
          isOnline: true
        })
      } else {
        this.participants[existingIndex].isOnline = true
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
      this.addNotification(data)
    },

    handleFileReadResult(result) {
      if (result.success) {
        this.fileContent = result.content
      } else {
        this.addNotification({
          type: 'error',
          message: `Failed to read file: ${result.error}`
        })
      }
    },

    handleFileWriteResult(result) {
      if (!result.success) {
        this.addNotification({
          type: 'error',
          message: `Failed to save file: ${result.error}`
        })
      }
    },

    handleFileSelected(file) {
      this.selectedFile = file
      this.activeTab = 'editor'
      this.loadFileContent(file)
      this.$emit('file-selected', file)
    },

    async loadFileContent(file) {
      try {
        // Request file content from server
        this.socket.emit('fs-read', {
          sessionId: this.sessionId,
          path: file.path
        })
      } catch (error) {
        console.error('Error loading file:', error)
        this.addNotification({
          type: 'error',
          message: `Failed to load file: ${file.name}`
        })
      }
    },

    handleFileContentChange(content) {
      this.fileContent = content
      // Save file content to server
      this.socket.emit('fs-write', {
        sessionId: this.sessionId,
        path: this.selectedFile.path,
        content: content
      })
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
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'py': 'python',
        'java': 'java',
        'cpp': 'cpp',
        'c': 'cpp',
        'h': 'cpp',
        'hpp': 'cpp',
        'html': 'html',
        'htm': 'html',
        'css': 'css',
        'scss': 'scss',
        'sass': 'sass',
        'json': 'json',
        'xml': 'xml',
        'md': 'markdown',
        'txt': 'plaintext'
      }
      return languageMap[ext] || 'plaintext'
    },

    handleAiRequest(request) {
      // Handle AI requests from the code editor
      this.addNotification({
        type: 'info',
        message: `AI ${request.action} request: ${request.selectedText.substring(0, 50)}...`
      })
    },

    handleNotification(notification) {
      this.addNotification(notification)
    },

    handleError(error) {
      this.addNotification({
        type: 'error',
        message: error.message || 'An error occurred'
      })
    },

    addNotification(notification) {
      const id = Date.now() + Math.random()
      this.notifications.push({
        id,
        ...notification,
        timestamp: new Date()
      })

      // Auto-remove after 5 seconds
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

    cleanup() {
      if (this.socket) {
        this.socket.off('session-joined')
        this.socket.off('user-joined-session')
        this.socket.off('user-left-session')
        this.socket.off('session-updated')
        this.socket.off('collaboration-notification')
      }
    }
  }
}
</script>

<style scoped>
/* VS Code Theme Colors */
.vscode-container {
  display: flex;
  height: 100vh;
  background: #1e1e1e;
  color: #cccccc;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 13px;
}

/* Activity Bar */
.activity-bar {
  width: 48px;
  background: #333333;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #2d2d2d;
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
  width: 300px;
  background: #252526;
  border-right: 1px solid #2d2d2d;
  display: flex;
  flex-direction: column;
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
  overflow-y: auto;
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

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
}

.detail-label {
  color: #858585;
}

.detail-value {
  color: #cccccc;
  font-family: monospace;
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
  margin-top: 16px;
  transition: background 0.2s ease;
}

.leave-session-btn:hover {
  background: #cb2431;
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
}

/* Title Bar */
.title-bar {
  height: 35px;
  background: #2d2d2d;
  border-bottom: 1px solid #3e3e3e;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
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
}

.editor-tabs {
  height: 35px;
  background: #2d2d2d;
  border-bottom: 1px solid #3e3e3e;
  display: flex;
  align-items: center;
  padding: 0 8px;
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
  background: #1e1e1e;
}

.terminal-component {
  height: 100%;
}

/* Status Bar */
.status-bar {
  height: 22px;
  background: #007acc;
  color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  font-size: 12px;
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
@media (max-width: 768px) {
  .sidebar {
    width: 250px;
  }
  
  .activity-bar {
    width: 40px;
  }
  
  .activity-item {
    width: 40px;
    height: 40px;
  }
}
</style>