"use client";

import { useState } from 'react';
import { useToast } from '../../../../components/ToastProvider.js';

const DUMMY_PAYMENTS = [
  { _id: 'p1', offer: 'Tech Product Launch', business: 'TechBrand Co.', influencer: 'Mike Chen', amount: 4200, currency: 'EUR', status: 'succeeded', hold: false, stripeId: 'pi_3Abc123', createdAt: '2026-06-02T10:00:00Z', type: 'campaign' },
  { _id: 'p2', offer: 'Summer Fashion Campaign', business: 'FashionHouse', influencer: 'Sarah Johnson', amount: 2500, currency: 'EUR', status: 'on_hold', hold: true, stripeId: 'pi_3Def456', createdAt: '2026-06-05T14:30:00Z', type: 'campaign' },
  { _id: 'p3', offer: 'Skincare Line Launch', business: 'LuxeBeauty', influencer: 'Luna Park', amount: 3500, currency: 'EUR', status: 'on_hold', hold: true, stripeId: 'pi_3Ghi789', createdAt: '2026-06-08T09:15:00Z', type: 'campaign' },
  { _id: 'p4', offer: 'Food & Beverage Review', business: 'FoodieBox', influencer: 'Carlos Rivera', amount: 1400, currency: 'EUR', status: 'succeeded', hold: false, stripeId: 'pi_3Jkl012', createdAt: '2026-05-28T16:00:00Z', type: 'campaign' },
  { _id: 'p5', offer: 'Destination Promo', business: 'TravelEscape', influencer: 'Priya Sharma', amount: 3000, currency: 'EUR', status: 'on_hold', hold: true, stripeId: 'pi_3Mno345', createdAt: '2026-06-10T11:00:00Z', type: 'campaign' },
  { _id: 'p6', offer: 'Business Pro Subscription', business: 'TechBrand Co.', influencer: '—', amount: 79, currency: 'EUR', status: 'succeeded', hold: false, stripeId: 'pi_3Pqr678', createdAt: '2026-06-01T08:00:00Z', type: 'subscription' },
  { _id: 'p7', offer: 'Creator Plus Subscription', business: '—', influencer: 'Sarah Johnson', amount: 9.99, currency: 'EUR', status: 'succeeded', hold: false, stripeId: 'pi_3Stu901', createdAt: '2026-06-01T09:30:00Z', type: 'subscription' },
  { _id: 'p8', offer: 'Fitness App Promotion', business: 'FitLife App', influencer: 'Emma Davis', amount: 1800, currency: 'EUR', status: 'disputed', hold: true, stripeId: 'pi_3Vwx234', createdAt: '2026-06-12T07:00:00Z', type: 'campaign' },
];

const STATUS_MAP = {
  succeeded: { bg: '#dcfce7', color: '#166534', label: '✓ Succeeded' },
  on_hold: { bg: '#fef9c3', color: '#854d0e', label: '⏸ On Hold' },
  disputed: { bg: '#fee2e2', color: '#991b1b', label: '⚠ Disputed' },
  refunded: { bg: '#f3f4f6', color: '#374151', label: '↩ Refunded' },
};

export default function StripePage() {
  const [payments, setPayments] = useState(DUMMY_PAYMENTS);
  const [filter, setFilter] = useState('all');
  const { push } = useToast();

  const filtered = payments.filter(p => filter === 'all' || p.status === filter || (filter === 'hold' && p.hold));

  const toggleHold = (id, hold) => {
    setPayments(prev => prev.map(p => p._id === id ? { ...p, hold, status: hold ? 'on_hold' : 'succeeded' } : p));
    push(hold ? 'Payment hold enabled' : 'Payment hold released', hold ? 'warning' : 'success');
  };

  const totalRevenue = payments.filter(p => p.status === 'succeeded').reduce((s, p) => s + p.amount, 0);
  const onHold = payments.filter(p => p.hold).reduce((s, p) => s + p.amount, 0);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>💳 Stripe Payments</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>Manage payment holds, releases and transaction history</p>
        </div>
        <button onClick={() => push('Refreshed', 'success')}
          style={{ padding: '8px 16px', borderRadius: 9, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          🔄 Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: '💰', bg: '#dcfce7', color: '#059669' },
          { label: 'On Hold', value: `€${onHold.toLocaleString()}`, icon: '⏸', bg: '#fef9c3', color: '#d97706' },
          { label: 'Transactions', value: payments.length, icon: '📊', bg: '#e0f2fe', color: '#0ea5e9' },
          { label: 'Disputed', value: payments.filter(p => p.status === 'disputed').length, icon: '⚠️', bg: '#fee2e2', color: '#dc2626' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{s.icon}</div>
              <div>
                <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{s.label}</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '14px 18px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['all', 'succeeded', 'on_hold', 'disputed', 'hold'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '7px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: filter === f ? '#4f46e5' : '#f3f4f6', color: filter === f ? '#fff' : '#6b7280' }}>
            {f === 'on_hold' ? 'On Hold' : f === 'hold' ? '⏸ Holds Only' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Stripe ID</th>
                <th>Offer / Type</th>
                <th>Business</th>
                <th>Influencer</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const s = STATUS_MAP[p.status];
                return (
                  <tr key={p._id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>{p.stripeId}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#111827', fontSize: 13 }}>{p.offer}</div>
                      <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>{p.type}</div>
                    </td>
                    <td style={{ color: '#374151', fontSize: 13 }}>{p.business}</td>
                    <td style={{ color: '#374151', fontSize: 13 }}>{p.influencer}</td>
                    <td style={{ fontWeight: 700, color: '#059669', fontSize: 14 }}>€{p.amount.toLocaleString()}</td>
                    <td style={{ color: '#6b7280', fontSize: 12 }}>{formatDate(p.createdAt)}</td>
                    <td>
                      <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>{s.label}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {p.hold ? (
                          <button onClick={() => toggleHold(p._id, false)}
                            style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: '#059669', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                            ▶ Release
                          </button>
                        ) : (
                          <button onClick={() => toggleHold(p._id, true)}
                            style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: '#fef9c3', color: '#854d0e', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                            ⏸ Hold
                          </button>
                        )}
                        {p.status === 'disputed' && (
                          <button onClick={() => push('Refund initiated', 'info')}
                            style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                            ↩ Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
