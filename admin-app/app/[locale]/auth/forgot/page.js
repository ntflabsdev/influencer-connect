"use client";

import { useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../../../lib/api.js';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await apiFetch('/api/auth/forgot', { method: 'POST', body: { email } });
      setSent(true);
    } catch (err) {
      // API returns success even if email not found (security)
      setSent(true);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 16, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 40, maxWidth: 420, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px' }}>🔐</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Forgot Password?</h2>
          <p style={{ fontSize: 13, color: '#6b7280' }}>Enter your email and we'll send you a reset link</p>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: '#dcfce7', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
              <p style={{ fontSize: 14, color: '#166534', fontWeight: 600 }}>✅ Email sent!</p>
              <p style={{ fontSize: 13, color: '#166534', marginTop: 4 }}>If an account exists with that email, you'll receive a reset link shortly.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link href="/auth/business" style={{ display: 'block', padding: '11px', borderRadius: 10, background: '#0ea5e9', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>
                🏢 Business Login
              </Link>
              <Link href="/auth/influencer" style={{ display: 'block', padding: '11px', borderRadius: 10, background: '#8b5cf6', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>
                ⭐ Influencer Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>

            {error && <div style={{ background: '#fee2e2', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>⚠️ {error}</div>}

            <button type="submit" disabled={loading}
              style={{ padding: '12px', borderRadius: 12, border: 'none', background: loading ? '#e5e7eb' : 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: loading ? '#9ca3af' : '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? '⏳ Sending...' : '📧 Send Reset Link'}
            </button>

            <div style={{ display: 'flex', gap: 10 }}>
              <Link href="/auth/business" style={{ flex: 1, display: 'block', padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', color: '#374151', textDecoration: 'none', fontSize: 13, fontWeight: 500, textAlign: 'center' }}>
                ← Business
              </Link>
              <Link href="/auth/influencer" style={{ flex: 1, display: 'block', padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', color: '#374151', textDecoration: 'none', fontSize: 13, fontWeight: 500, textAlign: 'center' }}>
                ← Influencer
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
