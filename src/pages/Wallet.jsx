import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
    loadWalletData();
  }, [navigate]);

  const loadWalletData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Load user data with updated balance
      const userResponse = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.user);
        localStorage.setItem('user', JSON.stringify(userData.user));
      }

      // Load transactions
      const transactionsResponse = await fetch('http://localhost:5000/api/wallet/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData.transactions || []);
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

  const getPlanTokens = (planId) => {
    const plans = {
      'standard': 1500,
      'professional': 5000
    };
    return plans[planId] || 0;
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-20 px-4">
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
              {user?.tokens > 0 && (
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

        {/* Subscription Details */}
        {user?.subscription_plan && (
          <div className="bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-purple-400" />
              Subscription Details
            </h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Current Plan</p>
                <p className="text-white font-semibold text-lg">{getPlanName(user.subscription_plan)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Tokens Allocated</p>
                <p className="text-white font-semibold text-lg">{getPlanTokens(user.subscription_plan).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Start Date</p>
                <p className="text-white font-semibold">
                  {user.subscription_start ? new Date(user.subscription_start).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Expiry Date</p>
                <p className="text-white font-semibold">
                  {user.subscription_expiry ? new Date(user.subscription_expiry).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Token Usage Stats */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <Coins className="w-6 h-6 mr-2 text-blue-400" />
            Token Usage Statistics
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-xs">Total Received</p>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white">
                {totalReceived.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-xs">Total Used</p>
                <TrendingDown className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-3xl font-bold text-white">
                {totalUsed.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-xs">Current Balance</p>
                <Coins className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-green-400">
                {user?.tokens?.toLocaleString() || 0}
              </p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-xs">Usage Rate</p>
                <Sparkles className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-blue-400">
                {totalReceived > 0
                  ? Math.round((totalUsed / totalReceived) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <History className="w-6 h-6 mr-2 text-green-400" />
            Transaction History
          </h3>

          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No transactions yet</p>
              <p className="text-gray-500 text-sm">Your token transactions will appear here</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-gray-700 rounded-lg p-4 flex items-center justify-between hover:bg-gray-650 transition-colors"
                >
                  <div className="flex items-center flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                      transaction.type === 'credit' 
                        ? 'bg-green-500/20' 
                        : 'bg-red-500/20'
                    }`}>
                      {transaction.type === 'credit' ? (
                        <TrendingUp className="w-6 h-6 text-green-400" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-red-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">{transaction.description}</p>
                      <p className="text-gray-400 text-sm">{formatDate(transaction.created_at)}</p>
                      {transaction.reference_id && (
                        <p className="text-gray-500 text-xs mt-1">Ref: {transaction.reference_id.substring(0, 20)}...</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className={`text-2xl font-bold ${
                      transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}{transaction.amount.toLocaleString()}
                    </p>
                    <p className="text-gray-400 text-xs uppercase">tokens</p>
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

export default WalletPage;