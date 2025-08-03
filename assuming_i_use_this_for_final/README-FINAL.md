# 🚀 Collaborative IDE with Code Execution

This is the vision I have for the final project of the collaborative IDE with integrated code execution capabilities.

## 🎯 Features

### ✅ Core Features
- **Real-time Collaboration**: Multiple users can edit code simultaneously
- **Multi-language Support**: JavaScript, Python, Java, C++, C#, PHP
- **Terminal Integration**: Built-in terminal for each session
- **File Management**: Create, edit, delete files and folders
- **Code Execution**: Run code directly in the browser with real-time output

### 🔧 Code Execution Engine
- **Local Execution**: Code runs on the server using installed runtimes
- **Session Isolation**: Each collaboration session gets isolated execution environment
- **Timeout Protection**: 30-second execution limit prevents runaway processes
- **Real-time Output**: Live output streaming to all session participants
- **Error Handling**: Comprehensive error reporting and debugging

## 🏗️ Architecture
Final Project Structure:
├── server/                  # Node.js Express server
│   ├── src/
│   │   ├── services/
│   │   │   ├── socketService.js      # WebSocket handling
│   │   │   ├── codeExecutionService.js  # 🆕 Code execution engine
│   │   │   └── workspaceService.js   # File operations
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   └── server.js        # Main server file
│   └── package.json
├── client/                  # Vue.js application
│   └── vue-project/
│       ├── src/
│       │   ├── components/  # Vue components
│       │   ├── views/       # Page views
│       │   └── services/    # API services
│       └── package.json
└── shared/                  # Shared utilities



## 🚀 Quick Start

### 1. Environment Setup
```bash
# Run the setup script
.\setup-final-environment.bat
```

### 2. Install Dependencies
```bash
# Server
cd server
npm install

# Client
cd client/vue-project
npm install
```

### 3. Start the Application
```bash
# Terminal 1 - Server
cd server
npm start

# Terminal 2 - Client
cd client/vue-project
npm run dev
```

### 4. Access the Application
- Client: http://localhost:5173
- Server API: http://localhost:3001

## 🔧 Code Execution Setup

### Required Runtimes
Make sure these are installed and in your PATH:

- **Node.js**: `node --version`
- **Python**: `python --version`
- **Java JDK**: `javac -version`
- **C++ Compiler**: `g++ --version` (MinGW on Windows)
- **.NET SDK**: `dotnet --version`
- **PHP**: `php --version`

### Language Configurations
Each language has specific setup requirements:

#### JavaScript
- Runtime: Node.js
- Package Manager: npm
- Session Setup: Creates package.json automatically

#### Python
- Runtime: Python 3.x
- Package Manager: pip
- Session Setup: Installs from requirements.txt if present

#### Java
- Runtime: JDK 8+
- Compilation: javac → java
- Session Setup: Automatic class compilation

#### C++
- Runtime: GCC/MinGW
- Compilation: g++ → executable
- Session Setup: Automatic compilation and linking

#### C#
- Runtime: .NET SDK
- Compilation: dotnet run
- Session Setup: Creates console project automatically

#### PHP
- Runtime: PHP 7.4+
- Execution: Direct interpretation
- Session Setup: Ready to run

## 🔒 Security Features

### Execution Safety
- **Timeout Protection**: 30-second maximum execution time
- **Process Isolation**: Each session runs in separate directories
- **Resource Limits**: Prevents system resource exhaustion
- **Access Control**: Session-based permission system

### File System Security
- **Sandboxed Execution**: Code runs in temporary directories
- **Automatic Cleanup**: Session files removed after completion
- **Path Validation**: Prevents directory traversal attacks

## 🎮 Usage Guide

### Creating a Session
1. Open the application
2. Click "Create Session"
3. Share the session ID with collaborators
4. Start coding together!

### Running Code
1. Write your code in the editor
2. Select the programming language
3. Click "Run" or press Ctrl+Enter
4. View output in the integrated terminal
5. All participants see the execution results

### Collaboration Features
- **Real-time Editing**: See changes as others type
- **Cursor Tracking**: See where others are working
- **Execution Notifications**: Get notified when others run code
- **Shared Terminal**: Everyone can see command outputs

## 🛠️ Development

### Adding New Languages
To add support for a new programming language:

1. **Update Language Config** in `codeExecutionService.js`:
```javascript
newlanguage: {
  extension: '.ext',
  command: 'runtime-command',
  args: [],
  globalSetup: 'setup command',
  sessionSetup: 'session setup command'
}
```

2. **Add Frontend Support** in Vue components
3. **Test Execution** with sample code

### Debugging
- Check browser console for client errors
- Monitor server logs for execution issues
- Use the debug scripts in `server/debug/`

## 📦 Deployment

### Local Development
- Use the provided setup scripts
- Run server and client separately
- Access via localhost

### Production Deployment
- See `DEPLOYMENT.md` for detailed instructions
- Configure environment variables
- Set up reverse proxy (nginx recommended)
- Enable HTTPS for WebSocket connections

## 🤝 Contributing

This is the final version for the course project. Key features implemented:

- ✅ Real-time collaboration
- ✅ Multi-language code execution
- ✅ Terminal integration
- ✅ File management
- ✅ Session management
- ✅ Security measures


**🎓 Final Project Status: COMPLETE**
**🚀 Ready for Demonstration and Deployment**