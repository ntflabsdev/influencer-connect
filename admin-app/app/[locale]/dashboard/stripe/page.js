"use client";

import { useEffect, useState } from 'react';
import { apiFetch, getToken } from '../../../../lib/api.js';
import Card from '../../../../components/Card.js';
import Button from '../../../../components/Button.js';
import Table from '../../../../components/Table.js';
import { useToast } from '../../../../components/ToastProvider.js';

export default function StripePage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const { push } = useToast();

  useEffect(() => {
    if (!getToken()) {
      push('Please login first', 'info');
      window.location.href = '/';
      return;
    }
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/admin/payments?hold=true');
      setPayments(data.payments || []);
    } catch (err) {
      push('Failed to load payment holds', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentHold = async (id, value) => {
    try {
      await apiFetch(`/api/admin/payments/${id}`, {
        method: 'PATCH',
        body: { hold: value }
      });
      push(value ? 'Hold enabled' : 'Hold cleared', 'success');
      loadPayments();
    } catch (err) {
      push('Failed to update payment hold', 'error');
    }
  };

  if (loading && payments.length === 0) {
    return <div className="text-center py-8">Loading payment holds...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Stripe Payment Holds</h1>
          <p className="text-slate-600 dark:text-slate-400">Manual release/lock of payment holds</p>
        </div>
      </div>

      <Card className="space-y-3">
        {payments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No payment holds</p>
          </div>
        ) : (
          <Table
            columns={[
              {
                key: 'offer',
                label: 'Offer',
                render: (p) => p.application?.offer?.title || 'N/A'
              },
              {
                key: 'amount',
                label: 'Amount',
                render: (p) => `€${p.amount}`
              },
              { key: 'status', label: 'Status' },
              {
                key: 'hold',
                label: 'Hold',
                render: (p) => (p.hold ? 'On hold' : 'Clear')
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (p) => (
                  <div className="flex gap-2">
                    <Button onClick={() => updatePaymentHold(p._id, false)}>
                      Release
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => updatePaymentHold(p._id, true)}
                    >
                      Lock
                    </Button>
                  </div>
                ),
              },
            ]}
            data={payments}
            empty="No holds"
          />
        )}
      </Card>
    </div>
  );
}