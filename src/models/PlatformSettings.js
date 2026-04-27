import mongoose from 'mongoose';

const platformSettingsSchema = new mongoose.Schema(
  {
    // General Platform Settings
    platform: {
      name: { type: String, default: 'Influencer Connect' },
      description: { type: String, default: 'Connect influencers with businesses' },
      version: { type: String, default: '1.0.0' },
      maintenance: { type: Boolean, default: false },
      maintenanceMessage: { type: String, default: 'Platform is under maintenance. Please check back later.' }
    },

    // Feature Toggles
    features: {
      userRegistration: { type: Boolean, default: true },
      influencerApplications: { type: Boolean, default: true },
      businessOffers: { type: Boolean, default: true },
      contentModeration: { type: Boolean, default: true },
      aiModeration: { type: Boolean, default: true },
      disputeSystem: { type: Boolean, default: true },
      paymentSystem: { type: Boolean, default: true },
      analytics: { type: Boolean, default: true }
    },

    // Email Settings
    email: {
      smtpHost: String,
      smtpPort: { type: Number, default: 587 },
      smtpSecure: { type: Boolean, default: false },
      smtpUser: String,
      smtpPassword: String,
      fromEmail: { type: String, default: 'noreply@influencerconnect.com' },
      fromName: { type: String, default: 'Influencer Connect' },
      templates: {
        welcome: { subject: String, template: String },
        verification: { subject: String, template: String },
        passwordReset: { subject: String, template: String }
      }
    },

    // API & Rate Limiting
    api: {
      rateLimitEnabled: { type: Boolean, default: true },
      rateLimitWindow: { type: Number, default: 15 }, // minutes
      rateLimitMaxRequests: { type: Number, default: 100 },
      apiKeyRequired: { type: Boolean, default: false },
      corsOrigins: [{ type: String }]
    },

    // Content Moderation Settings
    moderation: {
      autoModeration: { type: Boolean, default: true },
      aiThreshold: { type: Number, min: 0, max: 1, default: 0.7 },
      flaggedKeywords: [{ type: String }],
      bannedDomains: [{ type: String }],
      maxContentSize: { type: Number, default: 10 }, // MB
      allowedFormats: [{ type: String, default: ['jpg', 'png', 'mp4', 'mov'] }]
    },

    // Security Settings
    security: {
      passwordMinLength: { type: Number, default: 8 },
      passwordRequireSpecialChar: { type: Boolean, default: true },
      passwordRequireNumber: { type: Boolean, default: true },
      sessionTimeout: { type: Number, default: 24 }, // hours
      maxLoginAttempts: { type: Number, default: 5 },
      lockoutDuration: { type: Number, default: 30 }, // minutes
      twoFactorRequired: { type: Boolean, default: false }
    },

    // Payment Settings
    payments: {
      stripeEnabled: { type: Boolean, default: true },
      stripePublishableKey: String,
      stripeSecretKey: String,
      currency: { type: String, default: 'EUR' },
      minPayout: { type: Number, default: 10 },
      maxPayout: { type: Number, default: 10000 },
      processingFee: { type: Number, default: 2.9 }, // percentage
      platformFee: { type: Number, default: 10 } // percentage
    },

    // Notification Settings
    notifications: {
      emailEnabled: { type: Boolean, default: true },
      smsEnabled: { type: Boolean, default: false },
      pushEnabled: { type: Boolean, default: true },
      adminAlerts: {
        newUserRegistration: { type: Boolean, default: true },
        paymentIssues: { type: Boolean, default: true },
        securityAlerts: { type: Boolean, default: true },
        systemErrors: { type: Boolean, default: true }
      }
    },

    // File Upload Settings
    uploads: {
      s3Enabled: { type: Boolean, default: true },
      s3Bucket: String,
      s3Region: String,
      s3AccessKey: String,
      s3SecretKey: String,
      maxFileSize: { type: Number, default: 10 }, // MB
      allowedTypes: [{ type: String }]
    },

    // Social Media Integration
    social: {
      instagramEnabled: { type: Boolean, default: true },
      tiktokEnabled: { type: Boolean, default: true },
      youtubeEnabled: { type: Boolean, default: false },
      facebookEnabled: { type: Boolean, default: false }
    },

    // Legal & Compliance
    legal: {
      termsUrl: String,
      privacyUrl: String,
      gdprEnabled: { type: Boolean, default: true },
      dataRetentionDays: { type: Number, default: 2555 }, // 7 years
      cookieConsent: { type: Boolean, default: true }
    },

    // Analytics & Tracking
    analytics: {
      googleAnalyticsId: String,
      mixpanelToken: String,
      trackingEnabled: { type: Boolean, default: true },
      errorTracking: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

// Ensure only one settings document exists
platformSettingsSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('PlatformSettings').countDocuments();
    if (count > 0) {
      const error = new Error('Only one platform settings document can exist');
      return next(error);
    }
  }
  next();
});

export const PlatformSettings = mongoose.model('PlatformSettings', platformSettingsSchema);