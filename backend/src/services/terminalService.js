const { spawn } = require('child_process');
const os = require('os');
const path = require('path');

class TerminalService {
  constructor() {
    this.terminals = new Map(); // sessionId -> Map(terminalId -> terminal)
    this.terminalSockets = new Map(); // terminalId -> Set of sockets
    this.terminalHistory = new Map(); // terminalId -> command history
  }

  createTerminal(sessionId, terminalId, shellType, workspaceDir, socket) {
    // Ensure session map exists
    if (!this.terminals.has(sessionId)) {
      this.terminals.set(sessionId, new Map());
    }

    const sessionTerminals = this.terminals.get(sessionId);
    
    // Don't create if already exists, just add socket
    if (sessionTerminals.has(terminalId)) {
      this.addSocketToTerminal(terminalId, socket);
      return sessionTerminals.get(terminalId);
    }

    // Determine shell command
    const shellCommand = this.getShellCommand(shellType);
    
    console.log(`🖥️ Creating terminal: ${terminalId} with ${shellType} in ${workspaceDir}`);
    
    try {
      // Create terminal process
      const terminal = spawn(shellCommand.command, shellCommand.args, {
        cwd: workspaceDir,
        env: {
          ...process.env,
          TERM: 'xterm-color',
          COLORTERM: 'truecolor'
        },
        stdio: ['pipe', 'pipe', 'pipe']
      });

      // Store terminal info
      const terminalInfo = {
        process: terminal,
        id: terminalId,
        shellType,
        workspaceDir,
        isActive: true
      };

      sessionTerminals.set(terminalId, terminalInfo);
      this.addSocketToTerminal(terminalId, socket);
      this.terminalHistory.set(terminalId, []);

      // Handle stdout
      terminal.stdout.on('data', (data) => {
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

  writeToTerminal(sessionId, terminalId, data) {
    const sessionTerminals = this.terminals.get(sessionId);
    if (sessionTerminals && sessionTerminals.has(terminalId)) {
      const terminalInfo = sessionTerminals.get(terminalId);
      if (terminalInfo.isActive && terminalInfo.process.stdin.writable) {
        terminalInfo.process.stdin.write(data);
        
        // Store command in history if it's a complete command
        if (data.includes('\r') || data.includes('\n')) {
          const history = this.terminalHistory.get(terminalId) || [];
          const command = data.trim();
          if (command && !command.startsWith('\x1b')) { // Ignore escape sequences
            history.push({
              command,
              timestamp: new Date()
            });
            // Keep only last 100 commands
            if (history.length > 100) {
              history.shift();
            }
            this.terminalHistory.set(terminalId, history);
          }
        }
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

  removeTerminal(sessionId, terminalId) {
    const sessionTerminals = this.terminals.get(sessionId);
    if (sessionTerminals && sessionTerminals.has(terminalId)) {
      const terminalInfo = sessionTerminals.get(terminalId);
      
      // Kill the process
      if (terminalInfo.process && !terminalInfo.process.killed) {
        terminalInfo.process.kill('SIGTERM');
      }
      
      sessionTerminals.delete(terminalId);
      this.terminalSockets.delete(terminalId);
      this.terminalHistory.delete(terminalId);
      
      // Clean up session if no terminals left
      if (sessionTerminals.size === 0) {
        this.terminals.delete(sessionId);
      }
    }
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

  // Execute a single command (alternative to interactive terminal)
  async executeCommand(sessionId, command, workspaceDir) {
    return new Promise((resolve, reject) => {
      const platform = os.platform();
      const shellCommand = platform === 'win32' ? 'cmd.exe' : 'bash';
      const shellArgs = platform === 'win32' ? ['/c', command] : ['-c', command];

      const process = spawn(shellCommand, shellArgs, {
        cwd: workspaceDir,
        env: process.env
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('exit', (exitCode) => {
        resolve({
          exitCode,
          stdout,
          stderr,
          command
        });
      });

      process.on('error', (error) => {
        reject(error);
      });

      // Set timeout to prevent hanging
      setTimeout(() => {
        if (!process.killed) {
          process.kill('SIGTERM');
          reject(new Error('Command execution timeout'));
        }
      }, 30000); // 30 second timeout
    });
  }
}

module.exports = new TerminalService();