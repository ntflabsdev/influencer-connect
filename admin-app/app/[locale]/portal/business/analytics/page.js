"use client";

import { useState } from 'react';

const monthlyData = [
  { month: 'Jan', spend: 6200, reach: 1100000, conversions: 2400, roi: 3.2 },
  { month: 'Feb', spend: 7800, reach: 1400000, conversions: 3100, roi: 3.8 },
  { month: 'Mar', spend: 5400, reach: 900000, conversions: 1900, roi: 2.9 },
  { month: 'Apr', spend: 9200, reach: 1800000, conversions: 4200, roi: 4.1 },
  { month: 'May', spend: 11000, reach: 2100000, conversions: 5100, roi: 4.6 },
  { month: 'Jun', spend: 8600, reach: 1600000, conversions: 3800, roi: 3.9 },
];

const platformData = [
  { platform: 'Instagram', spend: 18400, reach: '4.2M', engagement: '5.1%', conversions: 8200, color: '#e1306c', pct: 38 },
  { platform: 'TikTok', spend: 14200, reach: '3.8M', engagement: '7.3%', conversions: 6100, color: '#010101', pct: 29 },
  { platform: 'YouTube', spend: 11600, reach: '2.1M', engagement: '4.2%', conversions: 4800, color: '#ff0000', pct: 24 },
  { platform: 'Twitter', spend: 4000, reach: '890K', engagement: '2.8%', conversions: 1200, color: '#1da1f2', pct: 9 },
];

const topCampaigns = [
  { name: 'boAt Earbuds Launch', roi: '4.8x', reach: '12L', conversions: 5200, spend: '₹71,000', status: 'active' },
  { name: 'Monsoon Fashion', roi: '3.9x', reach: '8.9L', conversions: 3800, spend: '₹42,000', status: 'active' },
  { name: 'Nykaa Beauty Launch', roi: '5.2x', reach: '15L', conversions: 6100, spend: '₹37,500', status: 'active' },
  { name: 'Desi Food Review', roi: '3.1x', reach: '4.2L', conversions: 1900, spend: '₹23,000', status: 'completed' },
];

const maxSpend = Math.max(...monthlyData.map(d => d.spend));
const maxReach = Math.max(...monthlyData.map(d => d.reach));

export default function BusinessAnalyticsPage() {
  const [period, setPeriod] = useState('6m');

  const totalSpend = monthlyData.reduce((s, d) => s + d.spend, 0);
  const totalReach = monthlyData.reduce((s, d) => s + d.reach, 0);
  const totalConversions = monthlyData.reduce((s, d) => s + d.conversions, 0);
  const avgROI = (monthlyData.reduce((s, d) => s + d.roi, 0) / monthlyData.length).toFixed(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>📈 Analytics</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>Track your campaign performance and ROI</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['1m', '3m', '6m', '1y'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{ padding: '7px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: period === p ? '#0ea5e9' : '#fff', color: period === p ? '#fff' : '#6b7280', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              {p === '1m' ? '1 Month' : p === '3m' ? '3 Months' : p === '6m' ? '6 Months' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {[
          { label: 'Total Spend', value: `₹${totalSpend.toLocaleString()}`, icon: '💰', change: '+12%', bg: '#e0f2fe', color: '#0ea5e9' },
          { label: 'Total Reach', value: `${(totalReach / 1000000).toFixed(1)}M`, icon: '👁️', change: '+18%', bg: '#ede9fe', color: '#7c3aed' },
          { label: 'Conversions', value: totalConversions.toLocaleString(), icon: '🎯', change: '+24%', bg: '#dcfce7', color: '#059669' },
          { label: 'Avg. ROI', value: `${avgROI}x`, icon: '📊', change: '+0.4x', bg: '#fef3c7', color: '#d97706' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 12, color: '#6b7280', fontWeight: 500, marginBottom: 8 }}>{s.label}</p>
                <p style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{s.value}</p>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#059669' }}>↑ {s.change} vs last period</span>
              </div>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Spend Chart */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Monthly Spend vs Reach</h3>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Campaign investment and audience reach over time</p>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: '#0ea5e9' }} />
              <span style={{ fontSize: 11, color: '#6b7280' }}>Spend</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: '#8b5cf6' }} />
              <span style={{ fontSize: 11, color: '#6b7280' }}>Reach</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 180 }}>
          {monthlyData.map(d => (
            <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ width: '100%', display: 'flex', gap: 4, alignItems: 'flex-end', height: 150 }}>
                <div title={`₹${d.spend.toLocaleString()}`} style={{ flex: 1, background: 'linear-gradient(180deg, #38bdf8, #0ea5e9)', borderRadius: '4px 4px 0 0', height: `${(d.spend / maxSpend) * 100}%`, minHeight: 4, cursor: 'pointer' }} />
                <div title={`${(d.reach / 1000000).toFixed(1)}M`} style={{ flex: 1, background: 'linear-gradient(180deg, #a78bfa, #7c3aed)', borderRadius: '4px 4px 0 0', height: `${(d.reach / maxReach) * 100}%`, minHeight: 4, cursor: 'pointer' }} />
              </div>
              <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Breakdown + Top Campaigns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Platform Breakdown */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Platform Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {platformData.map(p => (
              <div key={p.platform}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: p.color }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{p.platform}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>Reach: <strong style={{ color: '#111827' }}>{p.reach}</strong></span>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>Eng: <strong style={{ color: '#059669' }}>{p.engagement}</strong></span>
                  </div>
                </div>
                <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${p.pct}%`, background: p.color, borderRadius: 4, transition: 'width 0.5s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>₹{p.spend.toLocaleString()} spent</span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>{p.pct}% of budget</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Campaigns */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Top Campaigns by ROI</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {topCampaigns.map((c, i) => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#f9fafb', borderRadius: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: i === 0 ? '#fef3c7' : i === 1 ? '#f3f4f6' : i === 2 ? '#fde8d8' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: i === 0 ? '#d97706' : '#6b7280', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{c.name}</p>
                  <p style={{ fontSize: 11, color: '#9ca3af' }}>Reach: {c.reach} · {c.conversions.toLocaleString()} conversions</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#059669' }}>{c.roi}</p>
                  <p style={{ fontSize: 11, color: '#9ca3af' }}>{c.spend}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROI Trend */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>ROI Trend</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 120 }}>
          {monthlyData.map(d => (
            <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#059669' }}>{d.roi}x</span>
              <div style={{ width: '100%', background: `linear-gradient(180deg, #34d399, #059669)`, borderRadius: '6px 6px 0 0', height: `${(d.roi / 5) * 80}px`, minHeight: 8 }} />
              <span style={{ fontSize: 11, color: '#9ca3af' }}>{d.month}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
