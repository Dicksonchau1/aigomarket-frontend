import React, { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, Download, ArrowUpRight, CreditCard,
  Zap, Clock, CheckCircle, AlertCircle, ExternalLink
} from 'lucide-react';
import { useTokens } from '../context/TokenContext';
import { stripeService } from '../services/stripe.service';
import { motion } from 'framer-motion';

const WalletUsage = () => {
  const { balance, pending, totalEarned, transactions, fetchTransactions } = useTokens();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [stripeConnected, setStripeConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usageData, setUsageData] = useState([]);

  useEffect(() => {
    fetchTransactions();
    checkStripeConnection();
    fetchUsageData();
  }, []);

  const checkStripeConnection = async () => {
    try {
      const connected = await stripeService.checkConnection();
      setStripeConnected(connected);
    } catch (error) {
      console.error('Stripe check failed:', error);
    }
  };

  const fetchUsageData = async () => {
    // Real-time usage data from your backend
    const response = await fetch('/api/usage/real-time', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await response.json();
    setUsageData(data.usage);
  };

  const handleStripeConnect = async () => {
    try {
      setLoading(true);
      const { url } = await stripeService.createConnectAccount();
      window.location.href = url;
    } catch (error) {
      alert('Failed to connect Stripe: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!stripeConnected) {
      alert('Please connect your Stripe account first');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount < 10 || amount > balance * 0.001) {
      alert('Invalid withdrawal amount');
      return;
    }

    try {
      setLoading(true);
      const result = await stripeService.createPayout(amount);
      
      if (result.success) {
        alert(`Withdrawal of $${amount} initiated! ETA: 2-5 business days`);
        setWithdrawAmount('');
        fetchTransactions();
      }
    } catch (error) {
      alert('Withdrawal failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const availableUSD = (balance * 0.001).toFixed(2);
  const pendingUSD = (pending * 0.001).toFixed(2);
  const totalEarnedUSD = (totalEarned * 0.001).toFixed(2);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Wallet & Usage</h1>
        <p className="text-slate-400">Manage earnings, withdrawals, and monitor token consumption</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 border border-emerald-700/30 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <DollarSign className="text-emerald-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Available Balance</p>
              <p className="text-xs text-emerald-400">{balance.toLocaleString()} tokens</p>
            </div>
          </div>
          <p className="text-4xl font-black text-emerald-400">${availableUSD}</p>
          <p className="text-xs text-slate-500 mt-2">Ready for withdrawal</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border border-yellow-700/30 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <Clock className="text-yellow-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Pending</p>
              <p className="text-xs text-yellow-400">{pending.toLocaleString()} tokens</p>
            </div>
          </div>
          <p className="text-4xl font-black text-yellow-400">${pendingUSD}</p>
          <p className="text-xs text-slate-500 mt-2">Processing...</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-cyan-900/20 to-cyan-800/10 border border-cyan-700/30 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-cyan-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Earned</p>
              <p className="text-xs text-cyan-400">{totalEarned.toLocaleString()} tokens</p>
            </div>
          </div>
          <p className="text-4xl font-black text-cyan-400">${totalEarnedUSD}</p>
          <p className="text-xs text-slate-500 mt-2">All-time earnings</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Withdrawal Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Download size={20} className="text-emerald-400" />
              Withdraw Funds
            </h2>

            {!stripeConnected ? (
              <div className="text-center py-8">
                <CreditCard className="mx-auto text-slate-600 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-white mb-2">Connect Stripe Account</h3>
                <p className="text-slate-400 text-sm mb-6">
                  Connect your Stripe account to receive payouts securely
                </p>
                <button
                  onClick={handleStripeConnect}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-900/50 transition-all disabled:opacity-50"
                >
                  {loading ? 'Connecting...' : 'Connect Stripe Account'}
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-6 p-3 bg-emerald-900/20 border border-emerald-700/30 rounded-xl">
                  <CheckCircle className="text-emerald-400" size={20} />
                  <span className="text-emerald-400 text-sm font-medium">Stripe Connected</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Withdrawal Amount (USD)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                      <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="0.00"
                        min="10"
                        max={availableUSD}
                        step="0.01"
                        className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Minimum: $10.00 | Maximum: ${availableUSD}
                    </p>
                  </div>

                  <button
                    onClick={handleWithdraw}
                    disabled={loading || !withdrawAmount || parseFloat(withdrawAmount) < 10}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-900/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <ArrowUpRight size={20} />
                        Request Withdrawal
                      </>
                    )}
                  </button>

                  <p className="text-xs text-slate-400 text-center">
                    Payouts typically arrive in 2-5 business days
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Recent Transactions</h2>
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No transactions yet</p>
              ) : (
                transactions.slice(0, 10).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        tx.type === 'earn' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                      }`}>
                        {tx.type === 'earn' ? (
                          <TrendingUp className="text-emerald-400" size={20} />
                        ) : (
                          <Download className="text-red-400" size={20} />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{tx.description}</p>
                        <p className="text-xs text-slate-500">{new Date(tx.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${tx.type === 'earn' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {tx.type === 'earn' ? '+' : '-'}${tx.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500">{tx.tokens.toLocaleString()} tokens</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Usage Monitor */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Zap size={18} className="text-yellow-400" />
              Token Consumption
            </h2>
            <div className="space-y-4">
              {[
                { label: 'Architect (OpenRouter)', tokens: 1250, cost: 1.25, color: 'cyan' },
                { label: 'One-Click Deploy', tokens: 850, cost: 0.85, color: 'purple' },
                { label: 'Marketplace Listings', tokens: 320, cost: 0.32, color: 'emerald' },
              ].map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-800/50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">{item.label}</span>
                    <span className={`text-xs font-bold text-${item.color}-400`}>
                      -{item.tokens.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden mr-3">
                      <div className={`h-full bg-${item.color}-500`} style={{ width: '60%' }}></div>
                    </div>
                    <span className="text-xs text-slate-500">${item.cost}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Subscription Plan</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Plan</span>
                <span className="text-white font-bold">Founder</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Price</span>
                <span className="text-emerald-400 font-bold">$29.99/mo</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Next Billing</span>
                <span className="text-slate-300 text-sm">Feb 11, 2025</span>
              </div>
            </div>
            <button className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors">
              Manage Subscription
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletUsage;
