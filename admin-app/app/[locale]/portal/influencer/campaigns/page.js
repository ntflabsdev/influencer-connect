"use client";

import { useState } from 'react';

const CAMPAIGNS = [
  { id: 1, brand: 'Nykaa', offer: 'Navratri Beauty Collection', logo: 'N', color: '#f472b6', budget: '₹29,000', progress: 60, deadline: '2026-08-20', startDate: '2026-06-01', deliverables: 3, completed: 2, status: 'active', category: 'Beauty', tasks: [
    { title: 'Instagram Post (3 slides)', due: '2026-06-15', done: true },
    { title: 'Instagram Story (5 frames)', due: '2026-06-25', done: true },
    { title: 'Moj Video Review', due: '2026-07-10', done: false },
  ]},
  { id: 2, brand: 'MakeMyTrip', offer: 'Goa Monsoon Promo', logo: 'MM', color: '#8b5cf6', budget: '₹25,000', progress: 30, deadline: '2026-09-01', startDate: '2026-06-10', deliverables: 4, completed: 1, status: 'active', category: 'Travel', tasks: [
    { title: 'Instagram Reel (60s)', due: '2026-06-20', done: true },
    { title: 'Blog Post Feature', due: '2026-07-01', done: false },
    { title: 'YouTube Vlog (10 min)', due: '2026-07-15', done: false },
    { title: 'Instagram Story Series', due: '2026-07-25', done: false },
  ]},
  { id: 3, brand: 'Swiggy', offer: 'Biryani Festival Review', logo: 'S', color: '#f59e0b', budget: '₹12,000', progress: 80, deadline: '2026-07-25', startDate: '2026-06-01', deliverables: 2, completed: 2, status: 'review', category: 'Food', tasks: [
    { title: 'Unboxing Moj Video', due: '2026-06-10', done: true },
    { title: 'Instagram Post Review', due: '2026-06-20', done: true },
  ]},
  { id: 4, brand: 'boAt Lifestyle', offer: 'Earbuds Launch Campaign', logo: 'B', color: '#3b82f6', budget: '₹35,000', progress: 100, deadline: '2026-06-01', startDate: '2026-05-01', deliverables: 3, completed: 3, status: 'completed', category: 'Technology', tasks: [
    { title: 'YouTube Review Video', due: '2026-05-15', done: true },
    { title: 'Instagram Post', due: '2026-05-20', done: true },
    { title: 'Twitter Thread', due: '2026-05-28', done: true },
  ]},
];

const STATUS_MAP = {
  active:    { bg: '#dcfce7', color: '#166534', label: '● Active' },
  review:    { bg: '#fef9c3', color: '#854d0e', label: '● In Review' },
  completed: { bg: '#dbeafe', color: '#1e40af', label: '● Completed' },
  paused:    { bg: '#f3f4f6', color: '#374151', label: '● Paused' },
};

