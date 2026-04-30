'use client';

import { useState, useEffect } from 'react';
import { softBlueColors } from '../../../components/DesignSystem.js';
import { adminApi } from '../../../lib/api.js';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

// ── Dummy Data (India) ──
const DUMMY_STATS = {
  influencers: 15284,
  businesses: 3847,
};

const DUMMY_BUSINESS = {
  overview: { totalUsers: 3847, activeUsers: 3289, newUsersInPeriod: 342, pendingUsers: 118 },
  offers: [
    { _id: 'published', count: 1240 },
    { _id: 'draft', count: 380 },
    { _id: 'closed', count: 670 },
  ],
  revenue: { total: 48200000, transactions: 3120 },
  applicationTrends: [
    { _id: '2026-06-05', count: 380 },
    { _id: '2026-06-06', count: 520 },
    { _id: '2026-06-07', count: 610 },
    { _id: '2026-06-08', count: 470 },
    { _id: '2026-06-09', count: 740 },
  ],
};

const DUMMY_INFLUENCER = {
  overview: { totalUsers: 15284, activeUsers: 13102, verifiedUsers: 8847, newUsersInPeriod: 1560, pendingUsers: 630 },
  applications: [
    { _id: 'applied', count: 6210 },
    { _id: 'approved', count: 8470 },
    { _id: 'rejected', count: 1890 },
    { _id: 'completed', count: 4120 },
  ],
  applicationTrends: [
    { _id: '2026-06-05', count: 420 },
    { _id: '2026-06-06', count: 580 },
    { _id: '2026-06-07', count: 710 },
    { _id: '2026-06-08', count: 650 },
    { _id: '2026-06-09', count: 890 },
  ],
};

const RECENT_ACTIVITY = [
  { icon: '✅', text: 'Priya Sharma approved as influencer', time: '2 min ago', type: 'success' },
  { icon: '🏢', text: 'Mamaearth India registered — pending review', time: '15 min ago', type: 'info' },
  { icon: '📦', text: 'New offer "Diwali Fashion Campaign" posted', time: '1 hour ago', type: 'info' },
  { icon: '⚖️', text: 'Dispute #D-005 filed by Nykaa', time: '2 hours ago', type: 'warning' },
  { icon: '💰', text: '₹35,000 payment released to Rahul Verma', time: '3 hours ago', type: 'success' },
  { icon: '🚫', text: 'FakeFollowers.in account suspended', time: '5 hours ago', type: 'danger' },
];

