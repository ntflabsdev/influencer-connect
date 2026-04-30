"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { businessApi } from '../../../../../lib/api.js';

const STATUS_MAP = {
  draft:     { bg: '#f3f4f6', color: '#374151', label: '● Draft' },
  published: { bg: '#dcfce7', color: '#166534', label: '● Active' },
  closed:    { bg: '#fee2e2', color: '#991b1b', label: '● Closed' },
  completed: { bg: '#dbeafe', color: '#1e40af', label: '● Completed' },
  paused:    { bg: '#fef9c3', color: '#854d0e', label: '● Paused' },
};

const CATEGORIES = ['Fashion', 'Technology', 'Health', 'Food', 'Travel', 'Beauty', 'Gaming', 'Lifestyle'];
const PLATFORMS  = ['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Twitch', 'Moj'];

const EMPTY_FORM = { title: '', category: 'Fashion', budget: '', deadline: '', description: '', requirements: '', platforms: [] };

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 99999, background: type === 'success' ? '#059669' : '#dc2626', color: '#fff', borderRadius: 12, padding: '12px 20px', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
      {type === 'success' ? '✅' : '❌'} {msg}
    </div>
  );
}

export default function BusinessOffersPage() {
  const [offers, setOffers]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [filter, setFilter]         = useState('all');
  const [search, setSearch]         = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editOffer, setEditOffer]   = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast]           = useState(null);

  const loadOffers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await businessApi('/offers');
      setOffers(res.offers || res.data || res || []);
    } catch (err) {
      setError(err.message || 'Failed to load offers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOffers(); }, [loadOffers]);

  const openCreate = () => { setForm(EMPTY_FORM); setEditOffer(null); setShowCreate(true); };
  const openEdit   = (offer) => {
    setForm({
      title:        offer.title || '',
      category:     offer.category || 'Fashion',
      budget:       offer.budget || '',
      deadline:     offer.deadline ? offer.deadline.slice(0, 10) : '',
      description:  offer.description || '',
      requirements: offer.requirements || '',
      platforms:    offer.platforms || [],
    });
    setEditOffer(offer);
    setShowCreate(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return setToast({ msg: 'Title is required', type: 'error' });
    setSubmitting(true);
    try {
      const body = {
        title:        form.title.trim(),
        category:     form.category,
        budget:       Number(form.budget) || 0,
        deadline:     form.deadline || undefined,
        description:  form.description.trim(),
        requirements: form.requirements.trim(),
        platforms:    form.platforms,
      };
      if (editOffer) {
        await businessApi(`/offers/${editOffer._id}`, { method: 'PUT', body });
        setToast({ msg: 'Offer updated successfully!', type: 'success' });
      } else {
        await businessApi('/offers', { method: 'POST', body });
        setToast({ msg: 'Offer created successfully!', type: 'success' });
      }
      setShowCreate(false);
      setEditOffer(null);
      loadOffers();
    } catch (err) {
      setToast({ msg: err.message || 'Failed to save offer', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async (offer) => {
    try {
      await businessApi(`/offers/${offer._id}/publish`, { method: 'POST' });
      setToast({ msg: 'Offer published!', type: 'success' });
      loadOffers();
    } catch (err) {
      setToast({ msg: err.message || 'Failed to publish', type: 'error' });
    }
  };

  const handleClose = async (offer) => {
    try {
      await businessApi(`/offers/${offer._id}/close`, { method: 'POST' });
      setToast({ msg: 'Offer closed', type: 'success' });
      loadOffers();
    } catch (err) {
      setToast({ msg: err.message || 'Failed to close offer', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await businessApi(`/offers/${confirmDelete._id}`, { method: 'DELETE' });
      setToast({ msg: 'Offer deleted', type: 'success' });
      setConfirmDelete(null);
      loadOffers();
    } catch (err) {
      setToast({ msg: err.message || 'Failed to delete', type: 'error' });
    }
  };

  const togglePlatform = (p) => setForm(prev => ({
    ...prev,
    platforms: prev.platforms.includes(p) ? prev.platforms.filter(x => x !== p) : [...prev.platforms, p],
  }));

  const filtered = offers.filter(o => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (search && !(o.title || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalBudget = offers.reduce((s, o) => s + (Number(o.budget) || 0), 0);
  const activeCount = offers.filter(o => o.status === 'published').length;
  const totalApps   = offers.reduce((s, o) => s + (o.applicationCount || 0), 0);
  const budgetStr   = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;
  const dateStr     = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{ textAlign: 'center' }}><div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div><p style={{ color: '#6b7280', fontSize: 14 }}>Loading offers...</p></div>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>❌</div>
        <p style={{ color: '#dc2626', fontSize: 14, marginBottom: 12 }}>{error}</p>
        <button onClick={loadOffers} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#0ea5e9', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Retry</button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>📦 My Offers</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>Manage your campaign offers and track applications</p>
        </div>
        <button onClick={openCreate}
          style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(14,165,233,0.3)' }}>
          ➕ Create New Offer
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total Offers',       value: offers.length,          icon: '📦', bg: '#e0f2fe', color: '#0ea5e9' },
          { label: 'Active',             value: activeCount,            icon: '🚀', bg: '#dcfce7', color: '#059669' },
          { label: 'Total Applications', value: totalApps,              icon: '📋', bg: '#fef3c7', color: '#d97706' },
          { label: 'Total Budget',       value: budgetStr(totalBudget), icon: '💰', bg: '#ede9fe', color: '#7c3aed' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{s.icon}</div>
              <div>
                <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{s.label}</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search offers..."
            style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all', 'draft', 'published', 'closed', 'completed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '7px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: filter === f ? '#0ea5e9' : '#f3f4f6', color: filter === f ? '#fff' : '#6b7280' }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Offers Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 16 }}>No offers yet</p>
          <button onClick={openCreate} style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: '#0ea5e9', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Create Your First Offer</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map(offer => {
            const s = STATUS_MAP[offer.status] || STATUS_MAP.draft;
            return (
              <div key={offer._id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 20, display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{offer.title}</h3>
                    {offer.description && <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{offer.description.slice(0, 80)}{offer.description.length > 80 ? '...' : ''}</p>}
                  </div>
                  <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>{s.label}</span>
                </div>

                {offer.platforms?.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ background: '#f3f4f6', color: '#374151', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 500 }}>{offer.category}</span>
                    {offer.platforms.map(p => (
                      <span key={p} style={{ background: '#f3f4f6', color: '#374151', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 500 }}>{p}</span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <div style={{ background: '#f9fafb', borderRadius: 8, padding: '8px 10px' }}>
                    <p style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>Budget</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>{budgetStr(offer.budget)}</p>
                  </div>
                  <div style={{ background: '#f9fafb', borderRadius: 8, padding: '8px 10px' }}>
                    <p style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>Applications</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{offer.applicationCount || 0}</p>
                  </div>
                  <div style={{ background: '#f9fafb', borderRadius: 8, padding: '8px 10px' }}>
                    <p style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>Deadline</p>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#111827' }}>{dateStr(offer.deadline)}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, flexWrap: 'wrap' }}>
                  <Link href={`/portal/business/applications`}
                    style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid #0ea5e9', color: '#0ea5e9', fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>
                    View Apps ({offer.applicationCount || 0})
                  </Link>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {offer.status === 'draft' && (
                      <button onClick={() => handlePublish(offer)}
                        style={{ padding: '6px 12px', borderRadius: 7, border: 'none', background: '#059669', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                        Publish
                      </button>
                    )}
                    {offer.status === 'published' && (
                      <button onClick={() => handleClose(offer)}
                        style={{ padding: '6px 12px', borderRadius: 7, border: 'none', background: '#f59e0b', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                        Close
                      </button>
                    )}
                    <button onClick={() => openEdit(offer)}
                      style={{ padding: '6px 12px', borderRadius: 7, border: 'none', background: '#0ea5e9', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                      Edit
                    </button>
                    <button onClick={() => setConfirmDelete(offer)}
                      style={{ padding: '6px 12px', borderRadius: 7, border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{editOffer ? '✏️ Edit Offer' : '📦 Create New Offer'}</h2>
                <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>Fill in the details for your campaign offer</p>
              </div>
              <button onClick={() => { setShowCreate(false); setEditOffer(null); }}
                style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f3f4f6', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Offer Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Summer Fashion Campaign"
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Budget (₹)</label>
                  <input type="number" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))} placeholder="50000"
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Deadline</label>
                <input type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
                  placeholder="Describe your campaign requirements..."
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Requirements</label>
                <textarea value={form.requirements} onChange={e => setForm(p => ({ ...p, requirements: e.target.value }))} rows={2}
                  placeholder="e.g. 50K+ followers, Fashion niche..."
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Platforms</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {PLATFORMS.map(p => (
                    <button key={p} type="button" onClick={() => togglePlatform(p)}
                      style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${form.platforms.includes(p) ? '#0ea5e9' : '#e5e7eb'}`, background: form.platforms.includes(p) ? '#e0f2fe' : '#fff', color: form.platforms.includes(p) ? '#0ea5e9' : '#6b7280', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button onClick={() => { setShowCreate(false); setEditOffer(null); }} disabled={submitting}
                  style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={submitting || !form.title.trim()}
                  style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: submitting || !form.title.trim() ? '#e5e7eb' : 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: submitting || !form.title.trim() ? '#9ca3af' : '#fff', fontSize: 13, fontWeight: 600, cursor: submitting || !form.title.trim() ? 'not-allowed' : 'pointer' }}>
                  {submitting ? 'Saving...' : editOffer ? 'Update Offer' : 'Create Offer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 380, padding: 28 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Delete Offer?</h3>
              <p style={{ fontSize: 13, color: '#6b7280' }}>"{confirmDelete.title}" will be permanently deleted.</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDelete} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#dc2626', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
