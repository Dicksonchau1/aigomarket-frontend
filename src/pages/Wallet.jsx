import React, { useState, useEffect } from 'react';
import { Wallet as WalletIcon, Plus, Coins, ArrowDownLeft, ArrowUpRight, DollarSign, TrendingUp } from 'lucide-react';
import { database } from '../services/database';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Wallet() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const [balanceData, transactionsData] = await Promise.all([
        database.wallet.getBalance(),
        database.wallet.getTransactions()
      ]);
      
      setBalance(balanceData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Failed to load wallet data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    if (amount < 100) {
      toast.error('Minimum withdrawal amount is 100 tokens');
      return;
    }

    setWithdrawing(true);

    try {
      await database.wallet.requestWithdrawal(amount);
      toast.success('Withdrawal request submitted successfully');
      setShowWithdraw(false);
      setWithdrawAmount('');
      loadWalletData();
    } catch (error) {
      toast.error(error.message || 'Failed to process withdrawal');
      console.error(error);
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">Wallet</h1>
          <p className="text-slate-400">Manage your AIGO tokens and earnings</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Coins size={24} />
              </div>
              <span className="text-lg font-medium opacity-90">AIGO Balance</span>
            </div>
            
            <div className="text-5xl font-black mb-2">{balance.toLocaleString()}</div>
            
            <p className="text-sm opacity-75">tokens available</p>
          </div>

          <div className="bg-[#0f172a] border-2 border-slate-800 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                <DollarSign size={24} className="text-emerald-400" />
              </div>
              <span className="text-lg font-medium text-white">USD Value</span>
            </div>
            
            <div className="text-5xl font-black text-white mb-2">
              ${(balance * 0.01).toFixed(2)}
            </div>
            
            <p className="text-sm text-slate-400">at $0.01 per token</p>
          </div>
        </div>

        <div className="flex gap-3 mb-8">
          <button
            onClick={() => navigate('/founder')}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl hover:from-cyan-400 hover:to-purple-500 transition"
          >
            <Plus size={20} />
            Buy More Tokens
          </button>
          
          <button
            onClick={() => setShowWithdraw(true)}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[#0f172a] border-2 border-slate-800 text-white rounded-xl hover:border-cyan-500 transition"
          >
            <ArrowUpRight size={20} />
            Withdraw
          </button>
        </div>

        {showWithdraw && (
          <div className="bg-[#0f172a] border-2 border-slate-800 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Withdraw Tokens</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Amount (tokens)
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  placeholder="100"
                  min="100"
                  max={balance}
                />
                <p className="text-xs text-slate-500 mt-2">
                  Available: {balance.toLocaleString()} tokens (${(balance * 0.01).toFixed(2)})
                  <br />
                  Minimum withdrawal: 100 tokens
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowWithdraw(false)}
                  className="flex-1 px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition"
                  disabled={withdrawing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={withdrawing}
                  className="flex-1 px-6 py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition disabled:opacity-50"
                >
                  {withdrawing ? 'Processing...' : 'Confirm Withdrawal'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-[#0f172a] border-2 border-slate-800 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6">Transaction History</h3>
          
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <WalletIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 bg-slate-900 rounded-xl hover:bg-slate-800 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === 'credit' ? 'bg-emerald-500/10' : 'bg-red-500/10'
                    }`}>
                      {tx.type === 'credit' ? (
                        <ArrowDownLeft className="text-emerald-400" size={20} />
                      ) : (
                        <ArrowUpRight className="text-red-400" size={20} />
                      )}
                    </div>
                    
                    <div>
                      <p className="text-white font-medium">{tx.description || 'Transaction'}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(tx.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`font-bold ${
                      tx.type === 'credit' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {tx.type === 'credit' ? '+' : '-'}{tx.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">tokens</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}