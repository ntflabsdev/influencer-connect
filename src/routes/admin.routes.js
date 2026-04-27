import { Router } from 'express';
import { param, query, body } from 'express-validator';
import { authenticateAdmin, allowSuperAdminOnly } from '../middlewares/auth.js';
import {
  listPendingOffers,
  approveOffer,
  listUsersForKyc,
  approveUser,
  analytics,
  analyticsDetail,
  createAdmin,
  listUsers,
  createUserWithRole,
  updateUserByAdmin,
  getUserById,
  listSubmissions,
  reviewSubmission,
  setSuspended,
  listDisputes,
  updateDispute,
  listTickets,
  updateTicket,
  flagOfferPolicy,
  listPayments,
  updatePaymentHold,
  listPortfolioForUser,
  // New functions
  getAdminProfile,
  // Admin Management
  listAdmins,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  getAdminDetails,
  // Platform Settings
  getPlatformSettings,
  updatePlatformSettings,
  resetPlatformSettings,
  // AI Content Moderation
  analyzeContentAI,
  bulkAnalyzeContentAI,
  listFlaggedSubmissions,
  bulkModerateContent,
  getContentQualityAnalytics,
  updateAdminProfile,
  listSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  listCustomSubscriptionPlans,
  createCustomSubscriptionPlan,
  updateCustomSubscriptionPlan,
  deleteCustomSubscriptionPlan,
  // Dashboard functions
  getFilteredAnalytics,
  getUserTypeAnalytics,
  getRecentActivities,
  getTopPerformers,
  getSystemHealth,
  getRevenueAnalytics,
  getGeographicAnalytics,
  getEngagementAnalytics,
  // Offer Management
  listAllOffers,
  getOfferDetails,
  updateOfferStatus,
  bulkUpdateOffers,
  getOfferAnalytics,
  // New APIs - Activity Logs
  getActivityLogs,
  getActivityLogById,
  getMyActivityLogs,
  // New APIs - Notifications
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  createNotification,
  deleteNotification,
  // New APIs - Reports
  generateUserReport,
  generateActivityReport,
  // New APIs - Data Export
  exportUsers,
  exportActivityLogs,
  // New APIs - Bulk User Operations
  bulkApproveUsers,
  bulkRejectUsers,
  bulkSuspendUsers,
  // New APIs - User Activity History
  getUserActivityHistory,
  // New APIs - Advanced Search
  advancedUserSearch,
  // New APIs - User Statistics
  getUserStatistics,
} from '../controllers/admin.controller.js';
import { validate } from '../middlewares/validate.js';
import { adminLimiter } from '../middlewares/rateLimiters.js';

const router = Router();

// Use dedicated admin authentication for all admin routes
router.use(authenticateAdmin);
router.use(adminLimiter);

router.get(
  '/offers/pending',
  [query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 100 })],
  validate,
  listPendingOffers,
);
router.post(
  '/admins',
  [body('name').isString().notEmpty(), body('email').isEmail(), body('password').isLength({ min: 6 })],
  validate,
  createAdmin,
);
router.get(
  '/users',
  [
    query('role').optional().isIn(['influencer', 'business']),
    query('verified').optional().isIn(['true', 'false']),
  ],
  validate,
  listUsers,
);
router.post(
  '/users',
  [
    body('name').isString().notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['influencer', 'business']),
    body('meta').optional().isObject(),
  ],
  validate,
  createUserWithRole,
);
router.patch(
  '/users/:userId',
  [
    param('userId').isMongoId(),
    body('name').optional().isString(),
    body('email').optional().isEmail(),
    body('password').optional().isLength({ min: 6 }),
    body('role').optional().isIn(['influencer', 'business']),
    body('meta').optional().isObject(),
    body('isVerified').optional().isBoolean(),
  ],
  validate,
  updateUserByAdmin,
);
router.get('/users/:userId', [param('userId').isMongoId()], validate, getUserById);
router.patch('/users/:userId/suspend', [param('userId').isMongoId(), body('suspended').isBoolean()], validate, setSuspended);
router.get(
  '/submissions',
  [query('status').optional().isIn(['pending', 'approved', 'changes_requested'])],
  validate,
  listSubmissions,
);
router.patch(
  '/submissions/:submissionId',
  [
    param('submissionId').isMongoId(),
    body('status').isIn(['pending', 'approved', 'changes_requested', 'rejected', 'flagged']),
    body('feedback').optional().isString(),
    body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
  ],
  validate,
  reviewSubmission,
);

// AI-Powered Content Moderation Routes
router.post(
  '/content/analyze/:submissionId',
  [param('submissionId').isMongoId()],
  validate,
  analyzeContentAI,
);

