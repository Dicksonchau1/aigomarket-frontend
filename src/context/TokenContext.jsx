import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { database } from '../services/database';

const TokenContext = createContext({});

export const useToken = () => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error('useToken must be used within TokenProvider');
  }
  return context;
};

export const TokenProvider = ({ children }) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBalance();
    } else {
      setBalance(0);
      setLoading(false);
    }
  }, [user]);

  const loadBalance = async () => {
    try {
      const currentBalance = await database.wallet.getBalance();
      setBalance(currentBalance);
    } catch (error) {
      console.error('Failed to load balance:', error);
      setBalance(0);
    } finally {
      setLoading(false);
    }
  };

  const refreshBalance = async () => {
    await loadBalance();
  };

  const addTokens = async (amount) => {
    try {
      const newBalance = await database.wallet.updateBalance(amount, 'credit');
      setBalance(newBalance);
      return newBalance;
    } catch (error) {
      console.error('Failed to add tokens:', error);
      throw error;
    }
  };

  const deductTokens = async (amount) => {
    try {
      const newBalance = await database.wallet.updateBalance(amount, 'debit');
      setBalance(newBalance);
      return newBalance;
    } catch (error) {
      console.error('Failed to deduct tokens:', error);
      throw error;
    }
  };

  const value = {
    balance,
    loading,
    refreshBalance,
    addTokens,
    deductTokens,
  };

  return (
    <TokenContext.Provider value={value}>
      {children}
    </TokenContext.Provider>
  );
};