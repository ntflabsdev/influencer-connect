"use client";

import { useState } from 'react';
import { useToast } from '../../../../components/ToastProvider.js';

const DUMMY_NOTIFS = [
  { _id: 'n1', title: 'New Business Registration', message: 'Mamaearth has registered and is awaiting approval. Review their KYC documents.', type: 'user_pending_approval', priority: 'high', read: false, createdAt: '2026-06-11T10:30:00Z' },
  { _id: 'n2', title: 'KYC Document Submitted', message: 'Rahul Verma submitted a PAN card for KYC verification. Pending review.', type: 'kyc_pending_review', priority: 'normal', read: false, createdAt: '2026-06-11T09:45:00Z' },
  { _id: 'n3', title: 'Urgent: Account Suspension Appeal', message: 'Anjali Singh has appealed her account suspension. Review required within 24 hours.', type: 'dispute_created', priority: 'urgent', read: false, createdAt: '2026-06-11T08:00:00Z' },
  { _id: 'n4', title: 'Content Flagged by AI', message: '3 new content submissions have been flagged by AI moderation with high risk scores. Review required.', type: 'content_pending_moderation', priority: 'high', read: false, createdAt: '2026-06-11T07:30:00Z' },
  { _id: 'n5', title: 'Bulk Approval Complete', message: 'Bulk approval of 12 influencer accounts completed successfully by Admin Arjun.', type: 'bulk_action_complete', priority: 'normal', read: true, createdAt: '2026-06-10T16:00:00Z' },
  { _id: 'n6', title: 'New Support Ticket', message: 'boAt Lifestyle reported a duplicate charge on their subscription. Ticket #T-007 assigned.', type: 'ticket_assigned', priority: 'high', read: false, createdAt: '2026-06-10T14:30:00Z' },
  { _id: 'n7', title: 'Monthly Report Ready', message: 'The May 2026 platform analytics report has been generated and is ready for download.', type: 'report_ready', priority: 'low', read: true, createdAt: '2026-06-10T09:00:00Z' },
  { _id: 'n8', title: 'New Dispute Filed', message: 'MakeMyTrip filed a dispute against an influencer for fake engagement metrics. Dispute #D-005.', type: 'dispute_created', priority: 'urgent', read: false, createdAt: '2026-06-11T08:00:00Z' },
  { _id: 'n9', title: 'Influencer Pending Approval', message: '8 new influencer registrations are pending approval. Oldest is 3 days old.', type: 'user_pending_approval', priority: 'normal', read: true, createdAt: '2026-06-09T11:00:00Z' },
  { _id: 'n10', title: 'Payment Hold Alert', message: 'A payment of ₹29,000 for campaign "Navratri Beauty Collection" has been on hold for 7 days.', type: 'ticket_assigned', priority: 'high', read: false, createdAt: '2026-06-09T08:30:00Z' },
];

const TYPE_ICONS = {
  user_pending_approval: '👤',
  kyc_pending_review: '🪪',
  content_pending_moderation: '📝',
  dispute_created: '⚖️',
  ticket_assigned: '🎫',
  bulk_action_complete: '✅',
  report_ready: '📊',
};

const PRIORITY_MAP = {
  urgent: { bg: '#fee2e2', color: '#dc2626', label: 'Urgent' },
  high: { bg: '#fef3c7', color: '#d97706', label: 'High' },
  normal: { bg: '#dbeafe', color: '#1e40af', label: 'Normal' },
  low: { bg: '#f3f4f6', color: '#6b7280', label: 'Low' },
};

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(DUMMY_NOTIFS);
  const [filter, setFilter] = useState('all');
  const { push } = useToast();

  const unread = notifs.filter(n => !n.read).length;

  const filtered = notifs.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const markRead = (id) => {
    setNotifs(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    push('All notifications marked as read', 'success');
  };

  const deleteNotif = (id) => {
    setNotifs(prev => prev.filter(n => n._id !== id));
    push('Notification deleted', 'success');
  };

  const formatTime = (d) => {
    const diff = new Date('2026-06-11T12:00:00Z') - new Date(d);
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    return `${days}d ago`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>🔔 Notifications</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>
            {unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {unread > 0 && (
            <button onClick={markAllRead}
              style={{ padding: '8px 16px', borderRadius: 9, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              ✓ Mark All Read
            </button>
          )}
          <button onClick={() => push('Refreshed', 'success')}
            style={{ padding: '8px 16px', borderRadius: 9, border: 'none', background: '#4f46e5', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total', value: notifs.length, icon: '🔔', bg: '#e0f2fe', color: '#0ea5e9' },
          { label: 'Unread', value: unread, icon: '🔵', bg: '#dbeafe', color: '#1e40af' },
          { label: 'Urgent', value: notifs.filter(n => n.priority === 'urgent').length, icon: '🔴', bg: '#fee2e2', color: '#dc2626' },
          { label: 'High Priority', value: notifs.filter(n => n.priority === 'high').length, icon: '🟠', bg: '#fef3c7', color: '#d97706' },
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
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '14px 18px', display: 'flex', gap: 8 }}>
        {['all', 'unread', 'read'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '7px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: filter === f ? '#4f46e5' : '#f3f4f6', color: filter === f ? '#fff' : '#6b7280' }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Notifications */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(n => {
          const p = PRIORITY_MAP[n.priority];
          return (
            <div key={n._id} style={{ background: n.read ? '#fff' : '#f0f4ff', borderRadius: 14, border: n.read ? '1px solid #e5e7eb' : '1px solid #c7d2fe', padding: 18, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: n.read ? '#f3f4f6' : '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                {TYPE_ICONS[n.type] || '🔔'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{n.title}</h3>
                  {!n.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4f46e5', flexShrink: 0 }} />}
                  {n.priority !== 'normal' && (
                    <span style={{ background: p.bg, color: p.color, borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>{p.label}</span>
                  )}
                </div>
                <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5, marginBottom: 6 }}>{n.message}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>{formatTime(n.createdAt)}</span>
                  <span style={{ background: '#f3f4f6', color: '#374151', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 600 }}>
                    {n.type.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {!n.read && (
                  <button onClick={() => markRead(n._id)}
                    style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                    Mark Read
                  </button>
                )}
                <button onClick={() => deleteNotif(n._id)}
                  style={{ padding: '6px 10px', borderRadius: 7, border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                  🗑
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
