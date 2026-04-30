"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, setTokens } from '../../../../lib/api.js';

const SECTORS = [
  'Fashion & Apparel', 'Food & Beverage', 'Beauty & Cosmetics', 'Health & Wellness',
  'Technology & Electronics', 'Travel & Hospitality', 'Education & EdTech',
  'Finance & Fintech', 'Real Estate', 'Automobile', 'FMCG', 'Retail & E-commerce',
  'Entertainment & OTT', 'Sports & Fitness', 'Jewellery & Accessories', 'Other'
];
const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];
const INDIAN_STATES = [
  'Andhra Pradesh', 'Delhi', 'Gujarat', 'Haryana', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu',
  'Telangana', 'Uttar Pradesh', 'West Bengal', 'Other'
];

export default function BusinessAuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [status, setStatus] = useState(null);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({
    email: '', password: '', confirmPassword: '',
    companyName: '',
    businessDetails: {
      sector: '', companySize: '1-10', website: '',
      description: '',
      phone: { countryCode: '+91', number: '' },
      address: { street: '', city: '', state: '', country: 'India', zipCode: '' },
      gstin: '',
    },
    acceptTerms: false,
  });

  const setReg = (path, value) => {
    setRegForm(prev => {
      const keys = path.split('.');
      const next = { ...prev };
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) {
        cur[keys[i]] = { ...cur[keys[i]] };
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const data = await apiFetch('/api/auth/business/login', { method: 'POST', body: loginForm });
      setTokens(data.accessToken, data.refreshToken);
      localStorage.setItem('userRole', 'business');
      localStorage.setItem('userData', JSON.stringify(data.user));
      router.push('/portal/business');
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
        companyName: regForm.companyName,
        businessDetails: regForm.businessDetails,
        acceptTerms: regForm.acceptTerms,
      };
      const data = await apiFetch('/api/auth/business/register', { method: 'POST', body: payload });
      setTokens(data.accessToken, data.refreshToken);
      localStorage.setItem('userRole', 'business');
      localStorage.setItem('userData', JSON.stringify(data.user));
      setStatus('pending');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  if (status === 'pending') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', padding: 16, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: 48, maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, margin: '0 auto 24px' }}>⏳</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Account Pending Approval</h2>
          <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 24 }}>
            Your business account has been submitted and is under review by our admin team. You will receive an email once approved — usually within 24–48 hours.
          </p>
          <div style={{ background: '#f0f9ff', borderRadius: 12, padding: '14px 20px', marginBottom: 24, textAlign: 'left' }}>
            <p style={{ fontSize: 13, color: '#0369a1', fontWeight: 600, marginBottom: 6 }}>What happens next?</p>
            <ul style={{ fontSize: 13, color: '#374151', lineHeight: 1.8, paddingLeft: 16 }}>
              <li>Admin verifies your business details</li>
              <li>GST / KYC verification may be requested</li>
              <li>You will get an email notification on approval</li>
            </ul>
          </div>
          <button onClick={() => { setStatus(null); setMode('login'); }}
            style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
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
            Your business account has been suspended due to a policy violation. Please contact our support team for more information.
          </p>
          <a href="mailto:support@influencerconnect.in"
            style={{ display: 'block', width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: '#dc2626', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box' }}>
            Contact Support
          </a>
        </div>
      </div>
    );
  }

  const inputStyle = { width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#111827', background: '#fff', transition: 'border-color 0.15s' };
  const labelStyle = { fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Left Panel */}
      <div style={{ display: 'none', flex: 1, position: 'relative', padding: 48, flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}
        className="auth-left-panel">

        {/* Background Image */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1200&q=80)',
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
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>⚡</div>
            <div>
              <p style={{ color: '#fff', fontSize: 16, fontWeight: 700, lineHeight: 1 }}>Influencer Connect</p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 }}>Business Portal · India 🇮🇳</p>
            </div>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 14 }}>
            Connect your brand with the right creators 🇮🇳
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, marginBottom: 36 }}>
            Launch campaigns with India's top influencers, track ROI, and grow your brand reach across every platform.
          </p>
          {[
            { icon: '🚀', title: 'Launch Campaigns Fast', desc: 'Post offers and receive applications within hours' },
            { icon: '🎯', title: 'Find the Right Creators', desc: 'AI-matched influencers for your niche and budget' },
            { icon: '📊', title: 'Track ROI in Real Time', desc: 'Analytics and campaign performance dashboard' },
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
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏢</div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1 }}>Influencer Connect</p>
              <p style={{ fontSize: 11, color: '#0ea5e9', marginTop: 2 }}>Business Portal · India 🇮🇳</p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 12, padding: 4, marginBottom: 28 }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setStep(1); setError(''); }}
                style={{ flex: 1, padding: '10px', borderRadius: 9, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', background: mode === m ? '#fff' : 'transparent', color: mode === m ? '#0ea5e9' : '#6b7280', boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}>
                {m === 'login' ? '🔑 Sign In' : '✨ Register'}
              </button>
            ))}
          </div>

          {/* LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Welcome back! 👋</h2>
                <p style={{ fontSize: 13, color: '#6b7280' }}>Sign in to your business account</p>
              </div>

              <div>
                <label style={labelStyle}>Business Email</label>
                <input type="email" value={loginForm.email} onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="contact@company.in" required style={inputStyle} />
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
                <Link href="/auth/forgot" style={{ fontSize: 13, color: '#0ea5e9', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</Link>
              </div>

              {error && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>⚠️ {error}</div>}

              <button type="submit" disabled={loading}
                style={{ padding: '13px', borderRadius: 12, border: 'none', background: loading ? '#e5e7eb' : 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: loading ? '#9ca3af' : '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 14px rgba(14,165,233,0.35)' }}>
                {loading ? '⏳ Signing in...' : '🔑 Sign In to Business Portal'}
              </button>

              <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280' }}>
                Are you an influencer?{' '}
                <Link href="/auth/influencer" style={{ color: '#8b5cf6', fontWeight: 600, textDecoration: 'none' }}>Sign in here →</Link>
              </p>
            </form>
          )}

          {/* REGISTER */}
          {mode === 'register' && (
            <form onSubmit={step === 1 ? (e) => { e.preventDefault(); if (!regForm.email || !regForm.password || !regForm.companyName) { setError('Please fill all required fields'); return; } if (regForm.password !== regForm.confirmPassword) { setError('Passwords do not match'); return; } setError(''); setStep(2); } : handleRegister}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  {[1, 2].map(s => (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: step >= s ? '#0ea5e9' : '#e5e7eb', color: step >= s ? '#fff' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{s}</div>
                      <span style={{ fontSize: 12, color: step >= s ? '#0ea5e9' : '#9ca3af', fontWeight: 500 }}>{s === 1 ? 'Account' : 'Business Details'}</span>
                      {s < 2 && <div style={{ width: 32, height: 2, background: step > s ? '#0ea5e9' : '#e5e7eb', borderRadius: 2 }} />}
                    </div>
                  ))}
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
                  {step === 1 ? 'Create your account' : 'Business details'}
                </h2>
                <p style={{ fontSize: 13, color: '#6b7280' }}>
                  {step === 1 ? 'Set up your login credentials' : 'Tell us about your business'}
                </p>
              </div>

              {step === 1 && (
                <>
                  <div>
                    <label style={labelStyle}>Company / Brand Name *</label>
                    <input value={regForm.companyName} onChange={e => setReg('companyName', e.target.value)} placeholder="e.g. Nykaa, Mamaearth, boAt" required style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Business Email *</label>
                    <input type="email" value={regForm.email} onChange={e => setReg('email', e.target.value)} placeholder="contact@company.in" required style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Password *</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showPass ? 'text' : 'password'} value={regForm.password} onChange={e => setReg('password', e.target.value)} placeholder="Minimum 6 characters" required style={{ ...inputStyle, paddingRight: 44 }} />
                      <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#9ca3af' }}>
                        {showPass ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Confirm Password *</label>
                    <input type="password" value={regForm.confirmPassword} onChange={e => setReg('confirmPassword', e.target.value)} placeholder="Repeat your password" required style={inputStyle} />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Sector / Industry *</label>
                      <select value={regForm.businessDetails.sector} onChange={e => setReg('businessDetails.sector', e.target.value)} required style={inputStyle}>
                        <option value="">Select sector</option>
                        {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Company Size *</label>
                      <select value={regForm.businessDetails.companySize} onChange={e => setReg('businessDetails.companySize', e.target.value)} style={inputStyle}>
                        {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Website (optional)</label>
                    <input type="url" value={regForm.businessDetails.website} onChange={e => setReg('businessDetails.website', e.target.value)} placeholder="https://yourcompany.in" style={inputStyle} />
                  </div>

                  <div>
                    <label style={labelStyle}>Mobile Number *</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ ...inputStyle, width: 70, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', fontWeight: 600, color: '#374151' }}>
                        🇮🇳 +91
                      </div>
                      <input type="tel" value={regForm.businessDetails.phone.number} onChange={e => setReg('businessDetails.phone.number', e.target.value)} placeholder="10-digit mobile number" required style={inputStyle} maxLength={10} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>City *</label>
                      <input value={regForm.businessDetails.address.city} onChange={e => setReg('businessDetails.address.city', e.target.value)} placeholder="Mumbai, Delhi, Bengaluru..." required style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>State *</label>
                      <select value={regForm.businessDetails.address.state} onChange={e => setReg('businessDetails.address.state', e.target.value)} required style={inputStyle}>
                        <option value="">Select state</option>
                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>GSTIN (optional)</label>
                    <input value={regForm.businessDetails.gstin} onChange={e => setReg('businessDetails.gstin', e.target.value)} placeholder="22AAAAA0000A1Z5" style={inputStyle} maxLength={15} />
                  </div>

                  <div>
                    <label style={labelStyle}>Business Description</label>
                    <textarea value={regForm.businessDetails.description} onChange={e => setReg('businessDetails.description', e.target.value)} rows={3} placeholder="Brief description of your business..." style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>

                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                    <input type="checkbox" checked={regForm.acceptTerms} onChange={e => setReg('acceptTerms', e.target.checked)} style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>
                      I agree to the <a href="#" style={{ color: '#0ea5e9' }}>Terms of Service</a> and <a href="#" style={{ color: '#0ea5e9' }}>Privacy Policy</a>
                    </span>
                  </label>
                </>
              )}

              {error && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>⚠️ {error}</div>}

              <div style={{ display: 'flex', gap: 10 }}>
                {step === 2 && (
                  <button type="button" onClick={() => setStep(1)}
                    style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    ← Back
                  </button>
                )}
                <button type="submit" disabled={loading}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: loading ? '#e5e7eb' : 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: loading ? '#9ca3af' : '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 14px rgba(14,165,233,0.35)' }}>
                  {loading ? '⏳ Creating account...' : step === 1 ? 'Continue →' : '🏢 Create Business Account'}
                </button>
              </div>

              <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280' }}>
                Are you an influencer?{' '}
                <Link href="/auth/influencer" style={{ color: '#8b5cf6', fontWeight: 600, textDecoration: 'none' }}>Register here →</Link>
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
