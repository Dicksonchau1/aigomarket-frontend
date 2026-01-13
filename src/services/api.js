// src/services/api.js

import axios from 'axios';
import rateLimit from 'axios-rate-limit';
import { supabase } from '../lib/supabase';

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

// API Methods (Railway Backend)
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

// ============================================
// SUPABASE UPLOAD FUNCTIONS (Direct - No Railway)
// ============================================

/**
 * Upload Model for Verification - Direct Supabase
 */
export async function uploadModelForVerification(formData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const metadataString = formData.get('metadata');
    const metadata = metadataString ? JSON.parse(metadataString) : {};
    const file = formData.get('model');

    if (!file) throw new Error('No model file provided');

    console.log('Uploading model:', file.name, 'Size:', (file.size / (1024 * 1024)).toFixed(2), 'MB');

    // Upload to Supabase Storage
    const fileName = `${user.id}/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('models')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('models')
      .getPublicUrl(fileName);

    console.log('File uploaded successfully, creating database record...');

    // Create database record
    const { data: modelRecord, error: dbError } = await supabase
      .from('models')
      .insert([
        {
          user_id: user.id,
          name: metadata.name || file.name,
          description: metadata.description || '',
          category: metadata.category || 'other',
          subcategory: metadata.subcategory,
          price: metadata.price || 0,
          license: metadata.license || 'MIT',
          tags: metadata.tags || [],
          version: metadata.version || '1.0.0',
          framework: metadata.framework,
          model_type: metadata.modelType,
          accuracy: metadata.accuracy,
          file_url: publicUrl,
          file_size: file.size,
          file_name: file.name,
          status: 'pending_verification',
          downloads: 0,
          rating: 0,
          metadata: metadata
        }
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    console.log('Model uploaded successfully:', modelRecord.id);

    return {
      success: true,
      id: modelRecord.id,
      model: modelRecord,
      message: 'Model uploaded successfully'
    };

  } catch (error) {
    console.error('Upload model error:', error);
    throw error;
  }
}

/**
 * Upload Dataset - Direct Supabase
 */
export async function uploadDataset(formData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const metadataString = formData.get('metadata');
    const metadata = metadataString ? JSON.parse(metadataString) : {};
    const file = formData.get('dataset') || formData.get('algorithm');

    if (!file) throw new Error('No file provided');

    console.log('Uploading file:', file.name, 'Size:', (file.size / (1024 * 1024)).toFixed(2), 'MB');

    // Determine bucket and table
    const isDataset = formData.get('dataset');
    const bucket = isDataset ? 'datasets' : 'algorithms';
    const tableName = isDataset ? 'datasets' : 'algorithms';

    // Upload to Supabase Storage
    const fileName = `${user.id}/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    console.log('File uploaded successfully, creating database record...');

    // Create database record
    const { data: record, error: dbError } = await supabase
      .from(tableName)
      .insert([
        {
          user_id: user.id,
          name: metadata.name || file.name,
          description: metadata.description || '',
          category: metadata.category || 'other',
          subcategory: metadata.subcategory,
          price: metadata.price || 0,
          license: metadata.license || 'MIT',
          tags: metadata.tags || [],
          file_url: publicUrl,
          file_size: file.size,
          file_name: file.name,
          status: 'active',
          downloads: 0,
          rating: 0,
          metadata: metadata
        }
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    console.log('Upload successful:', record.id);

    return {
      success: true,
      id: record.id,
      data: record,
      message: 'Upload successful'
    };

  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

/**
 * Compress Model - Mock for now (will be replaced with actual service)
 */
export async function compressModel(modelId, compressionLevel) {
  try {
    console.log('Compressing model:', modelId, 'Level:', compressionLevel);
    
    // Simulate compression delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock response
    const result = {
      success: true,
      original_size: '45.2 MB',
      compressed_size: `${(45.2 * (1 - compressionLevel / 100)).toFixed(1)} MB`,
      reduction: `${compressionLevel}%`,
      accuracy_loss: '< 0.5%',
      compression_time: '3.2s',
      original_accuracy: '94.8',
      compressed_accuracy: '94.3',
      techniques: ['Quantization', 'Pruning', 'Knowledge Distillation'].slice(0, Math.ceil(compressionLevel / 30)),
      download_url: '#' // Mock URL
    };

    console.log('Compression result:', result);
    return result;

  } catch (error) {
    console.error('Compression error:', error);
    throw error;
  }
}

// Export everything
export { api_methods, paymentAPI };
export default api;