// src/services/api.js - BACKENDLESS VERSION (No Railway, No Axios, Pure Supabase)

import { supabase } from '../lib/supabase';

// ============================================
// SUPABASE DIRECT OPERATIONS (No Backend)
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
      .single();

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
    console.log('🔄 Compressing model:', modelId, 'Level:', compressionLevel);
    
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

// Legacy exports for compatibility (will be removed later)
export const api_methods = {
  getUserProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },
  getWalletBalance: async () => {
    const { data } = await supabase.from('wallets').select('*').single();
    return data;
  }
};

export const paymentAPI = {
  createCheckoutSession: async (planType) => {
    throw new Error('Payment system not yet implemented');
  },
  verifyPayment: async (sessionId) => {
    throw new Error('Payment system not yet implemented');
  }
};

export default { uploadModelForVerification, uploadDataset, compressModel };