export default function InfluencerCampaignsPage() {
  const [selected, setSelected]     = useState(null);
  const [filter, setFilter]         = useState('all');
  const [submitModal, setSubmitModal] = useState(null);
  const [contentUrl, setContentUrl] = useState('');
  const [caption, setCaption]       = useState('');
  const [submitted, setSubmitted]   = useState(new Set());
  const [successMsg, setSuccessMsg] = useState('');

  const filtered     = CAMPAIGNS.filter(c => filter === 'all' || c.status === filter);
  const totalEarned  = CAMPAIGNS.filter(c => c.status === 'completed').reduce((s, c) => s + parseInt(c.budget.replace(/\D/g, '')), 0);
  const activeCnt    = CAMPAIGNS.filter(c => c.status === 'active').length;

  const handleSubmitWork = () => {
    if (!contentUrl.trim()) return;
    setSubmitted(prev => new Set([...prev, submitModal.id]));
    setSuccessMsg(`Work submitted for "${submitModal.offer}"! Brand will review it shortly.`);
    setTimeout(() => setSuccessMsg(''), 4000);
    setSubmitModal(null);
    setContentUrl('');
    setCaption('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>🚀 Active Campaigns</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>Manage your ongoing collaborations and submit deliverables</p>
        </div>
      </div>

      {successMsg && (
        <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', color: '#166534', fontSize: 13, fontWeight: 600 }}>
          ✅ {successMsg}
        </div>
      )}

      {/* Stats */}
      <div className="resp-stats-grid">
        {[
          { label: 'Total Campaigns', value: CAMPAIGNS.length, icon: '🚀', bg: '#ede9fe', color: '#7c3aed' },
          { label: 'Active', value: activeCnt, icon: '✅', bg: '#dcfce7', color: '#059669' },
          { label: 'Total Earned', value: `₹${totalEarned.toLocaleString()}`, icon: '💰', bg: '#dcfce7', color: '#059669' },
          { label: 'Deliverables Done', value: CAMPAIGNS.reduce((s, c) => s + c.completed, 0), icon: '📦', bg: '#e0f2fe', color: '#0ea5e9' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{s.icon}</div>
              <div>
                <p style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>{s.label}</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '14px 18px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['all', 'active', 'review', 'completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '7px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: filter === f ? '#8b5cf6' : '#f3f4f6', color: filter === f ? '#fff' : '#6b7280' }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Campaign Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filtered.map(c => {
          const s = STATUS_MAP[c.status];
          const isSubmitted = submitted.has(c.id);
          return (
            <div key={c.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 22, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>{c.logo}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{c.offer}</h3>
                    <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>{s.label}</span>
                    <span style={{ background: '#f3f4f6', color: '#374151', borderRadius: 6, padding: '3px 8px', fontSize: 11 }}>{c.category}</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12 }}>{c.brand} · {c.startDate} → {c.deadline}</p>

                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: '#6b7280' }}>Progress ({c.completed}/{c.deliverables} deliverables)</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{c.progress}%</span>
                    </div>
                    <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${c.progress}%`, background: `linear-gradient(90deg, ${c.color}, ${c.color}cc)`, borderRadius: 4 }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {c.tasks.map((task, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: task.done ? '#f0fdf4' : '#f9fafb', borderRadius: 8, border: `1px solid ${task.done ? '#bbf7d0' : '#e5e7eb'}` }}>
                        <div style={{ width: 20, height: 20, borderRadius: 6, background: task.done ? '#059669' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', flexShrink: 0 }}>
                          {task.done ? '✓' : ''}
                        </div>
                        <span style={{ flex: 1, fontSize: 12, color: task.done ? '#374151' : '#6b7280', textDecoration: task.done ? 'line-through' : 'none' }}>{task.title}</span>
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>Due {task.due}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, alignItems: 'flex-end' }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#059669' }}>{c.budget}</span>
                  <button onClick={() => setSelected(c)}
                    style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    View Details
                  </button>
                  {c.status === 'active' && (
                    <button onClick={() => setSubmitModal(c)} disabled={isSubmitted}
                      style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: isSubmitted ? '#dcfce7' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: isSubmitted ? '#059669' : '#fff', fontSize: 12, fontWeight: 600, cursor: isSubmitted ? 'default' : 'pointer' }}>
                      {isSubmitted ? '✓ Submitted' : '📤 Submit Work'}
                    </button>
                  )}
                  {c.status === 'review' && <span style={{ fontSize: 12, color: '#d97706', fontWeight: 600 }}>⏳ Under Review</span>}
                  {c.status === 'completed' && <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>✅ Completed</span>}
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
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>Campaign Details</h2>
              <button onClick={() => setSelected(null)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f3f4f6', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#f9fafb', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: selected.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 22 }}>{selected.logo}</div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{selected.offer}</p>
                <p style={{ fontSize: 13, color: '#6b7280' }}>{selected.brand} · {selected.category}</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Budget', value: selected.budget },
                { label: 'Progress', value: `${selected.progress}%` },
                { label: 'Start Date', value: selected.startDate },
                { label: 'Deadline', value: selected.deadline },
                { label: 'Deliverables', value: `${selected.completed}/${selected.deliverables} done` },
                { label: 'Status', value: STATUS_MAP[selected.status].label },
              ].map(item => (
                <div key={item.label} style={{ background: '#f9fafb', borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{item.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{item.value}</p>
                </div>
              ))}
            </div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10 }}>Tasks</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
              {selected.tasks.map((task, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: task.done ? '#f0fdf4' : '#f9fafb', borderRadius: 8, border: `1px solid ${task.done ? '#bbf7d0' : '#e5e7eb'}` }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: task.done ? '#059669' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', flexShrink: 0 }}>{task.done ? '✓' : ''}</div>
                  <span style={{ flex: 1, fontSize: 13, color: task.done ? '#374151' : '#6b7280' }}>{task.title}</span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>Due {task.due}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setSelected(null)} style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}

      {/* Submit Work Modal */}
      {submitModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 460, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>📤 Submit Work</h2>
              <button onClick={() => { setSubmitModal(null); setContentUrl(''); setCaption(''); }} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f3f4f6', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ background: '#f9fafb', borderRadius: 10, padding: 12, marginBottom: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{submitModal.offer}</p>
              <p style={{ fontSize: 12, color: '#9ca3af' }}>{submitModal.brand}</p>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Content URL *</label>
              <input value={contentUrl} onChange={e => setContentUrl(e.target.value)} placeholder="https://instagram.com/p/..."
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Caption (optional)</label>
              <textarea value={caption} onChange={e => setCaption(e.target.value)} rows={3} placeholder="Add a note for the brand..."
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setSubmitModal(null); setContentUrl(''); setCaption(''); }}
                style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSubmitWork} disabled={!contentUrl.trim()}
                style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: contentUrl.trim() ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : '#e5e7eb', color: contentUrl.trim() ? '#fff' : '#9ca3af', fontSize: 13, fontWeight: 600, cursor: contentUrl.trim() ? 'pointer' : 'not-allowed' }}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
