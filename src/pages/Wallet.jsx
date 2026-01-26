import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Wallet, 
  Coins, 
  History, 
  Crown,
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw,
  Sparkles,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

function WalletPage() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadWalletData();
  }, [navigate]);

  const loadWalletData = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        console.error('Auth error:', authError);
        navigate('/auth');
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
      } else {
        setUser(userData);
      }

      const { data: transactionsData, error: transactionsError } = await supabase
        .from('token_transactions')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });

      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError);
      } else {
        setTransactions(transactionsData || []);
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const refreshBalance = async () => {
    setIsRefreshing(true);
    await loadWalletData();
  };

  const getSubscriptionStatus = () => {
    if (!user?.subscription_plan) {
      return { 
        text: 'No Active Plan', 
        color: 'gray', 
        bgColor: 'gray-600',
        icon: XCircle 
      };
    }

    const expiryDate = new Date(user.subscription_expiry);
    const now = new Date();
    const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 0) {
      return { 
        text: 'Expired', 
        color: 'red', 
        bgColor: 'red-600',
        icon: XCircle, 
        days: 0 
      };
    } else if (daysLeft <= 30) {
      return { 
        text: 'Expiring Soon', 
        color: 'yellow', 
        bgColor: 'yellow-600',
        icon: Calendar, 
        days: daysLeft 
      };
    } else {
      return { 
        text: 'Active', 
        color: 'green', 
        bgColor: 'green-600',
        icon: CheckCircle, 
        days: daysLeft 
      };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlanName = (planId) => {
    const plans = {
      'standard': 'Standard Plan',
      'professional': 'Professional Plan'
    };
    return plans[planId] || 'Unknown Plan';
  };

  const calculateUsageStats = () => {
    const totalReceived = transactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalUsed = transactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);

    return { totalReceived, totalUsed };
  };

  const subscriptionStatus = getSubscriptionStatus();
  const StatusIcon = subscriptionStatus.icon;
  const { totalReceived, totalUsed } = calculateUsageStats();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-white text-xl">Loading wallet...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#0f1420] py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Wallet className="w-10 h-10 text-purple-400 mr-4" />
              <div>
                <h1 className="text-4xl font-bold text-white">My Wallet</h1>
                <p className="text-gray-400 mt-1">View your token balance and subscription</p>
              </div>
            </div>
            <button
              onClick={refreshBalance}
              disabled={isRefreshing}
              className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Main Stats Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Token Balance Card */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <Coins className="w-10 h-10 text-white" />
                <Sparkles className="w-8 h-8 text-purple-200" />
              </div>
              <p className="text-purple-100 text-sm mb-2">Available Tokens</p>
              <h2 className="text-6xl font-bold text-white mb-4">
                {user?.tokens?.toLocaleString() || 0}
              </h2>
              <div className="flex items-center justify-between text-purple-100">
                <span className="text-sm">AI Generation Tokens</span>
                {user?.tokens > 0 && totalReceived > 0 && (
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
                    {((user.tokens / totalReceived) * 100).toFixed(1)}% remaining
                  </span>
                )}
              </div>
            </div>

            {/* Subscription Status Card */}
            <div className={`bg-gradient-to-br from-${subscriptionStatus.bgColor} to-${subscriptionStatus.color}-700 rounded-2xl p-8 shadow-2xl`}>
              <div className="flex items-center justify-between mb-4">
                <Crown className="w-10 h-10 text-white" />
                <StatusIcon className="w-8 h-8 text-white" />
              </div>
              <p className="text-white/80 text-sm mb-2">Subscription Status</p>
              <h3 className="text-3xl font-bold text-white mb-3">
                {subscriptionStatus.text}
              </h3>
              {user?.subscription_plan ? (
                <div className="space-y-2">
                  <p className="text-white font-semibold text-lg">
                    {getPlanName(user.subscription_plan)}
                  </p>
                  {subscriptionStatus.days > 0 && (
                    <p className="text-white/80 text-sm">
                      {subscriptionStatus.days} days remaining
                    </p>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigate('/pricing')}
                  className="mt-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  View Plans
                </button>
              )}
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-[#1a1f2e] rounded-2xl border border-slate-800 p-8">
            <div className="flex items-center mb-6">
              <History className="w-6 h-6 text-cyan-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">Transaction History</h2>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <Coins className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No transactions yet</p>
                <p className="text-slate-500 text-sm mt-2">Subscribe to a plan to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction, index) => (
                  <div
                    key={transaction.id || index}
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {transaction.type === 'credit' ? (
                        <TrendingUp className="w-8 h-8 text-green-400" />
                      ) : (
                        <TrendingDown className="w-8 h-8 text-red-400" />
                      )}
                      <div>
                        <p className="text-white font-semibold">{transaction.description}</p>
                        <p className="text-slate-400 text-sm">{formatDate(transaction.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                        {transaction.type === 'credit' ? '+' : '-'}{transaction.amount.toLocaleString()}
                      </p>
                      <p className="text-slate-500 text-sm">tokens</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default WalletPage;