router.post(
  '/content/bulk-analyze',
  [
    body('submissionIds').isArray(),
    body('submissionIds.*').isMongoId(),
  ],
  validate,
  bulkAnalyzeContentAI,
);

router.get(
  '/content/flagged',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  listFlaggedSubmissions,
);

router.post(
  '/content/bulk-moderate',
  [
    body('submissionIds').isArray(),
    body('submissionIds.*').isMongoId(),
    body('action').isIn(['approve', 'reject', 'flag', 'unflag', 'request_changes']),
    body('feedback').optional().isString(),
    body('reason').optional().isString(),
  ],
  validate,
  bulkModerateContent,
);

router.get(
  '/content/analytics/quality',
  [query('period').optional().isIn(['today', '7d', '30d', '60d', '90d'])],
  validate,
  getContentQualityAnalytics,
);
router.get(
  '/disputes',
  [query('status').optional().isIn(['open', 'in_review', 'resolved'])],
  validate,
  listDisputes,
);
router.patch(
  '/disputes/:disputeId',
  [
    param('disputeId').isMongoId(),
    body('status').optional().isIn(['open', 'in_review', 'resolved']),
    body('reviewerDecision').optional().isIn(['influencer', 'business', 'split']),
    body('resolutionNote').optional().isString(),
    body('tags').optional().isArray(),
  ],
  validate,
  updateDispute,
);
router.get('/tickets', [query('status').optional().isIn(['open', 'in_progress', 'resolved'])], validate, listTickets);
router.patch(
  '/tickets/:ticketId',
  [
    param('ticketId').isMongoId(),
    body('status').optional().isIn(['open', 'in_progress', 'resolved']),
    body('adminNote').optional().isString(),
    body('priority').optional().isIn(['low', 'normal', 'high']),
  ],
  validate,
  updateTicket,
);
router.patch(
  '/offers/:offerId/flag',
  [
    param('offerId').isMongoId(),
    body('flagged').isBoolean(),
    body('riskTags').optional().isArray(),
    body('notes').optional().isString(),
    body('reviewer').optional().isString(),
  ],
  validate,
  flagOfferPolicy,
);
router.get(
  '/payments',
  [query('hold').optional().isIn(['true'])],
  validate,
  listPayments,
);
router.patch(
  '/payments/:paymentId',
  [
    param('paymentId').isMongoId(),
    body('hold').optional().isBoolean(),
    body('status').optional().isIn(['created', 'succeeded', 'failed', 'refunded']),
  ],
  validate,
  updatePaymentHold,
);
router.get('/users/:userId/portfolio', [param('userId').isMongoId()], validate, listPortfolioForUser);
// Comprehensive Offer Management
router.get(
  '/offers',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['draft', 'open', 'paused', 'closed']),
    query('business').optional().isMongoId(),
    query('flagged').optional().isIn(['true', 'false']),
    query('search').optional().isString(),
    query('sortBy').optional().isIn(['createdAt', 'title', 'status', 'business']),
    query('sortOrder').optional().isIn(['asc', 'desc'])
  ],
  validate,
  listAllOffers
);

router.get(
  '/offers/:offerId',
  [param('offerId').isMongoId()],
  validate,
  getOfferDetails
);

router.patch(
  '/offers/:offerId/status',
  [
    param('offerId').isMongoId(),
    body('status').isIn(['draft', 'open', 'paused', 'closed']),
    body('notes').optional().isString()
  ],
  validate,
  updateOfferStatus
);

router.post(
  '/offers/bulk-update',
  [
    body('offerIds').isArray(),
    body('offerIds.*').isMongoId(),
    body('action').isIn(['approve', 'pause', 'close', 'flag', 'unflag']),
    body('reason').optional().isString()
  ],
  validate,
  bulkUpdateOffers
);

router.get(
  '/offers/analytics/overview',
  [query('period').optional().isIn(['today', '7d', '30d', '60d', '90d'])],
  validate,
  getOfferAnalytics
);

router.patch('/offers/:offerId/approve', [param('offerId').isMongoId()], validate, approveOffer);
router.get('/users/kyc', listUsersForKyc);
router.patch('/users/:userId/approve', [
  param('userId').isMongoId(),
  body('isVerified').optional().isBoolean()
], validate, approveUser);
router.get('/analytics/summary', analytics);
router.get('/analytics/detail', analyticsDetail);
router.get(
  '/analytics/filtered',
  [query('period').optional().isIn(['today', '7d', '30d', '60d', '90d'])],
  validate,
  getFilteredAnalytics
);
router.get(
  '/analytics/user-type',
  [
    query('userType').isIn(['influencer', 'business']),
    query('period').optional().isIn(['today', '7d', '30d', '60d', '90d'])
  ],
  validate,
  getUserTypeAnalytics
);

