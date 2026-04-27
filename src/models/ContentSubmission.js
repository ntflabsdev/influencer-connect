import mongoose from 'mongoose';

const contentSubmissionSchema = new mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    assetUrl: { type: String, required: true },
    caption: String,
    status: { type: String, enum: ['pending', 'approved', 'changes_requested', 'rejected', 'flagged'], default: 'pending' },
    feedback: String,

    // AI-Powered Moderation
    aiModeration: {
      score: { type: Number, min: 0, max: 1, default: 0 }, // 0 = safe, 1 = highly suspicious
      flags: [{
        type: { type: String, enum: ['spam', 'inappropriate', 'copyright', 'off_brand', 'low_quality', 'misleading'] },
        confidence: { type: Number, min: 0, max: 1 },
        details: String
      }],
      processedAt: Date,
      aiVersion: String
    },

    // Content Quality Metrics
    qualityMetrics: {
      engagement: { type: Number, default: 0 },
      relevance: { type: Number, min: 0, max: 10, default: 0 },
      compliance: { type: Number, min: 0, max: 10, default: 0 },
      overall: { type: Number, min: 0, max: 10, default: 0 }
    },

    // Moderation History
    moderationHistory: [{
      action: { type: String, enum: ['approved', 'rejected', 'changes_requested', 'flagged', 'unflagged'] },
      moderator: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
      reason: String,
      timestamp: { type: Date, default: Date.now }
    }],

    // Review Priority
    priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
    reviewDeadline: Date,
  },
  { timestamps: true },
);

contentSubmissionSchema.index({ application: 1 });
contentSubmissionSchema.index({ status: 1, createdAt: -1 });
contentSubmissionSchema.index({ 'aiModeration.score': -1 });
contentSubmissionSchema.index({ priority: 1, createdAt: -1 });
contentSubmissionSchema.index({ reviewDeadline: 1 });

export const ContentSubmission = mongoose.model('ContentSubmission', contentSubmissionSchema);





