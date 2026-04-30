"use client";

import { useState } from 'react';

const PAYOUTS = [
  { id: 1, amount: 35000, campaign: 'Earbuds Launch Campaign', brand: 'boAt Lifestyle', status: 'paid', date: '2026-06-02', method: 'UPI', utr: 'UTR123456789' },
  { id: 2, amount: 23000, campaign: 'Monsoon Skincare Collection', brand: 'Mamaearth', status: 'paid', date: '2026-06-05', method: 'Bank Transfer', utr: 'UTR987654321' },
  { id: 3, amount: 29000, campaign: 'Navratri Beauty Collection', brand: 'Nykaa', status: 'processing', date: '2026-06-08', method: 'UPI', utr: '—' },
  { id: 4, amount: 12000, campaign: 'Biryani Festival Review', brand: 'Swiggy', status: 'paid', date: '2026-05-28', method: 'UPI', utr: 'UTR456789123' },
  { id: 5, amount: 25000, campaign: 'Goa Monsoon Promo', brand: 'MakeMyTrip', status: 'pending', date: '2026-06-10', method: '—', utr: '—' },
];

const STATUS_MAP = {
  paid:       { bg: '#dcfce7', color: '#166534', label: 'Paid' },
  processing: { bg: '#dbeafe', color: '#1e40af', label: 'Processing' },
  pending:    { bg: '#fef9c3', color: '#854d0e', label: 'Pending' },
};

export default function InfluencerPayoutsPage() {
  const [addModal, setAddModal]   = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [form, setForm]           = useState({ type: 'UPI', upiId: '', accountNo: '', ifsc: '', name: '' });
  const [saved, setSaved]         = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const totalPaid       = PAYOUTS.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const totalPending    = PAYOUTS.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  const totalProcessing = PAYOUTS.filter(p => p.status === 'processing').reduce((s, p) => s + p.amount, 0);

  const handleSaveMethod = () => {
    setSaved(true);
    setAddModal(false);
    setSuccessMsg('Payout method saved successfully!');
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>💳 Payouts</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>Manage your payout methods and withdrawal history</p>
        </div>
        <button onClick={() => setAddModal(true)}
          style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          ➕ {saved ? 'Update' : 'Add'} Payout Method
        </button>
      </div>

      {successMsg && (
        <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', color: '#166534', fontSize: 13, fontWeight: 600 }}>✅ {successMsg}</div>
      )}

      {/* Payout Method Card */}
      <div style={{ background: '#fff', borderRadius: 16, border: saved ? '2px solid #8b5cf6' : '1px dashed #d1d5db', padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: saved ? '#ede9fe' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              {saved ? '💳' : '➕'}
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{saved ? `${form.type} — ${form.upiId || form.accountNo || 'Saved'}` : 'No payout method added'}</p>
              <p style={{ fontSize: 12, color: '#9ca3af' }}>{saved ? 'Primary payout method' : 'Add a UPI ID or bank account to receive payments'}</p>
            </div>
          </div>
          {saved && (
            <button onClick={() => setAddModal(true)}
              style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total Received', value: `₹${totalPaid.toLocaleString()}`, icon: '💰', bg: '#dcfce7', color: '#059669' },
          { label: 'Processing', value: `₹${totalProcessing.toLocaleString()}`, icon: '🔄', bg: '#dbeafe', color: '#1e40af' },
          { label: 'Pending', value: `₹${totalPending.toLocaleString()}`, icon: '⏳', bg: '#fef9c3', color: '#d97706' },
          { label: 'Total Payouts', value: PAYOUTS.length, icon: '📋', bg: '#ede9fe', color: '#7c3aed' },
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

      {/* Payout History */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Payout History</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {PAYOUTS.map((p, i) => {
            const st = STATUS_MAP[p.status];
            return (
              <div key={p.id} onClick={() => setDetailModal(p)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < PAYOUTS.length - 1 ? '1px solid #f3f4f6' : 'none', cursor: 'pointer' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: p.status === 'paid' ? '#dcfce7' : p.status === 'processing' ? '#dbeafe' : '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {p.status === 'paid' ? '✅' : p.status === 'processing' ? '🔄' : '⏳'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{p.campaign}</p>
                  <p style={{ fontSize: 12, color: '#9ca3af' }}>{p.brand} · {p.date}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#059669' }}>+₹{p.amount.toLocaleString()}</p>
                  <span style={{ background: st.bg, color: st.color, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>{st.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Payout Method Modal */}
      {addModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 420, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>💳 Payout Method</h2>
              <button onClick={() => setAddModal(false)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f3f4f6', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {['UPI', 'Bank Transfer'].map(t => (
                <button key={t} onClick={() => setForm(p => ({ ...p, type: t }))}
                  style={{ flex: 1, padding: '9px', borderRadius: 9, border: `1.5px solid ${form.type === t ? '#8b5cf6' : '#e5e7eb'}`, background: form.type === t ? '#ede9fe' : '#fff', color: form.type === t ? '#7c3aed' : '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  {t}
                </button>
              ))}
            </div>
            {form.type === 'UPI' ? (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>UPI ID *</label>
                <input value={form.upiId} onChange={e => setForm(p => ({ ...p, upiId: e.target.value }))} placeholder="yourname@upi"
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Account Holder Name *</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Full name"
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Account Number *</label>
                  <input value={form.accountNo} onChange={e => setForm(p => ({ ...p, accountNo: e.target.value }))} placeholder="XXXXXXXXXXXX"
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>IFSC Code *</label>
                  <input value={form.ifsc} onChange={e => setForm(p => ({ ...p, ifsc: e.target.value }))} placeholder="SBIN0001234"
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setAddModal(false)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveMethod}
                style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Save Method
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 400, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>Payout Details</h2>
              <button onClick={() => setDetailModal(null)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f3f4f6', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'Campaign', value: detailModal.campaign },
                { label: 'Brand', value: detailModal.brand },
                { label: 'Amount', value: `₹${detailModal.amount.toLocaleString()}` },
                { label: 'Status', value: STATUS_MAP[detailModal.status].label },
                { label: 'Date', value: detailModal.date },
                { label: 'Method', value: detailModal.method },
                { label: 'UTR / Reference', value: detailModal.utr },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ fontSize: 13, color: '#9ca3af' }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{item.value}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setDetailModal(null)} style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
