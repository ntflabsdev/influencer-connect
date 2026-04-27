import { Influencer } from '../models/Influencer.js';

// Update notification preferences
export const updateNotificationPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const preferences = req.body;

    // Validate the input structure
    const allowedFields = [
      'general',
      'offersAndCollaborations',
      'messages',
      'profileActivity',
      'recommendations',
      'quietHours',
      'emailFrequency'
    ];

    // Check if all provided fields are valid
    const providedFields = Object.keys(preferences);
    const invalidFields = providedFields.filter(field => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: `Invalid fields: ${invalidFields.join(', ')}`
      });
    }

    // Validate email frequency
    if (preferences.emailFrequency && !['immediate', 'daily', 'weekly'].includes(preferences.emailFrequency)) {
      return res.status(400).json({
        message: 'Email frequency must be one of: immediate, daily, weekly'
      });
    }

    // Validate quiet hours time format
    if (preferences.quietHours) {
      const { from, to } = preferences.quietHours;
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

      if (from && !timeRegex.test(from)) {
        return res.status(400).json({
          message: 'Quiet hours "from" must be in HH:MM format'
        });
      }

      if (to && !timeRegex.test(to)) {
        return res.status(400).json({
          message: 'Quiet hours "to" must be in HH:MM format'
        });
      }
    }

    // Update the user's notification preferences
    const influencer = await Influencer.findById(userId);
    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }

    // Merge the new preferences with existing ones
    influencer.notificationPreferences = {
      ...influencer.notificationPreferences,
      ...preferences
    };

    await influencer.save();

    res.json({
      message: 'Notification preferences updated successfully',
      preferences: user.notificationPreferences
    });
  } catch (err) {
    next(err);
  }
};

// Get notification preferences
export const getNotificationPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    const influencer = await Influencer.findById(userId).select('notificationPreferences');

    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }

    res.json({
      preferences: influencer.notificationPreferences
    });
  } catch (err) {
    next(err);
  }
};

// Reset notification preferences to defaults
export const resetNotificationPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    const influencer = await Influencer.findById(userId);
    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }

    // Reset to default preferences
    influencer.notificationPreferences = {
      general: {
        pushNotifications: true,
        emailNotifications: true,
      },
      offersAndCollaborations: {
        newOfferAlerts: true,
        directInvitations: true,
        collaborationStatusUpdates: true,
      },
      messages: {
        newMessages: true,
        messageReplies: true,
      },
      profileActivity: {
        profileViews: false,
        newFollowers: false,
      },
      recommendations: {
        personalizedOffers: true,
        profileImprovementTips: false,
      },
      quietHours: {
        enabled: false,
        from: null,
        to: null,
      },
      emailFrequency: 'daily',
    };

    await influencer.save();

    res.json({
      message: 'Notification preferences reset to defaults',
      preferences: influencer.notificationPreferences
    });
  } catch (err) {
    next(err);
  }
};

// Get notification preferences summary (for quick checks)
export const getNotificationSummary = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    const influencer = await Influencer.findById(userId).select('notificationPreferences');

    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }

    const prefs = influencer.notificationPreferences;

    // Create a summary of key preferences
    const summary = {
      emailEnabled: prefs.general?.emailNotifications ?? true,
      pushEnabled: prefs.general?.pushNotifications ?? true,
      emailFrequency: prefs.emailFrequency ?? 'daily',
      quietHoursEnabled: prefs.quietHours?.enabled ?? false,
      quietHoursRange: prefs.quietHours?.enabled ? {
        from: prefs.quietHours.from,
        to: prefs.quietHours.to
      } : null
    };

    res.json({ summary });
  } catch (err) {
    next(err);
  }
};