<template>
  <div class="ide-view">
    <CollaborationManager 
      v-if="socket && socketConnected"
      :sessionId="sessionId"
      :currentUsername="currentUsername"
      :socket="socket"
      :currentUserId="currentUsername"
    />
    <div v-else class="loading-container">
      <div class="loading-spinner"></div>
      <div class="loading-text">
        <h3>{{ loadingMessage }}</h3>
        <p>{{ loadingSubtext }}</p>
      </div>
      <div v-if="loadingError" class="loading-error">
        <p>{{ loadingError }}</p>
        <button @click="retryConnection" class="retry-btn">Retry</button>
        <button @click="goHome" class="home-btn">Go Home</button>
      </div>
    </div>
  </div>
</template>

<script>
import { io } from 'socket.io-client'
import CollaborationManager from '@/components/CollaborationManager.vue'
import { getSocketUrl } from '@/config/api.js'

export default {
  name: 'IDEView',
  components: {
    CollaborationManager
  },
  data() {
    return {
      socket: null,
      socketConnected: false,
      loadingMessage: 'Connecting to server...',
      loadingSubtext: 'Establishing secure connection',
      loadingError: null,
      connectionAttempts: 0,
      maxConnectionAttempts: 3
    }
  },
  computed: {
    sessionId() {
      return this.$route.query.session
    },
    currentUsername() {
      return this.$route.query.username
    }
  },
  async mounted() {
    // Validate required parameters
    if (!this.sessionId || !this.currentUsername) {
      console.error('❌ FRONTEND: Missing required parameters:', { sessionId: this.sessionId, username: this.currentUsername })
      this.$router.push('/')
      return
    }

    // Validate authentication token and username (with graceful fallback)
    const token = localStorage.getItem('token')
    if (!token) {
      console.warn('⚠️ FRONTEND: No authentication token found, proceeding with limited validation')
    } else {
      try {
        // Try to validate username against authenticated user
        const response = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const result = await response.json()
          const userData = result.user
          
          // Check if URL username matches authenticated user
          if (userData.username !== this.currentUsername) {
            console.error('❌ FRONTEND: Username mismatch - URL username does not match authenticated user', {
              urlUsername: this.currentUsername,
              authenticatedUsername: userData.username
            })
            
            // Show warning but allow backend to handle final validation
            const proceed = confirm(`Warning: You are trying to join as "${this.currentUsername}" but you are authenticated as "${userData.username}". This may indicate unauthorized access. Do you want to continue? (The server will perform additional validation)`)
            
            if (!proceed) {
              this.$router.push('/')
              return
            }
          } else {
            console.log('✅ FRONTEND: Username validation passed:', { 
              sessionId: this.sessionId, 
              username: this.currentUsername,
              authenticatedUser: userData.username
            })
          }
        } else {
          console.warn('⚠️ FRONTEND: Could not validate token, letting backend handle validation')
        }

      } catch (error) {
        console.warn('⚠️ FRONTEND: Token validation error, proceeding with backend validation:', error.message)
        // Don't block access - let the backend handle validation
      }
    }

    console.log('🐛 FRONTEND: IDEView mounted with params:', { sessionId: this.sessionId, username: this.currentUsername })

    // Create socket connection
    await this.initializeSocket()
  },
  beforeUnmount() {
    console.log('🐛 FRONTEND: IDEView unmounting, cleaning up socket')
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  },
  methods: {
    // Simple JWT decoder (without verification - just for reading payload)
    decodeJWT(token) {
      try {
        const parts = token.split('.')
        if (parts.length !== 3) {
          return null
        }
        
        const payload = parts[1]
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
        return JSON.parse(decoded)
      } catch (error) {
        console.error('JWT decode error:', error)
        return null
      }
    },

    async initializeSocket() {
      try {
        this.connectionAttempts++
        
        if (this.connectionAttempts > this.maxConnectionAttempts) {
          this.loadingError = 'Maximum connection attempts reached. Please try again later.'
          return
        }

        const socketUrl = getSocketUrl()
        const token = localStorage.getItem('token')
        
        console.log('🐛 FRONTEND: Initializing socket connection (attempt', this.connectionAttempts, ')')
        console.log('🐛 FRONTEND: Socket URL:', socketUrl)
        console.log('🐛 FRONTEND: Token available:', token ? 'Yes' : 'No')
        console.log('🐛 FRONTEND: Session ID:', this.sessionId)
        console.log('🐛 FRONTEND: Username:', this.currentUsername)
        
        // Clean up existing socket if any
        if (this.socket) {
          console.log('🐛 FRONTEND: Cleaning up existing socket')
          this.socket.disconnect()
          this.socket = null
        }

        this.socket = io(socketUrl, {
          auth: {
            token: token || 'anonymous-token'
          },
          transports: ['websocket', 'polling'],
          forceNew: true, // Force a new connection
          reconnection: true,
          reconnectionAttempts: 3,
          reconnectionDelay: 1000
        })

        // Set up socket event listeners
        this.socket.on('connect', () => {
          console.log('✅ FRONTEND: Connected to collaboration server')
          console.log('🐛 FRONTEND: Socket ID:', this.socket.id)
          console.log('🐛 FRONTEND: Socket connected:', this.socket.connected)
          
          this.socketConnected = true
          this.loadingMessage = 'Connected!'
          this.loadingSubtext = 'Loading collaborative workspace...'
          this.loadingError = null
          
          // Test socket communication immediately
          console.log('🧪 FRONTEND: Testing socket communication...')
          this.socket.emit('test-event', { 
            message: 'Frontend test from IDEView', 
            timestamp: Date.now(),
            sessionId: this.sessionId,
            username: this.currentUsername
          })
        })

        this.socket.on('disconnect', (reason) => {
          console.log('🔌 FRONTEND: Disconnected from collaboration server, reason:', reason)
          this.socketConnected = false
          this.loadingMessage = 'Connection lost'
          this.loadingSubtext = 'Attempting to reconnect...'
        })

        this.socket.on('connect_error', (error) => {
          console.error('❌ FRONTEND: Socket connection error:', error)
          this.socketConnected = false
          this.loadingError = 'Failed to connect to collaboration server. Please check your internet connection.'
        })

        this.socket.on('test-response', (data) => {
          console.log('🧪 FRONTEND: Received test response from backend:', data)
        })

        this.socket.on('error', (error) => {
          console.error('❌ FRONTEND: Socket error:', error)
          this.loadingError = `Socket error: ${error.message || error}`
        })

        this.socket.on('join-error', (data) => {
          console.error('❌ FRONTEND: Session join error:', data)
          this.loadingError = data.error || 'Failed to join session. Access denied.'
          this.socketConnected = false
        })

        // Set a timeout for socket connection
        setTimeout(() => {
          if (!this.socket || !this.socket.connected) {
            console.error('❌ FRONTEND: Socket connection timeout')
            this.loadingError = 'Connection timeout. Please try again.'
          }
        }, 10000) // 10 second timeout for connection

      } catch (error) {
        console.error('❌ FRONTEND: Failed to initialize socket:', error)
        this.loadingError = 'Failed to initialize connection. Please try again.'
      }
    },

    retryConnection() {
      console.log('🔄 FRONTEND: Retrying connection...')
      this.loadingError = null
      this.loadingMessage = 'Retrying connection...'
      this.loadingSubtext = 'Please wait'
      this.socketConnected = false
      
      if (this.socket) {
        this.socket.disconnect()
        this.socket = null
      }
      
      setTimeout(() => {
        this.initializeSocket()
      }, 1000)
    },

    goHome() {
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.ide-view {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #1e1e1e;
  color: #fff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #333;
  border-top: 3px solid #007acc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  text-align: center;
  margin-bottom: 20px;
}

.loading-text h3 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #007acc;
}

.loading-text p {
  margin: 0;
  font-size: 16px;
  color: #ccc;
}

.loading-error {
  text-align: center;
  margin-top: 20px;
  padding: 20px;
  background: #2d1b1b;
  border: 1px solid #d73a49;
  border-radius: 8px;
  max-width: 400px;
}

.loading-error p {
  color: #f85149;
  margin-bottom: 15px;
}

.retry-btn, .home-btn {
  margin: 0 10px;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.retry-btn {
  background: #007acc;
  color: white;
}

.retry-btn:hover {
  background: #005a9e;
}

.home-btn {
  background: #6c757d;
  color: white;
}

.home-btn:hover {
  background: #545b62;
}
</style>