// Dashboard status check
router.get('/dashboard/status', (req, res) => {
  res.json({
    status: 'operational',
    message: 'Admin dashboard APIs are active',
    endpoints: [
      'GET /api/admin/dashboard/activities',
      'GET /api/admin/dashboard/top-performers',
      'GET /api/admin/dashboard/health',
      'GET /api/admin/analytics/summary',
      'GET /api/admin/analytics/detail',
      'GET /api/admin/analytics/filtered',
      'GET /api/admin/analytics/user-type',
      'GET /api/admin/analytics/revenue',
      'GET /api/admin/analytics/geographic',
      'GET /api/admin/analytics/engagement'
    ],
    timestamp: new Date().toISOString()
  });
});

// Dashboard endpoints
router.get('/dashboard/activities', [query('limit').optional().isInt({ min: 1, max: 50 })], validate, getRecentActivities);
router.get('/dashboard/top-performers', [query('limit').optional().isInt({ min: 1, max: 20 })], validate, getTopPerformers);
router.get('/dashboard/health', getSystemHealth);

// Advanced Analytics endpoints
router.get(
  '/analytics/revenue',
  [query('period').optional().isIn(['today', '7d', '30d', '60d', '90d'])],
  validate,
  getRevenueAnalytics
);
router.get('/analytics/geographic', getGeographicAnalytics);
router.get(
  '/analytics/engagement',
  [query('period').optional().isIn(['today', '7d', '30d', '60d', '90d'])],
  validate,
  getEngagementAnalytics
);

// Admin Profile Management
router.get('/profile', getAdminProfile);
router.patch('/profile', [
  body('name').optional().isString().notEmpty(),
  body('email').optional().isEmail(),
  body('currentPassword').optional().isString(),
  body('newPassword').optional().isLength({ min: 6 }),
], validate, updateAdminProfile);

// Admin Management (Superadmin only)
// Note: authenticateAdmin is already applied at router level
router.get('/admins', [
  allowSuperAdminOnly,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('role').optional().isIn(['superadmin', 'admin', 'moderator']),
  query('department').optional().isString(),
  validate,
  listAdmins,
]);

router.post('/admins', [
  allowSuperAdminOnly,
  body('name').isString().notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').optional().isIn(['admin', 'moderator']),
  body('department').optional().isString(),
  body('permissions').optional().isObject(),
  validate,
  createAdminUser,
]);

router.get('/admins/:adminId', [
  allowSuperAdminOnly,
  param('adminId').isMongoId(),
  validate,
  getAdminDetails,
]);

router.patch('/admins/:adminId', [
  allowSuperAdminOnly,
  param('adminId').isMongoId(),
  body('name').optional().isString().notEmpty(),
  body('email').optional().isEmail(),
  body('role').optional().isIn(['admin', 'moderator']),
  body('department').optional().isString(),
  body('permissions').optional().isObject(),
  body('isActive').optional().isBoolean(),
  validate,
  updateAdminUser,
]);

router.delete('/admins/:adminId', [
  allowSuperAdminOnly,
  param('adminId').isMongoId(),
  validate,
  deleteAdminUser,
]);

// Platform Settings
// Note: authenticateAdmin is already applied at router level
router.get('/settings', getPlatformSettings);
router.patch('/settings', updatePlatformSettings);
router.post('/settings/reset', allowSuperAdminOnly, resetPlatformSettings);

// Subscription Plan Management
router.get('/subscription-plans', listSubscriptionPlans);
router.post('/subscription-plans', [
  body('name').isString().notEmpty(),
  body('description').optional().isString(),
  body('price').isNumeric(),
  body('currency').optional().isString(),
  body('interval').optional().isIn(['month', 'year']),
  body('features').optional().isArray(),
], validate, createSubscriptionPlan);
router.patch('/subscription-plans/:planId', [
  param('planId').isString().notEmpty(),
  body('name').optional().isString(),
  body('description').optional().isString(),
  body('price').optional().isNumeric(),
  body('currency').optional().isString(),
  body('interval').optional().isIn(['month', 'year']),
  body('features').optional().isArray(),
], validate, updateSubscriptionPlan);
router.delete('/subscription-plans/:planId', [
  param('planId').isString().notEmpty(),
], validate, deleteSubscriptionPlan);

// Custom Subscription Plans
router.get('/subscription-plans/custom', listCustomSubscriptionPlans);
router.post('/subscription-plans/custom', [
  body('name').isString().notEmpty(),
  body('description').optional().isString(),
  body('price').isNumeric(),
  body('currency').optional().isString(),
  body('interval').optional().isIn(['month', 'year']),
  body('features').optional().isArray(),
  body('userId').isMongoId(),
], validate, createCustomSubscriptionPlan);
router.patch('/subscription-plans/custom/:planId', [
  param('planId').isString().notEmpty(),
  body('name').optional().isString(),
  body('description').optional().isString(),
  body('price').optional().isNumeric(),
  body('currency').optional().isString(),
  body('interval').optional().isIn(['month', 'year']),
  body('features').optional().isArray(),
  body('userId').optional().isMongoId(),
], validate, updateCustomSubscriptionPlan);
router.delete('/subscription-plans/custom/:planId', [
  param('planId').isString().notEmpty(),
], validate, deleteCustomSubscriptionPlan);

