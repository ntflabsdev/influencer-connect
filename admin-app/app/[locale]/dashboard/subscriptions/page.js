"use client";

import { useEffect, useState } from 'react';
import { apiFetch, getToken } from '../../../../lib/api.js';
import Card from '../../../../components/Card.js';
import Button from '../../../../components/Button.js';
import Badge from '../../../../components/Badge.js';
import { useToast } from '../../../../components/ToastProvider.js';
import { 
  StatCard, 
  GradientCard, 
  GlassCard, 
  ActivityItem, 
  ProgressRing,
  QuickAction,
  ChartPlaceholder
} from '../../../../components/DesignSystem.js';

const predefinedFeatures = {
  influencer: [
    {
      id: 'offers_limit',
      label: 'Apply to offers',
      type: 'select',
      options: ['5/month', '10/month', 'unlimited'],
      defaultValue: 'unlimited'
    },
    {
      id: 'priority_visibility',
      label: 'Priority application visibility',
      type: 'checkbox'
    },
    {
      id: 'advanced_portfolio',
      label: 'Advanced portfolio (engagement stats, brands worked with)',
      type: 'checkbox'
    },
    {
      id: 'profile_boost',
      label: 'Profile boost (algorithm preference)',
      type: 'checkbox'
    },
    {
      id: 'full_chat',
      label: 'Full chat access',
      type: 'checkbox'
    },
    {
      id: 'campaign_reminders',
      label: 'Campaign reminders & deadlines',
      type: 'checkbox'
    },
    {
      id: 'featured_badge',
      label: 'Featured creator badge',
      type: 'checkbox'
    },
    {
      id: 'early_access',
      label: 'Early access to new offers',
      type: 'checkbox'
    },
    {
      id: 'advanced_analytics',
      label: 'Advanced analytics (views, saves, CTR*)',
      type: 'checkbox'
    },
    {
      id: 'ai_matching',
      label: 'AI-based offer matching',
      type: 'checkbox'
    },
    {
      id: 'priority_support',
      label: 'Priority support',
      type: 'checkbox'
    }
  ],
  business: [
    {
      id: 'offers_limit',
      label: 'Post offers',
      type: 'select',
      options: ['5/month', 'unlimited'],
      defaultValue: 'unlimited'
    },
    {
      id: 'advanced_filters',
      label: 'Advanced filters (location, niche, engagement)',
      type: 'checkbox'
    },
    {
      id: 'influencer_portfolios',
      label: 'Access influencer portfolios',
      type: 'checkbox'
    },
    {
      id: 'basic_analytics',
      label: 'Basic analytics (reach, content count)',
      type: 'checkbox'
    },
    {
      id: 'save_favorites',
      label: 'Save favorite influencers',
      type: 'checkbox'
    },
    {
      id: 'faster_support',
      label: 'Faster support',
      type: 'checkbox'
    },
    {
      id: 'featured_offers',
      label: 'Featured offers (homepage/map)',
      type: 'checkbox'
    },
    {
      id: 'ai_recommendations',
      label: 'AI influencer recommendations',
      type: 'checkbox'
    },
    {
      id: 'campaign_analytics',
      label: 'Campaign performance analytics',
      type: 'checkbox'
    },
    {
      id: 'multi_location',
      label: 'Multi-location support',
      type: 'checkbox'
    },
    {
      id: 'priority_applications',
      label: 'Priority influencer applications',
      type: 'checkbox'
    },
    {
      id: 'dedicated_support',
      label: 'Dedicated account support',
      type: 'checkbox'
    }
  ]
};

