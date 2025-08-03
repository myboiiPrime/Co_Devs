<template>
  <div class="terminal-container">
    <!-- Debug Info -->
    <div v-if="debugMode" class="debug-info">
      <p>Session ID: {{ sessionId }}</p>
      <p>Socket Connected: {{ socket?.connected }}</p>
      <p>Terminals: {{ terminals.length }}</p>
      <p>Active Terminal: {{ activeTerminal }}</p>
    </div>

    <div class="terminal-header">
      <div class="terminal-tabs">
        <div 
          v-for="terminal in terminals" 
          :key="terminal.id"
          class="terminal-tab"
          :class="{ active: activeTerminal === terminal.id }"
          @click="switchTerminal(terminal.id)"
        >
          <span>{{ terminal.name }}</span>
          <button 
            class="close-btn"
            @click.stop="closeTerminal(terminal.id)"
            v-if="terminals.length > 1"
          >
            ×
          </button>
        </div>
        <button class="add-terminal-btn" @click="showCreateTerminal = true">
          +
        </button>
      </div>
      <div class="terminal-controls">
        <button @click="clearTerminal" title="Clear">
          🗑️
        </button>
        <!-- Removed toggle button -->
        <button @click="toggleDebug" title="Debug">
          🐛
        </button>
      </div>
    </div>

    <div v-if="!isMinimized" class="terminal-content">
      <div v-if="terminals.length === 0" class="no-terminals">
        <p>No terminals available. Click the + button to create one.</p>
        <button @click="createDefaultTerminal" class="create-terminal-btn">
          Create Terminal
        </button>
      </div>
      <div 
        v-for="terminal in terminals" 
        :key="terminal.id"
        v-show="activeTerminal === terminal.id"
        :ref="`terminal-${terminal.id}`"
        class="terminal-instance"
      ></div>
    </div>

    <!-- Create Terminal Modal -->
    <div v-if="showCreateTerminal" class="modal-overlay" @click="showCreateTerminal = false">
      <div class="modal" @click.stop>
        <h3>Create New Terminal</h3>
        <form @submit.prevent="createTerminal">
          <div class="form-group">
            <label>Terminal Name:</label>
            <input 
              v-model="newTerminal.name" 
              type="text" 
              placeholder="Terminal"
              required
            />
          </div>
          <div class="form-group">
            <label>Shell Type:</label>
            <select v-model="newTerminal.shellType" required>
              <option value="cmd">Command Prompt</option>
              <option value="powershell">PowerShell</option>
              <option value="bash">Bash</option>
              <option value="python">Python REPL</option>
              <option value="node">Node.js REPL</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" @click="showCreateTerminal = false">Cancel</button>
            <button type="submit">Create</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import '@xterm/xterm/css/xterm.css'

