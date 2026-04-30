"use client";

import { useState } from 'react';

const INVOICES = [
  { id: 'INV-2026-001', campaign: 'Earbuds Launch Campaign', influencer: 'Rahul Verma', amount: 35000, status: 'paid', date: '2026-06-02', dueDate: '2026-06-15', items: [{ desc: 'YouTube Review Video', qty: 1, rate: 25000 }, { desc: 'Instagram Post', qty: 1, rate: 10000 }] },
  { id: 'INV-2026-002', campaign: 'Monsoon Fashion Campaign', influencer: 'Priya Sharma', amount: 21000, status: 'paid', date: '2026-06-05', dueDate: '2026-06-20', items: [{ desc: 'Instagram Reel', qty: 1, rate: 15000 }, { desc: 'Instagram Stories (5)', qty: 5, rate: 1200 }] },
  { id: 'INV-2026-003', campaign: 'Navratri Beauty Collection', influencer: 'Neha Gupta', amount: 29000, status: 'pending', date: '2026-06-08', dueDate: '2026-06-25', items: [{ desc: 'Moj Video', qty: 1, rate: 18000 }, { desc: 'Instagram Post', qty: 1, rate: 11000 }] },
  { id: 'INV-2026-004', campaign: 'Biryani Festival Review', influencer: 'Vikram Patel', amount: 12000, status: 'paid', date: '2026-05-28', dueDate: '2026-06-10', items: [{ desc: 'Food Review Video', qty: 1, rate: 12000 }] },
  { id: 'INV-2026-005', campaign: 'Goa Monsoon Promo', influencer: 'Kavya Nair', amount: 25000, status: 'overdue', date: '2026-06-01', dueDate: '2026-06-15', items: [{ desc: 'Travel Vlog', qty: 1, rate: 20000 }, { desc: 'Instagram Stories', qty: 5, rate: 1000 }] },
];

const STATUS_MAP = {
  paid:    { bg: '#dcfce7', color: '#166534', label: 'Paid' },
  pending: { bg: '#fef9c3', color: '#854d0e', label: 'Pending' },
  overdue: { bg: '#fee2e2', color: '#991b1b', label: 'Overdue' },
};

export default function BusinessInvoicesPage() {
  const [filter, setFilter]       = useState('all');
  const [selected, setSelected]   = useState(null);
  const [downloading, setDownloading] = useState(null);

  const filtered = INVOICES.filter(i => filter === 'all' || i.status === filter);
  const totalPaid    = INVOICES.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const totalPending = INVOICES.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0);

  const handleDownload = (inv) => {
    setDownloading(inv.id);
    setTimeout(() => {
      setDownloading(null);
      // Simulate download by creating a text blob
      const content = `INVOICE ${inv.id}\n\nCampaign: ${inv.campaign}\nInfluencer: ${inv.influencer}\nDate: ${inv.date}\nDue: ${inv.dueDate}\n\nItems:\n${inv.items.map(i => `  ${i.desc} x${i.qty} = ₹${(i.qty * i.rate).toLocaleString()}`).join('\n')}\n\nTotal: ₹${inv.amount.toLocaleString()}\nStatus: ${inv.status.toUpperCase()}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${inv.id}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }, 800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>🧾 Invoices</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>View and download all your campaign invoices</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total Invoices', value: INVOICES.length, icon: '🧾', bg: '#e0f2fe', color: '#0ea5e9' },
          { label: 'Total Paid', value: `₹${totalPaid.toLocaleString()}`, icon: '✅', bg: '#dcfce7', color: '#059669' },
          { label: 'Outstanding', value: `₹${totalPending.toLocaleString()}`, icon: '⏳', bg: '#fef9c3', color: '#d97706' },
          { label: 'Overdue', value: INVOICES.filter(i => i.status === 'overdue').length, icon: '⚠️', bg: '#fee2e2', color: '#dc2626' },
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
        {['all', 'paid', 'pending', 'overdue'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '7px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: filter === f ? '#0ea5e9' : '#f3f4f6', color: filter === f ? '#fff' : '#6b7280' }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Invoice List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(inv => {
          const st = STATUS_MAP[inv.status];
          return (
            <div key={inv.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🧾</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{inv.id}</p>
                <p style={{ fontSize: 12, color: '#9ca3af' }}>{inv.campaign} · {inv.influencer} · Due {inv.dueDate}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, flexWrap: 'wrap' }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>₹{inv.amount.toLocaleString()}</p>
                <span style={{ background: st.bg, color: st.color, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>{st.label}</span>
                <button onClick={() => setSelected(inv)}
                  style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                  View
                </button>
                <button onClick={() => handleDownload(inv)} disabled={downloading === inv.id}
                  style={{ padding: '6px 12px', borderRadius: 7, border: 'none', background: downloading === inv.id ? '#e5e7eb' : '#0ea5e9', color: downloading === inv.id ? '#9ca3af' : '#fff', fontSize: 11, fontWeight: 600, cursor: downloading === inv.id ? 'not-allowed' : 'pointer' }}>
                  {downloading === inv.id ? '⏳' : '⬇️ Download'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invoice Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480, padding: 28, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>{selected.id}</h2>
              <button onClick={() => setSelected(null)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f3f4f6', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ background: '#f9fafb', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{selected.campaign}</p>
              <p style={{ fontSize: 12, color: '#6b7280' }}>Influencer: {selected.influencer}</p>
              <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                <div><p style={{ fontSize: 11, color: '#9ca3af' }}>Invoice Date</p><p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{selected.date}</p></div>
                <div><p style={{ fontSize: 11, color: '#9ca3af' }}>Due Date</p><p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{selected.dueDate}</p></div>
                <div><p style={{ fontSize: 11, color: '#9ca3af' }}>Status</p><span style={{ background: STATUS_MAP[selected.status].bg, color: STATUS_MAP[selected.status].color, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{STATUS_MAP[selected.status].label}</span></div>
              </div>
            </div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10 }}>Line Items</h4>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 0, background: '#f9fafb', padding: '8px 14px', borderBottom: '1px solid #e5e7eb' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af' }}>Description</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textAlign: 'center', paddingLeft: 16 }}>Qty</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textAlign: 'right', paddingLeft: 16 }}>Amount</span>
              </div>
              {selected.items.map((item, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 0, padding: '10px 14px', borderBottom: i < selected.items.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <span style={{ fontSize: 13, color: '#374151' }}>{item.desc}</span>
                  <span style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', paddingLeft: 16 }}>{item.qty}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111827', textAlign: 'right', paddingLeft: 16 }}>₹{(item.qty * item.rate).toLocaleString()}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: '#f9fafb', borderTop: '2px solid #e5e7eb' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Total</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#059669' }}>₹{selected.amount.toLocaleString()}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setSelected(null)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Close</button>
              <button onClick={() => { handleDownload(selected); setSelected(null); }}
                style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                ⬇️ Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
