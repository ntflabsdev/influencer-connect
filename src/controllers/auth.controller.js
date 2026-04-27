import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Influencer } from '../models/Influencer.js';
import { Business } from '../models/Business.js';
import { Admin } from '../models/Admin.js';
import { signToken, signShortLived, randomToken } from '../utils/token.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { sendEmail } from '../services/email.js';
import { env } from '../config/env.js';

const issueTokens = async (userId, role, modelType) => {
  const accessToken = signToken({ id: userId, role, modelType });
  const token = randomToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30d
  
  // Map role to model name (capitalize first letter)
  const userModel = role.charAt(0).toUpperCase() + role.slice(1);
  
  await RefreshToken.create({ 
    user: userId, 
    userModel: userModel, 
    token, 
    expiresAt 
  });
  return { accessToken, refreshToken: token };
};

// Get model based on role
const getModelByRole = (role) => {
  switch (role) {
    case 'influencer':
      return Influencer;
    case 'business':
      return Business;
    case 'admin':
      return Admin;
    default:
      throw new Error('Invalid role');
  }
};

// Get model type string
const getModelType = (role) => {
  switch (role) {
    case 'influencer':
      return 'influencer';
    case 'business':
      return 'business';
    case 'admin':
      return 'admin';
    default:
      throw new Error('Invalid role');
  }
};

// Generate unique username across all user types
const generateUniqueUsername = async (baseName, userId) => {
  // Clean the base name: remove special chars, spaces, make lowercase
  const cleanBase = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 15); // Max 15 chars for base

  let username = cleanBase;
  let counter = 1;

  // Check uniqueness across all models
  const models = [Influencer, Business, Admin];

  while (true) {
    let isTaken = false;

    for (const Model of models) {
      const existingUser = await Model.findOne({ username });
      if (existingUser && existingUser._id.toString() !== userId.toString()) {
        isTaken = true;
        break;
      }
    }

    if (!isTaken) {
      return username;
    }

    // Try with counter
    username = `${cleanBase}${counter}`;
    counter++;

    // Prevent infinite loop - max 999 attempts
    if (counter > 999) {
      // Fallback: use user ID
      return `user${userId.toString().slice(-8)}`;
    }
  }
};

// =========================
// SEPARATE REGISTRATION FUNCTIONS
// =========================

// Influencer Registration
export const registerInfluencer = async (req, res, next) => {
  try {
    const {
      email,
      password,
      name,
      phone,
      acceptTerms,
      meta
    } = req.body;

    // Check if email exists in any model
    const existingInfluencer = await Influencer.findOne({ email });
    const existingBusiness = await Business.findOne({ email });
    const existingAdmin = await Admin.findOne({ email });

    if (existingInfluencer || existingBusiness || existingAdmin) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Create influencer user data
    const userData = {
      email,
      password,
      name,
      phone: phone || '',
      meta: meta || {},
      // Initialize influencer fields with defaults
      bio: '',
      contentCategories: [],
      acceptTerms,
      contentTypes: [],
      contactInfo: {
        secondaryEmail: '',
        location: '',
        website: '',
        instagram: '',
        tiktok: ''
      },
      portfolio: [],
      statistics: {
        totalFollowers: 0,
        totalEngagement: 0,
        averageEngagementRate: 0,
        completedCollaborations: 0,
        activeCollaborations: 0,
        totalEarnings: 0,
        rating: 0,
        ratingCount: 0
      },
      notificationPreferences: {
        general: {
          pushNotifications: true,
          emailNotifications: true,
        },
        offersAndCollaborations: {
          newOfferAlerts: true,
          directInvitations: true,
          collaborationStatusUpdates: true,
          deadlineReminders: true,
        },
        messages: {
          newMessages: true,
          messageReplies: true,
        },
        profileActivity: {
          profileViews: false,
          newFollowers: false,
          contentLikes: false,
        },
        recommendations: {
          personalizedOffers: true,
          profileImprovementTips: false,
          trendingContent: true,
        },
        quietHours: {
          enabled: false,
          from: '',
          to: '',
          timezone: 'UTC',
        },
        emailFrequency: 'daily',
      },
      privacySettings: {
        profilePrivacy: {
          isProfilePublic: true,
          showEmailPublic: false,
          showPhonePublic: false,
          showStatistics: true,
          allowMessages: true,
          allowOfferInvitations: true,
          showPortfolio: true,
        },
        accountSecurity: {
          twoFactorAuthEnabled: false,
          twoFactorSecret: '',
          backupCodes: [],
          loginAlerts: true,
        },
        dataPrivacy: {
          canDownloadData: true,
          canDeleteAccount: true,
          dataDownloadRequested: false,
          accountDeletionRequested: false,
          deletionRequestedAt: null,
        },
      },
      isVerified: false,
      verificationStatus: {
        emailVerified: false,
        phoneVerified: false,
        socialVerified: false,
        identityVerified: false,
      },
      status: 'adminpending',
      location: {},
      lastActive: new Date(),
      loginCount: 0,
      profileViews: 0
    };

    // Create the influencer
    const user = await Influencer.create(userData);

    // Generate unique username for the influencer
    const uniqueUsername = await generateUniqueUsername(user.name, user._id);
    user.username = uniqueUsername;
    await user.save();

    // Send verification email
    const verifyToken = signShortLived({ id: user._id, purpose: 'verify', modelType: 'influencer' }, '1d');
    const verifyLink = `${env.clientUrl}/verify?token=${verifyToken}&role=influencer`;
    // await sendEmail({
    //   to: user.email,
    //   subject: 'Verify your influencer account',
    //   html: `Verify: <a href="${verifyLink}">${verifyLink}</a>`,
    // });

    const { accessToken, refreshToken } = await issueTokens(user._id, 'influencer', 'influencer');

    // Return user data without sensitive information
    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: 'influencer',
      status: user.status,
      username: user.username,
      createdAt: user.createdAt
    };

    res.status(201).json({ accessToken, refreshToken, user: safeUser });
  } catch (err) {
    next(err);
  }
};

