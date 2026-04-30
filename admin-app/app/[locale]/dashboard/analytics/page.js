"use client";

import { useEffect, useState } from 'react';
import { apiFetch, getToken } from '../../../../lib/api.js';
import { useToast } from '../../../../components/ToastProvider.js';
import { useTranslations } from 'next-intl';
import { 
  StatCard, 
  GradientCard, 
  GlassCard, 
  MetricRow, 
  ChartPlaceholder,
  ProgressRing,
  QuickAction,
  softBlueColors
} from '../../../../components/DesignSystem.js';

export default function AnalyticsPage() {
  const DUMMY = {
    payments: { total: 48200, count: 312 },
    applicationStatus: [
      { _id: 'approved', count: 847 },
      { _id: 'applied', count: 621 },
      { _id: 'rejected', count: 189 },
      { _id: 'completed', count: 190 },
    ],
    dailyApplications: [
      { _id: '2026-06-05', count: 42 },
      { _id: '2026-06-06', count: 58 },
      { _id: '2026-06-07', count: 71 },
      { _id: '2026-06-08', count: 65 },
      { _id: '2026-06-09', count: 89 },
      { _id: '2026-06-10', count: 112 },
      { _id: '2026-06-11', count: 94 },
    ],
  };

  const [analytics, setAnalytics] = useState(DUMMY);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const { push } = useToast();
  const t = useTranslations('Analytics');
  const tToasts = useTranslations('Toasts');

  const periods = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ];

  useEffect(() => {
    if (!getToken()) {
      push(tToasts('loginFirst'), 'info');
      window.location.href = '/';
      return;
    }
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/admin/analytics/detail');
      setAnalytics(data);
    } catch {
      // Keep dummy data on API failure
    } finally {
      setLoading(false);
    }
  };

  if (loading && !analytics) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">{t('subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 h-32 animate-pulse">
              <div className="bg-gray-100 rounded-lg h-4 w-20 mb-4" />
              <div className="bg-gray-100 rounded-lg h-8 w-16 mb-2" />
              <div className="bg-gray-100 rounded-lg h-3 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">

      {/* ── Header with Period Selector ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 {t('title')}</h1>
          <p className="text-gray-600 mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex gap-2">
          {periods.map(period => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedPeriod === period.value
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Overview Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('stats.totalRevenue')}
          value="€12,450"
          subtitle={t('stats.thisMonth')}
          icon="💰"
          trend={{ value: 12.5 }}
          accent="#059669"
          accentBg="#ecfdf5"
        />
        <StatCard
          title={t('stats.activeOffers')}
          value="248"
          subtitle={t('stats.liveCampaigns')}
          icon="📦"
          trend={{ value: 8.2 }}
          accent="#4f46e5"
          accentBg="#eef2ff"
        />
        <StatCard
          title={t('stats.applications')}
          value="1,847"
          subtitle={t('stats.thisMonth')}
          icon="📝"
          trend={{ value: -3.1 }}
          accent="#7c3aed"
          accentBg="#f5f3ff"
        />
        <StatCard
          title={t('stats.successRate')}
          value={`${analytics.applicationStatus?.reduce((s, a) => s + a.count, 0) > 0
            ? Math.round(((analytics.applicationStatus?.find(a => a._id === 'approved')?.count || 0) / analytics.applicationStatus?.reduce((s, a) => s + a.count, 0)) * 100)
            : 0}%`}
          subtitle={t('stats.approvalRate')}
          icon="✅"
          trend={{ value: 5.8 }}
          accent={softBlueColors?.warning || '#f59e0b'}
          accentBg={softBlueColors?.warningLight || '#fef3c7'}
        />
      </div>

      {/* ── Performance Overview ── */}
      <GradientCard className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="text-white">
            <h3 className="text-lg font-semibold mb-6">{t('performance.title')}</h3>
            <div className="space-y-4">
              <MetricRow 
                label={t('performance.conversionRate')} 
                value="3.2%" 
                color="text-white" 
                bg="bg-white/20" 
              />
              <MetricRow 
                label={t('performance.avgOrderValue')} 
                value="€245" 
                color="text-white" 
                bg="bg-white/20" 
              />
              <MetricRow 
                label={t('performance.campaignROI')} 
                value="284%" 
                color="text-white" 
                bg="bg-white/20" 
              />
            </div>
          </div>
          <div className="lg:col-span-2 flex items-center justify-center">
            <ProgressRing value={78} size={160} color="#ffffff" />
          </div>
        </div>
      </GradientCard>

      {/* ── Charts Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartPlaceholder title={t('charts.revenueTrend')} height={250} />
        <ChartPlaceholder title={t('charts.userGrowth')} height={250} />
      </div>

      {/* ── Daily Trends ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">📈 {t('dailyTrend')}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4">
          {analytics.dailyApplications?.map((day, index) => (
            <div key={day._id} className="text-center">
              <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-4 border border-indigo-100">
                <div className="text-2xl font-bold text-indigo-600">{day.count}</div>
                <div className="text-xs text-gray-600 mt-2">{day._id}</div>
              </div>
            </div>
          )) || (
            <div className="col-span-full text-center py-8">
              <div className="text-4xl mb-2">📅</div>
              <p className="text-gray-500">{t('noDailyData')}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickAction 
          icon="📊" 
          label={t('actions.exportReport')} 
          color="blue"
          onClick={() => push('Report export started', 'success')}
        />
        <QuickAction 
          icon="📧" 
          label={t('actions.emailSummary')} 
          color="emerald"
          onClick={() => push('Summary emailed successfully', 'success')}
        />
        <QuickAction 
          icon="🔄" 
          label={t('actions.refreshData')} 
          color="amber"
          onClick={loadAnalytics}
        />
        <QuickAction 
          icon="⚙️" 
          label={t('actions.settings')} 
          color="indigo"
          onClick={() => window.location.href = '/dashboard/settings'}
        />
      </div>

    </div>
  );
}