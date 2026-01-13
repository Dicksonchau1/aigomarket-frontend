// src/types/api.types.ts

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaymentSession {
  id: string;
  checkout_url: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface UserProfile {
  id: string;
  email: string;
  is_founder: boolean;
  tokens_balance: number;
  created_at: string;
  founder_activated_at?: string;
}

export interface WalletTransaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  metadata?: Record<string, any>;
}