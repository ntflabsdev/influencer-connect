"use client";

import { useState } from 'react';

const COLLABS = [
  { id: 1, influencer: 'Priya Sharma', handle: '@priyastyle', avatar: 'P', color: '#ec4899', campaign: 'Monsoon Fashion 2026', status: 'active', deliverables: 3, completed: 2, budget: '₹21,000', deadline: '2026-07-30', lastUpdate: '2 hours ago' },
  { id: 2, influencer: 'Rahul Verma', handle: '@rahultech', avatar: 'R', color: '#3b82f6', campaign: 'boAt Earbuds Launch Q2', status: 'active', deliverables: 2, completed: 1, budget: '₹35,000', deadline: '2026-08-15', lastUpdate: '1 day ago' },
  { id: 3, influencer: 'Anjali Singh', handle: '@anjalifitness', avatar: 'A', color: '#10b981', campaign: 'Cult.fit App Drive', status: 'pending', deliverables: 2, completed: 0, budget: '₹15,000', deadline: '2026-08-05', lastUpdate: '3 days ago' },
  { id: 4, influencer: 'Vikram Patel', handle: '@vikramfood', avatar: 'V', color: '#f59e0b', campaign: 'Biryani Festival Swiggy', status: 'completed', deliverables: 2, completed: 2, budget: '₹12,000', deadline: '2026-07-10', lastUpdate: '1 week ago' },
  { id: 5, influencer: 'Kavya Nair', handle: '@kavyatravel', avatar: 'K', color: '#8b5cf6', campaign: 'Goa Monsoon MakeMyTrip', status: 'active', deliverables: 4, completed: 1, budget: '₹25,000', deadline: '2026-09-01', lastUpdate: '5 hours ago' },
  { id: 6, influencer: 'Neha Gupta', handle: '@nehabeauty', avatar: 'N', color: '#f472b6', campaign: 'Nykaa Navratri Beauty', status: 'active', deliverables: 3, completed: 1, budget: '₹29,000', deadline: '2026-08-20', lastUpdate: '12 hours ago' },
];

const STATUS_MAP = {
  active:    { bg: '#dcfce7', color: '#166534', label: 'Active' },
  pending:   { bg: '#fef9c3', color: '#854d0e', label: 'Pending' },
  completed: { bg: '#dbeafe', color: '#1e40af', label: 'Completed' },
};

export default function BusinessCollaborationsPage() {
  const [filter, setFilter]     = useState('all');
  const [selected, setSelected] = useState(null);
  const [msgModal, setMsgModal] = useState(null);
  const [message, setMessage]   = useState('');
  const [sentMsgs, setSentMsgs] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');

  const filtered = COLLABS.filter(c => filter === 'all' || c.status === filter);
  const counts = { all: COLLABS.length, active: COLLABS.filter(c => c.status === 'active').length, pending: COLLABS.filter(c => c.status === 'pending').length, completed: COLLABS.filter(c => c.status === 'completed').length };

  const sendMessage = () => {
    if (!message.trim()) return;
    setSentMsgs(prev => [...prev, { to: msgModal.influencer, msg: message }]);
    setMsgModal(null);
    setMessage('');
    setSuccessMsg(`Message sent to ${msgModal.influencer}!`);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>🤝 Collaborations</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>Manage your ongoing collaborations with influencers</p>
      </div>

      {successMsg && (
        <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', color: '#166534', fontSize: 13, fontWeight: 600 }}>✅ {successMsg}</div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total', value: counts.all, icon: '🤝', bg: '#e0f2fe', color: '#0ea5e9' },
          { label: 'Active', value: counts.active, icon: '✅', bg: '#dcfce7', color: '#059669' },
          { label: 'Pending', value: counts.pending, icon: '⏳', bg: '#fef9c3', color: '#d97706' },
          { label: 'Completed', value: counts.completed, icon: '🏁', bg: '#dbeafe', color: '#1e40af' },
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
        {['all', 'active', 'pending', 'completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '7px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: filter === f ? '#0ea5e9' : '#f3f4f6', color: filter === f ? '#fff' : '#6b7280' }}>
            {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f] ?? COLLABS.length})
          </button>
        ))}
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(c => {
          const st = STATUS_MAP[c.status];
          const pct = Math.round((c.completed / c.deliverables) * 100);
          return (
            <div key={c.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>{c.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{c.influencer}</p>
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>{c.handle}</span>
                    <span style={{ background: st.bg, color: st.color, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{st.label}</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#6b7280' }}>{c.campaign} · {c.budget} · Due {c.deadline}</p>
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>Deliverables ({c.completed}/{c.deliverables})</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{pct}%</span>
                    </div>
                    <div style={{ height: 5, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #0ea5e9, #0284c7)', borderRadius: 3 }} />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => setSelected(c)}
                    style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    Details
                  </button>
                  <button onClick={() => setMsgModal(c)}
                    style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: '#0ea5e9', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    💬 Message
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 460, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>Collaboration Details</h2>
              <button onClick={() => setSelected(null)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f3f4f6', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#f9fafb', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: selected.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 22 }}>{selected.avatar}</div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{selected.influencer}</p>
                <p style={{ fontSize: 13, color: '#6b7280' }}>{selected.handle}</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'Campaign', value: selected.campaign },
                { label: 'Budget', value: selected.budget },
                { label: 'Deliverables', value: `${selected.completed}/${selected.deliverables}` },
                { label: 'Deadline', value: selected.deadline },
                { label: 'Status', value: STATUS_MAP[selected.status].label },
                { label: 'Last Update', value: selected.lastUpdate },
              ].map(item => (
                <div key={item.label} style={{ background: '#f9fafb', borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{item.label}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{item.value}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setSelected(null)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Close</button>
              <button onClick={() => { setMsgModal(selected); setSelected(null); }} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#0ea5e9', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>💬 Message</button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {msgModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 420, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>💬 Send Message</h2>
              <button onClick={() => { setMsgModal(null); setMessage(''); }} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f3f4f6', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 14 }}>To: <strong style={{ color: '#111827' }}>{msgModal.influencer}</strong> ({msgModal.handle})</p>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} placeholder="Type your message..."
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setMsgModal(null); setMessage(''); }} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={sendMessage} disabled={!message.trim()}
                style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: message.trim() ? '#0ea5e9' : '#e5e7eb', color: message.trim() ? '#fff' : '#9ca3af', fontSize: 13, fontWeight: 600, cursor: message.trim() ? 'pointer' : 'not-allowed' }}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
