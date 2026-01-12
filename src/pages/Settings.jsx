import React, { useState, useEffect } from 'react';
import { User, Mail, Key, Shield, Bell, Trash2, Copy, RefreshCw, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  getUserSettings,
  updateUserSettings,
  getApiKey,
  generateNewApiKey,
  revokeApiKey,
} from '../services/api';

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState({
    email: '',
    notifications: true,
    twoFactorAuth: false,
  });

  useEffect(() => {
    loadSettings();
    loadApiKey();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getUserSettings();
      setSettings({
        email: data.email || user?.email || '',
        notifications: data.notifications ?? true,
        twoFactorAuth: data.twoFactorAuth ?? false,
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadApiKey = async () => {
    try {
      const data = await getApiKey();
      setApiKey(data.key || '');
    } catch (error) {
      console.error('Failed to load API key:', error);
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserSettings(settings);
      toast.success('Settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateApiKey = async () => {
    if (!confirm('Generate a new API key? Your old key will be invalidated.')) return;
    
    setLoading(true);
    try {
      const data = await generateNewApiKey();
      setApiKey(data.key);
      toast.success('New API key generated!');
    } catch (error) {
      toast.error('Failed to generate API key');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeApiKey = async () => {
    if (!confirm('Revoke your API key? This cannot be undone.')) return;
    
    setLoading(true);
    try {
      await revokeApiKey();
      setApiKey('');
      toast.success('API key revoked');
    } catch (error) {
      toast.error('Failed to revoke API key');
    } finally {
      setLoading(false);
    }
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    toast.success('API key copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400">Manage your account preferences and security</p>
        </div>

        {/* Profile Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-indigo-500 rounded-full flex items-center justify-center">
              <User className="text-white" size={32} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{user?.email || 'User'}</h2>
              <p className="text-slate-400 text-sm">Founder Plan</p>
            </div>
          </div>

          <form onSubmit={handleUpdateSettings} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Mail size={16} className="inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="your@email.com"
              />
            </div>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-cyan-400" />
                <div>
                  <p className="text-white font-medium">Email Notifications</p>
                  <p className="text-slate-400 text-sm">Receive updates about your projects</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>

            {/* 2FA Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-green-400" />
                <div>
                  <p className="text-white font-medium">Two-Factor Authentication</p>
                  <p className="text-slate-400 text-sm">Add an extra layer of security</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={(e) => setSettings({ ...settings, twoFactorAuth: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-semibold py-3 rounded-lg hover:from-cyan-600 hover:to-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* API Key Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Key size={24} className="text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">API Key</h2>
          </div>

          {apiKey ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={apiKey}
                  readOnly
                  className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white font-mono text-sm"
                />
                <button
                  onClick={copyApiKey}
                  className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition flex items-center gap-2"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleGenerateApiKey}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition disabled:opacity-50"
                >
                  <RefreshCw size={18} />
                  Regenerate
                </button>
                <button
                  onClick={handleRevokeApiKey}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition disabled:opacity-50"
                >
                  <Trash2 size={18} />
                  Revoke
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400 mb-4">You don't have an API key yet</p>
              <button
                onClick={handleGenerateApiKey}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-indigo-600 transition disabled:opacity-50"
              >
                Generate API Key
              </button>
            </div>
          )}

          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-amber-400 text-sm">
              <strong>⚠️ Important:</strong> Keep your API key secure. Don't share it publicly or commit it to version control.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}