import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    // Who performed the action
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    adminName: { type: String, required: true },
    adminEmail: { type: String, required: true },
    
    // What action was performed
    action: { 
      type: String, 
      required: true,
      enum: [
        // User Management
        'user_approved', 'user_rejected', 'user_suspended', 'user_unsuspended', 'user_verified', 'user_unverified',
        'bulk_user_approved', 'bulk_user_rejected', 'bulk_user_suspended',
        // KYC
        'kyc_approved', 'kyc_rejected', 'kyc_pending',
        // Content
        'content_approved', 'content_rejected', 'content_flagged', 'content_unflagged',
        'bulk_content_approved', 'bulk_content_rejected',
        // Offers
        'offer_approved', 'offer_rejected', 'offer_paused', 'offer_closed', 'offer_flagged',
        'bulk_offer_approved', 'bulk_offer_rejected',
        // Payments
        'payment_processed', 'payment_refunded', 'payment_held', 'payment_released',
        // Disputes
        'dispute_resolved', 'dispute_escalated', 'dispute_closed',
        // Tickets
        'ticket_created', 'ticket_assigned', 'ticket_resolved', 'ticket_closed',
        // Admin Management
        'admin_created', 'admin_updated', 'admin_deactivated',
        // Settings
        'settings_updated',
        // Export
        'data_exported',
        // Reports
        'report_generated'
      ]
    },
    
    // What was the target
    targetType: { 
      type: String, 
      enum: ['influencer', 'business', 'admin', 'offer', 'content', 'payment', 'dispute', 'ticket', 'kyc', 'settings', 'system'],
      required: true 
    },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    targetName: { type: String }, // For quick reference
    
    // Action details
    description: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed }, // Additional data
    
    // Request context
    ipAddress: { type: String },
    userAgent: { type: String },
    requestMethod: { type: String },
    requestPath: { type: String },
    
    // Timestamp
    timestamp: { type: Date, default: Date.now },
    
    // Status
    status: { type: String, enum: ['success', 'failed', 'pending'], default: 'success' },
    errorMessage: { type: String }
  },
  { timestamps: true }
);

// Indexes for efficient querying
activityLogSchema.index({ adminId: 1, timestamp: -1 });
activityLogSchema.index({ targetType: 1, targetId: 1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ timestamp: -1 });
activityLogSchema.index({ targetType: 1, timestamp: -1 });

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
