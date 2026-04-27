import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createDispute, getMyDisputes } from '../controllers/dispute.controller.js';

const router = Router();

router.use(authenticate);

router.post(
    '/',
    [
        body('applicationId').isMongoId().withMessage('Valid application ID required'),
        body('issueType').isString().notEmpty().withMessage('Issue type is required'),
        body('description').isString().notEmpty().withMessage('Description is required')
    ],
    validate,
    createDispute
);

router.get('/me', getMyDisputes);

export default router;
