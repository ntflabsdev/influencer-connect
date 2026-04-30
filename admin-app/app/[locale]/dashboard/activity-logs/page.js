"use client";

import { useState } from 'react';
import { useToast } from '../../../../components/ToastProvider.js';

const DUMMY_LOGS = [
  { _id: 'l1', action: 'user_approved', targetType: 'influencer', targetName: 'Priya Sharma', adminName: 'Super Admin', adminEmail: 'admin@influencerconnect.in', description: 'Approved influencer account for Priya Sharma', timestamp: '2026-06-11T10:30:00Z', ipAddress: '192.168.1.10', requestMethod: 'PATCH', requestPath: '/api/admin/users/u1' },
  { _id: 'l2', action: 'user_suspended', targetType: 'business', targetName: 'FakeFollowers.in', adminName: 'Admin Arjun', adminEmail: 'arjun@influencerconnect.in', description: 'Suspended business account for policy violation', timestamp: '2026-06-11T09:45:00Z', ipAddress: '192.168.1.11', requestMethod: 'PATCH', requestPath: '/api/admin/users/u2/suspend' },
  { _id: 'l3', action: 'kyc_approved', targetType: 'influencer', targetName: 'Rahul Verma', adminName: 'Super Admin', adminEmail: 'admin@influencerconnect.in', description: 'KYC document approved for Rahul Verma (PAN card)', timestamp: '2026-06-11T09:15:00Z', ipAddress: '192.168.1.10', requestMethod: 'PATCH', requestPath: '/api/kyc/admin/k3' },
  { _id: 'l4', action: 'bulk_user_approved', targetType: 'influencer', targetName: '12 influencers', adminName: 'Admin Sneha', adminEmail: 'sneha@influencerconnect.in', description: 'Bulk approved 12 pending influencer accounts', timestamp: '2026-06-11T08:30:00Z', ipAddress: '192.168.1.12', requestMethod: 'POST', requestPath: '/api/admin/users/bulk/approve' },
  { _id: 'l5', action: 'offer_closed', targetType: 'offer', targetName: 'Spam Campaign 2026', adminName: 'Admin Arjun', adminEmail: 'arjun@influencerconnect.in', description: 'Closed offer for violating platform guidelines', timestamp: '2026-06-10T17:20:00Z', ipAddress: '192.168.1.11', requestMethod: 'PATCH', requestPath: '/api/admin/offers/o5/status' },
  { _id: 'l6', action: 'content_rejected', targetType: 'content', targetName: 'Submission #SUB-2891', adminName: 'Admin Sneha', adminEmail: 'sneha@influencerconnect.in', description: 'Content submission rejected - misleading health claims detected by AI', timestamp: '2026-06-10T16:00:00Z', ipAddress: '192.168.1.12', requestMethod: 'PATCH', requestPath: '/api/admin/submissions/s1' },
  { _id: 'l7', action: 'admin_created', targetType: 'admin', targetName: 'New Moderator', adminName: 'Super Admin', adminEmail: 'admin@influencerconnect.in', description: 'Created new moderator account for content team', timestamp: '2026-06-10T14:30:00Z', ipAddress: '192.168.1.10', requestMethod: 'POST', requestPath: '/api/admin/admins' },
  { _id: 'l8', action: 'data_exported', targetType: 'system', targetName: 'Influencer Report', adminName: 'Admin Arjun', adminEmail: 'arjun@influencerconnect.in', description: 'Exported influencer data report (CSV, 15,284 records)', timestamp: '2026-06-10T13:00:00Z', ipAddress: '192.168.1.11', requestMethod: 'GET', requestPath: '/api/admin/export/users' },
  { _id: 'l9', action: 'user_rejected', targetType: 'business', targetName: 'FakeBrand India', adminName: 'Admin Sneha', adminEmail: 'sneha@influencerconnect.in', description: 'Rejected business registration - failed KYC verification', timestamp: '2026-06-10T11:45:00Z', ipAddress: '192.168.1.12', requestMethod: 'PATCH', requestPath: '/api/admin/users/u9' },
  { _id: 'l10', action: 'settings_updated', targetType: 'system', targetName: 'Platform Settings', adminName: 'Super Admin', adminEmail: 'admin@influencerconnect.in', description: 'Updated platform settings - enabled AI content moderation', timestamp: '2026-06-10T10:00:00Z', ipAddress: '192.168.1.10', requestMethod: 'PATCH', requestPath: '/api/admin/settings' },
  { _id: 'l11', action: 'dispute_resolved', targetType: 'dispute', targetName: 'Dispute #D-1042', adminName: 'Admin Arjun', adminEmail: 'arjun@influencerconnect.in', description: 'Resolved payment dispute between Mamaearth and Priya Sharma', timestamp: '2026-06-09T16:30:00Z', ipAddress: '192.168.1.11', requestMethod: 'PATCH', requestPath: '/api/admin/disputes/d4' },
  { _id: 'l12', action: 'report_generated', targetType: 'system', targetName: 'Monthly Analytics', adminName: 'Super Admin', adminEmail: 'admin@influencerconnect.in', description: 'Generated monthly analytics report for May 2026', timestamp: '2026-06-09T09:00:00Z', ipAddress: '192.168.1.10', requestMethod: 'GET', requestPath: '/api/admin/reports/analytics' },
];

