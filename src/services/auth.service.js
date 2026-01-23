import { supabase } from '../lib/supabase';

class AuthService {
  /**
   * Get current session access token
   * @returns {Promise<string|null>} Access token or null
   */
  async getToken() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (!session) {
        // Try to refresh session
        const { data: { session: newSession }, error: refreshError } = 
          await supabase.auth.refreshSession();
        
        if (refreshError) throw refreshError;
        return newSession?.access_token || null;
      }
      
      return session.access_token;
    } catch (error) {
      console.error('??Auth token error:', error);
      return null;
    }
  }

  /**
   * Get current authenticated user
   * @returns {Promise<Object|null>} User object or null
   */
  async getUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      return user;
    } catch (error) {
      console.error('??Get user error:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   * @returns {Promise<boolean>} True if authenticated
   */
  async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  }

  /**
   * Get user profile from database
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} Profile object or null
   */
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('??Get profile error:', error);
      return null;
    }
  }

  /**
   * Get user wallet balance
   * @param {string} userId - User ID
   * @returns {Promise<number>} Wallet balance or 0
   */
  async getWalletBalance(userId) {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      
      return data?.balance || 0;
    } catch (error) {
      console.error('??Get wallet error:', error);
      return 0;
    }
  }
}

export const authService = new AuthService();
export default authService;;
