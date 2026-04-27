import mongoose from 'mongoose';

const kycSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'userModel' },
    userModel: { type: String, required: true, enum: ['Influencer', 'Business', 'Admin'] },
    type: { type: String, required: true }, // e.g., id_front, id_back, proof_address
    url: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reason: String,
  },
  { timestamps: true },
);

kycSchema.index({ user: 1, type: 1 }, { unique: true });
kycSchema.index({ status: 1, createdAt: -1 });

export const KycDocument = mongoose.model('KycDocument', kycSchema);





