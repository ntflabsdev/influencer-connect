"use client";

import { useState, useEffect } from 'react';
import { adminApi } from '../../../../lib/api.js';
import Card from '../../../../components/Card.js';
import Button from '../../../../components/Button.js';
import Badge from '../../../../components/Badge.js';
import { useTranslations } from 'next-intl';

export default function PlatformSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const t = useTranslations('Settings');
  const tCommon = useTranslations('Common');

  const tabs = [
    { id: 'general', label: t('tabs.general'), icon: '🏠' },
    { id: 'features', label: t('tabs.features'), icon: '⚡' },
    { id: 'security', label: t('tabs.security'), icon: '🔒' },
    { id: 'email', label: t('tabs.email'), icon: '📧' },
    { id: 'moderation', label: t('tabs.moderation'), icon: '🛡️' },
    { id: 'payments', label: t('tabs.payments'), icon: '💳' },
    { id: 'uploads', label: t('tabs.uploads'), icon: '📁' },
    { id: 'social', label: t('tabs.social'), icon: '📱' },
    { id: 'analytics', label: t('tabs.analytics'), icon: '📊' }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await adminApi('/settings');
      setSettings(data.settings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await adminApi('/settings', {
        method: 'PATCH',
        body: settings
      });
      alert(t('alerts.saveSuccess'));
    } catch (error) {
      alert(t('alerts.saveFailed') + ': ' + (error.message || ''));
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = async () => {
    if (!confirm(t('alerts.resetConfirm'))) return;

    try {
      const data = await adminApi('/settings/reset', { method: 'POST' });
      setSettings(data.settings);
      alert(t('alerts.resetSuccess'));
    } catch (error) {
      alert(t('alerts.resetFailed') + ': ' + (error.message || ''));
    }
  };

  const updateSetting = (path, value) => {
    const keys = path.split('.');
    const newSettings = { ...settings };
    let current = newSettings;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setSettings(newSettings);
  };

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">{t('general.platformInfo')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('general.platformName')}
            </label>
            <input
              type="text"
              value={settings?.platform?.name || ''}
              onChange={(e) => updateSetting('platform.name', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('general.version')}
            </label>
            <input
              type="text"
              value={settings?.platform?.version || ''}
              onChange={(e) => updateSetting('platform.version', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t('general.description')}
          </label>
          <textarea
            value={settings?.platform?.description || ''}
            onChange={(e) => updateSetting('platform.description', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">{t('general.maintenanceMode')}</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings?.platform?.maintenance || false}
              onChange={(e) => updateSetting('platform.maintenance', e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-600"
            />
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('general.enableMaintenance')}
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('general.maintenanceMessage')}
            </label>
            <textarea
              value={settings?.platform?.maintenanceMessage || ''}
              onChange={(e) => updateSetting('platform.maintenanceMessage', e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeaturesTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">{t('features.toggle')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(settings?.features || {}).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {key === 'userRegistration' && t('features.userRegistration')}
                  {key === 'influencerApplications' && t('features.influencerApplications')}
                  {key === 'businessOffers' && t('features.businessOffers')}
                  {key === 'contentModeration' && t('features.contentModeration')}
                  {key === 'aiModeration' && t('features.aiModeration')}
                  {key === 'disputeSystem' && t('features.disputeSystem')}
                  {key === 'paymentSystem' && t('features.paymentSystem')}
                  {key === 'analytics' && t('features.analytics')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => updateSetting(`features.${key}`, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">{t('security.passwordRequirements')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('security.minLength')}
            </label>
            <input
              type="number"
              min="6"
              max="50"
              value={settings?.security?.passwordMinLength || 8}
              onChange={(e) => updateSetting('security.passwordMinLength', parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('security.maxLoginAttempts')}
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={settings?.security?.maxLoginAttempts || 5}
              onChange={(e) => updateSetting('security.maxLoginAttempts', parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings?.security?.passwordRequireSpecialChar || false}
              onChange={(e) => updateSetting('security.passwordRequireSpecialChar', e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-600"
            />
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('security.requireSpecialChar')}
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings?.security?.passwordRequireNumber || false}
              onChange={(e) => updateSetting('security.passwordRequireNumber', e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-600"
            />
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('security.requireNumbers')}
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings?.security?.twoFactorRequired || false}
              onChange={(e) => updateSetting('security.twoFactorRequired', e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-600"
            />
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('security.requireTwoFactor')}
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmailTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">{t('email.smtpConfig')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('email.smtpHost')}
            </label>
            <input
              type="text"
              value={settings?.email?.smtpHost || ''}
              onChange={(e) => updateSetting('email.smtpHost', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('email.smtpPort')}
            </label>
            <input
              type="number"
              value={settings?.email?.smtpPort || 587}
              onChange={(e) => updateSetting('email.smtpPort', parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('email.smtpUser')}
            </label>
            <input
              type="text"
              value={settings?.email?.smtpUser || ''}
              onChange={(e) => updateSetting('email.smtpUser', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('email.smtpPassword')}
            </label>
            <input
              type="password"
              value={settings?.email?.smtpPassword || ''}
              onChange={(e) => updateSetting('email.smtpPassword', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">{t('email.emailSettings')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('email.fromEmail')}
            </label>
            <input
              type="email"
              value={settings?.email?.fromEmail || ''}
              onChange={(e) => updateSetting('email.fromEmail', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('email.fromName')}
            </label>
            <input
              type="text"
              value={settings?.email?.fromName || ''}
              onChange={(e) => updateSetting('email.fromName', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
            <p className="text-slate-600 dark:text-slate-400">{t('loading')}</p>
          </div>
        </div>
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleResetSettings}
            className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            {t('resetToDefaults')}
          </Button>
          <Button
            onClick={handleSaveSettings}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? t('saving') : t('saveSettings')}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Card className="p-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'general' && renderGeneralTab()}
          {activeTab === 'features' && renderFeaturesTab()}
          {activeTab === 'security' && renderSecurityTab()}
          {activeTab === 'email' && renderEmailTab()}
          {activeTab === 'moderation' && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              {t('comingSoon', { type: t('tabs.moderation') })}
            </div>
          )}
          {activeTab === 'payments' && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              {t('comingSoon', { type: tCommon('payments') })}
            </div>
          )}
          {activeTab === 'uploads' && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              {t('comingSoon', { type: t('tabs.uploads') })}
            </div>
          )}
          {activeTab === 'social' && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              {t('comingSoon', { type: t('tabs.social') })}
            </div>
          )}
          {activeTab === 'analytics' && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              {t('comingSoon', { type: tCommon('analytics') })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}