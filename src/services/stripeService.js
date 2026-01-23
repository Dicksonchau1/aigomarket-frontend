// src/services/stripeService.js - Railway Backend Integration

import axios from 'axios';
import RAILWAY_ENDPOINTS from '../config/api';
import { supabase } from '../lib/supabase';

// Create Stripe-specific axios client
const stripeClient = axios.create({
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

// Add auth token to requests
stripeClient.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

class StripeService {
  /**
   * Create Founder Package Checkout Session
   */
  static async createFounderCheckout() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        throw new Error('Authentication required');
      }

      console.log('?’³ Creating Founder checkout session via Railway...');

      const response = await stripeClient.post(RAILWAY_ENDPOINTS.STRIPE_CHECKOUT, {
        package: 'founder',
        amount: 2990, // $29.90
        included_tokens: 1000,
        userId: session.user.id,
        userEmail: session.user.email
      });

      console.log('??Checkout session created:', response.data);
      return response.data;
    } catch (error) {
      console.error('??Founder checkout error:', error);
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  /**
   * Verify Payment After Stripe Redirect
   */
  static async verifyFounderPayment(sessionId) {
    try {
      console.log('?? Verifying payment session:', sessionId);

      const response = await stripeClient.get(
        `${RAILWAY_ENDPOINTS.STRIPE_CHECKOUT}/verify/${sessionId}`
      );

      console.log('??Payment verified:', response.data);
      return response.data;
    } catch (error) {
      console.error('??Payment verification error:', error);
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  /**
   * Purchase Additional Tokens
   */
  static async purchaseTokens(amount = 1000) {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        throw new Error('Authentication required');
      }

      console.log(`?’° Purchasing ${amount} tokens via Railway...`);

      const response = await stripeClient.post(
        `${RAILWAY_ENDPOINTS.STRIPE_CHECKOUT}/tokens`,
        { 
          amount,
          userId: session.user.id,
          userEmail: session.user.email
        }
      );

      console.log('??Token purchase session created:', response.data);
      return response.data;
    } catch (error) {
      console.error('??Token purchase error:', error);
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  /**
   * Get Payment History (from Supabase)
   */
  static async getPaymentHistory() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('? ï? No user logged in');
        return [];
      }

      // Query Supabase directly for payment history
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('??Payment history error:', error);
        return [];
      }

      console.log(`??Retrieved ${data.length} payment records`);
      return data;
    } catch (error) {
      console.error('??Payment history error:', error);
      return [];
    }
  }

  /**
   * Get User's Current Token Balance (from Supabase)
   */
  static async getTokenBalance() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase
        .from('user_tokens')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      return data?.balance || 0;
    } catch (error) {
      console.error('??Get token balance error:', error);
      return 0;
    }
  }

  /**
   * Check if User is Founder Member (from Supabase)
   */
  static async isFounderMember() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('subscription_type, status')
        .eq('user_id', user.id)
        .eq('subscription_type', 'founder')
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        console.error('??Founder check error:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('??Founder check error:', error);
      return false;
    }
  }

  /**
   * Health Check - Test Railway Connection
   */
  static async testConnection() {
    try {
      const response = await axios.get(RAILWAY_ENDPOINTS.HEALTH, {
        timeout: 5000
      });
      
      console.log('??Railway backend connection OK:', response.data);
      return true;
    } catch (error) {
      console.error('??Railway backend connection failed:', error);
      return false;
    }
  }
}

export default StripeService;
