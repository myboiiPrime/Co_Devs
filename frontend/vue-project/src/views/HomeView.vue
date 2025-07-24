<template>
  <main class="desktop-website">
    <!-- Navigation Header -->
    <nav class="main-nav">
      <div class="nav-container">
        <div class="nav-brand">
          <h2 @click="goToHome" class="clickable-brand">Co-Devs</h2>
        </div>
        <div class="nav-links">
          <a href="#features" class="nav-link">Features</a>
          <a href="#demo" class="nav-link">Demo</a>
          <button @click="joinSession" class="btn btn-outline-nav">Join Session</button>
          <button @click="startCollaboration" class="btn btn-primary-nav">Get Started</button>
        </div>
      </div>
    </nav>

    <!-- Hero Section - Desktop Layout -->
    <section class="hero-desktop">
      <div class="hero-grid">
        <!-- Left Side - Content (40%) -->
        <div class="hero-text">
          <h1 class="hero-heading">
            The Future of 
            <span class="text-gradient">Collaborative Development</span>
          </h1>
          <p class="hero-subtext">
            Build, code, and collaborate in real-time with your team. 
            Our powerful IDE brings VS Code's familiar interface to the web 
            with seamless collaboration features.
          </p>

          <div class="hero-cta">
            <button @click="startCollaboration" class="btn btn-primary-large">
              <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
              </svg>
              Start Coding Together
            </button>
            <button @click="scrollToFeatures" class="btn btn-secondary-large">
              <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
              </svg>
              Learn More
            </button>
          </div>
        </div>

        <!-- Right Side - IDE Preview (60%) -->
        <div class="hero-visual">
          <div class="ide-window">
            <div class="window-header">
              <div class="window-controls">
                <span class="control close"></span>
                <span class="control minimize"></span>
                <span class="control maximize"></span>
              </div>
              <div class="window-title">Co-Devs - main.js</div>
              <div class="window-actions">
                <span class="live-indicator">● Live</span>
              </div>
            </div>
            
            <div class="ide-interface">
              <!-- Activity Bar -->
              <div class="activity-bar">
                <div class="activity-icon active">📁</div>
                <div class="activity-icon">🔍</div>
                <div class="activity-icon">🔧</div>
                <div class="activity-icon">👥</div>
              </div>
              
              <!-- Sidebar -->
              <div class="sidebar">
                <div class="sidebar-header">EXPLORER</div>
                <div class="file-tree">
                  <div class="file-item folder">📁 src</div>
                  <div class="file-item file active">📄 main.js</div>
                  <div class="file-item file">📄 utils.js</div>
                  <div class="file-item file">📄 config.json</div>
                </div>
              </div>
              
              <!-- Editor Area -->
              <div class="editor-area">
                <div class="editor-tabs">
                  <div class="tab active">main.js ×</div>
                  <div class="tab">utils.js ×</div>
                </div>
                <div class="code-editor">
                  <div class="code-line">
                    <span class="line-num">1</span>
                    <span class="code">import { createApp } from 'vue'</span>
                  </div>
                  <div class="code-line">
                    <span class="line-num">2</span>
                    <span class="code">import App from './App.vue'</span>
                  </div>
                  <div class="code-line">
                    <span class="line-num">3</span>
                    <span class="code"></span>
                  </div>
                  <div class="code-line">
                    <span class="line-num">4</span>
                    <span class="code">const app = createApp(App)</span>
                    <span class="cursor-indicator">|</span>
                  </div>
                  <div class="code-line">
                    <span class="line-num">5</span>
                    <span class="code">app.mount('#app')</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Status Bar -->
            <div class="status-bar">
              <div class="status-left">
                <span class="status-item">● Connected</span>
                <span class="status-item">3 collaborators</span>
              </div>
              <div class="status-right">
                <span class="status-item">JavaScript</span>
                <span class="status-item">UTF-8</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section - Desktop Grid -->
    <section id="features" class="features-desktop">
      <div class="features-wrapper">
        <div class="section-header">
          <h2 class="section-title">Everything You Need for Team Development</h2>
          <p class="section-subtitle">
            Powerful features designed for modern development teams
          </p>
        </div>
        
        <div class="features-grid-desktop">
          <div class="feature-large">
            <div class="feature-content">
              <h3>Real-Time Collaboration</h3>
              <p>See your teammates' cursors, edits, and selections in real-time. No more merge conflicts or version control headaches.</p>
              <ul class="feature-list">
                <li>Live cursor tracking</li>
                <li>Instant synchronization</li>
                <li>Conflict-free editing</li>
                <li>User presence indicators</li>
              </ul>
            </div>
            <div class="feature-visual">
              <div class="collaboration-demo">
              </div>
            </div>
          </div>

          <div class="feature-row">
            <div class="feature-card">
              <div class="feature-icon">💻</div>
              <h4>Integrated Terminal</h4>
              <p>Full-featured terminal with support for multiple shells and command execution.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📁</div>
              <h4>File Management</h4>
              <p>Complete file explorer with drag-and-drop, search, and project organization.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🔒</div>
              <h4>Secure Sessions</h4>
              <p>Enterprise-grade security with encrypted connections and access controls.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Demo Section -->
    <section id="demo" class="demo-desktop">
      <div class="demo-wrapper">
        <div class="section-header">
          <h2 class="section-title">See Co-Devs in Action</h2>
          <p class="section-subtitle">
            Watch how teams collaborate seamlessly in real-time
          </p>
        </div>
        
        <div class="demo-content">
          <div class="demo-video">
            <div class="video-placeholder">
              <div class="play-button" @click="playDemo">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <div class="video-overlay">
                <h3>Live Collaboration Demo</h3>
                <p>3:42 minutes</p>
              </div>
            </div>
          </div>
          <div class="demo-features">
            <h3>What you'll see:</h3>
            <ul class="demo-list">
              <li>Real-time code editing with multiple users</li>
              <li>Live cursor tracking and user presence</li>
              <li>Integrated terminal collaboration</li>
              <li>File sharing and project management</li>
              <li>Voice chat integration</li>
            </ul>
            <button @click="startCollaboration" class="btn btn-primary-large demo-cta">
              Try It Yourself
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-desktop">
      <div class="cta-content">
        <h2>Ready to Transform Your Development Workflow?</h2>
        <p>Join thousands of developers who are building better software together.</p>
        <div class="cta-buttons">
          <button @click="startCollaboration" class="btn btn-primary-xl">
            Start Free Trial
          </button>
          <button @click="joinSession" class="btn btn-outline-xl">
            Join Existing Session
          </button>
        </div>
      </div>
    </section>

    <!-- Session Join Modal -->
    <div v-if="showJoinModal" class="modal-overlay" @click="closeModal">
      <div class="modal-desktop" @click.stop>
        <div class="modal-header">
          <h3>Join Collaboration Session</h3>
          <button @click="closeModal" class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          <div class="input-group">
            <label for="sessionId">Session ID</label>
            <input 
              v-model="joinSessionId" 
              type="text" 
              id="sessionId" 
              placeholder="Enter session ID (e.g., f3d18d9d-a64c-4bba-aa3d-3844a43fde29)"
              class="modal-input"
              :disabled="isLoading"
            >
          </div>
          <div class="input-group">
            <label for="username">Your Username</label>
            <input 
              v-model="username" 
              type="text" 
              id="username" 
              placeholder="Enter your username"
              class="modal-input"
              :disabled="isLoading"
            >
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="btn btn-secondary" :disabled="isLoading">Cancel</button>
          <button @click="joinSessionWithId" class="btn btn-primary" :disabled="isLoading">
            {{ isLoading ? 'Joining...' : 'Join Session' }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiConfig, buildApiUrl } from '@/config/api.js'

