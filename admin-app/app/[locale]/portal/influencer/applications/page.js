"use client";

import { useState, useEffect, useCallback } from 'react';
import { influencerApi } from '../../../../../lib/api.js';

const STATUS_MAP = {
  pending:  { bg: '#fef9c3', color: '#854d0e', label: 'Pending' },
  approved: { bg: '#dcfce7', color: '#166534', label: 'Approved' },
  accepted: { bg: '#dcfce7', color: '#166534', label: 'Accepted' },
  rejected: { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
  completed:{ bg: '#e0f2fe', color: '#0369a1', label: 'Completed' },
};

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 99999, background: type === 'success' ? '#059669' : '#dc2626', color: '#fff', borderRadius: 12, padding: '12px 20px', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
      {type === 'success' ? '✅' : '❌'} {msg}
    </div>
  );
}

export default function InfluencerApplicationsPage() {
  const [apps, setApps]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [filter, setFilter]     = useState('all');
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);
  const [toast, setToast]       = useState(null);

  const loadApps = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await influencerApi('/applications');
      setApps(res.applications || res.data || res || []);
    } catch (err) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadApps(); }, [loadApps]);

  const filtered = apps.filter(a => {
    if (filter !== 'all' && a.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      const title = (a.offer?.title || '').toLowerCase();
      const brand = (a.offer?.business?.businessName || '').toLowerCase();
      if (!title.includes(q) && !brand.includes(q)) return false;
    }
    return true;
  });

  const counts = {
    all:      apps.length,
    pending:  apps.filter(a => a.status === 'pending').length,
    accepted: apps.filter(a => a.status === 'accepted' || a.status === 'approved').length,
    rejected: apps.filter(a => a.status === 'rejected').length,
  };

  const dateStr = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const budgetStr = (o) => o?.budget ? `₹${Number(o.budget).toLocaleString('en-IN')}` : '—';

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{ textAlign: 'center' }}><div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div><p style={{ color: '#6b7280', fontSize: 14 }}>Loading applications...</p></div>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>❌</div>
        <p style={{ color: '#dc2626', fontSize: 14, marginBottom: 12 }}>{error}</p>
        <button onClick={loadApps} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#8b5cf6', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Retry</button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>📋 My Applications</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>Track all your offer applications and their status</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total', value: counts.all,      icon: '📋', bg: '#e0f2fe', color: '#0ea5e9' },
          { label: 'Pending',  value: counts.pending,  icon: '⏳', bg: '#fef9c3', color: '#d97706' },
          { label: 'Accepted', value: counts.accepted, icon: '✅', bg: '#dcfce7', color: '#059669' },
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

      {/* Filters */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by offer or brand..."
            style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all', 'pending', 'accepted', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '7px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: filter === f ? '#8b5cf6' : '#f3f4f6', color: filter === f ? '#fff' : '#6b7280' }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <p style={{ color: '#6b7280', fontSize: 14 }}>No applications found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(app => {
            const st = STATUS_MAP[app.status] || STATUS_MAP.pending;
            return (
              <div key={app._id} onClick={() => setSelected(app)}
                style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                  {(app.offer?.business?.businessName || 'B').charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{app.offer?.title || 'Offer'}</p>
                  <p style={{ fontSize: 12, color: '#9ca3af' }}>{app.offer?.business?.businessName || '—'} · Applied {dateStr(app.createdAt)}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#059669' }}>{budgetStr(app.offer)}</p>
                  <span style={{ background: st.bg, color: st.color, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>{st.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 500, padding: 28, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>Application Details</h2>
              <button onClick={() => setSelected(null)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f3f4f6', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>

            <div style={{ background: '#f9fafb', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{selected.offer?.title || 'Offer'}</p>
              <p style={{ fontSize: 13, color: '#6b7280' }}>{selected.offer?.business?.businessName || '—'}</p>
              <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                <div><p style={{ fontSize: 11, color: '#9ca3af' }}>Budget</p><p style={{ fontSize: 14, fontWeight: 700, color: '#059669' }}>{budgetStr(selected.offer)}</p></div>
                <div><p style={{ fontSize: 11, color: '#9ca3af' }}>Applied On</p><p style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{dateStr(selected.createdAt)}</p></div>
                <div>
                  <p style={{ fontSize: 11, color: '#9ca3af' }}>Status</p>
                  <span style={{ background: (STATUS_MAP[selected.status] || STATUS_MAP.pending).bg, color: (STATUS_MAP[selected.status] || STATUS_MAP.pending).color, fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                    {(STATUS_MAP[selected.status] || STATUS_MAP.pending).label}
                  </span>
                </div>
              </div>
            </div>

            {selected.pitch && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Your Pitch</p>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, background: '#f9fafb', borderRadius: 8, padding: 12 }}>{selected.pitch}</p>
              </div>
            )}

            {selected.portfolioLinks?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Portfolio Links</p>
                {selected.portfolioLinks.map((link, i) => (
                  <a key={i} href={link} target="_blank" rel="noreferrer" style={{ display: 'block', fontSize: 13, color: '#8b5cf6', marginBottom: 4 }}>{link}</a>
                ))}
              </div>
            )}

            <button onClick={() => setSelected(null)} style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
