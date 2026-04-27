"use client";

import { useState, useEffect } from 'react';
import { adminApi } from '../../../../lib/api.js';
import Card from '../../../../components/Card.js';
import Button from '../../../../components/Button.js';
import Badge from '../../../../components/Badge.js';
import { useTranslations } from 'next-intl';

export default function AdminsManagementPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({
    role: '',
    department: '',
    limit: 20
  });
  const t = useTranslations('Admins');
  const tCommon = useTranslations('Common');
  const tToasts = useTranslations('Toasts');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    department: '',
    permissions: {
      // User Management
      canManageInfluencers: true,
      canManageBusinesses: true,
      canManageAdmins: false,
      canSuspendUsers: true,
      canVerifyUsers: true,
      // Content Management
      canModerateContent: true,
      canApproveOffers: true,
      canDeleteContent: true,
      // Financial Management
      canViewPayments: false,
      canProcessRefunds: false,
      canManageSubscriptions: false,
      // System Management
      canViewAnalytics: true,
      canManageSettings: false,
      canAccessLogs: false,
      // Support
      canHandleTickets: true,
      canSendNotifications: true
    }
  });

  useEffect(() => {
    loadAdmins();
  }, [filters]);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const data = await adminApi(`/admins?${queryParams.toString()}`);
      setAdmins(data.admins || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to load admins:', error);
      alert(t('alerts.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await adminApi('/admins', {
        method: 'POST',
        body: formData
      });
      setShowCreateModal(false);
      resetForm();
      loadAdmins();
      alert(t('alerts.createSuccess'));
    } catch (error) {
      alert(t('alerts.createFailed') + ': ' + (error.message || ''));
    }
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    try {
      const { password, ...updateData } = formData; // Don't send password in updates
      await adminApi(`/admins/${selectedAdmin._id}`, {
        method: 'PATCH',
        body: updateData
      });
      setShowEditModal(false);
      resetForm();
      loadAdmins();
      alert(t('alerts.updateSuccess'));
    } catch (error) {
      alert(t('alerts.updateFailed') + ': ' + (error.message || ''));
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!confirm(t('alerts.deactivateConfirm'))) return;

    try {
      await adminApi(`/admins/${adminId}`, { method: 'DELETE' });
      loadAdmins();
      alert(t('alerts.deactivateSuccess'));
    } catch (error) {
      alert(t('alerts.deactivateFailed') + ': ' + (error.message || ''));
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
        // User Management
        canManageInfluencers: true,
        canManageBusinesses: true,
        canManageAdmins: false,
        canSuspendUsers: true,
        canVerifyUsers: true,
        // Content Management
        canModerateContent: true,
        canApproveOffers: true,
        canDeleteContent: true,
        // Financial Management
        canViewPayments: false,
        canProcessRefunds: false,
        canManageSubscriptions: false,
        // System Management
        canViewAnalytics: true,
        canManageSettings: false,
        canAccessLogs: false,
        // Support
        canHandleTickets: true,
        canSendNotifications: true
      }
    });
  };

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name || '',
      email: admin.email || '',
      password: '', // Don't populate password
      role: admin.role || 'admin',
      department: admin.department || '',
      permissions: {
        // User Management
        canManageInfluencers: admin.permissions?.canManageInfluencers ?? true,
        canManageBusinesses: admin.permissions?.canManageBusinesses ?? true,
        canManageAdmins: admin.permissions?.canManageAdmins ?? false,
        canSuspendUsers: admin.permissions?.canSuspendUsers ?? true,
        canVerifyUsers: admin.permissions?.canVerifyUsers ?? true,
        // Content Management
        canModerateContent: admin.permissions?.canModerateContent ?? true,
        canApproveOffers: admin.permissions?.canApproveOffers ?? true,
        canDeleteContent: admin.permissions?.canDeleteContent ?? true,
        // Financial Management
        canViewPayments: admin.permissions?.canViewPayments ?? false,
        canProcessRefunds: admin.permissions?.canProcessRefunds ?? false,
        canManageSubscriptions: admin.permissions?.canManageSubscriptions ?? false,
        // System Management
        canViewAnalytics: admin.permissions?.canViewAnalytics ?? true,
        canManageSettings: admin.permissions?.canManageSettings ?? false,
        canAccessLogs: admin.permissions?.canAccessLogs ?? false,
        // Support
        canHandleTickets: admin.permissions?.canHandleTickets ?? true,
        canSendNotifications: admin.permissions?.canSendNotifications ?? true
      }
    });
    setShowEditModal(true);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'superadmin': return 'danger';
      case 'admin': return 'warning';
      case 'moderator': return 'info';
      default: return 'secondary';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={loadAdmins}
            disabled={loading}
          >
            {loading ? t('refreshing') : t('refresh')}
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {t('addNew')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('filters.role')}:</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value, page: 1 }))}
              className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700"
            >
              <option value="">{t('filters.allRoles')}</option>
              <option value="superadmin">{t('roles.superadmin')}</option>
              <option value="admin">{t('roles.admin')}</option>
              <option value="moderator">{t('roles.moderator')}</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('filters.department')}:</label>
            <select
              value={filters.department}
              onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value, page: 1 }))}
              className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700"
            >
              <option value="">{t('filters.allDepartments')}</option>
              <option value="operations">{t('departments.operations')}</option>
              <option value="finance">{t('departments.finance')}</option>
              <option value="support">{t('departments.support')}</option>
              <option value="moderation">{t('departments.moderation')}</option>
              <option value="management">{t('departments.management')}</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Admins List */}
      <Card className="p-6">
        {loading ? (
          <div className="text-center py-8">{t('table.loading')}</div>
        ) : admins.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            {t('table.noAdmins')}
          </div>
        ) : (
          <div className="space-y-4">
            {admins.map((admin) => (
              <div key={admin._id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {admin.name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{admin.name}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{admin.email}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant={getRoleBadgeColor(admin.role)}>
                          {admin.role?.toUpperCase()}
                        </Badge>
                        {admin.department && (
                          <Badge variant="secondary">{admin.department}</Badge>
                        )}
                        {!admin.isActive && (
                          <Badge variant="danger">{t('table.inactive')}</Badge>
                        )}
                      </div>
                      {/* Permissions Display */}
                      {admin.permissions && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {admin.permissions.canManageInfluencers && (
                            <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">Influencers</span>
                          )}
                          {admin.permissions.canManageBusinesses && (
                            <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">Businesses</span>
                          )}
                          {admin.permissions.canManageAdmins && (
                            <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded">Admins</span>
                          )}
                          {admin.permissions.canModerateContent && (
                            <span className="text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded">Content</span>
                          )}
                          {admin.permissions.canViewPayments && (
                            <span className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded">Payments</span>
                          )}
                          {admin.permissions.canManageSettings && (
                            <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">Settings</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {t('table.joined')}: {formatDate(admin.createdAt)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(admin)}
                    >
                      {t('table.edit')}
                    </Button>
                    {admin.role !== 'superadmin' && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteAdmin(admin._id)}
                      >
                        {t('table.deactivate')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {tUsers('showingItems', {
                    start: ((pagination.page - 1) * pagination.limit) + 1,
                    end: Math.min(pagination.page * pagination.limit, pagination.total),
                    total: pagination.total
                  })}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    {tCommon('previous')}
                  </Button>
                  <span className="px-3 py-1 text-sm text-slate-700 dark:text-slate-300">
                    {tUsers('pageOf', { current: pagination.page, total: pagination.pages })}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    {tCommon('next')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{t('modals.createTitle')}</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateAdmin} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('modals.fullName')} *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('modals.email')} *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('modals.password')} *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('modals.role')}
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="moderator">{t('roles.moderator')}</option>
                      <option value="admin">{t('roles.admin')}</option>
                      <option value="superadmin">{t('roles.superadmin')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('modals.department')}
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">{t('departments.selectDepartment')}</option>
                    <option value="operations">{t('departments.operations')}</option>
                    <option value="finance">{t('departments.finance')}</option>
                    <option value="support">{t('departments.support')}</option>
                    <option value="moderation">{t('departments.moderation')}</option>
                    <option value="management">{t('departments.management')}</option>
                  </select>
                </div>

                {/* Permissions Section */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    {t('modals.permissions')}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {t('modals.permissionsSub')}
                  </p>

                  <div className="space-y-4">
                    {/* User Management */}
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('modals.userManagement')}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.canManageInfluencers}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, canManageInfluencers: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{t('modals.p.manageInfluencers')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.canManageBusinesses}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, canManageBusinesses: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{t('modals.p.manageBusinesses')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.canManageAdmins}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, canManageAdmins: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{t('modals.p.manageAdmins')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.canSuspendUsers}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, canSuspendUsers: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{t('modals.p.suspendUsers')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.canVerifyUsers}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, canVerifyUsers: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{t('modals.p.verifyUsers')}</span>
                        </label>
                      </div>
                    </div>

                    {/* Content Management */}
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('modals.contentManagement')}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.canModerateContent}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, canModerateContent: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{t('modals.p.moderateContent')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.canApproveOffers}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, canApproveOffers: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{t('modals.p.approveOffers')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.canDeleteContent}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, canDeleteContent: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">Delete Content</span>
                        </label>
                      </div>
                    </div>

                    {/* Financial Management */}
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('modals.financialManagement')}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.canViewPayments}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, canViewPayments: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{t('modals.p.viewPayments')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.canProcessRefunds}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, canProcessRefunds: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{t('modals.p.processRefunds')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.canManageSubscriptions}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, canManageSubscriptions: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{t('modals.p.manageSubscriptions')}</span>
                        </label>
                      </div>
                    </div>

                    {/* System Management */}
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('modals.systemManagement')}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.canViewAnalytics}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, canViewAnalytics: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{t('modals.p.viewAnalytics')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.canManageSettings}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, canManageSettings: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{t('modals.p.manageSettings')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.canAccessLogs}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, canAccessLogs: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{t('modals.p.accessLogs')}</span>
                        </label>
                      </div>
                    </div>

                    {/* Support */}
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('modals.support')}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.canHandleTickets}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, canHandleTickets: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{t('modals.p.handleTickets')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.canSendNotifications}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, canSendNotifications: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{t('modals.p.sendNotifications')}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {t('modals.create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{t('modals.editTitle')}</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleUpdateAdmin} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('modals.fullName')} *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('modals.email')} *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('modals.role')}
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={selectedAdmin?.role === 'superadmin' && selectedAdmin?._id !== (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}').id : null)}
                    >
                      <option value="moderator">{t('roles.moderator')}</option>
                      <option value="admin">{t('roles.admin')}</option>
                      <option value="superadmin">{t('roles.superadmin')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('modals.department')}
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">{t('departments.selectDepartment')}</option>
                      <option value="operations">{t('departments.operations')}</option>
                      <option value="finance">{t('departments.finance')}</option>
                      <option value="support">{t('departments.support')}</option>
                      <option value="moderation">{t('departments.moderation')}</option>
                      <option value="management">{t('departments.management')}</option>
                    </select>
                  </div>
                </div>

                {/* Permissions Section */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    {t('modals.permissions')}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {t('modals.permissionsSub')}
                  </p>

                  <div className="space-y-4">
                    {/* User Management */}
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('modals.userManagement')}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.canManageInfluencers}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, canManageInfluencers: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{t('modals.p.manageInfluencers')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.canManageBusinesses}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, canManageBusinesses: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{t('modals.p.manageBusinesses')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.canManageAdmins}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, canManageAdmins: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{t('modals.p.manageAdmins')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.canSuspendUsers}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, canSuspendUsers: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{t('modals.p.suspendUsers')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.canVerifyUsers}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, canVerifyUsers: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{t('modals.p.verifyUsers')}</span>
                        </label>
                      </div>
                    </div>

                    {/* Content Management */}
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('modals.contentManagement')}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.canModerateContent}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, canModerateContent: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{t('modals.p.moderateContent')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.canApproveOffers}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, canApproveOffers: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{t('modals.p.approveOffers')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.canDeleteContent}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, canDeleteContent: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{t('modals.p.deleteContent')}</span>
                        </label>
                      </div>
                    </div>

                    {/* Financial Management */}
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('modals.financialManagement')}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.canViewPayments}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, canViewPayments: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{t('modals.p.viewPayments')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.canProcessRefunds}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, canProcessRefunds: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{t('modals.p.processRefunds')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.canManageSubscriptions}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, canManageSubscriptions: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{t('modals.p.manageSubscriptions')}</span>
                        </label>
                      </div>
                    </div>

                    {/* System Management */}
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('modals.systemManagement')}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.canViewAnalytics}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, canViewAnalytics: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{t('modals.p.viewAnalytics')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.canManageSettings}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, canManageSettings: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{t('modals.p.manageSettings')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.canAccessLogs}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, canAccessLogs: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{t('modals.p.accessLogs')}</span>
                        </label>
                      </div>
                    </div>

                    {/* Support */}
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('modals.support')}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.canHandleTickets}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, canHandleTickets: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{t('modals.p.handleTickets')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.canSendNotifications}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, canSendNotifications: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{t('modals.p.sendNotifications')}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    {t('modals.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {t('modals.update')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}