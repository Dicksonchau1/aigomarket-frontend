import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const TokenContext = createContext();

export const useTokens = () => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error('useTokens must be used within TokenProvider');
  }
  return context;
};

export const TokenProvider = ({ children }) => {
  const [tokens, setTokens] = useState({
    available: 0,
    used: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch token balance
  const fetchTokens = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setTokens({ available: 0, used: 0, total: 0 });
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/tokens/balance`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setTokens(response.data);
    } catch (error) {
      console.error('Error fetching tokens:', error);
      setTokens({ available: 0, used: 0, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  // Use tokens
  const useTokensAmount = async (amount, feature) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/tokens/use`,
        { amount, feature },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update local state
      setTokens(prev => ({
        ...prev,
        available: prev.available - amount,
        used: prev.used + amount
      }));

      return response.data;
    } catch (error) {
      console.error('Error using tokens:', error);
      throw error;
    }
  };

  // Purchase tokens
  const purchaseTokens = async (amount) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/tokens/purchase`,
        { amount },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Refresh balance after purchase
      await fetchTokens();

      return response.data;
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      throw error;
    }
  };

  // Check if user has enough tokens
  const hasEnoughTokens = (required) => {
    return tokens.available >= required;
  };

  // Refresh tokens
  const refreshTokens = () => {
    fetchTokens();
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const value = {
    tokens,
    loading,
    fetchTokens,
    useTokens: useTokensAmount,
    purchaseTokens,
    hasEnoughTokens,
    refreshTokens
  };

  return (
    <TokenContext.Provider value={value}>
      {children}
    </TokenContext.Provider>
  );
};

export default TokenContext;