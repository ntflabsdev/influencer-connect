"use client";

import Button from './Button.js';

export default function Pagination({ page, pages, onChange }) {
  if (!pages || pages <= 1) return null;
  return (
    <div className="flex items-center gap-2 text-sm">
      <Button variant="ghost" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Prev
      </Button>
      <span className="text-slate-600">
        Page {page} / {pages}
      </span>
      <Button variant="ghost" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Next
      </Button>
    </div>
  );
}




