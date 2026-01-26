import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentSuccess.css';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/wallet');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-icon">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1>🎉 Payment Successful!</h1>
        <p className="success-message">
          Your tokens have been added to your wallet.
        </p>

        <div className="countdown">
          <p>Redirecting to wallet in</p>
          <div className="countdown-number">{countdown}</div>
          <p>seconds...</p>
        </div>

        <button 
          onClick={() => navigate('/wallet')}
          className="wallet-btn"
        >
          Go to Wallet Now
        </button>

        <button 
          onClick={() => navigate('/')}
          className="home-btn"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}