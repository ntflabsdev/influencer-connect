"use client";

import { useState } from 'react';
import { adminApi } from '../../../../lib/api.js';
import Badge from '../../../../components/Badge.js';
import Button from '../../../../components/Button.js';
import { useToast } from '../../../../components/ToastProvider.js';
import { StatCard, GradientCard, softBlueColors } from '../../../../components/DesignSystem.js';

const DUMMY_SUBMISSIONS = [
  { _id: 's1', offer: 'Earbuds Launch Campaign', influencer: 'Rahul Verma', caption: 'Just unboxed the new boAt Airdopes! 🔥 Incredible sound quality and 40hr battery life...', assetUrl: 'https://picsum.photos/400/300?random=1', status: 'pending', priority: 'normal', aiScore: 0.12, aiFlags: [], createdAt: '2026-06-11T09:00:00Z' },
  { _id: 's2', offer: 'Monsoon Fashion Campaign', influencer: 'Priya Sharma', caption: 'Obsessed with this monsoon collection from Mamaearth! Perfect for the rainy season ☔', assetUrl: 'https://picsum.photos/400/300?random=2', status: 'pending', priority: 'normal', aiScore: 0.08, aiFlags: [], createdAt: '2026-06-11T08:30:00Z' },
  { _id: 's3', offer: 'Fitness App Promotion', influencer: 'Anjali Singh', caption: 'This Cult.fit app completely changed my workout routine! Download link in bio 💪', assetUrl: 'https://picsum.photos/400/300?random=3', status: 'pending', priority: 'urgent', aiScore: 0.71, aiFlags: [{ type: 'misleading_claims', confidence: 0.71 }], createdAt: '2026-06-10T16:00:00Z' },
  { _id: 's4', offer: 'Biryani Festival Review', influencer: 'Vikram Patel', caption: 'Honest review of Swiggy Biryani Festival — tried 5 different biryanis! 🍛', assetUrl: 'https://picsum.photos/400/300?random=4', status: 'approved', priority: 'normal', aiScore: 0.05, aiFlags: [], createdAt: '2026-06-10T14:00:00Z' },
  { _id: 's5', offer: 'Navratri Beauty Collection', influencer: 'Neha Gupta', caption: 'My Navratri makeup routine featuring Nykaa new collection ✨', assetUrl: 'https://picsum.photos/400/300?random=5', status: 'pending', priority: 'normal', aiScore: 0.15, aiFlags: [], createdAt: '2026-06-11T07:00:00Z' },
];

const DUMMY_FLAGGED = [
  { _id: 'f1', offer: 'Crypto Investment Promo', influencer: 'Unknown Creator', caption: '10x returns guaranteed on crypto! 🚀 DM me for details — limited slots!', assetUrl: 'https://picsum.photos/400/300?random=6', status: 'pending', aiScore: 0.94, aiFlags: [{ type: 'financial_fraud', confidence: 0.94 }, { type: 'misleading_claims', confidence: 0.87 }], createdAt: '2026-06-11T06:00:00Z' },
  { _id: 'f2', offer: 'Weight Loss Product', influencer: 'FitInfluencer99', caption: 'Lost 15kg in 2 weeks with this miracle product! No diet needed!', assetUrl: 'https://picsum.photos/400/300?random=7', status: 'pending', aiScore: 0.88, aiFlags: [{ type: 'health_misinformation', confidence: 0.88 }, { type: 'misleading_claims', confidence: 0.82 }], createdAt: '2026-06-10T20:00:00Z' },
  { _id: 'f3', offer: 'Fitness App Promotion', influencer: 'Anjali Singh', caption: 'This app completely changed my workout routine!', assetUrl: 'https://picsum.photos/400/300?random=3', status: 'pending', aiScore: 0.71, aiFlags: [{ type: 'misleading_claims', confidence: 0.71 }], createdAt: '2026-06-10T16:00:00Z' },
];

const RISK_COLOR = (score) => score >= 0.8 ? { bg: '#fee2e2', color: '#dc2626', label: 'High Risk' } : score >= 0.6 ? { bg: '#fef3c7', color: '#d97706', label: 'Medium Risk' } : { bg: '#dcfce7', color: '#059669', label: 'Safe' };

