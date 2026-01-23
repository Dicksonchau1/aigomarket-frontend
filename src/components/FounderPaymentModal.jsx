import React from 'react';
import { X, Check, Coins, Zap, Sparkles } from 'lucide-react';
import { usePayment } from '../context/PaymentContext';
import toast from 'react-hot-toast';

export default function FounderPaymentModal({ isOpen, onClose }) {
  const { state, startPayment } = usePayment();

  const handlePurchase = async () => {
    await startPayment();
  };

  if (!isOpen) return null;

  const features = [
    '1,000 AIGO Tokens (worth $9.90)',
    'Lifetime platform access',
    '3 Edge AI Model licenses',
    '10GB Dataset storage',
    'Advanced Seed AI compression',
    'Mobile export (iOS + Android)',
    'Custom domain connect',
    'Backend/Frontend pairing',
    'Priority support'
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0f172a] border-2 border-slate-800 rounded-3xl p-8 max-w-md w-full relative shadow-2xl animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-800"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/50">
            <Zap size={32} className="text-white" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full mb-3">
            <Sparkles size={14} className="text-purple-400" />
            <span className="text-xs font-bold text-purple-400">SPECIAL OFFER</span>
          </div>
          <h2 className="text-3xl font-black text-white mb-2">
            ?? Welcome to AIGO!
          </h2>
          <p className="text-slate-400">Get started with the Founder Package</p>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline justify-center mb-4">
            <span className="text-5xl font-black text-white">$29.90</span>
            <span className="text-slate-400 ml-2">one-time</span>
          </div>
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl px-4 py-2 flex items-center justify-center gap-2">
            <Coins size={20} className="text-yellow-400" />
            <span className="font-bold text-yellow-400">1,000 Tokens Included</span>
            <span className="text-xs text-slate-400">(worth $9.90)</span>
          </div>
        </div>

        <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3 py-1">
              <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Check size={12} className="text-emerald-400" />
              </div>
              <span className="text-slate-300 text-sm">{feature}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handlePurchase}
          disabled={state.status === 'processing'}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-xl hover:from-cyan-400 hover:to-purple-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:hover:scale-100"
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
          <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400 text-sm text-center">{state.error}</p>
          </div>
        )}

        <button
          onClick={onClose}
          disabled={state.status === 'processing'}
          className="w-full py-3 text-slate-400 hover:text-white transition text-sm disabled:opacity-50"
        >
          I'll do this later
        </button>

        <p className="text-xs text-slate-500 text-center mt-4">
          Secured by Stripe ??SSL Encrypted ??30-day money-back guarantee
        </p>
      </div>
    </div>
  );
}
