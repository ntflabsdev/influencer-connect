"use client";

import { useEffect, useState } from 'react';
import { apiFetch, getToken } from '../../../../lib/api.js';
import Card from '../../../../components/Card.js';
import { useToast } from '../../../../components/ToastProvider.js';
import { useTranslations } from 'next-intl';

export default function PaymentsPage() {
  const [analytics, setAnalytics] = useState(null);
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="font-semibold mb-4">{t('snapshot')}</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">{t('totalSucceeded')}</span>
              <span className="text-2xl font-bold text-green-600">€{analytics.payments?.total || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">{t('transactionCount')}</span>
              <span className="text-lg font-semibold">{analytics.payments?.count || 0}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">{t('status')}</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>{t('successful')}</span>
              <span className="text-green-600 font-semibold">{analytics.payments?.count || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('pending')}</span>
              <span className="text-yellow-600 font-semibold">0</span>
            </div>
            <div className="flex justify-between">
              <span>{t('failed')}</span>
              <span className="text-red-600 font-semibold">0</span>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">{t('systemInfo')}</h3>
        <p className="text-slate-600 dark:text-slate-400">
          {t('systemInfoText')}
        </p>
      </Card>
    </div>
  );
}