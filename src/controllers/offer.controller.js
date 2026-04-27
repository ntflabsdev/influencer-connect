import { Offer } from '../models/Offer.js';
import { Application } from '../models/Application.js';
import { Business } from '../models/Business.js';

// Create new offer
export const createOffer = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { offer } = req.body;

    // Verify user is a business
    const business = await Business.findById(userId);
    if (!business) {
      return res.status(403).json({ message: 'Business not found' });
    }

    // Validate offer data
    const validationErrors = validateOfferData(offer);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Check payment verification for paid offers
    if (offer.offerType.isMonetary) {
      const hasVerifiedPayment = business.hasVerifiedPayment();
      if (!hasVerifiedPayment) {
        return res.status(422).json({
          message: 'Payment verification required for paid offers',
          code: 'PAYMENT_VERIFICATION_REQUIRED'
        });
      }
    }

    // Create offer
    const newOffer = await Offer.create({
      business: userId,
      title: offer.basicInfo.title,
      description: offer.basicInfo.description,
      category: offer.basicInfo.category,
      campaignImage: offer.basicInfo.campaignImage,
      offerType: offer.offerType,
      paidDetails: offer.paidDetails,
      collaborators: offer.collaborators,
      requirements: offer.requirements,
      deliverables: offer.requirements?.deliverables,
      mandatoryHashtags: offer.requirements?.hashtags,
      mentions: offer.requirements?.mentions,
      creativeGuidelines: offer.requirements?.creativeGuidelines,
      status: offer.status || 'draft',
      filters: {
        minFollowers: offer.filters?.minFollowers || 0,
        platforms: offer.requirements?.deliverables ? getRequiredPlatforms(offer.requirements.deliverables) : [],
        categories: offer.filters?.categories || []
      }
    });

    res.status(201).json({
      message: 'Offer created successfully',
      offer: {
        id: newOffer._id,
        title: newOffer.title,
        status: newOffer.status,
        offerType: newOffer.offerType,
        paymentVerified: offer.offerType.isMonetary ? true : null,
        createdAt: newOffer.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get business offers
export const getBusinessOffers = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { status, page = 1, limit = 20 } = req.query;

    const filter = { business: userId };
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const [offers, total] = await Promise.all([
      Offer.find(filter)
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .populate('business', 'name businessName'),
      Offer.countDocuments(filter)
    ]);

    // Add payment verification status to each offer
    const offersWithPaymentStatus = await Promise.all(
      offers.map(async (offer) => {
        const paymentVerified = offer.offerType.isMonetary
          ? await checkPaymentVerification(userId)
          : null;

        return {
          id: offer._id,
          title: offer.title,
          description: offer.description,
          category: offer.category,
          status: offer.status,
          offerType: offer.offerType,
          paymentVerified,
          applicationsCount: await Application.countDocuments({ offer: offer._id }),
          createdAt: offer.createdAt,
          updatedAt: offer.updatedAt
        };
      })
    );

    res.json({
      offers: offersWithPaymentStatus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

// Update offer
export const updateOffer = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { offerId } = req.params;
    const { offer } = req.body;

    // Check if offer exists and belongs to user
    const existingOffer = await Offer.findOne({ _id: offerId, business: userId });
    if (!existingOffer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    // Validate offer data
    const validationErrors = validateOfferData(offer);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Check payment verification for paid offers
    if (offer.offerType.isMonetary) {
      const hasVerifiedPayment = business.hasVerifiedPayment();
      if (!hasVerifiedPayment) {
        return res.status(422).json({
          message: 'Payment verification required for paid offers',
          code: 'PAYMENT_VERIFICATION_REQUIRED'
        });
      }
    }

    // Update offer
    const updatedOffer = await Offer.findByIdAndUpdate(
      offerId,
      {
        title: offer.basicInfo.title,
        description: offer.basicInfo.description,
        category: offer.basicInfo.category,
        campaignImage: offer.basicInfo.campaignImage,
        offerType: offer.offerType,
        paidDetails: offer.paidDetails,
        collaborators: offer.collaborators,
        requirements: offer.requirements,
        deliverables: offer.requirements?.deliverables,
        mandatoryHashtags: offer.requirements?.hashtags,
        mentions: offer.requirements?.mentions,
        creativeGuidelines: offer.requirements?.creativeGuidelines,
        filters: {
          minFollowers: offer.filters?.minFollowers || 0,
          platforms: offer.requirements?.deliverables ? getRequiredPlatforms(offer.requirements.deliverables) : [],
          categories: offer.filters?.categories || []
        }
      },
      { new: true }
    );

    res.json({
      message: 'Offer updated successfully',
      offer: {
        id: updatedOffer._id,
        title: updatedOffer.title,
        status: updatedOffer.status,
        offerType: updatedOffer.offerType,
        paymentVerified: offer.offerType.isMonetary ? true : null,
        updatedAt: updatedOffer.updatedAt
      }
    });
  } catch (err) {
    next(err);
  }
};

// Publish offer
export const publishOffer = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { offerId } = req.params;

    const offer = await Offer.findOne({ _id: offerId, business: userId });
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    if (offer.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft offers can be published' });
    }

    // Check payment verification for paid offers
    if (offer.offerType.isMonetary) {
      const hasVerifiedPayment = business.hasVerifiedPayment();
      if (!hasVerifiedPayment) {
        return res.status(422).json({
          message: 'Payment verification required for paid offers',
          code: 'PAYMENT_VERIFICATION_REQUIRED'
        });
      }
    }

    offer.status = 'published';
    await offer.save();

    res.json({
      message: 'Offer published successfully',
      offer: {
        id: offer._id,
        title: offer.title,
        status: 'published'
      }
    });
  } catch (err) {
    next(err);
  }
};

// Close offer
export const closeOffer = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { offerId } = req.params;

    const offer = await Offer.findOne({ _id: offerId, business: userId });
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    if (offer.status !== 'published') {
      return res.status(400).json({ message: 'Only published offers can be closed' });
    }

    offer.status = 'closed';
    await offer.save();

    res.json({
      message: 'Offer closed successfully',
      offer: {
        id: offer._id,
        title: offer.title,
        status: 'closed'
      }
    });
  } catch (err) {
    next(err);
  }
};

