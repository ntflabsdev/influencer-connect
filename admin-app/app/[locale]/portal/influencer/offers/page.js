"use client";

import { useState, useEffect, useCallback } from 'react';
import { influencerApi } from '../../../../../lib/api.js';

const CATEGORIES = ['All', 'Technology', 'Fashion', 'Health', 'Beauty', 'Travel', 'Food', 'Gaming', 'Lifestyle'];

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 99999, background: type === 'success' ? '#059669' : '#dc2626', color: '#fff', borderRadius: 12, padding: '12px 20px', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: 8 }}>
      {type === 'success' ? '✅' : '❌'} {msg}
    </div>
  );
}

export default function InfluencerOffersPage() {
  const [offers, setOffers]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [category, setCategory]     = useState('All');
  const [search, setSearch]         = useState('');
  const [sortBy, setSortBy]         = useState('newest');
  const [applied, setApplied]       = useState(new Set());
  const [applyModal, setApplyModal] = useState(null);
  const [pitch, setPitch]           = useState('');
  const [portfolioLinks, setPortfolioLinks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]           = useState(null);

  // Load offers + my applications
  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [offersRes, appsRes] = await Promise.all([
        influencerApi('/offers'),
        influencerApi('/applications'),
      ]);
      const offersData = offersRes.offers || offersRes.data || offersRes || [];
      const appsData   = appsRes.applications || appsRes.data || appsRes || [];
      setOffers(offersData);
      // Mark already-applied offers
      const appliedIds = new Set(appsData.map(a => a.offer?._id || a.offerId || a.offer));
      setApplied(appliedIds);
    } catch (err) {
      setError(err.message || 'Failed to load offers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleApply = async () => {
    if (!applyModal || !pitch.trim()) return;
    setSubmitting(true);
    try {
      const links = portfolioLinks.split('\n').map(l => l.trim()).filter(Boolean);
      await influencerApi('/offers/apply', {
        method: 'POST',
        body: {
          offerId: applyModal._id,
          pitch: pitch.trim(),
          ...(links.length && { portfolioLinks: links }),
        },
      });
      setApplied(prev => new Set([...prev, applyModal._id]));
      setApplyModal(null);
      setPitch('');
      setPortfolioLinks('');
      setToast({ msg: 'Application submitted successfully!', type: 'success' });
    } catch (err) {
      setToast({ msg: err.message || 'Failed to submit application', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Filter + sort
  const filtered = offers
    .filter(o => {
      if (category !== 'All' && o.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        const title = (o.title || '').toLowerCase();
        const brand = (o.business?.businessName || o.businessName || '').toLowerCase();
        if (!title.includes(q) && !brand.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'budget') return (b.budget || 0) - (a.budget || 0);
      if (sortBy === 'deadline') return new Date(a.deadline) - new Date(b.deadline);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const brandName = (o) => o.business?.businessName || o.businessName || 'Brand';
  const brandLogo = (o) => (brandName(o)).charAt(0).toUpperCase();
  const budgetStr = (o) => o.budget ? `₹${Number(o.budget).toLocaleString('en-IN')}` : 'Negotiable';
  const deadlineStr = (o) => o.deadline ? new Date(o.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—';

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
        <p style={{ color: '#6b7280', fontSize: 14 }}>Loading offers...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>❌</div>
        <p style={{ color: '#dc2626', fontSize: 14, marginBottom: 12 }}>{error}</p>
        <button onClick={loadData} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#8b5cf6', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Retry</button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>🔍 Browse Offers</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>Discover brand collaboration opportunities</p>
      </div>

      {/* Search & Filters */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search offers or brands..."
              style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 9, paddingBottom: 9, border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ padding: '9px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff' }}>
            <option value="newest">Sort: Newest</option>
            <option value="budget">Sort: Budget (High to Low)</option>
            <option value="deadline">Sort: Deadline (Soonest)</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              style={{ padding: '6px 14px', borderRadius: 20, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: category === c ? '#8b5cf6' : '#f3f4f6', color: category === c ? '#fff' : '#6b7280' }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <p style={{ fontSize: 13, color: '#6b7280' }}>
        Showing <strong style={{ color: '#111827' }}>{filtered.length}</strong> offers
      </p>

      {/* Offers Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <p style={{ color: '#6b7280', fontSize: 14 }}>No offers found matching your filters</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map(offer => {
            const isApplied = applied.has(offer._id);
            return (
              <div key={offer._id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 20, display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                    {brandLogo(offer)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{offer.title}</h3>
                    <p style={{ fontSize: 12, color: '#9ca3af' }}>{brandName(offer)} · {offer.category || '—'}</p>
                  </div>
                  {offer.status === 'published' && (
                    <span style={{ background: '#dcfce7', color: '#059669', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>OPEN</span>
                  )}
                </div>

                {offer.description && (
                  <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{offer.description}</p>
                )}

                {offer.requirements && (
                  <div style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 12px' }}>
                    <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 3 }}>Requirements</p>
                    <p style={{ fontSize: 12, color: '#374151' }}>{offer.requirements}</p>
                  </div>
                )}

                {offer.platforms?.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {offer.platforms.map(p => (
                      <span key={p} style={{ background: '#f3f4f6', color: '#374151', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 500 }}>{p}</span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 18, fontWeight: 700, color: '#059669' }}>{budgetStr(offer)}</p>
                    <p style={{ fontSize: 11, color: '#9ca3af' }}>📅 {deadlineStr(offer)} · {offer.applicationCount || 0} applicants</p>
                  </div>
                  <button
                    onClick={() => !isApplied && setApplyModal(offer)}
                    disabled={isApplied}
                    style={{ padding: '8px 18px', borderRadius: 9, border: 'none', background: isApplied ? '#dcfce7' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: isApplied ? '#059669' : '#fff', fontSize: 12, fontWeight: 700, cursor: isApplied ? 'default' : 'pointer', boxShadow: isApplied ? 'none' : '0 2px 8px rgba(139,92,246,0.3)' }}>
                    {isApplied ? '✓ Applied' : 'Apply Now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Apply Modal */}
      {applyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>Apply for Offer</h2>
              <button onClick={() => { setApplyModal(null); setPitch(''); setPortfolioLinks(''); }}
                style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f3f4f6', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>

            <div style={{ background: '#f9fafb', borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16 }}>
                  {brandLogo(applyModal)}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{applyModal.title}</p>
                  <p style={{ fontSize: 12, color: '#9ca3af' }}>{brandName(applyModal)} · {budgetStr(applyModal)}</p>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Your Pitch *</label>
              <textarea value={pitch} onChange={e => setPitch(e.target.value)} rows={4}
                placeholder="Tell the brand why you're the perfect fit for this campaign..."
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{pitch.length}/1000 characters</p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Portfolio Links (optional, one per line)</label>
              <textarea value={portfolioLinks} onChange={e => setPortfolioLinks(e.target.value)} rows={2}
                placeholder="https://instagram.com/p/..."
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setApplyModal(null); setPitch(''); setPortfolioLinks(''); }}
                style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleApply} disabled={!pitch.trim() || submitting}
                style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: pitch.trim() && !submitting ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : '#e5e7eb', color: pitch.trim() && !submitting ? '#fff' : '#9ca3af', fontSize: 13, fontWeight: 600, cursor: pitch.trim() && !submitting ? 'pointer' : 'not-allowed' }}>
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
