"use client";

import { useState } from 'react';

const CAMPAIGNS = [
  { id: 1, name: 'Monsoon Fashion 2026', status: 'active', influencers: 3, budget: 42000, spent: 26800, reach: '18L', conversions: 4200, startDate: '2026-05-15', endDate: '2026-07-30', progress: 65, category: 'Fashion' },
  { id: 2, name: 'boAt Earbuds Launch Q2', status: 'active', influencers: 2, budget: 71000, spent: 35000, reach: '21L', conversions: 5100, startDate: '2026-05-20', endDate: '2026-08-15', progress: 49, category: 'Technology' },
  { id: 3, name: 'Cult.fit App Drive', status: 'review', influencers: 1, budget: 27000, spent: 0, reach: '—', conversions: 0, startDate: '2026-06-10', endDate: '2026-08-05', progress: 0, category: 'Health' },
  { id: 4, name: 'Biryani Festival Swiggy', status: 'completed', influencers: 4, budget: 23000, spent: 23000, reach: '9.8L', conversions: 2100, startDate: '2026-04-01', endDate: '2026-07-10', progress: 100, category: 'Food' },
  { id: 5, name: 'Goa Monsoon MakeMyTrip', status: 'active', influencers: 2, budget: 50000, spent: 12500, reach: '6.2L', conversions: 1400, startDate: '2026-06-01', endDate: '2026-09-01', progress: 25, category: 'Travel' },
  { id: 6, name: 'Nykaa Navratri Beauty', status: 'active', influencers: 5, budget: 37500, spent: 17500, reach: '14L', conversions: 3800, startDate: '2026-06-01', endDate: '2026-08-20', progress: 47, category: 'Beauty' },
];

const STATUS_MAP = {
  active:    { bg: '#dcfce7', color: '#166534', label: '● Active' },
  review:    { bg: '#fef9c3', color: '#854d0e', label: '● In Review' },
  completed: { bg: '#dbeafe', color: '#1e40af', label: '● Completed' },
  paused:    { bg: '#f3f4f6', color: '#374151', label: '● Paused' },
};