// Delete offer
export const deleteOffer = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { offerId } = req.params;

    const offer = await Offer.findOne({ _id: offerId, business: userId });
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    // Only allow deletion of draft offers
    if (offer.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft offers can be deleted' });
    }

    await Offer.findByIdAndDelete(offerId);

    res.json({
      message: 'Offer deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// Get offer details
export const getOfferDetails = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { offerId } = req.params;

    const offer = await Offer.findOne({ _id: offerId, business: userId });
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    // Get applications count
    const applicationsCount = await Application.countDocuments({ offer: offerId });

    // Check payment verification
    const paymentVerified = offer.offerType.isMonetary
      ? await checkPaymentVerification(userId)
      : null;

    res.json({
      offer: {
        id: offer._id,
        basicInfo: {
          title: offer.title,
          category: offer.category,
          description: offer.description,
          campaignImage: offer.campaignImage
        },
        offerType: offer.offerType,
        paidDetails: offer.paidDetails,
        collaborators: offer.collaborators,
        requirements: offer.requirements,
        deliverables: offer.deliverables,
        mandatoryHashtags: offer.mandatoryHashtags,
        mentions: offer.mentions,
        creativeGuidelines: offer.creativeGuidelines,
        status: offer.status,
        paymentVerified,
        applicationsCount,
        filters: offer.filters,
        analytics: offer.analytics,
        createdAt: offer.createdAt,
        updatedAt: offer.updatedAt
      }
    });
  } catch (err) {
    next(err);
  }
};

// Helper to check payment verification
async function checkPaymentVerification(userId) {
  const business = await Business.findById(userId);
  return business ? business.hasVerifiedPayment() : false;
}

// Duplicate an existing offer
export const duplicateOffer = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { offerId } = req.params;

    const originalOffer = await Offer.findOne({ _id: offerId, business: userId });
    if (!originalOffer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    const duplicatedOffer = await Offer.create({
      business: userId,
      title: `${originalOffer.title} (Copy)`,
      description: originalOffer.description,
      category: originalOffer.category,
      campaignImage: originalOffer.campaignImage,
      offerType: originalOffer.offerType,
      paidDetails: originalOffer.paidDetails,
      collaborators: originalOffer.collaborators,
      requirements: originalOffer.requirements,
      deliverables: originalOffer.deliverables,
      mandatoryHashtags: originalOffer.mandatoryHashtags,
      mentions: originalOffer.mentions,
      creativeGuidelines: originalOffer.creativeGuidelines,
      filters: originalOffer.filters,
      status: 'draft' // Duplicate as draft
    });

    res.status(201).json({
      message: 'Offer duplicated successfully',
      offer: {
        id: duplicatedOffer._id,
        title: duplicatedOffer.title,
        status: duplicatedOffer.status,
        createdAt: duplicatedOffer.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

// Helper function to validate offer data
function validateOfferData(offer) {
  const errors = [];

  // Basic info validation
  if (!offer.basicInfo?.title || offer.basicInfo.title.length < 3 || offer.basicInfo.title.length > 100) {
    errors.push('Title must be between 3-100 characters');
  }

  if (!offer.basicInfo?.description || offer.basicInfo.description.length < 10 || offer.basicInfo.description.length > 1000) {
    errors.push('Description must be between 10-1000 characters');
  }

  if (!offer.basicInfo?.category) {
    errors.push('Category is required');
  }

  // Offer type validation
  if (!offer.offerType?.type || !['exchange', 'paid'].includes(offer.offerType.type)) {
    errors.push('Offer type must be exchange or paid');
  }

  // Paid details validation
  if (offer.offerType?.isMonetary) {
    if (!offer.paidDetails?.pricePerCollaboration || offer.paidDetails.pricePerCollaboration <= 0) {
      errors.push('Price per collaboration is required for paid offers');
    }
  }

  // Requirements validation
  if (!offer.requirements?.deliverables) {
    errors.push('At least one deliverable platform must be selected');
  }

  // Hashtags validation
  if (offer.requirements?.hashtags) {
    const invalidHashtags = offer.requirements.hashtags.filter(tag => !tag.startsWith('#'));
    if (invalidHashtags.length > 0) {
      errors.push('All hashtags must start with #');
    }
  }

  // Mentions validation
  if (offer.requirements?.mentions) {
    const invalidMentions = offer.requirements.mentions.filter(mention => !mention.startsWith('@'));
    if (invalidMentions.length > 0) {
      errors.push('All mentions must start with @');
    }
  }

  return errors;
}

// Helper function to get required platforms from deliverables
function getRequiredPlatforms(deliverables) {
  const platforms = [];
  if (deliverables.postCount > 0 || deliverables.storyCount > 0 || deliverables.reelCount > 0) {
    platforms.push('instagram');
  }
  if (deliverables.videoCount > 0) {
    platforms.push('tiktok');
  }
  return platforms;
}

// Payment verification is now handled by Business.hasVerifiedPayment() method