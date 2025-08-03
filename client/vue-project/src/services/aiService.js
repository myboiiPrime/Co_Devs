import axios from 'axios';
import { apiConfig } from '@/config/api.js';

const API_BASE_URL = `${apiConfig.baseURL}/api`;

class AIService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async getCodeCompletion(code, language, cursor) {
    try {
      const response = await this.api.post('/ai/complete', {
        code,
        language,
        cursor
      });
      return response.data.suggestions;
    } catch (error) {
      console.error('Code completion error:', error);
      throw error;
    }
  }

  async explainCode(code, language) {
    try {
      const response = await this.api.post('/ai/explain', {
        code,
        language
      });
      return response.data.explanation;
    } catch (error) {
      console.error('Code explanation error:', error);
      throw error;
    }
  }

  async optimizeCode(code, language) {
    try {
      const response = await this.api.post('/ai/optimize', {
        code,
        language
      });
      return response.data.optimizations;
    } catch (error) {
      console.error('Code optimization error:', error);
      throw error;
    }
  }

  async generateCode(prompt, language) {
    try {
      const response = await this.api.post('/ai/generate', {
        prompt,
        language
      });
      return response.data.code;
    } catch (error) {
      console.error('Code generation error:', error);
      throw error;
    }
  }
}

export default new AIService();