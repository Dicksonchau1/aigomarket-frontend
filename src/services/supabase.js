import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to upload files to Supabase Storage
export const uploadToSupabase = async (bucket, filePath, file, options = {}) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        ...options
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      success: true,
      path: data.path,
      url: urlData.publicUrl
    };
  } catch (error) {
    console.error('Supabase upload error:', error);
    throw error;
  }
};

// Helper function to download files from Supabase Storage
export const downloadFromSupabase = async (bucket, filePath) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(filePath);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Supabase download error:', error);
    throw error;
  }
};

// Helper function to delete files from Supabase Storage
export const deleteFromSupabase = async (bucket, filePaths) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove(filePaths);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Supabase delete error:', error);
    throw error;
  }
};

// Helper function to list files in a bucket
export const listSupabaseFiles = async (bucket, path = '') => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Supabase list error:', error);
    throw error;
  }
};

export default supabase;