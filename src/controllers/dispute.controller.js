import { Dispute } from '../models/Dispute.js';
import { Application } from '../models/Application.js';
import { notify } from '../services/notify.js';

// Create a dispute
export const createDispute = async (req, res, next) => {
    try {
        const { applicationId, issueType, description } = req.body;
        const userId = req.user.id || req.user._id;
        const userRole = req.user.role; // 'influencer' or 'business'

        const application = await Application.findById(applicationId).populate('offer');
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Verify user is part of the application
        let isAuthorized = false;
        if (userRole === 'influencer' && application.influencer.toString() === userId.toString()) {
            isAuthorized = true;
        } else if (userRole === 'business' && application.offer.business.toString() === userId.toString()) {
            isAuthorized = true;
        }

        if (!isAuthorized) {
            return res.status(403).json({ message: 'Unauthorized to raise dispute for this application' });
        }

        // Check if a dispute already exists for this application and remains open
        const existingDispute = await Dispute.findOne({ application: applicationId, status: { $ne: 'resolved' } });
        if (existingDispute) {
            return res.status(400).json({ message: 'An active dispute already exists for this application' });
        }

        const dispute = await Dispute.create({
            application: applicationId,
            raisedBy: userRole,
            issueType,
            description,
            status: 'open'
        });

        // Notify Admins (placeholder for now, as we don't have a specific admin notify logic here)
        // In production, we'd notify the support team.

        res.status(201).json({ message: 'Dispute raised successfully', dispute });
    } catch (err) {
        next(err);
    }
};

// Get my disputes
export const getMyDisputes = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id;
        const userRole = req.user.role;

        let query = {};
        if (userRole === 'influencer') {
            const applicationIds = await Application.find({ influencer: userId }).distinct('_id');
            query = { application: { $in: applicationIds } };
        } else {
            const offerIds = await Offer.find({ business: userId }).distinct('_id');
            const applicationIds = await Application.find({ offer: { $in: offerIds } }).distinct('_id');
            query = { application: { $in: applicationIds } };
        }

        const disputes = await Dispute.find(query)
            .populate({
                path: 'application',
                populate: [{ path: 'offer' }, { path: 'influencer' }]
            })
            .sort('-createdAt');

        res.json({ disputes });
    } catch (err) {
        next(err);
    }
};
