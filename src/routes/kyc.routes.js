import { Router } from 'express';
import { body, param,query } from 'express-validator';
import { authenticate, allowRoles } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  uploadKyc,
  myKyc,
  listPendingKyc,
  reviewKyc,
  kycUploadMiddleware,
} from '../controllers/kyc.controller.js';
import { authLimiter, adminLimiter } from '../middlewares/rateLimiters.js';

const router = Router();

// User uploads (influencer/business)
router.post(
  '/upload',
  authenticate,
  allowRoles('influencer', 'business'),
  authLimiter,
  kycUploadMiddleware.single('file'),
  [body('type').isString().isLength({ min: 2, max: 50 })],
  validate,
  uploadKyc,
);

router.get('/me', authenticate, allowRoles('influencer', 'business'), authLimiter, myKyc);

// Admin review
router.get(
  '/admin/pending',
  authenticate,
  allowRoles('admin'),
  adminLimiter,
  [query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 100 })],
  validate,
  listPendingKyc,
);
router.patch(
  '/admin/:docId',
  authenticate,
  allowRoles('admin'),
  adminLimiter,
  [param('docId').isMongoId(), body('status').isIn(['approved', 'rejected']), body('reason').optional().isString()],
  validate,
  reviewKyc,
);

export default router;


