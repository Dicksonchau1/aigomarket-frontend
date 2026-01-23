import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const TokenContext = createContext({});

export const useTokens = () => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error('useTokens must be used within TokenProvider');
  }
  return context;
};

export const TokenProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadBalance = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        setBalance(0);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', currentUser.id)
        .maybeSingle();  // Use maybeSingle instead of single

      if (error) {
        console.error('Failed to load balance:', error);
        
        // If wallet doesn't exist (PGRST116 = no rows), create it
        if (error.code === 'PGRST116') {
          console.log('Creating wallet for user...');
          const { data: newWallet, error: insertError } = await supabase
            .from('wallets')
            .insert({ user_id: currentUser.id, balance: 100 })
            .select()
            .maybeSingle();
          
          if (!insertError && newWallet) {
            setBalance(newWallet.balance);
            console.log('Wallet created with balance:', newWallet.balance);
          }
        }
        setLoading(false);
        return;
      }

      if (data) {
        setBalance(data.balance);
        console.log('Balance loaded:', data.balance);
      } else {
        setBalance(0);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load balance:', error);
      setLoading(false);
    }
  };

  const addTokens = async (amount) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const newBalance = balance + amount;

      const { error } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('user_id', user.id);

      if (error) throw error;

      setBalance(newBalance);
      console.log('Tokens added. New balance:', newBalance);
      return { success: true, newBalance };
    } catch (error) {
      console.error('Failed to add tokens:', error);
      return { success: false, error };
    }
  };

  const deductTokens = async (amount) => {
    try {
      if (!user) throw new Error('User not authenticated');
      if (balance < amount) throw new Error('Insufficient balance');

      const newBalance = balance - amount;

      const { error } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('user_id', user.id);

      if (error) throw error;

      setBalance(newBalance);
      console.log('Tokens deducted. New balance:', newBalance);
      return { success: true, newBalance };
    } catch (error) {
      console.error('Failed to deduct tokens:', error);
      return { success: false, error };
    }
  };

  const refreshBalance = async () => {
    setLoading(true);
    await loadBalance();
  };

  useEffect(() => {
    if (user) {
      loadBalance();
    } else {
      setBalance(0);
      setLoading(false);
    }
  }, [user]);

  const value = {
    balance,
    loading,
    addTokens,
    deductTokens,
    refreshBalance,
  };

  return <TokenContext.Provider value={value}>{children}</TokenContext.Provider>;
};

export default TokenContext;
