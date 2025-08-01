import axios from 'axios';
import { apiConfig } from '@/config/api.js';

const API_BASE_URL = `${apiConfig.baseURL}/api`;

class WorkspaceService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });
  }

  async getWorkspaces(username) {
    try {
      if (!username) {
        console.warn('No username provided, returning empty workspace list');
        return [];
      }

      const response = await this.api.get(`/collaboration/workspaces/${username}`);
      
      // Ensure we always return an array
      if (response.data && Array.isArray(response.data.workspaces)) {
        return response.data.workspaces;
      } else {
        console.warn('Invalid response format, returning empty array');
        return [];
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      
      // Return empty array instead of throwing error to prevent UI crashes
      if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
        console.warn('Backend server not reachable, returning empty workspace list');
        return [];
      }
      
      if (error.response?.status === 404) {
        console.warn('User not found, returning empty workspace list');
        return [];
      }
      
      // For other errors, return empty array to prevent crashes
      return [];
    }
  }

  async createWorkspace(workspaceData) {
    try {
      if (!workspaceData || !workspaceData.username || !workspaceData.sessionName) {
        throw new Error('Invalid workspace data provided');
      }

      const response = await this.api.post('/collaboration/create', workspaceData);
      
      if (response.data && response.data.sessionId) {
        return response.data;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error creating workspace:', error);
      
      // Provide more specific error messages
      if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }
      
      if (error.response?.status === 400) {
        throw new Error('Invalid workspace data provided');
      }
      
      if (error.response?.status === 500) {
        throw new Error('Server error occurred while creating workspace');
      }
      
      throw new Error(error.message || 'Failed to create workspace');
    }
  }

  async deleteWorkspace(sessionId, username) {
    try {
      if (!sessionId || !username) {
        throw new Error('Session ID and username are required');
      }

      const response = await this.api.delete(`/collaboration/workspaces/${sessionId}/${username}`);
      
      if (response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error deleting workspace:', error);
      
      // Provide more specific error messages
      if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }
      
      if (error.response?.status === 403) {
        throw new Error('Only the workspace owner can delete this workspace');
      }
      
      if (error.response?.status === 404) {
        throw new Error('Workspace not found');
      }
      
      if (error.response?.status === 500) {
        throw new Error('Server error occurred while deleting workspace');
      }
      
      throw new Error(error.message || 'Failed to delete workspace');
    }
  }
}

export default new WorkspaceService();