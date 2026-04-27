import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, allowRoles } from '../middlewares/auth.js';
import { trackSession } from '../middlewares/sessionTracker.js';
import {
  getAvailableOffers,
  applyToOffer,
  getMyApplications,
  submitContent,
  getContentSubmissions
} from '../controllers/influencer.controller.js';
import {
  updateInfluencerProfile,
  getInfluencerProfile,
  getPublicInfluencerProfiles,
  getContentCategories,
  addToPortfolio,
  removeFromPortfolio
} from '../controllers/profile.controller.js';
import {
  updateNotificationPreferences,
  getNotificationPreferences,
  resetNotificationPreferences,
  getNotificationSummary
} from '../controllers/notification.controller.js';
import {
  updatePrivacySettings,
  getPrivacySettings,
  getActiveSessions,
  deactivateSession,
  deactivateAllOtherSessions,
  requestDataDownload,
  requestAccountDeletion,
  cancelAccountDeletion,
  getDataExport
} from '../controllers/privacy.controller.js';
import { validate } from '../middlewares/validate.js';
import { influencerLimiter } from '../middlewares/rateLimiters.js';

const router = Router();

// Public routes (no authentication required)
router.get('/public/profiles', getPublicInfluencerProfiles);
router.get('/public/categories', getContentCategories);
router.get('/public/profile/:userId', getInfluencerProfile);

// Apply authentication and role restrictions to remaining routes
router.use(authenticate, allowRoles('influencer'));
router.use(trackSession); // Track user sessions
router.use(influencerLimiter);

// Offers & Applications
router.get('/offers', getAvailableOffers);
router.get('/applications', getMyApplications);
router.post(
  '/offers/apply',
  [
    body('offerId').isMongoId().withMessage('Valid offer ID required'),
    body('pitch').optional().isString().isLength({ max: 1000 }).withMessage('Pitch must be max 1000 characters'),
    body('portfolioLinks').optional().isArray().withMessage('Portfolio links must be an array')
  ],
  validate,
  applyToOffer
);
router.post(
  '/content',
  [
    body('applicationId').isMongoId().withMessage('Valid application ID required'),
    body('contentUrl').isURL().withMessage('Valid content URL required'),
    body('caption').optional().isString().isLength({ max: 500 }).withMessage('Caption must be max 500 characters'),
    body('platform').optional().isIn(['instagram', 'tiktok']).withMessage('Platform must be instagram or tiktok')
  ],
  validate,
  submitContent
);
router.get('/content', getContentSubmissions);

// Profile management routes
router.put(
  '/profile',
  [
    // Basic profile fields
    body('profileImage').optional().isString(),
    body('username').optional().isString().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
    body('name').optional().isString().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
    body('bio').optional().isString().isLength({ max: 500 }),

    // Influencer specific fields
    body('contentCategories').optional().isArray(),
    body('contentCategories.*').optional().isString(),
    body('contentTypes').optional().isArray(),
    body('contentTypes.*').optional().isString(),

    // Contact information
    body('contactInfo.secondaryEmail').optional().isEmail(),
    body('contactInfo.location').optional().isString(),
    body('contactInfo.website').optional().isString(),

    // Social media usernames (for manual entry)
    body('contactInfo.instagram').optional().isString(),
    body('contactInfo.tiktok').optional().isString(),

    // Location information (for geolocation)
    body('location.city').optional().isString(),
    body('location.country').optional().isString(),
    body('location.state').optional().isString(),
    body('location.coordinates').optional().isArray().isLength(2),
    body('location.coordinates.*').optional().isNumeric()
  ],
  validate,
  updateInfluencerProfile
);

router.get('/profile', getInfluencerProfile);
router.get('/categories', getContentCategories);

// Portfolio management routes
router.post(
  '/portfolio',
  [
    body('platform').isIn(['instagram', 'tiktok']).withMessage('Invalid platform'),
    body('postUrl').isURL().withMessage('Invalid post URL'),
    body('thumbnailUrl').optional().isURL(),
    body('caption').optional().isString()
  ],
  validate,
  addToPortfolio
);
router.delete('/portfolio/:contentId', removeFromPortfolio);

// Notification preferences routes
router.get('/notifications', getNotificationPreferences);
router.put('/notifications', updateNotificationPreferences);
router.post('/notifications/reset', resetNotificationPreferences);
router.get('/notifications/summary', getNotificationSummary);

// Privacy settings routes
router.get('/privacy', getPrivacySettings);
router.put('/privacy', updatePrivacySettings);

// Session management routes
router.get('/sessions', getActiveSessions);
router.delete('/sessions/:sessionId', deactivateSession);
router.post('/sessions/deactivate-others', deactivateAllOtherSessions);

// GDPR compliance routes
router.post('/gdpr/download-data', requestDataDownload);
router.get('/gdpr/export-data', getDataExport);
router.post('/gdpr/delete-account', requestAccountDeletion);
router.delete('/gdpr/cancel-deletion', cancelAccountDeletion);

export default router;

