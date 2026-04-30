"use client";

import { useState } from 'react';
import { useToast } from '../../../../components/ToastProvider.js';

const DUMMY_TICKETS = [
  { _id: 't1', subject: 'Cannot login to my account', user: 'Priya Sharma', userRole: 'influencer', category: 'login', status: 'open', priority: 'high', createdAt: '2026-06-11T09:00:00Z', message: 'I have been trying to login for 2 days but keep getting "invalid credentials" error even after resetting my password.', assignedTo: null },
  { _id: 't2', subject: 'Payment not received after 2 weeks', user: 'Rahul Verma', userRole: 'influencer', category: 'payment', status: 'in_progress', priority: 'urgent', createdAt: '2026-06-10T14:30:00Z', message: 'My campaign ended on June 1st and I still have not received my payment of ₹35,000. Please help urgently.', assignedTo: 'Admin Arjun' },
  { _id: 't3', subject: 'KYC verification stuck for 5 days', user: 'Mamaearth', userRole: 'business', category: 'verification', status: 'open', priority: 'medium', createdAt: '2026-06-09T11:15:00Z', message: 'We submitted our KYC documents 5 days ago but the status is still "pending". We need to post offers urgently.', assignedTo: null },
  { _id: 't4', subject: 'Offer not showing in search results', user: 'Nykaa', userRole: 'business', category: 'technical', status: 'resolved', priority: 'low', createdAt: '2026-06-08T16:00:00Z', message: 'Our offer "Navratri Beauty Collection" was approved but does not appear in influencer search results.', assignedTo: 'Admin Sneha' },
  { _id: 't5', subject: 'Account suspended without notice', user: 'Anjali Singh', userRole: 'influencer', category: 'account', status: 'open', priority: 'urgent', createdAt: '2026-06-11T07:45:00Z', message: 'My account was suspended this morning without any email notification. I have active campaigns that are now affected.', assignedTo: null },
  { _id: 't6', subject: 'Unable to upload portfolio images', user: 'Vikram Patel', userRole: 'influencer', category: 'technical', status: 'in_progress', priority: 'medium', createdAt: '2026-06-07T13:20:00Z', message: 'Getting "file too large" error when uploading images even though they are under 5MB.', assignedTo: 'Admin Rohit' },
  { _id: 't7', subject: 'Duplicate charge on subscription', user: 'boAt Lifestyle', userRole: 'business', category: 'payment', status: 'open', priority: 'high', createdAt: '2026-06-10T10:00:00Z', message: 'We were charged twice for our Business Pro subscription this month. Please refund the duplicate charge of ₹4,999.', assignedTo: null },
];

const STATUS_MAP = {
  open: { bg: '#fee2e2', color: '#991b1b', label: '● Open' },
  in_progress: { bg: '#fef9c3', color: '#854d0e', label: '● In Progress' },
  resolved: { bg: '#dcfce7', color: '#166534', label: '● Resolved' },
  closed: { bg: '#f3f4f6', color: '#374151', label: '● Closed' },
};

const PRIORITY_MAP = {
  urgent: { bg: '#fee2e2', color: '#dc2626', label: '🔴 Urgent' },
  high: { bg: '#fef3c7', color: '#d97706', label: '🟠 High' },
  medium: { bg: '#dbeafe', color: '#1e40af', label: '🔵 Medium' },
  low: { bg: '#f3f4f6', color: '#6b7280', label: '⚪ Low' },
};

const CATEGORY_ICONS = { login: '🔐', payment: '💳', verification: '🪪', technical: '🔧', account: '👤' };

export default function TicketsPage() {
  const [tickets, setTickets] = useState(DUMMY_TICKETS);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const { push } = useToast();

  const filtered = tickets.filter(t => filter === 'all' || t.status === filter);
  const counts = {
    all: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  };

  const updateStatus = (id, status) => {
    setTickets(prev => prev.map(t => t._id === id ? { ...t, status } : t));
    if (selected?._id === id) setSelected(prev => ({ ...prev, status }));
    push(`Ticket ${status === 'resolved' ? 'resolved' : 'updated'}`, 'success');
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>🎫 Support Tickets</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>Handle login, verification, payment and technical issues</p>
        </div>
        <button onClick={() => push('Refreshed', 'success')}
          style={{ padding: '8px 16px', borderRadius: 9, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          🔄 Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total', value: counts.all, icon: '🎫', bg: '#e0f2fe', color: '#0ea5e9' },
          { label: 'Open', value: counts.open, icon: '🔴', bg: '#fee2e2', color: '#dc2626' },
          { label: 'In Progress', value: counts.in_progress, icon: '🔵', bg: '#fef9c3', color: '#d97706' },
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
        {['all', 'open', 'in_progress', 'resolved'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '7px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: filter === f ? '#4f46e5' : '#f3f4f6', color: filter === f ? '#fff' : '#6b7280' }}>
            {f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f] ?? counts.all})
          </button>
        ))}
      </div>

      {/* Tickets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(t => {
          const s = STATUS_MAP[t.status];
          const p = PRIORITY_MAP[t.priority];
          return (
            <div key={t._id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {CATEGORY_ICONS[t.category] || '🎫'}
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{t.subject}</h3>
                    <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>{s.label}</span>
                    <span style={{ background: p.bg, color: p.color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>{p.label}</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
                    From: <strong style={{ color: '#374151' }}>{t.user}</strong> ({t.userRole}) · Category: <strong style={{ color: '#374151' }}>{t.category}</strong>
                  </p>
                  <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5, marginBottom: 8 }}>{t.message}</p>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>📅 {formatDate(t.createdAt)}</span>
                    {t.assignedTo && <span style={{ fontSize: 11, color: '#9ca3af' }}>👤 Assigned: <strong style={{ color: '#374151' }}>{t.assignedTo}</strong></span>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => setSelected(t)}
                    style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    View & Reply
                  </button>
                  {t.status === 'open' && (
                    <button onClick={() => updateStatus(t._id, 'in_progress')}
                      style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: '#fef9c3', color: '#854d0e', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      Take Ownership
                    </button>
                  )}
                  {t.status === 'in_progress' && (
                    <button onClick={() => updateStatus(t._id, 'resolved')}
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
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>🎫 Ticket Details</h2>
              <button onClick={() => setSelected(null)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f3f4f6', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: '#f9fafb', borderRadius: 10, padding: 14 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{selected.subject}</p>
                <p style={{ fontSize: 12, color: '#6b7280' }}>{selected.user} · {selected.userRole} · {formatDate(selected.createdAt)}</p>
              </div>
              <div style={{ background: '#f9fafb', borderRadius: 10, padding: 14 }}>
                <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>User Message</p>
                <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{selected.message}</p>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Admin Reply</label>
                <textarea value={reply} onChange={e => setReply(e.target.value)} rows={4} placeholder="Type your response to the user..."
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setSelected(null)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Close</button>
                <button onClick={() => { push('Reply sent', 'success'); setSelected(null); setReply(''); }}
                  style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#4f46e5', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>📨 Send Reply</button>
                {selected.status !== 'resolved' && (
                  <button onClick={() => { updateStatus(selected._id, 'resolved'); setSelected(null); }}
                    style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#059669', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>✓ Resolve</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
