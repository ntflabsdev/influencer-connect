"use client";

import { useState } from 'react';

const INFLUENCERS = [
  { id: 1, name: 'Priya Sharma', handle: '@priyastyle', avatar: 'P', color: '#ec4899', category: 'Fashion', followers: '12L', engagement: '4.8%', platforms: ['Instagram', 'Moj'], location: 'Mumbai, Maharashtra', rating: 4.9, campaigns: 48, bio: 'Fashion & lifestyle creator. Worked with 20+ Indian brands.', verified: true, price: '₹21,000–₹42,000' },
  { id: 2, name: 'Rahul Verma', handle: '@rahultech', avatar: 'R', color: '#3b82f6', category: 'Technology', followers: '8.9L', engagement: '5.2%', platforms: ['YouTube', 'Instagram'], location: 'Bengaluru, Karnataka', rating: 4.8, campaigns: 32, bio: 'Tech reviewer & gadget enthusiast. Honest, in-depth reviews.', verified: true, price: '₹25,000–₹50,000' },
  { id: 3, name: 'Anjali Singh', handle: '@anjalifitness', avatar: 'A', color: '#10b981', category: 'Health & Fitness', followers: '6.5L', engagement: '6.1%', platforms: ['Instagram', 'YouTube'], location: 'Delhi, NCR', rating: 4.7, campaigns: 25, bio: 'Certified personal trainer & wellness advocate.', verified: true, price: '₹12,000–₹29,000' },
  { id: 4, name: 'Vikram Patel', handle: '@vikramfood', avatar: 'V', color: '#f59e0b', category: 'Food & Beverage', followers: '4.2L', engagement: '7.3%', platforms: ['Moj', 'Instagram'], location: 'Ahmedabad, Gujarat', rating: 4.9, campaigns: 61, bio: 'Food critic & recipe creator. Authentic taste tests.', verified: false, price: '₹8,000–₹21,000' },
  { id: 5, name: 'Kavya Nair', handle: '@kavyatravel', avatar: 'K', color: '#8b5cf6', category: 'Travel', followers: '7.8L', engagement: '4.5%', platforms: ['Instagram', 'YouTube'], location: 'Kochi, Kerala', rating: 4.6, campaigns: 38, bio: 'Travel blogger. Visited all 28 states of India.', verified: true, price: '₹17,000–₹37,500' },
  { id: 6, name: 'Neha Gupta', handle: '@nehabeauty', avatar: 'N', color: '#f472b6', category: 'Beauty', followers: '15L', engagement: '5.7%', platforms: ['Moj', 'Instagram'], location: 'Jaipur, Rajasthan', rating: 4.8, campaigns: 72, bio: 'Beauty & skincare expert. Honest product reviews.', verified: true, price: '₹29,000–₹58,000' },
  { id: 7, name: 'Aryan Kapoor', handle: '@aryangaming', avatar: 'A', color: '#ef4444', category: 'Gaming', followers: '3.2L', engagement: '8.9%', platforms: ['YouTube', 'Twitch'], location: 'Pune, Maharashtra', rating: 4.5, campaigns: 19, bio: 'Pro gamer & content creator. Peripheral & game reviews.', verified: false, price: '₹6,500–₹17,000' },
  { id: 8, name: 'Simran Kaur', handle: '@simranlifestyle', avatar: 'S', color: '#06b6d4', category: 'Lifestyle', followers: '5.6L', engagement: '5.4%', platforms: ['Instagram', 'Moj'], location: 'Chandigarh, Punjab', rating: 4.7, campaigns: 44, bio: 'Lifestyle content creator. Aspirational Indian living.', verified: true, price: '₹18,000–₹40,000' },
];

const CATEGORIES = ['All', 'Fashion', 'Technology', 'Health & Fitness', 'Food & Beverage', 'Travel', 'Beauty', 'Gaming', 'Lifestyle'];

