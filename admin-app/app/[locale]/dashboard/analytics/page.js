"use client";

import { useEffect, useState } from 'react';
import { apiFetch, getToken } from '../../../../lib/api.js';
import Card from '../../../../components/Card.js';
import { useToast } from '../../../../components/ToastProvider.js';
import { useTranslations } from 'next-intl';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const { push } = useToast();
  const t = useTranslations('Analytics');
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
    } catch (err) {
      push(tToasts('loadFailed', { type: t('title').toLowerCase() }), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !analytics) {
    return <div className="text-center py-8">{t('loading')}</div>;
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">{t('noData')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
          <p className="text-slate-600 dark:text-slate-400">{t('subtitle')}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <h3 className="font-semibold mb-2">{t('offersStatus')}</h3>
          <div className="space-y-2">
            {analytics.offerStatus?.map((status) => (
              <div key={status._id} className="flex justify-between">
                <span className="capitalize">{status._id || t('unknown')}</span>
                <span className="font-semibold">{status.count}</span>
              </div>
            )) || <p className="text-slate-500">{t('noData')}</p>}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-2">{t('appsStatus')}</h3>
          <div className="space-y-2">
            {analytics.applicationStatus?.map((status) => (
              <div key={status._id} className="flex justify-between">
                <span className="capitalize">{status._id || t('unknown')}</span>
                <span className="font-semibold">{status.count}</span>
              </div>
            )) || <p className="text-slate-500">{t('noData')}</p>}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-2">{t('payments')}</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>{t('totalAmount')}</span>
              <span className="font-semibold">€{analytics.payments?.total || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('totalCount')}</span>
              <span className="font-semibold">{analytics.payments?.count || 0}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="md:col-span-3">
        <h3 className="font-semibold mb-4">{t('dailyTrend')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
          {analytics.dailyApplications?.map((day) => (
            <div key={day._id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
              <div className="text-lg font-bold text-indigo-600">{day.count}</div>
              <div className="text-xs text-slate-500">{day._id}</div>
            </div>
          )) || <p className="text-slate-500 col-span-full text-center py-4">{t('noDailyData')}</p>}
        </div>
      </Card>
    </div>
  );
}