export default function ContentModerationPage() {
  const [submissions, setSubmissions] = useState(DUMMY_SUBMISSIONS);
  const [flagged, setFlagged] = useState(DUMMY_FLAGGED);
  const [activeTab, setActiveTab] = useState('pending');
  const [selected, setSelected] = useState(null);
  const { push } = useToast();

  const pending = submissions.filter(s => s.status === 'pending');

  const reviewSubmission = (id, status, list, setList) => {
    setList(prev => prev.map(s => s._id === id ? { ...s, status } : s));
    if (selected?._id === id) setSelected(null);
    push(`Content ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'changes requested'}`, status === 'approved' ? 'success' : 'warning');
  };

  const tabs = [
    { id: 'pending', label: '📋 Pending Review', count: pending.length },
    { id: 'flagged', label: '🚩 AI Flagged', count: flagged.length },
    { id: 'analytics', label: '📊 Analytics' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>📝 Content Moderation</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>Review, approve and moderate influencer content submissions</p>
        </div>
        <button onClick={() => push('Refreshed', 'success')}
          style={{ padding: '8px 16px', borderRadius: 9, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          🔄 Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
        {[
          { label: 'Pending Review', value: pending.length, icon: '⏳', bg: '#fef9c3', color: '#d97706' },
          { label: 'AI Flagged', value: flagged.length, icon: '⚠️', bg: '#fee2e2', color: '#dc2626' },
          { label: 'Approved Today', value: 24, icon: '✅', bg: '#dcfce7', color: '#059669' },
          { label: 'Quality Score', value: '94.2%', icon: '⭐', bg: '#e0f2fe', color: '#0ea5e9' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{s.icon}</div>
              <div>
                <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{s.label}</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 6, display: 'flex', gap: 4 }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: activeTab === tab.id ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'transparent', color: activeTab === tab.id ? '#fff' : '#6b7280' }}>
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span style={{ background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : '#f3f4f6', color: activeTab === tab.id ? '#fff' : '#374151', borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Pending Tab */}
      {activeTab === 'pending' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pending.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 48, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>All caught up!</p>
              <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>No pending content submissions</p>
            </div>
          ) : pending.map(sub => {
            const risk = RISK_COLOR(sub.aiScore);
            return (
              <div key={sub._id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                  <img src={sub.assetUrl} alt="content" style={{ width: 80, height: 80, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} onError={e => { e.target.style.display = 'none'; }} />
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{sub.offer}</h3>
                      <span style={{ background: risk.bg, color: risk.color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>{risk.label}</span>
                      {sub.priority === 'urgent' && <span style={{ background: '#fee2e2', color: '#dc2626', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>🔴 Urgent</span>}
                    </div>
                    <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>by <strong style={{ color: '#374151' }}>{sub.influencer}</strong></p>
                    <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.5, marginBottom: 8 }}>{sub.caption}</p>
                    {sub.aiFlags.length > 0 && (
                      <div style={{ background: '#fef9c3', borderRadius: 8, padding: '8px 12px', marginBottom: 8 }}>
                        <p style={{ fontSize: 11, color: '#854d0e', fontWeight: 600, marginBottom: 4 }}>⚠️ AI Flags:</p>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {sub.aiFlags.map((f, i) => (
                            <span key={i} style={{ background: '#fef3c7', color: '#92400e', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
                              {f.type.replace(/_/g, ' ')} ({(f.confidence * 100).toFixed(0)}%)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                    <button onClick={() => setSelected(sub)}
                      style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      Review
                    </button>
                    <button onClick={() => reviewSubmission(sub._id, 'approved', submissions, setSubmissions)}
                      style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: '#059669', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      ✓ Approve
                    </button>
                    <button onClick={() => reviewSubmission(sub._id, 'rejected', submissions, setSubmissions)}
                      style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      ✕ Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Flagged Tab */}
      {activeTab === 'flagged' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {flagged.map(sub => (
            <div key={sub._id} style={{ background: '#fff', borderRadius: 16, border: '2px solid #fee2e2', padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <img src={sub.assetUrl} alt="content" style={{ width: 80, height: 80, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} onError={e => { e.target.style.display = 'none'; }} />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{sub.offer}</h3>
                    <span style={{ background: '#fee2e2', color: '#dc2626', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
                      Risk: {(sub.aiScore * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>by <strong style={{ color: '#374151' }}>{sub.influencer}</strong></p>
                  <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.5, marginBottom: 10 }}>{sub.caption}</p>
                  <div style={{ background: '#fee2e2', borderRadius: 8, padding: '10px 12px' }}>
                    <p style={{ fontSize: 11, color: '#991b1b', fontWeight: 600, marginBottom: 6 }}>🤖 AI Detection Results:</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {sub.aiFlags.map((f, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 12, color: '#991b1b' }}>{f.type.replace(/_/g, ' ')}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#dc2626' }}>{(f.confidence * 100).toFixed(0)}% confidence</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => reviewSubmission(sub._id, 'approved', flagged, setFlagged)}
                    style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: '#059669', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    Override ✓
                  </button>
                  <button onClick={() => reviewSubmission(sub._id, 'rejected', flagged, setFlagged)}
                    style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    ✕ Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
            {[
              { label: 'Total Submissions', value: '1,284', icon: '📊', bg: '#e0f2fe', color: '#0ea5e9' },
              { label: 'Avg Quality Score', value: '8.4/10', icon: '⭐', bg: '#dcfce7', color: '#059669' },
              { label: 'AI Analyzed', value: '1,156', icon: '🤖', bg: '#ede9fe', color: '#7c3aed' },
              { label: 'High Risk Flagged', value: '23', icon: '⚠️', bg: '#fee2e2', color: '#dc2626' },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{s.icon}</div>
                  <div>
                    <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{s.label}</p>
                    <p style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{s.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Moderation Status Breakdown</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
              {[
                { label: 'Approved', count: 847, color: '#059669', bg: '#dcfce7' },
                { label: 'Pending', count: 156, color: '#d97706', bg: '#fef9c3' },
                { label: 'Rejected', count: 189, color: '#dc2626', bg: '#fee2e2' },
                { label: 'Changes Req.', count: 92, color: '#7c3aed', bg: '#ede9fe' },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '14px', textAlign: 'center' }}>
                  <p style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.count}</p>
                  <p style={{ fontSize: 12, color: '#374151', marginTop: 4 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>Content Review</h2>
              <button onClick={() => setSelected(null)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f3f4f6', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <img src={selected.assetUrl} alt="content" style={{ width: '100%', borderRadius: 12, marginBottom: 16, maxHeight: 300, objectFit: 'cover' }} />
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{selected.offer}</p>
              <p style={{ fontSize: 12, color: '#6b7280' }}>by {selected.influencer}</p>
            </div>
            <div style={{ background: '#f9fafb', borderRadius: 10, padding: 12, marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>{selected.caption}</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setSelected(null)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Close</button>
              <button onClick={() => { reviewSubmission(selected._id, 'approved', submissions, setSubmissions); setSelected(null); }}
                style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#059669', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>✓ Approve</button>
              <button onClick={() => { reviewSubmission(selected._id, 'rejected', submissions, setSubmissions); setSelected(null); }}
                style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#dc2626', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>✕ Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
