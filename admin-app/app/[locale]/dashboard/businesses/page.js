"use client";

import { useEffect, useState } from 'react';
import { apiFetch, getToken } from '../../../../lib/api.js';
import Card from '../../../../components/Card.js';
import Button from '../../../../components/Button.js';
import Table from '../../../../components/Table.js';
import Pagination from '../../../../components/Pagination.js';
import { useToast } from '../../../../components/ToastProvider.js';
import { useTranslations } from 'next-intl';

const emptyUserForm = (role) => ({
  role,
  name: '',
  email: '',
  password: '',
  meta: {
    businessName: '',
    website: '',
  },
});

export default function BusinessesPage() {
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState(emptyUserForm('business'));
  const [editingUser, setEditingUser] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userSaving, setUserSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showPending, setShowPending] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    search: '',
    status: '',
    isVerified: '',
    startDate: '',
    endDate: '',
    category: '',
    location: ''
  });
  const [userStats, setUserStats] = useState(null);
  const { push } = useToast();
  const t = useTranslations('Businesses');
  const tUsers = useTranslations('Users');
  const tToasts = useTranslations('Toasts');
  const tCommon = useTranslations('Common');

  useEffect(() => {
    if (!getToken()) {
      push(tToasts('loginFirst'), 'info');
      window.location.href = '/';
      return;
    }
    loadUsers();
  }, [page, showPending, advancedFilters]);

  const loadUsers = async () => {
    setUserLoading(true);
    try {
      let data;
      if (showAdvancedSearch && Object.values(advancedFilters).some(v => v)) {
        const queryParams = new URLSearchParams({ userType: 'business' });
        Object.entries(advancedFilters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });
        queryParams.append('page', page);
        queryParams.append('limit', '20');
        data = await apiFetch(`/api/admin/users/search/advanced?${queryParams.toString()}`);
        setUsers(data.users || []);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        const query = showPending
          ? '/api/admin/users?role=business&status=adminpending'
          : '/api/admin/users?role=business';
        data = await apiFetch(query);
        setUsers(data.users.businesses || []);
        setTotalPages(data.pages || 1);
      }
    } catch (err) {
      // Fallback to dummy data when API is unavailable
      const DUMMY_BUSINESSES = [
        { id: 'b1', name: 'Arjun Mehta', email: 'arjun@mamaearth.in', meta: { businessName: 'Mamaearth', website: 'https://mamaearth.in' }, isVerified: true, isSuspended: false, offersCount: 12, rating: 4.8, createdAt: '2026-01-15T10:00:00Z', status: 'active' },
        { id: 'b2', name: 'Sneha Kapoor', email: 'sneha@nykaa.com', meta: { businessName: 'Nykaa', website: 'https://nykaa.com' }, isVerified: true, isSuspended: false, offersCount: 18, rating: 4.9, createdAt: '2026-02-20T09:00:00Z', status: 'active' },
        { id: 'b3', name: 'Rohit Sharma', email: 'rohit@cultfit.com', meta: { businessName: 'Cult.fit', website: 'https://cult.fit' }, isVerified: false, isSuspended: false, offersCount: 3, rating: 4.2, createdAt: '2026-03-10T14:00:00Z', status: showPending ? 'adminpending' : 'active' },
        { id: 'b4', name: 'Kavya Reddy', email: 'kavya@boat-lifestyle.com', meta: { businessName: 'boAt Lifestyle', website: 'https://boat-lifestyle.com' }, isVerified: true, isSuspended: false, offersCount: 15, rating: 4.7, createdAt: '2026-01-05T11:00:00Z', status: 'active' },
        { id: 'b5', name: 'Amit Joshi', email: 'amit@swiggy.in', meta: { businessName: 'Swiggy', website: 'https://swiggy.in' }, isVerified: true, isSuspended: false, offersCount: 9, rating: 4.5, createdAt: '2026-02-28T16:00:00Z', status: 'active' },
        { id: 'b6', name: 'Pooja Nair', email: 'pooja@makemytrip.com', meta: { businessName: 'MakeMyTrip', website: 'https://makemytrip.com' }, isVerified: false, isSuspended: false, offersCount: 0, rating: 0, createdAt: '2026-06-10T08:00:00Z', status: showPending ? 'adminpending' : 'active' },
        { id: 'b7', name: 'Vikram Singh', email: 'vikram@zomato.com', meta: { businessName: 'Zomato', website: 'https://zomato.com' }, isVerified: true, isSuspended: true, offersCount: 7, rating: 3.8, createdAt: '2026-03-15T10:00:00Z', status: 'suspended' },
        { id: 'b8', name: 'Riya Gupta', email: 'riya@myntrafashion.in', meta: { businessName: 'Myntra', website: 'https://myntra.com' }, isVerified: false, isSuspended: false, offersCount: 2, rating: 4.1, createdAt: '2026-06-08T12:00:00Z', status: showPending ? 'adminpending' : 'active' },
      ];
      setUsers(DUMMY_BUSINESSES);
      setTotalPages(1);
    } finally {
      setUserLoading(false);
    }
  };

  const openDrawerFor = (user) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        role: user.role,
        name: user.name || '',
        email: user.email || '',
        password: '',
        meta: {
          businessName: user.meta?.businessName || '',
          website: user.meta?.website || '',
        },
      });
    } else {
      setEditingUser(null);
      setUserForm(emptyUserForm('business'));
    }
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingUser(null);
    setUserForm(emptyUserForm('business'));
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    const role = 'business';

    const metaPayload = {
      businessName: userForm.meta.businessName || undefined,
      website: userForm.meta.website || undefined,
    };

    const payload = {
      role,
      name: userForm.name,
      email: userForm.email,
      meta: metaPayload,
    };
    if (userForm.password) payload.password = userForm.password;

    setUserSaving(true);
    try {
      if (editingUser?.id) {
        await apiFetch(`/api/admin/users/${editingUser.id}`, { method: 'PATCH', body: payload });
        push(tToasts('updated', { type: tCommon('business') }), 'success');
      } else {
        await apiFetch('/api/admin/users', { method: 'POST', body: payload });
        push(tToasts('created', { type: tCommon('business') }), 'success');
      }
      setUserForm(emptyUserForm(role));
      setEditingUser(null);
      await loadUsers();
      closeDrawer();
    } catch (err) {
      push(tToasts('saveFailed', { type: tCommon('business') }), 'error');
    } finally {
      setUserSaving(false);
    }
  };

  const handleVerify = async (userId, value) => {
    try {
      await apiFetch(`/api/admin/users/${userId}`, { method: 'PATCH', body: { isVerified: value } });
      push(value ? tToasts('approved', { type: tCommon('business') }) : tToasts('rejected', { type: tCommon('business') }), 'success');
      await loadUsers();
      if (profileUser?.id === userId) {
        setProfileUser((prev) => (prev ? { ...prev, isVerified: value } : prev));
      }
    } catch (err) {
      push(tToasts('verifyFailed', { type: tCommon('business') }), 'error');
    }
  };

  const handleSuspend = async (userId, value) => {
    try {
      await apiFetch(`/api/admin/users/${userId}/suspend`, { method: 'PATCH', body: { suspended: value } });
      push(value ? tToasts('suspended', { type: tCommon('business') }) : tToasts('unsuspended', { type: tCommon('business') }), 'success');
      await loadUsers();
      if (profileUser?.id === userId) {
        setProfileUser((prev) => (prev ? { ...prev, isSuspended: value } : prev));
      }
    } catch (err) {
      push(tToasts('suspendFailed', { type: tCommon('business') }), 'error');
    }
  };

  const loadUserDetail = async (userId) => {
    setProfileUser((prev) => prev || { id: userId, name: tUsers('profile.loading'), role: '', email: '' });
    setProfileLoading(true);
    try {
      const [userData, statsData] = await Promise.all([
        apiFetch(`/api/admin/users/${userId}`),
        apiFetch(`/api/admin/users/business/${userId}/statistics`)
      ]);
      setProfileUser(userData.user);
      setUserStats(statsData.statistics);
    } catch (err) {
      push(tToasts('loadDetailFailed'), 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  // Bulk operations
  const handleBulkApprove = async () => {
    if (selectedUsers.length === 0) {
      push(tToasts('selectFirst'), 'warning');
      return;
    }
    try {
      await apiFetch('/api/admin/users/bulk/approve', {
        method: 'POST',
        body: { userIds: selectedUsers, userType: 'business' }
      });
      push(tToasts('bulkApproveSuccess', { count: selectedUsers.length, type: tCommon('businesses').toLowerCase() }), 'success');
      setSelectedUsers([]);
      loadUsers();
    } catch (err) {
      push(tToasts('verifyFailed', { type: tCommon('businesses') }), 'error');
    }
  };

  const handleBulkReject = async () => {
    if (selectedUsers.length === 0) {
      push(tToasts('selectFirst'), 'warning');
      return;
    }
    if (!confirm(`Are you sure you want to reject ${selectedUsers.length} businesses?`)) return;
    try {
      await apiFetch('/api/admin/users/bulk/reject', {
        method: 'POST',
        body: { userIds: selectedUsers, userType: 'business' }
      });
      push(tToasts('bulkRejectSuccess', { count: selectedUsers.length, type: tCommon('businesses').toLowerCase() }), 'success');
      setSelectedUsers([]);
      loadUsers();
    } catch (err) {
      push(tToasts('verifyFailed', { type: tCommon('businesses') }), 'error');
    }
  };

  const handleBulkSuspend = async () => {
    if (selectedUsers.length === 0) {
      push(tToasts('selectFirst'), 'warning');
      return;
    }
    if (!confirm(`Are you sure you want to suspend ${selectedUsers.length} businesses?`)) return;
    try {
      await apiFetch('/api/admin/users/bulk/suspend', {
        method: 'POST',
        body: { userIds: selectedUsers, userType: 'business' }
      });
      push(tToasts('bulkSuspendSuccess', { count: selectedUsers.length, type: tCommon('businesses').toLowerCase() }), 'success');
      setSelectedUsers([]);
      loadUsers();
    } catch (err) {
      push(tToasts('suspendFailed', { type: tCommon('businesses') }), 'error');
    }
  };

  const exportUsers = async () => {
    try {
      const queryParams = new URLSearchParams({
        userType: 'business',
        format: 'csv'
      });
      if (showPending) queryParams.append('status', 'adminpending');
      else queryParams.append('status', 'active');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'https://influencer-connect-ttvy.onrender.com'}/api/admin/export/users?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `businesses-export-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        push(tToasts('exportSuccess', { type: tCommon('businesses') }), 'success');
      }
    } catch (error) {
      push(tToasts('exportFailed', { type: tCommon('businesses') }), 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>{showPending ? t('titlePending') : t('titleActive')}</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{showPending ? t('subPending') : t('subActive')}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}>
            {showAdvancedSearch ? tUsers('simpleSearch') : tUsers('advancedSearch')}
          </Button>
          <Button variant="secondary" onClick={exportUsers}>{tUsers('exportCsv')}</Button>
          <Button variant={showPending ? 'primary' : 'secondary'} onClick={() => setShowPending(!showPending)}>
            {showPending ? t('btnViewActive') : t('btnViewPending')}
          </Button>
          <Button onClick={() => openDrawerFor(null)}>{t('btnAdd')}</Button>
        </div>
      </div>

      {/* Advanced Search */}
      {showAdvancedSearch && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">{tUsers('advancedSearch')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{tUsers('searchLabel')}</label>
              <input
                type="text"
                value={advancedFilters.search}
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder={tUsers('searchPlaceholder')}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{tUsers('status')}</label>
              <select
                value={advancedFilters.status}
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700"
              >
                <option value="">{tUsers('allStatus')}</option>
                <option value="active">{tUsers('active')}</option>
                <option value="adminpending">{tUsers('pending')}</option>
                <option value="suspended">{tUsers('suspended')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{tUsers('verified')}</label>
              <select
                value={advancedFilters.isVerified}
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, isVerified: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700"
              >
                <option value="">{tUsers('all')}</option>
                <option value="true">{tUsers('verified')}</option>
                <option value="false">{tUsers('notVerified')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{tUsers('startDate')}</label>
              <input
                type="date"
                value={advancedFilters.startDate}
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{tUsers('endDate')}</label>
              <input
                type="date"
                value={advancedFilters.endDate}
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{tCommon('category')}</label>
              <input
                type="text"
                value={advancedFilters.category}
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Business category..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{tCommon('location')}</label>
              <input
                type="text"
                value={advancedFilters.location}
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City or location..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="secondary"
                onClick={() => setAdvancedFilters({
                  search: '',
                  status: '',
                  isVerified: '',
                  startDate: '',
                  endDate: '',
                  category: '',
                  location: ''
                })}
              >
                {tUsers('clearFilters')}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {tUsers('bulkSelected', { count: selectedUsers.length })}
            </span>
            <div className="flex gap-2">
              {showPending && (
                <>
                  <Button size="sm" onClick={handleBulkApprove}>
                    {tUsers('approveSelected')}
                  </Button>
                  <Button size="sm" variant="danger" onClick={handleBulkReject}>
                    {tUsers('rejectSelected')}
                  </Button>
                </>
              )}
              <Button size="sm" variant="danger" onClick={handleBulkSuspend}>
                {tUsers('suspendSelected')}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setSelectedUsers([])}>
                {tUsers('clearSelection')}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card className="space-y-3">
        {userLoading ? (
          <div className="text-center py-8">{t('loading')}</div>
        ) : (
          <Table
            columns={[
              {
                key: 'select',
                label: (
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(users.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                ),
                render: (u) => (
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(u.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(prev => [...prev, u.id]);
                      } else {
                        setSelectedUsers(prev => prev.filter(id => id !== u.id));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                ),
              },
              {
                key: 'name',
                label: tUsers('cols.name'),
                render: (u) => (
                  <button
                    className="text-left text-indigo-600 hover:text-indigo-700 hover:underline"
                    onClick={() => loadUserDetail(u.id)}
                  >
                    {u.name}
                  </button>
                ),
              },
              { key: 'email', label: tUsers('cols.email') },
              {
                key: 'businessName',
                label: t('businessName'),
                render: (u) => u.meta?.businessName || tUsers('notVerified')
              },
              {
                key: 'offersCount',
                label: t('offers'),
                render: (u) => u.offersCount || 0
              },
              {
                key: 'rating',
                label: tUsers('verified'),
                render: (u) => (u.rating || 0).toFixed(1)
              },
              {
                key: 'verified',
                label: tUsers('verified'),
                render: (u) => (u.isVerified ? tUsers('verifiedYes') : tUsers('verifiedNo'))
              },
              {
                key: 'actions',
                label: tUsers('cols.actions'),
                render: (u) => (
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => openDrawerFor(u)}>
                      {tUsers('actions.edit')}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleVerify(u.id, !u.isVerified)}
                    >
                      {u.isVerified ? tUsers('actions.unverify') : tUsers('actions.approve')}
                    </Button>
                  </div>
                ),
              },
            ]}
            data={users}
            empty={t('noneFound')}
          />
        )}
      </Card>

      <Pagination
        page={page}
        pages={totalPages}
        onChange={setPage}
      />

      {/* Add/Edit Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/40" onClick={closeDrawer} />
          <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">{editingUser ? tUsers('drawer.edit', { role: tCommon('business') }) : tUsers('drawer.add', { role: tCommon('business') })}</p>
                <h3 className="text-xl font-semibold">{tCommon('business')}</h3>
              </div>
              <Button variant="ghost" onClick={closeDrawer}>
                {tUsers('actions.close')}
              </Button>
            </div>
            <form className="space-y-3" onSubmit={handleUserSubmit}>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{tUsers('drawer.contactName')}</label>
                <input
                  className="w-full rounded border border-slate-200 px-3 py-2 dark:bg-slate-800 dark:border-slate-700"
                  value={userForm.name}
                  onChange={(e) => setUserForm((p) => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{tUsers('drawer.emailLabel')}</label>
                <input
                  className="w-full rounded border border-slate-200 px-3 py-2 dark:bg-slate-800 dark:border-slate-700"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm((p) => ({ ...p, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {tUsers('drawer.passwordLabel')} {editingUser ? `(${tUsers('drawer.leaveBlank')})` : ''}
                </label>
                <input
                  className="w-full rounded border border-slate-200 px-3 py-2 dark:bg-slate-800 dark:border-slate-700"
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm((p) => ({ ...p, password: e.target.value }))}
                  required={!editingUser}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('businessName')}</label>
                <input
                  className="w-full rounded border border-slate-200 px-3 py-2 dark:bg-slate-800 dark:border-slate-700"
                  value={userForm.meta.businessName}
                  onChange={(e) =>
                    setUserForm((p) => ({ ...p, meta: { ...p.meta, businessName: e.target.value } }))
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('website')}</label>
                <input
                  className="w-full rounded border border-slate-200 px-3 py-2 dark:bg-slate-800 dark:border-slate-700"
                  type="url"
                  value={userForm.meta.website}
                  onChange={(e) =>
                    setUserForm((p) => ({ ...p, meta: { ...p.meta, website: e.target.value } }))
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={userSaving}>
                  {userSaving ? tUsers('actions.saving') : editingUser ? tUsers('drawer.edit', { role: tCommon('business') }) : tUsers('drawer.add', { role: tCommon('business') })}
                </Button>
                <Button type="button" variant="ghost" onClick={closeDrawer}>
                  {tUsers('actions.cancel')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {profileUser && (
        <div className="fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/30" onClick={() => setProfileUser(null)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-xl overflow-y-auto p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500">{profileUser.role}</p>
                <h3 className="text-xl font-semibold">{profileUser.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">{profileUser.email}</p>
              </div>
              <Button variant="ghost" onClick={() => setProfileUser(null)}>
                {tUsers('actions.close')}
              </Button>
            </div>
            <div className="flex gap-2">
              <span className={`px-2 py-1 rounded text-xs ${profileUser.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {profileUser.isVerified ? tUsers('verified') : tUsers('notVerified')}
              </span>
              {profileUser.isSuspended && (
                <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">{tUsers('suspended')}</span>
              )}
              <Button onClick={() => handleVerify(profileUser.id, true)}>{tUsers('actions.approve')}</Button>
              <Button variant="ghost" onClick={() => handleVerify(profileUser.id, false)}>
                {tUsers('actions.reject')}
              </Button>
              <Button variant="ghost" onClick={() => handleSuspend(profileUser.id, !profileUser.isSuspended)}>
                {profileUser.isSuspended ? tUsers('actions.unsuspend') : tUsers('actions.suspend')}
              </Button>
            </div>
            {profileLoading && <p className="text-sm text-slate-500">{tUsers('profile.loading')}</p>}

            {/* User Statistics */}
            {userStats && !profileLoading && (
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                <h4 className="font-semibold mb-3 text-slate-900 dark:text-slate-100">{tUsers('profile.statistics')}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('offers')}</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{userStats.offersCount || 0}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{tUsers('profile.payments')}</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{userStats.paymentsCount || 0}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{tUsers('profile.activityLogs')}</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{userStats.activityCount || 0}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Activity History */}
            {userStats?.recentActivities && userStats.recentActivities.length > 0 && (
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                <h4 className="font-semibold mb-3 text-slate-900 dark:text-slate-100">{tUsers('profile.recentActivity')}</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {userStats.recentActivities.map((activity, idx) => (
                    <div key={idx} className="p-2 bg-slate-50 dark:bg-slate-800 rounded text-sm">
                      <p className="text-slate-900 dark:text-slate-100">{activity.description}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {activity.adminId?.name || 'System'} • {new Date(activity.timestamp).toLocaleString(undefined)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              {profileUser.meta?.businessName && <p className="text-sm">{tCommon('business')}: {profileUser.meta.businessName}</p>}
              {profileUser.meta?.website && (
                <a className="text-indigo-600 text-sm" href={profileUser.meta.website} target="_blank" rel="noreferrer">
                  {t('website')}
                </a>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {tUsers('profile.joined')}: {profileUser.createdAt ? new Date(profileUser.createdAt).toLocaleString(undefined) : 'n/a'}
            </p>
          </div>
        </div>
      )
      }
    </div >
  );
}