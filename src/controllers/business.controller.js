import { Business } from '../models/Business.js';
import { Offer } from '../models/Offer.js';
import { Payment } from '../models/Payment.js';
import { Application } from '../models/Application.js';
import { ContentSubmission } from '../models/ContentSubmission.js';
import { Influencer } from '../models/Influencer.js';
import { notify } from '../services/notify.js';

// Update business profile
export const updateBusinessProfile = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const {
      businessName,
      category,
      industry,
      companySize,
      foundedYear,
      description,
      contactInfo,
      legalInfo,
      profileImage,
      coverImage,
      brandColors,
      styleMode
    } = req.body;

    // Find the business
    const business = await Business.findById(userId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Update profile fields
    if (businessName !== undefined) {
      business.businessName = businessName;
    }

    if (category !== undefined) {
      business.category = category;
    }

    if (industry !== undefined) {
      business.industry = industry;
    }

    if (companySize !== undefined) {
      business.companySize = companySize;
    }

    if (foundedYear !== undefined) {
      business.foundedYear = foundedYear;
    }

    if (description !== undefined) {
      business.description = description;
    }

    if (profileImage !== undefined) {
      business.profileImage = profileImage;
    }

    if (coverImage !== undefined) {
      business.coverImage = coverImage;
    }

    if (brandColors !== undefined) {
      business.brandColors = brandColors;
    }

    if (styleMode !== undefined) {
      business.styleMode = styleMode;
    }

    // Update contact info
    if (contactInfo) {
      if (contactInfo.primaryEmail !== undefined) {
        business.contactInfo.primaryEmail = contactInfo.primaryEmail;
      }
      if (contactInfo.secondaryEmail !== undefined) {
        business.contactInfo.secondaryEmail = contactInfo.secondaryEmail;
      }
      if (contactInfo.phone !== undefined) {
        business.contactInfo.phone = contactInfo.phone;
      }
      if (contactInfo.mobile !== undefined) {
        business.contactInfo.mobile = contactInfo.mobile;
      }
      if (contactInfo.website !== undefined) {
        business.contactInfo.website = contactInfo.website;
      }
      if (contactInfo.address) {
        business.contactInfo.address = {
          ...business.contactInfo.address,
          ...contactInfo.address
        };
      }
      if (contactInfo.socialMedia) {
        business.contactInfo.socialMedia = {
          ...business.contactInfo.socialMedia,
          ...contactInfo.socialMedia
        };
      }
    }

    // Update legal info
    if (legalInfo) {
      business.legalInfo = {
        ...business.legalInfo,
        ...legalInfo
      };
    }

    await business.save();

    res.json({
      message: 'Business profile updated successfully',
      user: {
        id: business._id,
        name: business.name,
        email: business.email,
        role: 'business',
        businessName: business.businessName,
        category: business.category,
        industry: business.industry,
        companySize: business.companySize,
        foundedYear: business.foundedYear,
        description: business.description,
        profileImage: business.profileImage,
        coverImage: business.coverImage,
        brandColors: business.brandColors,
        styleMode: business.styleMode,
        contactInfo: business.contactInfo,
        legalInfo: business.legalInfo,
        status: business.status,
        updatedAt: business.updatedAt
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get business profile
export const getBusinessProfile = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user?.id || req.user?._id;

    const business = await Business.findById(userId);

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Check if this is a public request (no authentication)
    const isPublicRequest = !req.user;
    const isOwnProfile = req.user && userId === (req.user.id || req.user._id).toString();

    let userData;

    if (isPublicRequest) {
      // Public view - limited information
      userData = {
        id: business._id,
        name: business.name,
        profileImage: business.avatarUrl,
        businessName: business.businessName,
        category: business.category,
        industry: business.industry,
        description: business.description,
        contactInfo: {
          website: business.contactInfo?.website,
          address: business.contactInfo?.address
        },
        createdAt: business.createdAt
      };
    } else if (isOwnProfile) {
      // Own profile - full information
      userData = {
        id: business._id,
        name: business.name,
        email: business.email,
        role: 'business',
        businessName: business.businessName,
        category: business.category,
        industry: business.industry,
        companySize: business.companySize,
        foundedYear: business.foundedYear,
        description: business.description,
        profileImage: business.avatarUrl,
        coverImage: business.coverImage,
        brandColors: business.brandColors,
        styleMode: business.styleMode,
        contactInfo: business.contactInfo,
        legalInfo: business.legalInfo,
        status: business.status,
        createdAt: business.createdAt,
        updatedAt: business.updatedAt
      };
    } else {
      // Other authenticated user viewing profile - most information
      userData = {
        id: business._id,
        name: business.name,
        businessName: business.businessName,
        category: business.category,
        industry: business.industry,
        description: business.description,
        profileImage: business.avatarUrl,
        coverImage: business.coverImage,
        styleMode: business.styleMode,
        contactInfo: {
          website: business.contactInfo?.website,
          address: business.contactInfo?.address
        },
        createdAt: business.createdAt
      };
    }

    res.json({ user: userData });
  } catch (err) {
    next(err);
  }
};

// Get public business profiles (for browsing)
export const getPublicBusinessProfiles = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, location, search } = req.query;

    const filter = { status: 'active' };

    // Filter by business category
    if (category) {
      filter.category = category;
    }

    // Filter by location
    if (location) {
      filter['contactInfo.address.city'] = new RegExp(location, 'i');
    }

    // Search by business name or description
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { businessName: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const skip = (page - 1) * limit;

    const [businesses, total] = await Promise.all([
      Business.find(filter)
        .select('name businessName avatarUrl category description contactInfo createdAt')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Business.countDocuments(filter)
    ]);

    // Format the response
    const profiles = businesses.map(business => ({
      id: business._id,
      name: business.name,
      businessName: business.businessName,
      profileImage: business.avatarUrl,
      category: business.category,
      description: business.description,
      website: business.contactInfo?.website,
      location: business.contactInfo?.address?.city || business.contactInfo?.address?.country,
      joinedAt: business.createdAt
    }));

    res.json({
      profiles,
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

// Get available business categories
export const getBusinessCategories = async (req, res, next) => {
  try {
    const categories = [
      'Restaurantes y Alimentación',
      'Moda y Estilo',
      'Belleza y Cuidado Personal',
      'Tecnología y Electrónica',
      'Salud y Fitness',
      'Educación y Formación',
      'Arte y Cultura',
      'Deportes y Ocio',
      'Viajes y Turismo',
      'Servicios Profesionales',
      'Inmobiliaria',
      'Automoción',
      'Mascotas',
      'Hogar y Jardín',
      'Entretenimiento',
      'Otros'
    ];

    res.json({ categories });
  } catch (err) {
    next(err);
  }
};

// Get business style modes
export const getBusinessStyleModes = async (req, res, next) => {
  try {
    const styleModes = [
      'Tradicional',
      'Moderno',
      'Elegante',
      'Casual',
      'Lujoso',
      'Creativo',
      'Minimalista',
      'Urbano',
      'Rústico',
      'Industrial',
      'Bohemio',
      'Clásico'
    ];

    res.json({ styleModes });
  } catch (err) {
    next(err);
  }
};

// Get all applications for a specific offer
export const getOfferApplications = async (req, res, next) => {
  try {
    const { offerId } = req.params;
    const businessId = req.user.id || req.user._id;

    // Verify the offer belongs to the business
    const offer = await Offer.findOne({ _id: offerId, business: businessId });
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found or unauthorized' });
    }

    const applications = await Application.find({ offer: offerId })
      .populate('influencer', 'name email avatarUrl username statistics')
      .sort('-createdAt');

    res.json({
      offerTitle: offer.title,
      total: applications.length,
      applications
    });
  } catch (err) {
    next(err);
  }
};

// Get details of a single application
export const getApplicationDetails = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const businessId = req.user.id || req.user._id;

    const application = await Application.findById(applicationId)
      .populate('offer')
      .populate('influencer', 'name email avatarUrl username bio contentCategories statistics portfolio');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify the offer belongs to the requesting business
    if (application.offer.business.toString() !== businessId.toString()) {
      return res.status(403).json({ message: 'Unauthorized to view this application' });
    }

    res.json({ application });
  } catch (err) {
    next(err);
  }
};

// Update application status (Accept/Reject)
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { status, feedback } = req.body;
    const businessId = req.user.id || req.user._id;

    const application = await Application.findById(applicationId).populate('offer');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify ownership
    if (application.offer.business.toString() !== businessId.toString()) {
      return res.status(403).json({ message: 'Unauthorized update attempt' });
    }

    // Update status
    application.status = status;
    if (feedback) {
      application.note = feedback;
    }

    await application.save();

    // Trigger notification (basic implementation)
    try {
      await notify(application.influencer, {
        title: `Tu solicitud ha sido ${status === 'accepted' ? 'aceptada' : 'rechazada'}`,
        message: `El negocio ha actualizado el estado de tu postulación para "${application.offer.title}".`,
        type: 'application_update',
        meta: { applicationId, status, offerId: application.offer._id }
      });
    } catch (notifyErr) {
      console.error('Notification failed:', notifyErr);
      // Don't fail the request if notification fails
    }

    res.json({
      message: `Application ${status} successfully`,
      application
    });
  } catch (err) {
    next(err);
  }
};