export default function SubscriptionsPage() {
  const DUMMY_PLANS = [
    { _id: 'sp1', name: 'Free Creator', description: 'Best for: New / nano influencers', price: 0, currency: 'EUR', interval: 'month', features: ['Apply to 5 offers/month'] },
    { _id: 'sp2', name: 'Creator Plus', description: 'Best for: Active micro influencers', price: 9.99, currency: 'EUR', interval: 'month', features: ['Unlimited offers', 'Priority visibility', 'Advanced portfolio', 'Full chat access'] },
    { _id: 'sp3', name: 'Creator Pro', description: 'Best for: Full-time creators', price: 19.99, currency: 'EUR', interval: 'month', features: ['All Plus features', 'Featured badge', 'AI matching', 'Priority support'] },
    { _id: 'sp4', name: 'Free Business', description: 'Best for: First-time businesses', price: 0, currency: 'EUR', interval: 'month', features: ['Post 5 offers/month'] },
    { _id: 'sp5', name: 'Business Basic', description: 'Best for: Small cafés, gyms, salons', price: 29, currency: 'EUR', interval: 'month', features: ['Unlimited offers', 'Advanced filters', 'Influencer portfolios', 'Basic analytics'] },
    { _id: 'sp6', name: 'Business Pro', description: 'Best for: Growing brands & chains', price: 79, currency: 'EUR', interval: 'month', features: ['All Basic features', 'Featured offers', 'AI recommendations', 'Campaign analytics', 'Dedicated support'] },
  ];
  const DUMMY_CUSTOM = [
    { _id: 'cp1', name: 'Enterprise Plan - TechBrand', description: 'Custom enterprise plan', price: 299, currency: 'EUR', interval: 'month', features: ['Unlimited everything', 'Dedicated account manager', 'Custom integrations'], businessId: 'b1' },
  ];

  const [subscriptionPlans, setSubscriptionPlans] = useState(DUMMY_PLANS);
  const [customPlans, setCustomPlans] = useState(DUMMY_CUSTOM);
  const [loading, setLoading] = useState(false);
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'EUR',
    interval: 'month',
    features: {},
    userId: '',
    selectedUser: null,
    userType: 'influencer',
    isCustom: false,
    isEditing: false,
    editingId: null
  });
  const [usersList, setUsersList] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const { push } = useToast();

  useEffect(() => {
    if (!getToken()) {
      push('Please login first', 'info');
      window.location.href = '/';
      return;
    }
    loadSubscriptionPlans();
  }, []);

  const loadSubscriptionPlans = async () => {
    setLoading(true);
    try {
      const mainPlans = await apiFetch('/api/admin/subscription-plans');
      setSubscriptionPlans(mainPlans.plans || []);
      const customData = await apiFetch('/api/admin/subscription-plans/custom');
      setCustomPlans(customData.plans || []);
    } catch {
      // Keep dummy plans on API failure
    } finally {
      setLoading(false);
    }
  };

  const createPredefinedPlan = async (userType, planType) => {
    setCreatingPlan(true);
    try {
      let planData;
      const featuresObj = {};

      if (userType === 'influencer') {
        if (planType === 'free') {
          featuresObj.offers_limit = '5/month';
        } else if (planType === 'plus') {
          featuresObj.offers_limit = 'unlimited';
          featuresObj.priority_visibility = true;
          featuresObj.advanced_portfolio = true;
          featuresObj.profile_boost = true;
          featuresObj.full_chat = true;
          featuresObj.campaign_reminders = true;
        } else if (planType === 'pro') {
          featuresObj.offers_limit = 'unlimited';
          featuresObj.priority_visibility = true;
          featuresObj.advanced_portfolio = true;
          featuresObj.profile_boost = true;
          featuresObj.full_chat = true;
          featuresObj.campaign_reminders = true;
          featuresObj.featured_badge = true;
          featuresObj.early_access = true;
          featuresObj.advanced_analytics = true;
          featuresObj.ai_matching = true;
          featuresObj.priority_support = true;
        }
      } else if (userType === 'business') {
        if (planType === 'free') {
          featuresObj.offers_limit = '5/month';
        } else if (planType === 'basic') {
          featuresObj.offers_limit = 'unlimited';
          featuresObj.advanced_filters = true;
          featuresObj.influencer_portfolios = true;
          featuresObj.basic_analytics = true;
          featuresObj.save_favorites = true;
          featuresObj.faster_support = true;
        } else if (planType === 'pro') {
          featuresObj.offers_limit = 'unlimited';
          featuresObj.advanced_filters = true;
          featuresObj.influencer_portfolios = true;
          featuresObj.basic_analytics = true;
          featuresObj.save_favorites = true;
          featuresObj.faster_support = true;
          featuresObj.featured_offers = true;
          featuresObj.ai_recommendations = true;
          featuresObj.campaign_analytics = true;
          featuresObj.multi_location = true;
          featuresObj.priority_applications = true;
          featuresObj.dedicated_support = true;
        }
      }

      const featuresArray = Object.entries(featuresObj)
        .filter(([key, value]) => value === true || (typeof value === 'string' && value))
        .map(([key, value]) => {
          const predefined = predefinedFeatures[userType]?.find(pf => pf.id === key);
          if (predefined) {
            if (predefined.type === 'select') {
              return `${predefined.label} ${value}`;
            } else {
              return predefined.label;
            }
          }
          return key;
        });

      if (userType === 'influencer') {
        if (planType === 'free') {
          planData = {
            name: 'Free Creator',
            description: 'Best for: New / nano influencers',
            price: 0,
            currency: 'EUR',
            interval: 'month',
            features: featuresArray
          };
        } else if (planType === 'plus') {
          planData = {
            name: 'Creator Plus',
            description: 'Best for: Active micro influencers',
            price: 9.99,
            currency: 'EUR',
            interval: 'month',
            features: featuresArray
          };
        } else if (planType === 'pro') {
          planData = {
            name: 'Creator Pro',
            description: 'Best for: Full-time creators',
            price: 19.99,
            currency: 'EUR',
            interval: 'month',
            features: featuresArray
          };
        }
      } else if (userType === 'business') {
        if (planType === 'free') {
          planData = {
            name: 'Free Business',
            description: 'Best for: First-time businesses',
            price: 0,
            currency: 'EUR',
            interval: 'month',
            features: featuresArray
          };
        } else if (planType === 'basic') {
          planData = {
            name: 'Business Basic',
            description: 'Best for: Small cafés, gyms, salons',
            price: 29,
            currency: 'EUR',
            interval: 'month',
            features: featuresArray
          };
        } else if (planType === 'pro') {
          planData = {
            name: 'Business Pro',
            description: 'Best for: Growing brands & chains',
            price: 79,
            currency: 'EUR',
            interval: 'month',
            features: featuresArray
          };
        }
      }

      await apiFetch('/api/admin/subscription-plans', { method: 'POST', body: planData });
      push(`${planData.name} plan created successfully`, 'success');
      await loadSubscriptionPlans();
    } catch (err) {
      push('Failed to create plan', 'error');
    } finally {
      setCreatingPlan(false);
    }
  };

  if (loading && subscriptionPlans.length === 0) {
    return <div className="text-center py-8">Loading subscription plans...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💎 Subscription Management</h1>
          <p className="text-gray-600 mt-1">Create and manage subscription plans</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadSubscriptionPlans}
            disabled={loading}
            className="px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {/* ── Subscription Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Plans"
          value={subscriptionPlans.length + customPlans.length}
          subtitle="Total available"
          icon="📋"
          accent="#4f46e5"
          accentBg="#eef2ff"
        />
        <StatCard
          title="Free Plans"
          value="2"
          subtitle="No cost plans"
          icon="🆓"
          accent="#10b981"
          accentBg="#d1fae5"
        />
        <StatCard
          title="Premium Plans"
          value="4"
          subtitle="Paid subscriptions"
          icon="💎"
          accent="#f59e0b"
          accentBg="#fef3c7"
        />
        <StatCard
          title="Custom Plans"
          value={customPlans.length}
          subtitle="User specific"
          icon="🎯"
          accent="#8b5cf6"
          accentBg="#f3f4f6"
        />
      </div>

      {/* ── Quick Create Plans ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Influencer Plans */}
        <GradientCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">👤</span>
            <h3 className="text-xl font-semibold text-white">Influencer Plans</h3>
          </div>

          <div className="space-y-4">
            {/* Free Creator */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-white">🆓 Free Creator</h4>
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-lg text-sm font-medium">Free</span>
              </div>
              <p className="text-white/80 text-sm mb-4">Best for: New / nano influencers</p>
              <button
                onClick={() => createPredefinedPlan('influencer', 'free')}
                className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all font-medium"
                disabled={creatingPlan}
              >
                {creatingPlan ? 'Creating...' : '✨ Create Free Plan'}
              </button>
            </div>

            {/* Creator Plus */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-white">⭐ Creator Plus</h4>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm font-medium">€9.99/month</span>
              </div>
              <p className="text-white/80 text-sm mb-4">Best for: Active micro influencers</p>
              <button
                onClick={() => createPredefinedPlan('influencer', 'plus')}
                className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all font-medium"
                disabled={creatingPlan}
              >
                {creatingPlan ? 'Creating...' : '✨ Create Plus Plan'}
              </button>
            </div>

            {/* Creator Pro */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-white">🚀 Creator Pro</h4>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm font-medium">€19.99/month</span>
              </div>
              <p className="text-white/80 text-sm mb-4">Best for: Full-time creators</p>
              <button
                onClick={() => createPredefinedPlan('influencer', 'pro')}
                className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all font-medium"
                disabled={creatingPlan}
              >
                {creatingPlan ? 'Creating...' : '✨ Create Pro Plan'}
              </button>
            </div>
          </div>
        </GradientCard>

        {/* Business Plans */}
        <GradientCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🏪</span>
            <h3 className="text-xl font-semibold text-white">Business Plans</h3>
          </div>

          <div className="space-y-4">
            {/* Free Business */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-white">🆓 Free Business</h4>
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-lg text-sm font-medium">Free</span>
              </div>
              <p className="text-white/80 text-sm mb-4">Best for: First-time businesses</p>
              <button
                onClick={() => createPredefinedPlan('business', 'free')}
                className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all font-medium"
                disabled={creatingPlan}
              >
                {creatingPlan ? 'Creating...' : '✨ Create Free Plan'}
              </button>
            </div>

            {/* Business Basic */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-white">⭐ Business Basic</h4>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm font-medium">€29/month</span>
              </div>
              <p className="text-white/80 text-sm mb-4">Best for: Small cafés, gyms, salons</p>
              <button
                onClick={() => createPredefinedPlan('business', 'basic')}
                className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all font-medium"
                disabled={creatingPlan}
              >
                {creatingPlan ? 'Creating...' : '✨ Create Basic Plan'}
              </button>
            </div>

            {/* Business Pro */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-white">🚀 Business Pro</h4>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm font-medium">€79/month</span>
              </div>
              <p className="text-white/80 text-sm mb-4">Best for: Growing brands & chains</p>
              <button
                onClick={() => createPredefinedPlan('business', 'pro')}
                className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all font-medium"
                disabled={creatingPlan}
              >
                {creatingPlan ? 'Creating...' : '✨ Create Pro Plan'}
              </button>
            </div>
          </div>
        </GradientCard>
      </div>

      {/* ── Existing Plans Display ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Main Plans */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-3">
            <span className="text-2xl">📋</span>
            Main Subscription Plans
          </h3>
          <div className="space-y-4">
            {subscriptionPlans.map((plan) => (
              <div key={plan._id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900 text-lg">{plan.name}</h4>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-indigo-600">
                      {plan.currency === 'EUR' ? '€' : plan.currency === 'USD' ? '$' : '£'}{plan.price}
                      {plan.price > 0 && <span className="text-sm font-normal text-gray-500">/{plan.interval}</span>}
                    </span>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium">Main</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    💎 {plan.features?.length || 0} features included
                  </div>
                  <button onClick={() => push(`${plan.name}: ${plan.features?.join(', ') || 'No features listed'}`, 'info')} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                    View Details →
                  </button>
                </div>
              </div>
            ))}
            {subscriptionPlans.length === 0 && (
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-8">
                <div className="text-center">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="text-gray-500">No main subscription plans created yet.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Custom Plans */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            Custom Business Plans
          </h3>
          <div className="space-y-4">
            {customPlans.map((plan) => (
              <div key={plan._id} className="bg-white rounded-2xl border border-amber-200 p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900 text-lg">{plan.name}</h4>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-amber-600">
                      {plan.currency === 'EUR' ? '€' : plan.currency === 'USD' ? '$' : '£'}{plan.price}
                      {plan.price > 0 && <span className="text-sm font-normal text-gray-500">/{plan.interval}</span>}
                    </span>
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium">Custom</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-3">{plan.description}</p>
                <div className="bg-amber-50 text-amber-700 px-3 py-2 rounded-lg text-sm mb-3">
                  🏢 {plan.businessId || plan.userId ? 'Business' : 'Influencer'} ID: {plan.businessId || plan.userId || 'N/A'}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    💎 {plan.features?.length || 0} features included
                  </div>
                  <button onClick={() => push(`${plan.name}: ${plan.features?.join(', ') || 'No features listed'}`, 'info')} className="text-amber-600 hover:text-amber-700 text-sm font-medium">
                    View Details →
                  </button>
                </div>
              </div>
            ))}
            {customPlans.length === 0 && (
              <div className="bg-white rounded-2xl border-2 border-dashed border-amber-200 p-8">
                <div className="text-center">
                  <div className="text-4xl mb-3">🎯</div>
                  <p className="text-gray-500">No custom plans created yet.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}