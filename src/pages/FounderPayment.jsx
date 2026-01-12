import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = 'https://aigomarket-backend-production-8b8d.up.railway.app/api';

export default function FounderPayment() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleFounderPurchase = async () => {
    setLoading(true);
    try {
      // Get Supabase token
      const authData = localStorage.getItem('sb-cwhthtgynavwinpbjplt-auth-token');
      let token = null;
      if (authData) {
        const parsed = JSON.parse(authData);
        token = parsed?.access_token;
      }

      // Create checkout session for Founder Package
      const response = await axios.post(
        `${API_URL}/payments/checkout`,
        { 
          amount: 1000,  // 1,000 tokens
          price: 29.90,  // Founder price
          package: 'founder'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Redirect to Stripe checkout
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-lg p-8">
        <h1 className="text-3xl font-bold text-white mb-2">Founder Package</h1>
        <p className="text-gray-400 mb-6">One-time payment • Lifetime access</p>

        <div className="mb-8">
          <div className="flex items-baseline mb-4">
            <span className="text-5xl font-bold text-white">$29.90</span>
            <span className="text-gray-400 ml-2">+ $9.90 tokens included</span>
          </div>

          <div className="space-y-3">
            <Feature text="1,000 AIGO Tokens (worth $9.90)" />
            <Feature text="Lifetime platform access" />
            <Feature text="3 Edge AI Model licenses" />
            <Feature text="10GB Dataset storage" />
            <Feature text="Advanced Seed AI compression" />
            <Feature text="Mobile export (iOS + Android)" />
            <Feature text="Custom domain connect" />
            <Feature text="Backend/Frontend pairing" />
            <Feature text="Priority support" />
          </div>
        </div>

        <button
          onClick={handleFounderPurchase}
          disabled={loading}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? 'Processing...' : '💳 Become a Founder Now'}
        </button>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Secured by Stripe • SSL Encrypted
        </p>
      </div>
    </div>
  );
}

function Feature({ text }) {
  return (
    <div className="flex items-center">
      <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
      <span className="text-gray-300">{text}</span>
    </div>
  );
}