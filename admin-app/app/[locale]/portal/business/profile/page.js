"use client";

import { useState, useEffect, useCallback } from 'react';
import { businessApi } from '../../../../../lib/api.js';

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 99999, background: type === 'success' ? '#059669' : '#dc2626', color: '#fff', borderRadius: 12, padding: '12px 20px', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
      {type === 'success' ? '✅' : '❌'} {msg}
    </div>
  );
}

const EMPTY_FORM = {
  businessName: '', description: '', category: '', industry: '',
  companySize: '1-10', foundedYear: '',
  'contactInfo.primaryEmail': '',
  'contactInfo.phone': '',
  'contactInfo.website': '',
  'contactInfo.address.city': '',
  'contactInfo.address.country': '',
  'contactInfo.socialMedia.instagram': '',
  'contactInfo.socialMedia.linkedin': '',
};

export default function BusinessProfilePage() {
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [toast, setToast]       = useState(null);

  const toForm = (p) => ({
    businessName:                   p.businessName || '',
    description:                    p.description || '',
    category:                       p.category || '',
    industry:                       p.industry || '',
    companySize:                    p.companySize || '1-10',
    foundedYear:                    p.foundedYear || '',
    'contactInfo.primaryEmail':     p.contactInfo?.primaryEmail || '',
    'contactInfo.phone':            p.contactInfo?.phone || '',
    'contactInfo.website':          p.contactInfo?.website || '',
    'contactInfo.address.city':     p.contactInfo?.address?.city || '',
    'contactInfo.address.country':  p.contactInfo?.address?.country || '',
    'contactInfo.socialMedia.instagram': p.contactInfo?.socialMedia?.instagram || '',
    'contactInfo.socialMedia.linkedin':  p.contactInfo?.socialMedia?.linkedin || '',
  });

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await businessApi('/profile');
      const p = res.business || res.data || res;
      setProfile(p);
      setForm(toForm(p));
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        businessName: form.businessName,
        description:  form.description,
        category:     form.category,
        industry:     form.industry,
        companySize:  form.companySize,
        foundedYear:  form.foundedYear ? Number(form.foundedYear) : undefined,
        contactInfo: {
          primaryEmail: form['contactInfo.primaryEmail'],
          phone:        form['contactInfo.phone'],
          website:      form['contactInfo.website'],
          address: {
            city:    form['contactInfo.address.city'],
            country: form['contactInfo.address.country'],
          },
          socialMedia: {
            instagram: form['contactInfo.socialMedia.instagram'],
            linkedin:  form['contactInfo.socialMedia.linkedin'],
          },
        },
      };
      const res = await businessApi('/profile', { method: 'PUT', body });
      const p = res.business || res.data || res;
      setProfile(p);
      setForm(toForm(p));
      setEditing(false);
      setToast({ msg: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setToast({ msg: err.message || 'Failed to save profile', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{ textAlign: 'center' }}><div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div><p style={{ color: '#6b7280', fontSize: 14 }}>Loading profile...</p></div>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>❌</div>
        <p style={{ color: '#dc2626', fontSize: 14, marginBottom: 12 }}>{error}</p>
        <button onClick={loadProfile} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#0ea5e9', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Retry</button>
      </div>
    </div>
  );

  const avatar = (profile?.businessName || 'B').charAt(0).toUpperCase();
  const stats = [
    { label: 'Total Offers',    value: profile?.statistics?.totalOffers || '0',       icon: '📦' },
    { label: 'Active Campaigns',value: profile?.statistics?.activeCampaigns || '0',   icon: '🚀' },
    { label: 'Total Reach',     value: profile?.statistics?.totalReach ? `${(profile.statistics.totalReach / 1000000).toFixed(1)}M` : '—', icon: '👁️' },
    { label: 'Influencers',     value: profile?.statistics?.totalInfluencers || '0',  icon: '👥' },
  ];

  const fields = [
    { label: 'Company Name',   key: 'businessName',                    type: 'text' },
    { label: 'Category',       key: 'category',                        type: 'text' },
    { label: 'Industry',       key: 'industry',                        type: 'text' },
    { label: 'Company Size',   key: 'companySize',                     type: 'select', options: ['1-10','11-50','51-200','201-500','500+'] },
    { label: 'Founded Year',   key: 'foundedYear',                     type: 'number' },
    { label: 'Primary Email',  key: 'contactInfo.primaryEmail',        type: 'email' },
    { label: 'Phone',          key: 'contactInfo.phone',               type: 'tel' },
    { label: 'Website',        key: 'contactInfo.website',             type: 'url' },
    { label: 'City',           key: 'contactInfo.address.city',        type: 'text' },
    { label: 'Country',        key: 'contactInfo.address.country',     type: 'text' },
    { label: 'Instagram',      key: 'contactInfo.socialMedia.instagram', type: 'text' },
    { label: 'LinkedIn',       key: 'contactInfo.socialMedia.linkedin',  type: 'url' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>🏢 Business Profile</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>Manage your company information and preferences</p>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)}
            style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            ✏️ Edit Profile
          </button>
        )}
      </div>

      {/* Header */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ height: 100, background: 'linear-gradient(135deg, #0ea5e9, #0284c7, #0369a1)' }} />
        <div style={{ padding: '0 24px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginTop: -32, marginBottom: 16 }}>
            <div style={{ width: 72, height: 72, borderRadius: 18, background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 28, border: '4px solid #fff', flexShrink: 0 }}>
              {avatar}
            </div>
            <div style={{ paddingBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{profile?.businessName || '—'}</h2>
                {profile?.isVerified && <span style={{ background: '#dcfce7', color: '#166534', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>✓ Verified</span>}
              </div>
              <p style={{ fontSize: 13, color: '#6b7280' }}>
                {profile?.industry || profile?.category || ''} {profile?.contactInfo?.address?.city ? `· ${profile.contactInfo.address.city}` : ''}
              </p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
            {stats.map(s => (
              <div key={s.label} style={{ background: '#f9fafb', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{s.value}</p>
                <p style={{ fontSize: 11, color: '#9ca3af' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Company Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {fields.map(field => (
            <div key={field.key}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{field.label}</label>
              {editing ? (
                field.type === 'select' ? (
                  <select value={form[field.key]} onChange={e => set(field.key, e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }}>
                    {field.options.map(o => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={field.type} value={form[field.key]} onChange={e => set(field.key, e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                )
              ) : (
                <p style={{ fontSize: 13, color: '#374151', padding: '9px 0', borderBottom: '1px solid #f3f4f6' }}>{form[field.key] || '—'}</p>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Description</label>
          {editing ? (
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4}
              placeholder="Tell influencers about your company..."
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
          ) : (
            <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{form.description || '—'}</p>
          )}
        </div>

        {editing && (
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={() => { setEditing(false); setForm(toForm(profile)); }} disabled={saving}
              style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: saving ? '#7dd3fc' : 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
