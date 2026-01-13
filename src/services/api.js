// src/services/api.js

import axios from 'axios';
import rateLimit from 'axios-rate-limit';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://aigomarket-backend-production-8b8d.up.railway.app/api';

// Create API instance with rate limiting
const api = rateLimit(
  axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000
  }),
  { maxRequests: 100, perMilliseconds: 60000 }
);

// Enhanced token management
const getAuthToken = () => {
  try {
    const authData = localStorage.getItem('sb-cwhthtgynavwinpbjplt-auth-token');
    if (!authData) return null;

    const parsed = JSON.parse(authData);
    if (!parsed?.access_token) return null;

    // Check token expiration
    const expiresAt = new Date(parsed.expires_at);
    if (expiresAt < new Date()) {
      localStorage.removeItem('sb-cwhthtgynavwinpbjplt-auth-token');
      return null;
    }

    return parsed.access_token;
  } catch (e) {
    console.warn('Auth token parsing failed:', e);
    return null;
  }
};

// Enhanced request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Enhanced response interceptor with retry logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle cancelled requests
    if (error.code === 'ERR_CANCELED') {
      return Promise.reject({ cancelled: true, message: 'Request cancelled' });
    }

    // Handle network errors
    if (error.code === 'ERR_NETWORK') {
      return Promise.reject({
        network: true,
        message: 'Network error. Please check your connection.'
      });
    }

    // Handle timeout
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        timeout: true,
        message: 'Request timed out. Please try again.'
      });
    }

    // Retry logic for 5xx errors
    if (error.response?.status >= 500 && !originalRequest._retry) {
      originalRequest._retry = true;
      return api(originalRequest);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('sb-cwhthtgynavwinpbjplt-auth-token');
      window.location.href = '/login';
      return Promise.reject({
        auth: true,
        message: 'Authentication required'
      });
    }

    return Promise.reject(error);
  }
);

// Enhanced API request wrapper
const apiRequest = async (method, url, data = null, config = {}) => {
  try {
    const response = await api({
      method,
      url,
      data,
      ...config,
      validateStatus: (status) => status >= 200 && status < 300
    });
    return response.data;
  } catch (error) {
    if (error.cancelled) throw error;

    const errorMessage = error.response?.data?.message
      || error.message
      || 'An unexpected error occurred';

    throw {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
      original: error
    };
  }
};

// API Methods
const api_methods = {
  // Payment Processing
  purchaseFounderPackage: async (signal) => {
    return apiRequest('POST', '/payments/founder-checkout', null, { signal });
  },

  verifyPayment: async (sessionId, signal) => {
    return apiRequest('GET', `/payments/verify/${sessionId}`, null, { signal });
  },

  // User Management
  getUserProfile: async () => {
    return apiRequest('GET', '/user/me');
  },

  updateUserSettings: async (settings) => {
    return apiRequest('PUT', '/user/settings', settings);
  },

  // Wallet Operations
  getWalletBalance: async () => {
    return apiRequest('GET', '/wallet');
  },

  requestWithdrawal: async (amount) => {
    return apiRequest('POST', '/wallet/withdraw', { amount });
  },

  // Project Management
  createProject: async (projectData) => {
    return apiRequest('POST', '/projects', projectData);
  },

  updateProject: async (projectId, projectData) => {
    return apiRequest('PUT', `/projects/${projectId}`, projectData);
  },

  deleteProject: async (projectId) => {
    return apiRequest('DELETE', `/projects/${projectId}`);
  },

  // File Uploads with progress tracking
  uploadDataset: async (formData, onProgress) => {
    return apiRequest('POST', '/datasets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress?.(percentCompleted);
      }
    });
  }
};

// Payment API for PaymentContext compatibility
const paymentAPI = {
  async createCheckoutSession(planType) {
    return api_methods.purchaseFounderPackage();
  },

  async verifyPayment(sessionId) {
    return api_methods.verifyPayment(sessionId);
  },

  async getPaymentHistory(userId) {
    return apiRequest('GET', `/payments/history/${userId}`);
  },

  async processFounderPayment(paymentData) {
    return api_methods.purchaseFounderPackage();
  },

  async getPaymentStatus(paymentId) {
    return apiRequest('GET', `/payments/status/${paymentId}`);
  },
};

// Single export statement
export { api_methods, paymentAPI };
export default api;