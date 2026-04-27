import { Router } from 'express';
import { body } from 'express-validator';
import passport from 'passport';
import {
  registerInfluencer,
  registerBusiness,
  registerAdmin,
  loginInfluencer,
  loginBusiness,
  loginAdmin,
  login, // legacy auto-detect
  register, // legacy with role override
  refresh,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  googleAuth,
  googleAuthCallback,
} from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

// Influencer specific registration
router.post(
  '/influencer/register',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email address is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('name')
      .trim()
      .notEmpty()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name is required (2-100 characters)'),
    body('phone')
      .optional()
      .matches(/^[\+]?[0-9\s\-\(\)]{7,15}$/)
      .withMessage('Phone number must be 7-15 digits and may include + ( ) - and spaces'),
    body('meta')
      .optional()
      .isObject()
      .withMessage('Meta must be an object'),
    body('meta.instagram')
      .optional()
      .isString()
      .isLength({ max: 30 })
      .withMessage('Instagram username must be max 30 characters'),
    body('meta.tiktok')
      .optional()
      .isString()
      .isLength({ max: 24 })
      .withMessage('TikTok username must be max 24 characters'),
    body('meta.followers')
      .optional()
      .isInt({ min: 0, max: 100000000 })
      .withMessage('Followers must be a valid number (0-100M)'),
  ],
  validate,
  registerInfluencer
);

// Business specific registration
router.post(
  '/business/register',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid business email address is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('companyName')
      .trim()
      .notEmpty()
      .isLength({ min: 2, max: 100 })
      .withMessage('Company name is required (2-100 characters)'),
    body('businessDetails')
      .isObject()
      .withMessage('Business details are required'),
    body('businessDetails.sector')
      .notEmpty()
      .withMessage('Business sector is required'),
    body('businessDetails.companySize')
      .isIn(['1-10', '11-50', '51-200', '201-500', '500+'])
      .withMessage('Invalid company size. Must be: 1-10, 11-50, 51-200, 201-500, or 500+'),
    body('businessDetails.website')
      .optional()
      .isURL()
      .withMessage('Invalid website URL format'),
    body('businessDetails.phone')
      .isObject()
      .withMessage('Phone information is required'),
    body('businessDetails.phone.countryCode')
      .notEmpty()
      .withMessage('Country code is required'),
    body('businessDetails.phone.number')
      .notEmpty()
      .withMessage('Phone number is required'),
    body('acceptTerms')
      .isBoolean()
      .custom((value) => {
        if (value !== true) {
          throw new Error('Terms and conditions acceptance is required');
        }
        return true;
      })
  ],
  validate,
  registerBusiness
);

// Admin specific registration (restricted)
router.post(
  '/admin/register',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid admin email address is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Admin password must be at least 8 characters long'),
    body('name')
      .trim()
      .notEmpty()
      .isLength({ min: 2, max: 100 })
      .withMessage('Admin full name is required (2-100 characters)'),
    body('department')
      .optional()
      .isIn(['operations', 'finance', 'support', 'moderation', 'management'])
      .withMessage('Invalid department. Must be: operations, finance, support, moderation, or management'),
    body('adminData')
      .optional()
      .isObject()
      .withMessage('Admin data must be an object'),
    body('adminData.role')
      .optional()
      .isIn(['admin', 'superadmin', 'moderator'])
      .withMessage('Invalid admin role'),
  ],
  validate,
  registerAdmin
);

// Legacy registration (auto-detects role) - DEPRECATED
// Use specific role endpoints above
// router.post('/register', [...], validate, register);

// Separate login endpoints for each model
router.post(
  '/influencer/login',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email address is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  validate,
  loginInfluencer
);

router.post(
  '/business/login',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email address is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  validate,
  loginBusiness
);

router.post(
  '/admin/login',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email address is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  validate,
  loginAdmin
);

// Legacy login (auto-detects role)
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email address is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  validate,
  login
);

router.post(
  '/refresh',
  [
    body('refreshToken')
      .isString()
      .notEmpty()
      .withMessage('Refresh token is required')
  ],
  validate,
  refresh
);

router.post(
  '/logout',
  [
    body('refreshToken')
      .optional()
      .isString()
      .withMessage('Refresh token must be a string')
  ],
  validate,
  logout
);

router.get('/verify', [], verifyEmail);

router.post(
  '/forgot',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email address is required')
  ],
  validate,
  forgotPassword
);

router.post(
  '/reset',
  [
    body('token')
      .isString()
      .notEmpty()
      .withMessage('Reset token is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ],
  validate,
  resetPassword
);

// Google OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', passport.authenticate('google', { session: false }), googleAuthCallback);

export default router;

