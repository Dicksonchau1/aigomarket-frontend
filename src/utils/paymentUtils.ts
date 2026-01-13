// src/utils/paymentUtils.ts

export const handlePaymentResponse = async (response: any) => {
  if (!response) {
    throw new Error('No response received from payment server');
  }

  if (response.error) {
    throw new Error(response.error.message || 'Payment processing failed');
  }

  if (!response.checkout_url) {
    throw new Error('Invalid payment response received');
  }

  return response;
};

export const validatePaymentSession = (sessionId: string) => {
  if (!sessionId || typeof sessionId !== 'string') {
    throw new Error('Invalid payment session');
  }
  return sessionId.trim();
};

export const formatPaymentAmount = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);
};