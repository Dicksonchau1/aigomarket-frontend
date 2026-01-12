import React from 'react';
import { DollarSign, TrendingUp, Download } from 'lucide-react';

export default function Wallet() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] p-8">
      <h1 className="text-4xl font-black text-white mb-2">Creator Wallet</h1>
      <p className="text-slate-400 mb-8">Manage earnings from AI models</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="text-emerald-400" size={24} />
            <span className="text-slate-400">Available Balance</span>
          </div>
          <div className="text-4xl font-black text-white">$1,250.50</div>
        </div>

        <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-cyan-400" size={24} />
            <span className="text-slate-400">This Month</span>
          </div>
          <div className="text-4xl font-black text-white">$450.00</div>
        </div>

        <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Download className="text-purple-400" size={24} />
            <span className="text-slate-400">Total Downloads</span>
          </div>
          <div className="text-4xl font-black text-white">1,540</div>
        </div>
      </div>

      <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition">
        Request Withdrawal
      </button>
    </div>
  );
}