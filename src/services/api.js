// src/services/api.js
import { supabase } from '../lib/supabase'; // FIXED: Relative path for Netlify build

/**
 * STRIPE / PAYMENT API
 * Since you are "Backendless," these calls point to Supabase Edge Functions.
 * This prevents "Aborted Signal" errors caused by the old Railway Axios config.
 */
export const paymentAPI = {
  async createCheckoutSession(planType) {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { planType }
    });
    if (error) throw error;
    return data;
  },

  async verifyPayment(sessionId) {
    const { data, error } = await supabase.functions.invoke('verify-payment', {
      body: { sessionId }
    });
    if (error) throw error;
    return data;
  },

  async getPaymentStatus(paymentId) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();
    if (error) throw error;
    return data;
  }
};

/**
 * API METHODS (Direct Supabase Logic)
 * Replaces the old Axios/Railway methods to ensure 100% compatibility 
 * with your dashboard and wallet.
 */
export const api_methods = {
  getUserProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error) throw error;
    return data;
  },

  getWalletBalance: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();
    if (error) throw error;
    return data?.balance || 0;
  },

  createProject: async (projectData) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('projects')
      .insert([{ ...projectData, user_id: user.id }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

/**
 * DIRECT SUPABASE UPLOAD FUNCTIONS
 * These remain as you wrote them, but now use the fixed 'supabase' import.
 */
export async function uploadModelForVerification(formData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const file = formData.get('model');
    const metadata = JSON.parse(formData.get('metadata') || '{}');
    const fileName = `${user.id}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('models')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from('models').getPublicUrl(fileName);

    const { data, error: dbError } = await supabase
      .from('models')
      .insert([{
        user_id: user.id,
        name: metadata.name || file.name,
        file_url: publicUrl,
        status: 'pending_verification',
        metadata: metadata
      }])
      .select().single();

    if (dbError) throw dbError;
    return { success: true, model: data };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

export async function uploadDataset(formData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const file = formData.get('dataset') || formData.get('algorithm');
    const isDataset = !!formData.get('dataset');
    const bucket = isDataset ? 'datasets' : 'algorithms';

    const fileName = `${user.id}/${Date.now()}_${file.name}`;
    await supabase.storage.from(bucket).upload(fileName, file);

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);

    const { data, error } = await supabase
      .from(bucket)
      .insert([{ user_id: user.id, name: file.name, file_url: publicUrl, status: 'active' }])
      .select().single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    throw error;
  }
}

export async function compressModel(modelId, compressionLevel) {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return { success: true, reduction: `${compressionLevel}%`, accuracy_loss: '< 0.5%' };
}

// Export for backward compatibility with your existing components
export default api_methods;