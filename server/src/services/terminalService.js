const { spawn } = require('child_process');
const os = require('os');
const path = require('path');

class TerminalService {
  constructor() {
    this.terminals = new Map(); // sessionId -> Map(terminalId -> terminal)
    this.terminalSockets = new Map(); // terminalId -> Set of sockets
    this.terminalHistory = new Map(); // terminalId -> command history
    
    // Render-specific configuration
    this.isRenderDeployment = process.env.RENDER_DEPLOYMENT === 'true';
    this.maxTerminalsPerSession = parseInt(process.env.MAX_TERMINALS_PER_SESSION) || (this.isRenderDeployment ? 3 : 10);
    this.terminalTimeoutMs = parseInt(process.env.TERMINAL_TIMEOUT_MS) || (this.isRenderDeployment ? 1800000 : 3600000); // 30 min on Render, 1 hour locally
    
    if (this.isRenderDeployment) {
      console.log('🚀 Running on Render - Terminal limits applied:');
      console.log(`   Max terminals per session: ${this.maxTerminalsPerSession}`);
      
      // Start cleanup interval for Render
      this.startTerminalCleanup();
    }
  }

  startTerminalCleanup() {
    // Clean up inactive terminals every 5 minutes on Render
    setInterval(() => {
      this.cleanupInactiveTerminals();
    }, 5 * 60 * 1000);
  }

