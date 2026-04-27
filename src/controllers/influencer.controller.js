import { Offer } from '../models/Offer.js';
import { Application } from '../models/Application.js';
import { ContentSubmission } from '../models/ContentSubmission.js';
import { notify } from '../services/notify.js';
import { Influencer } from '../models/Influencer.js';
import { Business } from '../models/Business.js';

// Get available offers for influencers
export const getAvailableOffers = async (req, res, next) => {
  try {
    const influencerId = req.user._id;
    const { page = 1, limit = 20, category, location, search, minFollowers } = req.query;

    // Build filter
    const filter = { status: 'published' };

    if (category) filter.category = category;
    if (minFollowers) filter['filters.minFollowers'] = { $lte: parseInt(minFollowers) };

    // Location-based filtering (if influencer has location)
    if (location) {
      // Add geospatial filtering if needed
    }

    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') }
      ];
    }

    const skip = (page - 1) * parseInt(limit);

    const [offers, total] = await Promise.all([
      Offer.find(filter)
        .populate('business', 'name businessName profileImage')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      Offer.countDocuments(filter)
    ]);

    // Add application status for this influencer
    const offersWithStatus = await Promise.all(
      offers.map(async (offer) => {
        const application = await Application.findOne({
          offer: offer._id,
          influencer: influencerId
        });

        return {
          id: offer._id,
          title: offer.title,
          description: offer.description,
          category: offer.category,
          campaignImage: offer.campaignImage,
          business: {
            id: offer.business._id,
            name: offer.business.name,
            businessName: offer.business.businessName,
            profileImage: offer.business.profileImage
          },
          offerType: offer.offerType,
          requirements: offer.requirements,
          applicationStatus: application ? application.status : null,
          createdAt: offer.createdAt
        };
      })
    );

    res.json({
      offers: offersWithStatus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
};

// Apply to an offer
export const applyToOffer = async (req, res, next) => {
  try {
    const influencerId = req.user._id;
    const { offerId, pitch, portfolioLinks } = req.body;

    // Check if offer exists and is published
    const offer = await Offer.findOne({ _id: offerId, status: 'published' });
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found or not available' });
    }

    // Check if influencer already applied
    const existingApplication = await Application.findOne({
      offer: offerId,
      influencer: influencerId
    });

    if (existingApplication) {
      return res.status(409).json({ message: 'Already applied to this offer' });
    }

    // Check influencer eligibility (followers, etc.)
    const influencer = await Influencer.findById(influencerId);
    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }

    // Check minimum follower requirements
    if (offer.filters.minFollowers && influencer.statistics.totalFollowers < offer.filters.minFollowers) {
      return res.status(403).json({ message: 'Does not meet follower requirements' });
    }

    // Create application
    const application = await Application.create({
      offer: offerId,
      influencer: influencerId,
      pitch: pitch || '',
      portfolioLinks: portfolioLinks || [],
      status: 'applied'
    });

    // Update offer analytics
    await Offer.findByIdAndUpdate(offerId, {
      $inc: { 'analytics.applications': 1 }
    });

    // Notify business (you can implement this)
    // await notifyBusiness(offer.business, 'new_application', { offer, influencer });

    res.status(201).json({
      message: 'Application submitted successfully',
      application: {
        id: application._id,
        offerId,
        status: 'applied',
        appliedAt: application.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get influencer's applications
export const getMyApplications = async (req, res, next) => {
  try {
    const influencerId = req.user._id;
    const { status, page = 1, limit = 20 } = req.query;

    const filter = { influencer: influencerId };
    if (status) filter.status = status;

    const skip = (page - 1) * parseInt(limit);

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate('offer')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      Application.countDocuments(filter)
    ]);

    const formattedApplications = applications.map(app => ({
      id: app._id,
      offer: {
        id: app.offer._id,
        title: app.offer.title,
        category: app.offer.category,
        business: app.offer.business
      },
      status: app.status,
      pitch: app.pitch,
      portfolioLinks: app.portfolioLinks,
      appliedAt: app.createdAt,
      updatedAt: app.updatedAt
    }));

    res.json({
      applications: formattedApplications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
};

// Submit content for approved application
export const submitContent = async (req, res, next) => {
  try {
    const influencerId = req.user._id;
    const { applicationId, contentUrl, caption, platform } = req.body;

    // Verify application belongs to influencer and is approved
    const application = await Application.findOne({
      _id: applicationId,
      influencer: influencerId,
      status: 'approved'
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found or not approved' });
    }

    // Check if content already submitted
    const existingSubmission = await ContentSubmission.findOne({
      application: applicationId
    });

    if (existingSubmission) {
      return res.status(409).json({ message: 'Content already submitted for this application' });
    }

    // Create content submission
    const submission = await ContentSubmission.create({
      application: applicationId,
      contentUrl,
      caption: caption || '',
      platform: platform || 'instagram',
      status: 'submitted'
    });

    // Update application status
    await Application.findByIdAndUpdate(applicationId, {
      status: 'content_submitted',
      submittedAt: new Date()
    });

    res.status(201).json({
      message: 'Content submitted successfully',
      submission: {
        id: submission._id,
        status: 'submitted',
        submittedAt: submission.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get content submissions
export const getContentSubmissions = async (req, res, next) => {
  try {
    const influencerId = req.user._id;

    const submissions = await ContentSubmission.find()
      .populate({
        path: 'application',
        match: { influencer: influencerId },
        populate: {
          path: 'offer',
          select: 'title business'
        }
      })
      .sort('-createdAt');

    // Filter out submissions where application doesn't match
    const validSubmissions = submissions.filter(sub => sub.application);

    const formattedSubmissions = validSubmissions.map(sub => ({
      id: sub._id,
      offer: {
        id: sub.application.offer._id,
        title: sub.application.offer.title,
        business: sub.application.offer.business
      },
      contentUrl: sub.contentUrl,
      caption: sub.caption,
      platform: sub.platform,
      status: sub.status,
      feedback: sub.feedback,
      submittedAt: sub.createdAt,
      reviewedAt: sub.updatedAt
    }));

    res.json({ submissions: formattedSubmissions });
  } catch (err) {
    next(err);
  }
};

