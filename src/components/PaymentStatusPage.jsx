// src/components/payments/PaymentStatusPage.tsx

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

type PaymentStatus = 'processing' | 'success' | 'error';

export default function PaymentStatusPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<PaymentStatus>('processing');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      verifyPaymentStatus(sessionId);
    } else {
      setStatus('error');
      toast.error('Invalid payment session');
    }
  }, [sessionId]);

  const verifyPaymentStatus = async (sid: string) => {
    try {
      const response = await api.verifyPayment(sid);
      
      if (response.success) {
        setStatus('success');
        toast.success('Welcome to the Founder tier!');
        setTimeout(() => navigate('/dashboard'), 3000);
      } else {
        setStatus('error');
        toast.error(response.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('error');
      toast.error('Failed to verify payment status');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <>
            <Loader2 className="h-16 w-16 text-accent-cyan animate-spin" />
            <h2 className="text-2xl font-orbitron font-bold text-text-primary mt-6">
              Verifying Payment
            </h2>
            <p className="font-outfit text-text-secondary mt-2">
              Please wait while we confirm your payment...
            </p>
          </>
        );

      case 'success':
        return (
          <>
            <CheckCircle className="h-16 w-16 text-accent-emerald" />
            <h2 className="text-2xl font-orbitron font-bold text-text-primary mt-6">
              Payment Successful!
            </h2>
            <p className="font-outfit text-text-secondary mt-2">
              Welcome to the Founder tier!
            </p>
            <div className="mt-6 space-y-2">
              <p className="text-sm font-jetbrains text-accent-emerald">
                ✓ 1,000 AIGO Tokens credited
              </p>
              <p className="text-sm font-jetbrains text-accent-emerald">
                ✓ Founder badge activated
              </p>
              <p className="text-sm font-jetbrains text-accent-emerald">
                ✓ Premium features unlocked
              </p>
            </div>
          </>
        );

      case 'error':
        return (
          <>
            <XCircle className="h-16 w-16 text-red-500" />
            <h2 className="text-2xl font-orbitron font-bold text-text-primary mt-6">
              Payment Failed
            </h2>
            <p className="font-outfit text-text-secondary mt-2">
              We couldn't verify your payment.
            </p>
            <button
              onClick={() => navigate('/founder')}
              className="mt-6 px-6 py-3 bg-bg-secondary text-text-primary 
                       rounded-lg hover:bg-bg-card transition-colors 
                       font-outfit flex items-center gap-2 border
                       border-border-color"
            >
              <ArrowLeft size={20} />
              Try Again
            </button>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-bg-secondary border-2 
                    border-border-color rounded-2xl p-8 text-center
                    shadow-lg backdrop-blur-sm">
        {renderContent()}
      </div>
    </div>
  );
}