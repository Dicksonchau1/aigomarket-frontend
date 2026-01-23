import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signUpWithEmail, 
  signInWithEmail, 
  signInWithGoogle, 
  signInWithGithub, 
  signOut as supabaseSignOut,
  getCurrentUser,
  onAuthStateChange,
  resetPassword as supabaseResetPassword
} from '../services/supabaseAuth';
import { database } from '../services/database';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state changed:', event, session?.user?.email);
      
      if (session?.user) {
        setUser(session.user);
        setSession(session);
        
        // ✅ FIX: Break the async deadlock with setTimeout
        setTimeout(async () => {
          try {
            await ensureUserProfile(session.user);
          } catch (error) {
            console.error('❌ Profile creation error:', error);
          } finally {
            setLoading(false); // ✅ CRITICAL: Always set loading to false
          }
        }, 0);
      } else {
        setUser(null);
        setSession(null);
        setLoading(false); // ✅ CRITICAL: Always set loading to false
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { user, error } = await getCurrentUser();
      if (error) throw error;
      
      if (user) {
        setUser(user);
        
        // ✅ FIX: Break the async deadlock
        setTimeout(async () => {
          try {
            await ensureUserProfile(user);
          } catch (error) {
            console.error('❌ Profile check error:', error);
          } finally {
            setLoading(false);
          }
        }, 0);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Error checking user:', error);
      setLoading(false); // ✅ CRITICAL: Always set loading to false
    }
  };

  const ensureUserProfile = async (user) => {
    try {
      console.log('👤 Checking profile for:', user.email);
      const profile = await database.profile.get();
      console.log('✅ Profile exists:', profile);
    } catch (error) {
      console.log('📝 Creating user profile...');
      try {
        await database.profile.update({
          email: user.email,
          display_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          created_at: new Date().toISOString()
        });
        console.log('✅ Profile created');
      } catch (createError) {
        console.error('❌ Profile creation failed:', createError);
      }
    }
  };

  const signUp = async (email, password, fullName) => {
    try {
      console.log('📝 Signing up:', email);
      const { data, error } = await signUpWithEmail(email, password, fullName);
      
      if (error) throw error;

      toast.success('Account created! Please check your email to verify.');
      
      return { data, error: null };
    } catch (error) {
      console.error('❌ Sign up error:', error);
      toast.error(error.message || 'Failed to create account');
      return { data: null, error };
    }
  };

  const signIn = async (email, password) => {
    try {
      console.log('🔑 Signing in:', email);
      const { data, error } = await signInWithEmail(email, password);
      
      if (error) throw error;

      setUser(data.user);
      setSession(data.session);
      
      toast.success('Welcome back!');
      
      return { data, error: null };
    } catch (error) {
      console.error('❌ Sign in error:', error);
      toast.error(error.message || 'Failed to sign in');
      return { data: null, error };
    }
  };

  const signInWithProvider = async (provider) => {
    try {
      console.log(`🔗 Signing in with ${provider}...`);
      let result;
      
      if (provider === 'google') {
        result = await signInWithGoogle();
      } else if (provider === 'github') {
        result = await signInWithGithub();
      }
      
      const { data, error } = result;
      
      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error(`❌ ${provider} sign in error:`, error);
      toast.error(error.message || `Failed to sign in with ${provider}`);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      console.log('👋 Signing out...');
      const { error } = await supabaseSignOut();
      
      if (error) throw error;

      setUser(null);
      setSession(null);
      
      toast.success('Signed out successfully');
      
      return { error: null };
    } catch (error) {
      console.error('❌ Sign out error:', error);
      toast.error(error.message || 'Failed to sign out');
      return { error };
    }
  };

  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabaseResetPassword(email);
      
      if (error) throw error;

      toast.success('Password reset email sent! Check your inbox.');
      
      return { data, error: null };
    } catch (error) {
      console.error('❌ Reset password error:', error);
      toast.error(error.message || 'Failed to send reset email');
      return { data: null, error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithProvider,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};