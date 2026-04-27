'use client';

import { useState, useEffect } from 'react';
import Card from '../../../components/Card.js';
import Button from '../../../components/Button.js';
import { adminApi } from '../../../lib/api.js';
import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations('DashboardHome');
  const tAnalytics = useTranslations('Analytics');
  const tTimeFilters = useTranslations('TimeFilters');
  const [stats, setStats] = useState(null);
  const [businessStats, setBusinessStats] = useState(null);
  const [influencerStats, setInfluencerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('30d');

  const timeFilters = [
    { value: 'today', label: tTimeFilters('today') },
    { value: '7d', label: tTimeFilters('7d') },
    { value: '30d', label: tTimeFilters('30d') },
    { value: '60d', label: tTimeFilters('60d') },
    { value: '90d', label: tTimeFilters('90d') },
  ];

  useEffect(() => {
    fetchStats();
  }, [timeFilter]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [summaryRes, businessRes, influencerRes] = await Promise.all([
        adminApi('/analytics/summary'),
        adminApi(`/analytics/user-type?userType=business&period=${timeFilter}`),
        adminApi(`/analytics/user-type?userType=influencer&period=${timeFilter}`)
      ]);

      setStats(summaryRes);
      setBusinessStats(businessRes);
      setInfluencerStats(influencerRes);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };


  const StatCard = ({ title, value, change, icon, color = 'blue', subtitle }) => (
    <Card className="p-6 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800 dark:to-slate-900/50 border border-slate-200/60 dark:border-slate-700/60 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{icon}</span>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">{value || 0}</p>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
          {change && (
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-2 ${change > 0
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                  change > 0
                    ? "M5 10l7-7m0 0l7 7m-7-7v18"
                    : "M19 14l-7 7m0 0l-7-7m7 7V3"
                } />
              </svg>
              {change > 0 ? '+' : ''}{change}% {t('fromLastPeriod')}
            </div>
          )}
        </div>
      </div>
    </Card>
  );


  const MetricChart = ({ title, data, color = 'blue' }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        <div className={`w-3 h-3 rounded-full bg-${color}-500`}></div>
      </div>
      <div className="space-y-3">
        {data && data.length > 0 ? (
          data.slice(0, 5).map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full bg-${color}-500`}></div>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {new Date(item._id).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {item.applications || item.count || 0}
              </span>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-32 text-slate-500 dark:text-slate-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-sm">{t('noData')}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header with Time Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">{t('subtitle')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {timeFilters.map(filter => (
              <Button
                key={filter.value}
                variant={timeFilter === filter.value ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setTimeFilter(filter.value)}
                className="transition-all duration-200"
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                  <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                </div>
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16 mb-2"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
              </Card>
            </div>
          ))}
        </div>

        {/* Loading sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-40 mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                ))}
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-40 mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Welcome Message */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('welcome')}</h1>
            <p className="text-indigo-100 text-lg">{t('welcomeSub')}</p>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>{t('systemsOperational')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>⏰</span>
                <span>{t('lastUpdated')}: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {timeFilters.map(filter => (
              <Button
                key={filter.value}
                variant={timeFilter === filter.value ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setTimeFilter(filter.value)}
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white hover:text-white transition-all duration-200"
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('totalUsers')}
          value={(stats?.influencers || 0) + (stats?.businesses || 0)}
          subtitle={t('influencersAndBusinesses', { influencers: stats?.influencers || 0, businesses: stats?.businesses || 0 })}
          icon="👥"
          color="blue"
        />
        <StatCard
          title={t('activeOffers')}
          value={businessStats?.offers?.find(s => s._id === 'published')?.count || 0}
          subtitle={t('totalOffers', { count: businessStats?.offers?.reduce((sum, offer) => sum + offer.count, 0) || 0 })}
          icon="📦"
          color="green"
        />
        <StatCard
          title={t('pendingApplications')}
          value={influencerStats?.applications?.find(s => s._id === 'applied')?.count || 0}
          subtitle={t('approved', { count: influencerStats?.applications?.find(s => s._id === 'approved')?.count || 0 })}
          icon="📝"
          color="yellow"
        />
        <StatCard
          title={t('revenue')}
          value={`€${businessStats?.revenue?.total || 0}`}
          subtitle={t('transactions', { count: businessStats?.revenue?.transactions || 0 })}
          icon="💰"
          color="purple"
        />
      </div>

      {/* Business Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg">
              <span className="text-2xl">🏢</span>
            </div>
            {t('businessAnalytics')}
          </h2>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {t('showingDataFor')}: <span className="font-medium text-slate-700 dark:text-slate-300">{timeFilters.find(f => f.value === timeFilter)?.label}</span>
          </div>
        </div>

        {/* Business Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title={tAnalytics('totalBusinesses')}
            value={businessStats?.overview?.totalUsers || 0}
            subtitle={tAnalytics('registeredBusinesses')}
            icon="🏢"
            color="blue"
          />
          <StatCard
            title={tAnalytics('activeBusinesses')}
            value={businessStats?.overview?.activeUsers || 0}
            subtitle={tAnalytics('verifiedAndActive')}
            icon="✅"
            color="green"
          />
          <StatCard
            title={tAnalytics('newSignups')}
            value={businessStats?.overview?.newUsersInPeriod || 0}
            subtitle={tAnalytics('thisPeriod')}
            icon="📈"
            color="purple"
          />
          <StatCard
            title={tAnalytics('pendingReview')}
            value={businessStats?.overview?.pendingUsers || 0}
            subtitle={tAnalytics('awaitingVerification')}
            icon="⏳"
            color="orange"
          />
        </div>

        {/* Business Performance & Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Offer Statistics */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="text-xl">📋</span>
                {tAnalytics('offerPerformance')}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{t('totalOffers', { count: '' }).replace('0', '').trim()}</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {businessStats?.offers?.reduce((sum, offer) => sum + offer.count, 0) || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{tAnalytics('published')}</span>
                  <span className="font-semibold text-green-700 dark:text-green-400">
                    {businessStats?.offers?.find(o => o._id === 'published')?.count || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{tAnalytics('draft')}</span>
                  <span className="font-semibold text-yellow-700 dark:text-yellow-400">
                    {businessStats?.offers?.find(o => o._id === 'draft')?.count || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{t('revenue')}</span>
                  <span className="font-semibold text-purple-700 dark:text-purple-400">
                    €{businessStats?.revenue?.total || 0}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Business Applications Chart */}
          <div className="lg:col-span-2">
            <MetricChart
              title={tAnalytics('businessApplicationsTrend')}
              data={businessStats?.applicationTrends || []}
              color="blue"
            />
          </div>
        </div>
      </div>

      {/* Influencer Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/30 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            {t('influencerAnalytics')}
          </h2>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {t('showingDataFor')}: <span className="font-medium text-slate-700 dark:text-slate-300">{timeFilters.find(f => f.value === timeFilter)?.label}</span>
          </div>
        </div>

        {/* Influencer Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title={tAnalytics('totalInfluencers')}
            value={influencerStats?.overview?.totalUsers || 0}
            subtitle={tAnalytics('registeredInfluencers')}
            icon="👥"
            color="blue"
          />
          <StatCard
            title={tAnalytics('verifiedInfluencers')}
            value={influencerStats?.overview?.verifiedUsers || 0}
            subtitle={tAnalytics('profileVerified')}
            icon="✅"
            color="green"
          />
          <StatCard
            title={tAnalytics('newSignups')}
            value={influencerStats?.overview?.newUsersInPeriod || 0}
            subtitle={tAnalytics('thisPeriod')}
            icon="📈"
            color="purple"
          />
          <StatCard
            title={tAnalytics('pendingReview')}
            value={influencerStats?.overview?.pendingUsers || 0}
            subtitle={tAnalytics('awaitingVerification')}
            icon="⏳"
            color="orange"
          />
        </div>

        {/* Influencer Performance & Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Application Statistics */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="text-xl">📝</span>
                {tAnalytics('applicationStatus')}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{tAnalytics('totalApplications')}</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {influencerStats?.applications?.reduce((sum, app) => sum + app.count, 0) || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{tAnalytics('applied')}</span>
                  <span className="font-semibold text-blue-700 dark:text-blue-400">
                    {influencerStats?.applications?.find(a => a._id === 'applied')?.count || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{t('approved', { count: '' }).replace('0', '').trim()}</span>
                  <span className="font-semibold text-green-700 dark:text-green-400">
                    {influencerStats?.applications?.find(a => a._id === 'approved')?.count || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{tAnalytics('successRate')}</span>
                  <span className="font-semibold text-purple-700 dark:text-purple-400">
                    {influencerStats?.applications?.reduce((sum, app) => sum + app.count, 0) > 0
                      ? Math.round(((influencerStats?.applications?.find(a => a._id === 'approved')?.count || 0) /
                        influencerStats?.applications?.reduce((sum, app) => sum + app.count, 0)) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Influencer Applications Chart */}
          <div className="lg:col-span-2">
            <MetricChart
              title={tAnalytics('influencerApplicationsTrend')}
              data={influencerStats?.applicationTrends || []}
              color="green"
            />
          </div>
        </div>
      </div>

    </div>
  );
}