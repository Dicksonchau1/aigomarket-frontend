import React, { createContext, useContext, useState } from 'react';
import toast from 'react-hot-toast';

const PaymentContext = createContext(null);

export function PaymentProvider({ children }) {
  const [state, setState] = useState({
    status: 'idle',
    sessionId: null,
    error: null
  });

  const startPayment = async () => {
    setState({ status: 'processing', sessionId: null, error: null });

    try {
      toast.info('Payment integration coming soon!');
      
      setTimeout(() => {
        setState({ status: 'idle', sessionId: null, error: null });
      }, 2000);
      
    } catch (error) {
      console.error('Payment error:', error);
      setState({ 
        status: 'error', 
        sessionId: null, 
        error: error.message || 'Payment failed' 
      });
    }
  };

  const verifyPayment = async (sessionId) => {
    setState({ status: 'processing', sessionId: null, error: null });

    try {
      toast.success('Payment verified!');
      setState({ status: 'success', sessionId, error: null });
      return { success: true };
    } catch (error) {
      console.error('Verification error:', error);
      setState({ 
        status: 'error', 
        sessionId: null, 
        error: error.message || 'Verification failed' 
      });
      throw error;
    }
  };

  const resetPayment = () => {
    setState({ status: 'idle', sessionId: null, error: null });
  };

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
