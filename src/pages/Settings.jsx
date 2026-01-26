import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  CreditCard,
  Save,
  Eye,
  EyeOff,
  LogOut,
  Camera,
  Globe,
  MapPin,
  Building,
  Crown,
  Check,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [profile, setProfile] = useState({
    display_name: '',
    bio: '',
    avatar_url: '',
    website: '',
    location: '',
    company: ''
  });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [privacy, setPrivacy] = useState({
    show_email: false,
    show_projects: true,
    allow_contact: true
  });

  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      setLoading(true);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile error:', profileError);
      } else if (profileData) {
        setProfile(profileData);
      }

      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (subData) setSubscription(subData);

    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profile,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) throw error;

      toast.success('✅ Profile updated!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('✅ Password updated!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Password error:', error);
      toast.error('Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File must be less than 2MB');
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setProfile({ ...profile, avatar_url: publicUrl });
      
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      toast.success('✅ Avatar uploaded!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <RefreshCw className="w-12 h-12 text-cyan-500 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#0f1420] p-8">
        <div className="max-w-4xl mx-auto">
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
            <p className="text-slate-400">Manage your account preferences</p>
          </div>

          {/* Profile Section */}
          <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Profile</h2>
            </div>

            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.email?.[0]?.toUpperCase() || 'U'
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-cyan-500 hover:bg-cyan-600 rounded-full flex items-center justify-center cursor-pointer">
                  <Camera size={16} className="text-white" />
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              </div>
              <div>
                <p className="text-white font-bold text-xl">{profile.display_name || user?.email?.split('@')[0]}</p>
                <p className="text-slate-400">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Display Name</label>
                <input
                  type="text"
                  value={profile.display_name || ''}
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg">
                  <Mail size={20} className="text-slate-500" />
                  <p className="text-white">{user?.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Website</label>
                <div className="relative">
                  <Globe size={20} className="absolute left-3 top-3.5 text-slate-500" />
                  <input
                    type="url"
                    value={profile.website || ''}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                <div className="relative">
                  <MapPin size={20} className="absolute left-3 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={profile.location || ''}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                <textarea
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:shadow-lg disabled:opacity-50 font-semibold"
              >
                <Save size={20} />
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>

          {/* Password Section */}
          <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Change Password</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 pr-12"
                    placeholder="Enter new password"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder="Confirm password"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={updatePassword}
                disabled={saving || !newPassword || newPassword !== confirmPassword}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:shadow-lg disabled:opacity-50 font-semibold"
              >
                <Lock size={20} />
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>

          {/* Billing Section */}
          <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Billing & Subscription</h2>
            </div>

            {subscription ? (
              <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="text-yellow-500" size={24} />
                      <h3 className="text-xl font-bold text-white">{subscription.plan_name || 'Pro Plan'}</h3>
                    </div>
                    <p className="text-slate-400">Active subscription</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-cyan-400">${(subscription.amount / 100).toFixed(2)}</p>
                    <p className="text-sm text-slate-400">per year</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <Check size={16} />
                  <span>Renews on {new Date(subscription.current_period_end).toLocaleDateString()}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Active Subscription</h3>
                <p className="text-slate-400 mb-6">You're on the free plan</p>
                <button
                  onClick={() => navigate('/pricing')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg font-bold hover:shadow-lg"
                >
                  <Sparkles size={20} />
                  View Pricing Plans
                </button>
              </div>
            )}
          </div>

          {/* Privacy Section */}
          <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Privacy</h2>
            </div>

            <div className="space-y-4">
              {[
                { key: 'show_email', label: 'Show Email', desc: 'Display email on public profile' },
                { key: 'show_projects', label: 'Show Projects', desc: 'Make projects visible to others' },
                { key: 'allow_contact', label: 'Allow Contact', desc: 'Let users contact you' }
              ].map((item) => (
                <div key={item.key} className="flex items-start justify-between p-4 bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{item.label}</p>
                    <p className="text-sm text-slate-400 mt-1">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setPrivacy({ ...privacy, [item.key]: !privacy[item.key] })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      privacy[item.key] ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privacy[item.key] ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Logout */}
          <div className="flex justify-center">
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-8 py-4 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/30 transition font-semibold"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}