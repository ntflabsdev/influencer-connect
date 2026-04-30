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

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} type="button"
      style={{ width: 44, height: 24, borderRadius: 12, border: 'none', background: value ? '#0ea5e9' : '#d1d5db', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: 2, left: value ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </button>
  );
}

export default function BusinessSettingsPage() {
  const [tab, setTab]         = useState('notifications');
  const [notifs, setNotifs]   = useState(null);
  const [privacy, setPrivacy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const [nRes, pRes] = await Promise.all([
        businessApi('/notifications'),
        businessApi('/privacy'),
      ]);
      setNotifs(nRes.preferences || nRes.data || nRes);
      setPrivacy(pRes.settings || pRes.data || pRes);
    } catch (err) {
      setToast({ msg: err.message || 'Failed to load settings', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const saveNotifs = async () => {
    setSaving(true);
    try {
      await businessApi('/notifications', { method: 'PUT', body: notifs });
      setToast({ msg: 'Notification settings saved!', type: 'success' });
    } catch (err) {
      setToast({ msg: err.message || 'Failed to save', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const savePrivacy = async () => {
    setSaving(true);
    try {
      await businessApi('/privacy', { method: 'PUT', body: privacy });
      setToast({ msg: 'Privacy settings saved!', type: 'success' });
    } catch (err) {
      setToast({ msg: err.message || 'Failed to save', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const setN = (key, val) => setNotifs(p => ({ ...p, [key]: val }));
  const setP = (key, val) => setPrivacy(p => ({ ...p, [key]: val }));

  const TABS = [
    { id: 'notifications', label: '🔔 Notifications' },
    { id: 'privacy',       label: '🔒 Privacy' },
  ];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{ textAlign: 'center' }}><div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div><p style={{ color: '#6b7280', fontSize: 14 }}>Loading settings...</p></div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>⚙️ Settings</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>Manage your account preferences</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '8px 18px', borderRadius: 9, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: tab === t.id ? '#fff' : 'transparent', color: tab === t.id ? '#111827' : '#6b7280', boxShadow: tab === t.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Notifications */}
      {tab === 'notifications' && notifs && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Notification Preferences</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { key: 'newApplications',   label: 'New Applications',    desc: 'When influencers apply to your offers' },
              { key: 'applicationUpdates',label: 'Application Updates', desc: 'Status changes on applications' },
              { key: 'payments',          label: 'Payments',            desc: 'Payment confirmations and invoices' },
              { key: 'messages',          label: 'Messages',            desc: 'New messages from influencers' },
              { key: 'campaignUpdates',   label: 'Campaign Updates',    desc: 'Updates on active campaigns' },
              { key: 'emailNotifications',label: 'Email Notifications', desc: 'Receive notifications via email' },
            ].map((item, i, arr) => (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < arr.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{item.label}</p>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{item.desc}</p>
                </div>
                <Toggle value={!!notifs[item.key]} onChange={val => setN(item.key, val)} />
              </div>
            ))}
          </div>
          <button onClick={saveNotifs} disabled={saving}
            style={{ marginTop: 20, padding: '10px 24px', borderRadius: 10, border: 'none', background: saving ? '#7dd3fc' : 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Saving...' : 'Save Notifications'}
          </button>
        </div>
      )}

      {/* Privacy */}
      {tab === 'privacy' && privacy && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Privacy Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { key: 'profileVisible',   label: 'Public Profile',      desc: 'Allow influencers to view your company profile' },
              { key: 'showBudget',       label: 'Show Budget Range',   desc: 'Display budget range on your offers' },
              { key: 'allowMessages',    label: 'Allow Messages',      desc: 'Allow influencers to send you direct messages' },
              { key: 'showContactInfo',  label: 'Show Contact Info',   desc: 'Display contact information publicly' },
            ].map((item, i, arr) => (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < arr.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{item.label}</p>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{item.desc}</p>
                </div>
                <Toggle value={!!privacy[item.key]} onChange={val => setP(item.key, val)} />
              </div>
            ))}
          </div>
          <button onClick={savePrivacy} disabled={saving}
            style={{ marginTop: 20, padding: '10px 24px', borderRadius: 10, border: 'none', background: saving ? '#7dd3fc' : 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Saving...' : 'Save Privacy'}
          </button>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
