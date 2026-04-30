"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, setTokens } from '../../../../lib/api.js';

const CATEGORIES = [
  'Fashion & Style', 'Food & Cooking', 'Beauty & Skincare', 'Health & Fitness',
  'Travel & Vlog', 'Technology', 'Gaming', 'Comedy & Entertainment',
  'Education & Motivation', 'Finance & Investment', 'Parenting & Family',
  'Music & Dance', 'Sports & Cricket', 'Spirituality & Yoga', 'Lifestyle', 'Other'
];

export default function InfluencerAuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [status, setStatus] = useState(null);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({
    email: '', password: '', confirmPassword: '',
    name: '', phone: '',
    meta: { instagram: '', youtube: '', moj: '', followers: '', categories: [] },
    acceptTerms: false,
  });

  const toggleCategory = (cat) => {
    setRegForm(prev => ({
      ...prev,
      meta: {
        ...prev.meta,
        categories: prev.meta.categories.includes(cat)
          ? prev.meta.categories.filter(c => c !== cat)
          : [...prev.meta.categories, cat]
      }
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const data = await apiFetch('/api/auth/influencer/login', { method: 'POST', body: loginForm });
      setTokens(data.accessToken, data.refreshToken);
      localStorage.setItem('userRole', 'influencer');
      localStorage.setItem('userData', JSON.stringify(data.user));
      router.push('/portal/influencer');
    } catch (err) {
      if (err.status === 403) {
        setStatus(err.message?.includes('pending') ? 'pending' : 'suspended');
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (regForm.password !== regForm.confirmPassword) { setError('Passwords do not match'); return; }
    if (!regForm.acceptTerms) { setError('Please accept the terms and conditions'); return; }
    setLoading(true); setError('');
    try {
      const payload = {
        email: regForm.email,
        password: regForm.password,
        name: regForm.name,
        phone: regForm.phone || undefined,
        meta: {
          instagram: regForm.meta.instagram || undefined,
          youtube: regForm.meta.youtube || undefined,
          moj: regForm.meta.moj || undefined,
          followers: regForm.meta.followers ? parseInt(regForm.meta.followers) : undefined,
          categories: regForm.meta.categories.length > 0 ? regForm.meta.categories : undefined,
        },
        acceptTerms: regForm.acceptTerms,
      };
      const data = await apiFetch('/api/auth/influencer/register', { method: 'POST', body: payload });
      setTokens(data.accessToken, data.refreshToken);
      localStorage.setItem('userRole', 'influencer');
      localStorage.setItem('userData', JSON.stringify(data.user));
      setStatus('pending');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  if (status === 'pending') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%)', padding: 16, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: 48, maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, margin: '0 auto 24px' }}>⏳</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Profile Under Review</h2>
          <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 24 }}>
            Your influencer profile has been submitted. Our team will review and approve it within 24–48 hours. You will receive an email notification once approved.
          </p>
          <div style={{ background: '#faf5ff', borderRadius: 12, padding: '14px 20px', marginBottom: 24, textAlign: 'left' }}>
            <p style={{ fontSize: 13, color: '#7c3aed', fontWeight: 600, marginBottom: 6 }}>While you wait...</p>
            <ul style={{ fontSize: 13, color: '#374151', lineHeight: 1.8, paddingLeft: 16 }}>
              <li>Prepare your portfolio content</li>
              <li>Connect your social media accounts</li>
              <li>Browse available offers after approval</li>
            </ul>
          </div>
          <button onClick={() => { setStatus(null); setMode('login'); }}
            style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (status === 'suspended') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #fff1f2 0%, #fee2e2 100%)', padding: 16, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: 48, maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, margin: '0 auto 24px' }}>🚫</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Account Suspended</h2>
          <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 24 }}>
            Your influencer account has been suspended. Please contact our support team to understand the reason and appeal the decision.
          </p>
          <a href="mailto:support@influencerconnect.in"
            style={{ display: 'block', width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: '#dc2626', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box' }}>
            Contact Support
          </a>
        </div>
      </div>
    );
  }

  const inputStyle = { width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#111827', background: '#fff' };
  const labelStyle = { fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Left Panel */}
      <div style={{ display: 'none', flex: 1, position: 'relative', padding: 48, flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}
        className="auth-left-panel">

        {/* Background Image */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1200&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        {/* Overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.82) 100%)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>⭐</div>
            <div>
              <p style={{ color: '#fff', fontSize: 16, fontWeight: 700, lineHeight: 1 }}>Influencer Connect</p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 }}>Creator Portal · India 🇮🇳</p>
            </div>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 14 }}>
            Turn your influence into income 🇮🇳
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, marginBottom: 36 }}>
            Collaborate with India's top brands, earn from brand deals, and grow your creator career on one platform.
          </p>
          {[
            { icon: '💰', title: 'Earn from Brand Deals', desc: 'Paid collaborations with brands in your niche' },
            { icon: '🎯', title: 'Matched Opportunities', desc: 'AI finds the best offers for your audience' },
            { icon: '📈', title: 'Analytics & Growth', desc: 'Track performance and grow your reach' },
          ].map(f => (
            <div key={f.title} style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{f.icon}</div>
              <div>
                <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{f.title}</p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{f.desc}</p>
              </div>
            </div>
          ))}
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: '16px 20px', marginTop: 8, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ display: 'flex', gap: 16 }}>
              {[{ n: '15,000+', l: 'Creators' }, { n: '3,200+', l: 'Brands' }, { n: '₹12 Cr+', l: 'Paid Out' }].map(s => (
                <div key={s.l} style={{ textAlign: 'center', flex: 1 }}>
                  <p style={{ color: '#fff', fontSize: 18, fontWeight: 800 }}>{s.n}</p>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', background: '#f8fafc', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⭐</div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1 }}>Influencer Connect</p>
              <p style={{ fontSize: 11, color: '#8b5cf6', marginTop: 2 }}>Creator Portal · India 🇮🇳</p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 12, padding: 4, marginBottom: 28 }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                style={{ flex: 1, padding: '10px', borderRadius: 9, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', background: mode === m ? '#fff' : 'transparent', color: mode === m ? '#8b5cf6' : '#6b7280', boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}>
                {m === 'login' ? '🔑 Sign In' : '✨ Join Now'}
              </button>
            ))}
          </div>

          {/* LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Welcome back, Creator! 👋</h2>
                <p style={{ fontSize: 13, color: '#6b7280' }}>Sign in to your influencer account</p>
              </div>

              <div>
                <label style={labelStyle}>Email Address</label>
                <input type="email" value={loginForm.email} onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@creator.in" required style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} value={loginForm.password} onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="Enter your password" required style={{ ...inputStyle, paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#9ca3af' }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Link href="/auth/forgot" style={{ fontSize: 13, color: '#8b5cf6', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</Link>
              </div>

              {error && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>⚠️ {error}</div>}

              <button type="submit" disabled={loading}
                style={{ padding: '13px', borderRadius: 12, border: 'none', background: loading ? '#e5e7eb' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: loading ? '#9ca3af' : '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 14px rgba(139,92,246,0.35)' }}>
                {loading ? '⏳ Signing in...' : '⭐ Sign In to Creator Portal'}
              </button>

              <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280' }}>
                Are you a business?{' '}
                <Link href="/auth/business" style={{ color: '#0ea5e9', fontWeight: 600, textDecoration: 'none' }}>Sign in here →</Link>
              </p>
            </form>
          )}

          {/* REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Create your creator profile</h2>
                <p style={{ fontSize: 13, color: '#6b7280' }}>Join thousands of influencers earning from brand deals in India</p>
              </div>

              <div>
                <label style={labelStyle}>Full Name *</label>
                <input value={regForm.name} onChange={e => setRegForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Priya Sharma, Rahul Verma" required style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Email Address *</label>
                <input type="email" value={regForm.email} onChange={e => setRegForm(p => ({ ...p, email: e.target.value }))} placeholder="you@creator.in" required style={inputStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPass ? 'text' : 'password'} value={regForm.password} onChange={e => setRegForm(p => ({ ...p, password: e.target.value }))} placeholder="Min 6 chars" required style={{ ...inputStyle, paddingRight: 40 }} />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#9ca3af' }}>
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Confirm Password *</label>
                  <input type="password" value={regForm.confirmPassword} onChange={e => setRegForm(p => ({ ...p, confirmPassword: e.target.value }))} placeholder="Repeat password" required style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Mobile Number (optional)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ ...inputStyle, width: 70, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', fontWeight: 600, color: '#374151' }}>
                    🇮🇳 +91
                  </div>
                  <input type="tel" value={regForm.phone} onChange={e => setRegForm(p => ({ ...p, phone: e.target.value }))} placeholder="10-digit number" style={inputStyle} maxLength={10} />
                </div>
              </div>

              {/* Social handles */}
              <div style={{ background: '#f9fafb', borderRadius: 12, padding: 14 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>📱 Social Media Handles (optional)</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ ...labelStyle, fontSize: 12 }}>Instagram</label>
                      <input value={regForm.meta.instagram} onChange={e => setRegForm(p => ({ ...p, meta: { ...p.meta, instagram: e.target.value } }))} placeholder="@username" style={{ ...inputStyle, fontSize: 13 }} />
                    </div>
                    <div>
                      <label style={{ ...labelStyle, fontSize: 12 }}>YouTube Channel</label>
                      <input value={regForm.meta.youtube} onChange={e => setRegForm(p => ({ ...p, meta: { ...p.meta, youtube: e.target.value } }))} placeholder="Channel name" style={{ ...inputStyle, fontSize: 13 }} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ ...labelStyle, fontSize: 12 }}>Moj / Josh</label>
                      <input value={regForm.meta.moj} onChange={e => setRegForm(p => ({ ...p, meta: { ...p.meta, moj: e.target.value } }))} placeholder="@username" style={{ ...inputStyle, fontSize: 13 }} />
                    </div>
                    <div>
                      <label style={{ ...labelStyle, fontSize: 12 }}>Total Followers (approx.)</label>
                      <input type="number" value={regForm.meta.followers} onChange={e => setRegForm(p => ({ ...p, meta: { ...p.meta, followers: e.target.value } }))} placeholder="e.g. 50000" min="0" style={{ ...inputStyle, fontSize: 13 }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div>
                <label style={labelStyle}>Content Categories (select all that apply)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {CATEGORIES.map(cat => (
                    <button key={cat} type="button" onClick={() => toggleCategory(cat)}
                      style={{ padding: '5px 12px', borderRadius: 20, border: `1.5px solid ${regForm.meta.categories.includes(cat) ? '#8b5cf6' : '#e5e7eb'}`, background: regForm.meta.categories.includes(cat) ? '#ede9fe' : '#fff', color: regForm.meta.categories.includes(cat) ? '#7c3aed' : '#6b7280', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={regForm.acceptTerms} onChange={e => setRegForm(p => ({ ...p, acceptTerms: e.target.checked }))} style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>
                  I agree to the <a href="#" style={{ color: '#8b5cf6' }}>Terms of Service</a> and <a href="#" style={{ color: '#8b5cf6' }}>Privacy Policy</a>
                </span>
              </label>

              {error && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>⚠️ {error}</div>}

              <button type="submit" disabled={loading}
                style={{ padding: '13px', borderRadius: 12, border: 'none', background: loading ? '#e5e7eb' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: loading ? '#9ca3af' : '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 14px rgba(139,92,246,0.35)' }}>
                {loading ? '⏳ Creating profile...' : '⭐ Create Creator Account'}
              </button>

              <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280' }}>
                Are you a business?{' '}
                <Link href="/auth/business" style={{ color: '#0ea5e9', fontWeight: 600, textDecoration: 'none' }}>Register here →</Link>
              </p>
            </form>
          )}

          <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 24 }}>
            Admin?{' '}
            <Link href="/" style={{ color: '#4f46e5', textDecoration: 'none' }}>Admin login →</Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .auth-left-panel { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
