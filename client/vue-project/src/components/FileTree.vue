<template>
  <div class="file-tree">
    <div class="file-tree-header">
      <h3>File Explorer</h3>
      <div class="file-tree-actions">
        <button @click="createFile" title="New File">📄</button>
        <button @click="createFolder" title="New Folder">📁</button>
        <button @click="refresh" title="Refresh">🔄</button>
      </div>
    </div>
    
    <div class="file-tree-content">
      <div class="current-path">
        <span>{{ currentPath || '/' }}</span>
      </div>
      
      <div class="file-list">
        <div 
          v-if="currentPath"
          class="file-item folder"
          @click="navigateUp"
        >
          <span class="file-icon">📁</span>
          <span class="file-name">..</span>
        </div>
        
        <div 
          v-for="item in files" 
          :key="item.name"
          class="file-item"
          :class="{ folder: item.type === 'directory', file: item.type === 'file' }"
          @click="handleItemClick(item)"
          @contextmenu.prevent="showContextMenu(item, $event)"
        >
          <span class="file-icon">{{ getFileIcon(item) }}</span>
          <span class="file-name">{{ item.name }}</span>
          <span v-if="item.size" class="file-size">{{ formatSize(item.size) }}</span>
        </div>
      </div>
    </div>

    <!-- Context Menu -->
    <div 
      v-if="contextMenu.show" 
      class="context-menu"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      @click="hideContextMenu"
    >
      <div class="context-item" @click="renameItem">Rename</div>
      <div class="context-item" @click="deleteItem">Delete</div>
      <div v-if="contextMenu.item.type === 'file'" class="context-item" @click="openFile">Open</div>
    </div>

    <!-- Create File/Folder Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal" @click.stop>
        <h3>{{ createModalType === 'file' ? 'Create New File' : 'Create New Folder' }}</h3>
        <form @submit.prevent="handleCreate">
          <div class="form-group">
            <label>Name:</label>
            <input 
              v-model="newItemName" 
              type="text" 
              :placeholder="createModalType === 'file' ? 'filename.txt' : 'folder-name'"
              required
              ref="nameInput"
            />
          </div>
          <div class="form-actions">
            <button type="button" @click="showCreateModal = false">Cancel</button>
            <button type="submit">Create</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FileTree',
  props: {
    sessionId: {
      type: String,
      required: true
    },
    socket: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      files: [],
      currentPath: '',
      loading: false,
      contextMenu: {
        show: false,
        x: 0,
        y: 0,
        item: null
      },
      showCreateModal: false,
      createModalType: 'file',
      newItemName: ''
    }
  },
  mounted() {
    this.setupSocketListeners()
    this.loadFiles()
  },
  beforeUnmount() {
    this.cleanup()
  },
  methods: {
    setupSocketListeners() {
      this.socket.on('fs-list-result', this.handleFileListResult)
      this.socket.on('fs-create-result', this.handleCreateResult)
      this.socket.on('fs-delete-result', this.handleDeleteResult)
      this.socket.on('fs-rename-result', this.handleRenameResult)
    },

    loadFiles(path = '') {
      this.loading = true
      this.socket.emit('fs-list', {
        sessionId: this.sessionId,
        path
      })
    },

    handleFileListResult(data) {
      this.loading = false
      if (data.path === this.currentPath) {
        this.files = data.files || []
        
        // Emit files data for search functionality
        this.$emit('files-loaded', this.files)
      }
    },

    handleItemClick(item) {
      if (item.type === 'directory') {
        this.currentPath = this.joinPath(this.currentPath, item.name)
        this.loadFiles(this.currentPath)
      } else {
        this.$emit('file-selected', {
          path: this.joinPath(this.currentPath, item.name),
          name: item.name
        })
      }
    },

    navigateUp() {
      const parts = this.currentPath.split('/').filter(p => p)
      parts.pop()
      this.currentPath = parts.join('/')
      this.loadFiles(this.currentPath)
    },

    joinPath(base, name) {
      if (!base) return name
      return `${base}/${name}`
    },

    getFileIcon(item) {
      if (item.type === 'directory') return '📁'
      
      const ext = item.name.split('.').pop()?.toLowerCase()
      const iconMap = {
        'js': '📄',
        'vue': '💚',
        'html': '🌐',
        'css': '🎨',
        'json': '📋',
        'md': '📝',
        'txt': '📄',
        'png': '🖼️',
        'jpg': '🖼️',
        'jpeg': '🖼️',
        'gif': '🖼️',
        'pdf': '📕',
        'zip': '📦'
      }
      
      return iconMap[ext] || '📄'
    },

    formatSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    },

    showContextMenu(item, event) {
      this.contextMenu = {
        show: true,
        x: event.clientX,
        y: event.clientY,
        item
      }
    },

    hideContextMenu() {
      this.contextMenu.show = false
    },

    createFile() {
      this.createModalType = 'file'
      this.newItemName = ''
      this.showCreateModal = true
      this.$nextTick(() => {
        this.$refs.nameInput?.focus()
      })
    },

    createFolder() {
      this.createModalType = 'folder'
      this.newItemName = ''
      this.showCreateModal = true
      this.$nextTick(() => {
        this.$refs.nameInput?.focus()
      })
    },

    handleCreate() {
      if (!this.newItemName.trim()) return

      this.socket.emit('fs-create', {
        sessionId: this.sessionId,
        path: this.joinPath(this.currentPath, this.newItemName.trim()),
        type: this.createModalType
      })

      this.showCreateModal = false
    },

    handleCreateResult(data) {
      if (data.success) {
        this.loadFiles(this.currentPath)
        this.$emit('notification', {
          type: 'success',
          message: `${this.createModalType} created successfully`
        })
      } else {
        this.$emit('notification', {
          type: 'error',
          message: `Failed to create ${this.createModalType}: ${data.error}`
        })
      }
    },

    renameItem() {
      const newName = prompt('Enter new name:', this.contextMenu.item.name)
      if (newName && newName !== this.contextMenu.item.name) {
        this.socket.emit('fs-rename', {
          sessionId: this.sessionId,
          oldPath: this.joinPath(this.currentPath, this.contextMenu.item.name),
          newPath: this.joinPath(this.currentPath, newName)
        })
      }
      this.hideContextMenu()
    },

    deleteItem() {
      if (confirm(`Are you sure you want to delete "${this.contextMenu.item.name}"?`)) {
        this.socket.emit('fs-delete', {
          sessionId: this.sessionId,
          path: this.joinPath(this.currentPath, this.contextMenu.item.name)
        })
      }
      this.hideContextMenu()
    },

    openFile() {
      this.handleItemClick(this.contextMenu.item)
      this.hideContextMenu()
    },

    handleDeleteResult(data) {
      if (data.success) {
        this.loadFiles(this.currentPath)
        this.$emit('notification', {
          type: 'success',
          message: 'Item deleted successfully'
        })
      } else {
        this.$emit('notification', {
          type: 'error',
          message: `Failed to delete item: ${data.error}`
        })
      }
    },

    handleRenameResult(data) {
      if (data.success) {
        this.loadFiles(this.currentPath)
        this.$emit('notification', {
          type: 'success',
          message: 'Item renamed successfully'
        })
      } else {
        this.$emit('notification', {
          type: 'error',
          message: `Failed to rename item: ${data.error}`
        })
      }
    },

    refresh() {
      this.loadFiles(this.currentPath)
    },

    cleanup() {
      this.socket.off('fs-list-result', this.handleFileListResult)
      this.socket.off('fs-create-result', this.handleCreateResult)
      this.socket.off('fs-delete-result', this.handleDeleteResult)
      this.socket.off('fs-rename-result', this.handleRenameResult)
    }
  }
}
</script>

