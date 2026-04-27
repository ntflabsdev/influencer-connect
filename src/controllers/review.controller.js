import { Review } from '../models/Review.js';
import { Application } from '../models/Application.js';
import { Business } from '../models/Business.js';
import { Influencer } from '../models/Influencer.js';

// Create a review
export const createReview = async (req, res, next) => {
    try {
        const { applicationId, rating, comment } = req.body;
        const authorId = req.user.id || req.user._id;
        const authorModel = req.user.role === 'business' ? 'Business' : 'Influencer';

        const application = await Application.findById(applicationId).populate('offer');
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Check if user is authorized to review this application
        let targetId;
        let targetModel;

        if (authorModel === 'Business') {
            if (application.offer.business.toString() !== authorId.toString()) {
                return res.status(403).json({ message: 'Unauthorized review' });
            }
            targetId = application.influencer;
            targetModel = 'Influencer';
        } else {
            if (application.influencer.toString() !== authorId.toString()) {
                return res.status(403).json({ message: 'Unauthorized review' });
            }
            targetId = application.offer.business;
            targetModel = 'Business';
        }

        // Check if review already exists
        const existingReview = await Review.findOne({ application: applicationId, author: authorId });
        if (existingReview) {
            return res.status(400).json({ message: 'Review already submitted for this application' });
        }

        const review = await Review.create({
            author: authorId,
            authorModel,
            target: targetId,
            targetModel,
            application: applicationId,
            rating,
            comment
        });

        // Update target statistics
        const Target = targetModel === 'Business' ? Business : Influencer;
        const statsField = targetModel === 'Business' ? 'businessStats' : 'statistics';

        const allReviews = await Review.find({ target: targetId });
        const avgRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;

        await Target.findByIdAndUpdate(targetId, {
            [`${statsField}.rating`]: avgRating,
            [`${statsField}.ratingCount`]: allReviews.length
        });

        res.status(201).json({ message: 'Review created successfully', review });
    } catch (err) {
        next(err);
    }
};

// Get reviews for a target user
export const getTargetReviews = async (req, res, next) => {
    try {
        const { targetId } = req.params;
        const reviews = await Review.find({ target: targetId })
            .populate('author', 'name businessName username avatarUrl profileImage')
            .sort('-createdAt');

        res.json({ reviews });
    } catch (err) {
        next(err);
    }
};
