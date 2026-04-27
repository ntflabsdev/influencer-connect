"use client";

import { useState } from 'react';
import { adminApi } from '../../../../lib/api.js';
import Card from '../../../../components/Card.js';
import Button from '../../../../components/Button.js';
import { useToast } from '../../../../components/ToastProvider.js';
import { useTranslations } from 'next-intl';

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('user');
  const [filters, setFilters] = useState({
    userType: 'influencer',
    status: '',
    startDate: '',
    endDate: ''
  });
  const { push } = useToast();
  const t = useTranslations('Reports');
  const tToasts = useTranslations('Toasts');
  const tUsers = useTranslations('Users');
  const tCommon = useTranslations('Common');

  const generateReport = async (format = 'json') => {
    setLoading(true);
    try {
      if (reportType === 'user') {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });
        queryParams.append('format', format);

        if (format === 'csv') {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'https://influencer-connect-ttvy.onrender.com'}/api/admin/reports/users?${queryParams.toString()}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
          });

          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `user-report-${Date.now()}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            push(tToasts('exportSuccess', { type: t('title').toLowerCase() }), 'success');
          }
        } else {
          const data = await adminApi(`/reports/users?${queryParams.toString()}`);
          push(t('toasts.count', { count: data.report.totalRecords }), 'success');
        }
      } else if (reportType === 'activity') {
        const queryParams = new URLSearchParams();
        if (filters.startDate) queryParams.append('startDate', filters.startDate);
        if (filters.endDate) queryParams.append('endDate', filters.endDate);
        queryParams.append('format', format);

        if (format === 'csv') {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'https://influencer-connect-ttvy.onrender.com'}/api/admin/reports/activity?${queryParams.toString()}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
          });

          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `activity-report-${Date.now()}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            push(tToasts('exportSuccess', { type: t('title').toLowerCase() }), 'success');
          }
        } else {
          const data = await adminApi(`/reports/activity?${queryParams.toString()}`);
          push(t('toasts.count', { count: data.report.totalRecords }), 'success');
        }
      }
    } catch (error) {
      push(tToasts('loadFailed', { type: t('title').toLowerCase() }) + ': ' + (error.message || ''), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">{t('subtitle')}</p>
        </div>
      </div>

      {/* Report Type Selection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">{t('type')}</h3>
        <div className="flex gap-4">
          <button
            onClick={() => setReportType('user')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${reportType === 'user'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
          >
            {t('userReport')}
          </button>
          <button
            onClick={() => setReportType('activity')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${reportType === 'activity'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
          >
            {t('activityReport')}
          </button>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">{tUsers('advancedSearch')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportType === 'user' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {tCommon('users')}
                </label>
                <select
                  value={filters.userType}
                  onChange={(e) => setFilters(prev => ({ ...prev, userType: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700"
                >
                  <option value="influencer">{tCommon('influencer')}</option>
                  <option value="business">{tCommon('business')}</option>
                  <option value="admin">{tCommon('admin')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {tUsers('status')}
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700"
                >
                  <option value="">{tUsers('allStatus')}</option>
                  <option value="active">{tUsers('active')}</option>
                  <option value="adminpending">{tUsers('pending')}</option>
                  <option value="suspended">{tUsers('suspended')}</option>
                </select>
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {tUsers('startDate')}
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {tUsers('endDate')}
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700"
            />
          </div>
        </div>
      </Card>

      {/* Generate Buttons */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">{t('generateJSON')}</h3>
        <div className="flex gap-4">
          <Button
            onClick={() => generateReport('json')}
            disabled={loading}
          >
            {loading ? t('generating') : t('generateJSON')}
          </Button>
          <Button
            variant="secondary"
            onClick={() => generateReport('csv')}
            disabled={loading}
          >
            {loading ? t('generating') : t('generateCSV')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
