"use client";

import { useEffect, useState } from 'react';
import { apiFetch, getToken } from '../../../../lib/api.js';
import Card from '../../../../components/Card.js';
import { useToast } from '../../../../components/ToastProvider.js';
import { useTranslations } from 'next-intl';
import { 
  StatCard, 
  GradientCard, 
  GlassCard, 
  ActivityItem, 
  ProgressRing,
  QuickAction,
  ChartPlaceholder
} from '../../../../components/DesignSystem.js';

export default function PaymentsPage() {
  const DUMMY = { payments: { total: 48200, count: 312 } };
  const [analytics, setAnalytics] = useState(DUMMY);
  const [loading, setLoading] = useState(false);
  const { push } = useToast();
  const t = useTranslations('Payments');
  const tToasts = useTranslations('Toasts');

  useEffect(() => {
    if (!getToken()) {
      push(tToasts('loginFirst'), 'info');
      window.location.href = '/';
      return;
    }
    loadAnalytics();
  }, []);

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

  return (
    <div className="flex flex-col gap-8">
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💳 {t('title')}</h1>
          <p className="text-gray-600 mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadAnalytics}
            disabled={loading}
            className="px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {/* ── Payment Overview Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`₹${analytics.payments?.total || 0}`}
          subtitle="All time earnings"
          icon="💰"
          trend={{ value: 12.5 }}
          accent="#059669"
          accentBg="#ecfdf5"
        />
        <StatCard
          title="Transactions"
          value={analytics.payments?.count || 0}
          subtitle="Total payments"
          icon="📊"
          trend={{ value: 8.2 }}
          accent="#4f46e5"
          accentBg="#eef2ff"
        />
        <StatCard
          title="Success Rate"
          value="98.5%"
          subtitle="Payment success"
          icon="✅"
          trend={{ value: 2.1 }}
          accent="#10b981"
          accentBg="#d1fae5"
        />
        <StatCard
          title="Pending"
          value="0"
          subtitle="Awaiting processing"
          icon="⏳"
          accent="#d97706"
          accentBg="#fffbeb"
        />
      </div>

      {/* ── Payment Analytics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GradientCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-6">📈 {t('snapshot')}</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <span className="text-white/90">💰 {t('totalSucceeded')}</span>
              <span className="text-2xl font-bold text-white">€{analytics.payments?.total || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <span className="text-white/90">📊 {t('transactionCount')}</span>
              <span className="text-xl font-semibold text-white">{analytics.payments?.count || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <span className="text-white/90">💵 Average Transaction</span>
              <span className="text-lg font-semibold text-white">
                €{analytics.payments?.count ? (analytics.payments.total / analytics.payments.count).toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        </GradientCard>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">📊 Payment Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">{t('successful')}</span>
              </div>
              <span className="text-lg font-semibold text-green-600">{analytics.payments?.count || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-700">{t('pending')}</span>
              </div>
              <span className="text-lg font-semibold text-yellow-600">0</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-700">{t('failed')}</span>
              </div>
              <span className="text-lg font-semibold text-red-600">0</span>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Success Rate</span>
                <span>98.5%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: '98.5%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Charts & Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartPlaceholder title="Payment Trends" height={300} />
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">⚡ Quick Actions</h3>
          <QuickAction 
            icon="📊" 
            label="View Reports" 
            color="indigo"
            onClick={() => window.location.href = '/dashboard/reports'}
          />
          <QuickAction 
            icon="📧" 
            label="Export Data" 
            color="green"
            onClick={() => push('Data export started', 'success')}
          />
          <QuickAction 
            icon="⚙️" 
            label="Payment Settings" 
            color="yellow"
            onClick={() => window.location.href = '/dashboard/settings'}
          />
          <QuickAction 
            icon="📋" 
            label="Transaction Log" 
            color="purple"
            onClick={() => window.location.href = '/dashboard/stripe'}
          />
        </div>
      </div>

      {/* ── Recent Transactions ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">📋 Recent Transactions</h3>
        <div className="space-y-4">
          {[
            { id: '#TRX001', user: 'John Doe', amount: '€29.99', status: 'success', date: '2 hours ago' },
            { id: '#TRX002', user: 'Jane Smith', amount: '€49.99', status: 'success', date: '5 hours ago' },
            { id: '#TRX003', user: 'Bob Johnson', amount: '€19.99', status: 'success', date: '1 day ago' },
            { id: '#TRX004', user: 'Alice Brown', amount: '€99.99', status: 'success', date: '2 days ago' }
          ].map((transaction, index) => (
            <div key={index} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center text-lg">
                  💳
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{transaction.id}</h4>
                  <p className="text-sm text-gray-500">{transaction.user} • {transaction.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-900">{transaction.amount}</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                  ✅ {transaction.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── System Information ── */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ {t('systemInfo')}</h3>
        <p className="text-gray-600">
          {t('systemInfoText')}
        </p>
      </GlassCard>
    </div>
  );
}