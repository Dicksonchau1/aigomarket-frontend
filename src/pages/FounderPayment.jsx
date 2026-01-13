import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePayment } from '../context/PaymentContext';
import { PaymentErrorBoundary } from '../components/PaymentErrorBoundary';
import LoadingState from '../components/LoadingState';
import { Check, Coins, Zap, ArrowLeft, Shield, Sparkles, Globe, Database, Cpu, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FounderPayment() {
  const { user } = useAuth();
  const { state, startPayment } = usePayment();
  const navigate = useNavigate();

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Please sign in first');
      navigate('/', { state: { showAuth: true } });
      return;
    }

    await startPayment();
  };

  if (state.status === 'processing') {
    return <LoadingState message="Redirecting to secure checkout..." />;
  }

  const features = [
    { icon: Coins, text: '1,000 AIGO Tokens', highlight: 'worth $9.90' },
    { icon: Zap, text: 'Lifetime platform access', highlight: null },
    { icon: Cpu, text: '3 Edge AI Model licenses', highlight: null },
    { icon: Database, text: '10GB Dataset storage', highlight: null },
    { icon: Sparkles, text: 'Advanced Seed AI compression', highlight: null },
    { icon: Smartphone, text: 'Mobile export (iOS + Android)', highlight: null },
    { icon: Globe, text: 'Custom domain connect', highlight: null },
    { icon: Shield, text: 'Backend/Frontend pairing', highlight: null },
    { icon: Check, text: 'Priority support', highlight: null }
  ];

  return (
    <PaymentErrorBoundary>
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
        <button
          onClick={() => navigate(user ? '/dashboard' : '/')}
          className="fixed top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition z-50"
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="max-w-md w-full bg-[#0f172a] border-2 border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/50">
              <Zap size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-black text-white mb-2 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Founder Package
            </h1>
            <p className="text-slate-400">One-time payment ??Lifetime access</p>
          </div>

          <div className="mb-8">
            <div className="flex items-baseline justify-center mb-4">
              <span className="text-6xl font-black text-white">$29.90</span>
              <span className="text-slate-400 ml-3">one-time</span>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 flex items-center justify-center gap-3 mb-6">
              <Coins size={24} className="text-yellow-400" />
              <div className="text-left">
                <p className="font-bold text-yellow-400">1,000 Tokens Included</p>
                <p className="text-xs text-slate-400">Worth $9.90 ??Save 25%</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center group-hover:bg-cyan-500/20 transition flex-shrink-0">
                    <Icon size={18} className="text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <span className="text-slate-300 text-sm font-medium">{feature.text}</span>
                    {feature.highlight && (
                      <span className="ml-2 text-xs text-slate-500">({feature.highlight})</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handlePurchase}
            disabled={state.status === 'processing'}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold py-4 rounded-xl hover:from-cyan-400 hover:to-purple-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:hover:scale-100 transition-all"
          >
            {state.status === 'processing' ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Zap size={20} />
                <span>Become a Founder Now</span>
              </>
            )}
          </button>

          {state.error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl mb-3">
              <p className="text-red-400 text-sm text-center">{state.error}</p>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
            <Shield size={14} />
            <span>Secured by Stripe ??SSL Encrypted</span>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-black text-white">500+</p>
                <p className="text-xs text-slate-400">Founders</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">10K+</p>
                <p className="text-xs text-slate-400">Models</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">99.9%</p>
                <p className="text-xs text-slate-400">Uptime</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PaymentErrorBoundary>
  );
}
