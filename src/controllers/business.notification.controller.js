import { Business } from '../models/Business.js';

// Update business notification preferences
export const updateBusinessNotificationPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const notificationSettings = req.body;

    const business = await Business.findById(userId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Validate the input structure
    const allowedSections = ['general', 'preferences', 'silentMode'];
    const providedSections = Object.keys(notificationSettings);

    for (const section of providedSections) {
      if (!allowedSections.includes(section)) {
        return res.status(400).json({
          message: `Invalid section: ${section}. Allowed: ${allowedSections.join(', ')}`
        });
      }
    }

    // Validate silent mode schedule format
    if (notificationSettings.silentMode?.schedule) {
      const { start, end } = notificationSettings.silentMode.schedule;
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

      if (start && !timeRegex.test(start)) {
        return res.status(400).json({
          message: 'Silent mode start time must be in HH:MM format'
        });
      }

      if (end && !timeRegex.test(end)) {
        return res.status(400).json({
          message: 'Silent mode end time must be in HH:MM format'
        });
      }
    }

    // Update notification preferences
    business.businessNotifications = {
      ...business.businessNotifications,
      ...notificationSettings
    };

    await business.save();

    res.json({
      message: 'Business notification preferences updated successfully',
      notifications: business.businessNotifications
    });
  } catch (err) {
    next(err);
  }
};

// Get business notification preferences
export const getBusinessNotificationPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    const business = await Business.findById(userId).select('businessNotifications');

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.json({
      notifications: business.businessNotifications
    });
  } catch (err) {
    next(err);
  }
};

// Reset business notification preferences to defaults
export const resetBusinessNotificationPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    const business = await Business.findById(userId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Reset to default preferences
    business.businessNotifications = {
      general: {
        push: true,
        email: true,
      },
      preferences: {
        newRequests: {
          push: true,
          email: true,
        },
        messages: {
          push: true,
          email: true,
        },
        activeCampaigns: {
          push: true,
          email: true,
        },
        reminders: {
          push: true,
          email: true,
        },
        recommendations: {
          push: true,
          email: true,
        },
        marketing: {
          push: false,
          email: false,
        },
      },
      silentMode: {
        enabled: false,
        schedule: null,
      },
    };

    await business.save();

    res.json({
      message: 'Business notification preferences reset to defaults',
      notifications: business.businessNotifications
    });
  } catch (err) {
    next(err);
  }
};

// Get business notification preferences summary (for quick checks)
export const getBusinessNotificationSummary = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    const business = await Business.findById(userId).select('businessNotifications');

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const prefs = business.businessNotifications;

    // Create a summary of key preferences
    const summary = {
      pushEnabled: prefs.general?.push ?? true,
      emailEnabled: prefs.general?.email ?? true,
      silentModeEnabled: prefs.silentMode?.enabled ?? false,
      silentModeSchedule: prefs.silentMode?.enabled ? prefs.silentMode.schedule : null,
      marketingEnabled: prefs.preferences?.marketing?.email ?? false
    };

    res.json({ summary });
  } catch (err) {
    next(err);
  }
};

// Update specific notification preference
export const updateSpecificNotificationPreference = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { section, type, channel, enabled } = req.body;

    const business = await Business.findById(userId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Validate inputs
    const allowedSections = ['general', 'preferences'];
    const allowedChannels = ['push', 'email'];

    if (!allowedSections.includes(section)) {
      return res.status(400).json({
        message: `Invalid section. Allowed: ${allowedSections.join(', ')}`
      });
    }

    if (!allowedChannels.includes(channel)) {
      return res.status(400).json({
        message: `Invalid channel. Allowed: ${allowedChannels.join(', ')}`
      });
    }

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        message: 'Enabled must be a boolean value'
      });
    }

    // Update specific preference
    if (!business.businessNotifications[section]) {
      business.businessNotifications[section] = {};
    }

    if (section === 'general') {
      business.businessNotifications.general[channel] = enabled;
    } else if (section === 'preferences') {
      if (!business.businessNotifications.preferences[type]) {
        business.businessNotifications.preferences[type] = { push: true, email: true };
      }
      business.businessNotifications.preferences[type][channel] = enabled;
    }

    await business.save();

    res.json({
      message: 'Notification preference updated successfully',
      updated: {
        section,
        type: type || null,
        channel,
        enabled
      },
      notifications: business.businessNotifications
    });
  } catch (err) {
    next(err);
  }
};