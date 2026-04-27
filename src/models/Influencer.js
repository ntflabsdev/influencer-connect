import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const influencerSchema = new mongoose.Schema(
  {
    // Basic Information
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: function() { return !this.meta?.googleId; } },
    phone: String,
    avatarUrl: String,

    // Profile Information
    profileImage: String,
    username: { type: String, unique: true, sparse: true },
    bio: { type: String, maxlength: 500 },

    // Content & Categories
    contentCategories: [String],
    contentTypes: [String], // Posts, Stories, Reels, TikToks

    // Contact Information
    contactInfo: {
      secondaryEmail: String,
      location: String,
      website: String,
      instagram: String,
      tiktok: String
    },
acceptTerms :{
 type: Boolean, required: true
},
    // Social Media Connections & Metrics
    meta: {
      googleId: String,
      instagram: {
        userId: String,
        username: String,
        accessToken: String,
        refreshToken: String,
        expiresAt: Date,
        followers: Number,
        following: Number,
        posts: Number,
        connected: { type: Boolean, default: false }
      },
      tiktok: {
        userId: String,
        username: String,
        accessToken: String,
        refreshToken: String,
        expiresAt: Date,
        followers: Number,
        following: Number,
        videos: Number,
        connected: { type: Boolean, default: false }
      }
    },

    // Portfolio & Content
    portfolio: [{
      contentId: String,
      platform: { type: String, enum: ['instagram', 'tiktok'] },
      postUrl: String,
      thumbnailUrl: String,
      caption: String,
      postedAt: Date,
      engagement: {
        likes: Number,
        comments: Number,
        shares: Number,
        saves: Number,
        views: Number
      },
      tags: [String],
      isApproved: { type: Boolean, default: false }
    }],

    // Statistics & Analytics
    statistics: {
      totalFollowers: { type: Number, default: 0 },
      totalEngagement: { type: Number, default: 0 },
      averageEngagementRate: { type: Number, default: 0 },
      completedCollaborations: { type: Number, default: 0 },
      activeCollaborations: { type: Number, default: 0 },
      totalEarnings: { type: Number, default: 0 },
      rating: { type: Number, min: 0, max: 5, default: 0 },
      ratingCount: { type: Number, default: 0 }
    },

    // Preferences & Settings
    notificationPreferences: {
      general: {
        pushNotifications: { type: Boolean, default: true },
        emailNotifications: { type: Boolean, default: true },
      },
      offersAndCollaborations: {
        newOfferAlerts: { type: Boolean, default: true },
        directInvitations: { type: Boolean, default: true },
        collaborationStatusUpdates: { type: Boolean, default: true },
        deadlineReminders: { type: Boolean, default: true },
      },
      messages: {
        newMessages: { type: Boolean, default: true },
        messageReplies: { type: Boolean, default: true },
      },
      profileActivity: {
        profileViews: { type: Boolean, default: false },
        newFollowers: { type: Boolean, default: false },
        contentLikes: { type: Boolean, default: false },
      },
      recommendations: {
        personalizedOffers: { type: Boolean, default: true },
        profileImprovementTips: { type: Boolean, default: false },
        trendingContent: { type: Boolean, default: true },
      },
      quietHours: {
        enabled: { type: Boolean, default: false },
        from: String, // HH:MM format
        to: String,   // HH:MM format
        timezone: { type: String, default: 'UTC' },
      },
      emailFrequency: { type: String, enum: ['immediate', 'daily', 'weekly'], default: 'daily' },
    },

    // Privacy Settings
    privacySettings: {
      profilePrivacy: {
        isProfilePublic: { type: Boolean, default: true },
        showEmailPublic: { type: Boolean, default: false },
        showPhonePublic: { type: Boolean, default: false },
        showStatistics: { type: Boolean, default: true },
        allowMessages: { type: Boolean, default: true },
        allowOfferInvitations: { type: Boolean, default: true },
        showPortfolio: { type: Boolean, default: true },
      },
      accountSecurity: {
        twoFactorAuthEnabled: { type: Boolean, default: false },
        twoFactorSecret: String,
        backupCodes: [String],
        loginAlerts: { type: Boolean, default: true },
      },
      dataPrivacy: {
        canDownloadData: { type: Boolean, default: true },
        canDeleteAccount: { type: Boolean, default: true },
        dataDownloadRequested: { type: Boolean, default: false },
        accountDeletionRequested: { type: Boolean, default: false },
        deletionRequestedAt: Date,
      },
    },

    // Verification & Status
    isVerified: { type: Boolean, default: false },
    verificationStatus: {
      emailVerified: { type: Boolean, default: false },
      phoneVerified: { type: Boolean, default: false },
      socialVerified: { type: Boolean, default: false },
      identityVerified: { type: Boolean, default: false },
    },
    status: { type: String, enum: ['active', 'adminpending', 'suspended', 'inactive'], default: 'adminpending' },
    isSuspended: { type: Boolean, default: false },
    suspensionReason: String,

    // Location (for geolocation features)
    location: {
      city: String,
      country: String,
      state: String,
      coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
      },
    },

    // Activity Tracking
    lastActive: { type: Date, default: Date.now },
    loginCount: { type: Number, default: 0 },
    profileViews: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Indexes for performance
influencerSchema.index({ email: 1 }, { unique: true });
influencerSchema.index({ username: 1 }, { unique: true, sparse: true });
influencerSchema.index({ 'location.coordinates': '2dsphere' });
influencerSchema.index({ status: 1 });
influencerSchema.index({ 'statistics.totalFollowers': -1 });
influencerSchema.index({ 'statistics.rating': -1 });
influencerSchema.index({ contentCategories: 1 });
influencerSchema.index({ createdAt: -1 });
influencerSchema.index({ lastActive: -1 });

// Password hashing middleware
influencerSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password comparison method
influencerSchema.methods.comparePassword = function compare(candidate) {
  return bcrypt.compare(candidate, this.password);
};



// Update statistics method
influencerSchema.methods.updateStatistics = function() {
  // Calculate total followers from connected social accounts
  let totalFollowers = 0;
  if (this.meta.instagram?.connected) {
    totalFollowers += this.meta.instagram.followers || 0;
  }
  if (this.meta.tiktok?.connected) {
    totalFollowers += this.meta.tiktok.followers || 0;
  }
  this.statistics.totalFollowers = totalFollowers;

  // Calculate average engagement rate
  const totalEngagement = this.portfolio.reduce((sum, item) => {
    return sum + (item.engagement.likes || 0) + (item.engagement.comments || 0) + (item.engagement.shares || 0);
  }, 0);

  this.statistics.totalEngagement = totalEngagement;
  this.statistics.averageEngagementRate = totalFollowers > 0
    ? (totalEngagement / totalFollowers) * 100
    : 0;
};

export const Influencer = mongoose.model('Influencer', influencerSchema);