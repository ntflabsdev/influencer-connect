'use client';

import { useState } from 'react';
import { adminApi } from '../lib/api.js';
import { useToast } from './ToastProvider.js';
import { 
  GradientCard, 
  GlassCard, 
  ProgressRing,
  QuickAction
} from './DesignSystem.js';

export default function AdminDrawer({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { push } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    department: '',
    permissions: {
      canManageInfluencers: true,
      canManageBusinesses: true,
      canManageAdmins: false,
      canSuspendUsers: true,
      canVerifyUsers: true,
      canModerateContent: true,
      canApproveOffers: true,
      canDeleteContent: true,
      canViewPayments: false,
      canProcessRefunds: false,
      canManageSubscriptions: false,
      canViewAnalytics: true,
      canManageSettings: false,
      canAccessLogs: false,
      canHandleTickets: true,
      canSendNotifications: true
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminApi('/admins', {
        method: 'POST',
        body: formData
      });
      push('Admin created successfully!', 'success');
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      push('Failed to create admin: ' + (error.message || ''), 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'admin',
      department: '',
      permissions: {
        canManageInfluencers: true,
        canManageBusinesses: true,
        canManageAdmins: false,
        canSuspendUsers: true,
        canVerifyUsers: true,
        canModerateContent: true,
        canApproveOffers: true,
        canDeleteContent: true,
        canViewPayments: false,
        canProcessRefunds: false,
        canManageSubscriptions: false,
        canViewAnalytics: true,
        canManageSettings: false,
        canAccessLogs: false,
        canHandleTickets: true,
        canSendNotifications: true
      }
    });
    setCurrentStep(1);
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Right Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out">
        <div className="h-full flex flex-col">
          
          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">✨ Add New Admin</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-6">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step <= currentStep 
                      ? 'bg-white text-purple-600' 
                      : 'bg-white/20 text-white/60'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-1 mx-2 transition-all ${
                      step < currentStep ? 'bg-white' : 'bg-white/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            <p className="text-white/80 text-sm">
              {currentStep === 1 && 'Basic Information'}
              {currentStep === 2 && 'Role & Department'}
              {currentStep === 3 && 'Permissions Setup'}
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">👤</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Admin Details</h3>
                    <p className="text-gray-600">Enter the basic information for the new admin</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      👤 Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📧 Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                      placeholder="admin@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🔐 Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                      placeholder="Strong password"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Role & Department */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">👑</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Role Assignment</h3>
                    <p className="text-gray-600">Choose the appropriate role and department</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      👑 Select Role
                    </label>
                    <div className="space-y-3">
                      {[
                        { value: 'moderator', label: '🛡️ Moderator', desc: 'Content moderation only' },
                        { value: 'admin', label: '👤 Admin', desc: 'Full administrative access' },
                        { value: 'superadmin', label: '👑 Super Admin', desc: 'Complete system control' }
                      ].map((role) => (
                        <label key={role.value} className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-purple-300">
                          <input
                            type="radio"
                            name="role"
                            value={role.value}
                            checked={formData.role === role.value}
                            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                            className="mt-1"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{role.label}</div>
                            <div className="text-sm text-gray-600">{role.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🏢 Department
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    >
                      <option value="">Select Department</option>
                      <option value="operations">⚙️ Operations</option>
                      <option value="finance">💰 Finance</option>
                      <option value="support">💬 Support</option>
                      <option value="moderation">📝 Moderation</option>
                      <option value="management">📊 Management</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Step 3: Permissions */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">🔐</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Permissions</h3>
                    <p className="text-gray-600">Configure access permissions</p>
                  </div>

                  {/* Permission Categories */}
                  <div className="space-y-4">
                    {/* User Management */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">👥 User Management</h4>
                      <div className="space-y-2">
                        {[
                          { key: 'canManageInfluencers', label: 'Manage Influencers' },
                          { key: 'canManageBusinesses', label: 'Manage Businesses' },
                          { key: 'canSuspendUsers', label: 'Suspend Users' },
                          { key: 'canVerifyUsers', label: 'Verify Users' }
                        ].map((perm) => (
                          <label key={perm.key} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.permissions[perm.key]}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                permissions: { ...prev.permissions, [perm.key]: e.target.checked }
                              }))}
                              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">{perm.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Content Management */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">📝 Content Management</h4>
                      <div className="space-y-2">
                        {[
                          { key: 'canModerateContent', label: 'Moderate Content' },
                          { key: 'canApproveOffers', label: 'Approve Offers' },
                          { key: 'canDeleteContent', label: 'Delete Content' }
                        ].map((perm) => (
                          <label key={perm.key} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.permissions[perm.key]}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                permissions: { ...prev.permissions, [perm.key]: e.target.checked }
                              }))}
                              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">{perm.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* System Access */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">⚙️ System Access</h4>
                      <div className="space-y-2">
                        {[
                          { key: 'canViewAnalytics', label: 'View Analytics' },
                          { key: 'canManageSettings', label: 'Manage Settings' },
                          { key: 'canHandleTickets', label: 'Handle Support Tickets' }
                        ].map((perm) => (
                          <label key={perm.key} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.permissions[perm.key]}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                permissions: { ...prev.permissions, [perm.key]: e.target.checked }
                              }))}
                              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">{perm.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    ← Back
                  </button>
                )}
                
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    Next Step →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Creating Admin...' : '✨ Create Admin'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
