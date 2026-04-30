"use client";

import { useState } from 'react';

const PORTFOLIO = [
  { id: 1, platform: 'Instagram', url: 'https://instagram.com/p/abc123', thumbnail: '📸', caption: 'Navratri Beauty Collection with Nykaa', brand: 'Nykaa', likes: '12.4K', comments: '342', date: '2026-06-15' },
  { id: 2, platform: 'Moj', url: 'https://moj.in/v/xyz456', thumbnail: '🎵', caption: 'Biryani Festival Review for Swiggy', brand: 'Swiggy', likes: '8.7K', comments: '215', date: '2026-06-10' },
  { id: 3, platform: 'Instagram', url: 'https://instagram.com/p/def789', thumbnail: '📸', caption: 'Earbuds unboxing with boAt Lifestyle', brand: 'boAt', likes: '21.3K', comments: '567', date: '2026-05-20' },
  { id: 4, platform: 'YouTube', url: 'https://youtube.com/watch?v=ghi012', thumbnail: '▶️', caption: 'Goa Monsoon Travel Vlog with MakeMyTrip', brand: 'MakeMyTrip', likes: '5.2K', comments: '189', date: '2026-05-15' },
];

const PLATFORM_COLORS = { Instagram: '#e1306c', Moj: '#ff6b35', YouTube: '#ff0000', TikTok: '#010101' };

export default function InfluencerPortfolioPage() {
  const [items, setItems]         = useState(PORTFOLIO);
  const [addModal, setAddModal]   = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm]           = useState({ platform: 'Instagram', url: '', caption: '', brand: '' });
  const [successMsg, setSuccessMsg] = useState('');

  const handleAdd = () => {
    if (!form.url.trim()) return;
    const newItem = { ...form, id: Date.now(), thumbnail: form.platform === 'Instagram' ? '📸' : form.platform === 'YouTube' ? '▶️' : '🎵', likes: '0', comments: '0', date: new Date().toISOString().slice(0, 10) };
    setItems(prev => [newItem, ...prev]);
    setAddModal(false);
    setForm({ platform: 'Instagram', url: '', caption: '', brand: '' });
    setSuccessMsg('Portfolio item added!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDelete = () => {
    setItems(prev => prev.filter(i => i.id !== deleteConfirm.id));
    setDeleteConfirm(null);
    setSuccessMsg('Item removed from portfolio.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>🎨 Portfolio</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>Showcase your best work to attract more brands</p>
        </div>
        <button onClick={() => setAddModal(true)}
          style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          ➕ Add Work
        </button>
      </div>

      {successMsg && (
        <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', color: '#166534', fontSize: 13, fontWeight: 600 }}>✅ {successMsg}</div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total Items', value: items.length, icon: '🎨', bg: '#ede9fe', color: '#7c3aed' },
          { label: 'Instagram', value: items.filter(i => i.platform === 'Instagram').length, icon: '📸', bg: '#fce7f3', color: '#e1306c' },
          { label: 'YouTube', value: items.filter(i => i.platform === 'YouTube').length, icon: '▶️', bg: '#fee2e2', color: '#ff0000' },
          { label: 'Moj / Other', value: items.filter(i => !['Instagram','YouTube'].includes(i.platform)).length, icon: '🎵', bg: '#fef3c7', color: '#d97706' },
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

      {/* Grid */}
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 16, border: '1px dashed #d1d5db' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎨</div>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 16 }}>No portfolio items yet</p>
          <button onClick={() => setAddModal(true)} style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: '#8b5cf6', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Add Your First Work</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {items.map(item => (
            <div key={item.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ height: 120, background: `linear-gradient(135deg, ${PLATFORM_COLORS[item.platform] || '#8b5cf6'}22, ${PLATFORM_COLORS[item.platform] || '#8b5cf6'}44)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
                {item.thumbnail}
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <span style={{ background: `${PLATFORM_COLORS[item.platform] || '#8b5cf6'}22`, color: PLATFORM_COLORS[item.platform] || '#8b5cf6', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>{item.platform}</span>
                  {item.brand && <span style={{ background: '#f3f4f6', color: '#374151', fontSize: 11, padding: '2px 8px', borderRadius: 6 }}>{item.brand}</span>}
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 6, lineHeight: 1.4 }}>{item.caption || 'No caption'}</p>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>❤️ {item.likes}</span>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>💬 {item.comments}</span>
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>{item.date}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setViewModal(item)}
                    style={{ flex: 1, padding: '7px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    View
                  </button>
                  <button onClick={() => setDeleteConfirm(item)}
                    style={{ padding: '7px 12px', borderRadius: 8, border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {addModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 440, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>➕ Add Portfolio Item</h2>
              <button onClick={() => setAddModal(false)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f3f4f6', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Platform</label>
                <select value={form.platform} onChange={e => setForm(p => ({ ...p, platform: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }}>
                  {['Instagram', 'YouTube', 'Moj', 'TikTok', 'Twitter'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Content URL *</label>
                <input value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} placeholder="https://instagram.com/p/..."
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Brand (optional)</label>
                <input value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))} placeholder="e.g. Nykaa"
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Caption</label>
                <textarea value={form.caption} onChange={e => setForm(p => ({ ...p, caption: e.target.value }))} rows={2} placeholder="Describe this content..."
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setAddModal(false)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleAdd} disabled={!form.url.trim()}
                  style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: form.url.trim() ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : '#e5e7eb', color: form.url.trim() ? '#fff' : '#9ca3af', fontSize: 13, fontWeight: 600, cursor: form.url.trim() ? 'pointer' : 'not-allowed' }}>
                  Add to Portfolio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 400, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>Portfolio Item</h2>
              <button onClick={() => setViewModal(null)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f3f4f6', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ textAlign: 'center', fontSize: 60, marginBottom: 16 }}>{viewModal.thumbnail}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {[
                { label: 'Platform', value: viewModal.platform },
                { label: 'Brand', value: viewModal.brand || '—' },
                { label: 'Caption', value: viewModal.caption || '—' },
                { label: 'Likes', value: viewModal.likes },
                { label: 'Comments', value: viewModal.comments },
                { label: 'Date', value: viewModal.date },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ fontSize: 13, color: '#9ca3af' }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{item.value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setViewModal(null)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Close</button>
              <a href={viewModal.url} target="_blank" rel="noreferrer" style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', textAlign: 'center' }}>Open Link ↗</a>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 360, padding: 28, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Remove from Portfolio?</h3>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>This item will be removed from your portfolio.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDelete} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#dc2626', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