// Business Registration
export const registerBusiness = async (req, res, next) => {
  try {
    const {
      email,
      password,
      companyName,
      businessDetails,
      acceptTerms,
      meta
    } = req.body;

    // Check if email exists in any model
    const existingInfluencer = await Influencer.findOne({ email });
    const existingBusiness = await Business.findOne({ email });
    const existingAdmin = await Admin.findOne({ email });

    if (existingInfluencer || existingBusiness || existingAdmin) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Create business user data
    const userData = {
      email,
      password,
      name: companyName,
      businessName: companyName,
      phone: `${businessDetails.phone.countryCode}${businessDetails.phone.number}`,
      category: businessDetails.sector,
      companySize: businessDetails.companySize,
      description: businessDetails.description || '',
      contactInfo: {
        phone: `${businessDetails.phone.countryCode}${businessDetails.phone.number}`,
        website: businessDetails.website,
        primaryEmail: email,
        secondaryEmail: '',
        address: {
          street: businessDetails.address?.street || '',
          city: businessDetails.address?.city || '',
          state: businessDetails.address?.state || '',
          country: businessDetails.address?.country || '',
          zipCode: businessDetails.address?.zipCode || ''
        },
        socialMedia: {}
      },
      legalInfo: {
        cif_nif: businessDetails?.cif_nif || '',
        taxId: businessDetails?.taxId || '',
        registrationNumber: businessDetails?.registrationNumber || '',
        legalEntity: businessDetails?.legalEntity || 'sl',
        taxResidence: businessDetails?.taxResidence || 'Spain'
      },
      meta: meta || {},
      businessStats: {
        totalOffers: 0,
        activeOffers: 0,
        completedCollaborations: 0,
        totalSpent: 0,
        rating: 0
      },
      verificationStatus: {
        emailVerified: false,
        phoneVerified: false,
        businessVerified: false,
        paymentVerified: false
      },
      acceptTerms,
      status: 'adminpending'
    };

    // Create the business
    const user = await Business.create(userData);

    // Send verification email
    const verifyToken = signShortLived({ id: user._id, purpose: 'verify', modelType: 'business' }, '1d');
    const verifyLink = `${env.clientUrl}/verify?token=${verifyToken}&role=business`;
    // await sendEmail({
    //   to: user.email,
    //   subject: 'Verify your business account',
    //   html: `Verify: <a href="${verifyLink}">${verifyLink}</a>`,
    // });

    const { accessToken, refreshToken } = await issueTokens(user._id, 'business', 'business');

    // Return user data without sensitive information
    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: 'business',
      status: user.status,
      businessName: user.businessName,
      category: user.category,
      createdAt: user.createdAt
    };

    res.status(201).json({ accessToken, refreshToken, user: safeUser });
  } catch (err) {
    next(err);
  }
};

