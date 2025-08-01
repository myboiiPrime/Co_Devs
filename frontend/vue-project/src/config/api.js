// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    collaboration: {
      joinSimple: '/api/collaboration/join-simple',
      addUser: (sessionId) => `/api/collaboration/${sessionId}/add-user`,
      getSession: (sessionId) => `/api/collaboration/${sessionId}`,
      updateFile: (sessionId) => `/api/collaboration/${sessionId}/files`,

      getFiles: (sessionId) => `/api/collaboration/${sessionId}/files`,
      createFile: (sessionId) => `/api/collaboration/${sessionId}/files/create`,
      deleteFile: (sessionId) => `/api/collaboration/${sessionId}/files/delete`,
      renameFile: (sessionId) => `/api/collaboration/${sessionId}/files/rename`
    },
    ai: {
      chat: '/api/ai/chat'
    }
  }
}

// Helper function to build full URL
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`
}

// Helper function for WebSocket connection
export const getSocketUrl = () => {
  return API_BASE_URL
}

export default apiConfig