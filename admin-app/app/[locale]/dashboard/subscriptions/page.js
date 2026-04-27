"use client";

import { useEffect, useState } from 'react';
import { apiFetch, getToken } from '../../../../lib/api.js';
import Card from '../../../../components/Card.js';
import Button from '../../../../components/Button.js';
import Badge from '../../../../components/Badge.js';
import { useToast } from '../../../../components/ToastProvider.js';

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
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [customPlans, setCustomPlans] = useState([]);
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
    } catch (err) {
      push('Failed to load subscription plans', 'error');
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Subscription Management</h1>
          <p className="text-slate-600 dark:text-slate-400">Create and manage subscription plans</p>
        </div>
      </div>

      {/* Quick Create Plans */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Influencer Plans */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👤</span>
            <h3 className="text-lg font-semibold">Influencer Plans</h3>
          </div>

          <div className="space-y-4">
            {/* Free Creator */}
            <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-500/10">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-green-800 dark:text-green-200">🆓 Free Creator</h4>
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">Free</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mb-3">Best for: New / nano influencers</p>
              <Button
                onClick={() => createPredefinedPlan('influencer', 'free')}
                className="w-full"
                disabled={creatingPlan}
              >
                {creatingPlan ? 'Creating...' : 'Create Free Plan'}
              </Button>
            </div>

            {/* Creator Plus */}
            <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-500/10">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200">⭐ Creator Plus</h4>
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">€9.99/month</span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">Best for: Active micro influencers</p>
              <Button
                onClick={() => createPredefinedPlan('influencer', 'plus')}
                className="w-full"
                disabled={creatingPlan}
              >
                {creatingPlan ? 'Creating...' : 'Create Plus Plan'}
              </Button>
            </div>

            {/* Creator Pro */}
            <div className="border rounded-lg p-4 bg-purple-50 dark:bg-purple-500/10">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-purple-800 dark:text-purple-200">🚀 Creator Pro</h4>
                <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">€19.99/month</span>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">Best for: Full-time creators</p>
              <Button
                onClick={() => createPredefinedPlan('influencer', 'pro')}
                className="w-full"
                disabled={creatingPlan}
              >
                {creatingPlan ? 'Creating...' : 'Create Pro Plan'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Business Plans */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏪</span>
            <h3 className="text-lg font-semibold">Business Plans</h3>
          </div>

          <div className="space-y-4">
            {/* Free Business */}
            <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-500/10">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-green-800 dark:text-green-200">🆓 Free Business</h4>
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">Free</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mb-3">Best for: First-time businesses</p>
              <Button
                onClick={() => createPredefinedPlan('business', 'free')}
                className="w-full"
                disabled={creatingPlan}
              >
                {creatingPlan ? 'Creating...' : 'Create Free Plan'}
              </Button>
            </div>

            {/* Business Basic */}
            <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-500/10">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200">⭐ Business Basic</h4>
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">€29/month</span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">Best for: Small cafés, gyms, salons</p>
              <Button
                onClick={() => createPredefinedPlan('business', 'basic')}
                className="w-full"
                disabled={creatingPlan}
              >
                {creatingPlan ? 'Creating...' : 'Create Basic Plan'}
              </Button>
            </div>

            {/* Business Pro */}
            <div className="border rounded-lg p-4 bg-purple-50 dark:bg-purple-500/10">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-purple-800 dark:text-purple-200">🚀 Business Pro</h4>
                <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">€79/month</span>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">Best for: Growing brands & chains</p>
              <Button
                onClick={() => createPredefinedPlan('business', 'pro')}
                className="w-full"
                disabled={creatingPlan}
              >
                {creatingPlan ? 'Creating...' : 'Create Pro Plan'}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Existing Plans Display */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Main Plans */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-indigo-600">📋</span>
            Main Subscription Plans
          </h3>
          <div className="space-y-3">
            {subscriptionPlans.map((plan) => (
              <Card key={plan._id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-indigo-800 dark:text-indigo-200">{plan.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-indigo-600">
                      {plan.currency === 'EUR' ? '€' : plan.currency === 'USD' ? '$' : '£'}{plan.price}
                      {plan.price > 0 && <span className="text-sm font-normal text-slate-500">/{plan.interval}</span>}
                    </span>
                    <Badge>Main</Badge>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{plan.description}</p>
                <div className="text-xs text-slate-500">
                  {plan.features?.length || 0} features included
                </div>
              </Card>
            ))}
            {subscriptionPlans.length === 0 && (
              <Card className="border-dashed">
                <p className="text-center text-slate-500 py-8">No main subscription plans created yet.</p>
              </Card>
            )}
          </div>
        </div>

        {/* Custom Plans */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-amber-600">🎯</span>
            Custom Business Plans
          </h3>
          <div className="space-y-3">
            {customPlans.map((plan) => (
              <Card key={plan._id} className="space-y-3 border-amber-200 dark:border-amber-500/30">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-amber-800 dark:text-amber-200">{plan.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-amber-600">
                      {plan.currency === 'EUR' ? '€' : plan.currency === 'USD' ? '$' : '£'}{plan.price}
                      {plan.price > 0 && <span className="text-sm font-normal text-slate-500">/{plan.interval}</span>}
                    </span>
                    <Badge variant="secondary">Custom</Badge>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{plan.description}</p>
                <p className="text-xs text-slate-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded">
                  {plan.businessId || plan.userId ? 'Business' : 'Influencer'} ID: {plan.businessId || plan.userId || 'N/A'}
                </p>
                <div className="text-xs text-slate-500">
                  {plan.features?.length || 0} features included
                </div>
              </Card>
            ))}
            {customPlans.length === 0 && (
              <Card className="border-dashed border-amber-200 dark:border-amber-500/30">
                <p className="text-center text-slate-500 py-8">No custom plans created yet.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}