// =================================
// ACTIVITY LOGS & AUDIT TRAIL ROUTES
// =================================
router.get('/activity-logs', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('adminId').optional().isMongoId(),
  query('action').optional().isString(),
  query('targetType').optional().isString(),
  query('targetId').optional().isMongoId(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('search').optional().isString(),
  validate,
  getActivityLogs
]);

router.get('/activity-logs/:logId', [
  param('logId').isMongoId(),
  validate,
  getActivityLogById
]);

router.get('/activity-logs/my', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('action').optional().isString(),
  query('targetType').optional().isString(),
  validate,
  getMyActivityLogs
]);

// =================================
// NOTIFICATION ROUTES
// =================================
router.get('/notifications', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('read').optional().isBoolean(),
  query('type').optional().isString(),
  query('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
  validate,
  getNotifications
]);

router.patch('/notifications/:notificationId/read', [
  param('notificationId').isMongoId(),
  validate,
  markNotificationRead
]);

router.patch('/notifications/read-all', markAllNotificationsRead);

router.post('/notifications', [
  body('recipientId').isMongoId(),
  body('type').isString(),
  body('title').isString().notEmpty(),
  body('message').isString().notEmpty(),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
  validate,
  createNotification
]);

router.delete('/notifications/:notificationId', [
  param('notificationId').isMongoId(),
  validate,
  deleteNotification
]);

// =================================
// REPORTS GENERATION ROUTES
// =================================
router.get('/reports/users', [
  query('userType').optional().isIn(['influencer', 'business', 'admin']),
  query('status').optional().isString(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('format').optional().isIn(['json', 'csv']),
  validate,
  generateUserReport
]);

router.get('/reports/activity', [
  query('adminId').optional().isMongoId(),
  query('action').optional().isString(),
  query('targetType').optional().isString(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('format').optional().isIn(['json', 'csv']),
  validate,
  generateActivityReport
]);

// =================================
// DATA EXPORT ROUTES
// =================================
router.get('/export/users', [
  query('userType').isIn(['influencer', 'business', 'admin']),
  query('status').optional().isString(),
  query('format').optional().isIn(['json', 'csv']),
  query('fields').optional().isString(),
  validate,
  exportUsers
]);

router.get('/export/activity-logs', [
  query('adminId').optional().isMongoId(),
  query('action').optional().isString(),
  query('targetType').optional().isString(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('format').optional().isIn(['json', 'csv']),
  validate,
  exportActivityLogs
]);

// =================================
// BULK USER OPERATIONS ROUTES
// =================================
router.post('/users/bulk/approve', [
  body('userIds').isArray(),
  body('userIds.*').isMongoId(),
  body('userType').isIn(['influencer', 'business']),
  validate,
  bulkApproveUsers
]);

router.post('/users/bulk/reject', [
  body('userIds').isArray(),
  body('userIds.*').isMongoId(),
  body('userType').isIn(['influencer', 'business']),
  body('reason').optional().isString(),
  validate,
  bulkRejectUsers
]);

router.post('/users/bulk/suspend', [
  body('userIds').isArray(),
  body('userIds.*').isMongoId(),
  body('userType').isIn(['influencer', 'business']),
  body('reason').optional().isString(),
  validate,
  bulkSuspendUsers
]);

// =================================
// USER ACTIVITY HISTORY ROUTES
// =================================
router.get('/users/activity-history', [
  query('userId').isMongoId(),
  query('userType').isIn(['influencer', 'business']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate,
  getUserActivityHistory
]);

// =================================
// ADVANCED USER SEARCH ROUTES
// =================================
router.get('/users/search/advanced', [
  query('userType').isIn(['influencer', 'business']),
  query('search').optional().isString(),
  query('status').optional().isString(),
  query('isVerified').optional().isBoolean(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('minFollowers').optional().isInt({ min: 0 }),
  query('maxFollowers').optional().isInt({ min: 0 }),
  query('category').optional().isString(),
  query('location').optional().isString(),
  query('sortBy').optional().isString(),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate,
  advancedUserSearch
]);

// =================================
// USER STATISTICS ROUTES
// =================================
router.get('/users/:userType/:userId/statistics', [
  param('userId').isMongoId(),
  param('userType').isIn(['influencer', 'business']),
  validate,
  getUserStatistics
]);

export default router;

