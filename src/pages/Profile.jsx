import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { User, Mail, Calendar, Award, Edit2, Save, Camera, Globe, MapPin, Building, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [profile, setProfile] = useState({
    display_name: '',
    bio: '',
    avatar_url: '',
    website: '',
    location: '',
    company: ''
  });

  const [stats, setStats] = useState({
    totalProjects: 0,
    totalModels: 0,
    totalDatasets: 0,
    accountAge: ''
  });

  useEffect(() => {
    if (user?.id) {
      loadProfile();
      loadStats();
    }
  }, [user?.id]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Profile load error:', error);
        // Don't throw - just log and continue with defaults
      }
      
      if (data) {
        setProfile({
          display_name: data.display_name || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
          website: data.website || '',
          location: data.location || '',
          company: data.company || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Silent fail - user can still edit
    } finally {
      setInitialLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('id', { count: 'exact' })
        .eq('user_id', user?.id);

      if (error) {
        console.error('Stats error:', error);
      }

      const accountCreated = user?.created_at ? new Date(user.created_at) : new Date();
      const now = new Date();
      const daysSince = Math.floor((now - accountCreated) / (1000 * 60 * 60 * 24));
      const accountAge = daysSince < 30 
        ? `${daysSince} days` 
        : `${Math.floor(daysSince / 30)} months`;

      setStats({
        totalProjects: projects?.length || 0,
        totalModels: 0,
        totalDatasets: 0,
        accountAge
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setProfile({ ...profile, avatar_url: publicUrl });
      
      // Auto-save avatar
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (updateError) {
        console.error('Avatar update error:', updateError);
        toast.error('Avatar uploaded but profile update failed');
      } else {
        toast.success('Avatar uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      toast.error('User session not found');
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        id: user.id,
        display_name: profile.display_name?.trim() || null,
        bio: profile.bio?.trim() || null,
        avatar_url: profile.avatar_url || null,
        website: profile.website?.trim() || null,
        location: profile.location?.trim() || null,
        company: profile.company?.trim() || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updateData, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Save error:', error);
        throw error;
      }

      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">My Profile</h1>
            <p className="text-slate-400">Manage your account information</p>
          </div>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={loading}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl transition flex items-center gap-2 disabled:opacity-50"
          >
            {isEditing ? (
              <>
                <Save size={20} />
                {loading ? 'Saving...' : 'Save Changes'}
              </>
            ) : (
              <>
                <Edit2 size={20} />
                Edit Profile
              </>
            )}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Projects', value: stats.totalProjects, color: 'cyan' },
            { label: 'Models', value: stats.totalModels, color: 'purple' },
            { label: 'Tokens', value: '1,000', color: 'yellow' },
            { label: 'Member For', value: stats.accountAge, color: 'emerald' }
          ].map((stat, index) => (
            <div key={index} className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6">
              <p className={`text-3xl font-black text-${stat.color}-400 mb-2`}>{stat.value}</p>
              <p className="text-slate-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-8">
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white text-5xl font-bold overflow-hidden">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.email?.[0]?.toUpperCase() || 'U'
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-cyan-500 hover:bg-cyan-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition">
                    <Camera size={20} className="text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-1 text-center">
              {profile.display_name || user?.email?.split('@')[0] || 'User'}
            </h2>
            <p className="text-slate-400 text-sm mb-4 text-center">{user?.email}</p>
            
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-6">
              <Calendar size={14} />
              <span>Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}</span>
            </div>
            
            <div className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
              <div className="flex items-center justify-center gap-2 text-cyan-400">
                <Award size={16} />
                <span className="font-semibold text-sm">Founder Tier</span>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 bg-[#1a1f2e] border border-slate-800 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Profile Information</h3>
            
            <div className="space-y-6">
              {/* Display Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">
                  Display Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.display_name}
                    onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="Your display name"
                  />
                ) : (
                  <p className="text-white text-lg">{profile.display_name || 'Not set'}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">
                  Email Address
                </label>
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl">
                  <Mail size={20} className="text-slate-500" />
                  <p className="text-white">{user?.email}</p>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none resize-none"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-white">{profile.bio || 'No bio added yet'}</p>
                )}
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">
                  Website
                </label>
                {isEditing ? (
                  <div className="relative">
                    <Globe size={20} className="absolute left-3 top-3.5 text-slate-500" />
                    <input
                      type="url"
                      value={profile.website}
                      onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                ) : (
                  <p className="text-white">{profile.website || 'Not set'}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">
                  Location
                </label>
                {isEditing ? (
                  <div className="relative">
                    <MapPin size={20} className="absolute left-3 top-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                      placeholder="City, Country"
                    />
                  </div>
                ) : (
                  <p className="text-white">{profile.location || 'Not set'}</p>
                )}
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">
                  Company
                </label>
                {isEditing ? (
                  <div className="relative">
                    <Building size={20} className="absolute left-3 top-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={profile.company}
                      onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                      placeholder="Your company"
                    />
                  </div>
                ) : (
                  <p className="text-white">{profile.company || 'Not set'}</p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    loadProfile(); // Reset changes
                  }}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}