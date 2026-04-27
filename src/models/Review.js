import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'authorModel' },
    authorModel: { type: String, required: true, enum: ['Influencer', 'Business', 'Admin'] },
    target: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'targetModel' },
    targetModel: { type: String, required: true, enum: ['Influencer', 'Business', 'Admin'] },
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String,
  },
  { timestamps: true },
);

reviewSchema.index({ target: 1 });

export const Review = mongoose.model('Review', reviewSchema);





