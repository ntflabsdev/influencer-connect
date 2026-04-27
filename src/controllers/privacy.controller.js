import { Influencer } from '../models/Influencer.js';
import { UserSession } from '../models/UserSession.js';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// Update privacy settings
export const updatePrivacySettings = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { profilePrivacy, accountSecurity } = req.body;

    const influencer = await Influencer.findById(userId);
    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }

    // Update privacy settings
    if (profilePrivacy) {
      influencer.privacySettings.profilePrivacy = {
        ...influencer.privacySettings.profilePrivacy,
        ...profilePrivacy
      };
    }

    // Handle account security settings
    if (accountSecurity) {
      // Note: 2FA implementation would require additional setup
      influencer.privacySettings.accountSecurity = {
        ...influencer.privacySettings.accountSecurity,
        twoFactorAuthEnabled: accountSecurity.twoFactorAuthEnabled ?? influencer.privacySettings.accountSecurity.twoFactorAuthEnabled
      };
    }

    await influencer.save();

    res.json({
      message: 'Privacy settings updated successfully',
      privacySettings: influencer.privacySettings
    });
  } catch (err) {
    next(err);
  }
};

// Get privacy settings
export const getPrivacySettings = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    const influencer = await Influencer.findById(userId).select('privacySettings');

    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }

    res.json({
      privacySettings: influencer.privacySettings
    });
  } catch (err) {
    next(err);
  }
};

// Get active sessions
export const getActiveSessions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const currentToken = req.headers.authorization?.replace('Bearer ', '');

    // Get all active sessions for this user
    const sessions = await UserSession.find({
      userId: userId,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).sort('-lastActive');

    // Format sessions for response
    const formattedSessions = await Promise.all(
      sessions.map(async (session) => {
        // Try to determine if this is the current session
        let isCurrentSession = false;
        try {
          if (currentToken) {
            const decoded = jwt.verify(currentToken, env.jwtSecret);
            // This is a simplified check - in production you'd need to store session IDs
            isCurrentSession = decoded.id === userId.toString();
          }
        } catch (err) {
          // Token invalid or expired
        }

        return {
          sessionId: session.sessionId,
          deviceName: session.deviceName,
          deviceType: session.deviceType,
          browser: session.browser,
          os: session.os,
          location: session.location.city && session.location.country
            ? `${session.location.city}, ${session.location.country}`
            : 'Unknown',
          ipAddress: session.ipAddress,
          lastActive: session.lastActive,
          isCurrentSession,
          createdAt: session.createdAt
        };
      })
    );

    res.json({
      sessions: formattedSessions
    });
  } catch (err) {
    next(err);
  }
};

// Deactivate a specific session
export const deactivateSession = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { sessionId } = req.params;

    const session = await UserSession.findOne({
      userId: userId,
      sessionId,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    await session.deactivate();

    res.json({
      message: 'Session deactivated successfully'
    });
  } catch (err) {
    next(err);
  }
};

// Deactivate all other sessions (except current)
export const deactivateAllOtherSessions = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const currentSessionId = req.body.currentSessionId; // Should be passed from frontend

    await UserSession.updateMany(
      {
        userId: userId,
        sessionId: { $ne: currentSessionId },
        isActive: true
      },
      { isActive: false }
    );

    res.json({
      message: 'All other sessions deactivated successfully'
    });
  } catch (err) {
    next(err);
  }
};

// Request data download (GDPR)
export const requestDataDownload = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    const influencer = await Influencer.findById(userId);
    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }

    if (!influencer.privacySettings.gdpr.canDownloadData) {
      return res.status(403).json({
        message: 'Data download not available for this account'
      });
    }

    influencer.privacySettings.gdpr.dataDownloadRequested = true;
    await influencer.save();

    // TODO: In production, this would trigger an email with download link
    // For now, we'll just mark it as requested

    res.json({
      message: 'Data download request submitted. You will receive an email with download instructions.',
      requestedAt: new Date()
    });
  } catch (err) {
    next(err);
  }
};

// Request account deletion (GDPR)
export const requestAccountDeletion = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    const influencer = await Influencer.findById(userId);
    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }

    if (!influencer.privacySettings.gdpr.canDeleteAccount) {
      return res.status(403).json({
        message: 'Account deletion not available for this account'
      });
    }

    influencer.privacySettings.gdpr.accountDeletionRequested = true;
    influencer.privacySettings.gdpr.deletionRequestedAt = new Date();
    await influencer.save();

    res.json({
      message: 'Account deletion request submitted. Your account will be deleted in 30 days. You can cancel this request anytime before then.',
      deletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      requestedAt: user.privacySettings.gdpr.deletionRequestedAt
    });
  } catch (err) {
    next(err);
  }
};

// Cancel account deletion request
export const cancelAccountDeletion = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    const influencer = await Influencer.findById(userId);
    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }

    influencer.privacySettings.gdpr.accountDeletionRequested = false;
    influencer.privacySettings.gdpr.deletionRequestedAt = undefined;
    await influencer.save();

    res.json({
      message: 'Account deletion request cancelled successfully'
    });
  } catch (err) {
    next(err);
  }
};

// Get data export (simplified version for demo)
export const getDataExport = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    const influencer = await Influencer.findById(userId).select('-password -__v');
    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }

    // Create a data export object
    const dataExport = {
      user: {
        personalInfo: {
          id: influencer._id,
          name: influencer.name,
          email: influencer.email,
          phone: influencer.phone,
          role: 'influencer',
          status: influencer.status,
          createdAt: influencer.createdAt,
          updatedAt: influencer.updatedAt
        },
        profile: {
          profileImage: influencer.avatarUrl,
          basicInfo: {
            fullName: influencer.name,
            username: influencer.username,
            bio: influencer.bio
          },
          contentCategories: influencer.contentCategories,
          contactInfo: {
            email: influencer.email,
            phone: influencer.phone,
            location: influencer.location,
            website: influencer.website
          }
        },
        socialConnections: {
          instagram: influencer.meta.instagram?.connected ? {
            username: influencer.meta.instagram.username,
            followers: influencer.meta.instagram.followers,
            connectedAt: influencer.meta.instagram.createdAt
          } : null,
          tiktok: influencer.meta.tiktok?.connected ? {
            username: influencer.meta.tiktok.username,
            followers: influencer.meta.tiktok.followers,
            connectedAt: influencer.meta.tiktok.createdAt
          } : null
        },
        privacySettings: influencer.privacySettings,
        notificationPreferences: influencer.notificationPreferences
      },
      exportDate: new Date(),
      version: '1.0'
    };

    // Reset download request flag
    influencer.privacySettings.gdpr.dataDownloadRequested = false;
    await influencer.save();

    res.json({
      message: 'Data export generated successfully',
      data: dataExport
    });
  } catch (err) {
    next(err);
  }
};