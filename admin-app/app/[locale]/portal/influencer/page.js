"use client";

import { useState } from 'react';
import Link from 'next/link';

const stats = [
  { title: 'Active Campaigns', value: '5', icon: '🚀', change: '+2', changeType: 'up', sub: 'is mahine', accent: '#8b5cf6', bg: '#ede9fe' },
  { title: 'Total Earnings', value: '₹1,03,500', icon: '💰', change: '+₹17,500', changeType: 'up', sub: 'is mahine', accent: '#10b981', bg: '#d1fae5' },
  { title: 'Total Followers', value: '12L', icon: '👥', change: '+24K', changeType: 'up', sub: 'sabhi platforms par', accent: '#0ea5e9', bg: '#e0f2fe' },
  { title: 'Avg. Engagement', value: '4.8%', icon: '📊', change: '+0.3%', changeType: 'up', sub: 'pichle mahine se', accent: '#f59e0b', bg: '#fef3c7' },
];

const pendingApplications = [
  { id: 1, brand: 'boAt Lifestyle', offer: 'Earbuds Launch Campaign', budget: '₹35,000', deadline: 'Aug 15', status: 'pending', category: 'Technology', logo: 'B', color: '#3b82f6' },
  { id: 2, brand: 'Mamaearth', offer: 'Monsoon Skincare', budget: '₹23,000', deadline: 'Jul 30', status: 'approved', category: 'Beauty', logo: 'M', color: '#ec4899' },
  { id: 3, brand: 'Cult.fit', offer: 'Fitness App Drive', budget: '₹15,000', deadline: 'Aug 5', status: 'pending', category: 'Health', logo: 'C', color: '#10b981' },
];

const activeCampaigns = [
  { id: 1, brand: 'Nykaa', offer: 'Navratri Beauty Collection', budget: '₹29,000', progress: 60, deadline: 'Aug 20', deliverables: 3, completed: 2, logo: 'N', color: '#f472b6' },
  { id: 2, brand: 'MakeMyTrip', offer: 'Goa Monsoon Promo', budget: '₹25,000', progress: 30, deadline: 'Sep 1', deliverables: 4, completed: 1, logo: 'MM', color: '#8b5cf6' },
  { id: 3, brand: 'Swiggy', offer: 'Biryani Festival Review', budget: '₹12,000', progress: 80, deadline: 'Jul 25', deliverables: 2, completed: 2, logo: 'S', color: '#f59e0b' },
];

const recentActivity = [
  { icon: '✅', text: 'Mamaearth approved your application for "Monsoon Skincare"', time: '1 hour ago', type: 'success' },
  { icon: '💰', text: 'Payment of ₹12,000 received from Swiggy', time: '3 hours ago', type: 'success' },
  { icon: '📋', text: 'New offer matching your profile: "Diwali Fashion Ambassador"', time: '5 hours ago', type: 'info' },
  { icon: '⭐', text: 'boAt Lifestyle gave you a 5-star review', time: '1 day ago', type: 'success' },
  { icon: '📅', text: 'Deliverable due in 2 days for "Goa Monsoon Promo"', time: '1 day ago', type: 'warning' },
];

const earningsData = [
  { month: 'Jan', amount: 15000 },
  { month: 'Feb', amount: 20000 },
  { month: 'Mar', amount: 13500 },
  { month: 'Apr', amount: 27000 },
  { month: 'May', amount: 24000 },
  { month: 'Jun', amount: 17500 },
];
const maxEarning = Math.max(...earningsData.map(d => d.amount));

