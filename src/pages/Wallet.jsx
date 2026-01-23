import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  CreditCard,
  Zap,
  Gift,
  DollarSign,
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  Award,
  Target,
  Activity,
  Wallet as WalletIcon,
  Plus,
  Minus,
  History,
  CheckCircle,
  XCircle,
  Clock,
  ShoppingCart,
  Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Wallet() {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [stats, setStats] = useState({
    totalEarned: 0,
    totalSpent: 0,
    monthlyEarnings: 0,
    pendingWithdrawals: 0
  });

  // Token Packages (matching Pricing.jsx)
  const tokenPackages = [
    {
      id: 'starter-pack',
      name: 'Starter Pack',
      tokens: 1000,
      bonus: 0,
      price: 10,
      color: 'from-cyan-500 to-blue-500',
      icon: Zap,
      popular: false
    },
    {
      id: 'pro-pack',
      name: 'Pro Pack',
      tokens: 5000,
      bonus: 500,
      price: 45,
      originalPrice: 50,
      color: 'from-purple-500 to-pink-500',
      icon: Crown,
      popular: true,
      badge: 'Most Popular'
    },
    {
      id: 'enterprise-pack',
      name: 'Enterprise Pack',
      tokens: 15000,
      bonus: 3000,
      price: 120,
      originalPrice: 150,
      color: 'from-orange-500 to-red-500',
      icon: Award,
      popular: false,
      badge: 'Best Value'
    }
  ];

  useEffect(() => {
    fetchWalletData();
    
    // Subscribe to real-time wallet updates
    const channel = supabase
      .channel('wallet_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'wallets' },
        () => fetchWalletData()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        () => fetchTransactions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch wallet
      let { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Create wallet if it doesn't exist
      if (walletError && walletError.code === 'PGRST116') {
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert({
            user_id: user.id,
            balance: 0,
            total_earned: 0,
            total_spent: 0
          })
          .select()
          .single();

        if (createError) throw createError;
        walletData = newWallet;
      } else if (walletError) {
        throw walletError;
      }

      setWallet(walletData);
      await fetchTransactions();
      await calculateStats(user.id);

    } catch (error) {
      console.error('Error fetching wallet:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const calculateStats = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('type, amount, created_at, status')
        .eq('user_id', userId);

      if (error) throw error;

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const calculatedStats = {
        totalEarned: data
          .filter(t => t.type === 'credit' && t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0),
        totalSpent: data
          .filter(t => t.type === 'debit' && t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0),
        monthlyEarnings: data
          .filter(t => 
            t.type === 'credit' && 
            t.status === 'completed' && 
            new Date(t.created_at) >= firstDayOfMonth
          )
          .reduce((sum, t) => sum + t.amount, 0),
        pendingWithdrawals: data
          .filter(t => t.type === 'withdrawal' && t.status === 'pending')
          .reduce((sum, t) => sum + t.amount, 0)
      };

      setStats(calculatedStats);
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const handleStripeCheckout = async (packageData) => {
    if (!packageData) return;

    try {
      setProcessingPayment(true);
      toast.loading('Redirecting to secure checkout...', { id: 'checkout' });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Call Supabase Edge Function to create Stripe checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          packageId: packageData.id,
          packageName: packageData.name,
          tokens: packageData.tokens + packageData.bonus,
          price: packageData.price,
          userId: user.id,
          type: 'token_purchase'
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }

    } catch (error) {
      console.error('Stripe checkout error:', error);
      toast.error('Failed to start checkout. Please try again.', { id: 'checkout' });
      setProcessingPayment(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      if (withdrawAmount < 1000) {
        toast.error('Minimum withdrawal amount is 1,000 tokens');
        return;
      }

      if (withdrawAmount > wallet.balance) {
        toast.error('Insufficient balance');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create withdrawal transaction
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'withdrawal',
          amount: withdrawAmount,
          description: 'Token withdrawal request',
          status: 'pending',
          metadata: { method: 'bank_transfer', usd_value: (withdrawAmount * 0.01).toFixed(2) }
        });

      if (txError) throw txError;

      // Update wallet balance
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ 
          balance: wallet.balance - withdrawAmount,
          total_spent: wallet.total_spent + withdrawAmount
        })
        .eq('user_id', user.id);

      if (walletError) throw walletError;

      toast.success(`Withdrawal request submitted! You'll receive $${(withdrawAmount * 0.01).toFixed(2)} in 2-3 business days.`);
      setShowWithdrawModal(false);
      setWithdrawAmount(0);
      fetchWalletData();
    } catch (error) {
      console.error('Error withdrawing:', error);
      toast.error('Failed to process withdrawal');
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'credit':
      case 'token_purchase':
        return <ArrowDownRight className="w-5 h-5 text-green-400" />;
      case 'debit':
      case 'marketplace_purchase':
        return <ArrowUpRight className="w-5 h-5 text-red-400" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-5 h-5 text-orange-400" />;
      case 'reward':
      case 'bonus':
        return <Gift className="w-5 h-5 text-purple-400" />;
      default:
        return <Activity className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesType = filterType === 'all' || tx.type === filterType;
    const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesDate = true;
    if (dateRange !== 'all') {
      const txDate = new Date(tx.created_at);
      const now = new Date();
      
      switch (dateRange) {
        case 'today':
          matchesDate = txDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.setDate(now.getDate() - 7));
          matchesDate = txDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
          matchesDate = txDate >= monthAgo;
          break;
      }
    }
    
    return matchesType && matchesSearch && matchesDate;
  });

  const exportTransactions = () => {
    const csv = [
      ['Date', 'Type', 'Description', 'Amount', 'Status'],
      ...filteredTransactions.map(tx => [
        new Date(tx.created_at).toLocaleDateString(),
        tx.type,
        tx.description,
        tx.amount,
        tx.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Transactions exported successfully!');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-[#0f1420] flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-400 text-lg">Loading wallet...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#0f1420] p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  <WalletIcon className="w-10 h-10 text-cyan-400" />
                  Token Wallet
                </h1>
                <p className="text-slate-400 text-lg">Manage your AIGO tokens and track transactions</p>
              </div>
              <button
                onClick={fetchWalletData}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition border border-slate-700"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* Balance Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-500/20 rounded-2xl p-8 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-2">Total Balance</p>
                <div className="flex items-baseline gap-3">
                  <h2 className="text-6xl font-bold text-white">
                    {(wallet?.balance || 0).toLocaleString()}
                  </h2>
                  <span className="text-2xl text-slate-400">tokens</span>
                </div>
                <p className="text-slate-500 text-sm mt-2">
                  ≈ ${((wallet?.balance || 0) * 0.01).toFixed(2)} USD
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTopUpModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Buy Tokens
                </button>
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  disabled={!wallet?.balance || wallet.balance < 1000}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="w-5 h-5" />
                  Withdraw
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-slate-400">Total Earned</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {stats.totalEarned.toLocaleString()}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                  <span className="text-sm text-slate-400">Total Spent</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {stats.totalSpent.toLocaleString()}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-slate-400">This Month</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {stats.monthlyEarnings.toLocaleString()}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm text-slate-400">Pending</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {stats.pendingWithdrawals.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div 
              onClick={() => navigate('/marketplace')}
              className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-6 hover:border-purple-500/50 transition cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition">
                  <ShoppingCart className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">Browse Marketplace</p>
                  <p className="text-sm text-slate-400">Buy AI models & datasets</p>
                </div>
              </div>
            </div>

            <div 
              onClick={() => navigate('/pricing')}
              className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-6 hover:border-cyan-500/50 transition cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition">
                  <Coins className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">Buy More Tokens</p>
                  <p className="text-sm text-slate-400">Get bonus tokens with packages</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-6 hover:border-green-500/50 transition cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition">
                  <Target className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">Sell Your Work</p>
                  <p className="text-sm text-slate-400">Earn 70% commission in tokens</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Filters & Search */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-6 mb-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search transactions..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-slate-400" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="all">All Types</option>
                    <option value="credit">Credits</option>
                    <option value="debit">Debits</option>
                    <option value="token_purchase">Token Purchases</option>
                    <option value="marketplace_purchase">Marketplace</option>
                    <option value="withdrawal">Withdrawals</option>
                    <option value="reward">Rewards</option>
                  </select>

                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
              </div>

              <button
                onClick={exportTransactions}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition border border-slate-700"
              >
                <Download className="w-5 h-5" />
                Export CSV
              </button>
            </div>
          </motion.div>

          {/* Transactions List */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <History className="w-6 h-6 text-cyan-400" />
                Transaction History
              </h2>
              <span className="text-sm text-slate-400">
                {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
              </span>
            </div>

            {filteredTransactions.length > 0 ? (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {filteredTransactions.map((tx, index) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.03 }}
                      className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-5 hover:border-cyan-500/50 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="p-3 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition">
                            {getTransactionIcon(tx.type)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-white font-semibold">{tx.description}</h3>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(tx.status)}`}>
                                {tx.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(tx.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {tx.metadata?.method && (
                                <span className="capitalize">via {tx.metadata.method.replace('_', ' ')}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`text-2xl font-bold ${
                            tx.type === 'credit' || tx.type === 'reward' || tx.type === 'token_purchase' || tx.type === 'bonus'
                              ? 'text-green-400' 
                              : 'text-red-400'
                          }`}>
                            {tx.type === 'credit' || tx.type === 'reward' || tx.type === 'token_purchase' || tx.type === 'bonus' ? '+' : '-'}
                            {tx.amount.toLocaleString()}
                          </div>
                          <div className="text-sm text-slate-400">tokens</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-12 text-center">
                <History className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No transactions found</h3>
                <p className="text-slate-400 mb-6">
                  {searchQuery || filterType !== 'all' || dateRange !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Your transaction history will appear here'}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Buy Tokens Modal - Stripe Integration */}
      <AnimatePresence>
        {showTopUpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !processingPayment && setShowTopUpModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1a1f2e] border border-slate-700 rounded-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Coins className="w-8 h-8 text-green-400" />
                Buy AIGO Tokens
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {tokenPackages.map((pkg) => {
                  const Icon = pkg.icon;
                  const totalTokens = pkg.tokens + pkg.bonus;
                  const isSelected = selectedPackage?.id === pkg.id;

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`relative cursor-pointer rounded-2xl p-6 border-2 transition-all ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/30'
                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                      } ${pkg.popular ? 'ring-2 ring-purple-500/30' : ''}`}
                    >
                      {pkg.badge && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
                            {pkg.badge}
                          </span>
                        </div>
                      )}

                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${pkg.color} p-0.5 mb-4 mx-auto`}>
                        <div className="w-full h-full bg-[#1a1f2e] rounded-xl flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-white text-center mb-2">{pkg.name}</h3>

                      <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Coins className="text-cyan-400" size={20} />
                          <span className="text-2xl font-bold text-white">{totalTokens.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-400 text-center">tokens</p>
                        {pkg.bonus > 0 && (
                          <div className="mt-2 flex items-center justify-center gap-1">
                            <Gift className="text-green-400" size={14} />
                            <span className="text-green-400 text-xs font-semibold">+{pkg.bonus} Bonus</span>
                          </div>
                        )}
                      </div>

                      <div className="text-center mb-4">
                        <div className="text-3xl font-bold text-white mb-1">${pkg.price}</div>
                        {pkg.originalPrice && (
                          <div className="text-sm text-slate-500 line-through">${pkg.originalPrice}</div>
                        )}
                      </div>

                      {isSelected && (
                        <div className="absolute top-4 right-4">
                          <CheckCircle className="w-6 h-6 text-cyan-400" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedPackage && (
                <div className="bg-slate-800/50 rounded-xl p-6 mb-6 border border-slate-700">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-slate-400">Selected Package</span>
                    <span className="text-white font-semibold">{selectedPackage.name}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-slate-400">Total Tokens</span>
                    <span className="text-white font-semibold">
                      {(selectedPackage.tokens + selectedPackage.bonus).toLocaleString()} tokens
                    </span>
                  </div>
                  <div className="border-t border-slate-700 my-3"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Total Payment</span>
                    <span className="text-3xl font-bold text-green-400">
                      ${selectedPackage.price}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowTopUpModal(false);
                    setSelectedPackage(null);
                  }}
                  disabled={processingPayment}
                  className="flex-1 px-6 py-3 text-slate-300 hover:bg-slate-800 rounded-xl transition font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleStripeCheckout(selectedPackage)}
                  disabled={!selectedPackage || processingPayment}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold flex items-center justify-center gap-2"
                >
                  {processingPayment ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Proceed to Checkout
                    </>
                  )}
                </button>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-slate-500 text-sm">
                <CreditCard className="w-4 h-4" />
                <span>Secured by Stripe • SSL Encrypted</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowWithdrawModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1a1f2e] border border-slate-700 rounded-2xl max-w-md w-full p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Minus className="w-8 h-8 text-orange-400" />
                Withdraw Tokens
              </h2>

              <div className="space-y-6">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <p className="text-sm text-yellow-400">
                    <strong>Note:</strong> Withdrawals are processed within 2-3 business days. 
                    Minimum withdrawal: 1,000 tokens ($10 USD).
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Available Balance
                  </label>
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-4">
                    <div className="text-3xl font-bold text-white">
                      {(wallet?.balance || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-400">tokens (${((wallet?.balance || 0) * 0.01).toFixed(2)} USD)</div>
                  </div>

                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Withdrawal Amount (Tokens)
                  </label>
                  <div className="relative">
                    <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(parseInt(e.target.value) || 0)}
                      min="1000"
                      max={wallet?.balance || 0}
                      step="100"
                      className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg font-semibold"
                      placeholder="Enter amount"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    You'll receive: ${(withdrawAmount * 0.01).toFixed(2)} USD
                  </p>
                </div>

                <button
                  onClick={() => setWithdrawAmount(wallet?.balance || 0)}
                  className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg transition text-sm font-medium"
                >
                  Withdraw Maximum
                </button>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setWithdrawAmount(0);
                  }}
                  className="flex-1 px-6 py-3 text-slate-300 hover:bg-slate-800 rounded-xl transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={withdrawAmount < 1000 || withdrawAmount > (wallet?.balance || 0)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg hover:shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
                >
                  Confirm Withdrawal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}