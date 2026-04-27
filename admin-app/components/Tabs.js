"use client";

import clsx from 'classnames';

export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-2 mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={clsx('btn-ghost', active === tab.id && 'bg-indigo-50 text-indigo-700 border border-indigo-200')}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}




