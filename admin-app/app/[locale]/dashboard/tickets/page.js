"use client";

import { useEffect, useState } from 'react';
import { apiFetch, getToken } from '../../../../lib/api.js';
import Card from '../../../../components/Card.js';
import Button from '../../../../components/Button.js';
import Table from '../../../../components/Table.js';
import { useToast } from '../../../../components/ToastProvider.js';

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const { push } = useToast();

  useEffect(() => {
    if (!getToken()) {
      push('Please login first', 'info');
      window.location.href = '/';
      return;
    }
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/admin/tickets?status=open');
      setTickets(data.tickets || []);
    } catch (err) {
      push('Failed to load tickets', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateTicket = async (id, payload) => {
    try {
      await apiFetch(`/api/admin/tickets/${id}`, {
        method: 'PATCH',
        body: payload
      });
      push('Ticket updated', 'success');
      loadTickets();
    } catch (err) {
      push('Failed to update ticket', 'error');
    }
  };

  if (loading && tickets.length === 0) {
    return <div className="text-center py-8">Loading support tickets...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Support Tickets</h1>
          <p className="text-slate-600 dark:text-slate-400">Handle login/verification/payment issues</p>
        </div>
      </div>

      <Card className="space-y-3">
        {tickets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No open tickets</p>
          </div>
        ) : (
          <Table
            columns={[
              { key: 'subject', label: 'Subject' },
              { key: 'user', label: 'User', render: (t) => t.user?.name || 'N/A' },
              { key: 'category', label: 'Category' },
              { key: 'status', label: 'Status' },
              {
                key: 'actions',
                label: 'Actions',
                render: (t) => (
                  <div className="flex gap-2">
                    <Button onClick={() => updateTicket(t._id, { status: 'in_progress' })}>
                      In Progress
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => updateTicket(t._id, { status: 'resolved' })}
                    >
                      Resolve
                    </Button>
                  </div>
                ),
              },
            ]}
            data={tickets}
            empty="No tickets"
          />
        )}
      </Card>
    </div>
  );
}