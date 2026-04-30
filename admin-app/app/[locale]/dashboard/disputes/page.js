"use client";

import { useState } from 'react';
import { adminApi } from '../../../../lib/api.js';
import { useToast } from '../../../../components/ToastProvider.js';

const DUMMY_DISPUTES = [
  { _id: 'd1', issueType: 'Payment Not Released', raisedBy: 'Priya Sharma', raisedByRole: 'influencer', offer: 'Monsoon Fashion Campaign', business: 'Mamaearth', status: 'open', priority: 'high', amount: '₹21,000', createdAt: '2026-06-10T10:30:00Z', description: 'Campaign was completed 2 weeks ago but payment has not been released yet.' },
  { _id: 'd2', issueType: 'Content Not Delivered', raisedBy: 'Nykaa', raisedByRole: 'business', offer: 'Navratri Beauty Collection', business: 'Nykaa', status: 'in_review', priority: 'medium', amount: '₹29,000', createdAt: '2026-06-09T14:20:00Z', description: 'Influencer agreed to deliver 3 posts but only 1 was submitted within the deadline.' },
  { _id: 'd3', issueType: 'Quality Dispute', raisedBy: 'Rahul Verma', raisedByRole: 'influencer', offer: 'Earbuds Launch Campaign', business: 'boAt Lifestyle', status: 'open', priority: 'low', amount: '₹35,000', createdAt: '2026-06-08T09:15:00Z', description: 'Business rejected content without valid reason. Content meets all agreed requirements.' },
  { _id: 'd4', issueType: 'Contract Breach', raisedBy: 'Cult.fit', raisedByRole: 'business', offer: 'Fitness App Promotion', business: 'Cult.fit', status: 'resolved', priority: 'high', amount: '₹15,000', createdAt: '2026-06-05T16:45:00Z', description: 'Influencer promoted a competitor fitness app during the exclusivity period.' },
  { _id: 'd5', issueType: 'Fake Metrics', raisedBy: 'MakeMyTrip', raisedByRole: 'business', offer: 'Goa Monsoon Promo', business: 'MakeMyTrip', status: 'open', priority: 'urgent', amount: '₹25,000', createdAt: '2026-06-11T08:00:00Z', description: 'Influencer provided inflated follower and engagement metrics during application.' },
  { _id: 'd6', issueType: 'Late Delivery', raisedBy: 'Vikram Patel', raisedByRole: 'influencer', offer: 'Biryani Festival Review', business: 'Swiggy', status: 'in_review', priority: 'medium', amount: '₹12,000', createdAt: '2026-06-07T11:30:00Z', description: 'Business changed content requirements after agreement, causing delays in delivery.' },
];

const STATUS_MAP = {
  open: { bg: '#fee2e2', color: '#991b1b', label: '● Open' },
  in_review: { bg: '#fef9c3', color: '#854d0e', label: '● In Review' },
  resolved: { bg: '#dcfce7', color: '#166534', label: '● Resolved' },
  closed: { bg: '#f3f4f6', color: '#374151', label: '● Closed' },
};

const PRIORITY_MAP = {
  urgent: { bg: '#fee2e2', color: '#dc2626', label: '🔴 Urgent' },
  high: { bg: '#fef3c7', color: '#d97706', label: '🟠 High' },
  medium: { bg: '#dbeafe', color: '#1e40af', label: '🔵 Medium' },
  low: { bg: '#f3f4f6', color: '#6b7280', label: '⚪ Low' },
};