const ACTION_COLORS = {
  user_approved: { bg: '#dcfce7', color: '#166534' },
  user_rejected: { bg: '#fee2e2', color: '#991b1b' },
  user_suspended: { bg: '#fee2e2', color: '#991b1b' },
  bulk_user_approved: { bg: '#dbeafe', color: '#1e40af' },
  kyc_approved: { bg: '#dcfce7', color: '#166534' },
  offer_closed: { bg: '#fef9c3', color: '#854d0e' },
  content_rejected: { bg: '#fee2e2', color: '#991b1b' },
  admin_created: { bg: '#ede9fe', color: '#5b21b6' },
  data_exported: { bg: '#e0f2fe', color: '#0369a1' },
  settings_updated: { bg: '#fef3c7', color: '#92400e' },
  dispute_resolved: { bg: '#dcfce7', color: '#166534' },
  report_generated: { bg: '#e0f2fe', color: '#0369a1' },
};

const TARGET_ICONS = { influencer: '👤', business: '🏢', admin: '👑', offer: '📦', content: '📝', dispute: '⚖️', system: '⚙️' };

export default function ActivityLogsPage() {
  const [logs] = useState(DUMMY_LOGS);
  const [actionFilter, setActionFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const { push } = useToast();

  const filtered = logs.filter(l => {
    if (actionFilter && !l.action.includes(actionFilter)) return false;
    if (typeFilter && l.targetType !== typeFilter) return false;
    if (search && !l.description.toLowerCase().includes(search.toLowerCase()) && !l.adminName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const formatDate = (d) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>📋 Activity Logs</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>Complete audit trail of all admin actions on the platform</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => push('Refreshed', 'success')}
            style={{ padding: '8px 16px', borderRadius: 9, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            🔄 Refresh
          </button>
          <button onClick={() => push('Exported to CSV', 'success')}
            style={{ padding: '8px 16px', borderRadius: 9, border: 'none', background: '#4f46e5', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total Actions', value: logs.length, icon: '📋', bg: '#e0f2fe', color: '#0ea5e9' },
          { label: 'Today', value: logs.filter(l => new Date(l.timestamp).toDateString() === new Date('2026-06-11').toDateString()).length, icon: '📅', bg: '#ede9fe', color: '#7c3aed' },
          { label: 'Approvals', value: logs.filter(l => l.action.includes('approved')).length, icon: '✅', bg: '#dcfce7', color: '#059669' },
          { label: 'Suspensions', value: logs.filter(l => l.action.includes('suspended') || l.action.includes('rejected')).length, icon: '🚫', bg: '#fee2e2', color: '#dc2626' },
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

      {/* Filters */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '16px 20px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by description or admin..."
            style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff' }}>
          <option value="">All Actions</option>
          <option value="approved">Approvals</option>
          <option value="rejected">Rejections</option>
          <option value="suspended">Suspensions</option>
          <option value="bulk">Bulk Actions</option>
          <option value="exported">Exports</option>
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff' }}>
          <option value="">All Types</option>
          <option value="influencer">Influencer</option>
          <option value="business">Business</option>
          <option value="admin">Admin</option>
          <option value="offer">Offer</option>
          <option value="content">Content</option>
          <option value="system">System</option>
        </select>
        <button onClick={() => { setSearch(''); setActionFilter(''); setTypeFilter(''); }}
          style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          Clear
        </button>
      </div>

      {/* Logs */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6' }}>
          <p style={{ fontSize: 13, color: '#6b7280' }}>Showing <strong style={{ color: '#111827' }}>{filtered.length}</strong> of {logs.length} logs</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filtered.map((log, i) => {
            const ac = ACTION_COLORS[log.action] || { bg: '#f3f4f6', color: '#374151' };
            return (
              <div key={log._id} style={{ padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid #f9fafb' : 'none', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: ac.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                  {TARGET_ICONS[log.targetType] || '📋'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ background: ac.bg, color: ac.color, borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    <span style={{ background: '#f3f4f6', color: '#374151', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 600 }}>
                      {log.targetType}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: '#111827', fontWeight: 500, marginBottom: 3 }}>{log.description}</p>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>👤 {log.adminName}</span>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>🎯 {log.targetName}</span>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>🌐 {log.ipAddress}</span>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{log.requestMethod} {log.requestPath}</span>
                  </div>
                </div>
                <span style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>{formatDate(log.timestamp)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
