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
    <div className="min-h-screen flex bg-[#f5f6fa]">
      {/* Desktop Sidebar */}
      <aside className="w-60 bg-[#0f1117] hidden md:flex flex-col h-screen sticky top-0 shrink-0">
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
        <div className="flex-1 overflow-y-auto sidebar-scroll py-3">
          {sideNav ? React.cloneElement(sideNav, { onItemClick: () => {} }) : (
            <nav className="px-3 space-y-0.5">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}
                  className={classnames('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    pathname === item.href ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  )}>
                  <span>{item.icon}</span><span>{item.label}</span>
                </Link>
              ))}
            </nav>
          )}
        </div>
        <div className="px-5 py-3 border-t border-white/5 shrink-0">
          <p className="text-gray-600 text-xs">v0.1.0</p>
        </div>
      </aside>

      {/* Mobile Drawer */}
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
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto sidebar-scroll py-3">
              {sideNav ? React.cloneElement(sideNav, { onItemClick: () => setSidebarOpen(false) }) : null}
            </div>
          </aside>
        </>
      )}

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-3.5 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <p className="text-xs text-gray-400 leading-none">Admin</p>
              <h2 className="text-sm font-semibold text-gray-900 mt-0.5">Control Center</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">{actions}</div>
        </header>
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