export default function BusinessDiscoverPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('followers');
  const [selected, setSelected] = useState(null);
  const [invited, setInvited] = useState(new Set());

  const filtered = INFLUENCERS
    .filter(inf => {
      if (category !== 'All' && inf.category !== category) return false;
      if (search && !inf.name.toLowerCase().includes(search.toLowerCase()) && !inf.handle.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'followers') return parseFloat(b.followers) - parseFloat(a.followers);
      if (sortBy === 'engagement') return parseFloat(b.engagement) - parseFloat(a.engagement);
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

  const toggleInvite = (id) => {
    setInvited(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>🔍 Discover Influencers</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>Find the perfect creators for your campaigns</p>
      </div>

      {/* Search & Filters */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or handle..."
              style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 9, paddingBottom: 9, border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ padding: '9px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff' }}>
            <option value="followers">Sort: Followers</option>
            <option value="engagement">Sort: Engagement</option>
            <option value="rating">Sort: Rating</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              style={{ padding: '6px 14px', borderRadius: 20, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: category === c ? '#0ea5e9' : '#f3f4f6', color: category === c ? '#fff' : '#6b7280' }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p style={{ fontSize: 13, color: '#6b7280' }}>Showing <strong style={{ color: '#111827' }}>{filtered.length}</strong> influencers</p>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {filtered.map(inf => (
          <div key={inf.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            {/* Card Header */}
            <div style={{ height: 80, background: `linear-gradient(135deg, ${inf.color}22, ${inf.color}44)`, position: 'relative' }}>
              <div style={{ position: 'absolute', bottom: -24, left: 20, width: 52, height: 52, borderRadius: 14, background: inf.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 22, border: '3px solid #fff' }}>
                {inf.avatar}
              </div>
              {inf.verified && (
                <div style={{ position: 'absolute', top: 12, right: 12, background: '#0ea5e9', borderRadius: 20, padding: '3px 8px', fontSize: 10, fontWeight: 700, color: '#fff' }}>
                  ✓ Verified
                </div>
              )}
            </div>

            <div style={{ padding: '32px 20px 20px' }}>
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{inf.name}</h3>
                </div>
                <p style={{ fontSize: 12, color: '#9ca3af' }}>{inf.handle} · {inf.location}</p>
              </div>

              <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5, marginBottom: 12 }}>{inf.bio}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                <div style={{ background: '#f9fafb', borderRadius: 8, padding: '8px', textAlign: 'center' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{inf.followers}</p>
                  <p style={{ fontSize: 10, color: '#9ca3af' }}>Followers</p>
                </div>
                <div style={{ background: '#f9fafb', borderRadius: 8, padding: '8px', textAlign: 'center' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>{inf.engagement}</p>
                  <p style={{ fontSize: 10, color: '#9ca3af' }}>Engagement</p>
                </div>
                <div style={{ background: '#f9fafb', borderRadius: 8, padding: '8px', textAlign: 'center' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b' }}>⭐ {inf.rating}</p>
                  <p style={{ fontSize: 10, color: '#9ca3af' }}>Rating</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 4, marginBottom: 14, flexWrap: 'wrap' }}>
                <span style={{ background: '#f3f4f6', color: '#374151', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 500 }}>{inf.category}</span>
                {inf.platforms.map(p => (
                  <span key={p} style={{ background: '#f3f4f6', color: '#374151', borderRadius: 6, padding: '3px 8px', fontSize: 11 }}>{p}</span>
                ))}
              </div>

              <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 12 }}>💰 Rate: <strong style={{ color: '#374151' }}>{inf.price}</strong></p>

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setSelected(inf)}
                  style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  View Profile
                </button>
                <button onClick={() => toggleInvite(inf.id)}
                  style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: invited.has(inf.id) ? '#dcfce7' : '#0ea5e9', color: invited.has(inf.id) ? '#059669' : '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  {invited.has(inf.id) ? '✓ Invited' : 'Invite'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Profile Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ height: 100, background: `linear-gradient(135deg, ${selected.color}, ${selected.color}88)`, borderRadius: '20px 20px 0 0', position: 'relative' }}>
              <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.2)', cursor: 'pointer', color: '#fff', fontSize: 16 }}>✕</button>
              <div style={{ position: 'absolute', bottom: -28, left: 24, width: 60, height: 60, borderRadius: 16, background: selected.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 26, border: '4px solid #fff' }}>
                {selected.avatar}
              </div>
            </div>
            <div style={{ padding: '40px 24px 24px' }}>
              <div style={{ marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{selected.name}</h2>
                <p style={{ fontSize: 13, color: '#9ca3af' }}>{selected.handle} · {selected.location}</p>
                <p style={{ fontSize: 13, color: '#6b7280', marginTop: 8, lineHeight: 1.6 }}>{selected.bio}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[
                  { label: 'Followers', value: selected.followers },
                  { label: 'Engagement', value: selected.engagement },
                  { label: 'Rating', value: `⭐ ${selected.rating}` },
                  { label: 'Campaigns Done', value: selected.campaigns },
                  { label: 'Category', value: selected.category },
                  { label: 'Rate', value: selected.price },
                ].map(item => (
                  <div key={item.label} style={{ background: '#f9fafb', borderRadius: 10, padding: '12px 14px' }}>
                    <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{item.label}</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setSelected(null)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Close</button>
                <button onClick={() => { toggleInvite(selected.id); setSelected(null); }}
                  style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: invited.has(selected.id) ? '#dcfce7' : '#0ea5e9', color: invited.has(selected.id) ? '#059669' : '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  {invited.has(selected.id) ? '✓ Already Invited' : '📨 Send Invite'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
