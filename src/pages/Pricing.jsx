import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Crown, Zap, Tag, Shield, Sparkles } from 'lucide-react';

function Pricing() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleSubscribe = (plan) => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Redirect to Stripe Payment Link with customer reference
    const paymentUrl = `${plan.stripePaymentLink}?client_reference_id=${user.id}`;
    window.location.href = paymentUrl;
  };

  const plans = [
    {
      id: 'standard',
      name: 'Standard',
      price: 29.90,
      displayPrice: '$29.90',
      period: '/year',
      monthlyEquivalent: '$2.49/month',
      tokens: 1500,
      icon: Zap,
      color: 'blue',
      popular: true,
      features: [
        '1,500 AI tokens (one-time upon subscription)',
        'Valid for 1 year',
        'Access to advanced AI models',
        'Priority email support',
        'Full marketplace access',
        'Faster processing speed',
        'API access',
        'Custom AI training',
        'Analytics dashboard'
      ],
      stripePaymentLink: 'https://buy.stripe.com/28EdRa8PRaNh9p6fMSbsc09'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 99.90,
      displayPrice: '$99.90',
      period: '/year',
      monthlyEquivalent: '$8.33/month',
      tokens: 5000,
      icon: Crown,
      color: 'purple',
      badge: 'BEST VALUE',
      features: [
        '5,000 AI tokens (one-time upon subscription)',
        'Valid for 1 year',
        'Access to all AI models',
        'Priority chat support',
        'Full marketplace access',
        'Fastest processing speed',
        'Advanced API access',
        'Custom AI training',
        'Advanced analytics',
        'Team collaboration tools',
        'White-label options',
        'Dedicated account manager'
      ],
      stripePaymentLink: 'https://buy.stripe.com/28E7sMaXZ4oTbxe1W2bsc0a'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-purple-500/20 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-5 h-5 text-purple-400 mr-2" />
            <span className="text-purple-300 font-semibold">Annual Subscription Plans</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Subscribe yearly and get your tokens instantly. Use them anytime during your subscription.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = user?.subscription_plan === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative bg-gray-800 rounded-2xl p-8 shadow-2xl border-2 transition-all duration-300 hover:scale-105 ${
                  plan.popular
                    ? 'border-blue-500 shadow-blue-500/50'
                    : 'border-purple-500 shadow-purple-500/50'
                } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Best Value Badge */}
                {plan.badge && (
                  <div className="absolute -top-4 right-4">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center shadow-lg">
                      <Check className="w-3 h-3 mr-1" />
                      Current Plan
                    </span>
                  </div>
                )}

                {/* Icon */}
                <div className={`inline-flex p-3 rounded-lg bg-${plan.color}-500/20 mb-4`}>
                  <Icon className={`w-8 h-8 text-${plan.color}-400`} />
                </div>

                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 mb-6">Annual Subscription</p>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-5xl font-bold text-white">{plan.displayPrice}</span>
                  <span className="text-gray-400 text-lg">{plan.period}</span>
                  <p className="text-gray-400 text-sm mt-2">{plan.monthlyEquivalent} when billed annually</p>
                </div>

                {/* Token Allocation */}
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 mb-6 border border-purple-500/30">
                  <p className="text-center text-white font-semibold text-lg">
                    {plan.tokens.toLocaleString()} AI Tokens
                  </p>
                  <p className="text-center text-purple-300 text-sm mt-1">Given once upon subscription</p>
                </div>

                {/* Features */}
                <div className="mb-8">
                  <p className="text-sm text-gray-400 mb-3 font-semibold">What's included:</p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-gray-300">
                        <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Subscribe Button */}
                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={isCurrentPlan}
                  className={`w-full py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                    isCurrentPlan
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : !user
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg'
                  }`}
                >
                  {!user ? 'Login to Subscribe' : isCurrentPlan ? 'Current Plan' : 'Subscribe Now'}
                </button>
              </div>
            );
          })}
        </div>

        {/* How It Works */}
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 mb-16">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4">
                <span className="text-3xl font-bold text-blue-400">1</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Choose Plan</h4>
              <p className="text-gray-400 text-sm">Select the plan that fits your needs</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 mb-4">
                <span className="text-3xl font-bold text-purple-400">2</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Secure Payment</h4>
              <p className="text-gray-400 text-sm">Complete payment via Stripe securely</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-500/20 mb-4">
                <span className="text-3xl font-bold text-pink-400">3</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Instant Access</h4>
              <p className="text-gray-400 text-sm">Tokens added immediately to your account</p>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-green-400" />
            <p className="text-gray-400 text-sm">
              Secure payment powered by <span className="text-white font-semibold">Stripe</span>
            </p>
          </div>
          <div className="flex justify-center items-center gap-6 opacity-70">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" 
              alt="Visa" 
              className="h-6" 
            />
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Mastercard_2019_logo.svg/200px-Mastercard_2019_logo.svg.png" 
              alt="Mastercard" 
              className="h-6" 
            />
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/320px-PayPal.svg.png" 
              alt="PayPal" 
              className="h-8" 
            />
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <details className="bg-gray-800 rounded-lg p-6 group">
              <summary className="text-lg font-semibold text-white cursor-pointer list-none flex items-center justify-between">
                When do I get my tokens?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-400 mt-3">Tokens are added to your account immediately after payment confirmation. They are given once upon subscription.</p>
            </details>

            <details className="bg-gray-800 rounded-lg p-6 group">
              <summary className="text-lg font-semibold text-white cursor-pointer list-none flex items-center justify-between">
                What happens after 1 year?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-400 mt-3">Your subscription renews automatically at the same price. You can cancel anytime from your account settings before the renewal date.</p>
            </details>

            <details className="bg-gray-800 rounded-lg p-6 group">
              <summary className="text-lg font-semibold text-white cursor-pointer list-none flex items-center justify-between">
                Do tokens expire?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-400 mt-3">Tokens remain in your account as long as your subscription is active. If you cancel, you can still use remaining tokens until expiration.</p>
            </details>

            <details className="bg-gray-800 rounded-lg p-6 group">
              <summary className="text-lg font-semibold text-white cursor-pointer list-none flex items-center justify-between">
                Can I upgrade my plan?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-400 mt-3">Yes! You can upgrade to Professional at any time. The price difference will be prorated, and you'll receive additional tokens immediately.</p>
            </details>

            <details className="bg-gray-800 rounded-lg p-6 group">
              <summary className="text-lg font-semibold text-white cursor-pointer list-none flex items-center justify-between">
                What payment methods do you accept?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-400 mt-3">We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and other payment methods via Stripe.</p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pricing;