import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ConfirmEmail() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    // Get user email from session
    const getUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setEmail(user.email);
      } else {
        // If no user, try to get from localStorage
        const storedEmail = localStorage.getItem('signup_email');
        if (storedEmail) {
          setEmail(storedEmail);
        }
      }
    };
    
    getUserEmail();
  }, []);

  const handleResendEmail = async () => {
    if (!email) return;
    
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;
      
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch (error) {
      console.error('Error resending email:', error);
      alert('Failed to resend email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
        
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-28 h-28 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full mx-auto flex items-center justify-center mb-6 animate-bounce">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
            </svg>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Check Your Email! 📬
          </h1>
          
          <p className="text-xl text-gray-200 mb-2">
            We've sent a confirmation link to:
          </p>
          
          <p className="text-2xl font-semibold text-indigo-300 mb-6 break-all">
            {email || 'your email address'}
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">✉️</span>
            Next Steps:
          </h2>
          
          <ol className="space-y-4 text-gray-200">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center font-bold text-white">1</span>
              <div>
                <p className="font-semibold text-white">Open your email inbox</p>
                <p className="text-sm text-gray-300">Check your inbox for an email from AIGO</p>
              </div>
            </li>
            
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center font-bold text-white">2</span>
              <div>
                <p className="font-semibold text-white">Click the confirmation link</p>
                <p className="text-sm text-gray-300">The link will verify your email address</p>
              </div>
            </li>
            
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center font-bold text-white">3</span>
              <div>
                <p className="font-semibold text-white">Start exploring AIGO!</p>
                <p className="text-sm text-gray-300">You'll receive <span className="text-yellow-400 font-bold">100 AIGO tokens</span> as a welcome bonus</p>
              </div>
            </li>
          </ol>
        </div>

        {/* Tips */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-yellow-300 mb-3 flex items-center gap-2">
            <span className="text-xl">💡</span>
            Didn't receive the email?
          </h3>
          
          <ul className="space-y-2 text-gray-200 text-sm mb-4">
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span>Check your <strong>spam/junk folder</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span>Make sure you entered the correct email address</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span>Wait a few minutes - it may take time to arrive</span>
            </li>
          </ul>

          <button
            onClick={handleResendEmail}
            disabled={resending || resent}
            className={`w-full py-3 px-6 rounded-full font-semibold transition-all duration-300 ${
              resent 
                ? 'bg-green-500 text-white cursor-not-allowed'
                : resending
                ? 'bg-gray-500 text-white cursor-wait'
                : 'bg-yellow-500 text-gray-900 hover:bg-yellow-400 hover:shadow-lg hover:scale-105'
            }`}
          >
            {resent ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Email Sent!
              </span>
            ) : resending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : (
              '📧 Resend Confirmation Email'
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/login')}
            className="flex-1 py-4 px-6 bg-white/10 backdrop-blur text-white rounded-full font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            ← Back to Login
          </button>
          
          <button
            onClick={() => window.location.href = 'https://mail.google.com'}
            className="flex-1 py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            Open Gmail →
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-center text-gray-400 text-sm mt-8">
          Having trouble? Contact us at{' '}
          <a href="mailto:support@aigomarket.com" className="text-indigo-400 hover:text-indigo-300 underline">
            support@aigomarket.com
          </a>
        </p>
      </div>
    </div>
  );
}