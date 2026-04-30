"use client";

import { useState, useEffect, useCallback } from 'react';
import { businessApi } from '../../../../../lib/api.js';

const STATUS_MAP = {
  pending:  { bg: '#fef9c3', color: '#854d0e', label: 'Pending' },
  accepted: { bg: '#dcfce7', color: '#166534', label: 'Accepted' },
  rejected: { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
  approved: { bg: '#dcfce7', color: '#166534', label: 'Approved' },
};

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 99999, background: type === 'success' ? '#059669' : '#dc2626', color: '#fff', borderRadius: 12, padding: '12px 20px', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
      {type === 'success' ? '✅' : '❌'} {msg}
    </div>
  );
}

export default function BusinessApplicationsPage() {
  const [offers, setOffers]         = useState([]);
  const [apps, setApps]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [filter, setFilter]         = useState('all');
  const [search, setSearch]         = useState('');
  const [selectedOffer, setSelectedOffer] = useState('all');
  const [selected, setSelected]     = useState(null);
  const [actioning, setActioning]   = useState(null);
  const [toast, setToast]           = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const offersRes = await businessApi('/offers');
      const offersData = offersRes.offers || offersRes.data || offersRes || [];
      setOffers(offersData);

      // Load applications for all offers
      const allApps = [];
      await Promise.all(
        offersData.map(async (offer) => {
          try {
            const res = await businessApi(`/offers/${offer._id}/applications`);
            const offerApps = (res.applications || res.data || res || []).map(a => ({ ...a, offerTitle: offer.title, offerId: offer._id }));
            allApps.push(...offerApps);
          } catch { /* skip failed */ }
        })
      );
      setApps(allApps);
    } catch (err) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleStatus = async (appId, status) => {
    setActioning(appId);
    try {
      await businessApi(`/applications/${appId}/status`, {
        method: 'PATCH',
        body: { status },
      });
      setApps(prev => prev.map(a => a._id === appId ? { ...a, status } : a));
      if (selected?._id === appId) setSelected(prev => ({ ...prev, status }));
      setToast({ msg: `Application ${status}!`, type: 'success' });
    } catch (err) {
      setToast({ msg: err.message || 'Action failed', type: 'error' });
    } finally {
      setActioning(null);
    }
  };

  const filtered = apps.filter(a => {
    if (filter !== 'all' && a.status !== filter) return false;
    if (selectedOffer !== 'all' && a.offerId !== selectedOffer) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = (a.influencer?.name || '').toLowerCase();
      const handle = (a.influencer?.username || '').toLowerCase();
      if (!name.includes(q) && !handle.includes(q)) return false;
    }
    return true;
  });

  const counts = {
    all:      apps.length,
    pending:  apps.filter(a => a.status === 'pending').length,
    accepted: apps.filter(a => a.status === 'accepted').length,
    rejected: apps.filter(a => a.status === 'rejected').length,
  };

  const dateStr = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

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
        <button onClick={loadData} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#0ea5e9', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Retry</button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>📋 Applications</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>Review and manage influencer applications for your offers</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total',    value: counts.all,      icon: '📋', bg: '#e0f2fe', color: '#0ea5e9' },
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
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by influencer name..."
              style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <select value={selectedOffer} onChange={e => setSelectedOffer(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff' }}>
            <option value="all">All Offers</option>
            {offers.map(o => <option key={o._id} value={o._id}>{o.title}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all', 'pending', 'accepted', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '7px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: filter === f ? '#0ea5e9' : '#f3f4f6', color: filter === f ? '#fff' : '#6b7280' }}>
              {f.charAt(0).toUpperCase() + f.slice(1)} {f !== 'all' ? `(${counts[f]})` : ''}
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
            const name = app.influencer?.name || 'Influencer';
            const avatar = name.charAt(0).toUpperCase();
            return (
              <div key={app._id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                  {avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{name}</p>
                  <p style={{ fontSize: 12, color: '#9ca3af' }}>
                    {app.influencer?.username ? `@${app.influencer.username} · ` : ''}{app.offerTitle} · {dateStr(app.createdAt)}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                  <span style={{ background: st.bg, color: st.color, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>{st.label}</span>
                  <button onClick={() => setSelected(app)}
                    style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                    View
                  </button>
                  {app.status === 'pending' && (
                    <>
                      <button onClick={() => handleStatus(app._id, 'accepted')} disabled={actioning === app._id}
                        style={{ padding: '6px 12px', borderRadius: 7, border: 'none', background: '#059669', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                        Accept
                      </button>
                      <button onClick={() => handleStatus(app._id, 'rejected')} disabled={actioning === app._id}
                        style={{ padding: '6px 12px', borderRadius: 7, border: 'none', background: '#dc2626', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                        Reject
                      </button>
                    </>
                  )}
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

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#f9fafb', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 20, flexShrink: 0 }}>
                {(selected.influencer?.name || 'I').charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{selected.influencer?.name || 'Influencer'}</p>
                {selected.influencer?.username && <p style={{ fontSize: 13, color: '#6b7280' }}>@{selected.influencer.username}</p>}
                <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Applied for: {selected.offerTitle}</p>
              </div>
            </div>

            {selected.pitch && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Pitch</p>
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

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setSelected(null)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Close</button>
              {selected.status === 'pending' && (
                <>
                  <button onClick={() => handleStatus(selected._id, 'rejected')} disabled={actioning === selected._id}
                    style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#dc2626', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Reject
                  </button>
                  <button onClick={() => handleStatus(selected._id, 'accepted')} disabled={actioning === selected._id}
                    style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#059669', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Accept
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
