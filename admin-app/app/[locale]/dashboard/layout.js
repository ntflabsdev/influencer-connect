"use client";

import { useState } from 'react';
import Link from 'next/link';
import { clearTokens } from '../../../lib/api.js';
import Sidebar from '../../../components/Sidebar.js';
import Notifications from '../../../components/Notifications.js';
import LanguageSwitcher from '../../../components/LanguageSwitcher.js';
import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const t = useTranslations('Common');

  const tabs = [
    { id: 'dashboard',     label: t('dashboard'),    icon: '🏠', href: '/dashboard' },
    { id: 'businesses',    label: t('businesses'),   icon: '🏢', href: '/dashboard/businesses' },
    { id: 'influencers',   label: t('influencers'),  icon: '👥', href: '/dashboard/influencers' },
    { id: 'offers',        label: t('offers'),       icon: '📦', href: '/dashboard/offers' },
    { id: 'kyc',           label: t('kyc'),          icon: '🪪', href: '/dashboard/kyc' },
    { id: 'content',       label: t('content'),      icon: '📝', href: '/dashboard/content' },
    { id: 'disputes',      label: t('disputes'),     icon: '⚖️', href: '/dashboard/disputes' },
    { id: 'tickets',       label: t('tickets'),      icon: '🎫', href: '/dashboard/tickets' },
    { id: 'admins',        label: t('admins'),       icon: '👑', href: '/dashboard/admins' },
    { id: 'activity-logs', label: t('activityLogs'), icon: '📋', href: '/dashboard/activity-logs' },
    { id: 'notifications', label: t('notifications'),icon: '🔔', href: '/dashboard/notifications' },
    { id: 'reports',       label: t('reports'),      icon: '📊', href: '/dashboard/reports' },
    { id: 'settings',      label: t('settings'),     icon: '⚙️', href: '/dashboard/settings' },
    { id: 'stripe',        label: t('stripe'),       icon: '💳', href: '/dashboard/stripe' },
    { id: 'analytics',     label: t('analytics'),    icon: '📈', href: '/dashboard/analytics' },
    { id: 'payments',      label: t('payments'),     icon: '💳', href: '/dashboard/payments' },
    { id: 'subscriptions', label: t('subscriptions'),icon: '💎', href: '/dashboard/subscriptions' },
  ];

  const confirmLogout = () => { clearTokens(); window.location.href = '/'; };

  return (
    <div className="min-h-screen flex bg-[#f5f6fa]">

      {/* ── Desktop Sidebar ── */}
      <aside className="w-60 bg-[#0f1117] hidden md:flex flex-col h-screen sticky top-0 shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-none">Influencer-Connect</p>
              <p className="text-indigo-400 text-xs mt-0.5">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto sidebar-scroll">
          <Sidebar items={tabs} onItemClick={() => {}} />
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/5 shrink-0">
          <p className="text-gray-600 text-xs">v0.1.0</p>
        </div>
      </aside>

      {/* ── Mobile Drawer ── */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed top-0 left-0 z-50 w-60 h-full bg-[#0f1117] flex flex-col md:hidden">
            <div className="px-5 py-5 border-b border-white/5 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white text-sm font-semibold leading-none">Influencer</p>
                  <p className="text-indigo-400 text-xs mt-0.5">Admin Panel</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto sidebar-scroll">
              <Sidebar items={tabs} onItemClick={() => setSidebarOpen(false)} />
            </div>
          </aside>
        </>
      )}

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">

        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-4 md:px-6 h-14 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {/* Breadcrumb style title */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">Admin</span>
              <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="font-semibold text-gray-800">{t('controlCenter')}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <LanguageSwitcher />
            <Notifications />

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  A
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">{t('administrator')}</span>
                <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {profileOpen && createPortal(
                <>
                  <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setProfileOpen(false)} />
                  <div className="fixed right-4 top-16 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden" style={{ zIndex: 9999 }}>
                    {/* Profile header */}
                    <div className="px-4 py-3 bg-gradient-to-br from-indigo-50 to-violet-50 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                          A
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{t('administrator')}</p>
                          <p className="text-xs text-gray-500">superadmin</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-1.5">
                      <button
                        onClick={() => { setProfileOpen(false); window.location.href = '/profile'; }}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {t('profile')}
                      </button>
                      <div className="mx-3 my-1 border-t border-gray-100" />
                      <button
                        onClick={() => { setProfileOpen(false); setLogoutModal(true); }}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {t('logout')}
                      </button>
                    </div>
                  </div>
                </>,
                document.body
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* ── Logout Modal ── */}
      {logoutModal && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">{t('confirmLogout')}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{t('logoutConfirmText')}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setLogoutModal(false)} className="btn btn-secondary flex-1">
                {t('cancel')}
              </button>
              <button onClick={confirmLogout} className="btn btn-danger flex-1">
                {t('logout')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
