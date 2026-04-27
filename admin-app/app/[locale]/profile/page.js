"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, getToken } from '../../../lib/api.js';
import Card from '../../../components/Card.js';
import Button from '../../../components/Button.js';

export default function AdminProfilePage() {
  const router = useRouter();
  const [adminProfile, setAdminProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Only load profile on client side to prevent hydration mismatch
    if (typeof window !== 'undefined') {
      loadProfile();
    }
  }, []);

  const loadProfile = async () => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    if (!getToken()) {
      router.push('/');
      return;
    }

    setLoading(true);
    try {
      const data = await adminApi('/profile');
      if (!data || !data.profile) {
        throw new Error('Profile data not found in response');
      }
      setAdminProfile(data.profile);
      setFormData({
        name: data.profile.name || '',
        email: data.profile.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      if (typeof window !== 'undefined') {
        alert('Failed to load admin profile: ' + (error.message || 'Unknown error. Please check if you are logged in as an admin.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        name: formData.name,
        email: formData.email
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const data = await adminApi('/profile', {
        method: 'PATCH',
        body: updateData
      });

      setAdminProfile(data.profile);
      if (typeof window !== 'undefined') {
        alert('Profile updated successfully!');
      }
    } catch (error) {
      if (typeof window !== 'undefined') {
        alert('Failed to update profile: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Admin Profile</h1>
            <p className="text-slate-600 dark:text-slate-400">Loading profile...</p>
          </div>
        </div>
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">Admin Profile</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">Manage your administrator account settings</p>
        </div>
        <Button
          variant="secondary"
          onClick={loadProfile}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Profile Overview Card */}
      <Card className="p-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {adminProfile?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {adminProfile?.name || 'Administrator'}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-2">
              {adminProfile?.email || 'admin@example.com'}
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Administrator
              </span>
              <span>
                Joined: {adminProfile?.createdAt ? new Date(adminProfile.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Edit Form */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">
          Edit Profile Information
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {/* Password Change Section */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <h4 className="text-md font-medium text-slate-900 dark:text-slate-100 mb-4">
              Change Password (Optional)
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Leave blank if you don't want to change your password
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="New password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
            <Button
              type="submit"
              disabled={saving}
              className="px-8"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Account Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <span className="text-xl">👤</span>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Account Type</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">Administrator</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <span className="text-xl">📅</span>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Member Since</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {adminProfile?.createdAt ? new Date(adminProfile.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <span className="text-xl">🔐</span>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Last Login</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">Today</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}