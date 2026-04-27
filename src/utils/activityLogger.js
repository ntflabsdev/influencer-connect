import { ActivityLog } from '../models/ActivityLog.js';

/**
 * Log admin activity to the audit trail
 * @param {Object} req - Express request object
 * @param {String} action - Action performed
 * @param {String} targetType - Type of target (influencer, business, offer, etc.)
 * @param {String|ObjectId} targetId - ID of the target
 * @param {String} description - Human-readable description
 * @param {Object} metadata - Additional metadata
 * @param {String} targetName - Optional name for quick reference
 */
export const logActivity = async (req, action, targetType, targetId, description, metadata = {}, targetName = null) => {
  try {
    if (!req.user || !req.user._id) {
      console.warn('Activity logging skipped: No user in request');
      return;
    }

    const activityLog = new ActivityLog({
      adminId: req.user._id,
      adminName: req.user.name || 'Unknown',
      adminEmail: req.user.email || 'unknown@example.com',
      action,
      targetType,
      targetId: targetId || null,
      targetName: targetName || null,
      description,
      metadata,
      ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      requestMethod: req.method,
      requestPath: req.path,
      timestamp: new Date(),
      status: 'success'
    });

    await activityLog.save();

    // Also log to admin's personal activity log
    if (req.user.logActivity && typeof req.user.logActivity === 'function') {
      await req.user.logActivity(action, targetType, targetId, description, req);
    }
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw - activity logging should not break the main flow
  }
};

/**
 * Log bulk activity
 */
export const logBulkActivity = async (req, action, targetType, targetIds, description, metadata = {}) => {
  try {
    if (!req.user || !req.user._id) {
      return;
    }

    const activityLog = new ActivityLog({
      adminId: req.user._id,
      adminName: req.user.name || 'Unknown',
      adminEmail: req.user.email || 'unknown@example.com',
      action,
      targetType,
      targetId: null, // Bulk actions don't have single target
      targetName: `${targetIds.length} items`,
      description,
      metadata: {
        ...metadata,
        count: targetIds.length,
        targetIds: targetIds
      },
      ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      requestMethod: req.method,
      requestPath: req.path,
      timestamp: new Date(),
      status: 'success'
    });

    await activityLog.save();
  } catch (error) {
    console.error('Failed to log bulk activity:', error);
  }
};
