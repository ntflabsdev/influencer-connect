import { QuickReply } from '../models/QuickReply.js';

// Get all quick replies for a business
export const getMyQuickReplies = async (req, res, next) => {
    try {
        const businessId = req.user.id || req.user._id;
        const quickReplies = await QuickReply.find({ business: businessId }).sort('-usageCount');
        res.json({ quickReplies });
    } catch (err) {
        next(err);
    }
};

// Create a quick reply
export const createQuickReply = async (req, res, next) => {
    try {
        const businessId = req.user.id || req.user._id;
        const { title, content, shortcut } = req.body;

        const quickReply = await QuickReply.create({
            business: businessId,
            title,
            content,
            shortcut
        });

        res.status(201).json({ message: 'Quick reply created', quickReply });
    } catch (err) {
        next(err);
    }
};

// Update a quick reply
export const updateQuickReply = async (req, res, next) => {
    try {
        const businessId = req.user.id || req.user._id;
        const { quickReplyId } = req.params;
        const { title, content, shortcut } = req.body;

        const quickReply = await QuickReply.findOneAndUpdate(
            { _id: quickReplyId, business: businessId },
            { title, content, shortcut },
            { new: true }
        );

        if (!quickReply) {
            return res.status(404).json({ message: 'Quick reply not found' });
        }

        res.json({ message: 'Quick reply updated', quickReply });
    } catch (err) {
        next(err);
    }
};

// Delete a quick reply
export const deleteQuickReply = async (req, res, next) => {
    try {
        const businessId = req.user.id || req.user._id;
        const { quickReplyId } = req.params;

        const result = await QuickReply.findOneAndDelete({ _id: quickReplyId, business: businessId });
        if (!result) {
            return res.status(404).json({ message: 'Quick reply not found' });
        }

        res.json({ message: 'Quick reply deleted' });
    } catch (err) {
        next(err);
    }
};

// Increment usage count
export const useQuickReply = async (req, res, next) => {
    try {
        const businessId = req.user.id || req.user._id;
        const { quickReplyId } = req.params;

        await QuickReply.findOneAndUpdate(
            { _id: quickReplyId, business: businessId },
            { $inc: { usageCount: 1 } }
        );

        res.json({ message: 'Usage recorded' });
    } catch (err) {
        next(err);
    }
};
