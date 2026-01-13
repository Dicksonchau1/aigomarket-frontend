// src/hooks/usePayment.ts

import { useState, useCallback } from 'react';
import PaymentService from '../services/PaymentService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function usePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const initiateFounderPayment = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await PaymentService.createFounderCheckout();

      if (response.success && response.data?.checkout_url) {
        window.location.href = response.data.checkout_url;
      } else {
        throw new Error(response.error || 'Failed to create checkout session');
      }
    } catch (err) {
      const errorMessage = err.message || 'Payment initiation failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyPaymentStatus = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await PaymentService.verifyPayment(sessionId);

      if (response.success) {
        toast.success('Payment verified successfully!');
        navigate('/dashboard');
      } else {
        throw new Error(response.error || 'Payment verification failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'Verification failed';
      setError(errorMessage);
      toast.error(errorMessage);
      navigate('/payment/error');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  return {
    loading,
    error,
    initiateFounderPayment,
    verifyPaymentStatus
  };
}