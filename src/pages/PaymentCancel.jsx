import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f1420] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl p-8 text-center">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-400" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">Payment Cancelled</h1>
        <p className="text-slate-400 mb-8">
          Your payment was cancelled. No charges were made to your account.
        </p>

        <button
          onClick={() => navigate('/wallet')}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-200 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Return to Wallet
        </button>
      </div>
    </div>
  );
};

export default PaymentCancel;