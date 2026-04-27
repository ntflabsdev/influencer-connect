"use client";

import { useState, useEffect } from 'react';
import { adminApi, clearTokens, getToken } from '../../../lib/api.js';
import Sidebar from '../../../components/Sidebar.js';
import Button from '../../../components/Button.js';
import Notifications from '../../../components/Notifications.js';
import LanguageSwitcher from '../../../components/LanguageSwitcher.js';
import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const t = useTranslations('Common');

  const tabs = [
    { id: 'dashboard', label: t('dashboard'), icon: '🏠', href: '/dashboard' },
    { id: 'businesses', label: t('businesses'), icon: '🏢', href: '/dashboard/businesses' },
    { id: 'influencers', label: t('influencers'), icon: '👥', href: '/dashboard/influencers' },
    { id: 'offers', label: t('offers'), icon: '📦', href: '/dashboard/offers' },
    { id: 'kyc', label: t('kyc'), icon: '🪪', href: '/dashboard/kyc' },
    { id: 'content', label: t('content'), icon: '📝', href: '/dashboard/content' },
    { id: 'disputes', label: t('disputes'), icon: '⚖️', href: '/dashboard/disputes' },
    { id: 'tickets', label: t('tickets'), icon: '🎫', href: '/dashboard/tickets' },
    { id: 'admins', label: t('admins'), icon: '👑', href: '/dashboard/admins' },
    { id: 'activity-logs', label: t('activityLogs'), icon: '📋', href: '/dashboard/activity-logs' },
    { id: 'notifications', label: t('notifications'), icon: '🔔', href: '/dashboard/notifications' },
    { id: 'reports', label: t('reports'), icon: '📊', href: '/dashboard/reports' },
    { id: 'settings', label: t('settings'), icon: '⚙️', href: '/dashboard/settings' },
    { id: 'stripe', label: t('stripe'), icon: '💳', href: '/dashboard/stripe' },
    { id: 'analytics', label: t('analytics'), icon: '📈', href: '/dashboard/analytics' },
    { id: 'payments', label: t('payments'), icon: '💳', href: '/dashboard/payments' },
    { id: 'subscriptions', label: t('subscriptions'), icon: '💎', href: '/dashboard/subscriptions' }
  ];

  const handleLogout = () => {
    setLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    clearTokens();
    window.location.href = '/';
  };

  const navigateToProfile = () => {
    setProfileDropdownOpen(false);
    window.location.href = '/profile';
  };

  const sideNav = <Sidebar items={tabs} onItemClick={() => setSidebarOpen(false)} />;

  return (
    <div className="min-h-screen flex text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white/70 dark:bg-slate-900/60 backdrop-blur border-r border-slate-200/80 dark:border-slate-800/80 hidden md:flex flex-col h-screen sticky top-0">
        <div className="px-4 py-4 border-b border-slate-200/70 dark:border-slate-800/70 flex-shrink-0">
          <h1 className="text-lg font-semibold">Influencer Connect</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('admin')} panel</p>
        </div>
        <div className="flex-1 overflow-y-auto sidebar-scroll">
          {sideNav}
        </div>
        <div className="px-4 py-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
          v0.1
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <aside className="fixed top-0 left-0 z-50 w-64 h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col md:hidden">
            <div className="px-4 py-4 border-b border-slate-200/70 dark:border-slate-800/70 flex-shrink-0 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold">Influencer Connect</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('admin')} panel</p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto sidebar-scroll">
              {sideNav}
            </div>
            <div className="px-4 py-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
              v0.1
            </div>
          </aside>
        </>
      )}

      <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-100 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 min-h-screen">
        <header className="flex items-center justify-between border-b bg-white/90 backdrop-blur px-4 md:px-6 py-4 shadow-sm dark:bg-slate-900/70 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Open sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('admin')}</p>
              <h2 className="text-lg font-semibold">{t('controlCenter')}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Notifications */}
            <Notifications />

            {/* Admin Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  A
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {t('administrator')}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('admin')} Panel</p>
                </div>
                <svg
                  className={`w-4 h-4 text-slate-500 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && createPortal(
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0"
                    style={{ zIndex: 2147483646 }}
                    onClick={() => setProfileDropdownOpen(false)}
                  />

                  {/* Dropdown */}
                  <div
                    className="fixed right-4 top-20 w-56 min-h-[160px] max-h-[240px] overflow-visible bg-white dark:bg-slate-800 rounded-lg shadow-2xl border-2 border-slate-200 dark:border-slate-700"
                    style={{ zIndex: 2147483647 }}
                  >
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          A
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {t('administrator')}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            admin@example.com
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      <button
                        onClick={navigateToProfile}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {t('profile')}
                      </button>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3"
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
        <main className="flex-1 p-4 md:p-6 max-w-6xl w-full mx-auto space-y-4 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {logoutModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" style={{ zIndex: 2147483645 }}>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {t('confirmLogout')}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {t('logoutConfirmText')}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setLogoutModalOpen(false)}
                  className="flex-1"
                >
                  {t('cancel')}
                </Button>
                <Button
                  variant="danger"
                  onClick={confirmLogout}
                  className="flex-1"
                >
                  {t('logout')}
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}