export default function InfluencerDashboard() {
  const [timeFilter, setTimeFilter] = useState('30d');
  const [submitModal, setSubmitModal] = useState(null);
  const [contentUrl, setContentUrl] = useState('');
  const [submitted, setSubmitted] = useState(new Set());
  const [successMsg, setSuccessMsg] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              ⭐
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', lineHeight: 1 }}>Welcome back, Priya! 👋</h1>
              <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>You have 3 pending applications and 2 upcoming deliverables</p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['7d', '30d', '90d'].map(f => (
            <button key={f} onClick={() => setTimeFilter(f)}
              style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', background: timeFilter === f ? '#8b5cf6' : '#fff', color: timeFilter === f ? '#fff' : '#6b7280', boxShadow: timeFilter === f ? '0 2px 8px rgba(139,92,246,0.3)' : '0 1px 3px rgba(0,0,0,0.08)' }}>
              {f === '7d' ? '7 Days' : f === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
          <Link href="/portal/influencer/offers"
            style={{ padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 8px rgba(139,92,246,0.3)' }}>
            🔍 Browse Offers
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="dash-stats-grid">
        {stats.map(s => (
          <div key={s.title} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, color: '#6b7280', fontWeight: 500, marginBottom: 8 }}>{s.title}</p>
                <p style={{ fontSize: 28, fontWeight: 700, color: '#111827', lineHeight: 1, marginBottom: 6 }}>{s.value}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#059669' }}>↑ {s.change}</span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>{s.sub}</span>
                </div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Earnings Chart + Activity */}
      <div className="dash-chart-grid">
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Monthly Earnings</h3>
              <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Your income over the last 6 months</p>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#059669' }}>₹1,17,000 total</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160 }}>
            {earningsData.map(d => (
              <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#8b5cf6' }}>₹{(d.amount / 1000).toFixed(1)}k</span>
                <div style={{ width: '100%', background: 'linear-gradient(180deg, #a78bfa, #7c3aed)', borderRadius: '6px 6px 0 0', height: `${(d.amount / maxEarning) * 120}px`, minHeight: 6 }} />
                <span style={{ fontSize: 11, color: '#9ca3af' }}>{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentActivity.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: a.type === 'success' ? '#dcfce7' : a.type === 'warning' ? '#fef3c7' : '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{a.icon}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.4 }}>{a.text}</p>
                  <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Campaigns */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Active Campaigns</h3>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Your ongoing collaborations</p>
          </div>
          <Link href="/portal/influencer/campaigns" style={{ fontSize: 12, color: '#8b5cf6', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {activeCampaigns.map(c => (
            <div key={c.id} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{c.logo}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{c.offer}</p>
                      <p style={{ fontSize: 11, color: '#9ca3af' }}>{c.brand} · Due {c.deadline}</p>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#059669' }}>{c.budget}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: '#6b7280' }}>Progress ({c.completed}/{c.deliverables} deliverables)</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{c.progress}%</span>
                  </div>
                  <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${c.progress}%`, background: `linear-gradient(90deg, ${c.color}, ${c.color}cc)`, borderRadius: 3 }} />
                  </div>
                </div>
                <button onClick={() => setSubmitModal(c)} disabled={submitted.has(c.id)}
                  style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: submitted.has(c.id) ? '#dcfce7' : '#8b5cf6', color: submitted.has(c.id) ? '#059669' : '#fff', fontSize: 11, fontWeight: 600, cursor: submitted.has(c.id) ? 'default' : 'pointer', flexShrink: 0 }}>
                  {submitted.has(c.id) ? '✓ Submitted' : 'Submit Work'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Applications */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Recent Applications</h3>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Status of your offer applications</p>
          </div>
          <Link href="/portal/influencer/applications" style={{ fontSize: 12, color: '#8b5cf6', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pendingApplications.map(app => (
            <div key={app.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#f9fafb', borderRadius: 10, flexWrap: 'wrap' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: app.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{app.logo}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{app.offer}</p>
                <p style={{ fontSize: 11, color: '#9ca3af' }}>{app.brand} · {app.category} · Due {app.deadline}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>{app.budget}</span>
                <span style={{ background: app.status === 'approved' ? '#dcfce7' : '#fef9c3', color: app.status === 'approved' ? '#166534' : '#854d0e', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
                  {app.status === 'approved' ? '✓ Approved' : '⏳ Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {successMsg && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 99999, background: '#059669', color: '#fff', borderRadius: 12, padding: '12px 20px', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
          ✅ {successMsg}
        </div>
      )}

      {submitModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 440, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>📤 Submit Work</h2>
              <button onClick={() => { setSubmitModal(null); setContentUrl(''); }} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f3f4f6', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ background: '#f9fafb', borderRadius: 10, padding: 12, marginBottom: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{submitModal.offer}</p>
              <p style={{ fontSize: 12, color: '#9ca3af' }}>{submitModal.brand}</p>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Content URL *</label>
              <input value={contentUrl} onChange={e => setContentUrl(e.target.value)} placeholder="https://instagram.com/p/..."
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setSubmitModal(null); setContentUrl(''); }} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => { setSubmitted(prev => new Set([...prev, submitModal.id])); setSuccessMsg(`Work submitted for "${submitModal.offer}"!`); setTimeout(() => setSuccessMsg(''), 3500); setSubmitModal(null); setContentUrl(''); }} disabled={!contentUrl.trim()}
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