export default function DashboardPage() {
  const t = useTranslations('DashboardHome');
  const tAnalytics = useTranslations('Analytics');
  const tTimeFilters = useTranslations('TimeFilters');
  const [stats, setStats] = useState(DUMMY_STATS);
  const [businessStats, setBusinessStats] = useState(DUMMY_BUSINESS);
  const [influencerStats, setInfluencerStats] = useState(DUMMY_INFLUENCER);
  const [loading, setLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState('30d');

  const timeFilters = [
    { value: 'today', label: tTimeFilters('today') },
    { value: '7d',    label: tTimeFilters('7d') },
    { value: '30d',   label: tTimeFilters('30d') },
    { value: '60d',   label: tTimeFilters('60d') },
    { value: '90d',   label: tTimeFilters('90d') },
  ];

  useEffect(() => { fetchStats(); }, [timeFilter]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [summaryRes, businessRes, influencerRes] = await Promise.all([
        adminApi('/analytics/summary'),
        adminApi(`/analytics/user-type?userType=business&period=${timeFilter}`),
        adminApi(`/analytics/user-type?userType=influencer&period=${timeFilter}`)
      ]);
      setStats(summaryRes);
      setBusinessStats(businessRes);
      setInfluencerStats(influencerRes);
    } catch {
      // Keep dummy data on API failure
    } finally {
      setLoading(false);
    }
  };

  // ── Mini Components ──
  const StatCard = ({ title, value, icon, subtitle, accent = softBlueColors.primary, accentBg = softBlueColors.primaryLight }) => (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 12, color: '#6b7280', fontWeight: 500, marginBottom: 8 }}>{title}</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#111827', lineHeight: 1, marginBottom: 6 }}>{value ?? 0}</p>
          {subtitle && <p style={{ fontSize: 12, color: '#9ca3af' }}>{subtitle}</p>}
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
          {icon}
        </div>
      </div>
    </div>
  );

  const SectionHeader = ({ icon, title, accentBg = '#eef2ff' }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{icon}</div>
      <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>{title}</h2>
    </div>
  );

  const StatRow = ({ label, value, color = '#4f46e5', bg = '#eef2ff' }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: bg, borderRadius: 10 }}>
      <span style={{ fontSize: 13, color: '#374151' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color }}>{value}</span>
    </div>
  );

  const totalUsers = (stats?.influencers || 0) + (stats?.businesses || 0);
  const activeOffers = businessStats?.offers?.find(s => s._id === 'published')?.count || 0;
  const pendingApps = influencerStats?.applications?.find(s => s._id === 'applied')?.count || 0;
  const revenue = businessStats?.revenue?.total || 0;
  const approvedApps = influencerStats?.applications?.find(a => a._id === 'approved')?.count || 0;
  const totalApps = influencerStats?.applications?.reduce((s, a) => s + a.count, 0) || 0;
  const successRate = totalApps > 0 ? Math.round((approvedApps / totalApps) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── Welcome Banner ── */}
      <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #6366f1 100%)', borderRadius: 20, padding: '28px 32px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -20, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div className="dash-banner-inner" style={{ position: 'relative', zIndex: 1 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{t('welcome')} 👋</h1>
            <p style={{ fontSize: 14, opacity: 0.85, marginBottom: 14 }}>{t('welcomeSub')}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 0 2px rgba(74,222,128,0.3)' }} />
              <span style={{ fontSize: 13, opacity: 0.9 }}>{t('systemsOperational')}</span>
              {loading && <span style={{ fontSize: 12, opacity: 0.7, marginLeft: 8 }}>🔄 Syncing...</span>}
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {timeFilters.map(f => (
              <button key={f.value} onClick={() => setTimeFilter(f.value)} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', background: timeFilter === f.value ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)', color: '#fff', transition: 'all 0.15s' }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Top KPI Cards ── */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Platform Overview</p>
        <div className="dash-stats-grid">
          <StatCard title={t('totalUsers')} value={totalUsers.toLocaleString()}
            subtitle={`${stats?.influencers?.toLocaleString() || 0} influencers · ${stats?.businesses?.toLocaleString() || 0} businesses`}
            icon="👥" accent={softBlueColors.primary} accentBg={softBlueColors.primaryLight} />
          <StatCard title={t('activeOffers')} value={activeOffers.toLocaleString()}
            subtitle={`${businessStats?.offers?.reduce((s, o) => s + o.count, 0) || 0} total offers`}
            icon="📦" accent={softBlueColors.success} accentBg={softBlueColors.successLight} />
          <StatCard title={t('pendingApplications')} value={pendingApps.toLocaleString()}
            subtitle={`${approvedApps.toLocaleString()} approved`}
            icon="📝" accent={softBlueColors.warning} accentBg={softBlueColors.warningLight} />
          <StatCard title={t('revenue')} value={`₹${(revenue / 100000).toFixed(1)}L`}
            subtitle={`${businessStats?.revenue?.transactions || 0} transactions`}
            icon="💰" accent={softBlueColors.secondary} accentBg={softBlueColors.secondaryLight} />
        </div>
      </div>

      {/* ── Quick Stats Row ── */}
      <div className="dash-quick-stats">
        {[
          { label: 'Pending KYC', value: '14', icon: '🪪', color: '#d97706', bg: '#fef9c3' },
          { label: 'Open Disputes', value: '5', icon: '⚖️', color: '#dc2626', bg: '#fee2e2' },
          { label: 'Open Tickets', value: '7', icon: '🎫', color: '#7c3aed', bg: '#ede9fe' },
          { label: 'Pending Content', value: '23', icon: '📝', color: '#0ea5e9', bg: '#e0f2fe' },
          { label: 'Success Rate', value: `${successRate}%`, icon: '🎯', color: '#059669', bg: '#dcfce7' },
          { label: 'Verified Users', value: (influencerStats?.overview?.verifiedUsers || 0).toLocaleString(), icon: '✅', color: '#059669', bg: '#dcfce7' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{s.icon}</div>
              <div>
                <p style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>{s.label}</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Content Grid ── */}
      <div className="dash-main-grid">

        {/* Left: Analytics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Business Analytics */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24 }}>
            <SectionHeader icon="🏢" title={t('businessAnalytics')} accentBg="#dbeafe" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Total Businesses', value: businessStats?.overview?.totalUsers || 0, color: '#0ea5e9', bg: '#e0f2fe' },
                { label: 'Active', value: businessStats?.overview?.activeUsers || 0, color: '#059669', bg: '#dcfce7' },
                { label: 'New This Period', value: businessStats?.overview?.newUsersInPeriod || 0, color: '#7c3aed', bg: '#ede9fe' },
                { label: 'Pending Review', value: businessStats?.overview?.pendingUsers || 0, color: '#d97706', bg: '#fef9c3' },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 10, color: '#6b7280', marginBottom: 4 }}>{s.label}</p>
                  <p style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value.toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <StatRow label="Published Offers" value={businessStats?.offers?.find(o => o._id === 'published')?.count || 0} color="#059669" bg="#f0fdf4" />
              <StatRow label="Draft Offers" value={businessStats?.offers?.find(o => o._id === 'draft')?.count || 0} color="#d97706" bg="#fffbeb" />
              <StatRow label="Total Revenue" value={`₹${((businessStats?.revenue?.total || 0) / 100000).toFixed(1)}L`} color="#7c3aed" bg="#faf5ff" />
              <StatRow label="Transactions" value={businessStats?.revenue?.transactions || 0} color="#0ea5e9" bg="#f0f9ff" />
            </div>
          </div>

          {/* Influencer Analytics */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24 }}>
            <SectionHeader icon="👥" title={t('influencerAnalytics')} accentBg="#dcfce7" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Total Influencers', value: influencerStats?.overview?.totalUsers || 0, color: '#0ea5e9', bg: '#e0f2fe' },
                { label: 'Verified', value: influencerStats?.overview?.verifiedUsers || 0, color: '#059669', bg: '#dcfce7' },
                { label: 'New This Period', value: influencerStats?.overview?.newUsersInPeriod || 0, color: '#7c3aed', bg: '#ede9fe' },
                { label: 'Pending Review', value: influencerStats?.overview?.pendingUsers || 0, color: '#d97706', bg: '#fef9c3' },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 10, color: '#6b7280', marginBottom: 4 }}>{s.label}</p>
                  <p style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value.toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <StatRow label="Total Applications" value={(influencerStats?.applications?.reduce((s, a) => s + a.count, 0) || 0).toLocaleString()} color="#374151" bg="#f9fafb" />
              <StatRow label="Approved" value={(influencerStats?.applications?.find(a => a._id === 'approved')?.count || 0).toLocaleString()} color="#059669" bg="#f0fdf4" />
              <StatRow label="Pending" value={(influencerStats?.applications?.find(a => a._id === 'applied')?.count || 0).toLocaleString()} color="#d97706" bg="#fffbeb" />
              <StatRow label="Success Rate" value={`${successRate}%`} color="#7c3aed" bg="#faf5ff" />
            </div>
          </div>

          {/* Application Trends */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>📈 Application Trends (Last 5 Days)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 10 }}>
              {(influencerStats?.applicationTrends || DUMMY_INFLUENCER.applicationTrends).map((d, i) => {
                const maxCount = Math.max(...(influencerStats?.applicationTrends || DUMMY_INFLUENCER.applicationTrends).map(x => x.count));
                const pct = maxCount > 0 ? (d.count / maxCount) * 100 : 0;
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#4f46e5' }}>{d.count}</span>
                    <div style={{ width: '100%', height: 80, background: '#f3f4f6', borderRadius: 6, display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                      <div style={{ width: '100%', height: `${pct}%`, background: 'linear-gradient(180deg, #818cf8, #4f46e5)', borderRadius: '4px 4px 0 0', minHeight: 4 }} />
                    </div>
                    <span style={{ fontSize: 10, color: '#9ca3af' }}>{new Date(d._id).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Activity Feed + Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Quick Actions */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 14 }}>⚡ Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Review Pending Users', href: '/dashboard/businesses', icon: '👥', color: '#0ea5e9', bg: '#e0f2fe' },
                { label: 'Review KYC Docs', href: '/dashboard/kyc', icon: '🪪', color: '#7c3aed', bg: '#ede9fe' },
                { label: 'Moderate Content', href: '/dashboard/content', icon: '📝', color: '#d97706', bg: '#fef9c3' },
                { label: 'Open Disputes', href: '/dashboard/disputes', icon: '⚖️', color: '#dc2626', bg: '#fee2e2' },
                { label: 'Support Tickets', href: '/dashboard/tickets', icon: '🎫', color: '#059669', bg: '#dcfce7' },
                { label: 'View Analytics', href: '/dashboard/analytics', icon: '📊', color: '#4f46e5', bg: '#eef2ff' },
              ].map(a => (
                <Link key={a.label} href={a.href}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: '1px solid #f3f4f6', textDecoration: 'none', transition: 'all 0.15s', background: '#fafafa' }}
                  onMouseEnter={e => { e.currentTarget.style.background = a.bg; e.currentTarget.style.borderColor = a.color + '44'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fafafa'; e.currentTarget.style.borderColor = '#f3f4f6'; }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{a.icon}</div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{a.label}</span>
                  <svg style={{ marginLeft: 'auto', width: 14, height: 14, color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 14 }}>🕐 Recent Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {RECENT_ACTIVITY.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: a.type === 'success' ? '#dcfce7' : a.type === 'warning' ? '#fef9c3' : a.type === 'danger' ? '#fee2e2' : '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                    {a.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.4 }}>{a.text}</p>
                    <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Health */}
          <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: 16, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 14 }}>💚 Platform Health</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'API Uptime', value: '99.9%' },
                { label: 'Avg Response', value: '142ms' },
                { label: 'Active Sessions', value: '1,284' },
                { label: 'Error Rate', value: '0.02%' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{s.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