export default {
  name: 'Terminal',
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
      terminals: [],
      activeTerminal: null,
      terminalInstances: new Map(),
      isMinimized: false,
      showCreateTerminal: false,
      debugMode: false,
      newTerminal: {
        name: 'Terminal',
        shellType: this.getDefaultShellType()
      },
      isComponentActive: true
    }
  },
  watch: {
    activeTerminal(newTerminalId, oldTerminalId) {
      if (newTerminalId && newTerminalId !== oldTerminalId) {
        this.$nextTick(() => {
          this.focusActiveTerminal()
        })
      }
    },
    
    isMinimized(newValue) {
      if (!newValue) {
        this.$nextTick(() => {
          this.focusActiveTerminal()
        })
      }
    }
  },
  mounted() {
    console.log('🐛 FRONTEND TERMINAL: Component mounted')
    this.isComponentActive = true
    
    if (this.socket) {
      this.setupSocketListeners()
      
      // Request existing terminals from server
      setTimeout(() => {
        console.log('🐛 FRONTEND TERMINAL: Requesting existing terminals...')
        this.socket.emit('get-session-terminals', { sessionId: this.sessionId })
      }, 1000)
    } else {
      console.error('❌ FRONTEND TERMINAL: No socket provided!')
    }
  },
  activated() {
    console.log('🔄 Terminal component activated')
    this.isComponentActive = true
    this.$nextTick(() => {
      this.refreshTerminals()
      this.focusActiveTerminal()
    })
  },
  deactivated() {
    console.log('💤 Terminal component deactivated')
    this.isComponentActive = false
  },
  beforeUnmount() {
    this.cleanup()
  },
  methods: {
    getDefaultShellType() {
      const platform = navigator.platform.toLowerCase()
      if (platform.includes('win')) {
        return 'powershell'
      } else if (platform.includes('mac') || platform.includes('linux')) {
        return 'bash'
      }
      return 'cmd'
    },

    toggleDebug() {
      this.debugMode = !this.debugMode
    },

    setupSocketListeners() {
      console.log('🐛 FRONTEND: Setting up socket listeners...')
      
      this.socket.on('terminal-created', (data) => {
        console.log('🐛 FRONTEND: terminal-created event listener triggered:', data)
        this.handleTerminalCreated(data)
      })
      
      this.socket.on('session-joined', (data) => {
        console.log('🐛 FRONTEND TERMINAL: session-joined event received:', data)
        if (data.terminals && data.terminals.length > 0) {
          console.log('🐛 FRONTEND TERMINAL: Loading existing terminals:', data.terminals)
          data.terminals.forEach(terminal => {
            this.handleTerminalCreated({
              terminalId: terminal.terminalId,
              name: terminal.name,
              shellType: terminal.shellType,
              createdBy: terminal.createdBy
            })
          })
        }
      })
      
      this.socket.on('terminal-output', this.handleTerminalOutput)
      this.socket.on('terminal-closed', this.handleTerminalClosed)
      this.socket.on('terminal-exit', this.handleTerminalExit)
      this.socket.on('error', (error) => {
        console.log('🐛 FRONTEND: Socket error received:', error)
        this.handleError(error)
      })
    },

    async createTerminal() {
      try {
        const terminalData = {
          sessionId: this.sessionId,
          name: this.newTerminal.name || 'Terminal',
          shellType: this.newTerminal.shellType || this.getDefaultShellType()
        }

        console.log('🐛 FRONTEND: Creating terminal with data:', terminalData)
        
        if (!this.socket || !this.socket.connected) {
          throw new Error('Socket not connected')
        }

        this.socket.emit('create-terminal', terminalData)
        
        this.newTerminal = {
          name: 'Terminal',
          shellType: this.getDefaultShellType()
        }
        this.showCreateTerminal = false
      } catch (error) {
        console.error('❌ FRONTEND: Failed to create terminal:', error)
        this.$emit('error', 'Failed to create terminal: ' + error.message)
      }
    },

    createDefaultTerminal() {
      console.log('🔧 Creating default terminal...')
      this.newTerminal = {
        name: 'Terminal',
        shellType: this.getDefaultShellType()
      }
      this.createTerminal()
    },

    refreshTerminals() {
      console.log('🔄 Refreshing terminals...')
      
      this.terminals.forEach(terminal => {
        const terminalId = terminal.id
        const instance = this.terminalInstances.get(terminalId)
        
        if (instance) {
          this.$nextTick(() => {
            this.mountTerminalToDOM(terminalId)
          })
        }
      })
    },

    mountTerminalToDOM(terminalId, retryCount = 0) {
      const element = this.$refs[`terminal-${terminalId}`]?.[0]
      if (element) {
        console.log('✅ Mounting terminal to DOM element:', terminalId, element)
        const instance = this.terminalInstances.get(terminalId)
        if (instance && !instance.terminal._core._isDisposed) {
          try {
            if (!instance.terminal.element) {
              instance.terminal.open(element)
            }
            instance.fitAddon.fit()
            
            if (this.activeTerminal === terminalId && this.isComponentActive) {
              instance.terminal.focus()
            }
          } catch (error) {
            console.warn('Error mounting terminal:', error)
          }
        }
      } else {
        console.warn('⚠️ Terminal DOM element not found for:', terminalId, 'Retry:', retryCount)
        if (retryCount < 5) {
          setTimeout(() => {
            this.mountTerminalToDOM(terminalId, retryCount + 1)
          }, 100 * (retryCount + 1))
        } else {
          console.error('❌ Failed to mount terminal after 5 retries:', terminalId)
        }
      }
    },

    handleTerminalCreated(data) {
      console.log('🐛 FRONTEND: Terminal created event received:', data)
      const { terminalId, name, shellType } = data
      
      const existingTerminal = this.terminals.find(t => t.id === terminalId)
      if (existingTerminal) {
        console.log('🐛 FRONTEND: Terminal already exists, skipping:', terminalId)
        return
      }
      
      const terminal = {
        id: terminalId,
        name,
        shellType
      }

      this.terminals.push(terminal)
      this.createXTermInstance(terminalId)
      
      if (!this.activeTerminal) {
        this.activeTerminal = terminalId
      }
    },

    createXTermInstance(terminalId) {
      console.log('Creating xterm instance for:', terminalId)
      
      if (this.terminalInstances.has(terminalId)) {
        console.log('🐛 FRONTEND: Terminal instance already exists:', terminalId)
        return
      }
      
      // Updated terminal configuration for better compatibility
      const terminal = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
        theme: {
          background: '#1e1e1e',
          foreground: '#d4d4d4',
          cursor: '#ffffff',
          selection: '#264f78',
          black: '#000000',
          red: '#cd3131',
          green: '#0dbc79',
          yellow: '#e5e510',
          blue: '#2472c8',
          magenta: '#bc3fbc',
          cyan: '#11a8cd',
          white: '#e5e5e5',
          brightBlack: '#666666',
          brightRed: '#f14c4c',
          brightGreen: '#23d18b',
          brightYellow: '#f5f543',
          brightBlue: '#3b8eea',
          brightMagenta: '#d670d6',
          brightCyan: '#29b8db',
          brightWhite: '#e5e5e5'
        },
        allowTransparency: false,
        convertEol: true,
        scrollback: 1000,
        tabStopWidth: 4
      })

      const fitAddon = new FitAddon()
      const webLinksAddon = new WebLinksAddon()
      
      terminal.loadAddon(fitAddon)
      terminal.loadAddon(webLinksAddon)

      // Handle input
      terminal.onData((data) => {
        this.socket.emit('terminal-input', {
          sessionId: this.sessionId,
          terminalId,
          input: data
        })
      })

      // Handle resize
      terminal.onResize((size) => {
        this.socket.emit('terminal-resize', {
          sessionId: this.sessionId,
          terminalId,
          cols: size.cols,
          rows: size.rows
        })
      })

      this.terminalInstances.set(terminalId, { terminal, fitAddon })

      this.$nextTick(() => {
        this.mountTerminalToDOM(terminalId)
      })
    },

    focusActiveTerminal() {
      if (this.activeTerminal && !this.isMinimized && this.isComponentActive) {
        const instance = this.terminalInstances.get(this.activeTerminal)
        if (instance && !instance.terminal._core._isDisposed) {
          try {
            instance.fitAddon.fit()
            instance.terminal.focus()
            console.log('🎯 Focused terminal:', this.activeTerminal)
          } catch (error) {
            console.warn('Failed to focus terminal:', error)
          }
        }
      }
    },

    handleTerminalOutput(data) {
      const { terminalId, data: output } = data
      const instance = this.terminalInstances.get(terminalId)
      
      if (instance) {
        try {
          instance.terminal.write(output)
        } catch (error) {
          console.warn('Error writing to terminal:', error)
        }
      }
    },

    handleTerminalClosed(data) {
      const { terminalId } = data
      this.removeTerminal(terminalId)
    },

    handleTerminalExit(data) {
      const { terminalId, exitCode } = data
      const instance = this.terminalInstances.get(terminalId)
      
      if (instance) {
        try {
          instance.terminal.write(`\r\n\x1b[31mTerminal exited with code ${exitCode}\x1b[0m\r\n`)
        } catch (error) {
          console.warn('Error writing exit message:', error)
        }
      }
    },

    handleError(error) {
      console.error('Terminal error:', error)
      this.$emit('error', error.message || 'Terminal error occurred')
    },

    switchTerminal(terminalId) {
      console.log('🔄 Switching to terminal:', terminalId)
      this.activeTerminal = terminalId
      
      this.$nextTick(() => {
        this.focusActiveTerminal()
      })
    },

    closeTerminal(terminalId) {
      this.socket.emit('close-terminal', {
        sessionId: this.sessionId,
        terminalId
      })
    },

    removeTerminal(terminalId) {
      // Remove from terminals array
      this.terminals = this.terminals.filter(t => t.id !== terminalId)
      
      // Dispose terminal instance
      const instance = this.terminalInstances.get(terminalId)
      if (instance) {
        try {
          instance.terminal.dispose()
        } catch (error) {
          console.warn('Error disposing terminal:', error)
        }
        this.terminalInstances.delete(terminalId)
      }
      
      // Switch to another terminal if this was active
      if (this.activeTerminal === terminalId) {
        this.activeTerminal = this.terminals.length > 0 ? this.terminals[0].id : null
        if (this.activeTerminal) {
          this.$nextTick(() => {
            this.focusActiveTerminal()
          })
        }
      }
    },

    // Remove this entire method:
    // toggleTerminal() {
    //   this.isMinimized = !this.isMinimized
    //   
    //   if (!this.isMinimized) {
    //     this.$nextTick(() => {
    //       this.focusActiveTerminal()
    //     })
    //   }
    // },

    cleanup() {
      console.log('Cleaning up terminal component...')
      
      for (const instance of this.terminalInstances.values()) {
        try {
          instance.terminal.dispose()
        } catch (error) {
          console.warn('Error disposing terminal during cleanup:', error)
        }
      }
      this.terminalInstances.clear()
      
      // Remove socket listeners
      if (this.socket) {
        this.socket.off('terminal-created', this.handleTerminalCreated)
        this.socket.off('terminal-output', this.handleTerminalOutput)
        this.socket.off('terminal-closed', this.handleTerminalClosed)
        this.socket.off('terminal-exit', this.handleTerminalExit)
        this.socket.off('error', this.handleError)
      }
    }
  }
}
</script>

