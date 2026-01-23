import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Globe, 
  Plus, 
  Lock, 
  Settings, 
  Trash2, 
  Info, 
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Shield,
  Copy,
  RefreshCw,
  X,
  Check,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Domains = () => {
  const { user } = useAuth();
  const [customDomain, setCustomDomain] = useState('');
  const [domains, setDomains] = useState([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [showDNSModal, setShowDNSModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDomains();
    }
  }, [user]);

  const fetchDomains = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      const response = await axios.get(`${API_URL}/domains`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      if (response.data.success) {
        setDomains(response.data.domains || []);
      }
    } catch (error) {
      console.error('Error fetching domains:', error);
      toast.error('Failed to load domains');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDomain = async () => {
    if (!customDomain.trim()) {
      toast.error('Please enter a domain name');
      return;
    }

    // Validate domain format
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    if (!domainRegex.test(customDomain)) {
      toast.error('Please enter a valid domain (e.g., example.com)');
      return;
    }

    setIsVerifying(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await axios.post(
        `${API_URL}/domains`,
        { domain: customDomain.toLowerCase() },
        { headers: { Authorization: `Bearer ${session?.access_token}` } }
      );

      if (response.data.success) {
        toast.success('Domain added! Please configure DNS records to verify.');
        setCustomDomain('');
        fetchDomains();
        setSelectedDomain(response.data.domain);
        setShowDNSModal(true);
      }
    } catch (error) {
      console.error('Error adding domain:', error);
      if (error.response?.status === 409) {
        toast.error('This domain is already registered');
      } else {
        toast.error('Failed to add domain');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyDomain = async (domainId, domainName) => {
    try {
      toast.loading('Verifying DNS records...', { id: 'verify' });

      const { data: { session } } = await supabase.auth.getSession();

      const response = await axios.post(
        `${API_URL}/domains/${domainId}/verify`,
        {},
        { headers: { Authorization: `Bearer ${session?.access_token}` } }
      );

      if (response.data.success) {
        if (response.data.verified) {
          toast.success('Domain verified successfully!', { id: 'verify' });
          fetchDomains();
        } else {
          toast.error('DNS records not found. Please check your configuration.', { id: 'verify' });
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('DNS records not found. Please check your configuration.', { id: 'verify' });
    }
  };

  const handleEnableSSL = async (domainId, domainName) => {
    try {
      toast.loading('Provisioning SSL certificate...', { id: 'ssl' });

      const { data: { session } } = await supabase.auth.getSession();

      const response = await axios.post(
        `${API_URL}/domains/${domainId}/ssl`,
        {},
        { headers: { Authorization: `Bearer ${session?.access_token}` } }
      );

      if (response.data.success) {
        toast.success('SSL certificate activated!', { id: 'ssl' });
        fetchDomains();
      }
    } catch (error) {
      console.error('SSL error:', error);
      toast.error('Failed to enable SSL', { id: 'ssl' });
    }
  };

  const handleDeleteDomain = async (domainId, domainName) => {
    if (!window.confirm(`Are you sure you want to remove ${domainName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await axios.delete(`${API_URL}/domains/${domainId}`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      if (response.data.success) {
        toast.success('Domain removed successfully');
        fetchDomains();
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete domain');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'emerald';
      case 'pending': return 'orange';
      case 'failed': return 'red';
      default: return 'slate';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-[#0f1420] flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-400 text-lg">Loading domains...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#0f1420] p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Globe size={24} className="text-white" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-black text-white">
                Custom Domains
              </h1>
            </div>
            <p className="text-slate-400 text-lg">
              Connect your own domain to your AI-powered applications
            </p>
          </motion.div>

          {/* Add New Domain Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-8 mb-8"
          >
            <h2 className="text-xl font-bold text-white mb-6">Add Custom Domain</h2>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input
                type="text"
                placeholder="yourdomain.com"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddDomain()}
                className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                disabled={isVerifying}
              />
              <button 
                onClick={handleAddDomain}
                disabled={isVerifying}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold rounded-xl transition shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    <span>Add Domain</span>
                  </>
                )}
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Info size={20} className="text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-2">How to connect your domain</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    After adding your domain, you'll receive DNS records to add to your domain provider. 
                    Add a CNAME record pointing to{' '}
                    <code className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-cyan-400 font-mono text-xs">
                      app.aigo.market
                    </code>. 
                    Changes may take up to 24 hours to propagate.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Existing Domains */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Your Domains</h2>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-400 font-medium">
                  {domains.filter(d => d.status === 'active').length} Active
                </span>
              </div>
            </div>
            
            {domains.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-12 text-center"
              >
                <Globe className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No domains yet</h3>
                <p className="text-slate-400">Add your first custom domain to get started</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {domains.map((domain, index) => {
                  const statusColor = getStatusColor(domain.status);
                  
                  return (
                    <motion.div
                      key={domain.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-[#1a1f2e] border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition group"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Domain Info */}
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-500/20 transition">
                            <Globe size={24} className="text-cyan-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-white">
                                {domain.domain}
                              </h3>
                              {domain.status === 'active' && (
                                <a 
                                  href={`https://${domain.domain}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-slate-500 hover:text-cyan-400 transition"
                                >
                                  <ExternalLink size={16} />
                                </a>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-400">
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                Added {new Date(domain.created_at).toLocaleDateString()}
                              </span>
                              {domain.verified_at && (
                                <span className="flex items-center gap-1 text-green-400">
                                  <Check size={14} />
                                  Verified {new Date(domain.verified_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="flex items-center gap-3 flex-wrap">
                          {/* Status Badge */}
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 bg-${statusColor}-500/20 text-${statusColor}-400 border border-${statusColor}-500/30`}>
                            {domain.status === 'active' ? (
                              <CheckCircle size={14} />
                            ) : (
                              <AlertCircle size={14} />
                            )}
                            {domain.status.charAt(0).toUpperCase() + domain.status.slice(1)}
                          </span>

                          {/* SSL Badge */}
                          {domain.ssl_enabled ? (
                            <span className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-bold flex items-center gap-2">
                              <Lock size={14} />
                              SSL Active
                            </span>
                          ) : domain.status === 'active' && (
                            <button
                              onClick={() => handleEnableSSL(domain.id, domain.domain)}
                              className="px-3 py-1.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30 rounded-lg text-xs font-bold flex items-center gap-2 transition"
                            >
                              <Lock size={14} />
                              Enable SSL
                            </button>
                          )}

                          {/* Verify Button */}
                          {domain.status === 'pending' && (
                            <button
                              onClick={() => handleVerifyDomain(domain.id, domain.domain)}
                              className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 rounded-lg text-xs font-bold flex items-center gap-2 transition"
                            >
                              <RefreshCw size={14} />
                              Verify DNS
                            </button>
                          )}

                          {/* Settings Button */}
                          <button 
                            onClick={() => {
                              setSelectedDomain(domain);
                              setShowDNSModal(true);
                            }}
                            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition"
                            title="DNS Settings"
                          >
                            <Settings size={18} />
                          </button>

                          {/* Delete Button */}
                          <button 
                            onClick={() => handleDeleteDomain(domain.id, domain.domain)}
                            className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* DNS Configuration Guide */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/30 rounded-2xl p-8"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield size={24} className="text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">DNS Configuration</h3>
                <p className="text-slate-300">Add these DNS records to connect your custom domain</p>
              </div>
            </div>

            <div className="bg-[#0f1420] border border-slate-800 rounded-xl p-6 font-mono text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Type</p>
                  <p className="text-white font-bold">CNAME</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Name</p>
                  <p className="text-white font-bold">@ (or subdomain)</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Value</p>
                  <div className="flex items-center gap-2">
                    <p className="text-cyan-400 font-bold">app.aigo.market</p>
                    <button 
                      onClick={() => copyToClipboard('app.aigo.market')}
                      className="p-1 hover:bg-slate-800 rounded transition"
                    >
                      <Copy size={14} className="text-slate-500" />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">TTL</p>
                  <p className="text-white font-bold">3600</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-3">
              <Info size={16} className="text-purple-400 mt-1 flex-shrink-0" />
              <p className="text-slate-300 text-sm">
                Need help? Check out our{' '}
                <a href="/docs/custom-domains" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                  custom domain setup guide
                </a>{' '}
                or contact support.
              </p>
            </div>
          </motion.div>

        </div>
      </div>

      {/* DNS Configuration Modal */}
      {showDNSModal && selectedDomain && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1a1f2e] border-2 border-slate-800 rounded-3xl p-8 max-w-2xl w-full relative"
          >
            <button
              onClick={() => setShowDNSModal(false)}
              className="absolute top-6 right-6 w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center transition"
            >
              <X size={20} className="text-slate-400" />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">DNS Configuration</h2>
              <p className="text-slate-400">for {selectedDomain.domain}</p>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-400">Record Type</span>
                  <span className="text-white font-mono">CNAME</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-400">Name/Host</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-mono">@</span>
                    <button onClick={() => copyToClipboard('@')} className="p-1 hover:bg-slate-800 rounded">
                      <Copy size={14} className="text-slate-500" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-400">Value/Target</span>
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-mono">app.aigo.market</span>
                    <button onClick={() => copyToClipboard('app.aigo.market')} className="p-1 hover:bg-slate-800 rounded">
                      <Copy size={14} className="text-slate-500" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-400">TTL</span>
                  <span className="text-white font-mono">3600</span>
                </div>
              </div>

              {selectedDomain.status === 'pending' && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-orange-400 mt-0.5" />
                    <div>
                      <p className="text-orange-400 font-semibold mb-1">Verification Pending</p>
                      <p className="text-sm text-slate-300">
                        DNS changes can take up to 24 hours to propagate. Click "Verify DNS" to check if your records are configured correctly.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedDomain.status === 'active' && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-emerald-400 mt-0.5" />
                    <div>
                      <p className="text-emerald-400 font-semibold mb-1">Domain Verified</p>
                      <p className="text-sm text-slate-300">
                        Your domain is successfully connected and verified!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowDNSModal(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-xl hover:from-cyan-400 hover:to-purple-500 transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Domains;