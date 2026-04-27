import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    title: { type: String, required: true },
    description: String,
    reward: {
      cash: Number,
      perks: String,
    },
    requirements: [String],
    deliverables: {
      postCount: { type: Number, default: 1 },
      storyCount: { type: Number, default: 0 },
      reelCount: { type: Number, default: 0 },
      videoCount: { type: Number, default: 0 }
    },
    mandatoryHashtags: [String],
    mentions: [String],
    creativeGuidelines: String,
    status: { type: String, enum: ['draft', 'open', 'paused', 'closed'], default: 'open' },
    location: {
      city: String,
      coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },
      },
    },
    filters: {
      minFollowers: Number,
      platforms: [String],
      categories: [String],
    },
    policy: {
      flagged: { type: Boolean, default: false },
      riskTags: [String],
      notes: String,
      reviewer: String,
    },
    analytics: {
      views: { type: Number, default: 0 },
      applications: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

offerSchema.index({ status: 1 });
offerSchema.index({ 'location.coordinates': '2dsphere' });
offerSchema.index({ createdAt: -1 });

export const Offer = mongoose.model('Offer', offerSchema);