  cleanupInactiveTerminals() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [sessionId, sessionTerminals] of this.terminals.entries()) {
      for (const [terminalId, terminalInfo] of sessionTerminals.entries()) {
        const lastActivity = terminalInfo.lastActivity || terminalInfo.createdAt || now;
        
        if (now - lastActivity > this.terminalTimeoutMs) {
          console.log(`🧹 Cleaning up inactive terminal: ${terminalId}`);
          this.destroyTerminal(sessionId, terminalId);
          cleanedCount++;
        }
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} inactive terminals`);
    }
  }

  createTerminal(sessionId, terminalId, shellType, workspaceDir, socket) {
    // Ensure session map exists
    if (!this.terminals.has(sessionId)) {
      this.terminals.set(sessionId, new Map());
    }

    const sessionTerminals = this.terminals.get(sessionId);
    
    // Check terminal limit per session (especially important on Render)
    if (sessionTerminals.size >= this.maxTerminalsPerSession) {
      throw new Error(`Maximum number of terminals (${this.maxTerminalsPerSession}) reached for this session`);
    }
    
    // Don't create if already exists, just add socket
    if (sessionTerminals.has(terminalId)) {
      this.addSocketToTerminal(terminalId, socket);
      return sessionTerminals.get(terminalId);
    }

    // Determine shell command (adapt for Render's Linux environment)
    const shellCommand = this.getShellCommand(shellType);
    
    console.log(`🖥️ Creating terminal: ${terminalId} with ${shellType} in ${workspaceDir}`);
    
    try {
      // Create terminal process with Render-optimized environment
      const terminal = spawn(shellCommand.command, shellCommand.args, {
        cwd: workspaceDir,
        env: {
          ...process.env,
          TERM: 'xterm-color',
          COLORTERM: 'truecolor',
          // Render-specific environment variables
          ...(this.isRenderDeployment && {
            HOME: workspaceDir,
            USER: 'render',
            SHELL: '/bin/bash'
          })
        },
        stdio: ['pipe', 'pipe', 'pipe']
      });

      // Store terminal info with timestamps for cleanup
      const terminalInfo = {
        process: terminal,
        id: terminalId,
        shellType,
        workspaceDir,
        isActive: true,
        createdAt: Date.now(),
        lastActivity: Date.now()
      };

      sessionTerminals.set(terminalId, terminalInfo);
      this.addSocketToTerminal(terminalId, socket);
      this.terminalHistory.set(terminalId, []);

      // Handle stdout
      terminal.stdout.on('data', (data) => {
        terminalInfo.lastActivity = Date.now(); // Update activity timestamp
        const output = data.toString();
        const sockets = this.terminalSockets.get(terminalId);
        if (sockets) {
          sockets.forEach(socket => {
            socket.emit('terminal-output', { terminalId, data: output });
          });
        }
      });

      // Handle stderr
      terminal.stderr.on('data', (data) => {
        terminalInfo.lastActivity = Date.now(); // Update activity timestamp
        const output = data.toString();
        const sockets = this.terminalSockets.get(terminalId);
        if (sockets) {
          sockets.forEach(socket => {
            socket.emit('terminal-output', { terminalId, data: output });
          });
        }
      });

      // Handle terminal exit
      terminal.on('exit', (exitCode) => {
        console.log(`🖥️ Terminal ${terminalId} exited with code ${exitCode}`);
        terminalInfo.isActive = false;
        
        const sockets = this.terminalSockets.get(terminalId);
        if (sockets) {
          sockets.forEach(socket => {
            socket.emit('terminal-exit', { terminalId, exitCode });
          });
        }
      });

      // Handle errors
      terminal.on('error', (error) => {
        console.error(`Terminal ${terminalId} error:`, error);
        const sockets = this.terminalSockets.get(terminalId);
        if (sockets) {
          sockets.forEach(socket => {
            socket.emit('terminal-error', { terminalId, error: error.message });
          });
        }
      });

      // Send initial commands to show working directory and session info
      setTimeout(() => {
        if (terminalInfo.isActive && terminal.stdin.writable) {
          const platform = os.platform();
          let initCommands = [];
          
          // Minimal initialization - just set working directory
          if (this.isRenderDeployment || platform === 'linux') {
            initCommands = [
              `cd "${workspaceDir}"\r\n`
            ];
          } else if (shellType === 'cmd') {
            initCommands = [
              `cd /d "${workspaceDir}"\r\n`
            ];
          } else if (shellType === 'powershell') {
            initCommands = [
              `Set-Location "${workspaceDir}"\r\n`
            ];
          } else {
            // bash, python, node
            initCommands = [
              `cd "${workspaceDir}"\r\n`
            ];
          }
          
          // Send commands quickly
          initCommands.forEach((cmd, index) => {
            setTimeout(() => {
              if (terminalInfo.isActive && terminal.stdin.writable) {
                terminal.stdin.write(cmd);
              }
            }, index * 50);
          });
        }
      }, 300); // Reduced wait time

      return terminalInfo;
    } catch (error) {
      console.error('Failed to create terminal:', error);
      throw error;
    }
  }

  addSocketToTerminal(terminalId, socket) {
    if (!this.terminalSockets.has(terminalId)) {
      this.terminalSockets.set(terminalId, new Set());
    }
    this.terminalSockets.get(terminalId).add(socket);
  }

  removeSocketFromTerminal(terminalId, socket) {
    const sockets = this.terminalSockets.get(terminalId);
    if (sockets) {
      sockets.delete(socket);
      if (sockets.size === 0) {
        this.terminalSockets.delete(terminalId);
      }
    }
  }

  getShellCommand(shellType) {
    const platform = os.platform();
    
    const shells = {
      'bash': platform === 'win32' ? 
        { command: 'bash', args: [] } : 
        { command: 'bash', args: [] },
      'cmd': { command: 'cmd.exe', args: [] },
      'powershell': { command: 'powershell.exe', args: ['-NoLogo', '-NoExit'] },
      'python': { command: 'python', args: ['-i', '-u'] },
      'node': { command: 'node', args: ['-i'] }
    };

    // Fallback to system default
    if (!shells[shellType]) {
      if (platform === 'win32') {
        return { command: 'cmd.exe', args: [] };
      } else {
        return { command: process.env.SHELL || 'bash', args: [] };
      }
    }

    return shells[shellType];
  }

  destroyTerminal(sessionId, terminalId) {
    const sessionTerminals = this.terminals.get(sessionId);
    if (sessionTerminals && sessionTerminals.has(terminalId)) {
      const terminalInfo = sessionTerminals.get(terminalId);
      
      // Kill the process
      if (terminalInfo.process && !terminalInfo.process.killed) {
        terminalInfo.process.kill('SIGTERM');
      }
      
      // Clean up maps
      sessionTerminals.delete(terminalId);
      this.terminalSockets.delete(terminalId);
      this.terminalHistory.delete(terminalId);
      
      // Remove empty session maps
      if (sessionTerminals.size === 0) {
        this.terminals.delete(sessionId);
      }
      
      console.log(`🗑️ Terminal ${terminalId} destroyed`);
    }
  }

  writeToTerminal(sessionId, terminalId, data) {
    const sessionTerminals = this.terminals.get(sessionId);
    if (sessionTerminals && sessionTerminals.has(terminalId)) {
      const terminalInfo = sessionTerminals.get(terminalId);
      if (terminalInfo.isActive && terminalInfo.process.stdin.writable) {
        terminalInfo.lastActivity = Date.now(); // Update activity timestamp
        terminalInfo.process.stdin.write(data);
      }
    }
  }

  resizeTerminal(sessionId, terminalId, cols, rows) {
    // For basic child_process, we can't resize the terminal
    // This is a limitation compared to node-pty
    console.log(`Terminal resize requested for ${terminalId}: ${cols}x${rows} (not supported with child_process)`);
  }

  getTerminalHistory(terminalId) {
    return this.terminalHistory.get(terminalId) || [];
  }

  clearTerminalHistory(terminalId) {
    this.terminalHistory.set(terminalId, []);
  }

  cleanupSession(sessionId) {
    const sessionTerminals = this.terminals.get(sessionId);
    if (sessionTerminals) {
      // Kill all terminals in the session
      for (const [terminalId, terminalInfo] of sessionTerminals) {
        if (terminalInfo.process && !terminalInfo.process.killed) {
          terminalInfo.process.kill('SIGTERM');
        }
        this.terminalSockets.delete(terminalId);
        this.terminalHistory.delete(terminalId);
      }
      this.terminals.delete(sessionId);
      console.log(`🖥️ Cleaned up all terminals for session: ${sessionId}`);
    }
  }

  getSessionTerminals(sessionId) {
    const sessionTerminals = this.terminals.get(sessionId);
    if (!sessionTerminals) return [];
    
    return Array.from(sessionTerminals.keys());
  }

  isTerminalActive(sessionId, terminalId) {
    const sessionTerminals = this.terminals.get(sessionId);
    if (!sessionTerminals) return false;
    
    const terminalInfo = sessionTerminals.get(terminalId);
    return terminalInfo && terminalInfo.isActive;
  }

  getActiveSessionsCount() {
    return this.terminals.size;
  }

  getTotalTerminalsCount() {
    let total = 0;
    for (const sessionTerminals of this.terminals.values()) {
      total += sessionTerminals.size;
    }
    return total;
  }

}

module.exports = new TerminalService();