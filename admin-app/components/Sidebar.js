"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'classnames';

export default function Sidebar({ items, onItemClick }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-2 py-4 space-y-1">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={onItemClick}
            className={clsx(
              'w-full text-left flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
              isActive
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
  );
}




