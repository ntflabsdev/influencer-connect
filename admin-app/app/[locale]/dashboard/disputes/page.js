"use client";

import { useEffect, useState } from 'react';
import { apiFetch, getToken } from '../../../../lib/api.js';
import Card from '../../../../components/Card.js';
import Button from '../../../../components/Button.js';
import Table from '../../../../components/Table.js';
import { useToast } from '../../../../components/ToastProvider.js';
import { useTranslations } from 'next-intl';

export default function DisputesPage() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(false);
  const { push } = useToast();
  const t = useTranslations('Disputes');
  const tToasts = useTranslations('Toasts');
  const tCommon = useTranslations('Common');

  useEffect(() => {
    if (!getToken()) {
      push(tToasts('loginFirst'), 'info');
      window.location.href = '/';
      return;
    }
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/admin/disputes?status=open');
      setDisputes(data.disputes || []);
    } catch (err) {
      push(tToasts('loadFailed', { type: 'Disputes' }), 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateDispute = async (id, payload) => {
    try {
      await apiFetch(`/api/admin/disputes/${id}`, {
        method: 'PATCH',
        body: payload
      });
      push(tToasts('updated', { type: 'Dispute' }), 'success');
      loadDisputes();
    } catch (err) {
      push(tToasts('saveFailed', { type: 'Dispute' }), 'error');
    }
  };

  if (loading && disputes.length === 0) {
    return <div className="text-center py-8">{t('loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
          <p className="text-slate-600 dark:text-slate-400">{t('subtitle')}</p>
        </div>
      </div>

      <Card className="space-y-3">
        {disputes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">{t('noDisputes')}</p>
          </div>
        ) : (
          <Table
            columns={[
              { key: 'issueType', label: t('table.type'), render: (d) => d.issueType },
              { key: 'raisedBy', label: t('table.raisedBy'), render: (d) => d.raisedBy },
              {
                key: 'offer',
                label: t('table.offer'),
                render: (d) => d.application?.offer?.title || 'N/A'
              },
              { key: 'status', label: t('table.status'), render: (d) => d.status },
              {
                key: 'actions',
                label: t('table.actions'),
                render: (d) => (
                  <div className="flex gap-2">
                    <Button onClick={() => updateDispute(d._id, { status: 'in_review' })}>
                      {t('actions.review')}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        updateDispute(d._id, {
                          status: 'resolved',
                          reviewerDecision: 'split',
                          resolutionNote: 'Manual resolve'
                        })
                      }
                    >
                      {t('actions.resolve')}
                    </Button>
                  </div>
                ),
              },
            ]}
            data={disputes}
            empty={t('empty')}
          />
        )}
      </Card>
    </div>
  );
}