"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../../../components/Button.js';

export default function ProfileLayout({ children }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header with Back Button */}
      <header className="flex items-center justify-between border-b bg-white/90 backdrop-blur px-4 md:px-6 py-4 shadow-sm dark:bg-slate-900/70 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Admin Profile Dropdown - same as main layout */}
          <div className="relative">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                A
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Administrator
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Admin Panel</p>
              </div>
              <span className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium">
                Logout
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Full Width, No Sidebar */}
      <main className="flex-1 p-4 md:p-6 max-w-4xl mx-auto">
        {children}
      </main>
    </div>
  );
}