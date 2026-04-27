import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'userModel' },
    userModel: { type: String, required: true, enum: ['Influencer', 'Business', 'Admin'] },
    category: { type: String, enum: ['login', 'verification', 'payment', 'proof', 'offer', 'other'], default: 'other' },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' },
    priority: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
    adminNote: String,
  },
  { timestamps: true },
);

ticketSchema.index({ status: 1, createdAt: -1 });
ticketSchema.index({ category: 1 });

export const Ticket = mongoose.model('Ticket', ticketSchema);



