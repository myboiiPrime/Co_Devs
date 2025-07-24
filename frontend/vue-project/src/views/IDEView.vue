<template>
  <div class="ide-view">
    <CollaborationManager 
      v-if="socket"
      :sessionId="sessionId"
      :currentUsername="currentUsername"
      :socket="socket"
      :currentUserId="currentUsername"
    />
    <div v-else class="loading">
      Connecting to collaboration server...
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
      socket: null
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
      this.$router.push('/')
      return
    }

    // Create socket connection
    await this.initializeSocket()
  },
  beforeUnmount() {
    if (this.socket) {
      this.socket.disconnect()
    }
  },
  methods: {
    async initializeSocket() {
      try {
        const socketUrl = getSocketUrl()
        
        this.socket = io(socketUrl, {
          auth: {
            token: localStorage.getItem('token') || 'anonymous-token'
          },
          transports: ['websocket', 'polling']
        })

        this.socket.on('connect', () => {
          console.log('Connected to collaboration server')
        })

        this.socket.on('disconnect', () => {
          console.log('Disconnected from collaboration server')
        })

        this.socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error)
        })

      } catch (error) {
        console.error('Failed to initialize socket:', error)
        this.$router.push('/')
      }
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

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 18px;
  color: #666;
}
</style>