<style scoped>
.terminal-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 4px;
  overflow: hidden;
}

.debug-info {
  background: #2d2d2d;
  padding: 8px;
  border-bottom: 1px solid #333;
  font-size: 12px;
  color: #ccc;
}

.debug-info p {
  margin: 2px 0;
}

.terminal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #2d2d2d;
  border-bottom: 1px solid #333;
  padding: 0;
}

.terminal-tabs {
  display: flex;
  align-items: center;
}

.terminal-tab {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #2d2d2d;
  border-right: 1px solid #333;
  cursor: pointer;
  color: #ccc;
  font-size: 12px;
  transition: background-color 0.2s;
}

.terminal-tab:hover {
  background: #3d3d3d;
}

.terminal-tab.active {
  background: #1e1e1e;
  color: #fff;
}

.close-btn {
  margin-left: 8px;
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #ff6b6b;
}

.add-terminal-btn {
  padding: 8px 12px;
  background: #2d2d2d;
  border: none;
  color: #ccc;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.add-terminal-btn:hover {
  background: #3d3d3d;
}

.terminal-controls {
  display: flex;
  gap: 4px;
  padding: 4px 8px;
}

.terminal-controls button {
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 2px;
  font-size: 12px;
}

.terminal-controls button:hover {
  background: #3d3d3d;
}

.terminal-content {
  flex: 1;
  overflow: hidden;
}

.no-terminals {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #ccc;
  text-align: center;
}

.create-terminal-btn {
  margin-top: 16px;
  padding: 8px 16px;
  background: #007acc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.create-terminal-btn:hover {
  background: #005a9e;
}

.terminal-instance {
  height: 100%;
  width: 100%;
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
  min-width: 400px;
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

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  background: #1e1e1e;
  border: 1px solid #555;
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus {
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