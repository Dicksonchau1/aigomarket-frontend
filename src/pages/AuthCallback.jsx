import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Loader, CheckCircle, XCircle } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing, success, error

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      console.log('?? Processing auth callback...');

      // Get session from URL
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('??Session error:', sessionError);
        throw sessionError;
      }

      if (!session) {
        console.log('? ï? No session found, redirecting to auth...');
        toast.error('Authentication failed. Please try again.');
        setStatus('error');
        setTimeout(() => navigate('/auth'), 2000);
        return;
      }

      console.log('??Session found:', session.user.email);

      // ??Check if this is from email confirmation
      const isEmailConfirmation = window.location.hash.includes('type=signup') || 
                                   window.location.search.includes('type=signup');

      // Check if user profile exists
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      // Fallback to users table if profiles doesn't exist
      if (profileError && profileError.code === '42P01') {
        console.log('?? Profiles table not found, trying users table...');
        const result = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        
        profile = result.data;
        profileError = result.error;
      }

      // Determine if this is a new user
      const isNewUser = !profile;

      if (isNewUser) {
        console.log('?? New user detected - creating profile...');

        // Extract user info
        const email = session.user.email;
        const displayName = 
          session.user.user_metadata?.full_name || 
          session.user.user_metadata?.name || 
          session.user.user_metadata?.display_name ||
          session.user.user_metadata?.username || 
          localStorage.getItem('signup_name') ||
          email?.split('@')[0] || 
          'User';

        // Note: Profile and wallet should be auto-created by database trigger
        // But we can verify/create as fallback

        // Success message
        setStatus('success');
        toast.success('Welcome to AIGO! ??');
        
        setTimeout(() => {
          console.log('?? Redirecting new user to /pricing');
          // Clear stored signup data
          localStorage.removeItem('signup_email');
          localStorage.removeItem('signup_name');
          navigate('/pricing');
        }, 1500);

      } else {
        // Existing user
        console.log('?‘¤ Existing user detected');
        setStatus('success');
        
        const userName = profile.display_name || profile.username || 'there';
        toast.success(`Welcome back, ${userName}!`);
        
        setTimeout(() => {
          console.log('?? Redirecting existing user to /dashboard');
          navigate('/dashboard');
        }, 1500);
      }

    } catch (error) {
      console.error('??Auth callback error:', error);
      setStatus('error');
      toast.error('Authentication failed. Please try again.');
      
      setTimeout(() => {
        navigate('/auth');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        
        {/* Processing State */}
        {status === 'processing' && (
          <>
            <div className="relative">
              <Loader className="w-16 h-16 text-cyan-500 animate-spin mx-auto mb-6" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 border-4 border-cyan-500/20 rounded-full"></div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Completing Sign In</h2>
            <p className="text-slate-400">Please wait while we set up your account...</p>
            <div className="mt-6 flex justify-center gap-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </>
        )}

        {/* Success State */}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Success!</h2>
            <p className="text-slate-400">Redirecting you now...</p>
          </>
        )}

        {/* Error State */}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Authentication Failed</h2>
            <p className="text-slate-400">Redirecting you back to sign in...</p>
          </>
        )}

      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
