import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowLeft, Home, Coins } from 'lucide-react';
import toast from 'react-hot-toast';
import { api_methods } from '../services/api';

export default function PaymentStatusPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [countdown, setCountdown] = useState(3);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      verifyPaymentStatus(sessionId);
    } else {
      setStatus('error');
      toast.error('Invalid payment session');
    }
  }, [sessionId]);

  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
    
    if (status === 'success' && countdown === 0) {
      navigate('/dashboard');
    }
  }, [status, countdown, navigate]);

  const verifyPaymentStatus = async (sid) => {
    try {
      const response = await api_methods.verifyPayment(sid);
      
      if (response.success) {
        setStatus('success');
        toast.success('🎉 Welcome to the Founder tier!');
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
            <Loader2 className="w-16 h-16 text-cyan-500 animate-spin" />
            <h2 className="text-2xl font-bold text-white mt-6">
              Verifying Payment
            </h2>
            <p className="text-slate-400 mt-2">
              Please wait while we confirm your payment...
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-200"></div>
            </div>
          </>
        );

      case 'success':
        return (
          <>
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Payment Successful!
            </h2>
            <p className="text-slate-400 mb-6">
              Welcome to the Founder tier! 🎉
            </p>
            
            <div className="bg-slate-900 rounded-xl p-6 mb-6 space-y-3">
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={16} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-white font-medium">1,000 AIGO Tokens credited</p>
                  <p className="text-xs text-slate-500">Ready to use now</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={16} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-white font-medium">Founder badge activated</p>
                  <p className="text-xs text-slate-500">Displayed on your profile</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={16} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-white font-medium">Premium features unlocked</p>
                  <p className="text-xs text-slate-500">Full access granted</p>
                </div>
              </div>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl px-4 py-3 mb-6">
              <p className="text-cyan-400 text-sm">
                Redirecting to dashboard in {countdown} second{countdown !== 1 ? 's' : ''}...
              </p>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold py-3 rounded-xl hover:from-cyan-400 hover:to-purple-500 transition"
            >
              Go to Dashboard Now
            </button>
          </>
        );

      case 'error':
        return (
          <>
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Payment Failed
            </h2>
            <p className="text-slate-400 mb-6">
              We couldn't verify your payment. If you were charged, please contact support.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/founder')}
                className="flex-1 px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition flex items-center justify-center gap-2"
              >
                <ArrowLeft size={20} />
                <span>Try Again</span>
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition flex items-center justify-center gap-2"
              >
                <Home size={20} />
                <span>Go Home</span>
              </button>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#0f172a] border-2 border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
        {renderContent()}
      </div>
    </div>
  );
}