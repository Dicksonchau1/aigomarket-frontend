import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePayment } from '../context/PaymentProvider';
import { PaymentErrorBoundary } from '../components/PaymentErrorBoundary';
import DashboardLayout from '../components/DashboardLayout';
import LoadingState from '../components/LoadingState';
import { Check, Coins, Zap, Shield, Sparkles, Globe, Database, Cpu, Smartphone, Star, Info } from 'lucide-react';
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
    { icon: Zap, text: 'Lifetime platform access', highlight: 'All features unlocked' },
    { icon: Cpu, text: '1 Edge AI Model license', highlight: 'Deploy on edge devices' },
    { icon: Coins, text: '1,000 AIGO Tokens included', highlight: 'Worth $10' },
    { icon: Database, text: '10GB Dataset storage', highlight: null },
    { icon: Sparkles, text: 'Advanced Seed AI compression', highlight: null },
    { icon: Smartphone, text: 'Mobile export (iOS + Android)', highlight: null },
    { icon: Globe, text: 'Custom domain connect', highlight: null },
    { icon: Shield, text: 'Backend/Frontend pairing', highlight: null },
    { icon: Star, text: 'Founder badge', highlight: 'Exclusive status' },
    { icon: Check, text: 'Priority support', highlight: null }
  ];

  return (
    <PaymentErrorBoundary>
      <DashboardLayout>
        <div className="min-h-screen bg-[#0f1420] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#1a1f2e] border-2 border-slate-800 rounded-3xl p-8 shadow-2xl">
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
                  <p className="text-xs text-slate-400">Worth $10.00 ??Save 25%</p>
                </div>
              </div>

              {/* Important Info */}
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-6">
                <div className="flex gap-3">
                  <Info size={18} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-cyan-400 font-bold text-sm mb-1">Tokens are add-ons</p>
                    <p className="text-slate-400 text-xs">
                      Use tokens for dataset training, model purchases, and deployments. 
                      Buy more token packages anytime from your wallet.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-8 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
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
                        <span className="ml-2 text-xs text-slate-500">??{feature.highlight}</span>
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

          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgb(15 23 42);
              border-radius: 3px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgb(71 85 105);
              border-radius: 3px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgb(100 116 139);
            }
          `}</style>
        </div>
      </DashboardLayout>
    </PaymentErrorBoundary>
  );
}
