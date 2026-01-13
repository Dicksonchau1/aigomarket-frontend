import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { paymentAPI } from '../services/api';
import { database } from '../services/database';

const PaymentContext = createContext(null);

const initialState = {
  status: 'idle',
  sessionId: null,
  error: null
};

function paymentReducer(state, action) {
  switch (action.type) {
    case 'START_PAYMENT':
      return { ...state, status: 'processing', error: null };
    case 'PAYMENT_SUCCESS':
      return { ...state, status: 'success', sessionId: action.sessionId, error: null };
    case 'PAYMENT_ERROR':
      return { ...state, status: 'error', error: action.error };
    case 'RESET_PAYMENT':
      return initialState;
    default:
      return state;
  }
}

export function PaymentProvider({ children }) {
  const [state, dispatch] = useReducer(paymentReducer, initialState);

  const startPayment = useCallback(async () => {
    dispatch({ type: 'START_PAYMENT' });

    try {
      const response = await paymentAPI.createFounderCheckout();
      
      if (response.checkout_url) {
        window.location.href = response.checkout_url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      dispatch({ type: 'PAYMENT_ERROR', error: error.message || 'Payment initialization failed' });
    }
  }, []);

  const verifyPayment = useCallback(async (sessionId) => {
    dispatch({ type: 'START_PAYMENT' });

    try {
      const response = await paymentAPI.verifyPayment(sessionId);
      
      if (response.success) {
        await database.wallet.updateBalance(1000, 'credit');
        
        dispatch({ type: 'PAYMENT_SUCCESS', sessionId });
        return response;
      } else {
        throw new Error(response.error || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      dispatch({ type: 'PAYMENT_ERROR', error: error.message || 'Verification failed' });
      throw error;
    }
  }, []);

  const resetPayment = useCallback(() => {
    dispatch({ type: 'RESET_PAYMENT' });
  }, []);

  return (
    <PaymentContext.Provider value={{ state, startPayment, verifyPayment, resetPayment }}>
      {children}
    </PaymentContext.Provider>
  );
}

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};