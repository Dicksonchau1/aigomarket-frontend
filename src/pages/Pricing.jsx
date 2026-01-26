import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, Crown, Rocket, Sparkles, X, CheckCircle, Calendar, Award, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Pricing() {
  const navigate = useNavigate();
  const [processingCheckout, setProcessingCheckout] = useState(false);

  // Load Stripe Buy Button script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

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
      highlighted: false,
      stripeBuyButtonId: null
    },
    {
      id: 'standard',
      name: 'Standard',
      icon: Crown,
      price: { annual: 29.99, discounted: 19.99 },
      description: 'Perfect for individual developers',
      color: 'from-cyan-500 to-blue-500',
      features: [
        '3 AI models included',
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
      badge: 'Most Popular',
      stripeBuyButtonId: 'buy_btn_1StgABK16GbLKgfGQ8sXM6um'
    },
    {
      id: 'pro',
      name: 'Professional',
      icon: Rocket,
      price: { annual: 99.99, discounted: 89.99 },
      description: 'For teams and power users',
      color: 'from-purple-500 to-pink-500',
      features: [
        '5 AI models included',
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
      highlighted: false,
      stripeBuyButtonId: 'buy_btn_1StgAvK16GbLKgfGNla6RbFX'
    }
  ];

  const handleSelectPlan = async (planId) => {
    if (planId === 'free') {
      navigate('/auth');
      toast.success('Start with our free plan!');
      return;
    }

    // For paid plans, the Stripe Buy Button will handle checkout
    // No custom checkout logic needed
    toast.success('Click the Subscribe button below to continue', {
      duration: 3000
    });
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
              💡 Tokens are purchased separately for marketplace items
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

                {/* Stripe Buy Button or Free Plan Button */}
                <div className="mb-6">
                  {plan.stripeBuyButtonId ? (
                    <div className="flex flex-col items-center">
                      <stripe-buy-button
                        buy-button-id={plan.stripeBuyButtonId}
                        publishable-key="pk_live_51SPFUUK16GbLKgfGpgxz9s42wKYJB9iV0z93I4xZeVEhS7eXa3Ti0lJur9mEEV2gUFETXPozdUA7UEFdh0Yx6Aek00TuxWsJGR"
                      >
                      </stripe-buy-button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={processingCheckout}
                      className={`w-full py-4 rounded-xl font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
                        plan.highlighted
                          ? `bg-gradient-to-r ${plan.color} text-white hover:shadow-lg hover:shadow-cyan-500/30`
                          : 'bg-slate-800 text-white hover:bg-slate-700'
                      }`}
                    >
                      {processingCheckout ? 'Processing...' : plan.cta}
                    </button>
                  )}
                </div>

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

        {/* Token Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 border-2 border-yellow-500/30 rounded-2xl p-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="text-yellow-400" size={28} />
                <h3 className="text-2xl font-bold text-white">Need Tokens?</h3>
              </div>
              <p className="text-slate-300 text-lg mb-2">
                Purchase tokens separately to buy AI models, datasets, and algorithms in the marketplace
              </p>
              <div className="space-y-1">
                <p className="text-yellow-400 text-sm font-semibold">
                  💰 Starter Pack: 500 tokens - $9.99
                </p>
                <p className="text-yellow-400 text-sm font-semibold">
                  🔥 Popular Pack: 1,800 tokens (1500 + 300 bonus) - $19.99
                </p>
                <p className="text-yellow-400 text-sm font-semibold">
                  💎 Best Value: 6,000 tokens (5000 + 1000 bonus) - $39.99
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/wallet')}
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg shadow-yellow-500/30 transition flex items-center gap-2"
            >
              <Sparkles size={20} />
              Buy Tokens
            </button>
          </div>
        </motion.div>
      </div>

      {/* Comparison Table */}
      <div className="bg-[#1a1f2e] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-sm font-bold mb-4">
              💰 Limited Time: $10 OFF with code LAUNCH2026
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Detailed Comparison</h2>
            <p className="text-xl text-slate-400">See what's included in each plan</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="py-4 px-6 text-slate-400 font-semibold">Feature</th>
                  <th className="py-4 px-6 text-center text-white font-bold">Free</th>
                  <th className="py-4 px-6 text-center">
                    <div className="text-white font-bold mb-1">Standard</div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm text-slate-500 line-through">$29.99</span>
                      <span className="text-lg text-green-400 font-bold">$19.99</span>
                    </div>
                  </th>
                  <th className="py-4 px-6 text-center">
                    <div className="text-white font-bold mb-1">Professional</div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm text-slate-500 line-through">$99.99</span>
                      <span className="text-lg text-purple-400 font-bold">$89.99</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { name: 'Active Projects', free: '1', standard: 'Unlimited', pro: 'Unlimited' },
                  { name: 'AI Models', free: '0', standard: '3', pro: '5' },
                  { name: 'Storage', free: '1 GB', standard: '25 GB', pro: '100 GB' },
                  { name: 'Training Speed', free: '1x', standard: '2x', pro: '5x' },
                  { name: 'API Calls', free: '1K/mo', standard: '10K/mo', pro: 'Unlimited' },
                  { name: 'Creator Commission', free: '0%', standard: '50%', pro: '95%' },
                  { name: 'Team Members', free: '1', standard: '3', pro: 'Unlimited' },
                  { name: 'Support', free: 'Community', standard: 'Email', pro: '24/7 Priority' },
                  { name: 'Custom Models', free: '✗', standard: '✓', pro: '✓' },
                  { name: 'White-label', free: '✗', standard: '✗', pro: '✓' },
                  { name: 'Marketing Support', free: '✗', standard: '✗', pro: '✓' },
                  { name: 'SLA', free: '✗', standard: '✗', pro: '✓' }
                ].map((row, i) => (
                  <tr key={i} className="border-b border-slate-800">
                    <td className="py-4 px-6 text-slate-300 font-medium">{row.name}</td>
                    <td className="py-4 px-6 text-center text-slate-400">{row.free}</td>
                    <td className="py-4 px-6 text-center text-cyan-400 font-semibold">{row.standard}</td>
                    <td className="py-4 px-6 text-center text-purple-400 font-semibold">{row.pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
              a: 'No. Membership unlocks platform features and AI models. Tokens are purchased separately and used to buy marketplace items (models, datasets, algorithms).'
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