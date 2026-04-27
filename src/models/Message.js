import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'fromModel' },
    fromModel: { type: String, required: true, enum: ['Influencer', 'Business', 'Admin'] },
    to: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'toModel' },
    toModel: { type: String, required: true, enum: ['Influencer', 'Business', 'Admin'] },
    body: { type: String, required: true },
    readAt: Date,
  },
  { timestamps: true },
);

messageSchema.index({ from: 1, to: 1 });

export const Message = mongoose.model('Message', messageSchema);