// Get all content submissions for business's offers
export const getContentSubmissions = async (req, res, next) => {
  try {
    const businessId = req.user.id || req.user._id;

    // First find all offers by this business
    const offerIds = await Offer.find({ business: businessId }).distinct('_id');

    // Then find all applications for these offers
    const applicationIds = await Application.find({ offer: { $in: offerIds } }).distinct('_id');

    // Then find submissions for these applications
    const submissions = await ContentSubmission.find({ application: { $in: applicationIds } })
      .populate({
        path: 'application',
        populate: [
          { path: 'offer', select: 'title' },
          { path: 'influencer', select: 'name username avatarUrl' }
        ]
      })
      .sort('-createdAt');

    res.json({
      total: submissions.length,
      submissions
    });
  } catch (err) {
    next(err);
  }
};

// Update content submission status (Approve/Request Changes)
export const updateSubmissionStatus = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const { status, feedback } = req.body;
    const businessId = req.user.id || req.user._id;

    const submission = await ContentSubmission.findById(submissionId)
      .populate({
        path: 'application',
        populate: { path: 'offer' }
      });

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Verify ownership
    if (submission.application.offer.business.toString() !== businessId.toString()) {
      return res.status(403).json({ message: 'Unauthorized moderation attempt' });
    }

    // Update status and feedback
    submission.status = status;
    if (feedback) {
      submission.feedback = feedback;
    }

    // Add to moderation history
    submission.moderationHistory.push({
      action: status,
      reason: feedback || 'Business review',
      timestamp: new Date()
    });

    await submission.save();

    // If approved, update application status as well if needed
    if (status === 'approved') {
      const application = await Application.findById(submission.application._id);
      application.status = 'approved';
      application.approvedAt = new Date();
      await application.save();
    }

    // Trigger notification
    try {
      await notify(submission.application.influencer, {
        title: `Estado de contenido: ${status === 'approved' ? 'Aprobado' : 'Cambios solicitados'}`,
        message: `El negocio ha revisado tu contenido para "${submission.application.offer.title}".`,
        type: 'content_update',
        meta: { submissionId, status, offerId: submission.application.offer._id }
      });
    } catch (notifyErr) {
      console.error('Notification failed:', notifyErr);
    }

    res.json({
      message: `Content ${status} successfully`,
      submission
    });
  } catch (err) {
    next(err);
  }
};

