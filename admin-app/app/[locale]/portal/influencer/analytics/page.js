"use client";

import { useState } from 'react';

const platformStats = [
  { platform: 'Instagram', followers: '820K', growth: '+12K', engagement: '5.2%', posts: 142, reach: '2.4M', color: '#e1306c', icon: '📸' },
  { platform: 'TikTok', followers: '280K', growth: '+8K', engagement: '7.8%', posts: 89, reach: '1.1M', color: '#010101', icon: '🎵' },
  { platform: 'YouTube', followers: '95K', growth: '+2.1K', engagement: '4.1%', posts: 34, reach: '380K', color: '#ff0000', icon: '▶️' },
];

const contentPerformance = [
  { title: 'Tech Unboxing: New Smartphone', platform: 'YouTube', views: '124K', likes: '8.2K', comments: '1.4K', shares: '2.1K', date: '2026-06-01' },
  { title: 'Summer Outfit Ideas 2026', platform: 'Instagram', views: '89K', likes: '12.4K', comments: '892', shares: '3.2K', date: '2026-06-03' },
  { title: 'Morning Routine Vlog', platform: 'TikTok', views: '210K', likes: '18.9K', comments: '2.1K', shares: '5.4K', date: '2026-06-05' },
  { title: 'Product Review: Skincare', platform: 'Instagram', views: '67K', likes: '9.1K', comments: '654', shares: '1.8K', date: '2026-06-07' },
  { title: 'Travel Vlog: Bali', platform: 'YouTube', views: '98K', likes: '7.4K', comments: '1.1K', shares: '2.9K', date: '2026-06-09' },
];

const audienceData = [
  { label: '18–24', pct: 32, color: '#8b5cf6' },
  { label: '25–34', pct: 41, color: '#0ea5e9' },
  { label: '35–44', pct: 18, color: '#10b981' },
  { label: '45+', pct: 9, color: '#f59e0b' },
];

const genderData = [
  { label: 'Female', pct: 62, color: '#ec4899' },
  { label: 'Male', pct: 35, color: '#3b82f6' },
  { label: 'Other', pct: 3, color: '#9ca3af' },
];

const weeklyReach = [
  { day: 'Mon', reach: 42000 },
  { day: 'Tue', reach: 58000 },
  { day: 'Wed', reach: 71000 },
  { day: 'Thu', reach: 65000 },
  { day: 'Fri', reach: 89000 },
  { day: 'Sat', reach: 112000 },
  { day: 'Sun', reach: 94000 },
];
const maxReach = Math.max(...weeklyReach.map(d => d.reach));

const PLATFORM_COLORS = { Instagram: '#e1306c', TikTok: '#010101', YouTube: '#ff0000' };

export default function InfluencerAnalyticsPage() {
  const [period, setPeriod] = useState('30d');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>📈 Analytics</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>Your performance metrics across all platforms</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['7d', '30d', '90d'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{ padding: '7px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: period === p ? '#8b5cf6' : '#fff', color: period === p ? '#fff' : '#6b7280', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Platform Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {platformStats.map(p => (
          <div key={p.platform} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${p.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{p.icon}</div>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{p.platform}</h3>
                <p style={{ fontSize: 11, color: '#9ca3af' }}>{p.posts} posts</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Followers', value: p.followers, sub: p.growth },
                { label: 'Engagement', value: p.engagement, sub: 'rate' },
                { label: 'Reach', value: p.reach, sub: 'total' },
              ].map(item => (
                <div key={item.label} style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 12px' }}>
                  <p style={{ fontSize: 10, color: '#9ca3af', marginBottom: 3 }}>{item.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{item.value}</p>
                  <p style={{ fontSize: 10, color: '#059669' }}>{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Reach Chart */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24 }}>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Weekly Reach</h3>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Daily audience reach this week</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160 }}>
          {weeklyReach.map(d => (
            <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: '#8b5cf6' }}>{(d.reach / 1000).toFixed(0)}K</span>
              <div style={{ width: '100%', background: 'linear-gradient(180deg, #a78bfa, #7c3aed)', borderRadius: '6px 6px 0 0', height: `${(d.reach / maxReach) * 120}px`, minHeight: 6 }} />
              <span style={{ fontSize: 11, color: '#9ca3af' }}>{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Audience Demographics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Age Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {audienceData.map(a => (
              <div key={a.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{a.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: a.color }}>{a.pct}%</span>
                </div>
                <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${a.pct}%`, background: a.color, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Gender Split</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {genderData.map(g => (
              <div key={g.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{g.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: g.color }}>{g.pct}%</span>
                </div>
                <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${g.pct}%`, background: g.color, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, padding: '12px 14px', background: '#f9fafb', borderRadius: 10 }}>
            <p style={{ fontSize: 12, color: '#6b7280' }}>Top Locations</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              {['🇺🇸 USA 42%', '🇬🇧 UK 18%', '🇨🇦 Canada 12%', '🇦🇺 Australia 8%'].map(l => (
                <span key={l} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, padding: '3px 8px', fontSize: 11, color: '#374151' }}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Content */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Top Performing Content</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Content</th>
                <th>Platform</th>
                <th>Views</th>
                <th>Likes</th>
                <th>Comments</th>
                <th>Shares</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {contentPerformance.map((c, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: '#111827', maxWidth: 200 }}>{c.title}</td>
                  <td>
                    <span style={{ color: PLATFORM_COLORS[c.platform] || '#374151', fontWeight: 600, fontSize: 12 }}>{c.platform}</span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#374151' }}>{c.views}</td>
                  <td style={{ color: '#ec4899', fontWeight: 600 }}>❤️ {c.likes}</td>
                  <td style={{ color: '#6b7280' }}>💬 {c.comments}</td>
                  <td style={{ color: '#0ea5e9', fontWeight: 600 }}>↗ {c.shares}</td>
                  <td style={{ color: '#9ca3af', fontSize: 12 }}>{c.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
