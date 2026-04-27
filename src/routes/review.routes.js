import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createReview, getTargetReviews } from '../controllers/review.controller.js';

const router = Router();

router.post(
    '/',
    authenticate,
    [
        body('applicationId').isMongoId().withMessage('Valid application ID required'),
        body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
        body('comment').optional().isString().isLength({ max: 500 })
    ],
    validate,
    createReview
);

router.get('/:targetId', [param('targetId').isMongoId()], validate, getTargetReviews);

export default router;
