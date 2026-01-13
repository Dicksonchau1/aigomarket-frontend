// src/services/stripeService.js

import api from './api';
import { supabase } from '../lib/supabase';

class StripeService {
  static async createFounderCheckout() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        throw new Error('Authentication required');
      }

      const response = await api.post('/payments/founder-checkout', {
        package: 'founder',
        amount: 2990, // $29.90
        included_tokens: 1000
      });

      return response.data;
    } catch (error) {
      console.error('Founder checkout error:', error);
      throw error;
    }
  }

  static async verifyFounderPayment(sessionId) {
    try {
      const response = await api.get(`/payments/verify/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

  static async purchaseTokens(amount = 1000) {
    try {
      const response = await api.post('/payments/tokens', { amount });
      return response.data;
    } catch (error) {
      console.error('Token purchase error:', error);
      throw error;
    }
  }

  static async getPaymentHistory() {
    try {
      const response = await api.get('/payments/history');
      return response.data;
    } catch (error) {
      console.error('Payment history error:', error);
      return [];
    }
  }
}

export default StripeService;