// Search and filter influencers for businesses
export const searchInfluencers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      minFollowers,
      maxFollowers,
      city,
      search
    } = req.query;

    const filter = { status: 'active', isVerified: true };

    // category filter
    if (category) {
      filter.contentCategories = category;
    }

    // follower range filter
    if (minFollowers || maxFollowers) {
      filter['statistics.totalFollowers'] = {};
      if (minFollowers) filter['statistics.totalFollowers'].$gte = parseInt(minFollowers);
      if (maxFollowers) filter['statistics.totalFollowers'].$lte = parseInt(maxFollowers);
    }

    // city filter
    if (city) {
      filter['location.city'] = new RegExp(city, 'i');
    }

    // search filter
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { username: new RegExp(search, 'i') },
        { bio: new RegExp(search, 'i') }
      ];
    }

    const skip = (page - 1) * limit;

    const [influencers, total] = await Promise.all([
      Influencer.find(filter)
        .select('name avatarUrl username bio contentCategories statistics location createdAt')
        .sort('-statistics.totalFollowers')
        .skip(skip)
        .limit(parseInt(limit)),
      Influencer.countDocuments(filter)
    ]);

    res.json({
      influencers,
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

// Get detailed influencer profile for business
export const getInfluencerDetailsForBusiness = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const influencer = await Influencer.findById(userId)
      .select('name email avatarUrl username bio contentCategories contentTypes contactInfo statistics portfolio location isVerified status createdAt');

    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }

    // Only allow viewing active/verified influencers for discovery
    if (influencer.status !== 'active' || !influencer.isVerified) {
      return res.status(403).json({ message: 'Influencer profile is not public or verified' });
    }

    res.json({ influencer });
  } catch (err) {
    next(err);
  }
};

