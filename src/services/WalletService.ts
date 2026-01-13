// src/services/WalletService.ts

import { api_methods } from './api';
import type { ApiResponse, WalletTransaction } from '../types/api.types';

class WalletService {
  private static instance: WalletService;

  private constructor() {}

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  async getBalance(): Promise<ApiResponse<number>> {
    try {
      const response = await api_methods.getWalletBalance();
      return {
        success: true,
        data: response.balance
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getTransactions(): Promise<ApiResponse<WalletTransaction[]>> {
    try {
      const response = await api_methods.getTransactionHistory();
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async requestWithdrawal(amount: number): Promise<ApiResponse> {
    try {
      await api_methods.requestWithdrawal(amount);
      return {
        success: true,
        message: 'Withdrawal request submitted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default WalletService.getInstance();