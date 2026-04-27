import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    // Recipient
    recipientId: { type: mongoose.Schema.Types.ObjectId, required: true },
    recipientType: { type: String, enum: ['admin', 'influencer', 'business'], required: true },
    
    // Notification details
    type: {
      type: String,
      enum: [
        'user_pending_approval',
        'kyc_pending_review',
        'content_pending_moderation',
        'offer_pending_approval',
        'dispute_created',
        'ticket_assigned',
        'payment_issue',
        'system_alert',
        'security_alert',
        'bulk_action_complete',
        'report_ready',
        'export_ready'
      ],
      required: true
    },
    
    title: { type: String, required: true },
    message: { type: String, required: true },
    
    // Related entity
    relatedType: { 
      type: String, 
      enum: ['influencer', 'business', 'offer', 'content', 'payment', 'dispute', 'ticket', 'kyc', 'system']
    },
    relatedId: { type: mongoose.Schema.Types.ObjectId },
    
    // Priority
    priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
    
    // Status
    read: { type: Boolean, default: false },
    readAt: { type: Date },
    
    // Action
    actionUrl: { type: String }, // URL to navigate when clicked
    actionLabel: { type: String },
    
    // Metadata
    metadata: { type: mongoose.Schema.Types.Mixed },
    
    // Expiry
    expiresAt: { type: Date },
    
    // Timestamp
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Indexes
notificationSchema.index({ recipientId: 1, recipientType: 1, read: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ relatedType: 1, relatedId: 1 });

export const Notification = mongoose.model('Notification', notificationSchema);
