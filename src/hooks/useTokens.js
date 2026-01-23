// src/hooks/useTokens.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function useTokens(userId) {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  const fetchBalance = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/tokens/balance/${userId}`);
      const result = await response.json();

      if (result.success) {
        setBalance(result.data.balance || 0);
      }
    } catch (error) {
      console.error('Error fetching token balance:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchTransactions = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/tokens/transactions/${userId}?limit=10`);
      const result = await response.json();

      if (result.success) {
        setTransactions(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  }, [userId]);

  const purchaseWithTokens = async (modelId, tokenAmount) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tokens/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          modelId,
          tokenAmount
        })
      });

      const result = await response.json();

      if (result.success) {
        setBalance(result.new_balance);
        await fetchTransactions();
      }

      return result;
    } catch (error) {
      console.error('Purchase error:', error);
      return { success: false, error: error.message };
    }
  };

  const recordFreeDownload = async (modelId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tokens/free-download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          modelId
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Free download error:', error);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, [fetchBalance, fetchTransactions]);

  return {
    balance,
    loading,
    transactions,
    purchaseWithTokens,
    recordFreeDownload,
    refreshBalance: fetchBalance
  };
}