const router = useRouter()
const showJoinModal = ref(false)
const joinSessionId = ref('')
const username = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

const startCollaboration = () => {
  const sessionId = 'session-' + Math.random().toString(36).substr(2, 9)
  router.push({ name: 'ide', query: { session: sessionId } })
}

const joinSession = () => {
  showJoinModal.value = true
  errorMessage.value = ''
}

const joinSessionWithId = async () => {
  if (!joinSessionId.value.trim()) {
    errorMessage.value = 'Please enter a session ID'
    return
  }
  
  if (!username.value.trim()) {
    errorMessage.value = 'Please enter your username'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    // First, get session info to verify it exists
    const infoResponse = await fetch(buildApiUrl(`/api/collaboration/${joinSessionId.value.trim()}/info`))
    
    if (!infoResponse.ok) {
      throw new Error('Session not found')
    }

    const sessionInfo = await infoResponse.json()

    // Try to join the session with username
    const joinResponse = await fetch(buildApiUrl(`/api/collaboration/${joinSessionId.value.trim()}/join-simple`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.value.trim()
      })
    })

    const result = await joinResponse.json()

    if (!joinResponse.ok) {
      if (joinResponse.status === 403) {
        errorMessage.value = `Access denied. You are not authorized to join this session. Owner: ${sessionInfo.owner}`
        return
      }
      throw new Error(result.error || 'Failed to join session')
    }

    // Successfully joined, navigate to IDE
    router.push({ 
      name: 'ide', 
      query: { 
        session: joinSessionId.value.trim(),
        username: username.value.trim()
      } 
    })
    
    closeModal()
  } catch (error) {
    console.error('Join session error:', error)
    errorMessage.value = error.message || 'Failed to join session. Please check the session ID and try again.'
  } finally {
    isLoading.value = false
  }
}

