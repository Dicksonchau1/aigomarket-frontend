import { supabase } from '../lib/supabase';

class AuthService {
  async getToken() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (!session) {
        // Try to refresh
        const { data: { session: newSession }, error: refreshError } = 
          await supabase.auth.refreshSession();
        
        if (refreshError) throw refreshError;
        return newSession?.access_token || null;
      }
      
      return session.access_token;
    } catch (error) {
      console.error('Auth token error:', error);
      return null;
    }
  }

  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Get user error:', error);
      return null;
    }
    return user;
  }

  async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  }
}

export const authService = new AuthService();