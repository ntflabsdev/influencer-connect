"use client";

import Link from 'next/link';
import { useEffect } from 'react';
import { getToken } from '../../../lib/api.js';
import { useRouter } from 'next/navigation';

export default function AuthLandingPage() {
  const router = useRouter();

  useEffect(() => {
    // If already logged in, redirect based on stored role
    if (getToken()) {
      const role = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
      if (role === 'business') router.replace('/portal/business');
      else if (role === 'influencer') router.replace('/portal/influencer');
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', padding: 24, fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>⚡</div>
          <div>
            <p style={{ fontSize: 18, fontWeight: 800, color: '#111827', lineHeight: 1 }}>Influencer Connect</p>
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>The platform for creators & brands</p>
          </div>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#111827', marginBottom: 10, lineHeight: 1.2 }}>
          Who are you?
        </h1>
        <p style={{ fontSize: 15, color: '#6b7280', maxWidth: 400 }}>
          Choose your account type to get started. Each portal is tailored to your needs.
        </p>
      </div>

      {/* Role Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, width: '100%', maxWidth: 640 }}>

        {/* Business Card */}
        <Link href="/auth/business" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, border: '2px solid #e0f2fe', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(14,165,233,0.08)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(14,165,233,0.18)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e0f2fe'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(14,165,233,0.08)'; }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 20 }}>
              🏢
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>I'm a Business</h2>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, marginBottom: 20 }}>
              Post campaigns, find influencers, and grow your brand reach with data-driven collaborations.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
              {['🚀 Launch influencer campaigns', '🎯 AI-matched creator discovery', '📊 Real-time ROI analytics'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, color: '#374151' }}>{f}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0ea5e9' }}>Get Started →</span>
              <span style={{ background: '#e0f2fe', color: '#0369a1', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 600 }}>Business Portal</span>
            </div>
          </div>
        </Link>

        {/* Influencer Card */}
        <Link href="/auth/influencer" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, border: '2px solid #ede9fe', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(139,92,246,0.08)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#8b5cf6'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(139,92,246,0.18)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#ede9fe'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(139,92,246,0.08)'; }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 20 }}>
              ⭐
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>I'm a Creator</h2>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, marginBottom: 20 }}>
              Apply to brand campaigns, earn from collaborations, and grow your influence with the right partners.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
              {['💰 Earn from brand deals', '🎨 Showcase your portfolio', '📈 Track your performance'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, color: '#374151' }}>{f}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#8b5cf6' }}>Get Started →</span>
              <span style={{ background: '#ede9fe', color: '#6d28d9', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 600 }}>Creator Portal</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 32, marginTop: 48, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { n: '15,000+', l: 'Active Creators' },
          { n: '3,200+', l: 'Brands' },
          { n: '₹12 Cr+', l: 'Creators Ko Mila' },
          { n: '98%', l: 'Satisfaction Rate' },
        ].map(s => (
          <div key={s.l} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>{s.n}</p>
            <p style={{ fontSize: 12, color: '#9ca3af' }}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* Admin link */}
      <p style={{ marginTop: 40, fontSize: 13, color: '#9ca3af' }}>
        Admin?{' '}
        <Link href="/" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 600 }}>Admin Panel →</Link>
      </p>
    </div>
  );
}
