"use client";

import { useState } from 'react';
import Link from 'next/link';

// ── Dummy Data (India) ──
const stats = [
  { title: 'Active Campaigns', value: '12', icon: '🚀', change: '+3', changeType: 'up', sub: 'pichle mahine se', accent: '#0ea5e9', bg: '#e0f2fe' },
  { title: 'Total Reach', value: '2.4M', icon: '👁️', change: '+18%', changeType: 'up', sub: 'impressions', accent: '#8b5cf6', bg: '#ede9fe' },
  { title: 'Applications', value: '148', icon: '📋', change: '+24', changeType: 'up', sub: 'review pending', accent: '#f59e0b', bg: '#fef3c7' },
  { title: 'Total Spent', value: '₹4,02,000', icon: '💰', change: '+₹53,000', changeType: 'up', sub: 'is mahine', accent: '#10b981', bg: '#d1fae5' },
];

const recentOffers = [
  { id: 1, title: 'Monsoon Fashion Campaign', category: 'Fashion', budget: '₹42,000', applications: 34, status: 'active', deadline: 'Jul 30', reach: '5L+' },
  { id: 2, title: 'Smartphone Launch India', category: 'Technology', budget: '₹71,000', applications: 21, status: 'active', deadline: 'Aug 15', reach: '10L+' },
  { id: 3, title: 'Fitness App Promotion', category: 'Health', budget: '₹27,000', applications: 18, status: 'review', deadline: 'Aug 5', reach: '2.5L+' },
  { id: 4, title: 'Desi Food Review', category: 'Food', budget: '₹23,000', applications: 45, status: 'completed', deadline: 'Jul 10', reach: '3L+' },
  { id: 5, title: 'Rajasthan Tourism Promo', category: 'Travel', budget: '₹50,000', applications: 29, status: 'active', deadline: 'Sep 1', reach: '7.5L+' },
];

const topInfluencers = [
  { name: 'Priya Sharma', handle: '@priyastyle', followers: '12L', category: 'Fashion', engagement: '4.8%', avatar: 'P', color: '#ec4899' },
  { name: 'Rahul Verma', handle: '@rahultech', followers: '8.9L', category: 'Tech', engagement: '5.2%', avatar: 'R', color: '#3b82f6' },
  { name: 'Anjali Singh', handle: '@anjalifitness', followers: '6.5L', category: 'Fitness', engagement: '6.1%', avatar: 'A', color: '#10b981' },
  { name: 'Vikram Patel', handle: '@vikramfood', followers: '4.2L', category: 'Food', engagement: '7.3%', avatar: 'V', color: '#f59e0b' },
];

const recentActivity = [
  { icon: '✅', text: 'Priya Sharma accepted your collaboration offer', time: '2 hours ago', type: 'success' },
  { icon: '📋', text: '12 new applications for "Smartphone Launch India"', time: '4 hours ago', type: 'info' },
  { icon: '💬', text: 'New message from Rahul Verma regarding campaign details', time: '6 hours ago', type: 'info' },
  { icon: '⚠️', text: '"Fitness App Promotion" deadline in 3 days', time: '1 day ago', type: 'warning' },
  { icon: '🎉', text: '"Desi Food Review" campaign completed successfully', time: '2 days ago', type: 'success' },
];

const chartData = [
  { month: 'Jan', spend: 52000, reach: 1.1 },
  { month: 'Feb', spend: 65000, reach: 1.4 },
  { month: 'Mar', spend: 45000, reach: 0.9 },
  { month: 'Apr', spend: 77000, reach: 1.8 },
  { month: 'May', spend: 92000, reach: 2.1 },
  { month: 'Jun', spend: 72000, reach: 1.6 },
];

const maxSpend = Math.max(...chartData.map(d => d.spend));

function StatusBadge({ status }) {
  const map = {
    active: { bg: '#dcfce7', color: '#166534', label: 'Active' },
    review: { bg: '#fef9c3', color: '#854d0e', label: 'In Review' },
    completed: { bg: '#dbeafe', color: '#1e40af', label: 'Completed' },
    paused: { bg: '#f3f4f6', color: '#374151', label: 'Paused' },
  };
  const s = map[status] || map.paused;
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
      {s.label}
    </span>
  );
}

