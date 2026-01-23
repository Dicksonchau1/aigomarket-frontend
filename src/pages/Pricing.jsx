import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, Crown, Rocket, TrendingUp, Star, Sparkles, X } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Pricing() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('annual');

  const plans = [
    {
      id: 'free',
      name: 'Free',
      icon: Zap,
      price: { annual: 0 },
      description: 'Get started with basic features',
      color: 'from-slate-500 to-slate-600',
      features: [
        '3 active projects',
        'Basic AI model training',
        'Community support',
        '1 GB storage',
        'Public marketplace access',
        'Standard training speed'
      ],
      limitations: [
        'No custom models',
        'Limited API calls',
        'No priority support',
        'No team collaboration'
      ],
      cta: 'Get Started Free',
      highlighted: false
    },
    {
      id: 'standard',
      name: 'Standard',
      icon: Crown,
      price: { annual: 29.90 },
      description: 'Perfect for individual developers',
      color: 'from-cyan-500 to-blue-500',
      features: [
        '10 active projects',
        'Advanced AI models',
        'Email support',
        '25 GB storage',
        '80% marketplace commission',
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
      price: { annual: 99.90 },
      description: 'For teams and advanced use cases',
      color: 'from-purple-500 to-pink-500',
      features: [
        'Unlimited projects',
        'All AI models & features',
        'Priority 24/7 support',
        '100 GB storage',
        '90% marketplace commission',
        'Ultra-fast training (5x speed)',
        'Unlimited API calls',
        'White-label options',
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

  const handleSelectPlan = (planId) => {
    if (planId === 'free') {
      navigate('/register');
      toast.success('Start with our free plan!');
    } else {
      // TODO: Integrate Stripe subscription checkout
      toast.success(`Redirecting to ${planId} subscription checkout...`);
      // navigate to Stripe checkout for subscription
    }
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

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-6 -mt-10 pb-20">
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
                    <div className="flex items-baseline">
                      <span className="text-2xl font-semibold text-slate-400">$</span>
                      <span className="text-5xl font-bold text-white">{plan.price.annual}</span>
                      <span className="text-slate-400 ml-2">/year</span>
                    </div>
                  )}
                  {plan.price.annual > 0 && (
                    <p className="text-sm text-slate-500 mt-2">
                      ${(plan.price.annual / 12).toFixed(2)}/month when billed annually
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition mb-6 ${
                    plan.highlighted
                      ? `bg-gradient-to-r ${plan.color} text-white hover:shadow-lg hover:shadow-cyan-500/30`
                      : 'bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                >
                  {plan.cta}
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
              <p className="text-yellow-400 text-sm font-semibold">
                💎 AI Models: 2,000-4,000 tokens • 📚 Datasets: 1,500 tokens • ⚡ Algorithms: 2,500-3,000 tokens
              </p>
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
            <h2 className="text-4xl font-bold text-white mb-4">Detailed Comparison</h2>
            <p className="text-xl text-slate-400">See what's included in each plan</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="py-4 px-6 text-slate-400 font-semibold">Feature</th>
                  <th className="py-4 px-6 text-center text-white font-bold">Free</th>
                  <th className="py-4 px-6 text-center text-white font-bold">Standard</th>
                  <th className="py-4 px-6 text-center text-white font-bold">Professional</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { name: 'Active Projects', free: '3', standard: '10', pro: 'Unlimited' },
                  { name: 'Storage', free: '1 GB', standard: '25 GB', pro: '100 GB' },
                  { name: 'Training Speed', free: '1x', standard: '2x', pro: '5x' },
                  { name: 'API Calls', free: '1K/mo', standard: '10K/mo', pro: 'Unlimited' },
                  { name: 'Marketplace Commission', free: '50%', standard: '80%', pro: '90%' },
                  { name: 'Team Members', free: '1', standard: '3', pro: 'Unlimited' },
                  { name: 'Support', free: 'Community', standard: 'Email', pro: '24/7 Priority' },
                  { name: 'Custom Models', free: '✗', standard: '✓', pro: '✓' },
                  { name: 'White-label', free: '✗', standard: '✗', pro: '✓' },
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
              a: 'No. Membership unlocks platform features. Tokens are purchased separately and used to buy marketplace items (models, datasets, algorithms).'
            },
            {
              q: 'What payment methods do you accept?',
              a: 'We accept all major credit cards and debit cards via Stripe for both memberships and token purchases.'
            },
            {
              q: 'Is there a free trial for paid plans?',
              a: 'Yes! All paid membership plans come with a 14-day free trial. No credit card required to start.'
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
            Join thousands of developers building with AIPEX
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition font-bold text-lg"
            >
              Start Free
            </button>
            <button
              onClick={() => window.location.href = 'mailto:sales@aipex.ai'}
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