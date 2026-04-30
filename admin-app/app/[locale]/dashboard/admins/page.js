"use client";

import { useState, useEffect } from 'react';
import { adminApi } from '../../../../lib/api.js';
import Card from '../../../../components/Card.js';
import Button from '../../../../components/Button.js';
import Badge from '../../../../components/Badge.js';
import { useTranslations } from 'next-intl';
import { 
  StatCard, 
  GradientCard, 
  GlassCard, 
  ActivityItem, 
  ProgressRing,
  QuickAction,
  StatusIndicator,
  softBlueColors,
  softBlueGradients
} from '../../../../components/DesignSystem.js';
import AdminDrawer from '../../../../components/AdminDrawer.js';

export default function AdminsManagementPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAdminDrawer, setShowAdminDrawer] = useState(false);
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
    <div className="flex flex-col gap-8">
      {/* ── Header with Stats ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">👑 {t('title')}</h1>
          <p className="text-gray-600 mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={loadAdmins}
            disabled={loading}
          >
            {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
          </Button>
          <Button
            onClick={() => setShowAdminDrawer(true)}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
          >
            ➕ {t('addNew')}
          </Button>
        </div>
      </div>

    
      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('stats.totalAdmins')}
          value={admins.length}
          subtitle={t('stats.activeTeam')}
          icon="👥"
          accent={softBlueColors.primary}
          accentBg={softBlueColors.primaryLight}
        />
        <StatCard
          title={t('stats.superAdmins')}
          value={admins.filter(a => a.role === 'superadmin').length}
          subtitle={t('stats.fullAccess')}
          icon="👑"
          accent={softBlueColors.danger}
          accentBg={softBlueColors.dangerLight}
        />
        <StatCard
          title={t('stats.activeToday')}
          value="12"
          subtitle={t('stats.currentlyOnline')}
          icon="✅"
          accent={softBlueColors.success}
          accentBg={softBlueColors.successLight}
        />
        <StatCard
          title={t('stats.pendingInvites')}
          value="3"
          subtitle={t('stats.awaitingResponse')}
          icon="📧"
          accent={softBlueColors.warning}
          accentBg={softBlueColors.warningLight}
        />
      </div>

      {/* ── Modern Filters ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex flex-wrap gap-6 items-center">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">🔍 {t('filters.role')}:</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value, page: 1 }))}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">{t('filters.allRoles')}</option>
              <option value="superadmin">👑 {t('roles.superadmin')}</option>
              <option value="admin">👤 {t('roles.admin')}</option>
              <option value="moderator">🛡️ {t('roles.moderator')}</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">🏢 {t('filters.department')}:</label>
            <select
              value={filters.department}
              onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value, page: 1 }))}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">{t('filters.allDepartments')}</option>
              <option value="operations">⚙️ {t('departments.operations')}</option>
              <option value="finance">💰 {t('departments.finance')}</option>
              <option value="support">💬 {t('departments.support')}</option>
              <option value="moderation">📝 {t('departments.moderation')}</option>
              <option value="management">📊 {t('departments.management')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Admins List ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-4xl mb-4">🔄</div>
            <p className="text-gray-600">{t('table.loading')}</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-4">👑</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('table.noAdminsFound')}</h3>
            <p className="text-gray-600">{t('table.noAdmins')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {admins.map((admin) => (
              <div key={admin._id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {admin.name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg">{admin.name}</h3>
                        <StatusIndicator 
                          status={admin.isActive ? 'online' : 'offline'} 
                          label={admin.isActive ? 'Active' : 'Inactive'} 
                        />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{admin.email}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant={getRoleBadgeColor(admin.role)} className="px-3 py-1">
                          {admin.role === 'superadmin' ? '👑' : admin.role === 'admin' ? '👤' : '🛡️'} {admin.role?.toUpperCase()}
                        </Badge>
                        {admin.department && (
                          <Badge variant="secondary" className="px-3 py-1">
                            🏢 {admin.department}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Permissions Display */}
                      {admin.permissions && (
                        <div className="flex flex-wrap gap-2">
                          {admin.permissions.canManageInfluencers && (
                            <span className="text-xs px-3 py-1 bg-green-50 text-green-700 rounded-xl font-medium">👥 {t('permissions.influencers')}</span>
                          )}
                          {admin.permissions.canManageBusinesses && (
                            <span className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-xl font-medium">🏢 {t('permissions.businesses')}</span>
                          )}
                          {admin.permissions.canManageAdmins && (
                            <span className="text-xs px-3 py-1 bg-purple-50 text-purple-700 rounded-xl font-medium">👑 {t('permissions.admins')}</span>
                          )}
                          {admin.permissions.canModerateContent && (
                            <span className="text-xs px-3 py-1 bg-yellow-50 text-yellow-700 rounded-xl font-medium">📝 {t('permissions.content')}</span>
                          )}
                          {admin.permissions.canViewPayments && (
                            <span className="text-xs px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl font-medium">💰 {t('permissions.payments')}</span>
                          )}
                          {admin.permissions.canManageSettings && (
                            <span className="text-xs px-3 py-1 bg-red-50 text-red-700 rounded-xl font-medium">⚙️ {t('permissions.settings')}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">📅 {t('table.joined')}</p>
                      <p className="text-sm text-gray-700">{formatDate(admin.createdAt)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(admin)}
                        className="hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        ✏️ {t('table.edit')}
                      </Button>
                      {admin.role !== 'superadmin' && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteAdmin(admin._id)}
                          className="hover:bg-red-50"
                        >
                          🚫 {t('table.deactivate')}
                        </Button>
                      )}
                    </div>
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
      </div>

      {/* ── Create Admin Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">👑 {t('modals.createTitle')}</h2>
                  <p className="text-gray-600">Add a new administrator to your team</p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateAdmin} className="space-y-6">
                {/* ── Basic Information ── */}
                <GradientCard className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">📝 Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        👤 {t('modals.fullName')} *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40"
                        placeholder="Enter full name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        📧 {t('modals.email')} *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40"
                        placeholder="admin@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        🔐 {t('modals.password')} *
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40"
                        placeholder="Strong password"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        👑 {t('modals.role')}
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                        className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/20 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40"
                      >
                        <option value="moderator">🛡️ {t('roles.moderator')}</option>
                        <option value="admin">👤 {t('roles.admin')}</option>
                        <option value="superadmin">👑 {t('roles.superadmin')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-white mb-2">
                      🏢 {t('modals.department')}
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/20 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40"
                    >
                      <option value="">{t('departments.selectDepartment')}</option>
                      <option value="operations">⚙️ {t('departments.operations')}</option>
                      <option value="finance">💰 {t('departments.finance')}</option>
                      <option value="support">💬 {t('departments.support')}</option>
                      <option value="moderation">📝 {t('departments.moderation')}</option>
                      <option value="management">📊 {t('departments.management')}</option>
                    </select>
                  </div>
                </GradientCard>

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

      {/* ── Admin Drawer Component ── */}
      <AdminDrawer
        isOpen={showAdminDrawer}
        onClose={() => setShowAdminDrawer(false)}
        onSuccess={() => {
          loadAdmins();
          setShowAdminDrawer(false);
        }}
      />

      {/* ── Floating Action Button ── */}
    
    </div>
  );
}