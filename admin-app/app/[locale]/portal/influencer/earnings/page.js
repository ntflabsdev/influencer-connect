"use client";

import { useState } from 'react';

const EARNINGS = [
  { id: 1, campaign: 'Earbuds Launch Campaign', brand: 'boAt Lifestyle', amount: 35000, status: 'paid', date: '2026-06-02', type: 'campaign' },
  { id: 2, campaign: 'Monsoon Skincare Collection', brand: 'Mamaearth', amount: 23000, status: 'paid', date: '2026-06-05', type: 'campaign' },
  { id: 3, campaign: 'Navratri Beauty Collection', brand: 'Nykaa', amount: 29000, status: 'pending', date: '2026-06-08', type: 'campaign' },
  { id: 4, campaign: 'Biryani Festival Review', brand: 'Swiggy', amount: 12000, status: 'paid', date: '2026-05-28', type: 'campaign' },
  { id: 5, campaign: 'Goa Monsoon Promo', brand: 'MakeMyTrip', amount: 25000, status: 'processing', date: '2026-06-10', type: 'campaign' },
  { id: 6, campaign: 'Fitness App Promotion', brand: 'Cult.fit', amount: 15000, status: 'pending', date: '2026-06-12', type: 'campaign' },
  { id: 7, campaign: 'Referral Bonus', brand: 'Platform', amount: 1500, status: 'paid', date: '2026-05-20', type: 'bonus' },
];

const monthlyEarnings = [
  { month: 'Jan', amount: 15000 },
  { month: 'Feb', amount: 20000 },
  { month: 'Mar', amount: 13500 },
  { month: 'Apr', amount: 27000 },
  { month: 'May', amount: 24000 },
  { month: 'Jun', amount: 17500 },
];
const maxE = Math.max(...monthlyEarnings.map(d => d.amount));

const STATUS_MAP = {
  paid: { bg: '#dcfce7', color: '#166534', label: 'Paid' },
  pending: { bg: '#fef9c3', color: '#854d0e', label: 'Pending' },
  processing: { bg: '#dbeafe', color: '#1e40af', label: 'Processing' },
};

export default function InfluencerEarningsPage() {
  const [filter, setFilter] = useState('all');

  const filtered = EARNINGS.filter(e => filter === 'all' || e.status === filter);
  const totalPaid = EARNINGS.filter(e => e.status === 'paid').reduce((s, e) => s + e.amount, 0);
  const totalPending = EARNINGS.filter(e => e.status === 'pending').reduce((s, e) => s + e.amount, 0);
  const totalProcessing = EARNINGS.filter(e => e.status === 'processing').reduce((s, e) => s + e.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>💰 Earnings</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>Track your income from all campaigns and collaborations</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total Earned', value: `₹${totalPaid.toLocaleString()}`, icon: '💰', bg: '#dcfce7', color: '#059669' },
          { label: 'Pending', value: `₹${totalPending.toLocaleString()}`, icon: '⏳', bg: '#fef9c3', color: '#d97706' },
          { label: 'Processing', value: `₹${totalProcessing.toLocaleString()}`, icon: '🔄', bg: '#dbeafe', color: '#1e40af' },
          { label: 'This Month', value: '₹17,500', icon: '📅', bg: '#ede9fe', color: '#7c3aed' },
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

      {/* Chart */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Monthly Earnings Trend</h3>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Your income over the last 6 months</p>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#059669' }}>₹1,17,000 total</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 160 }}>
          {monthlyEarnings.map(d => (
            <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#8b5cf6' }}>₹{(d.amount / 1000).toFixed(1)}k</span>
              <div style={{ width: '100%', background: 'linear-gradient(180deg, #a78bfa, #7c3aed)', borderRadius: '6px 6px 0 0', height: `${(d.amount / maxE) * 120}px`, minHeight: 6 }} />
              <span style={{ fontSize: 11, color: '#9ca3af' }}>{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', flex: 1 }}>Transaction History</h3>
          {['all', 'paid', 'pending', 'processing'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '6px 12px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: filter === f ? '#8b5cf6' : '#f3f4f6', color: filter === f ? '#fff' : '#6b7280' }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Brand</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => {
                const s = STATUS_MAP[e.status];
                return (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 600, color: '#111827' }}>{e.campaign}</td>
                    <td style={{ color: '#374151' }}>{e.brand}</td>
                    <td>
                      <span style={{ background: e.type === 'bonus' ? '#fef3c7' : '#e0f2fe', color: e.type === 'bonus' ? '#d97706' : '#0ea5e9', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600 }}>
                        {e.type.charAt(0).toUpperCase() + e.type.slice(1)}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#059669', fontSize: 14 }}>+₹{e.amount.toLocaleString()}</td>
                    <td style={{ color: '#6b7280', fontSize: 12 }}>{e.date}</td>
                    <td>
                      <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>{s.label}</span>
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
