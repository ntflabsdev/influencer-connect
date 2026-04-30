"use client";

import { useState } from 'react';

const REVIEWS = [
  { id: 1, brand: 'boAt Lifestyle', logo: 'B', color: '#3b82f6', campaign: 'Earbuds Launch Campaign', rating: 5, comment: 'Excellent work! Priya delivered high-quality content on time. The engagement on her posts was outstanding. Highly recommend for tech campaigns.', date: '2026-06-05', helpful: 12 },
  { id: 2, brand: 'Mamaearth', logo: 'M', color: '#ec4899', campaign: 'Monsoon Skincare Collection', rating: 4, comment: 'Great collaboration. Content was authentic and well-received by the audience. Minor delay in submission but overall very professional.', date: '2026-05-28', helpful: 8 },
  { id: 3, brand: 'Swiggy', logo: 'S', color: '#f59e0b', campaign: 'Biryani Festival Review', rating: 5, comment: 'Amazing food content creator! The review video went viral on Moj. Will definitely work again for future campaigns.', date: '2026-05-20', helpful: 21 },
  { id: 4, brand: 'Nykaa', logo: 'N', color: '#f472b6', campaign: 'Navratri Beauty Collection', rating: 4, comment: 'Very creative content. Good engagement rates. Would love to collaborate again for our next beauty launch.', date: '2026-06-10', helpful: 6 },
];

function StarRating({ rating, size = 16 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: size, color: i <= rating ? '#f59e0b' : '#e5e7eb' }}>★</span>
      ))}
    </div>
  );
}

export default function InfluencerReviewsPage() {
  const [selected, setSelected] = useState(null);
  const [helpful, setHelpful]   = useState(new Set());

  const avgRating = (REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length).toFixed(1);
  const fiveStars = REVIEWS.filter(r => r.rating === 5).length;
  const fourStars = REVIEWS.filter(r => r.rating === 4).length;

  const markHelpful = (id) => {
    setHelpful(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>⭐ Reviews</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>Ratings and reviews from brands you've worked with</p>
      </div>

      {/* Rating Summary */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24, display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 56, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{avgRating}</p>
          <StarRating rating={Math.round(parseFloat(avgRating))} size={20} />
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>{REVIEWS.length} reviews</p>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          {[5,4,3,2,1].map(star => {
            const count = REVIEWS.filter(r => r.rating === star).length;
            const pct = Math.round((count / REVIEWS.length) * 100);
            return (
              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#374151', width: 16, textAlign: 'right' }}>{star}</span>
                <span style={{ fontSize: 14, color: '#f59e0b' }}>★</span>
                <div style={{ flex: 1, height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #f59e0b, #d97706)', borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: 12, color: '#9ca3af', width: 24 }}>{count}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: '5 Star', value: fiveStars, icon: '🌟' },
            { label: '4 Star', value: fourStars, icon: '⭐' },
            { label: 'Avg Rating', value: avgRating, icon: '📊' },
            { label: 'Total', value: REVIEWS.length, icon: '📋' },
          ].map(s => (
            <div key={s.label} style={{ background: '#f9fafb', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
              <p style={{ fontSize: 16 }}>{s.icon}</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{s.value}</p>
              <p style={{ fontSize: 10, color: '#9ca3af' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {REVIEWS.map(r => (
          <div key={r.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>{r.logo}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{r.brand}</p>
                    <p style={{ fontSize: 12, color: '#9ca3af' }}>{r.campaign} · {r.date}</p>
                  </div>
                  <StarRating rating={r.rating} />
                </div>
                <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, marginBottom: 12 }}>{r.comment}</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => markHelpful(r.id)}
                    style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${helpful.has(r.id) ? '#8b5cf6' : '#e5e7eb'}`, background: helpful.has(r.id) ? '#ede9fe' : '#fff', color: helpful.has(r.id) ? '#7c3aed' : '#6b7280', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    👍 Helpful ({r.helpful + (helpful.has(r.id) ? 1 : 0)})
                  </button>
                  <button onClick={() => setSelected(r)}
                    style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    View Full
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 460, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>Review Details</h2>
              <button onClick={() => setSelected(null)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f3f4f6', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#f9fafb', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: selected.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 22 }}>{selected.logo}</div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{selected.brand}</p>
                <p style={{ fontSize: 13, color: '#6b7280' }}>{selected.campaign}</p>
                <StarRating rating={selected.rating} />
              </div>
            </div>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, marginBottom: 20 }}>{selected.comment}</p>
            <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>Reviewed on {selected.date}</p>
            <button onClick={() => setSelected(null)} style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
