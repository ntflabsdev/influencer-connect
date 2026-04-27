import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import {
  getInstagramAuthUrl,
  handleInstagramCallback,
  getTikTokAuthUrl,
  handleTikTokCallback,
  refreshInstagramToken,
  refreshTikTokToken,
  disconnectInstagram,
  disconnectTikTok,
  getSocialConnections
} from '../controllers/oauth.controller.js';

const router = Router();

// All social routes require authentication
router.use(authenticate);

// Get social connections status
router.get('/connections', getSocialConnections);

// Instagram OAuth flow
router.get('/instagram/auth', getInstagramAuthUrl);
router.get('/instagram/callback', handleInstagramCallback);
router.post('/instagram/refresh', refreshInstagramToken);

// TikTok OAuth flow
router.get('/tiktok/auth', getTikTokAuthUrl);
router.get('/tiktok/callback', handleTikTokCallback);
router.post('/tiktok/refresh', refreshTikTokToken);

// Disconnect social accounts
router.delete('/instagram/disconnect', disconnectInstagram);
router.delete('/tiktok/disconnect', disconnectTikTok);

export default router;