// Admin Registration
export const registerAdmin = async (req, res, next) => {
  try {
    const {
      email,
      password,
      name,
      department,
      adminData,
      meta
    } = req.body;

    // Check if email exists in any model
    const existingInfluencer = await Influencer.findOne({ email });
    const existingBusiness = await Business.findOne({ email });
    const existingAdmin = await Admin.findOne({ email });

    if (existingInfluencer || existingBusiness || existingAdmin) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Create admin user data
    const userData = {
      email,
      password,
      name,
      role: adminData?.role || 'admin',
      department: department || 'operations',
      permissions: adminData?.permissions || {},
      adminStats: {
        usersVerified: 0,
        usersSuspended: 0,
        offersApproved: 0,
        contentModerated: 0,
        ticketsResolved: 0,
        loginCount: 0
      },
      meta: meta || {},
      status: 'active', // Admins are active by default
      isActive: true
    };

    // Create the admin
    const user = await Admin.create(userData);

    const { accessToken, refreshToken } = await issueTokens(user._id, 'admin', 'admin');

    // Return user data without sensitive information
    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: 'admin',
      status: user.status,
      adminRole: user.role,
      department: user.department,
      createdAt: user.createdAt
    };

    res.status(201).json({ accessToken, refreshToken, user: safeUser });
  } catch (err) {
    next(err);
  }
};

// Legacy registration (deprecated - use specific functions above)
export const register = async (req, res, next, roleOverride = null) => {
  try {
    const { role } = req.body;
    const finalRole = roleOverride || role;

    switch (finalRole) {
      case 'influencer':
        return registerInfluencer(req, res, next);
      case 'business':
        return registerBusiness(req, res, next);
      case 'admin':
        return registerAdmin(req, res, next);
      default:
        return res.status(400).json({ message: 'Invalid role' });
    }
  } catch (err) {
    next(err);
  }
};

// =========================
// SEPARATE LOGIN FUNCTIONS
// =========================

// Influencer Login
export const loginInfluencer = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find influencer by email
    const user = await Influencer.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // Check password
    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    // Check user status
    if (user.status === 'adminpending') {
      return res.status(403).json({
        message: 'Account pending admin approval',
        status: 'adminpending'
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        message: 'Account suspended',
        status: 'suspended'
      });
    }

    // Update login tracking
    user.lastActive = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    const { accessToken, refreshToken } = await issueTokens(user._id, 'influencer', 'influencer');

    // Return user data without sensitive information
    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: 'influencer',
      status: user.status,
      username: user.username,
      verificationStatus: user.verificationStatus,
      lastActive: user.lastActive
    };

    res.json({ accessToken, refreshToken, user: safeUser });
  } catch (err) {
    next(err);
  }
};

// Business Login
export const loginBusiness = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find business by email
    const user = await Business.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // Check password
    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    // Check user status
    if (user.status === 'adminpending') {
      return res.status(403).json({
        message: 'Account pending admin approval',
        status: 'adminpending'
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        message: 'Account suspended',
        status: 'suspended'
      });
    }

    // Update login tracking
    user.lastActive = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    const { accessToken, refreshToken } = await issueTokens(user._id, 'business', 'business');

    // Return user data without sensitive information
    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: 'business',
      status: user.status,
      businessName: user.businessName,
      category: user.category,
      verificationStatus: user.verificationStatus,
      lastActive: user.lastActive
    };

    res.json({ accessToken, refreshToken, user: safeUser });
  } catch (err) {
    next(err);
  }
};

