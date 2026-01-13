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
      console.log('Auth state changed:', event, session);
      
      if (session?.user) {
        setUser(session.user);
        setSession(session);
        
        await ensureUserProfile(session.user);
      } else {
        setUser(null);
        setSession(null);
      }
      
      setLoading(false);
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
        await ensureUserProfile(user);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const ensureUserProfile = async (user) => {
    try {
      await database.profile.get();
    } catch (error) {
      console.log('Creating user profile...');
      await database.profile.update({
        email: user.email,
        display_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        created_at: new Date().toISOString()
      });
    }
  };

  const signUp = async (email, password, fullName) => {
    try {
      const { data, error } = await signUpWithEmail(email, password, fullName);
      
      if (error) throw error;

      toast.success('Account created! Please check your email to verify.');
      
      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to create account');
      return { data: null, error };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await signInWithEmail(email, password);
      
      if (error) throw error;

      setUser(data.user);
      setSession(data.session);
      
      toast.success('Welcome back!');
      
      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Failed to sign in');
      return { data: null, error };
    }
  };

  const signInWithProvider = async (provider) => {
    try {
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
      console.error(`${provider} sign in error:`, error);
      toast.error(error.message || `Failed to sign in with ${provider}`);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabaseSignOut();
      
      if (error) throw error;

      setUser(null);
      setSession(null);
      
      toast.success('Signed out successfully');
      
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
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
      console.error('Reset password error:', error);
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