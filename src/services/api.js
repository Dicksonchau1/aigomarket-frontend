// src/services/api.js - HYBRID VERSION (Supabase + Stripe Backend)

import { supabase } from '../lib/supabase';
import axios from 'axios';

// Backend API URL
const API_URL = import.meta.env.VITE_API_URL || 'https://aigomarket-backend-production-8b8d.up.railway.app';

// Create axios instance for backend calls
const backendAPI = axios.create({
  baseURL: API_URL + '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to backend requests
backendAPI.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// ============================================
// SUPABASE DIRECT OPERATIONS
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

    console.log('📤 Uploading model:', file.name, 'Size:', (file.size / (1024 * 1024)).toFixed(2), 'MB');

    // Upload to Supabase Storage
    const fileName = `${user.id}/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('models')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Storage upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('models')
      .getPublicUrl(fileName);

    console.log('✅ File uploaded, creating database record...');

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
          type: metadata.modelType || metadata.type || 'ai-model',
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
      .maybeSingle();

    if (dbError) {
      console.error('❌ Database insert error:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    console.log('✅ Model uploaded successfully:', modelRecord.id);

    return {
      success: true,
      id: modelRecord.id,
      model: modelRecord,
      message: 'Model uploaded successfully'
    };

  } catch (error) {
    console.error('❌ Upload model error:', error);
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

    console.log('📤 Uploading file:', file.name);

    const isDataset = formData.get('dataset');
    const bucket = isDataset ? 'datasets' : 'algorithms';
    const tableName = isDataset ? 'datasets' : 'algorithms';

    const fileName = `${user.id}/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

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
      .maybeSingle();

    if (dbError) throw new Error(`Database error: ${dbError.message}`);

    return {
      success: true,
      id: record.id,
      data: record,
      message: 'Upload successful'
    };

  } catch (error) {
    console.error('❌ Upload error:', error);
    throw error;
  }
}

/**
 * Compress Model - Mock Implementation
 */
export async function compressModel(modelId, compressionLevel) {
  try {
    console.log('🗜️ Compressing model:', modelId, 'Level:', compressionLevel);
    
    await new Promise(resolve => setTimeout(resolve, 3000));

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
      download_url: '#'
    };

    console.log('✅ Compression complete:', result);
    return result;

  } catch (error) {
    console.error('❌ Compression error:', error);
    throw error;
  }
}

// ============================================
// STRIPE PAYMENT INTEGRATION (NEW)
// ============================================

/**
 * Create Stripe Checkout Session for Membership
 */
export async function createCheckoutSession(planId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Please login to continue');

    console.log('💳 Creating checkout session for plan:', planId);

    const response = await backendAPI.post('/stripe/create-checkout-session', {
      planId: planId
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to create checkout session');
    }

    return response.data;

  } catch (error) {
    console.error('❌ Checkout session error:', error);
    throw error;
  }
}

/**
 * Get Wallet Balance
 */
export async function getWalletBalance() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('token_balance, subscription_plan, subscription_status')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    return {
      balance: data.token_balance || 0,
      plan: data.subscription_plan,
      status: data.subscription_status
    };

  } catch (error) {
    console.error('❌ Get wallet balance error:', error);
    return { balance: 0, plan: null, status: null };
  }
}

/**
 * Get Transaction History
 */
export async function getTransactionHistory() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];

  } catch (error) {
    console.error('❌ Get transaction history error:', error);
    return [];
  }
}

/**
 * Connect Stripe Account (for creators)
 */
export async function connectStripeAccount() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Please login to continue');

    const response = await backendAPI.post('/stripe/connect');

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to connect Stripe account');
    }

    return response.data;

  } catch (error) {
    console.error('❌ Stripe Connect error:', error);
    throw error;
  }
}

/**
 * Check Stripe Connection Status
 */
export async function checkStripeConnection() {
  try {
    const response = await backendAPI.get('/stripe/check-connection');
    return response.data;
  } catch (error) {
    console.error('❌ Check connection error:', error);
    return { connected: false };
  }
}

/**
 * Request Payout
 */
export async function requestPayout(amount) {
  try {
    const response = await backendAPI.post('/stripe/payout', { amount });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Payout failed');
    }

    return response.data;

  } catch (error) {
    console.error('❌ Payout error:', error);
    throw error;
  }
}

// ============================================
// LEGACY COMPATIBILITY EXPORTS
// ============================================

export const api_methods = {
  getUserProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },
  getWalletBalance: getWalletBalance
};

export const paymentAPI = {
  createCheckoutSession: createCheckoutSession,
  verifyPayment: async (sessionId) => {
    // Payment verification happens automatically via webhook
    return { success: true };
  },
  getTransactionHistory: getTransactionHistory,
  connectStripeAccount: connectStripeAccount,
  checkStripeConnection: checkStripeConnection,
  requestPayout: requestPayout
};

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
  // Upload methods
  uploadModelForVerification,
  uploadDataset,
  compressModel,
  
  // Payment methods
  createCheckoutSession,
  getWalletBalance,
  getTransactionHistory,
  
  // Stripe Connect methods
  connectStripeAccount,
  checkStripeConnection,
  requestPayout,
  
  // Axios instance (for custom calls)
  backend: backendAPI
};