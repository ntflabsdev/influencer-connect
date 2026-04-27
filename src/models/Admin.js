import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema(
  {
    // Basic Information
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: String,
    avatarUrl: String,

    // Admin Profile
    role: { type: String, enum: ['superadmin', 'admin', 'moderator'], default: 'admin' },
    department: { type: String, enum: ['operations', 'finance', 'support', 'moderation', 'management'] },
    permissions: {
      // User Management
      canManageInfluencers: { type: Boolean, default: true },
      canManageBusinesses: { type: Boolean, default: true },
      canManageAdmins: { type: Boolean, default: false },
      canSuspendUsers: { type: Boolean, default: true },
      canVerifyUsers: { type: Boolean, default: true },

      // Content Management
      canModerateContent: { type: Boolean, default: true },
      canApproveOffers: { type: Boolean, default: true },
      canDeleteContent: { type: Boolean, default: true },

      // Financial Management
      canViewPayments: { type: Boolean, default: false },
      canProcessRefunds: { type: Boolean, default: false },
      canManageSubscriptions: { type: Boolean, default: false },

      // System Management
      canViewAnalytics: { type: Boolean, default: true },
      canManageSettings: { type: Boolean, default: false },
      canAccessLogs: { type: Boolean, default: false },

      // Support
      canHandleTickets: { type: Boolean, default: true },
      canSendNotifications: { type: Boolean, default: true },
    },

    // Admin Statistics
    adminStats: {
      usersVerified: { type: Number, default: 0 },
      usersSuspended: { type: Number, default: 0 },
      offersApproved: { type: Number, default: 0 },
      contentModerated: { type: Number, default: 0 },
      ticketsResolved: { type: Number, default: 0 },
      loginCount: { type: Number, default: 0 },
      lastLogin: Date,
    },

    // Activity Log
    activityLog: [{
      action: String, // 'user_verified', 'user_suspended', 'offer_approved', etc.
      targetType: { type: String, enum: ['influencer', 'business', 'offer', 'content', 'payment'] },
      targetId: mongoose.Schema.Types.ObjectId,
      description: String,
      ipAddress: String,
      userAgent: String,
      timestamp: { type: Date, default: Date.now },
    }],

    // Notification Preferences
    notificationPreferences: {
      systemAlerts: { type: Boolean, default: true },
      userReports: { type: Boolean, default: true },
      paymentIssues: { type: Boolean, default: true },
      securityAlerts: { type: Boolean, default: true },
      emailDigest: {
        enabled: { type: Boolean, default: true },
        frequency: { type: String, enum: ['immediate', 'hourly', 'daily'], default: 'daily' },
      },
    },

    // Security & Status
    isActive: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
    suspensionReason: String,
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: String,
    backupCodes: [String],

    // Login Tracking
    lastActive: { type: Date, default: Date.now },
    loginCount: { type: Number, default: 0 },
    failedLoginAttempts: { type: Number, default: 0 },
    lastFailedLogin: Date,
    lockedUntil: Date,

    // Emergency Contact
    emergencyContact: {
      name: String,
      phone: String,
      email: String,
      relationship: String,
    },

    // Admin Notes (for HR/management)
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
adminSchema.index({ email: 1 }, { unique: true });
adminSchema.index({ role: 1 });
adminSchema.index({ department: 1 });
adminSchema.index({ isActive: 1 });
adminSchema.index({ lastActive: -1 });

// Password hashing middleware
adminSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password comparison method
adminSchema.methods.comparePassword = function compare(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Permission checking method
adminSchema.methods.hasPermission = function(permission) {
  return this.permissions[permission] === true;
};

// Activity logging method
adminSchema.methods.logActivity = function(action, targetType, targetId, description, req) {
  this.activityLog.push({
    action,
    targetType,
    targetId,
    description,
    ipAddress: req?.ip || req?.connection?.remoteAddress,
    userAgent: req?.get('User-Agent'),
    timestamp: new Date(),
  });

  // Keep only last 1000 activities
  if (this.activityLog.length > 1000) {
    this.activityLog = this.activityLog.slice(-1000);
  }

  return this.save();
};

// Check if admin can perform action
adminSchema.methods.canPerform = function(action, targetType = null) {
  switch (action) {
    case 'verify_user':
      return this.hasPermission('canVerifyUsers');
    case 'suspend_user':
      return this.hasPermission('canSuspendUsers');
    case 'approve_offer':
      return this.hasPermission('canApproveOffers');
    case 'moderate_content':
      return this.hasPermission('canModerateContent');
    case 'view_payments':
      return this.hasPermission('canViewPayments');
    case 'manage_admins':
      return this.hasPermission('canManageAdmins');
    case 'manage_settings':
      return this.hasPermission('canManageSettings');
    default:
      return false;
  }
};

// Get admin display info
adminSchema.methods.getDisplayInfo = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    department: this.department,
    avatarUrl: this.avatarUrl,
    lastActive: this.lastActive,
    isActive: this.isActive,
  };
};

export const Admin = mongoose.model('Admin', adminSchema);