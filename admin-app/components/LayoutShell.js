"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import React from 'react';
import classnames from 'classnames';

const navItems = [{ href: '/dashboard', label: 'Dashboard', icon: '📊' }];

export default function LayoutShell({ actions, children, sideNav }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white/70 dark:bg-slate-900/60 backdrop-blur border-r border-slate-200/80 dark:border-slate-800/80 hidden md:flex flex-col h-screen sticky top-0">
        <div className="px-4 py-4 border-b border-slate-200/70 dark:border-slate-800/70 flex-shrink-0">
          <h1 className="text-lg font-semibold">Influencer Connect</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Admin panel</p>
        </div>
        <div className="flex-1 overflow-y-auto sidebar-scroll">
          {sideNav ? (
            // Clone sideNav element and add onItemClick prop
            React.cloneElement(sideNav, { onItemClick: () => {} })
          ) : (
            <nav className="px-2 py-4 space-y-1">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={classnames(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
                      active
                        ? 'bg-gradient-to-r from-indigo-100 to-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm dark:from-indigo-500/20 dark:to-indigo-500/10 dark:text-indigo-100 dark:border-indigo-500/30'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/80',
                    )}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}
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
                <p className="text-xs text-slate-500 dark:text-slate-400">Admin panel</p>
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
              {sideNav ? (
                // Clone sideNav element and add onItemClick prop to close drawer
                React.cloneElement(sideNav, { onItemClick: () => setSidebarOpen(false) })
              ) : (
                <nav className="px-2 py-4 space-y-1">
                  {navItems.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={classnames(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
                          active
                            ? 'bg-gradient-to-r from-indigo-100 to-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm dark:from-indigo-500/20 dark:to-indigo-500/10 dark:text-indigo-100 dark:border-indigo-500/30'
                            : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/80',
                        )}
                      >
                        <span className="text-base">{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              )}
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
              <p className="text-sm text-slate-500 dark:text-slate-400">Admin</p>
              <h2 className="text-lg font-semibold">Control Center</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">{actions}</div>
        </header>
        <main className="flex-1 p-4 md:p-6 max-w-6xl w-full mx-auto space-y-4 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

