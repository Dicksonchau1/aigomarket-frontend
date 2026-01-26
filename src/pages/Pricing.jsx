import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, Crown, Rocket, Sparkles, X, CheckCircle, Calendar, Award, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

// ✅ FIXED: Use your Railway backend URL
const API_URL = 'https://aigomarket-backend-production-8b8d.up.railway.app';

export default function Pricing() {
  const navigate = useNavigate();
  const [processingCheckout, setProcessingCheckout] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      icon: Zap,
      price: { annual: 0 },
      description: 'Get started with basic features',
      color: 'from-slate-500 to-slate-600',
      features: [
        '1 active project',
        'Basic AI model training',
        'Community support',
        '1 GB storage',
        'Public marketplace access',
        'Standard training speed'
      ],
      limitations: [
        'No custom models',
        'Limited API calls',
        'No creator commission',
        'No team collaboration'
      ],
      cta: 'Get Started Free',
      highlighted: false
    },
    {
      id: 'standard',
      name: 'Standard',
      icon: Crown,
      price: { annual: 29.99, discounted: 19.99 },
      description: 'Perfect for individual developers',
      color: 'from-cyan-500 to-blue-500',
      features: [
        '1,500 AI tokens (one-time)',
        '50% creator commission',
        'Advanced AI model training',
        'Email support',
        '25 GB storage',
        'Fast training (2x speed)',
        'Custom model architecture',
        'API access (10K calls/month)',
        'Advanced analytics',
        'Version control',
        'Collaboration tools (3 members)'
      ],
      limitations: [],
      cta: 'Subscribe to Standard',
      highlighted: true,
      badge: 'Most Popular'
    },
    {
      id: 'pro',
      name: 'Professional',
      icon: Rocket,
      price: { annual: 99.99, discounted: 89.99 },
      description: 'For teams and power users',
      color: 'from-purple-500 to-pink-500',
      features: [
        '5,000 AI tokens (one-time)',
        '95% creator commission',
        'Priority 24/7 support',
        'White label options',
        'Full marketing support',
        '100 GB storage',
        'Ultra-fast training (5x speed)',
        'Unlimited API calls',
        'Custom integrations',
        'Advanced security',
        'Team collaboration (unlimited)',
        'Dedicated account manager',
        'SLA guarantees',
        'Early access to new features'
      ],
      limitations: [],
      cta: 'Subscribe to Pro',
      highlighted: false
    }
  ];

  const handleSelectPlan = async (planId) => {
    if (planId === 'free') {
      navigate('/auth');
      toast.success('Start with our free plan!');
      return;
    }

    try {
      setProcessingCheckout(true);
      toast.loading('Redirecting to secure checkout...', { id: 'checkout' });

      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session) {
        toast.error('Please sign in first', { id: 'checkout' });
        navigate('/auth');
        setProcessingCheckout(false);
        return;
      }

      const PROMO_END_DATE = new Date('2026-02-14');
      const applyLaunchPromo = new Date() < PROMO_END_DATE;

      console.log('🚀 Making request to:', `${API_URL}/api/checkout/create-checkout-session`);

      const response = await fetch(`${API_URL}/api/checkout/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          type: 'subscription',
          planId: planId,
          userId: session.user.id,
          applyLaunchPromo: applyLaunchPromo
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      toast.success('Redirecting to Stripe...', { id: 'checkout' });
      window.location.href = data.url;

    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to start checkout', { id: 'checkout' });
      setProcessingCheckout(false);
    }
  };

  const copyPromoCode = () => {
    navigator.clipboard.writeText('LAUNCH2026');
    toast.success('✅ Promo code copied!', {
      icon: '🎉',
      duration: 2000
    });
  };

  return (
    <div className="min-h-screen bg-[#0f1420]">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#1a1f2e] to-[#0f1420] py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-block px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-cyan-400 text-sm font-semibold mb-6">
              Annual Billing Only
            </span>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
              Choose Your Membership
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-4">
              Unlock platform features with annual membership plans
            </p>
            <p className="text-sm text-slate-500 max-w-2xl mx-auto">
              💡 Tokens are included with each subscription
            </p>
          </motion.div>
        </div>
      </div>

      {/* Launch Promotion Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-6 -mt-6 mb-8"
      >
        <div className="bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-teal-500/20 border-2 border-green-500/40 rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-emerald-600/10 to-teal-600/10 animate-pulse"></div>
          
          <div className="relative text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/30 border border-green-400/50 rounded-full text-green-300 text-sm font-bold mb-4">
              <Sparkles className="w-4 h-4 animate-spin" />
              🎉 LAUNCH SPECIAL - ENDS FEB 14, 2026
            </div>
            
            <h2 className="text-5xl font-bold text-white mb-3">
              Get{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400">
                $10 OFF
              </span>{' '}
              Any Annual Plan!
            </h2>
            
            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-1">Standard Plan</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl text-slate-500 line-through">$29.99</span>
                  <span className="text-4xl font-bold text-green-400">$19.99</span>
                  <span className="text-slate-400">/year</span>
                </div>
              </div>
              
              <div className="h-12 w-px bg-slate-700"></div>
              
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-1">Pro Plan</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl text-slate-500 line-through">$99.99</span>
                  <span className="text-4xl font-bold text-green-400">$89.99</span>
                  <span className="text-slate-400">/year</span>
                </div>
              </div>
            </div>
            
            <p className="text-slate-300 text-lg mb-6 max-w-2xl mx-auto">
              Subscribe now and save <span className="text-green-400 font-bold text-xl">$10</span> on your first year! 
              Perfect time to unlock all features.
            </p>
            
            {/* Promo Code Box */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="group px-8 py-5 bg-gradient-to-r from-slate-900 to-slate-800 border-2 border-green-500/50 rounded-2xl hover:border-green-400 transition-all hover:scale-105 cursor-pointer">
                <p className="text-sm text-slate-400 mb-2 font-medium">💰 Use Promo Code:</p>
                <code className="text-4xl font-mono font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent tracking-wider">
                  LAUNCH2026
                </code>
              </div>
              
              <button
                onClick={copyPromoCode}
                className="px-6 py-4 bg-green-500/20 hover:bg-green-500/30 border-2 border-green-500/40 hover:border-green-400 text-green-300 rounded-xl transition-all hover:scale-105 flex items-center gap-2 font-semibold"
              >
                <Copy className="w-5 h-5" />
                Copy Code
              </button>
            </div>
            
            {/* Benefits */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm mb-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-300 font-medium">Save $10 instantly</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300 font-medium">Valid until Feb 14, 2026</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <Award className="w-4 h-4 text-purple-400" />
                <span className="text-purple-300 font-medium">One per customer</span>
              </div>
            </div>
            
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-4">
              <span className="text-2xl">⏰</span>
              <span className="text-yellow-300 font-semibold">Limited time offer - Don't miss out!</span>
            </div>
            
            <p className="text-xs text-slate-500 max-w-2xl mx-auto">
              💳 Enter code <code className="text-green-400 font-mono">LAUNCH2026</code> at checkout to claim your discount. 
              Valid on new subscriptions only.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const Icon = plan.icon;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-[#1a1f2e] border rounded-2xl p-8 ${
                  plan.highlighted
                    ? 'border-cyan-500 shadow-2xl shadow-cyan-500/20 scale-105'
                    : 'border-slate-800'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-bold rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${plan.color} p-0.5 mb-6`}>
                  <div className="w-full h-full bg-[#1a1f2e] rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-slate-400 mb-6">{plan.description}</p>

                <div className="mb-6">
                  {plan.price.annual === 0 ? (
                    <div className="flex items-baseline">
                      <span className="text-5xl font-bold text-white">Free</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline justify-center gap-2 mb-2">
                        <span className="text-2xl font-semibold text-slate-500 line-through">
                          ${plan.price.annual}
                        </span>
                        <span className="px-2 py-1 bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-bold rounded">
                          SAVE $10
                        </span>
                      </div>
                      <div className="flex items-baseline justify-center">
                        <span className="text-2xl font-semibold text-slate-400">$</span>
                        <span className="text-5xl font-bold text-white">
                          {plan.price.discounted.toFixed(2)}
                        </span>
                        <span className="text-slate-400 ml-2">/year</span>
                      </div>
                      <p className="text-sm text-green-400 mt-2 font-semibold text-center">
                        with code LAUNCH2026
                      </p>
                      <p className="text-sm text-slate-500 mt-2 text-center">
                        ${(plan.price.discounted / 12).toFixed(2)}/month when billed annually
                      </p>
                    </>
                  )}
                </div>

                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={processingCheckout}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition mb-6 disabled:opacity-50 disabled:cursor-not-allowed ${
                    plan.highlighted
                      ? `bg-gradient-to-r ${plan.color} text-white hover:shadow-lg hover:shadow-cyan-500/30`
                      : 'bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                >
                  {processingCheckout ? 'Processing...' : plan.cta}
                </button>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-300 mb-3">What's included:</p>
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.limitations.length > 0 && (
                    <>
                      <div className="border-t border-slate-800 my-4"></div>
                      <p className="text-sm font-semibold text-slate-500 mb-2">Not included:</p>
                      {plan.limitations.map((limitation, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-500 text-sm">{limitation}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'Can I change plans anytime?',
              a: 'Yes! You can upgrade or downgrade your membership at any time. Changes take effect at the start of your next billing cycle.'
            },
            {
              q: 'Are tokens included in membership?',
              a: 'Yes! Standard includes 1,500 tokens and Professional includes 5,000 tokens given once upon subscription.'
            },
            {
              q: 'What payment methods do you accept?',
              a: 'We accept all major credit cards and debit cards via Stripe for both memberships and token purchases.'
            },
            {
              q: 'How do I use the LAUNCH2026 promo code?',
              a: 'Simply enter the code LAUNCH2026 at checkout to get $10 off your first year. The discount is automatically applied and valid until February 14, 2026.'
            },
            {
              q: 'Do you offer refunds?',
              a: 'Yes, we offer a 30-day money-back guarantee for annual memberships. Tokens are refundable if unused within 30 days.'
            }
          ].map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-2">{faq.q}</h3>
              <p className="text-slate-400">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border-y border-cyan-500/20 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of developers building with AIGO
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigate('/auth')}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition font-bold text-lg"
            >
              Start Free
            </button>
            <button
              onClick={() => window.location.href = 'mailto:sales@aigo.ai'}
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition font-bold text-lg"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}