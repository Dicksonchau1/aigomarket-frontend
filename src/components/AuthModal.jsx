import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaGithub, FaGoogle, FaBolt, FaEnvelope, FaLock, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AuthModal = ({ isOpen, onClose, initialMode = 'signin' }) => {
    const { signIn, signUp, signInWithGoogle, signInWithGithub } = useAuth();
    const navigate = useNavigate();
    
    // Standardized to use 'signin' or 'signup'
    const [mode, setMode] = useState(initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Sync internal mode with external prop
    useEffect(() => {
        setMode(initialMode);
    }, [initialMode]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (mode === 'signin') {
                const { error } = await signIn(email, password);
                if (error) throw error;
                toast.success('Welcome back!');
                navigate('/dashboard');
            } else {
                const { error } = await signUp(email, password);
                if (error) throw error;
                toast.success('Confirmation email sent!');
            }
            onClose();
        } catch (err) {
            toast.error(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
            onClick={onClose}
        >
            <div 
                className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-3xl p-10 relative shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-500 hover:text-white transition"
                >
                    <FaTimes size={18} />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-cyan-500/20">
                        <FaBolt className="text-white text-xl" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                        {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-slate-400 text-sm">
                        {mode === 'signin' 
                            ? 'Sign in to your Founder Dashboard' 
                            : 'Start building your AI-powered MVP today'}
                    </p>
                </div>

                {/* Social Login Buttons */}
                <div className="space-y-3 mb-6">
                    <button 
                        type="button" 
                        onClick={() => signInWithGithub()}
                        className="w-full py-3 bg-[#020617] border border-slate-700 hover:border-slate-500 rounded-xl text-white font-semibold flex items-center justify-center gap-3 transition"
                    >
                        <FaGithub size={20} /> Continue with GitHub
                    </button>
                    <button 
                        type="button" 
                        onClick={() => signInWithGoogle()}
                        className="w-full py-3 bg-[#020617] border border-slate-700 hover:border-slate-500 rounded-xl text-white font-semibold flex items-center justify-center gap-3 transition"
                    >
                        <FaGoogle size={18} /> Continue with Google
                    </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-slate-800"></div>
                    <span className="text-xs text-slate-500 font-medium">or continue with email</span>
                    <div className="flex-1 h-px bg-slate-800"></div>
                </div>

                {/* Email Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <FaEnvelope className="absolute left-4 top-4 text-slate-500" />
                        <input 
                            type="email" 
                            placeholder="Email address" 
                            className="w-full bg-[#020617] border border-slate-700 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="relative">
                        <FaLock className="absolute left-4 top-4 text-slate-500" />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            className="w-full bg-[#020617] border border-slate-700 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition transform hover:-translate-y-0.5 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : (mode === 'signin' ? 'Sign In' : 'Create Account')} →
                    </button>
                </form>

                {/* Toggle Footer */}
                <div className="text-center mt-6 text-sm text-slate-400">
                    {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                    <button 
                        type="button" 
                        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                        className="text-cyan-400 font-bold hover:text-cyan-300 transition"
                    >
                        {mode === 'signin' ? 'Sign up' : 'Sign in'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;