export default function BusinessDashboard() {
  const [timeFilter, setTimeFilter] = useState('30d');
  const [invited, setInvited] = useState(new Set());
  const [inviteMsg, setInviteMsg] = useState('');

  const toggleInvite = (name) => {
    setInvited(prev => {
      const next = new Set(prev);
      if (next.has(name)) { next.delete(name); } else {
        next.add(name);
        setInviteMsg(`Invite sent to ${name}!`);
        setTimeout(() => setInviteMsg(''), 3000);
      }
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              🏢
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', lineHeight: 1 }}>Welcome back, TechBrand India! 👋</h1>
              <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>Here's your campaign performance overview</p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['7d', '30d', '90d'].map(f => (
            <button key={f} onClick={() => setTimeFilter(f)}
              style={{
                padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
                background: timeFilter === f ? '#0ea5e9' : '#fff',
                color: timeFilter === f ? '#fff' : '#6b7280',
                boxShadow: timeFilter === f ? '0 2px 8px rgba(14,165,233,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
              }}>
              {f === '7d' ? '7 Days' : f === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
          <Link href="/portal/business/offers"
            style={{ padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 8px rgba(14,165,233,0.3)' }}>
            ➕ New Offer
          </Link>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="dash-stats-grid">
        {stats.map(s => (
          <div key={s.title} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, color: '#6b7280', fontWeight: 500, marginBottom: 8 }}>{s.title}</p>
                <p style={{ fontSize: 28, fontWeight: 700, color: '#111827', lineHeight: 1, marginBottom: 6 }}>{s.value}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: s.changeType === 'up' ? '#059669' : '#dc2626' }}>
                    {s.changeType === 'up' ? '↑' : '↓'} {s.change}
                  </span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>{s.sub}</span>
                </div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {s.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Chart + Activity ── */}
      <div className="dash-chart-grid">

        {/* Spend Chart */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Campaign Spend & Reach</h3>
              <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Monthly overview</p>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: '#0ea5e9' }} />
                <span style={{ fontSize: 11, color: '#6b7280' }}>Spend (₹)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: '#8b5cf6' }} />
                <span style={{ fontSize: 11, color: '#6b7280' }}>Reach (M)</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160 }}>
            {chartData.map(d => (
              <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ width: '100%', display: 'flex', gap: 3, alignItems: 'flex-end', height: 140 }}>
                  <div style={{ flex: 1, background: 'linear-gradient(180deg, #0ea5e9, #0284c7)', borderRadius: '4px 4px 0 0', height: `${(d.spend / maxSpend) * 100}%`, minHeight: 4 }} />
                  <div style={{ flex: 1, background: 'linear-gradient(180deg, #8b5cf6, #7c3aed)', borderRadius: '4px 4px 0 0', height: `${(d.reach / 2.1) * 100}%`, minHeight: 4 }} />
                </div>
                <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentActivity.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: a.type === 'success' ? '#dcfce7' : a.type === 'warning' ? '#fef3c7' : '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                  {a.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.4 }}>{a.text}</p>
                  <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Offers ── */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Active Offers</h3>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Your current campaign offers</p>
          </div>
          <Link href="/portal/business/offers" style={{ fontSize: 12, color: '#0ea5e9', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Offer Title</th>
                <th>Category</th>
                <th>Budget</th>
                <th>Applications</th>
                <th>Target Reach</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOffers.map(offer => (
                <tr key={offer.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#111827', fontSize: 13 }}>{offer.title}</div>
                  </td>
                  <td>
                    <span style={{ background: '#f3f4f6', color: '#374151', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 500 }}>{offer.category}</span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#059669' }}>{offer.budget}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 600, color: '#111827' }}>{offer.applications}</span>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>applicants</span>
                    </div>
                  </td>
                  <td style={{ color: '#6b7280', fontSize: 12 }}>{offer.reach}</td>
                  <td style={{ color: '#6b7280', fontSize: 12 }}>{offer.deadline}</td>
                  <td><StatusBadge status={offer.status} /></td>
                  <td>
                    <Link href="/portal/business/applications" style={{ fontSize: 12, color: '#0ea5e9', fontWeight: 600, textDecoration: 'none' }}>
                      Review →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Top Influencers ── */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Top Performing Influencers</h3>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Based on your past collaborations</p>
          </div>
          <Link href="/portal/business/discover" style={{ fontSize: 12, color: '#0ea5e9', fontWeight: 600, textDecoration: 'none' }}>Discover more →</Link>
        </div>
        <div className="dash-inf-grid">
          {topInfluencers.map(inf => (
            <div key={inf.name} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: inf.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
                  {inf.avatar}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{inf.name}</p>
                  <p style={{ fontSize: 11, color: '#9ca3af' }}>{inf.handle}</p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>Followers</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{inf.followers}</p>
                </div>
                <div>
                  <p style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>Engagement</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>{inf.engagement}</p>
                </div>
                <div>
                  <p style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>Category</p>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{inf.category}</p>
                </div>
              </div>
              <button onClick={() => toggleInvite(inf.name)}
                style={{ width: '100%', padding: '7px', borderRadius: 8, border: `1px solid ${invited.has(inf.name) ? '#059669' : inf.color}`, background: invited.has(inf.name) ? '#dcfce7' : 'transparent', color: invited.has(inf.name) ? '#059669' : inf.color, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                {invited.has(inf.name) ? '✓ Invited' : 'Invite to Campaign'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {inviteMsg && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 99999, background: '#059669', color: '#fff', borderRadius: 12, padding: '12px 20px', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
          ✅ {inviteMsg}
        </div>
      )}

    </div>
  );
}
