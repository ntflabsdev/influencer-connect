import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const businessSchema = new mongoose.Schema(
  {
    // Basic Information
    name: { type: String, required: true }, // Company display name
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: function() { return !this.meta?.googleId; } },
    phone: String,
    avatarUrl: String,

    // Company Information
    businessName: { type: String},
    category: { type: String },
    industry: String,
    companySize: { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '500+'], required: true },
    foundedYear: Number,
    description: { type: String, maxlength: 1000 },

    // Contact Information
    contactInfo: {
      primaryEmail: String,
      secondaryEmail: String,
      phone: String,
      mobile: String,
      website: String,
      address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String,
      },
      socialMedia: {
        facebook: String,
        twitter: String,
        linkedin: String,
        instagram: String,
      }
    },
acceptTerms:{
      type: Boolean,
      required: true,
      default: false,
},
    // Legal Information
    legalInfo: {
      cif_nif: { type: String },
      taxId: String,
      registrationNumber: String,
      legalEntity: { type: String, enum: ['individual', 'sl', 'sa', 'sll', 'sal', 'other'] },
      taxResidence: String,
    },

    // Business Profile
    profileImage: String, // Company logo
    coverImage: String,
    brandColors: {
      primary: String,
      secondary: String,
    },
    styleMode: { type: String, enum: ['modern', 'classic', 'minimal', 'bold', 'elegant'] },

    // Social Media Connections
    meta: {
      googleId: String,
    },

    // Business Statistics
    businessStats: {
      totalOffers: { type: Number, default: 0 },
      activeOffers: { type: Number, default: 0 },
      completedCollaborations: { type: Number, default: 0 },
      cancelledCollaborations: { type: Number, default: 0 },
      totalSpent: { type: Number, default: 0 },
      averageCollaborationCost: { type: Number, default: 0 },
      rating: { type: Number, min: 0, max: 5, default: 0 },
      ratingCount: { type: Number, default: 0 },
      profileViews: { type: Number, default: 0 },
      offerViews: { type: Number, default: 0 },
    },

    // Verification Status
    verificationStatus: {
      emailVerified: { type: Boolean, default: false },
      phoneVerified: { type: Boolean, default: false },
      businessVerified: { type: Boolean, default: false },
      paymentVerified: { type: Boolean, default: false },
      legalVerified: { type: Boolean, default: false },
      verificationDocuments: [{
        type: { type: String, enum: ['cif_nif', 'tax_certificate', 'business_license', 'address_proof', 'bank_statement'] },
        url: String,
        uploadedAt: { type: Date, default: Date.now },
        verified: { type: Boolean, default: false },
        verifiedAt: Date,
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
      }],
    },

    // Payment Information
    paymentInfo: {
      stripeCustomerId: String,
      paymentMethods: [{
        id: String,
        type: String, // card, bank_account
        last4: String,
        brand: String,
        isDefault: { type: Boolean, default: false },
        addedAt: { type: Date, default: Date.now },
      }],
      billingAddress: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String,
      },
      taxSettings: {
        taxId: String,
        taxRate: { type: Number, default: 0 },
        taxExempt: { type: Boolean, default: false },
      },
    },

    // Preferences & Settings
    businessNotifications: {
      general: {
        push: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
      },
      preferences: {
        newApplications: { push: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
        collaborationUpdates: { push: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
        paymentConfirmations: { push: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
        contentApprovals: { push: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
        deadlineReminders: { push: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
        systemUpdates: { push: { type: Boolean, default: false }, email: { type: Boolean, default: true } },
        marketing: { push: { type: Boolean, default: false }, email: { type: Boolean, default: false } },
      },
      silentMode: {
        enabled: { type: Boolean, default: false },
        schedule: {
          start: String, // HH:MM format
          end: String,   // HH:MM format
          timezone: { type: String, default: 'UTC' },
          daysOfWeek: [Number], // 0-6 (Sunday-Saturday)
        },
      },
      emailDigest: {
        frequency: { type: String, enum: ['immediate', 'daily', 'weekly'], default: 'daily' },
        time: { type: String, default: '09:00' }, // HH:MM format
      },
    },

    // Privacy Settings
    businessPrivacySettings: {
      visibility: {
        profileVisible: { type: Boolean, default: true },
        showEmailPublic: { type: Boolean, default: false },
        showPhonePublic: { type: Boolean, default: false },
        showStatistics: { type: Boolean, default: true },
        allowMessages: { type: Boolean, default: true },
        allowInfluencerApplications: { type: Boolean, default: true },
        showActiveOffers: { type: Boolean, default: true },
      },
      security: {
        twoFactorAuthEnabled: { type: Boolean, default: false },
        twoFactorSecret: String,
        backupCodes: [String],
        loginAlerts: { type: Boolean, default: true },
        sessionTimeout: { type: Number, default: 24 }, // hours
        ipWhitelist: [String], // Array of allowed IP addresses
      },
      dataPrivacy: {
        canDownloadData: { type: Boolean, default: true },
        canDeleteAccount: { type: Boolean, default: true },
        dataRetentionPeriod: { type: Number, default: 7 }, // years
        dataDownloadRequested: { type: Boolean, default: false },
        accountDeletionRequested: { type: Boolean, default: false },
        deletionRequestedAt: Date,
      },
      account: {
        canChangePassword: { type: Boolean, default: true },
        canChangeEmail: { type: Boolean, default: true },
        canChangePaymentMethod: { type: Boolean, default: true },
        requireApprovalForLargePayments: { type: Boolean, default: false },
        paymentApprovalThreshold: { type: Number, default: 1000 }, // amount in EUR
      },
    },

    // Status & Verification
    isVerified: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'adminpending', 'suspended', 'inactive'], default: 'adminpending' },
    isSuspended: { type: Boolean, default: false },
    suspensionReason: String,
    suspensionExpiresAt: Date,

    // Subscription & Plan
    subscription: {
      planId: { type: String, enum: ['free', 'basic', 'pro', 'enterprise'], default: 'free' },
      status: { type: String, enum: ['active', 'inactive', 'cancelled', 'past_due'], default: 'active' },
      currentPeriodStart: Date,
      currentPeriodEnd: Date,
      cancelAtPeriodEnd: { type: Boolean, default: false },
      stripeSubscriptionId: String,
      features: {
        maxOffersPerMonth: { type: Number, default: 5 },
        maxActiveOffers: { type: Number, default: 3 },
        analyticsAccess: { type: Boolean, default: false },
        prioritySupport: { type: Boolean, default: false },
        customBranding: { type: Boolean, default: false },
        apiAccess: { type: Boolean, default: false },
      },
    },

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

    // Admin Notes (only visible to admins)
    adminNotes: [{
      note: String,
      addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
      addedAt: { type: Date, default: Date.now },
      isPrivate: { type: Boolean, default: false },
    }],
  },
  { timestamps: true },
);

// Indexes for performance
businessSchema.index({ email: 1 }, { unique: true });
businessSchema.index({ businessName: 1 });
businessSchema.index({ category: 1 });
businessSchema.index({ 'location.coordinates': '2dsphere' });
businessSchema.index({ status: 1 });
businessSchema.index({ 'businessStats.rating': -1 });
businessSchema.index({ 'subscription.planId': 1 });
businessSchema.index({ createdAt: -1 });
businessSchema.index({ lastActive: -1 });

// Password hashing middleware
businessSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password comparison method
businessSchema.methods.comparePassword = function compare(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Update statistics method
businessSchema.methods.updateStatistics = function() {
  // Calculate average collaboration cost
  if (this.businessStats.completedCollaborations > 0) {
    this.businessStats.averageCollaborationCost = this.businessStats.totalSpent / this.businessStats.completedCollaborations;
  }

  // Update rating calculation if needed
  // Rating is calculated from completed collaborations
};

// Check subscription limits
businessSchema.methods.canCreateOffer = function() {
  const planLimits = {
    free: { maxOffersPerMonth: 5, maxActiveOffers: 3 },
    basic: { maxOffersPerMonth: 20, maxActiveOffers: 10 },
    pro: { maxOffersPerMonth: 100, maxActiveOffers: 50 },
    enterprise: { maxOffersPerMonth: -1, maxActiveOffers: -1 }, // unlimited
  };

  const limits = planLimits[this.subscription.planId] || planLimits.free;

  // Check monthly limit (simplified - in production, track per month)
  if (limits.maxOffersPerMonth !== -1 && this.businessStats.totalOffers >= limits.maxOffersPerMonth) {
    return false;
  }

  // Check active offers limit
  if (limits.maxActiveOffers !== -1 && this.businessStats.activeOffers >= limits.maxActiveOffers) {
    return false;
  }

  return true;
};

// Check payment verification
businessSchema.methods.hasVerifiedPayment = function() {
  return this.verificationStatus.paymentVerified &&
         this.paymentInfo.paymentMethods.length > 0;
};

export const Business = mongoose.model('Business', businessSchema);