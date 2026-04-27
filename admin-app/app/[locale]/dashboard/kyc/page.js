"use client";

import { useEffect, useState } from 'react';
import { apiFetch, getToken } from '../../../../lib/api.js';
import Card from '../../../../components/Card.js';
import Button from '../../../../components/Button.js';
import Badge from '../../../../components/Badge.js';
import Pagination from '../../../../components/Pagination.js';
import { useToast } from '../../../../components/ToastProvider.js';
import { useTranslations } from 'next-intl';

export default function KycPage() {
  const [kycDocs, setKycDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [kycReasons, setKycReasons] = useState({});
  const { push } = useToast();
  const t = useTranslations('KYC');
  const tToasts = useTranslations('Toasts');
  const tCommon = useTranslations('Common');

  useEffect(() => {
    if (!getToken()) {
      push(tToasts('loginFirst'), 'info');
      window.location.href = '/';
      return;
    }
    loadKycDocs();
  }, [page]);

  const loadKycDocs = async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`/api/kyc/admin/pending?page=${page}&limit=10`);
      setKycDocs(data.docs || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      push(tToasts('loadFailed', { type: 'KYC' }), 'error');
    } finally {
      setLoading(false);
    }
  };

  const reviewKyc = async (id, status) => {
    try {
      const reason = status === 'rejected' ? kycReasons[id] || '' : undefined;
      await apiFetch(`/api/kyc/admin/${id}`, {
        method: 'PATCH',
        body: { status, reason }
      });
      push(tToasts('updated', { type: 'KYC' }), 'success');
      loadKycDocs();
    } catch (err) {
      push(tToasts('saveFailed', { type: 'KYC' }), 'error');
    }
  };

  if (loading && kycDocs.length === 0) {
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

      {kycDocs.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-slate-500">{t('noDocs')}</p>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {kycDocs.map((doc) => (
              <Card key={doc._id} className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{doc.user?.name || t('unknownUser')}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {doc.user?.email || t('noEmail')}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge>{doc.type}</Badge>
                    </div>
                  </div>
                </div>

                <a
                  className="text-indigo-600 hover:text-indigo-700 text-sm inline-flex items-center gap-1"
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  📄 {t('viewDoc')}
                </a>

                {doc.type !== 'auto' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('rejectionReason')}
                    </label>
                    <input
                      className="w-full rounded border border-slate-200 px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700"
                      placeholder={t('rejectionPlaceholder')}
                      value={kycReasons[doc._id] || ''}
                      onChange={(e) =>
                        setKycReasons((prev) => ({
                          ...prev,
                          [doc._id]: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  <Button onClick={() => reviewKyc(doc._id, 'approved')}>
                    {t('approve')}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => reviewKyc(doc._id, 'rejected')}
                  >
                    {t('reject')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Pagination
            page={page}
            pages={totalPages}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}