// Admin Login
export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find admin by email
    const user = await Admin.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // Check password
    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    // Check if admin is active
    if (!user.isActive) {
      return res.status(403).json({
        message: 'Account suspended',
        status: 'suspended'
      });
    }

    // Update login tracking
    user.lastActive = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    user.adminStats.lastLogin = new Date();
    user.adminStats.loginCount = (user.adminStats.loginCount || 0) + 1;
    await user.save();

    const { accessToken, refreshToken } = await issueTokens(user._id, 'admin', 'admin');

    // Return user data without sensitive information
    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: 'admin',
      status: user.status,
      adminRole: user.role,
      department: user.department,
      lastActive: user.lastActive
    };

    res.json({ accessToken, refreshToken, user: safeUser });
  } catch (err) {
    next(err);
  }
};

// Legacy login (deprecated - use specific functions above)
export const login = async (req, res, next, roleOverride = null) => {
  try {
    const { email } = req.body;

    // If role override provided, use specific login function
    if (roleOverride) {
      switch (roleOverride) {
        case 'influencer':
          return loginInfluencer(req, res, next);
        case 'business':
          return loginBusiness(req, res, next);
        case 'admin':
          return loginAdmin(req, res, next);
        default:
          return res.status(400).json({ message: 'Invalid role' });
      }
    }

    // Auto-detect role by checking all models
    let user = await Influencer.findOne({ email });
    if (user) return loginInfluencer(req, res, next);

    user = await Business.findOne({ email });
    if (user) return loginBusiness(req, res, next);

    user = await Admin.findOne({ email });
    if (user) return loginAdmin(req, res, next);

    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'Missing refresh token' });

    const stored = await RefreshToken.findOne({ token: refreshToken });
    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Get user from appropriate model using userModel field
    const modelName = stored.userModel || 'Influencer';
    const role = modelName.toLowerCase();
    const Model = getModelByRole(role);
    const user = await Model.findById(stored.user);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const { accessToken, refreshToken: newRefresh } = await issueTokens(user._id, role, role);
    // rotate: delete old
    await RefreshToken.deleteOne({ token: refreshToken });
    res.json({ accessToken, refreshToken: newRefresh });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await RefreshToken.deleteOne({ token: refreshToken });
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    const decoded = jwt.verify(token, env.jwtSecret);
    if (decoded.purpose !== 'verify') return res.status(400).json({ message: 'Invalid token' });

    // Get user from appropriate model
    const Model = getModelByRole(decoded.modelType || 'influencer');
    const user = await Model.findByIdAndUpdate(decoded.id, { isVerified: true }, { new: true });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check all models for the email
    let user = await Influencer.findOne({ email });
    let Model = Influencer;
    let modelType = 'influencer';

    if (!user) {
      user = await Business.findOne({ email });
      Model = Business;
      modelType = 'business';
    }

    if (!user) {
      user = await Admin.findOne({ email });
      Model = Admin;
      modelType = 'admin';
    }

    if (user) {
      const resetToken = signShortLived({ id: user._id, purpose: 'reset', modelType }, '30m');
      const resetLink = `${env.clientUrl}/reset?token=${resetToken}`;
      // await sendEmail({
      //   to: user.email,
      //   subject: 'Reset your password',
      //   html: `Reset: <a href="${resetLink}">${resetLink}</a>`,
      // });
    }
    res.json({ message: 'If account exists, email sent' });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const decoded = jwt.verify(token, env.jwtSecret);
    if (decoded.purpose !== 'reset') return res.status(400).json({ message: 'Invalid token' });

    // Get user from appropriate model
    const Model = getModelByRole(decoded.modelType || 'influencer');
    const user = await Model.findById(decoded.id);
    if (!user) return res.status(400).json({ message: 'User not found' });

    user.password = password;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    next(err);
  }
};

// Google Authentication Handlers
export const googleAuth = (req, res, next) => {
  const { role } = req.query;
  if (!['influencer', 'business', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role specified' });
  }
  // Store role in session for callback
  req.session = req.session || {};
  req.session.signupRole = role;
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: role // Pass role as state parameter
  })(req, res, next);
};

