import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    stripePaymentIntentId: String,
    amount: { type: Number, required: true },
    currency: { type: String, default: 'eur' },
    status: { type: String, enum: ['created', 'succeeded', 'failed', 'refunded'], default: 'created' },
    hold: { type: Boolean, default: false },
  },
  { timestamps: true },
);

paymentSchema.index({ application: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });

export const Payment = mongoose.model('Payment', paymentSchema);


