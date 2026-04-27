import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, allowRoles } from '../middlewares/auth.js';
import { createHold, captureHold, refundPayment, stripeWebhook } from '../controllers/payment.controller.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

router.post(
  '/hold',
  authenticate,
  allowRoles('business'),
  [body('applicationId').isMongoId(), body('amount').isFloat({ min: 1 })],
  validate,
  createHold,
);
router.post(
  '/capture',
  authenticate,
  allowRoles('business'),
  [body('paymentIntentId').isString()],
  validate,
  captureHold,
);
router.post(
  '/refund',
  authenticate,
  allowRoles('admin', 'business'),
  [body('paymentIntentId').isString()],
  validate,
  refundPayment,
);

// Stripe webhook (raw body handled in app entry)
router.post('/webhook', stripeWebhook);

export default router;

