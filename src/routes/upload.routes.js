import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { uploadMiddleware, uploadImage } from '../controllers/upload.controller.js';

const router = Router();

router.post('/image', authenticate, uploadMiddleware.single('file'), uploadImage);

export default router;





