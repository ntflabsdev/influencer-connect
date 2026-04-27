import mongoose from 'mongoose';

const quickReplySchema = new mongoose.Schema(
    {
        business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
        title: { type: String, required: true },
        content: { type: String, required: true },
        shortcut: { type: String },
        usageCount: { type: Number, default: 0 }
    },
    { timestamps: true }
);

export const QuickReply = mongoose.model('QuickReply', quickReplySchema);
