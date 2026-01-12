import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, CreditCard, Loader2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'https://aigomarket-backend-production-8b8d.up.railway.app/api';

export default function FounderPayment() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please sign in first');
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please sign in first');
      navigate('/');
      return;
    }

    setIsProcessing(true);

    try {
      // Get fresh Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('🔵 Session check:', { 
        hasSession: !!session, 
        userId: user.id,
        email: user.email 
      });
      
      if (sessionError || !session) {
        console.error('❌ Session error:', sessionError);
        toast.error('Authentication error. Please sign in again.');
        setIsProcessing(false);
        navigate('/');
        return;
      }

      const token = session.access_token;
      
      console.log('🔵 Starting payment request...');
      
      const response = await axios.post(
        `${API_URL}/payments/founder-checkout`,
        {
          userId: user.id,
          email: user.email
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      console.log('✅ Payment response:', response.data);

      // Redirect to Stripe
      if (response.data.success && response.data.checkout_url) {
        console.log('🔵 Redirecting to:', response.data.checkout_url);
        window.location.href = response.data.checkout_url;
      } else {
        throw new Error('No checkout URL received from server');
      }

    } catch (error) {
      console.error('❌ Payment error:', error);
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        toast.error('Request timed out. Server might be starting up. Try again in 10 seconds.');
      } else if (error.response) {
        const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Payment failed';
        console.error('Server error:', error.response.data);
        toast.error(errorMsg);
      } else if (error.request) {
        toast.error('Cannot reach payment server. Check your connection.');
      } else {
        toast.error(error.message || 'An unexpected error occurred');
      }
      
      setIsProcessing(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-black mb-3">Welcome to AIGO!</h1>
          <p className="text-slate-400 text-lg">Complete your setup with our one-time Founder package</p>
        </div>

        <div className="bg-[#0f172a] border-2 border-cyan-500 rounded-3xl p-8 shadow-[0_0_40px_rgba(6,182,212,0.15)] mb-6">
          
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-800">
            <div>
              <h2 className="text-2xl font-black mb-1">Founder Package</h2>
              <p className="text-sm text-slate-400">One-time payment • Lifetime access</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-white">$29.90</div>
              <div className="text-xs text-slate-500">+ $9.90 tokens included</div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">What's Included:</h3>
            
            {[
              '1,000 AIGO Tokens (worth $9.90)',
              'Lifetime platform access',
              '3 Edge AI Model licenses',
              '10GB Dataset storage',
              'Advanced Seed AI compression',
              'Mobile export (iOS + Android)',
              'Custom domain connect',
              'Backend/Frontend pairing',
              'Priority support'
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-200">{feature}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Redirecting to Stripe...</span>
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                <span>Become a Founder Now</span>
              </>
            )}
          </button>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Shield className="h-4 w-4" />
            <span>Secured by Stripe • SSL Encrypted</span>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-slate-400 hover:text-white transition"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}