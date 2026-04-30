"use client";

import { useState, useEffect, useCallback } from 'react';
import { influencerApi } from '../../../../../lib/api.js';

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 99999, background: type === 'success' ? '#059669' : '#dc2626', color: '#fff', borderRadius: 12, padding: '12px 20px', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
      {type === 'success' ? '✅' : '❌'} {msg}
    </div>
  );
}

const EMPTY_FORM = {
  name: '', bio: '', username: '',
  'contactInfo.secondaryEmail': '',
  'contactInfo.location': '',
  'contactInfo.website': '',
  'contactInfo.instagram': '',
  'contactInfo.tiktok': '',
  'location.city': '',
  'location.country': '',
};

export default function InfluencerProfilePage() {
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [toast, setToast]       = useState(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await influencerApi('/profile');
      const p = res.influencer || res.data || res;
      setProfile(p);
      setForm({
        name:                        p.name || '',
        bio:                         p.bio || '',
        username:                    p.username || '',
        'contactInfo.secondaryEmail': p.contactInfo?.secondaryEmail || '',
        'contactInfo.location':       p.contactInfo?.location || '',
        'contactInfo.website':        p.contactInfo?.website || '',
        'contactInfo.instagram':      p.contactInfo?.instagram || '',
        'contactInfo.tiktok':         p.contactInfo?.tiktok || '',
        'location.city':              p.location?.city || '',
        'location.country':           p.location?.country || '',
      });
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
      // Build nested object from flat form keys
      const body = {
        name:     form.name,
        bio:      form.bio,
        username: form.username,
        contactInfo: {
          secondaryEmail: form['contactInfo.secondaryEmail'],
          location:       form['contactInfo.location'],
          website:        form['contactInfo.website'],
          instagram:      form['contactInfo.instagram'],
          tiktok:         form['contactInfo.tiktok'],
        },
        location: {
          city:    form['location.city'],
          country: form['location.country'],
        },
      };
      const res = await influencerApi('/profile', { method: 'PUT', body });
      const p = res.influencer || res.data || res;
      setProfile(p);
      setEditing(false);
      setToast({ msg: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setToast({ msg: err.message || 'Failed to save profile', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setForm({
        name:                        profile.name || '',
        bio:                         profile.bio || '',
        username:                    profile.username || '',
        'contactInfo.secondaryEmail': profile.contactInfo?.secondaryEmail || '',
        'contactInfo.location':       profile.contactInfo?.location || '',
        'contactInfo.website':        profile.contactInfo?.website || '',
        'contactInfo.instagram':      profile.contactInfo?.instagram || '',
        'contactInfo.tiktok':         profile.contactInfo?.tiktok || '',
        'location.city':              profile.location?.city || '',
        'location.country':           profile.location?.country || '',
      });
    }
    setEditing(false);
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
        <button onClick={loadProfile} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#8b5cf6', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Retry</button>
      </div>
    </div>
  );

  const avatar = (profile?.name || 'I').charAt(0).toUpperCase();
  const stats = [
    { label: 'Total Followers', value: profile?.statistics?.totalFollowers?.toLocaleString('en-IN') || '0', icon: '👥' },
    { label: 'Campaigns Done',  value: profile?.statistics?.completedCampaigns || '0', icon: '🚀' },
    { label: 'Avg. Engagement', value: profile?.statistics?.avgEngagementRate ? `${profile.statistics.avgEngagementRate}%` : '—', icon: '📊' },
    { label: 'Rating',          value: profile?.statistics?.averageRating ? `${profile.statistics.averageRating}/5` : '—', icon: '⭐' },
  ];

  const fields = [
    { label: 'Full Name',        key: 'name',                        type: 'text' },
    { label: 'Username',         key: 'username',                    type: 'text' },
    { label: 'Secondary Email',  key: 'contactInfo.secondaryEmail',  type: 'email' },
    { label: 'Location',         key: 'contactInfo.location',        type: 'text' },
    { label: 'Website',          key: 'contactInfo.website',         type: 'url' },
    { label: 'Instagram Handle', key: 'contactInfo.instagram',       type: 'text' },
    { label: 'TikTok Handle',    key: 'contactInfo.tiktok',          type: 'text' },
    { label: 'City',             key: 'location.city',               type: 'text' },
    { label: 'Country',          key: 'location.country',            type: 'text' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>👤 My Profile</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>Manage your public profile and social media links</p>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)}
            style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            ✏️ Edit Profile
          </button>
        )}
      </div>

      {/* Profile Header */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ height: 100, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed, #6d28d9)' }} />
        <div style={{ padding: '0 24px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginTop: -32, marginBottom: 16 }}>
            <div style={{ width: 72, height: 72, borderRadius: 18, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 28, border: '4px solid #fff', flexShrink: 0 }}>
              {avatar}
            </div>
            <div style={{ paddingBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{profile?.name || '—'}</h2>
                {profile?.isVerified && <span style={{ background: '#dcfce7', color: '#166534', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>✓ Verified</span>}
              </div>
              <p style={{ fontSize: 13, color: '#6b7280' }}>
                {profile?.username ? `@${profile.username}` : ''} {profile?.contactInfo?.location ? `· ${profile.contactInfo.location}` : ''}
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

      {/* Social Connections */}
      {(profile?.meta?.instagram?.connected || profile?.meta?.tiktok?.connected) && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Connected Platforms</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {profile?.meta?.instagram?.connected && (
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#e1306c22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📸</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Instagram</p>
                    <p style={{ fontSize: 11, color: '#9ca3af' }}>@{profile.meta.instagram.username}</p>
                  </div>
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{(profile.meta.instagram.followers || 0).toLocaleString('en-IN')} followers</p>
              </div>
            )}
            {profile?.meta?.tiktok?.connected && (
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#00000022', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎵</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>TikTok</p>
                    <p style={{ fontSize: 11, color: '#9ca3af' }}>@{profile.meta.tiktok.username}</p>
                  </div>
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{(profile.meta.tiktok.followers || 0).toLocaleString('en-IN')} followers</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Form */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Profile Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {fields.map(field => (
            <div key={field.key}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{field.label}</label>
              {editing ? (
                <input type={field.type} value={form[field.key]} onChange={e => set(field.key, e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              ) : (
                <p style={{ fontSize: 13, color: '#374151', padding: '9px 0', borderBottom: '1px solid #f3f4f6' }}>{form[field.key] || '—'}</p>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Bio</label>
          {editing ? (
            <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={4}
              placeholder="Tell brands about yourself..."
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
          ) : (
            <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{form.bio || '—'}</p>
          )}
        </div>

        {editing && (
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={handleCancel} disabled={saving}
              style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: saving ? '#a5b4fc' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