const closeModal = () => {
  showJoinModal.value = false
  joinSessionId.value = ''
  username.value = ''
  errorMessage.value = ''
  isLoading.value = false
}

const goToHome = () => {
  // If we're already on home page, just scroll to top
  if (router.currentRoute.value.name === 'home' || router.currentRoute.value.path === '/') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    router.push('/')
  }
}

const scrollToFeatures = () => {
  document.getElementById('features').scrollIntoView({ behavior: 'smooth' })
}

const playDemo = () => {
  // For now, just start a collaboration session as demo
  startCollaboration()
}
</script>

<style scoped>
/* Desktop Website Styles */
.desktop-website {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
  overflow-x: hidden;
  scroll-behavior: smooth;
}

/* Add smooth scrolling to the entire page */
html {
  scroll-behavior: smooth;
}

/* Navigation */
.main-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e1e5e9;
  z-index: 100;
  padding: 0;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand h2 {
  margin: 0;
  color: #2563eb;
  font-weight: 700;
}

.clickable-brand {
  cursor: pointer;
  transition: color 0.3s ease;
}

.clickable-brand:hover {
  color: #1d4ed8;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: #64748b;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #2563eb;
}

/* Hero Section - Desktop Layout */
.hero-desktop {
  margin-top: 80px;
  padding: 4rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 90vh;
  display: flex;
  align-items: center;
}

.hero-grid {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 4rem;
  align-items: center;
}

.hero-text {
  color: white;
}

.hero-heading {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
}