// Get available subscription plans
export const getSubscriptionPlans = async (req, res, next) => {
  try {
    const plans = [
      {
        id: 'free',
        name: 'Plan Gratuito',
        price: 0,
        currency: 'EUR',
        features: [
          'Hasta 5 ofertas por mes',
          'Analíticas básicas',
          'Soporte estándar'
        ],
        limits: { maxOffersPerMonth: 5 }
      },
      {
        id: 'basic',
        name: 'Plan Basic',
        price: 29,
        currency: 'EUR',
        features: [
          'Hasta 20 ofertas por mes',
          'Filtros avanzados de influencers',
          'Analíticas detalladas',
          'Soporte prioritario'
        ],
        limits: { maxOffersPerMonth: 20 }
      },
      {
        id: 'pro',
        name: 'Plan Pro',
        price: 99,
        currency: 'EUR',
        features: [
          'Ofertas ilimitadas',
          'Acceso completo a analíticas',
          'Branding personalizado',
          'Account Manager dedicado',
          'API access'
        ],
        limits: { maxOffersPerMonth: -1 }
      }
    ];

    res.json({ plans });
  } catch (err) {
    next(err);
  }
};

// Initial subscription process (Placeholder)
export const subscribeToPlan = async (req, res, next) => {
  try {
    const { planId } = req.body;
    const businessId = req.user.id || req.user._id;

    // In production, integrate with Stripe here
    res.json({
      message: `Iniciando suscripción al plan ${planId}`,
      checkoutUrl: 'https://checkout.stripe.com/placeholder',
      planId,
      businessId
    });
  } catch (err) {
    next(err);
  }
};

// Boost an offer (Placeholder)
export const boostOffer = async (req, res, next) => {
  try {
    const { offerId } = req.params;
    const { duration } = req.body; // e.g., '24h', '7d'
    const businessId = req.user.id || req.user._id;

    // Verify ownership
    const offer = await Offer.findOne({ _id: offerId, business: businessId });
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found or unauthorized' });
    }

    res.json({
      message: `Impulsando oferta "${offer.title}" por ${duration}`,
      checkoutUrl: 'https://checkout.stripe.com/placeholder_boost',
      offerId,
      duration
    });
  } catch (err) {
    next(err);
  }
};

// Get summary metrics for business dashboard
export const getBusinessStats = async (req, res, next) => {
  try {
    const businessId = req.user.id || req.user._id;

    // 1. Get total offers
    const totalOffers = await Offer.countDocuments({ business: businessId });

    // 2. Get total applications received
    const offerIds = await Offer.find({ business: businessId }).distinct('_id');
    const totalApplications = await Application.countDocuments({ offer: { $in: offerIds } });

    // 3. Get active collaborations (accepted/approved)
    const activeCollaborations = await Application.countDocuments({
      offer: { $in: offerIds },
      status: { $in: ['accepted', 'approved'] }
    });

    // 4. Get total spend (Placeholder for now, in real case aggregate from payments)
    // const totalSpend = ...

    // 5. Get average rating (if implemented in Business model)
    const business = await Business.findById(businessId);

    // Get recent activity
    const recentApplications = await Application.find({ offer: { $in: offerIds } })
      .populate('influencer', 'name avatarUrl username')
      .populate('offer', 'title')
      .sort('-createdAt')
      .limit(5);

    res.json({
      metrics: {
        totalOffers,
        totalApplications,
        activeCollaborations,
        rating: business.businessStats?.rating || 0,
        ratingCount: business.businessStats?.ratingCount || 0,
        totalSpend: 0 // Placeholder
      },
      recentActivity: recentApplications
    });
  } catch (err) {
    next(err);
  }
};

