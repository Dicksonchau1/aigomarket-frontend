import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Loader, CheckCircle, XCircle } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing, success, error

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      console.log('🔄 Processing OAuth callback...');

      // Get session from URL
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        throw sessionError;
      }

      if (!session) {
        console.log('⚠️ No session found, redirecting to auth...');
        toast.error('Authentication failed. Please try again.');
        setStatus('error');
        setTimeout(() => navigate('/auth'), 2000);
        return;
      }

      console.log('✅ Session found:', session.user.email);

      // Check if user profile exists in database
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      // Fallback to 'users' table if 'profiles' table doesn't exist
      if (profileError && profileError.code === '42P01') {
        console.log('📋 Profiles table not found, trying users table...');
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
        console.log('🆕 New user detected - creating profile...');

        // Extract user info
        const email = session.user.email;
        const displayName = 
          session.user.user_metadata?.full_name || 
          session.user.user_metadata?.name || 
          session.user.user_metadata?.username || 
          email?.split('@')[0] || 
          'User';

        // Create user profile
        const profileData = {
          id: session.user.id,
          email: email,
          display_name: displayName,
          avatar_url: session.user.user_metadata?.avatar_url || null,
          is_founder: false,
          created_at: new Date().toISOString(),
        };

        let { error: createError } = await supabase
          .from('profiles')
          .insert([profileData]);

        // Fallback to users table
        if (createError && createError.code === '42P01') {
          console.log('📋 Creating in users table instead...');
          const result = await supabase
            .from('users')
            .insert([{
              id: session.user.id,
              email: email,
              username: displayName,
              is_founder: false,
              created_at: new Date().toISOString(),
            }]);
          
          createError = result.error;
        }

        if (createError) {
          console.error('❌ Profile creation error:', createError);
        } else {
          console.log('✅ Profile created successfully');
        }

        // Create wallet for new user
        await createUserWallet(session.user.id);

        // Success - redirect to founder payment
        setStatus('success');
        toast.success('Welcome to AIGO! 🎉');
        
        setTimeout(() => {
          console.log('🚀 Redirecting new user to /founder-payment');
          navigate('/founder-payment');
        }, 1000);

      } else {
        // Existing user - redirect to dashboard
        console.log('👤 Existing user detected');
        setStatus('success');
        toast.success(`Welcome back, ${profile.display_name || profile.username || 'user'}!`);
        
        setTimeout(() => {
          console.log('🚀 Redirecting existing user to /dashboard');
          navigate('/dashboard');
        }, 1000);
      }

    } catch (error) {
      console.error('❌ OAuth callback error:', error);
      setStatus('error');
      toast.error('Authentication failed. Please try again.');
      
      setTimeout(() => {
        navigate('/auth');
      }, 2000);
    }
  };

  // Create wallet for new user
  const createUserWallet = async (userId) => {
    try {
      console.log('💰 Creating wallet for user...');

      // Check if wallet already exists
      const { data: existingWallet } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingWallet) {
        console.log('💰 Wallet already exists');
        return;
      }

      // Create new wallet
      const { error } = await supabase
        .from('wallets')
        .insert([{
          user_id: userId,
          balance: 0,
          created_at: new Date().toISOString(),
        }]);

      if (error) {
        console.error('❌ Wallet creation error:', error);
      } else {
        console.log('✅ Wallet created successfully');
      }
    } catch (error) {
      console.error('❌ Error in createUserWallet:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        
        {/* Processing State */}
        {status === 'processing' && (
          <>
            <Loader className="w-16 h-16 text-cyan-500 animate-spin mx-auto mb-6" />
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
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
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
    </div>
  );
}