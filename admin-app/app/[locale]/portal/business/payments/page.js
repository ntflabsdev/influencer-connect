"use client";

import { useState } from 'react';

const TRANSACTIONS = [
  { id: 'TXN-001', campaign: 'Earbuds Launch Campaign', influencer: 'Rahul Verma', amount: 35000, status: 'completed', date: '2026-06-02', method: 'Razorpay', type: 'payment' },
  { id: 'TXN-002', campaign: 'Monsoon Fashion Campaign', influencer: 'Priya Sharma', amount: 21000, status: 'completed', date: '2026-06-05', method: 'Razorpay', type: 'payment' },
  { id: 'TXN-003', campaign: 'Navratri Beauty Collection', influencer: 'Neha Gupta', amount: 29000, status: 'pending', date: '2026-06-08', method: 'Razorpay', type: 'payment' },
  { id: 'TXN-004', campaign: 'Biryani Festival Review', influencer: 'Vikram Patel', amount: 12000, status: 'completed', date: '2026-05-28', method: 'UPI', type: 'payment' },
  { id: 'TXN-005', campaign: 'Goa Monsoon Promo', influencer: 'Kavya Nair', amount: 25000, status: 'processing', date: '2026-06-10', method: 'Razorpay', type: 'payment' },
  { id: 'TXN-006', campaign: 'Fitness App Promotion', influencer: 'Anjali Singh', amount: 15000, status: 'pending', date: '2026-06-12', method: 'Razorpay', type: 'payment' },
  { id: 'TXN-007', campaign: 'Earbuds Launch Campaign', influencer: 'Rahul Verma', amount: 4200, status: 'completed', date: '2026-05-20', method: 'Razorpay', type: 'refund' },
];

const STATUS_MAP = {
  completed: { bg: '#dcfce7', color: '#166534', label: 'Completed' },
  pending: { bg: '#fef9c3', color: '#854d0e', label: 'Pending' },
  processing: { bg: '#dbeafe', color: '#1e40af', label: 'Processing' },
  failed: { bg: '#fee2e2', color: '#991b1b', label: 'Failed' },
};

export default function BusinessPaymentsPage() {
  const [filter, setFilter]     = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = TRANSACTIONS.filter(t => filter === 'all' || t.status === filter);  const totalSpent = TRANSACTIONS.filter(t => t.type === 'payment' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const pending = TRANSACTIONS.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0);
  const refunds = TRANSACTIONS.filter(t => t.type === 'refund').reduce((s, t) => s + t.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>💳 Payments</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>Track all your campaign payments and transactions</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, icon: '💰', bg: '#dcfce7', color: '#059669' },
          { label: 'Pending', value: `$${pending.toLocaleString()}`, icon: '⏳', bg: '#fef9c3', color: '#d97706' },
          { label: 'Refunds', value: `$${refunds.toLocaleString()}`, icon: '↩️', bg: '#fee2e2', color: '#dc2626' },
          { label: 'Transactions', value: TRANSACTIONS.length, icon: '📊', bg: '#e0f2fe', color: '#0ea5e9' },
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

      {/* Filters */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '14px 18px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['all', 'completed', 'pending', 'processing'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '7px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: filter === f ? '#0ea5e9' : '#f3f4f6', color: filter === f ? '#fff' : '#6b7280' }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Campaign</th>
                <th>Influencer</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
                <th>Type</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => {
                const s = STATUS_MAP[t.status];
                return (
                  <tr key={t.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#6b7280' }}>{t.id}</td>
                    <td style={{ fontWeight: 600, color: '#111827' }}>{t.campaign}</td>
                    <td style={{ color: '#374151' }}>{t.influencer}</td>
                    <td style={{ fontWeight: 700, color: t.type === 'refund' ? '#dc2626' : '#059669' }}>
                      {t.type === 'refund' ? '-' : '+'}₹{t.amount.toLocaleString()}
                    </td>
                    <td>
                      <span style={{ background: '#f3f4f6', color: '#374151', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 500 }}>{t.method}</span>
                    </td>
                    <td style={{ color: '#6b7280', fontSize: 12 }}>{t.date}</td>
                    <td>
                      <span style={{ background: t.type === 'refund' ? '#fee2e2' : '#e0f2fe', color: t.type === 'refund' ? '#dc2626' : '#0ea5e9', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600 }}>
                        {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                      </span>
                    </td>
                    <td>
                      <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>{s.label}</span>
                    </td>
                    <td>
                      <button onClick={() => setSelected(t)}
                        style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 420, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>Transaction Details</h2>
              <button onClick={() => setSelected(null)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f3f4f6', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { label: 'Transaction ID', value: selected.id },
                { label: 'Campaign', value: selected.campaign },
                { label: 'Influencer', value: selected.influencer },
                { label: 'Amount', value: `${selected.type === 'refund' ? '-' : '+'}₹${selected.amount.toLocaleString()}` },
                { label: 'Type', value: selected.type.charAt(0).toUpperCase() + selected.type.slice(1) },
                { label: 'Method', value: selected.method },
                { label: 'Date', value: selected.date },
                { label: 'Status', value: STATUS_MAP[selected.status].label },
              ].map((item, i, arr) => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <span style={{ fontSize: 13, color: '#9ca3af' }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{item.value}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setSelected(null)} style={{ width: '100%', marginTop: 20, padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
