import { Router } from 'express';
import { body, query } from 'express-validator';
import { authenticate, allowRoles } from '../middlewares/auth.js';
import {
  updateBusinessProfile,
  getBusinessProfile,
  getPublicBusinessProfiles,
  getBusinessStyleModes,
  getOfferApplications,
  getApplicationDetails,
  updateApplicationStatus,
  getContentSubmissions,
  updateSubmissionStatus,
  searchInfluencers,
  getInfluencerDetailsForBusiness,
  getSubscriptionPlans,
  subscribeToPlan,
  boostOffer,
  getBusinessStats,
  bulkUpdateApplicationStatus,
  bulkUpdateSubmissionStatus,
  getInvoices,
  getCampaignReport
} from '../controllers/business.controller.js';
import {
  updateBusinessNotificationPreferences,
  getBusinessNotificationPreferences,
  resetBusinessNotificationPreferences,
  getBusinessNotificationSummary,
  updateSpecificNotificationPreference
} from '../controllers/business.notification.controller.js';
import {
  getMyQuickReplies,
  createQuickReply,
  updateQuickReply,
  deleteQuickReply,
  useQuickReply
} from '../controllers/quickReply.controller.js';
import {
  updateBusinessPrivacySettings,
  getBusinessPrivacySettings,
  getConnectedDevices,
  removeConnectedDevice,
  removeAllConnectedDevices,
  resetBusinessPrivacySettings,
  updateSpecificPrivacySetting
} from '../controllers/business.privacy.controller.js';
import {
  createOffer,
  getBusinessOffers,
  updateOffer,
  publishOffer,
  closeOffer,
  deleteOffer,
  getOfferDetails,
  duplicateOffer
} from '../controllers/offer.controller.js';
import { validate } from '../middlewares/validate.js';
import { businessLimiter } from '../middlewares/rateLimiters.js';

const router = Router();

// Public routes (no authentication required)
router.get('/public/profiles', getPublicBusinessProfiles);
// router.get('/public/categories', getBusinessCategories);
router.get('/public/style-modes', getBusinessStyleModes);
router.get('/public/profile/:userId', getBusinessProfile);

// Protected routes (authentication required)
router.use(authenticate, allowRoles('business'));
router.use(businessLimiter);

// Offer management routes
router.post('/offers', createOffer);
router.get('/offers', getBusinessOffers);
router.get('/offers/:offerId', getOfferDetails);
router.put('/offers/:offerId', updateOffer);
router.post('/offers/:offerId/publish', publishOffer);
router.post('/offers/:offerId/close', closeOffer);
router.delete('/offers/:offerId', deleteOffer);
router.post('/offers/:offerId/duplicate', duplicateOffer);

// Application management routes
router.get('/offers/:offerId/applications', getOfferApplications);
router.get('/applications/:applicationId', getApplicationDetails);
router.patch(
  '/applications/:applicationId/status',
  [
    body('status').isIn(['accepted', 'rejected']).withMessage('Invalid status. Use accepted or rejected.')
  ],
  validate,
  updateApplicationStatus
);

// Content verification routes
router.get('/submissions', getContentSubmissions);
router.patch(
  '/submissions/:submissionId/status',
  [
    body('status').isIn(['approved', 'changes_requested']).withMessage('Invalid status. Use approved or changes_requested.'),
    body('feedback').optional().isString()
  ],
  validate,
  updateSubmissionStatus
);

// Influencer discovery routes
router.get('/influencers', searchInfluencers);
router.get('/influencers/:userId', getInfluencerDetailsForBusiness);

// Billing and monetization routes
router.get('/billing/plans', getSubscriptionPlans);
router.post('/billing/subscribe', subscribeToPlan);
router.post('/offers/:offerId/boost', boostOffer);
router.get('/analytics/stats', getBusinessStats);

// Bulk actions
router.post(
  '/applications/bulk-status',
  [
    body('applicationIds').isArray().withMessage('applicationIds must be an array'),
    body('status').isIn(['accepted', 'rejected']).withMessage('Invalid status')
  ],
  validate,
  bulkUpdateApplicationStatus
);

router.post(
  '/submissions/bulk-status',
  [
    body('submissionIds').isArray().withMessage('submissionIds must be an array'),
    body('status').isIn(['approved', 'changes_requested']).withMessage('Invalid status')
  ],
  validate,
  bulkUpdateSubmissionStatus
);

// Quick Reply routes
router.get('/quick-replies', getMyQuickReplies);
router.post(
  '/quick-replies',
  [
    body('title').isString().notEmpty(),
    body('content').isString().notEmpty()
  ],
  validate,
  createQuickReply
);
router.put('/quick-replies/:quickReplyId', updateQuickReply);
router.delete('/quick-replies/:quickReplyId', deleteQuickReply);
router.post('/quick-replies/:quickReplyId/use', useQuickReply);

// Invoicing and analytics
router.get('/billing/invoices', getInvoices);
router.get('/offers/:offerId/report', getCampaignReport);

// Business profile management routes
router.put(
  '/profile',
  [
    // Basic business info
    body('businessName').optional().isString().isLength({ min: 2, max: 100 }),
    body('category').optional().isString(),
    body('industry').optional().isString(),
    body('companySize').optional().isIn(['1-10', '11-50', '51-200', '201-500', '500+']),
    body('foundedYear').optional().isInt({ min: 1800, max: new Date().getFullYear() }),
    body('description').optional().isString().isLength({ max: 1000 }),

    // Contact information
    body('contactInfo.primaryEmail').optional().isEmail(),
    body('contactInfo.secondaryEmail').optional().isEmail(),
    body('contactInfo.phone').optional().isString(),
    body('contactInfo.mobile').optional().isString(),
    body('contactInfo.website').optional().isURL(),
    body('contactInfo.address.street').optional().isString(),
    body('contactInfo.address.city').optional().isString(),
    body('contactInfo.address.state').optional().isString(),
    body('contactInfo.address.country').optional().isString(),
    body('contactInfo.address.zipCode').optional().isString(),

    // Social media
    body('contactInfo.socialMedia.facebook').optional().isURL(),
    body('contactInfo.socialMedia.twitter').optional().isURL(),
    body('contactInfo.socialMedia.linkedin').optional().isURL(),
    body('contactInfo.socialMedia.instagram').optional().isString(),

    // Branding
    body('profileImage').optional().isString(),
    body('coverImage').optional().isString(),
    body('brandColors.primary').optional().isString(),
    body('brandColors.secondary').optional().isString(),
    body('styleMode').optional().isIn(['modern', 'classic', 'minimal', 'bold', 'elegant'])
  ],
  validate,
  updateBusinessProfile
);

router.get('/profile', getBusinessProfile);
// router.get('/categories', getBusinessCategories);
router.get('/style-modes', getBusinessStyleModes);

// Business notification preferences routes
router.get('/notifications', getBusinessNotificationPreferences);
router.put('/notifications', updateBusinessNotificationPreferences);
router.post('/notifications/reset', resetBusinessNotificationPreferences);
router.get('/notifications/summary', getBusinessNotificationSummary);
router.patch('/notifications/preference', updateSpecificNotificationPreference);

// Business privacy settings routes
router.get('/privacy', getBusinessPrivacySettings);
router.put('/privacy', updateBusinessPrivacySettings);
router.post('/privacy/reset', resetBusinessPrivacySettings);
router.patch('/privacy/setting', updateSpecificPrivacySetting);

// Connected devices management
router.get('/devices', getConnectedDevices);
router.delete('/devices/:deviceId', removeConnectedDevice);
router.post('/devices/remove-all', removeAllConnectedDevices);

export default router;

