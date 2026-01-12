import axios from 'axios';

const API_URL = 'https://aigomarket-backend-production-8b8d.up.railway.app/api';

// Helper to get Supabase auth token
const getAuthToken = () => {
  try {
    const authData = localStorage.getItem('sb-cwhthtgynavwinpbjplt-auth-token');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed?.access_token || null;
    }
  } catch (error) {
    console.error('Error parsing auth token:', error);
  }
  return null;
};

// Purchase Founder Package ($29.90)
export const purchaseFounderPackage = async () => {
  try {
    const token = getAuthToken();
    
    const response = await axios.post(
      `${API_URL}/payments/checkout`,
      { 
        amount: 1000,
        price: 29.90,
        package: 'founder'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    if (response.data.checkout_url) {
      window.location.href = response.data.checkout_url;
    }
    return response.data;
  } catch (error) {
    console.error('Founder package payment error:', error);
    throw error;
  }
};

// Purchase Regular Tokens ($9.90)
export const purchaseTokens = async (amount = 1000) => {
  try {
    const token = getAuthToken();
    
    const response = await axios.post(
      `${API_URL}/payments/checkout`,
      { 
        amount,
        price: 9.90 
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    if (response.data.checkout_url) {
      window.location.href = response.data.checkout_url;
    }
    return response.data;
  } catch (error) {
    console.error('Payment error:', error);
    throw error;
  }
};

// Get Payment History
export const getPaymentHistory = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/payments/history`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return [];
  }
};

// Get Token Balance
export const getTokenBalance = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/users/tokens`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.balance;
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return 0;
  }
};

// Verify Payment Status
export const verifyPayment = async (sessionId) => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/payments/verify/${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};