export default function DisputesPage() {
  const [disputes, setDisputes] = useState(DUMMY_DISPUTES);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [resolution, setResolution] = useState('');
  const { push } = useToast();

  const filtered = disputes.filter(d => filter === 'all' || d.status === filter);
  const counts = {
    all: disputes.length,
    open: disputes.filter(d => d.status === 'open').length,
    in_review: disputes.filter(d => d.status === 'in_review').length,
    resolved: disputes.filter(d => d.status === 'resolved').length,
  };

  const updateStatus = (id, status) => {
    setDisputes(prev => prev.map(d => d._id === id ? { ...d, status } : d));
    if (selected?._id === id) setSelected(prev => ({ ...prev, status }));
    push(`Dispute ${status === 'resolved' ? 'resolved' : 'updated'} successfully`, 'success');
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>⚖️ Disputes</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>Manage and resolve platform disputes between businesses and influencers</p>
        </div>
        <button onClick={() => push('Refreshed', 'success')}
          style={{ padding: '8px 16px', borderRadius: 9, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          🔄 Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total', value: counts.all, icon: '⚖️', bg: '#e0f2fe', color: '#0ea5e9' },
          { label: 'Open', value: counts.open, icon: '🔴', bg: '#fee2e2', color: '#dc2626' },
          { label: 'In Review', value: counts.in_review, icon: '🔵', bg: '#fef9c3', color: '#d97706' },
          { label: 'Resolved', value: counts.resolved, icon: '✅', bg: '#dcfce7', color: '#059669' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{s.icon}</div>
              <div>
                <p style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>{s.label}</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '14px 18px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['all', 'open', 'in_review', 'resolved'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '7px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: filter === f ? '#4f46e5' : '#f3f4f6', color: filter === f ? '#fff' : '#6b7280' }}>
            {f === 'in_review' ? 'In Review' : f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f] ?? counts.all})
          </button>
        ))}
      </div>

      {/* Disputes List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(d => {
          const s = STATUS_MAP[d.status];
          const p = PRIORITY_MAP[d.priority];
          return (
            <div key={d._id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: d.priority === 'urgent' ? '#fee2e2' : d.priority === 'high' ? '#fef3c7' : '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  ⚖️
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{d.issueType}</h3>
                    <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>{s.label}</span>
                    <span style={{ background: p.bg, color: p.color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>{p.label}</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
                    Raised by: <strong style={{ color: '#374151' }}>{d.raisedBy}</strong> ({d.raisedByRole}) · Offer: <strong style={{ color: '#374151' }}>{d.offer}</strong>
                  </p>
                  <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5, marginBottom: 8 }}>{d.description}</p>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>💰 Amount: <strong style={{ color: '#059669' }}>{d.amount}</strong></span>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>📅 Filed: {formatDate(d.createdAt)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => setSelected(d)}
                    style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    View Details
                  </button>
                  {d.status === 'open' && (
                    <button onClick={() => updateStatus(d._id, 'in_review')}
                      style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: '#fef9c3', color: '#854d0e', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      Start Review
                    </button>
                  )}
                  {d.status === 'in_review' && (
                    <button onClick={() => updateStatus(d._id, 'resolved')}
                      style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: '#059669', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      ✓ Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>⚖️ Dispute Details</h2>
              <button onClick={() => setSelected(null)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f3f4f6', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: '#f9fafb', borderRadius: 10, padding: 14 }}>
                <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>Issue Type</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{selected.issueType}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Raised By', value: `${selected.raisedBy} (${selected.raisedByRole})` },
                  { label: 'Offer', value: selected.offer },
                  { label: 'Amount', value: selected.amount },
                  { label: 'Filed On', value: formatDate(selected.createdAt) },
                ].map(item => (
                  <div key={item.label} style={{ background: '#f9fafb', borderRadius: 10, padding: '10px 12px' }}>
                    <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 3 }}>{item.label}</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div style={{ background: '#f9fafb', borderRadius: 10, padding: 14 }}>
                <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>Description</p>
                <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{selected.description}</p>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Resolution Note</label>
                <textarea value={resolution} onChange={e => setResolution(e.target.value)} rows={3} placeholder="Enter resolution decision..."
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setSelected(null)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Close</button>
                {selected.status !== 'resolved' && (
                  <button onClick={() => { updateStatus(selected._id, 'resolved'); setSelected(null); }}
                    style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#059669', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>✓ Mark Resolved</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
