const { spawn, exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');

class CodeExecutionService {
  constructor() {
    this.executionTimeouts = new Map(); // Track running executions
    this.maxExecutionTime = 30000; // 30 seconds max execution time
    this.tempDir = path.join(os.tmpdir(), 'code-execution');
    this.initTempDirectory();
    
    // Language configurations
    this.languageConfigs = {
      javascript: {
        extension: '.js',
        command: 'node',
        args: [],
        globalSetup: 'npm install -g nodemon',
        sessionSetup: 'npm init -y && npm install'
      },
      python: {
        extension: '.py',
        command: 'python',
        args: [],
        globalSetup: 'pip install --upgrade pip',
        sessionSetup: 'pip install -r requirements.txt || echo "No requirements.txt found"'
      },
      java: {
        extension: '.java',
        command: 'javac',
        compileArgs: [],
        runCommand: 'java',
        globalSetup: 'echo "Java environment ready"',
        sessionSetup: 'echo "Java session initialized"'
      },
      cpp: {
        extension: '.cpp',
        command: 'g++',
        compileArgs: ['-o'],
        runCommand: './program',
        globalSetup: 'echo "C++ environment ready"',
        sessionSetup: 'echo "C++ session initialized"'
      },
      csharp: {
        extension: '.cs',
        command: 'dotnet',
        args: ['run'],
        globalSetup: 'dotnet --version',
        sessionSetup: 'dotnet new console --force'
      },
      php: {
        extension: '.php',
        command: 'php',
        args: [],
        globalSetup: 'php --version',
        sessionSetup: 'echo "PHP session initialized"'
      }
    };
  }

  async initTempDirectory() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create temp directory:', error);
    }
  }

  async setupGlobalEnvironment() {
    console.log('🔧 Setting up global code execution environment...');
    
    const setupPromises = Object.entries(this.languageConfigs).map(async ([language, config]) => {
      try {
        console.log(`Setting up ${language}...`);
        await this.executeCommand(config.globalSetup);
        console.log(`✅ ${language} environment ready`);
        return { language, success: true };
      } catch (error) {
        console.error(`❌ Failed to setup ${language}:`, error.message);
        return { language, success: false, error: error.message };
      }
    });

    const results = await Promise.allSettled(setupPromises);
    return results.map(result => result.value);
  }

  async setupSessionEnvironment(sessionId, language) {
    const config = this.languageConfigs[language];
    if (!config) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const sessionDir = path.join(this.tempDir, sessionId, language);
    await fs.mkdir(sessionDir, { recursive: true });

    try {
      await this.executeCommand(config.sessionSetup, sessionDir);
      console.log(`✅ ${language} session environment ready for ${sessionId}`);
      return { success: true, sessionDir };
    } catch (error) {
      console.error(`❌ Failed to setup ${language} session:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async executeCode(sessionId, language, code, input = '', filename = null) {
    const executionId = uuidv4();
    
    try {
      const config = this.languageConfigs[language];
      if (!config) {
        throw new Error(`Unsupported language: ${language}`);
      }

      // Setup session environment if not exists
      const sessionDir = path.join(this.tempDir, sessionId, language);
      await fs.mkdir(sessionDir, { recursive: true });

      // Create code file
      const codeFilename = filename || `main${config.extension}`;
      const codeFilePath = path.join(sessionDir, codeFilename);
      await fs.writeFile(codeFilePath, code);

      // Execute based on language type
      let result;
      if (language === 'java') {
        result = await this.executeJava(sessionDir, codeFilename, input, executionId);
      } else if (language === 'cpp') {
        result = await this.executeCpp(sessionDir, codeFilename, input, executionId);
      } else if (language === 'csharp') {
        result = await this.executeCSharp(sessionDir, input, executionId);
      } else {
        result = await this.executeInterpreted(sessionDir, codeFilePath, config, input, executionId);
      }

      return {
        executionId,
        success: true,
        ...result
      };

    } catch (error) {
      return {
        executionId,
        success: false,
        error: error.message,
        output: '',
        stderr: error.stderr || ''
      };
    } finally {
      // Cleanup timeout tracking
      if (this.executionTimeouts.has(executionId)) {
        clearTimeout(this.executionTimeouts.get(executionId));
        this.executionTimeouts.delete(executionId);
      }
    }
  }

  async executeInterpreted(sessionDir, filePath, config, input, executionId) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const process = spawn(config.command, [...config.args, filePath], {
        cwd: sessionDir,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      // Set execution timeout
      const timeout = setTimeout(() => {
        process.kill('SIGKILL');
        reject(new Error('Execution timeout'));
      }, this.maxExecutionTime);

      this.executionTimeouts.set(executionId, timeout);

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        clearTimeout(timeout);
        const executionTime = Date.now() - startTime;
        
        resolve({
          output: stdout,
          stderr: stderr,
          exitCode: code,
          executionTime: `${executionTime}ms`
        });
      });

      process.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });

      // Send input if provided
      if (input) {
        process.stdin.write(input);
        process.stdin.end();
      } else {
        process.stdin.end();
      }
    });
  }

  async executeJava(sessionDir, filename, input, executionId) {
    const className = path.basename(filename, '.java');
    
    // Compile
    await this.executeCommand(`javac ${filename}`, sessionDir);
    
    // Run
    return this.executeInterpreted(sessionDir, className, { command: 'java', args: [] }, input, executionId);
  }

  async executeCpp(sessionDir, filename, input, executionId) {
    const executableName = os.platform() === 'win32' ? 'program.exe' : './program';
    
    // Compile
    await this.executeCommand(`g++ ${filename} -o program`, sessionDir);
    
    // Run
    return this.executeInterpreted(sessionDir, executableName, { command: executableName, args: [] }, input, executionId);
  }

  async executeCSharp(sessionDir, input, executionId) {
    return this.executeInterpreted(sessionDir, '', { command: 'dotnet', args: ['run'] }, input, executionId);
  }

  async executeCommand(command, cwd = process.cwd()) {
    return new Promise((resolve, reject) => {
      exec(command, { cwd }, (error, stdout, stderr) => {
        if (error) {
          error.stderr = stderr;
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  }

  async cleanupSession(sessionId) {
    try {
      const sessionDir = path.join(this.tempDir, sessionId);
      await fs.rm(sessionDir, { recursive: true, force: true });
      console.log(`🧹 Cleaned up session directory: ${sessionId}`);
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  async getAvailableLanguages() {
    const languages = [];
    
    for (const [language, config] of Object.entries(this.languageConfigs)) {
      try {
        await this.executeCommand(`${config.command} --version`);
        languages.push({
          name: language,
          available: true,
          command: config.command
        });
      } catch (error) {
        languages.push({
          name: language,
          available: false,
          command: config.command,
          error: 'Not installed or not in PATH'
        });
      }
    }
    
    return languages;
  }
}

module.exports = CodeExecutionService;