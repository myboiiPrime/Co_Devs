<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="vscode-app">
    <!-- VS Code Title Bar -->
    <div class="title-bar">
      <div class="title-bar-left">
        <div class="window-controls">
          <div class="window-control minimize"></div>
          <div class="window-control maximize"></div>
          <div class="window-control close"></div>
        </div>
        <div class="app-title">
          <span class="app-name">Collaborative IDE</span>
        </div>
      </div>
      
      <div class="title-bar-center">
        <nav class="main-nav">
          <RouterLink to="/" class="nav-item">Home</RouterLink>
          <RouterLink to="/about" class="nav-item">About</RouterLink>
        </nav>
      </div>
      
      <div class="title-bar-right">
        <div class="user-controls">
          <button class="control-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
            </svg>
          </button>
          <button class="control-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
              <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style>
/* Global VS Code Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #1e1e1e;
  color: #cccccc;
  overflow-x: hidden;
  overflow-y: auto;
}

#app {
  min-height: 100vh;
}

.vscode-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
}

/* Title Bar */
.title-bar {
  height: 30px;
  background: #3c3c3c;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  border-bottom: 1px solid #2d2d2d;
  user-select: none;
  -webkit-app-region: drag;
}

.title-bar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.window-controls {
  display: flex;
  gap: 8px;
  -webkit-app-region: no-drag;
}

.window-control {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: pointer;
}

.window-control.close {
  background: #ff5f56;
}

.window-control.minimize {
  background: #ffbd2e;
}

.window-control.maximize {
  background: #27ca3f;
}

.app-title {
  display: flex;
  align-items: center;
}

.app-name {
  font-size: 13px;
  color: #cccccc;
  font-weight: 400;
}

.title-bar-center {
  flex: 1;
  display: flex;
  justify-content: center;
  -webkit-app-region: no-drag;
}

.main-nav {
  display: flex;
  gap: 0;
}

.nav-item {
  padding: 4px 12px;
  color: #cccccc;
  text-decoration: none;
  font-size: 13px;
  border-radius: 3px;
  transition: all 0.2s ease;
  position: relative;
}

.nav-item:hover {
  background: #2d2d2d;
  color: #ffffff;
}

.nav-item.router-link-exact-active {
  color: #ffffff;
  background: #094771;
}

.nav-item.router-link-exact-active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #007acc;
}

.title-bar-right {
  display: flex;
  align-items: center;
  -webkit-app-region: no-drag;
}

.user-controls {
  display: flex;
  gap: 4px;
}

.control-btn {
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  color: #858585;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: #2d2d2d;
  color: #cccccc;
}

/* Main Content */
.main-content {
  flex: 1;
  background: #1e1e1e;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: #1e1e1e;
}

::-webkit-scrollbar-thumb {
  background: #424242;
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: #4f4f4f;
}

::-webkit-scrollbar-corner {
  background: #1e1e1e;
}

/* Selection */
::selection {
  background: #264f78;
  color: #ffffff;
}

/* Focus Outline */
button:focus,
input:focus,
textarea:focus {
  outline: 1px solid #007acc;
  outline-offset: -1px;
}

/* Responsive */
@media (max-width: 768px) {
  .title-bar-center {
    display: none;
  }
  
  .app-name {
    font-size: 12px;
  }
  
  .window-control {
    width: 10px;
    height: 10px;
  }
}
</style>
