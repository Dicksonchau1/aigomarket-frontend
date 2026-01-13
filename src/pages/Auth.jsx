import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Github, Chrome, ArrowRight, Loader, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Auth() {
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, signInWithProvider } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!fullName.trim()) {
          toast.error('Please enter your full name');
          setLoading(false);
          return;
        }
        
        const { error } = await signUp(email, password, fullName);
        
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Account created! Please check your email to verify.');
        }
      } else {
        const { error } = await signIn(email, password);
        
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Welcome back!');
          navigate(from, { replace: true });
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSignIn = async (provider) => {
    setLoading(true);
    try {
      const { error } = await signInWithProvider(provider);
      if (error) {
        toast.error(error.message);
      }
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
      toast.error(`Failed to sign in with ${provider}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] via-[#1a1f2e] to-[#0a0f1e] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4">
            <span className="text-2xl font-black text-white">AI</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">
            {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-slate-400">
            {mode === 'signup' 
              ? 'Join the AI marketplace revolution' 
              : 'Sign in to your AIGO account'
            }
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-8 shadow-2xl">
          
          {/* Social Sign In */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleProviderSignIn('google')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-xl transition disabled:opacity-50"
            >
              <Chrome size={20} />
              <span>Continue with Google</span>
            </button>
            
            <button
              onClick={() => handleProviderSignIn('github')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-[#24292e] hover:bg-[#1c2127] text-white font-semibold rounded-xl transition disabled:opacity-50"
            >
              <Github size={20} />
              <span>Continue with GitHub</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#1a1f2e] text-slate-400">Or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    required={mode === 'signup'}
                    className="w-full pl-12 pr-4 py-3 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-12 pr-12 py-3 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                <>
                  <span>{mode === 'signup' ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setMode(mode === 'signup' ? 'signin' : 'signup');
                setFullName('');
                setEmail('');
                setPassword('');
              }}
              className="text-sm text-slate-400 hover:text-white transition"
            >
              {mode === 'signup' ? (
                <>Already have an account? <span className="font-semibold text-indigo-400">Sign In</span></>
              ) : (
                <>Don't have an account? <span className="font-semibold text-indigo-400">Sign Up</span></>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}