"use client";

import { useState } from 'react';
import { adminApi } from '../../../../lib/api.js';
import Card from '../../../../components/Card.js';
import Button from '../../../../components/Button.js';
import { useToast } from '../../../../components/ToastProvider.js';
import { useTranslations } from 'next-intl';
import { 
  StatCard, 
  GradientCard, 
  GlassCard, 
  QuickAction,
  ChartPlaceholder
} from '../../../../components/DesignSystem.js';

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
    <div className="flex flex-col gap-8">
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 {t('title')}</h1>
          <p className="text-gray-600 mt-1">{t('subtitle')}</p>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('stats.reportsGenerated')}
          value="127"
          subtitle={t('stats.thisMonth')}
          icon="📈"
          accent="#4f46e5"
          accentBg="#eef2ff"
        />
        <StatCard
          title={t('stats.userActivity')}
          value="2,847"
          subtitle={t('stats.last7Days')}
          icon="�"
          accent="#059669"
          accentBg="#ecfdf5"
        />
        <StatCard
          title={t('stats.systemHealth')}
          value="98.2%"
          subtitle={t('stats.performanceScore')}
          icon="💚"
          accent="#7c3aed"
          accentBg="#f5f3ff"
        />
        <StatCard
          title={t('stats.dataExported')}
          value="45.2GB"
          subtitle={t('stats.totalExports')}
          icon="💾"
          accent="#d97706"
          accentBg="#fffbeb"
        />
      </div>

      {/* ── Report Type Selection ── */}
      <GradientCard className="p-8">
        <h3 className="text-lg font-semibold text-white mb-6">{t('type')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setReportType('user')}
            className={`p-6 rounded-2xl border-2 transition-all ${
              reportType === 'user'
                ? 'bg-white/20 border-white text-white'
                : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/15'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                👥
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-white">{t('userReport')}</h4>
                <p className="text-sm text-white/70">User analytics and demographics</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => setReportType('activity')}
            className={`p-6 rounded-2xl border-2 transition-all ${
              reportType === 'activity'
                ? 'bg-white/20 border-white text-white'
                : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/15'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                📊
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-white">{t('activityReport')}</h4>
                <p className="text-sm text-white/70">Platform activity and engagement</p>
              </div>
            </div>
          </button>
        </div>
      </GradientCard>

      {/* ── Filters Section ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">🔍 {tUsers('advancedSearch')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reportType === 'user' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {tCommon('users')}
                </label>
                <select
                  value={filters.userType}
                  onChange={(e) => setFilters(prev => ({ ...prev, userType: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="influencer">{tCommon('influencer')}</option>
                  <option value="business">{tCommon('business')}</option>
                  <option value="admin">{tCommon('admin')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {tUsers('status')}
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {tUsers('startDate')}
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {tUsers('endDate')}
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* ── Quick Actions & Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartPlaceholder title={t('charts.reportTrends')} height={300} />
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">⚡ Quick Actions</h3>
          <QuickAction 
            icon="📊" 
            label={t('actions.generateJSON')} 
            color="blue"
            onClick={() => generateReport('json')}
          />
          <QuickAction 
            icon="📄" 
            label={t('actions.exportCSV')} 
            color="emerald"
            onClick={() => generateReport('csv')}
          />
          <QuickAction 
            icon="📧" 
            label={t('actions.emailReport')} 
            color="amber"
            onClick={() => push('Report emailed successfully', 'success')}
          />
          <QuickAction 
            icon="⚙️" 
            label={t('actions.settings')} 
            color="indigo"
            onClick={() => window.location.href = '/dashboard/settings'}
          />
        </div>
      </div>

      {/* ── Recent Reports ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">📋 {t('recentReports')}</h3>
        <div className="space-y-4">
          {[
            { name: 'User Analytics - November 2024', date: '2 hours ago', size: '2.4 MB', type: 'CSV' },
            { name: 'Activity Report - Weekly', date: '1 day ago', size: '1.8 MB', type: 'JSON' },
            { name: 'Influencer Demographics', date: '3 days ago', size: '3.1 MB', type: 'CSV' },
            { name: 'Business Engagement Metrics', date: '1 week ago', size: '2.7 MB', type: 'JSON' }
          ].map((report, index) => (
            <div key={index} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center text-lg">
                  📄
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{report.name}</h4>
                  <p className="text-sm text-gray-500">{report.date} • {report.size}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                  {report.type}
                </span>
                <button onClick={() => push(`Downloading ${report.name}...`, 'success')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