export const googleAuthCallback = async (req, res, next) => {
  try {
    const profileData = req.user;
    const role = req.query.state; // Get role from state parameter

    if (!profileData || !role) {
      return res.redirect(`${env.clientUrl}/auth/error?message=Invalid authentication data`);
    }

    const Model = getModelByRole(role);
    const modelType = getModelType(role);

    // Check if user already exists
    let user = await Model.findOne({ email: profileData.profile.email });

    if (!user) {
      // Create new user
      const userData = {
        name: profileData.profile.name,
        email: profileData.profile.email,
        password: Math.random().toString(36), // Random password since they'll use Google auth
        status: 'adminpending',
        meta: {
          googleId: profileData.profile.id,
          avatarUrl: profileData.profile.avatarUrl,
        },
        isVerified: true, // Google accounts are pre-verified
      };

      // Add role-specific initialization
      if (role === 'influencer') {
        userData.name = profileData.profile.name;
        userData.bio = '';
        userData.contentCategories = [];
        userData.contentTypes = [];
        userData.contactInfo = {
          secondaryEmail: '',
          location: '',
          website: '',
          instagram: '',
          tiktok: ''
        };
        userData.portfolio = [];
        userData.statistics = {
          totalFollowers: 0,
          totalEngagement: 0,
          averageEngagementRate: 0,
          completedCollaborations: 0,
          activeCollaborations: 0,
          totalEarnings: 0,
          rating: 0,
          ratingCount: 0
        };
        userData.notificationPreferences = {
          general: { pushNotifications: true, emailNotifications: true },
          offersAndCollaborations: { newOfferAlerts: true, directInvitations: true, collaborationStatusUpdates: true, deadlineReminders: true },
          messages: { newMessages: true, messageReplies: true },
          profileActivity: { profileViews: false, newFollowers: false, contentLikes: false },
          recommendations: { personalizedOffers: true, profileImprovementTips: false, trendingContent: true },
          quietHours: { enabled: false, from: '', to: '', timezone: 'UTC' },
          emailFrequency: 'daily'
        };
        userData.privacySettings = {
          profilePrivacy: { isProfilePublic: true, showEmailPublic: false, showPhonePublic: false, showStatistics: true, allowMessages: true, allowOfferInvitations: true, showPortfolio: true },
          accountSecurity: { twoFactorAuthEnabled: false, twoFactorSecret: '', backupCodes: [], loginAlerts: true },
          dataPrivacy: { canDownloadData: true, canDeleteAccount: true, dataDownloadRequested: false, accountDeletionRequested: false, deletionRequestedAt: null }
        };
        userData.isVerified = true; // Google accounts are pre-verified
        userData.verificationStatus = { emailVerified: true, phoneVerified: false, socialVerified: true, identityVerified: false };
        userData.status = 'active'; // Google auth users can be active immediately
        userData.location = {};
        userData.lastActive = new Date();
        userData.loginCount = 0;
        userData.profileViews = 0;
      } else if (role === 'business') {
        userData.businessName = profileData.profile.name;
        userData.businessStats = {
          totalOffers: 0,
          activeOffers: 0,
          completedCollaborations: 0,
          totalSpent: 0,
          rating: 0
        };
        userData.verificationStatus = {
          emailVerified: true,
          phoneVerified: false,
          businessVerified: false,
          paymentVerified: false
        };
      }

      user = await Model.create(userData);

      // Generate unique username for new Google auth influencers
      if (role === 'influencer') {
        const uniqueUsername = await generateUniqueUsername(user.name, user._id);
        user.username = uniqueUsername;
        await user.save();
      }
    }

    // Check if user is adminpending or suspended
    if (user.status === 'adminpending') {
      return res.redirect(`${env.clientUrl}/auth/pending?email=${encodeURIComponent(user.email)}&role=${role}`);
    }

    if (user.status === 'suspended' || (role === 'admin' && !user.isActive)) {
      return res.redirect(`${env.clientUrl}/auth/suspended?email=${encodeURIComponent(user.email)}&role=${role}`);
    }

    // Issue tokens and redirect to dashboard
    const { accessToken, refreshToken } = await issueTokens(user._id, role, modelType);
    const redirectUrl = `${env.clientUrl}/auth/success?accessToken=${accessToken}&refreshToken=${refreshToken}&role=${role}`;
    res.redirect(redirectUrl);
  } catch (err) {
    console.error('Google auth callback error:', err);
    res.redirect(`${env.clientUrl}/auth/error?message=Authentication failed`);
  }
};
