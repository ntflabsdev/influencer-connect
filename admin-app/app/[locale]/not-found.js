"use client";

import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#f5f6fa', fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>🔍</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
          Page Not Found
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 28, lineHeight: 1.6 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link href="/dashboard"
            style={{
              padding: '10px 20px', borderRadius: 10, background: '#4f46e5',
              color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600
            }}>
            Go to Dashboard
          </Link>
          <Link href="/"
            style={{
              padding: '10px 20px', borderRadius: 10, border: '1px solid #e5e7eb',
              background: '#fff', color: '#374151', textDecoration: 'none',
              fontSize: 14, fontWeight: 600
            }}>
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