// Bulk update application status
export const bulkUpdateApplicationStatus = async (req, res, next) => {
  try {
    const { applicationIds, status, feedback } = req.body;
    const businessId = req.user.id || req.user._id;

    const results = { success: [], errors: [] };

    for (const appId of applicationIds) {
      try {
        const application = await Application.findById(appId).populate('offer');
        if (!application) {
          results.errors.push({ id: appId, message: 'Application not found' });
          continue;
        }

        if (application.offer.business.toString() !== businessId.toString()) {
          results.errors.push({ id: appId, message: 'Unauthorized' });
          continue;
        }

        application.status = status;
        if (feedback) application.note = feedback;
        await application.save();

        results.success.push(appId);

        // Notify
        notify(application.influencer, {
          title: `Tu solicitud ha sido ${status === 'accepted' ? 'aceptada (Bulk)' : 'rechazada (Bulk)'}`,
          message: `Nuevas actualizaciones en tu postulación para "${application.offer.title}".`,
          type: 'application_update',
          meta: { applicationId: appId, status }
        }).catch(err => console.error('Notification failed', err));

      } catch (err) {
        results.errors.push({ id: appId, message: err.message });
      }
    }

    res.json({ message: 'Bulk update completed', ...results });
  } catch (err) {
    next(err);
  }
};

// Bulk update submission status
export const bulkUpdateSubmissionStatus = async (req, res, next) => {
  try {
    const { submissionIds, status, feedback } = req.body;
    const businessId = req.user.id || req.user._id;

    const results = { success: [], errors: [] };

    for (const subId of submissionIds) {
      try {
        const submission = await ContentSubmission.findById(subId).populate({
          path: 'application',
          populate: { path: 'offer' }
        });

        if (!submission) {
          results.errors.push({ id: subId, message: 'Submission not found' });
          continue;
        }

        if (submission.application.offer.business.toString() !== businessId.toString()) {
          results.errors.push({ id: subId, message: 'Unauthorized' });
          continue;
        }

        submission.status = status;
        if (feedback) submission.feedback = feedback;
        submission.moderationHistory.push({
          action: status,
          reason: feedback || 'Bulk approval',
          timestamp: new Date()
        });
        await submission.save();

        if (status === 'approved') {
          const application = await Application.findById(submission.application._id);
          application.status = 'approved';
          application.approvedAt = new Date();
          await application.save();
        }

        results.success.push(subId);

        // Notify
        notify(submission.application.influencer, {
          title: `Contenido ${status === 'approved' ? 'Aprobado' : 'Cambios solicitados'} (Bulk)`,
          message: `El negocio ha revisado tu contenido en modo masivo.`,
          type: 'content_update',
          meta: { submissionId: subId, status }
        }).catch(err => console.error('Notification failed', err));

      } catch (err) {
        results.errors.push({ id: subId, message: err.message });
      }
    }

    res.json({ message: 'Bulk moderation completed', ...results });
  } catch (err) {
    next(err);
  }
};

// Get payment invoices for business
export const getInvoices = async (req, res, next) => {
  try {
    const businessId = req.user.id || req.user._id;

    const payments = await Payment.find()
      .populate({
        path: 'application',
        populate: { path: 'offer', match: { business: businessId } }
      })
      .sort('-createdAt');

    // Filter payments that belong to this business's offers
    const businessPayments = payments.filter(p => p.application && p.application.offer);

    res.json({
      total: businessPayments.length,
      invoices: businessPayments.map(p => ({
        id: p._id,
        amount: p.amount,
        status: p.status,
        date: p.createdAt,
        campaign: p.application.offer.title,
        influencer: p.application.influencer,
        stripeId: p.stripePaymentIntentId
      }))
    });
  } catch (err) {
    next(err);
  }
};

// Get detailed campaign report
export const getCampaignReport = async (req, res, next) => {
  try {
    const { offerId } = req.params;
    const businessId = req.user.id || req.user._id;

    const offer = await Offer.findOne({ _id: offerId, business: businessId });
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    const applications = await Application.find({ offer: offerId });
    const approved = applications.filter(a => a.status === 'approved');
    const rejected = applications.filter(a => a.status === 'rejected');

    res.json({
      report: {
        title: offer.title,
        status: offer.status,
        metrics: {
          totalApplications: applications.length,
          approvedCount: approved.length,
          rejectedCount: rejected.length,
          conversionRate: applications.length > 0 ? (approved.length / applications.length) * 100 : 0
        },
        timeframe: {
          created: offer.createdAt,
          updated: offer.updatedAt
        }
      }
    });
  } catch (err) {
    next(err);
  }
};