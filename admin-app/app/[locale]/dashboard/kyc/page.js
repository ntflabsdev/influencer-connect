"use client";

import { useState } from 'react';
import { useToast } from '../../../../components/ToastProvider.js';

const DUMMY_KYC = [
  { _id: 'k1', user: { name: 'Priya Sharma', email: 'priya@creator.in', role: 'influencer' }, type: 'aadhaar', status: 'pending', submittedAt: '2026-06-10T09:00:00Z', country: 'India', docNumber: 'XXXX-XXXX-4521', url: '#' },
  { _id: 'k2', user: { name: 'Mamaearth', email: 'legal@mamaearth.in', role: 'business' }, type: 'business_registration', status: 'pending', submittedAt: '2026-06-09T14:30:00Z', country: 'India', docNumber: 'GST****8832', url: '#' },
  { _id: 'k3', user: { name: 'Rahul Verma', email: 'rahul@techcreator.in', role: 'influencer' }, type: 'pan_card', status: 'pending', submittedAt: '2026-06-11T08:15:00Z', country: 'India', docNumber: 'PAN****2291', url: '#' },
  { _id: 'k4', user: { name: 'Nykaa', email: 'kyc@nykaa.com', role: 'business' }, type: 'business_registration', status: 'approved', submittedAt: '2026-06-05T11:00:00Z', country: 'India', docNumber: 'GST****5543', url: '#' },
  { _id: 'k5', user: { name: 'Anjali Singh', email: 'anjali@fitnessguru.in', role: 'influencer' }, type: 'aadhaar', status: 'rejected', submittedAt: '2026-06-03T16:45:00Z', country: 'India', docNumber: 'XXXX-XXXX-7712', url: '#', rejectionReason: 'Document image is blurry. Please resubmit a clear photo.' },
  { _id: 'k6', user: { name: 'Vikram Patel', email: 'vikram@foodlover.in', role: 'influencer' }, type: 'pan_card', status: 'pending', submittedAt: '2026-06-11T10:30:00Z', country: 'India', docNumber: 'PAN****3398', url: '#' },
  { _id: 'k7', user: { name: 'boAt Lifestyle', email: 'compliance@boat-lifestyle.com', role: 'business' }, type: 'business_registration', status: 'pending', submittedAt: '2026-06-10T13:00:00Z', country: 'India', docNumber: 'GST****9921', url: '#' },
];

const STATUS_MAP = {
  pending: { bg: '#fef9c3', color: '#854d0e', label: '⏳ Pending' },
  approved: { bg: '#dcfce7', color: '#166534', label: '✓ Approved' },
  rejected: { bg: '#fee2e2', color: '#991b1b', label: '✕ Rejected' },
};

const DOC_ICONS = { aadhaar: '🪪', pan_card: '💳', passport: '🛂', business_registration: '🏢' };

export default function KycPage() {
  const [docs, setDocs] = useState(DUMMY_KYC);
  const [filter, setFilter] = useState('pending');
  const [reasons, setReasons] = useState({});
  const [selected, setSelected] = useState(null);
  const { push } = useToast();

  const filtered = docs.filter(d => filter === 'all' || d.status === filter);
  const counts = {
    all: docs.length,
    pending: docs.filter(d => d.status === 'pending').length,
    approved: docs.filter(d => d.status === 'approved').length,
    rejected: docs.filter(d => d.status === 'rejected').length,
  };

  const review = (id, status) => {
    const reason = status === 'rejected' ? reasons[id] || '' : '';
    setDocs(prev => prev.map(d => d._id === id ? { ...d, status, rejectionReason: reason } : d));
    push(`KYC ${status === 'approved' ? 'approved' : 'rejected'} successfully`, status === 'approved' ? 'success' : 'error');
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>🪪 KYC Verification</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>Review and approve identity verification documents</p>
        </div>
        <button onClick={() => push('Refreshed', 'success')}
          style={{ padding: '8px 16px', borderRadius: 9, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          🔄 Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total', value: counts.all, icon: '🪪', bg: '#e0f2fe', color: '#0ea5e9' },
          { label: 'Pending', value: counts.pending, icon: '⏳', bg: '#fef9c3', color: '#d97706' },
          { label: 'Approved', value: counts.approved, icon: '✅', bg: '#dcfce7', color: '#059669' },
          { label: 'Rejected', value: counts.rejected, icon: '❌', bg: '#fee2e2', color: '#dc2626' },
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
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '7px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: filter === f ? '#4f46e5' : '#f3f4f6', color: filter === f ? '#fff' : '#6b7280' }}>
            {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f] ?? counts.all})
          </button>
        ))}
      </div>

      {/* KYC Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {filtered.map(doc => {
          const s = STATUS_MAP[doc.status];
          return (
            <div key={doc._id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                    {DOC_ICONS[doc.type] || '📄'}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{doc.user.name}</p>
                    <p style={{ fontSize: 11, color: '#9ca3af' }}>{doc.user.email}</p>
                  </div>
                </div>
                <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>{s.label}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                {[
                  { label: 'Role', value: doc.user.role },
                  { label: 'Doc Type', value: doc.type.replace(/_/g, ' ') },
                  { label: 'Country', value: doc.country },
                  { label: 'Submitted', value: formatDate(doc.submittedAt) },
                ].map(item => (
                  <div key={item.label} style={{ background: '#f9fafb', borderRadius: 8, padding: '8px 10px' }}>
                    <p style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>{item.label}</p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', textTransform: 'capitalize' }}>{item.value}</p>
                  </div>
                ))}
              </div>

              {doc.status === 'rejected' && doc.rejectionReason && (
                <div style={{ background: '#fee2e2', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
                  <p style={{ fontSize: 11, color: '#991b1b' }}>Rejection: {doc.rejectionReason}</p>
                </div>
              )}

              {doc.status === 'pending' && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Rejection Reason (if rejecting)</label>
                  <input value={reasons[doc._id] || ''} onChange={e => setReasons(p => ({ ...p, [doc._id]: e.target.value }))}
                    placeholder="Enter reason for rejection..."
                    style={{ width: '100%', padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <a href={doc.url} target="_blank" rel="noreferrer"
                  style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'center', textDecoration: 'none' }}>
                  📄 View Doc
                </a>
                {doc.status === 'pending' && (
                  <>
                    <button onClick={() => review(doc._id, 'approved')}
                      style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: '#059669', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      ✓ Approve
                    </button>
                    <button onClick={() => review(doc._id, 'rejected')}
                      style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      ✕ Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
