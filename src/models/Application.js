import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    offer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', required: true },
    influencer: { type: mongoose.Schema.Types.ObjectId, ref: 'Influencer', required: true },
    status: {
      type: String,
      enum: ['applied', 'accepted', 'rejected', 'submitted', 'approved', 'disputed'],
      default: 'applied',
    },
    note: String,
    submittedAt: Date,
    approvedAt: Date,
  },
  { timestamps: true },
);

applicationSchema.index({ offer: 1, influencer: 1 }, { unique: true });
applicationSchema.index({ status: 1, createdAt: -1 });

export const Application = mongoose.model('Application', applicationSchema);


