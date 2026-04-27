import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    raisedBy: { type: String, enum: ['influencer', 'business'], required: true },
    issueType: { type: String, required: true },
    description: String,
    status: { type: String, enum: ['open', 'in_review', 'resolved'], default: 'open' },
    reviewerDecision: { type: String, enum: ['influencer', 'business', 'split', null], default: null },
    resolutionNote: String,
    tags: [String],
  },
  { timestamps: true },
);

disputeSchema.index({ status: 1, createdAt: -1 });
disputeSchema.index({ application: 1 });

export const Dispute = mongoose.model('Dispute', disputeSchema);



