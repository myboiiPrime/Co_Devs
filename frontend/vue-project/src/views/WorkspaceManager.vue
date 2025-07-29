<template>
  <div class="workspace-manager">
    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <h1 class="title">
          <span class="icon">🚀</span>
          Collaborative Workspaces
        </h1>
        <p class="subtitle">Manage and access your collaborative development environments</p>
      </div>
      <div class="header-right">
        <button @click="showCreateModal = true" class="btn-primary">
          <span class="icon">+</span>
          New Workspace
        </button>
        <button @click="refreshWorkspaces" class="btn-secondary" :disabled="loading">
          <span class="icon">🔄</span>
          Refresh
        </button>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="filters">
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search workspaces..."
          class="search-input"
        >
        <span class="search-icon">🔍</span>
      </div>
      <div class="filter-tabs">
        <button 
          v-for="filter in filters" 
          :key="filter.key"
          @click="activeFilter = filter.key"
          :class="['filter-tab', { active: activeFilter === filter.key }]"
        >
          {{ filter.label }} ({{ getFilteredCount(filter.key) }})
        </button>
      </div>
    </div>

    <!-- Workspaces Grid -->
    <div class="workspaces-container">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading workspaces...</p>
      </div>

      <div v-else-if="filteredWorkspaces.length === 0" class="empty-state">
        <div class="empty-icon">📁</div>
        <h3>No workspaces found</h3>
        <p>Create your first collaborative workspace to get started</p>
        <button @click="showCreateModal = true" class="btn-primary">
          Create Workspace
        </button>
      </div>

      <div v-else class="workspaces-grid">
        <div 
          v-for="workspace in filteredWorkspaces" 
          :key="workspace.sessionId"
          class="workspace-card"
          :class="{ 
            active: workspace.isActive,
            recent: isRecentlyUsed(workspace),
            owned: workspace.isOwner
          }"
        >
          <!-- Card Header -->
          <div class="card-header">
            <div class="workspace-info">
              <h3 class="workspace-name">{{ workspace.name || 'Untitled Workspace' }}</h3>
              <p class="workspace-description">{{ workspace.description || 'No description' }}</p>
            </div>
            <div class="workspace-status">
              <span :class="['status-badge', workspace.isActive ? 'active' : 'inactive']">
                {{ workspace.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>

          <!-- Card Body -->
          <div class="card-body">
            <div class="workspace-meta">
              <div class="meta-item">
                <span class="meta-label">Owner:</span>
                <span class="meta-value">{{ workspace.owner }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Participants:</span>
                <span class="meta-value">{{ workspace.participantCount }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Created:</span>
                <span class="meta-value">{{ formatDate(workspace.createdAt) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Language:</span>
                <span class="meta-value">{{ workspace.language || 'Mixed' }}</span>
              </div>
            </div>

            <!-- Participants Preview -->
            <div class="participants-preview">
              <div class="participants-avatars">
                <div 
                  v-for="participant in workspace.participants?.slice(0, 3)" 
                  :key="participant.id"
                  class="participant-avatar"
                  :title="participant.username"
                >
                  {{ participant.username.charAt(0).toUpperCase() }}
                </div>
                <div 
                  v-if="workspace.participantCount > 3" 
                  class="participant-avatar more"
                >
                  +{{ workspace.participantCount - 3 }}
                </div>
              </div>
            </div>
          </div>

          <!-- Card Actions -->
          <div class="card-actions">
            <button 
              @click="openWorkspace(workspace)"
              class="btn-primary btn-small"
              :disabled="!workspace.isActive"
            >
              <span class="icon">🚀</span>
              Open
            </button>
            <button 
              @click="shareWorkspace(workspace)"
              class="btn-secondary btn-small"
            >
              <span class="icon">🔗</span>
              Share
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Workspace Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>Create New Workspace</h2>
          <button @click="showCreateModal = false" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createWorkspace">
            <div class="form-group">
              <label for="workspaceName">Workspace Name</label>
              <input 
                id="workspaceName"
                v-model="newWorkspace.name" 
                type="text" 
                placeholder="My Awesome Project"
                required
              >
            </div>
            <div class="form-group">
              <label for="workspaceDescription">Description</label>
              <textarea 
                id="workspaceDescription"
                v-model="newWorkspace.description" 
                placeholder="Brief description of your project..."
                rows="3"
              ></textarea>
            </div>
            <div class="form-group">
              <label for="workspaceLanguage">Primary Language</label>
              <select id="workspaceLanguage" v-model="newWorkspace.language">
                <option value="">Select Language</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label>
                <input 
                  v-model="newWorkspace.createWorkspaceDir" 
                  type="checkbox"
                >
                Create workspace directory
              </label>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button @click="showCreateModal = false" class="btn-secondary">Cancel</button>
          <button @click="createWorkspace" class="btn-primary" :disabled="!newWorkspace.name">
            Create Workspace
          </button>
        </div>
      </div>
    </div>

    <!-- Notifications -->
    <div class="notifications">
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        :class="['notification', notification.type]"
      >
        {{ notification.message }}
        <button @click="removeNotification(notification.id)" class="notification-close">×</button>
      </div>
    </div>
  </div>
</template>

<script>
import { buildApiUrl } from '@/config/api.js'
import workspaceService from '@/services/workspaceService.js'

export default {
  name: 'WorkspaceManager',
  data() {
    return {
      workspaces: [],
      loading: true,
      searchQuery: '',
      activeFilter: 'all',
      showCreateModal: false,
      notifications: [],
      filters: [
        { key: 'all', label: 'All' },
        { key: 'active', label: 'Active' },
        { key: 'owned', label: 'Owned by me' },
        { key: 'recent', label: 'Recent' }
      ],
      newWorkspace: {
        name: '',
        description: '',
        language: '',
        createWorkspaceDir: true
      }
    }
  },
  computed: {
    filteredWorkspaces() {
      let filtered = this.workspaces

      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(workspace => 
          workspace.name?.toLowerCase().includes(query) ||
          workspace.description?.toLowerCase().includes(query) ||
          workspace.owner?.toLowerCase().includes(query)
        )
      }

      // Apply status filter
      switch (this.activeFilter) {
        case 'active':
          filtered = filtered.filter(w => w.isActive)
          break
        case 'owned':
          filtered = filtered.filter(w => w.isOwner)
          break
        case 'recent':
          filtered = filtered.filter(w => this.isRecentlyUsed(w))
          break
      }

      return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
  },
  mounted() {
    this.loadWorkspaces()
  },
  methods: {
    async loadWorkspaces() {
      try {
        this.loading = true
        // Get current username from localStorage or use a default
        const username = localStorage.getItem('username') || 'current_user'
        
        if (!username) {
          console.warn('No username available')
          this.workspaces = []
          return
        }
        
        // Fetch workspaces from backend API
        const workspaces = await workspaceService.getWorkspaces(username)
        
        // Ensure we have a valid array
        this.workspaces = Array.isArray(workspaces) ? workspaces : []
        
        if (this.workspaces.length === 0) {
          this.addNotification('No workspaces found. Create your first workspace!', 'info')
        }
      } catch (error) {
        console.error('Error loading workspaces:', error)
        this.addNotification(`Error loading workspaces: ${error.message}`, 'error')
        // Fallback to empty array
        this.workspaces = []
      } finally {
        this.loading = false
      }
    },

    async createWorkspace() {
      try {
        // Get current username from localStorage or use a default
        const username = localStorage.getItem('username') || 'current_user'
        
        const workspaceData = {
          username,
          sessionName: this.newWorkspace.name,
          description: this.newWorkspace.description,
          language: this.newWorkspace.language
        }

        // Create workspace via backend API
        const result = await workspaceService.createWorkspace(workspaceData)
        
        this.addNotification('Workspace created successfully!', 'success')
        this.showCreateModal = false
        this.resetNewWorkspace()
        
        // Refresh the workspace list
        await this.loadWorkspaces()
        
        // Open the new workspace
        this.openWorkspace({ sessionId: result.sessionId })
      } catch (error) {
        console.error('Error creating workspace:', error)
        this.addNotification('Error creating workspace', 'error')
      }
    },

    openWorkspace(workspace) {
      // Get current username from localStorage or use a default
      const username = localStorage.getItem('username') || 'current_user'
      
      this.$router.push({
        name: 'ide',
        query: {
          session: workspace.sessionId,
          username: username
        }
      })
    },

    refreshWorkspaces() {
      this.loadWorkspaces()
    },

    getFilteredCount(filterKey) {
      switch (filterKey) {
        case 'all':
          return this.workspaces.length
        case 'active':
          return this.workspaces.filter(w => w.isActive).length
        case 'owned':
          return this.workspaces.filter(w => w.isOwner).length
        case 'recent':
          return this.workspaces.filter(w => this.isRecentlyUsed(w)).length
        default:
          return 0
      }
    },

    isRecentlyUsed(workspace) {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return new Date(workspace.createdAt) > oneWeekAgo
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString()
    },

    shareWorkspace(workspace) {
      const shareUrl = `${window.location.origin}/ide?session=${workspace.sessionId}`
      navigator.clipboard.writeText(shareUrl)
      this.addNotification('Share link copied to clipboard!', 'success')
    },

    resetNewWorkspace() {
      this.newWorkspace = {
        name: '',
        description: '',
        language: '',
        createWorkspaceDir: true
      }
    },

    addNotification(message, type = 'info') {
      const notification = {
        id: Date.now(),
        message,
        type
      }
      this.notifications.push(notification)
      setTimeout(() => this.removeNotification(notification.id), 5000)
    },

    removeNotification(id) {
      this.notifications = this.notifications.filter(n => n.id !== id)
    }
  }
}
</script>

<style scoped>
.workspace-manager {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  color: white;
}

.header-left .title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-left .subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

.header-right {
  display: flex;
  gap: 1rem;
}

/* Buttons */
.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background: #45a049;
  transform: translateY(-2px);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

/* Filters */
.filters {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.search-box {
  position: relative;
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
}

.filter-tab {
  padding: 0.5rem 1rem;
  border: 2px solid #e1e5e9;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tab.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* Workspaces */
.workspaces-container {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.workspaces-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.workspace-card {
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s;
  background: white;
}

.workspace-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.workspace-card.active {
  border-color: #4CAF50;
  background: #f8fff9;
}

.workspace-card.owned {
  border-left: 4px solid #FF9800;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.workspace-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: #333;
}

.workspace-description {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.active {
  background: #e8f5e8;
  color: #4CAF50;
}

.status-badge.inactive {
  background: #f5f5f5;
  color: #666;
}

.workspace-meta {
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.meta-label {
  color: #666;
  font-weight: 500;
}

.meta-value {
  color: #333;
  font-weight: 600;
}

.participants-preview {
  margin-bottom: 1rem;
}

.participants-avatars {
  display: flex;
  gap: 0.5rem;
}

.participant-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8rem;
}

.participant-avatar.more {
  background: #ccc;
  color: #666;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* States */
.loading-state, .empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e1e5e9;
}

.modal-header h2 {
  margin: 0;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: 1rem;
}

.form-group input[type="checkbox"] {
  width: auto;
  margin-right: 0.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e1e5e9;
}

/* Notifications */
.notifications {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1001;
}

.notification {
  background: white;
  border-left: 4px solid #4CAF50;
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 300px;
}

.notification.error {
  border-left-color: #f44336;
}

.notification.info {
  border-left-color: #2196F3;
}

.notification-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
  margin-left: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .workspace-manager {
    padding: 1rem;
  }
  
  .header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-right {
    width: 100%;
    justify-content: center;
  }
  
  .workspaces-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-tabs {
    flex-wrap: wrap;
  }
}
</style>