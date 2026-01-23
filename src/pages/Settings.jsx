import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import axios from 'axios';
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Shield, 
  CreditCard,
  Moon,
  Sun,
  Trash2,
  Save,
  Eye,
  EyeOff,
  AlertTriangle,
  Key,
  RefreshCw,
  LogOut,
  ChevronRight,
  Book,
  AlertCircle,
  Download,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function Settings() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Profile Settings
  const [profile, setProfile] = useState({
    full_name: '',
    username: '',
    bio: '',
    avatar_url: '',
    website: '',
    location: '',
    company: ''
  });

  // Account Settings
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification Settings
  const [notifications, setNotifications] = useState({
    email_training_complete: true,
    email_deployment_status: true,
    email_marketplace_sales: true,
    email_weekly_summary: true,
    push_training_updates: false,
    push_marketplace_activity: false
  });

  // Privacy Settings
  const [privacy, setPrivacy] = useState({
    profile_visibility: 'public',
    show_email: false,
    show_projects: true,
    allow_marketplace_contact: true
  });

  // Appearance Settings
  const [appearance, setAppearance] = useState({
    theme: 'dark',
    language: 'en',
    timezone: 'UTC'
  });

  // Subscription
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await axios.get(`${API_URL}/settings`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      if (response.data.success) {
        const { profile: loadedProfile, settings, subscription: loadedSub } = response.data;
        
        setProfile(loadedProfile || {});
        setNotifications(settings?.notifications || notifications);
        setPrivacy(settings?.privacy || privacy);
        setAppearance(settings?.appearance || appearance);
        setSubscription(loadedSub);
      }

    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      const { data: { session } } = await supabase.auth.getSession();

      const response = await axios.put(
        `${API_URL}/settings/profile`,
        profile,
        { headers: { Authorization: `Bearer ${session?.access_token}` } }
      );

      if (response.data.success) {
        toast.success('Profile updated successfully!');
        setProfile(response.data.profile);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      if (error.response?.status === 409) {
        toast.error('Username already taken');
      } else {
        toast.error('Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = async () => {
    try {
      if (newPassword !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      if (newPassword.length < 8) {
        toast.error('Password must be at least 8 characters');
        return;
      }

      setSaving(true);
      const { data: { session } } = await supabase.auth.getSession();

      const response = await axios.post(
        `${API_URL}/settings/change-password`,
        { new_password: newPassword },
        { headers: { Authorization: `Bearer ${session?.access_token}` } }
      );

      if (response.data.success) {
        toast.success('Password updated successfully!');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const saveNotifications = async () => {
    try {
      setSaving(true);
      const { data: { session } } = await supabase.auth.getSession();

      const response = await axios.put(
        `${API_URL}/settings/notifications`,
        notifications,
        { headers: { Authorization: `Bearer ${session?.access_token}` } }
      );

      if (response.data.success) {
        toast.success('Notification preferences saved!');
      }
    } catch (error) {
      console.error('Error saving notifications:', error);
      toast.error('Failed to save notifications');
    } finally {
      setSaving(false);
    }
  };

  const savePrivacy = async () => {
    try {
      setSaving(true);
      const { data: { session } } = await supabase.auth.getSession();

      const response = await axios.put(
        `${API_URL}/settings/privacy`,
        privacy,
        { headers: { Authorization: `Bearer ${session?.access_token}` } }
      );

      if (response.data.success) {
        toast.success('Privacy settings saved!');
      }
    } catch (error) {
      console.error('Error saving privacy:', error);
      toast.error('Failed to save privacy settings');
    } finally {
      setSaving(false);
    }
  };

  const saveAppearance = async () => {
    try {
      setSaving(true);
      const { data: { session } } = await supabase.auth.getSession();

      const response = await axios.put(
        `${API_URL}/settings/appearance`,
        appearance,
        { headers: { Authorization: `Bearer ${session?.access_token}` } }
      );

      if (response.data.success) {
        toast.success('Appearance settings saved!');
      }
    } catch (error) {
      console.error('Error saving appearance:', error);
      toast.error('Failed to save appearance settings');
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await axios.delete(`${API_URL}/settings/account`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      if (response.data.success) {
        toast.success('Account deleted successfully');
        await signOut();
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account. Please contact support.');
    }
  };

  const exportData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await axios.get(`${API_URL}/settings/export-data`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      if (response.data.success) {
        const exportData = response.data.data;
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aigo-data-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        toast.success('Data exported successfully!');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  const handleUpgradePlan = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await axios.post(
        `${API_URL}/stripe/create-checkout-session`,
        {
          priceId: 'price_1QqxxxxxxxxxxxPRO', // Replace with your Stripe Price ID
          successUrl: `${window.location.origin}/settings?success=true`,
          cancelUrl: `${window.location.origin}/settings?canceled=true`
        },
        { headers: { Authorization: `Bearer ${session?.access_token}` } }
      );

      if (response.data.success) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'appearance', label: 'Appearance', icon: Moon },
    { id: 'billing', label: 'Billing', icon: CreditCard }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-[#0f1420] flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-400 text-lg">Loading settings...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#0f1420] p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
            <p className="text-slate-400 text-lg">Manage your account preferences and settings</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-4 space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                      {activeTab === tab.id && (
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-6 mt-4">
                <button
                  onClick={signOut}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition font-semibold"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3"
            >
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <User className="w-6 h-6 text-cyan-400" />
                    Profile Information
                  </h2>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profile.full_name || ''}
                          onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          value={profile.username || ''}
                          onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          placeholder="johndoe"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={profile.bio || ''}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        rows="4"
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Website
                        </label>
                        <input
                          type="url"
                          value={profile.website || ''}
                          onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          placeholder="https://example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={profile.location || ''}
                          onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          placeholder="San Francisco, CA"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        value={profile.company || ''}
                        onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="Acme Inc."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-8">
                    <button
                      onClick={saveProfile}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
                    >
                      <Save className="w-5 h-5" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {/* Account Tab */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-8">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <Mail className="w-6 h-6 text-cyan-400" />
                      Email Address
                    </h2>

                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold">{user?.email}</p>
                          <p className="text-sm text-slate-400 mt-1">Your account email</p>
                        </div>
                        <Check className="w-6 h-6 text-green-400" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-8">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <Lock className="w-6 h-6 text-cyan-400" />
                      Change Password
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent pr-12"
                            placeholder="Enter new password"
                          />
                          <button
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                          >
                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end mt-6">
                      <button
                        onClick={updatePassword}
                        disabled={saving || !newPassword || newPassword !== confirmPassword}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
                      >
                        <Lock className="w-5 h-5" />
                        {saving ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#1a1f2e] border border-red-900/30 rounded-xl p-8">
                    <h2 className="text-2xl font-bold text-red-400 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-6 h-6" />
                      Danger Zone
                    </h2>
                    <p className="text-slate-400 mb-6">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={exportData}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition border border-slate-700 font-semibold"
                      >
                        <Download className="w-5 h-5" />
                        Export My Data
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition font-semibold"
                      >
                        <Trash2 className="w-5 h-5" />
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Bell className="w-6 h-6 text-cyan-400" />
                    Notification Preferences
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Email Notifications</h3>
                      <div className="space-y-4">
                        {[
                          { key: 'email_training_complete', label: 'Training Complete', desc: 'Get notified when model training finishes' },
                          { key: 'email_deployment_status', label: 'Deployment Updates', desc: 'Receive deployment status notifications' },
                          { key: 'email_marketplace_sales', label: 'Marketplace Sales', desc: 'Notifications about your marketplace sales' },
                          { key: 'email_weekly_summary', label: 'Weekly Summary', desc: 'Weekly digest of your activity' }
                        ].map((item) => (
                          <div key={item.key} className="flex items-start justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                            <div className="flex-1">
                              <p className="text-white font-medium">{item.label}</p>
                              <p className="text-sm text-slate-400 mt-1">{item.desc}</p>
                            </div>
                            <button
                              onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                notifications[item.key] ? 'bg-cyan-500' : 'bg-slate-700'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  notifications[item.key] ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Push Notifications</h3>
                      <div className="space-y-4">
                        {[
                          { key: 'push_training_updates', label: 'Training Updates', desc: 'Real-time training progress updates' },
                          { key: 'push_marketplace_activity', label: 'Marketplace Activity', desc: 'Instant marketplace notifications' }
                        ].map((item) => (
                          <div key={item.key} className="flex items-start justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                            <div className="flex-1">
                              <p className="text-white font-medium">{item.label}</p>
                              <p className="text-sm text-slate-400 mt-1">{item.desc}</p>
                            </div>
                            <button
                              onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                notifications[item.key] ? 'bg-cyan-500' : 'bg-slate-700'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  notifications[item.key] ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-8">
                    <button
                      onClick={saveNotifications}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
                    >
                      <Save className="w-5 h-5" />
                      {saving ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-cyan-400" />
                    Privacy Settings
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">
                        Profile Visibility
                      </label>
                      <select
                        value={privacy.profile_visibility}
                        onChange={(e) => setPrivacy({ ...privacy, profile_visibility: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="public">Public - Anyone can view</option>
                        <option value="private">Private - Only you can view</option>
                        <option value="members">Members Only - Registered users only</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      {[
                        { key: 'show_email', label: 'Show Email', desc: 'Display your email on your public profile' },
                        { key: 'show_projects', label: 'Show Projects', desc: 'Make your projects visible to others' },
                        { key: 'allow_marketplace_contact', label: 'Marketplace Contact', desc: 'Allow buyers to contact you' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-start justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                          <div className="flex-1">
                            <p className="text-white font-medium">{item.label}</p>
                            <p className="text-sm text-slate-400 mt-1">{item.desc}</p>
                          </div>
                          <button
                            onClick={() => setPrivacy({ ...privacy, [item.key]: !privacy[item.key] })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              privacy[item.key] ? 'bg-cyan-500' : 'bg-slate-700'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                privacy[item.key] ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end mt-8">
                    <button
                      onClick={savePrivacy}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
                    >
                      <Save className="w-5 h-5" />
                      {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </div>
              )}

              {/* API Keys Tab */}
              {activeTab === 'api' && (
                <div className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Key className="w-6 h-6 text-cyan-400" />
                      API Keys & Documentation
                    </h2>
                  </div>

                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Key className="w-10 h-10 text-cyan-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Developer API Keys</h3>
                    <p className="text-slate-400 mb-8 max-w-md mx-auto">
                      Manage your API keys and access comprehensive documentation for integrating AIGO into your applications.
                    </p>
                    
                    <a
                      href="/docs"
                      className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition font-semibold text-lg"
                    >
                      <Book className="w-6 h-6" />
                      View Documentation & API Keys
                      <ChevronRight className="w-5 h-5" />
                    </a>
                  </div>

                  <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-blue-400 font-semibold mb-2">
                          What you'll find in the Docs:
                        </p>
                        <ul className="text-sm text-slate-300 space-y-1">
                          <li>• Generate and manage API keys</li>
                          <li>• Complete API reference with code examples</li>
                          <li>• Authentication guides</li>
                          <li>• Rate limits and best practices</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Moon className="w-6 h-6 text-cyan-400" />
                    Appearance
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">
                        Theme
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setAppearance({ ...appearance, theme: 'dark' })}
                          className={`p-4 rounded-lg border-2 transition ${
                            appearance.theme === 'dark'
                              ? 'border-cyan-500 bg-cyan-500/10'
                              : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                          }`}
                        >
                          <Moon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p className="text-white font-semibold">Dark</p>
                        </button>
                        <button
                          onClick={() => setAppearance({ ...appearance, theme: 'light' })}
                          className={`p-4 rounded-lg border-2 transition ${
                            appearance.theme === 'light'
                              ? 'border-cyan-500 bg-cyan-500/10'
                              : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                          }`}
                        >
                          <Sun className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p className="text-white font-semibold">Light</p>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Language
                      </label>
                      <select
                        value={appearance.language}
                        onChange={(e) => setAppearance({ ...appearance, language: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="zh">中文</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Timezone
                      </label>
                      <select
                        value={appearance.timezone}
                        onChange={(e) => setAppearance({ ...appearance, timezone: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="UTC">UTC (GMT+0)</option>
                        <option value="America/New_York">Eastern Time (GMT-5)</option>
                        <option value="America/Los_Angeles">Pacific Time (GMT-8)</option>
                        <option value="Europe/London">London (GMT+0)</option>
                        <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end mt-8">
                    <button
                      onClick={saveAppearance}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
                    >
                      <Save className="w-5 h-5" />
                      {saving ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <div className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-cyan-400" />
                    Billing & Subscription
                  </h2>

                  {subscription ? (
                    <div className="space-y-6">
                      <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-1">
                              {subscription.plan_name || 'Pro Plan'}
                            </h3>
                            <p className="text-slate-400">Active subscription</p>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-cyan-400">
                              ${subscription.amount/100}
                            </p>
                            <p className="text-sm text-slate-400">per month</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Check className="w-4 h-4 text-green-400" />
                          <span>Renews on {new Date(subscription.current_period_end).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CreditCard className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">No Active Subscription</h3>
                      <p className="text-slate-400 mb-6">
                        You're currently on the free plan. Upgrade to unlock more features.
                      </p>
                      <button
                        onClick={handleUpgradePlan}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition font-semibold"
                      >
                        View Pricing Plans
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-[#1a1f2e] border border-red-900/50 rounded-xl max-w-md w-full p-8"
          >
            <div className="text-center mb-6">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Delete Account?</h2>
              <p className="text-slate-400">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  deleteAccount();
                }}
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-semibold"
              >
                Delete Forever
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}