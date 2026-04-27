import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middlewares/auth.js';
import { sendMessage, getConversation, inbox } from '../controllers/message.controller.js';
import { validate } from '../middlewares/validate.js';
import { authLimiter } from '../middlewares/rateLimiters.js';

const router = Router();

router.use(authenticate, authLimiter);

router.post('/send', [body('to').isMongoId(), body('body').isString().isLength({ min: 1, max: 1000 })], validate, sendMessage);
router.get('/conversation/:userId', [param('userId').isMongoId()], validate, getConversation);
router.get('/inbox', inbox);

export default router;