<style scoped>
.file-tree {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 4px;
  overflow: hidden;
}

.file-tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #2d2d2d;
  border-bottom: 1px solid #333;
}

.file-tree-header h3 {
  margin: 0;
  color: #fff;
  font-size: 14px;
}

.file-tree-actions {
  display: flex;
  gap: 4px;
}

.file-tree-actions button {
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 2px;
  font-size: 12px;
}

.file-tree-actions button:hover {
  background: #3d3d3d;
}

.file-tree-content {
  flex: 1;
  overflow-y: auto;
}

.current-path {
  padding: 8px 12px;
  background: #252526;
  border-bottom: 1px solid #333;
  color: #ccc;
  font-size: 12px;
  font-family: monospace;
}

.file-list {
  padding: 4px 0;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 4px 12px;
  cursor: pointer;
  color: #ccc;
  font-size: 13px;
  transition: background-color 0.2s;
}

.file-item:hover {
  background: #2d2d2d;
}

.file-item.folder {
  color: #569cd6;
}

.file-item.file {
  color: #d4d4d4;
}

.file-icon {
  margin-right: 6px;
  font-size: 14px;
}

.file-name {
  flex: 1;
}

.file-size {
  font-size: 11px;
  color: #888;
}

.context-menu {
  position: fixed;
  background: #2d2d2d;
  border: 1px solid #555;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  min-width: 120px;
}

.context-item {
  padding: 8px 12px;
  color: #ccc;
  cursor: pointer;
  font-size: 13px;
}

.context-item:hover {
  background: #3d3d3d;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #2d2d2d;
  border-radius: 8px;
  padding: 24px;
  min-width: 300px;
  color: #fff;
}

.modal h3 {
  margin: 0 0 16px 0;
  color: #fff;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  color: #ccc;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  background: #1e1e1e;
  border: 1px solid #555;
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
}

.form-group input:focus {
  outline: none;
  border-color: #007acc;
}

.form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 24px;
}

.form-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.form-actions button[type="button"] {
  background: #555;
  color: #fff;
}

.form-actions button[type="submit"] {
  background: #007acc;
  color: #fff;
}

.form-actions button:hover {
  opacity: 0.9;
}
</style>