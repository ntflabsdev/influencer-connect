"use client";

import { useState, useEffect } from 'react';
import { adminApi } from '../../../../lib/api.js';
import Card from '../../../../components/Card.js';
import Button from '../../../../components/Button.js';
import Badge from '../../../../components/Badge.js';
import { useToast } from '../../../../components/ToastProvider.js';
import { useTranslations } from 'next-intl';

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    adminId: '',
    action: '',
    targetType: '',
    startDate: '',
    endDate: '',
    search: ''
  });

  const { push } = useToast();
  const t = useTranslations('ActivityLogs');
  const tCommon = useTranslations('Common');
  const tToasts = useTranslations('Toasts');
  const tUsers = useTranslations('Users');

  useEffect(() => {
    loadLogs();
  }, [filters]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const data = await adminApi(`/activity-logs?${queryParams.toString()}`);
      setLogs(data.logs || []);
      setPagination(data.pagination);
    } catch (error) {
      push(tToasts('loadFailed', { type: t('title').toLowerCase() }), 'error');
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== 'page' && key !== 'limit') {
          queryParams.append(key, value);
        }
      });
      queryParams.append('format', 'csv');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://192.168.1.55:5500'}/api/admin/export/activity-logs?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity-logs-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        push(tToasts('exportSuccess', { type: tCommon('activity').toLowerCase() }), 'success');
      }
    } catch (error) {
      push(tToasts('exportFailed', { type: tCommon('activity').toLowerCase() }), 'error');
    }
  };

  const getActionBadgeColor = (action) => {
    if (action.includes('approved') || action.includes('verified')) return 'success';
    if (action.includes('rejected') || action.includes('suspended')) return 'danger';
    if (action.includes('bulk')) return 'warning';
    return 'info';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={loadLogs} disabled={loading}>
            {loading ? t('refreshing') : t('refresh')}
          </Button>
          <Button onClick={exportLogs} variant="secondary">
            {t('exportCSV')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('filters.action')}
            </label>
            <select
              value={filters.action}
              onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value, page: 1 }))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700"
            >
              <option value="">{t('filters.allActions')}</option>
              <option value="user_approved">User Approved</option>
              <option value="user_rejected">User Rejected</option>
              <option value="user_suspended">User Suspended</option>
              <option value="bulk_user_approved">Bulk Approved</option>
              <option value="report_generated">Report Generated</option>
              <option value="data_exported">Data Exported</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('filters.targetType')}
            </label>
            <select
              value={filters.targetType}
              onChange={(e) => setFilters(prev => ({ ...prev, targetType: e.target.value, page: 1 }))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700"
            >
              <option value="">{t('filters.allTypes')}</option>
              <option value="influencer">Influencer</option>
              <option value="business">Business</option>
              <option value="admin">Admin</option>
              <option value="offer">Offer</option>
              <option value="content">Content</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('filters.startDate')}
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value, page: 1 }))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('filters.endDate')}
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value, page: 1 }))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('filters.search')}
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              placeholder={t('filters.searchPlaceholder')}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700"
            />
          </div>

          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() => setFilters({
                page: 1,
                limit: 50,
                adminId: '',
                action: '',
                targetType: '',
                startDate: '',
                endDate: '',
                search: ''
              })}
            >
              {t('filters.clear')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Logs List */}
      <Card className="p-6">
        {loading ? (
          <div className="text-center py-8">{t('loading')}</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            {t('noLogs')}
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log._id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={getActionBadgeColor(log.action)}>
                        {log.action.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                      <Badge variant="secondary">{log.targetType}</Badge>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {formatDate(log.timestamp)}
                      </span>
                    </div>
                    <p className="text-slate-900 dark:text-slate-100 font-medium mb-1">
                      {log.adminName} ({log.adminEmail})
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      {log.description}
                    </p>
                    {log.targetName && (
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                        {t('target')}: {log.targetName}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                    <div>{log.ipAddress}</div>
                    <div className="mt-1">{log.requestMethod} {log.requestPath}</div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {tCommon('showingDataFor')} {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} / {pagination.total}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    {tUsers('pagination.previous')}
                  </Button>
                  <span className="px-3 py-1 text-sm text-slate-700 dark:text-slate-300">
                    {tUsers('pagination.page', { current: pagination.page, total: pagination.pages })}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    {tUsers('pagination.next')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