export default function BusinessCampaignsPage() {
  const [filter, setFilter]       = useState('all');
  const [selected, setSelected]   = useState(null);
  const [paused, setPaused]       = useState(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: '', category: 'Fashion', budget: '', startDate: '', endDate: '' });
  const [campaigns, setCampaigns] = useState(CAMPAIGNS);
  const [successMsg, setSuccessMsg] = useState('');

  const filtered = campaigns.filter(c => filter === 'all' || c.status === filter);
  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
  const totalSpent  = campaigns.reduce((s, c) => s + c.spent, 0);

  const togglePause = (id) => {
    setPaused(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'paused' ? 'active' : 'paused' } : c));
  };

  const handleCreate = () => {
    if (!newCampaign.name.trim()) return;
    const created = { ...newCampaign, id: Date.now(), status: 'review', influencers: 0, spent: 0, reach: '—', conversions: 0, progress: 0, budget: Number(newCampaign.budget) || 0 };
    setCampaigns(prev => [created, ...prev]);
    setShowCreate(false);
    setNewCampaign({ name: '', category: 'Fashion', budget: '', startDate: '', endDate: '' });
    setSuccessMsg(`Campaign "${created.name}" created successfully!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>🚀 Campaigns</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>Manage and track all your influencer campaigns</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          ➕ New Campaign
        </button>
      </div>

      {successMsg && (
        <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', color: '#166534', fontSize: 13, fontWeight: 600 }}>
          ✅ {successMsg}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total Campaigns', value: campaigns.length, icon: '🚀', bg: '#e0f2fe', color: '#0ea5e9' },
          { label: 'Active', value: campaigns.filter(c => c.status === 'active').length, icon: '✅', bg: '#dcfce7', color: '#059669' },
          { label: 'Total Budget', value: `₹${totalBudget.toLocaleString()}`, icon: '💰', bg: '#fef3c7', color: '#d97706' },
          { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, icon: '📊', bg: '#ede9fe', color: '#7c3aed' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{s.icon}</div>
              <div>
                <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{s.label}</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '14px 18px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['all', 'active', 'review', 'completed', 'paused'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '7px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: filter === f ? '#0ea5e9' : '#f3f4f6', color: filter === f ? '#fff' : '#6b7280' }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Campaign Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.map(c => {
          const s = STATUS_MAP[c.status] || STATUS_MAP.active;
          const budgetPct = c.budget > 0 ? Math.round((c.spent / c.budget) * 100) : 0;
          return (
            <div key={c.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 22, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{c.name}</h3>
                    <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>{s.label}</span>
                    <span style={{ background: '#f3f4f6', color: '#374151', borderRadius: 6, padding: '3px 8px', fontSize: 11 }}>{c.category}</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#9ca3af' }}>{c.startDate} → {c.endDate} · {c.influencers} influencer{c.influencers !== 1 ? 's' : ''}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setSelected(c)}
                    style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    View Details
                  </button>
                  {(c.status === 'active' || c.status === 'paused') && (
                    <button onClick={() => togglePause(c.id)}
                      style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: c.status === 'paused' ? '#dcfce7' : '#f3f4f6', color: c.status === 'paused' ? '#059669' : '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      {c.status === 'paused' ? '▶ Resume' : '⏸ Pause'}
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'Budget', value: `₹${c.budget.toLocaleString()}`, color: '#374151' },
                  { label: 'Spent', value: `₹${c.spent.toLocaleString()}`, color: '#dc2626' },
                  { label: 'Reach', value: c.reach, color: '#7c3aed' },
                  { label: 'Conversions', value: c.conversions.toLocaleString(), color: '#059669' },
                ].map(item => (
                  <div key={item.label} style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 12px' }}>
                    <p style={{ fontSize: 10, color: '#9ca3af', marginBottom: 3 }}>{item.label}</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: item.color }}>{item.value}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: '#6b7280' }}>Campaign Progress</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{c.progress}%</span>
                  </div>
                  <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${c.progress}%`, background: 'linear-gradient(90deg, #0ea5e9, #0284c7)', borderRadius: 3 }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: '#6b7280' }}>Budget Used</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{budgetPct}%</span>
                  </div>
                  <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${budgetPct}%`, background: budgetPct > 80 ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #10b981, #059669)', borderRadius: 3 }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>Campaign Details</h2>
              <button onClick={() => setSelected(null)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f3f4f6', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Campaign Name', value: selected.name },
                { label: 'Category', value: selected.category },
                { label: 'Status', value: STATUS_MAP[selected.status]?.label || selected.status },
                { label: 'Influencers', value: selected.influencers },
                { label: 'Budget', value: `₹${selected.budget.toLocaleString()}` },
                { label: 'Spent', value: `₹${selected.spent.toLocaleString()}` },
                { label: 'Reach', value: selected.reach },
                { label: 'Conversions', value: selected.conversions.toLocaleString() },
                { label: 'Start Date', value: selected.startDate },
                { label: 'End Date', value: selected.endDate },
              ].map(item => (
                <div key={item.label} style={{ background: '#f9fafb', borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{item.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{item.value}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setSelected(null)} style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>➕ New Campaign</h2>
              <button onClick={() => setShowCreate(false)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f3f4f6', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Campaign Name *</label>
                <input value={newCampaign.name} onChange={e => setNewCampaign(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Summer Sale 2026"
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Category</label>
                  <select value={newCampaign.category} onChange={e => setNewCampaign(p => ({ ...p, category: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }}>
                    {['Fashion','Technology','Health','Food','Travel','Beauty','Gaming','Lifestyle'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Budget (₹)</label>
                  <input type="number" value={newCampaign.budget} onChange={e => setNewCampaign(p => ({ ...p, budget: e.target.value }))} placeholder="50000"
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Start Date</label>
                  <input type="date" value={newCampaign.startDate} onChange={e => setNewCampaign(p => ({ ...p, startDate: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>End Date</label>
                  <input type="date" value={newCampaign.endDate} onChange={e => setNewCampaign(p => ({ ...p, endDate: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={() => setShowCreate(false)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleCreate} disabled={!newCampaign.name.trim()}
                  style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: newCampaign.name.trim() ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : '#e5e7eb', color: newCampaign.name.trim() ? '#fff' : '#9ca3af', fontSize: 13, fontWeight: 600, cursor: newCampaign.name.trim() ? 'pointer' : 'not-allowed' }}>
                  Create Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
