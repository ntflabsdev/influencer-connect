"use client";

import { useEffect, useState } from 'react';
import { adminApi } from '../../../../lib/api.js';
import Card from '../../../../components/Card.js';
import Button from '../../../../components/Button.js';
import Badge from '../../../../components/Badge.js';
import { useToast } from '../../../../components/ToastProvider.js';
import { useTranslations } from 'next-intl';

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [selectedOffers, setSelectedOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    flagged: '',
    search: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [offerDetails, setOfferDetails] = useState(null);
  const { push } = useToast();
  const t = useTranslations('Offers');
  const tCommon = useTranslations('Common');
  const tToasts = useTranslations('Toasts');

  useEffect(() => {
    loadOffers();
  }, [filters]);

  const loadOffers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const data = await adminApi(`/offers?${queryParams.toString()}`);
      setOffers(data.offers || []);
      setPagination(data.pagination);
    } catch (err) {
      push(tToasts('loadFailed', { type: tCommon('offers').toLowerCase() }), 'error');
      console.error('Offers load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadOfferDetails = async (offerId) => {
    try {
      const data = await adminApi(`/offers/${offerId}`);
      setOfferDetails(data);
      setSelectedOffer(offerId);
    } catch (err) {
      push(tToasts('loadDetailFailed'), 'error');
    }
  };

  const updateOfferStatus = async (offerId, status, notes = '') => {
    try {
      await adminApi(`/offers/${offerId}/status`, {
        method: 'PATCH',
        body: { status, notes }
      });

      const statusMessages = {
        open: tToasts('approved', { type: tCommon('influencer') }), // Re-using approved for publish
        paused: tToasts('suspended', { type: tCommon('influencer') }), // Paused/Suspended same translation
        closed: tToasts('rejected', { type: tCommon('influencer') }) // Closed/Rejected
      };

      push(statusMessages[status] || tToasts('updated', { type: tCommon('influencer') }), 'success');
      loadOffers();
      if (selectedOffer === offerId) {
        setSelectedOffer(null);
        setOfferDetails(null);
      }
    } catch (err) {
      push(tToasts('saveFailed', { type: tCommon('influencer') }), 'error');
    }
  };

  const bulkUpdateOffers = async (action, reason = '') => {
    if (selectedOffers.length === 0) {
      push(tToasts('selectFirst'), 'warning');
      return;
    }

    try {
      const data = await adminApi('/offers/bulk-update', {
        method: 'POST',
        body: { offerIds: selectedOffers, action, reason }
      });

      const actionMessages = {
        approve: tToasts('approved', { type: tCommon('offers') }),
        pause: tToasts('suspended', { type: tCommon('offers') }),
        close: tToasts('rejected', { type: tCommon('offers') }),
        flag: t('bulk.flag'),
        unflag: t('bulk.flag') // Assuming unflag or generic
      };

      push(`${actionMessages[action]} (${data.modifiedCount} ${tToasts('updated', { type: '' }).trim()})`, 'success');
      setSelectedOffers([]);
      setShowBulkActions(false);
      loadOffers();
    } catch (err) {
      push(tToasts('saveFailed', { type: tCommon('offers') }), 'error');
    }
  };

  const toggleOfferSelection = (offerId) => {
    setSelectedOffers(prev =>
      prev.includes(offerId)
        ? prev.filter(id => id !== offerId)
        : [...prev, offerId]
    );
  };

  const toggleAllOffers = () => {
    if (selectedOffers.length === offers.length) {
      setSelectedOffers([]);
    } else {
      setSelectedOffers(offers.map(offer => offer._id));
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'open': return 'success';
      case 'draft': return 'warning';
      case 'paused': return 'info';
      case 'closed': return 'danger';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && offers.length === 0) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64 mb-2"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-12"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {t('total')}: <span className="font-semibold text-slate-700 dark:text-slate-300">{pagination?.total || 0}</span>
          </div>
          <Button
            variant="primary"
            onClick={loadOffers}
            disabled={loading}
          >
            {loading ? t('refreshing') : t('refresh')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('filters.status')}:</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
              className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700"
            >
              <option value="">{t('filters.allStatus')}</option>
              <option value="draft">{t('filters.draft') || 'Draft'}</option>
              <option value="open">{t('filters.open') || 'Open'}</option>
              <option value="paused">{t('filters.paused') || 'Paused'}</option>
              <option value="closed">{t('filters.closed') || 'Closed'}</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('filters.flagged')}:</label>
            <select
              value={filters.flagged}
              onChange={(e) => setFilters(prev => ({ ...prev, flagged: e.target.value, page: 1 }))}
              className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700"
            >
              <option value="">{t('filters.allStatus')}</option>
              <option value="true">{t('filters.flaggedOnly')}</option>
              <option value="false">{t('filters.notFlagged')}</option>
            </select>
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-64">
            <input
              type="text"
              placeholder={t('filters.placeholder')}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              className="flex-1 px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700"
            />
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setFilters({ status: '', flagged: '', search: '', page: 1, limit: 20 })}
          >
            {t('filters.clear')}
          </Button>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedOffers.length > 0 && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {t('bulk.selected', { count: selectedOffers.length })}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => bulkUpdateOffers('approve')}
              >
                {t('bulk.approve')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => bulkUpdateOffers('pause')}
              >
                {t('bulk.pause')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => bulkUpdateOffers('close')}
              >
                {t('bulk.close')}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => bulkUpdateOffers('flag', t('bulk.flagReason') || 'Bulk flagged by admin')}
              >
                {t('bulk.flag')}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Offers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <Card key={offer._id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-3 mb-4">
              <input
                type="checkbox"
                checked={selectedOffers.includes(offer._id)}
                onChange={() => toggleOfferSelection(offer._id)}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={getStatusBadgeColor(offer.status)}>
                    {offer.status.toUpperCase()}
                  </Badge>
                  {offer.policy?.flagged && (
                    <Badge variant="danger">{t('filters.flagged').toUpperCase()}</Badge>
                  )}
                </div>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 truncate mb-1">
                  {offer.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                  {offer.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">{t('card.business')}:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100 truncate ml-2">
                      {offer.business?.businessName || t('unknown')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">{t('card.reward')}:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(offer.reward?.cash)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">{t('card.applications')}:</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {offer.stats?.totalApplications || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">{t('card.approved')}:</span>
                    <span className="font-medium text-purple-600 dark:text-purple-400">
                      {offer.stats?.approvedApplications || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => loadOfferDetails(offer._id)}
                className="flex-1"
              >
                {t('card.viewDetails')}
              </Button>

              {offer.status === 'draft' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => updateOfferStatus(offer._id, 'open')}
                  className="flex-1"
                >
                  {t('card.approve')}
                </Button>
              )}

              {offer.status === 'open' && (
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => updateOfferStatus(offer._id, 'paused')}
                  className="flex-1"
                >
                  {t('card.pause')}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {t('pagination.showing', {
              start: ((pagination.page - 1) * pagination.limit) + 1,
              end: Math.min(pagination.page * pagination.limit, pagination.total),
              total: pagination.total
            })}
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              {t('pagination.previous')}
            </Button>
            <span className="px-3 py-1 text-sm text-slate-700 dark:text-slate-300">
              {t('pagination.page', { current: pagination.page, total: pagination.pages })}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page >= pagination.pages}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              {t('pagination.next')}
            </Button>
          </div>
        </div>
      )}

      {/* Offer Details Modal */}
      {offerDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('modal.title')}</h2>
                <button
                  onClick={() => {
                    setSelectedOffer(null);
                    setOfferDetails(null);
                  }}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Offer Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      {offerDetails.offer.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {offerDetails.offer.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">{t('filters.status')}:</span>
                      <Badge variant={getStatusBadgeColor(offerDetails.offer.status)} className="ml-2">
                        {offerDetails.offer.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">{t('card.reward')}:</span>
                      <span className="font-medium text-green-600 dark:text-green-400 ml-2">
                        {formatCurrency(offerDetails.offer.reward?.cash)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">{t('card.business')}:</span>
                      <span className="font-medium ml-2">{offerDetails.offer.business?.businessName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">{tUsers('profile.joined')}:</span>
                      <span className="font-medium ml-2">{formatDate(offerDetails.offer.createdAt)}</span>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">{t('modal.requirements')}</h4>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      {offerDetails.offer.requirements?.map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          {req}
                        </li>
                      )) || <li>{t('modal.noRequirements')}</li>}
                    </ul>
                  </div>
                </div>

                {/* Applications */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                      {t('modal.applications', { count: offerDetails.applications.total })}
                    </h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {offerDetails.applications.list.map((app) => (
                        <div key={app._id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {app.influencer?.name}
                            </span>
                            <Badge variant={app.status === 'approved' ? 'success' : app.status === 'applied' ? 'warning' : 'secondary'}>
                              {t(`status.${app.status}`) || app.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                            {t('modal.followers', { count: app.influencer?.statistics?.totalFollowers || 0 })}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {t('modal.appliedDate', { date: formatDate(app.createdAt) })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                {offerDetails.offer.status === 'draft' && (
                  <Button
                    variant="primary"
                    onClick={() => updateOfferStatus(offerDetails.offer._id, 'open')}
                  >
                    {t('modal.approvePublish')}
                  </Button>
                )}

                {offerDetails.offer.status === 'open' && (
                  <>
                    <Button
                      variant="warning"
                      onClick={() => updateOfferStatus(offerDetails.offer._id, 'paused')}
                    >
                      {t('modal.pauseOffer')}
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => updateOfferStatus(offerDetails.offer._id, 'closed')}
                    >
                      {t('modal.closeOffer')}
                    </Button>
                  </>
                )}

                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelectedOffer(null);
                    setOfferDetails(null);
                  }}
                >
                  {tUsers('actions.close')}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {offers.length === 0 && !loading && (
        <Card className="p-12">
          <div className="text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              {t('empty.title')}
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              {filters.status || filters.flagged || filters.search
                ? t('empty.adjustFilters')
                : t('empty.noMatching')}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}