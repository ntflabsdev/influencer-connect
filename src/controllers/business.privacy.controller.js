import { Business } from '../models/Business.js';
import { UserSession } from '../models/UserSession.js';

// Update business privacy settings
export const updateBusinessPrivacySettings = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { profileSettings } = req.body;

    const business = await Business.findById(userId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Validate the input structure
    const allowedSections = ['visibility', 'security', 'privacy', 'account'];
    const providedSections = Object.keys(profileSettings);

    for (const section of providedSections) {
      if (!allowedSections.includes(section)) {
        return res.status(400).json({
          message: `Invalid section: ${section}. Allowed: ${allowedSections.join(', ')}`
        });
      }
    }

    // Update privacy settings
    business.businessPrivacySettings = {
      ...business.businessPrivacySettings,
      ...profileSettings
    };

    await business.save();

    res.json({
      message: 'Business privacy settings updated successfully',
      privacySettings: business.businessPrivacySettings
    });
  } catch (err) {
    next(err);
  }
};

// Get business privacy settings
export const getBusinessPrivacySettings = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    const business = await Business.findById(userId).select('businessPrivacySettings');

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.json({
      privacySettings: business.businessPrivacySettings
    });
  } catch (err) {
    next(err);
  }
};

// Get connected devices for business
export const getConnectedDevices = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    const business = await Business.findById(userId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Get sessions from the database
    const sessions = await UserSession.find({
      userId: userId,
      isActive: true
    }).sort('-lastActive').limit(10);

    const connectedDevices = sessions.map(session => ({
      deviceId: session.sessionId,
      deviceName: session.deviceName,
      deviceType: session.deviceType,
      lastLogin: session.lastActive,
      ipAddress: session.ipAddress,
      location: session.location.city && session.location.country
        ? `${session.location.city}, ${session.location.country}`
        : 'Unknown',
      isActive: session.isActive,
      createdAt: session.createdAt
    }));

    res.json({
      connectedDevices
    });
  } catch (err) {
    next(err);
  }
};

// Remove a connected device
export const removeConnectedDevice = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { deviceId } = req.params;

    const business = await Business.findById(userId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Find and deactivate the session
    const session = await UserSession.findOne({
      userId: userId,
      sessionId: deviceId,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({ message: 'Device not found' });
    }

    await session.deactivate();

    res.json({
      message: 'Device removed successfully'
    });
  } catch (err) {
    next(err);
  }
};

// Remove all connected devices except current
export const removeAllConnectedDevices = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const currentDeviceId = req.body.currentDeviceId; // Should be passed from frontend

    const business = await Business.findById(userId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    await UserSession.updateMany(
      {
        userId: userId,
        sessionId: { $ne: currentDeviceId },
        isActive: true
      },
      { isActive: false }
    );

    res.json({
      message: 'All other devices removed successfully'
    });
  } catch (err) {
    next(err);
  }
};

// Reset business privacy settings to defaults
export const resetBusinessPrivacySettings = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    const business = await Business.findById(userId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Reset to default privacy settings
    business.businessPrivacySettings = {
      visibility: {
        profileVisible: true,
        showEmail: false,
        showPhone: false,
        allowMessages: true,
      },
      security: {
        twoFactorAuth: false,
        loginAlerts: true,
        connectedDevices: [],
      },
      privacy: {
        dataDownloadEnabled: true,
      },
      account: {
        canChangePassword: true,
        canDeleteAccount: true,
      },
    };

    await business.save();

    res.json({
      message: 'Business privacy settings reset to defaults',
      privacySettings: business.businessPrivacySettings
    });
  } catch (err) {
    next(err);
  }
};

// Update specific privacy setting
export const updateSpecificPrivacySetting = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { section, setting, value } = req.body;

    const business = await Business.findById(userId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Validate inputs
    const allowedSections = ['visibility', 'security', 'privacy', 'account'];
    const allowedSettings = {
      visibility: ['profileVisible', 'showEmail', 'showPhone', 'allowMessages'],
      security: ['twoFactorAuth', 'loginAlerts'],
      privacy: ['dataDownloadEnabled'],
      account: ['canChangePassword', 'canDeleteAccount']
    };

    if (!allowedSections.includes(section)) {
      return res.status(400).json({
        message: `Invalid section. Allowed: ${allowedSections.join(', ')}`
      });
    }

    if (!allowedSettings[section].includes(setting)) {
      return res.status(400).json({
        message: `Invalid setting for ${section}. Allowed: ${allowedSettings[section].join(', ')}`
      });
    }

    if (typeof value !== 'boolean') {
      return res.status(400).json({
        message: 'Value must be a boolean'
      });
    }

    // Update specific setting
    if (!business.businessPrivacySettings[section]) {
      business.businessPrivacySettings[section] = {};
    }

    business.businessPrivacySettings[section][setting] = value;

    await business.save();

    res.json({
      message: 'Privacy setting updated successfully',
      updated: {
        section,
        setting,
        value
      },
      privacySettings: business.businessPrivacySettings
    });
  } catch (err) {
    next(err);
  }
};