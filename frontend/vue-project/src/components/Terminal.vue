<template>
  <div class="terminal-container">
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
        <button @click="toggleTerminal" title="Toggle">
          {{ isMinimized ? '⬆️' : '⬇️' }}
        </button>
      </div>
    </div>

    <div v-if="!isMinimized" class="terminal-content">
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
              <option value="bash">Bash</option>
              <option value="cmd">Command Prompt</option>
              <option value="powershell">PowerShell</option>
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
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import 'xterm/css/xterm.css'

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
      newTerminal: {
        name: 'Terminal',
        shellType: 'bash'
      }
    }
  },
  mounted() {
    this.setupSocketListeners()
    this.createDefaultTerminal()
  },
  beforeUnmount() {
    this.cleanup()
  },
  methods: {
    setupSocketListeners() {
      this.socket.on('terminal-created', this.handleTerminalCreated)
      this.socket.on('terminal-output', this.handleTerminalOutput)
      this.socket.on('terminal-closed', this.handleTerminalClosed)
      this.socket.on('terminal-exit', this.handleTerminalExit)
    },

    createDefaultTerminal() {
      this.createTerminal()
    },

    async createTerminal() {
      try {
        const terminalData = {
          sessionId: this.sessionId,
          name: this.newTerminal.name || 'Terminal',
          shellType: this.newTerminal.shellType || 'bash'
        }

        this.socket.emit('create-terminal', terminalData)
        
        // Reset form
        this.newTerminal = {
          name: 'Terminal',
          shellType: 'bash'
        }
        this.showCreateTerminal = false
      } catch (error) {
        console.error('Failed to create terminal:', error)
        this.$emit('error', 'Failed to create terminal')
      }
    },

    handleTerminalCreated(data) {
      const { terminalId, name, shellType } = data
      
      const terminal = {
        id: terminalId,
        name,
        shellType
      }

      this.terminals.push(terminal)
      
      // Create xterm instance
      this.createXTermInstance(terminalId)
      
      // Set as active if it's the first terminal
      if (!this.activeTerminal) {
        this.activeTerminal = terminalId
      }
    },

    createXTermInstance(terminalId) {
      const terminal = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
        theme: {
          background: '#1e1e1e',
          foreground: '#d4d4d4',
          cursor: '#ffffff',
          selection: '#264f78'
        }
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

      // Mount to DOM
      this.$nextTick(() => {
        const element = this.$refs[`terminal-${terminalId}`]?.[0]
        if (element) {
          terminal.open(element)
          fitAddon.fit()
          
          // Focus if active
          if (this.activeTerminal === terminalId) {
            terminal.focus()
          }
        }
      })
    },

    handleTerminalOutput(data) {
      const { terminalId, data: output } = data
      const instance = this.terminalInstances.get(terminalId)
      
      if (instance) {
        instance.terminal.write(output)
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
        instance.terminal.write(`\r\n\x1b[31mTerminal exited with code ${exitCode}\x1b[0m\r\n`)
      }
    },

    switchTerminal(terminalId) {
      this.activeTerminal = terminalId
      
      this.$nextTick(() => {
        const instance = this.terminalInstances.get(terminalId)
        if (instance) {
          instance.fitAddon.fit()
          instance.terminal.focus()
        }
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
      
      // Dispose xterm instance
      const instance = this.terminalInstances.get(terminalId)
      if (instance) {
        instance.terminal.dispose()
        this.terminalInstances.delete(terminalId)
      }
      
      // Switch to another terminal if this was active
      if (this.activeTerminal === terminalId && this.terminals.length > 0) {
        this.activeTerminal = this.terminals[0].id
      }
    },

    clearTerminal() {
      if (this.activeTerminal) {
        const instance = this.terminalInstances.get(this.activeTerminal)
        if (instance) {
          instance.terminal.clear()
        }
      }
    },

    toggleTerminal() {
      this.isMinimized = !this.isMinimized
      
      if (!this.isMinimized) {
        this.$nextTick(() => {
          if (this.activeTerminal) {
            const instance = this.terminalInstances.get(this.activeTerminal)
            if (instance) {
              instance.fitAddon.fit()
              instance.terminal.focus()
            }
          }
        })
      }
    },

    cleanup() {
      // Dispose all terminal instances
      for (const instance of this.terminalInstances.values()) {
        instance.terminal.dispose()
      }
      this.terminalInstances.clear()
      
      // Remove socket listeners
      this.socket.off('terminal-created', this.handleTerminalCreated)
      this.socket.off('terminal-output', this.handleTerminalOutput)
      this.socket.off('terminal-closed', this.handleTerminalClosed)
      this.socket.off('terminal-exit', this.handleTerminalExit)
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