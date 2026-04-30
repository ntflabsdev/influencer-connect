"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { clearTokens, getToken } from '../../../lib/api.js';
import LanguageSwitcher from '../../../components/LanguageSwitcher.js';

// ── Role Config ──
const ROLES = {
  business: {
    label: 'Business',
    color: '#0ea5e9',
    gradient: 'from-sky-600 to-blue-700',
    accent: '#0ea5e9',
    accentLight: '#e0f2fe',
    icon: '🏢',
    badge: 'bg-sky-100 text-sky-700',
  },
  influencer: {
    label: 'Influencer',
    color: '#8b5cf6',
    gradient: 'from-violet-600 to-purple-700',
    accent: '#8b5cf6',
    accentLight: '#ede9fe',
    icon: '⭐',
    badge: 'bg-violet-100 text-violet-700',
  },
};

// ── Nav Items per role ──
const NAV = {
  business: [
    { group: 'Overview', items: [
      { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/portal/business' },
      { id: 'analytics', label: 'Analytics', icon: '📈', href: '/portal/business/analytics' },
    ]},
    { group: 'Campaigns', items: [
      { id: 'offers', label: 'My Offers', icon: '📦', href: '/portal/business/offers' },
      { id: 'applications', label: 'Applications', icon: '📋', href: '/portal/business/applications' },
      { id: 'campaigns', label: 'Campaigns', icon: '🚀', href: '/portal/business/campaigns' },
    ]},
    { group: 'Influencers', items: [
      { id: 'discover', label: 'Discover', icon: '🔍', href: '/portal/business/discover' },
      { id: 'collaborations', label: 'Collaborations', icon: '🤝', href: '/portal/business/collaborations' },
    ]},
    { group: 'Finance', items: [
      { id: 'payments', label: 'Payments', icon: '💳', href: '/portal/business/payments' },
      { id: 'invoices', label: 'Invoices', icon: '🧾', href: '/portal/business/invoices' },
    ]},
    { group: 'Account', items: [
      { id: 'profile', label: 'Profile', icon: '👤', href: '/portal/business/profile' },
      { id: 'settings', label: 'Settings', icon: '⚙️', href: '/portal/business/settings' },
    ]},
  ],
  influencer: [
    { group: 'Overview', items: [
      { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/portal/influencer' },
      { id: 'analytics', label: 'Analytics', icon: '📈', href: '/portal/influencer/analytics' },
    ]},
    { group: 'Work', items: [
      { id: 'offers', label: 'Browse Offers', icon: '🔍', href: '/portal/influencer/offers' },
      { id: 'applications', label: 'My Applications', icon: '📋', href: '/portal/influencer/applications' },
      { id: 'campaigns', label: 'Active Campaigns', icon: '🚀', href: '/portal/influencer/campaigns' },
    ]},
    { group: 'Content', items: [
      { id: 'portfolio', label: 'Portfolio', icon: '🎨', href: '/portal/influencer/portfolio' },
      { id: 'reviews', label: 'Reviews', icon: '⭐', href: '/portal/influencer/reviews' },
    ]},
    { group: 'Finance', items: [
      { id: 'earnings', label: 'Earnings', icon: '💰', href: '/portal/influencer/earnings' },
      { id: 'payouts', label: 'Payouts', icon: '💳', href: '/portal/influencer/payouts' },
    ]},
    { group: 'Account', items: [
      { id: 'profile', label: 'Profile', icon: '👤', href: '/portal/influencer/profile' },
      { id: 'settings', label: 'Settings', icon: '⚙️', href: '/portal/influencer/settings' },
    ]},
  ],
};

function SidebarNav({ role, onItemClick }) {
  const pathname = usePathname();
  const cfg = ROLES[role];
  const groups = NAV[role] || [];

  // Strip locale prefix (e.g. /en/portal/business → /portal/business)
  const normalizedPathname = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?(\/|$)/, '/');

  return (
    <nav style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {groups.map(group => (
        <div key={group.group}>
          <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4b5563', padding: '0 10px', marginBottom: 6 }}>
            {group.group}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {group.items.map(item => {
              const isActive =
                normalizedPathname === item.href ||
                (item.href !== `/portal/${role}` && normalizedPathname.startsWith(item.href + '/')) ||
                (item.href !== `/portal/${role}` && normalizedPathname === item.href);
              return (
                <Link key={item.id} href={item.href} onClick={onItemClick}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 8,
                    fontSize: 13, fontWeight: 500, textDecoration: 'none',
                    background: isActive ? cfg.accent : 'transparent',
                    color: isActive ? '#ffffff' : '#9ca3af',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff'; }}}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af'; }}}
                >
                  <span style={{ fontSize: 15 }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {isActive && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', flexShrink: 0 }} />}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export default function PortalLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Auth guard — redirect to appropriate login if no token
    const token = getToken();
    if (!token) {
      const role = pathname.includes('/portal/influencer') ? 'influencer' : 'business';
      router.replace(`/auth/${role}`);
      return;
    }
    setAuthChecked(true);
  }, []);

  if (!authChecked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f6fa' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Detect role from URL
  const role = pathname.includes('/portal/influencer') ? 'influencer' : 'business';
  const cfg = ROLES[role];

  // Read user data from localStorage
  const storedUser = mounted && typeof window !== 'undefined' ? (() => { try { return JSON.parse(localStorage.getItem('userData') || '{}'); } catch { return {}; } })() : {};

  // User data per role with fallback
  const user = role === 'business'
    ? { name: storedUser.businessName || storedUser.name || 'Business Account', email: storedUser.email || '', avatar: (storedUser.businessName || storedUser.name || 'B').charAt(0).toUpperCase(), plan: 'Business Portal' }
    : { name: storedUser.name || 'Creator Account', email: storedUser.email || '', avatar: (storedUser.name || 'C').charAt(0).toUpperCase(), plan: 'Creator Portal' };

  const confirmLogout = () => {
    clearTokens();
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    const role = pathname.includes('/portal/influencer') ? 'influencer' : 'business';
    window.location.href = `/auth/${role}`;
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: cfg.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
            {cfg.icon}
          </div>
          <div>
            <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, lineHeight: 1 }}>Influencer-Connect</p>
            <p style={{ color: cfg.accent, fontSize: 11, marginTop: 2 }}>{cfg.label} Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto sidebar-scroll">
        <SidebarNav role={role} onItemClick={() => setSidebarOpen(false)} />
      </div>

      {/* User Footer */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: cfg.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
            {user.avatar}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: '#e5e7eb', fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
            <p style={{ color: '#6b7280', fontSize: 10, marginTop: 1 }}>{user.plan}</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-[#f5f6fa]">

      {/* Desktop Sidebar */}
      <aside className="w-60 bg-[#0f1117] hidden md:flex flex-col h-screen sticky top-0 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {sidebarOpen && mounted && createPortal(
        <>
          <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed top-0 left-0 z-50 w-60 h-full bg-[#0f1117] flex flex-col md:hidden">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: cfg.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                  {cfg.icon}
                </div>
                <p style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{cfg.label} Portal</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto sidebar-scroll">
              <SidebarNav role={role} onItemClick={() => setSidebarOpen(false)} />
            </div>
          </aside>
        </>,
        document.body
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">

        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-4 md:px-6 h-14 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">Portal</span>
              <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="font-semibold text-gray-800">{cfg.label} Dashboard</span>
            </div>
            <span className={`hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.badge}`}>
              {cfg.icon} {cfg.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <LanguageSwitcher />

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ background: cfg.accent }}>
                  {user.avatar}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">{user.name}</span>
                <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {profileOpen && mounted && createPortal(
                <>
                  <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setProfileOpen(false)} />
                  <div className="fixed right-4 top-16 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden" style={{ zIndex: 9999 }}>
                    <div className="px-4 py-3 border-b border-gray-100" style={{ background: `linear-gradient(135deg, ${cfg.accentLight}, #fff)` }}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: cfg.accent }}>
                          {user.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.plan}</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-1.5">
                      <Link href={`/portal/${role}/profile`} onClick={() => setProfileOpen(false)}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Profile
                      </Link>
                      <Link href={`/portal/${role}/settings`} onClick={() => setProfileOpen(false)}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </Link>
                      <div className="mx-3 my-1 border-t border-gray-100" />
                      <button onClick={() => { setProfileOpen(false); setLogoutModal(true); }}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                </>,
                document.body
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Logout Modal */}
      {logoutModal && mounted && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Confirm Logout</h3>
                <p className="text-sm text-gray-500 mt-0.5">Are you sure you want to logout?</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setLogoutModal(false)} className="btn btn-secondary flex-1">Cancel</button>
              <button onClick={confirmLogout} className="btn btn-danger flex-1">Logout</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