.text-gradient {
  background: linear-gradient(45deg, #fbbf24, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtext {
  font-size: 1.25rem;
  line-height: 1.6;
  margin-bottom: 3rem;
  opacity: 0.9;
}

.hero-cta {
  display: flex;
  gap: 1rem;
}

/* IDE Preview */
.hero-visual {
  display: flex;
  justify-content: center;
}

.ide-window {
  background: #1e1e1e;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 700px;
}

.window-header {
  background: #2d2d30;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.window-controls {
  display: flex;
  gap: 0.5rem;
}

.control {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.control.close { background: #ff5f56; }
.control.minimize { background: #ffbd2e; }
.control.maximize { background: #27ca3f; }

.window-title {
  color: #cccccc;
  font-size: 0.9rem;
  font-weight: 500;
}

.live-indicator {
  color: #27ca3f;
  font-size: 0.8rem;
  font-weight: 600;
}

.ide-interface {
  display: flex;
  height: 400px;
}

.activity-bar {
  background: #333333;
  width: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0;
  gap: 1rem;
}

.activity-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.activity-icon.active {
  background: #007acc;
}

.sidebar {
  background: #252526;
  width: 200px;
  padding: 1rem;
}

.sidebar-header {
  color: #cccccc;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.file-tree {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.file-item {
  color: #cccccc;
  font-size: 0.9rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.file-item.active {
  background: #37373d;
  color: white;
}

.editor-area {
  flex: 1;
  background: #1e1e1e;
  display: flex;
  flex-direction: column;
}

.editor-tabs {
  background: #2d2d30;
  display: flex;
  padding: 0 1rem;
}

.tab {
  background: #2d2d30;
  color: #969696;
  padding: 0.75rem 1rem;
  border-radius: 4px 4px 0 0;
  font-size: 0.9rem;
  cursor: pointer;
}

.tab.active {
  background: #1e1e1e;
  color: white;
}

.code-editor {
  flex: 1;
  padding: 1rem;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  overflow-y: auto;
}

.code-line {
  display: flex;
  margin-bottom: 0.5rem;
  position: relative;
}

.line-num {
  color: #858585;
  width: 40px;
  text-align: right;
  margin-right: 1rem;
  user-select: none;
}

.code {
  color: #d4d4d4;
}

.cursor-indicator {
  color: white;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.status-bar {
  background: #007acc;
  color: white;
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

.status-left, .status-right {
  display: flex;
  gap: 1rem;
}

/* Features Section - Desktop */
.features-desktop {
  padding: 6rem 0;
  background: #f8fafc;
  overflow-y: auto;
}

.features-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.25rem;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
}

.features-grid-desktop {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.feature-large {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  background: white;
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.feature-content h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
}

.feature-content p {
  font-size: 1.1rem;
  color: #64748b;
  margin-bottom: 1.5rem;
}

.feature-list {
  list-style: none;
  padding: 0;
}

.feature-list li {
  padding: 0.5rem 0;
  color: #475569;
  position: relative;
  padding-left: 1.5rem;
}

.feature-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #10b981;
  font-weight: bold;
}

.feature-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h4 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
}

.feature-card p {
  color: #64748b;
}

/* CTA Section */
.cta-desktop {
  padding: 6rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.cta-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

.cta-desktop h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.cta-desktop p {
  font-size: 1.25rem;
  margin-bottom: 3rem;
  opacity: 0.9;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-primary-nav {
  background: #2563eb;
  color: white;
}

.btn-primary-nav:hover {
  background: #1d4ed8;
}

.btn-outline-nav {
  background: transparent;
  color: #64748b;
  border: 2px solid #e2e8f0;
}

.btn-outline-nav:hover {
  background: #f1f5f9;
}

.btn-primary-large {
  background: #f59e0b;
  color: white;
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

.btn-primary-large:hover {
  background: #d97706;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3);
}

.btn-secondary-large {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

.btn-secondary-large:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.btn-primary-xl {
  background: #f59e0b;
  color: white;
  padding: 1.25rem 2.5rem;
  font-size: 1.2rem;
}

.btn-primary-xl:hover {
  background: #d97706;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3);
}

.btn-outline-xl {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 1.25rem 2.5rem;
  font-size: 1.2rem;
}

.btn-outline-xl:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

/* Modal - Desktop */
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

.modal-desktop {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0.5rem;
  border-radius: 4px;
}

.modal-close:hover {
  background: #f3f4f6;
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  max-height: 60vh;
}

.input-group {
  margin-bottom: 1.5rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
}

.modal-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.modal-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.modal-footer {
  padding: 1rem 2rem 2rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* Demo Section */
.demo-desktop {
  padding: 6rem 0;
  background: #f8fafc;
}

.demo-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.demo-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  margin-top: 3rem;
}

.demo-video {
  position: relative;
}

.video-placeholder {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  aspect-ratio: 16/9;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.video-placeholder:hover {
  transform: scale(1.02);
}

.play-button {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
  transition: all 0.3s ease;
  z-index: 2;
}

.play-button:hover {
  background: white;
  transform: scale(1.1);
}

.video-overlay {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  color: white;
  z-index: 1;
}

.video-overlay h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.video-overlay p {
  margin: 0;
  opacity: 0.9;
}

.demo-features h3 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #1e293b;
}

.demo-list {
  list-style: none;
  padding: 0;
  margin-bottom: 2rem;
}

.demo-list li {
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;
  position: relative;
  padding-left: 2rem;
}

.demo-list li:before {
  content: "✓";
  position: absolute;
  left: 0;
  color: #10b981;
  font-weight: bold;
}

.demo-cta {
  margin-top: 1rem;
}

.error-message {
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.modal-input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive adjustments for smaller desktops */
@media (max-width: 1200px) {
  .hero-grid {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
  
  .hero-heading {
    font-size: 3rem;
  }
  
  .feature-large {
    grid-template-columns: 1fr;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  
  .hero-grid {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .feature-row {
    grid-template-columns: 1fr;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
}
</style>