import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Wallet as WalletIcon, 
  TrendingUp, 
  Download, 
  CreditCard,
  Sparkles,
  Gift,
  ArrowRight,
  Check,
  X,
  Clock,
  DollarSign,
  Zap,
  Crown
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Wallet() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  // ✅ YOUR EXACT TOKEN PACKAGES WITH STRIPE PRICE IDS
  const tokenPackages = [
    {
      id: 'starter',
      name: 'Starter Pack',
      tokens: 500,
      bonus: 0,
      price: 9.9,
      stripePriceId: 'price_1SklIbK16GbLKgfG0u012tzC', // ✅ YOUR PRICE ID
      popular: false,
      description: 'Perfect for beginners'
    },
    {
      id: 'pro',
      name: 'Pro Pack',
      tokens: 1800,
      bonus: 200,
      price: 19.9,
      stripePriceId: 'price_1SklIcK16GbLKgfGXXXXXXXX', // ⚠️ ADD YOUR 19.9 PRICE ID HERE
      popular: true,
      originalPrice: 24.9,
      description: 'Most popular choice'
    },
    {
      id: 'enterprise',
      name: 'Enterprise Pack',
      tokens: 5000,
      bonus: 500,
      price: 39.9,
      stripePriceId: 'price_1SklIdK16GbLKgfGYYYYYYYY', // ⚠️ ADD YOUR 39.9 PRICE ID HERE
      popular: false,
      originalPrice: 49.9,
      description: 'Best value'
    }
  ];

  useEffect(() => {
    if (user) {
      loadWalletData();
    }
  }, [user]);

  const loadWalletData = async () => {
    try {
      setLoading(true);

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('token_balance')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;
      setBalance(userData?.token_balance || 0);

      const { data: txData, error: txError } = await supabase
        .from('token_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (txError) throw txError;
      setTransactions(txData || []);

    } catch (error) {
      console.error('Error loading wallet:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleStripeCheckout = async (packageData) => {
    if (!packageData) {
      toast.error('Please select a package');
      return;
    }

    try {
      setProcessingPayment(true);
      setSelectedPackage(packageData);

      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session?.user) {
        toast.error('Please sign in to purchase tokens');
        navigate('/auth');
        setProcessingPayment(false);
        return;
      }

      toast.loading('Creating secure checkout session...', { id: 'checkout' });

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const totalTokens = packageData.tokens + packageData.bonus;

      const response = await fetch(`${API_URL}/api/checkout/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          type: 'tokens',
          packageId: packageData.id,
          packageName: packageData.name,
          tokens: totalTokens,
          price: packageData.price,
          stripePriceId: packageData.stripePriceId, // ✅ SEND STRIPE PRICE ID
          userId: session.user.id,
          userEmail: session.user.email
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !data.url) {
        throw new Error(data.error || 'No checkout URL received');
      }

      toast.success('Redirecting to Stripe checkout...', { id: 'checkout' });

      setTimeout(() => {
        window.location.href = data.url;
      }, 500);

    } catch (error) {
      console.error('❌ Checkout error:', error);
      toast.error(error.message || 'Failed to create checkout session', { id: 'checkout' });
      setProcessingPayment(false);
      setSelectedPackage(null);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'purchase': return <CreditCard className="text-green-500" size={20} />;
      case 'spent': return <TrendingUp className="text-red-500" size={20} />;
      case 'bonus': return <Gift className="text-purple-500" size={20} />;
      default: return <DollarSign className="text-blue-500" size={20} />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-cyan-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#0f1420] p-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <WalletIcon className="text-cyan-400" />
              Token Wallet
            </h1>
            <p className="text-slate-400">Manage your AI training tokens</p>
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-cyan-500/30 rounded-3xl p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <p className="text-slate-400 text-sm mb-2 flex items-center gap-2">
                <Sparkles size={16} className="text-cyan-400" />
                Available Balance
              </p>
              <h2 className="text-6xl font-black text-white mb-4">
                {balance.toLocaleString()}
                <span className="text-2xl text-slate-400 ml-2">tokens</span>
              </h2>
              <p className="text-slate-400">≈ ${(balance * 0.01).toFixed(2)} USD value</p>
            </div>
          </div>

          {/* Token Packages */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Zap className="text-yellow-500" />
                Buy Tokens
              </h2>
              <div className="bg-yellow-500/10 border border-yellow-500/30 px-4 py-2 rounded-full">
                <p className="text-yellow-500 text-sm font-bold flex items-center gap-2">
                  <Gift size={16} />
                  Get bonus tokens on Pro & Enterprise
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tokenPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`relative bg-[#1a1f2e] border rounded-2xl p-6 transition-all hover:scale-105 ${
                    pkg.popular 
                      ? 'border-cyan-500 shadow-lg shadow-cyan-500/20' 
                      : 'border-slate-800 hover:border-slate-700'
                  } ${
                    selectedPackage?.id === pkg.id ? 'ring-2 ring-cyan-500' : ''
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-purple-600 px-4 py-1 rounded-full">
                      <p className="text-white text-xs font-bold flex items-center gap-1">
                        <Crown size={12} />
                        MOST POPULAR
                      </p>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                    <p className="text-slate-400 text-sm">{pkg.description}</p>
                  </div>

                  <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Sparkles className="text-cyan-400" size={24} />
                      <p className="text-4xl font-black text-white">
                        {pkg.tokens.toLocaleString()}
                      </p>
                    </div>
                    <p className="text-slate-400 text-center text-sm">tokens</p>
                    
                    {pkg.bonus > 0 && (
                      <div className="mt-3 bg-green-500/10 border border-green-500/30 rounded-lg p-2">
                        <p className="text-green-400 text-sm font-bold text-center flex items-center justify-center gap-1">
                          <Gift size={14} />
                          +{pkg.bonus.toLocaleString()} Bonus Tokens
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2">
                      {pkg.originalPrice && (
                        <p className="text-slate-500 line-through text-lg">
                          ${pkg.originalPrice}
                        </p>
                      )}
                      <p className="text-4xl font-black text-white">
                        ${pkg.price}
                      </p>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">
                      ${((pkg.price / (pkg.tokens + pkg.bonus)) * 1000).toFixed(2)} per 1k tokens
                    </p>
                  </div>

                  <button
                    onClick={() => handleStripeCheckout(pkg)}
                    disabled={processingPayment}
                    className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                      pkg.popular
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:shadow-lg hover:shadow-cyan-500/50'
                        : 'bg-slate-800 text-white hover:bg-slate-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {processingPayment && selectedPackage?.id === pkg.id ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard size={20} />
                        Buy Now
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="text-cyan-400" />
              Transaction History
            </h2>

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
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition"
                  >
                    <div className="flex items-center gap-4">
                      {getTransactionIcon(tx.type)}
                      <div>
                        <p className="text-white font-medium">{tx.description || 'Token Transaction'}</p>
                        <p className="text-slate-400 text-sm">
                          {new Date(tx.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        tx.amount > 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                      </p>
                      <p className="text-slate-400 text-sm">
                        {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-slate-500 text-sm">
            <Check className="text-green-500" size={16} />
            <p>Secured by Stripe • SSL Encrypted</p>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}