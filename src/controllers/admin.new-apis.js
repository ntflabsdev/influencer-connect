import { Influencer } from '../models/Influencer.js';
import { Business } from '../models/Business.js';
import { Admin } from '../models/Admin.js';
import { Application } from '../models/Application.js';
import { Offer } from '../models/Offer.js';
import { Payment } from '../models/Payment.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { Notification } from '../models/Notification.js';
import { logActivity, logBulkActivity } from '../utils/activityLogger.js';

// =================================
// ACTIVITY LOGS & AUDIT TRAIL APIs
// =================================

// Get activity logs with filters
export const getActivityLogs = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      adminId, 
      action, 
      targetType, 
      targetId,
      startDate,
      endDate,
      search
    } = req.query;

    const filter = {};
    
    if (adminId) filter.adminId = adminId;
    if (action) filter.action = action;
    if (targetType) filter.targetType = targetType;
    if (targetId) filter.targetId = targetId;
    
    // Date range filter
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    // Search in description
    if (search) {
      filter.description = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .populate('adminId', 'name email role')
        .sort('-timestamp')
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      ActivityLog.countDocuments(filter)
    ]);

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get activity log by ID
export const getActivityLogById = async (req, res, next) => {
  try {
    const { logId } = req.params;
    const log = await ActivityLog.findById(logId)
      .populate('adminId', 'name email role')
      .lean();
    
    if (!log) {
      return res.status(404).json({ message: 'Activity log not found' });
    }
    
    res.json({ log });
  } catch (err) {
    next(err);
  }
};

// Get admin's own activity logs
export const getMyActivityLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, action, targetType } = req.query;
    const adminId = req.user._id || req.user.id;

    const filter = { adminId };
    if (action) filter.action = action;
    if (targetType) filter.targetType = targetType;

    const skip = (page - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .sort('-timestamp')
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      ActivityLog.countDocuments(filter)
    ]);

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
};

// =================================
// NOTIFICATION APIs
// =================================

// Get notifications for current admin
export const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, read, type, priority } = req.query;
    const adminId = req.user._id || req.user.id;

    const filter = {
      recipientId: adminId,
      recipientType: 'admin'
    };

    if (read !== undefined) filter.read = read === 'true';
    if (type) filter.type = type;
    if (priority) filter.priority = priority;

    const skip = (page - 1) * parseInt(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ ...filter, read: false })
    ]);

    res.json({
      notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
};

// Mark notification as read
export const markNotificationRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const adminId = req.user._id || req.user.id;

    const notification = await Notification.findOne({
      _id: notificationId,
      recipientId: adminId,
      recipientType: 'admin'
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({ notification });
  } catch (err) {
    next(err);
  }
};

// Mark all notifications as read
export const markAllNotificationsRead = async (req, res, next) => {
  try {
    const adminId = req.user._id || req.user.id;

    await Notification.updateMany(
      { recipientId: adminId, recipientType: 'admin', read: false },
      { read: true, readAt: new Date() }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

// Create notification (for system use)
export const createNotification = async (req, res, next) => {
  try {
    const {
      recipientId,
      recipientType = 'admin',
      type,
      title,
      message,
      relatedType,
      relatedId,
      priority = 'normal',
      actionUrl,
      actionLabel,
      metadata
    } = req.body;

    const notification = new Notification({
      recipientId,
      recipientType,
      type,
      title,
      message,
      relatedType,
      relatedId,
      priority,
      actionUrl,
      actionLabel,
      metadata
    });

    await notification.save();

    res.status(201).json({ notification });
  } catch (err) {
    next(err);
  }
};

// Delete notification
export const deleteNotification = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const adminId = req.user._id || req.user.id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipientId: adminId,
      recipientType: 'admin'
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (err) {
    next(err);
  }
};

// =================================
// REPORTS GENERATION APIs
// =================================

// Generate user report
export const generateUserReport = async (req, res, next) => {
  try {
    const { 
      userType, 
      status, 
      startDate, 
      endDate, 
      format = 'json' 
    } = req.query;

    const filter = {};
    if (userType) filter.role = userType;
    if (status) filter.status = status;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    let Model = Influencer;
    if (userType === 'business') {
      Model = Business;
    } else if (userType === 'admin') {
      Model = Admin;
    }

    const users = await Model.find(filter)
      .select('-password -refreshTokens')
      .sort('-createdAt')
      .lean();

    // Log the report generation
    await logActivity(
      req,
      'report_generated',
      userType || 'system',
      null,
      `Generated ${userType || 'user'} report with ${users.length} records`,
      { format, filters: req.query }
    );

    if (format === 'csv') {
      // Generate CSV
      const headers = Object.keys(users[0] || {}).join(',');
      const rows = users.map(user => 
        Object.values(user).map(val => 
          typeof val === 'object' ? JSON.stringify(val) : val
        ).join(',')
      );
      const csv = [headers, ...rows].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=users-report-${Date.now()}.csv`);
      return res.send(csv);
    }

    res.json({
      report: {
        type: 'user',
        generatedAt: new Date(),
        filters: req.query,
        totalRecords: users.length,
        data: users
      }
    });
  } catch (err) {
    next(err);
  }
};

// Generate activity report
export const generateActivityReport = async (req, res, next) => {
  try {
    const { 
      adminId, 
      action, 
      targetType, 
      startDate, 
      endDate, 
      format = 'json' 
    } = req.query;

    const filter = {};
    if (adminId) filter.adminId = adminId;
    if (action) filter.action = action;
    if (targetType) filter.targetType = targetType;
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const logs = await ActivityLog.find(filter)
      .populate('adminId', 'name email role')
      .sort('-timestamp')
      .lean();

    await logActivity(
      req,
      'report_generated',
      'system',
      null,
      `Generated activity report with ${logs.length} records`,
      { format, filters: req.query }
    );

    if (format === 'csv') {
      const headers = ['Timestamp', 'Admin', 'Action', 'Target Type', 'Target ID', 'Description'];
      const rows = logs.map(log => [
        log.timestamp,
        log.adminName,
        log.action,
        log.targetType,
        log.targetId || '',
        log.description
      ]);
      const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=activity-report-${Date.now()}.csv`);
      return res.send(csv);
    }

    res.json({
      report: {
        type: 'activity',
        generatedAt: new Date(),
        filters: req.query,
        totalRecords: logs.length,
        data: logs
      }
    });
  } catch (err) {
    next(err);
  }
};

// =================================
// DATA EXPORT APIs
// =================================

// Export users data
export const exportUsers = async (req, res, next) => {
  try {
    const { 
      userType, 
      status, 
      format = 'csv',
      fields 
    } = req.query;

    const filter = {};
    if (userType) filter.role = userType;
    if (status) filter.status = status;

    let Model = Influencer;
    if (userType === 'business') {
      Model = Business;
    } else if (userType === 'admin') {
      Model = Admin;
    }

    const users = await Model.find(filter)
      .select('-password -refreshTokens')
      .sort('-createdAt')
      .lean();

    await logActivity(
      req,
      'data_exported',
      userType || 'system',
      null,
      `Exported ${users.length} ${userType || 'user'} records`,
      { format, fields }
    );

    if (format === 'csv') {
      const selectedFields = fields ? fields.split(',') : Object.keys(users[0] || {});
      const headers = selectedFields.join(',');
      const rows = users.map(user => 
        selectedFields.map(field => {
          const value = user[field];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value);
          return String(value).replace(/,/g, ';');
        }).join(',')
      );
      const csv = [headers, ...rows].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${userType || 'users'}-export-${Date.now()}.csv`);
      return res.send(csv);
    }

    res.json({
      exported: true,
      format,
      totalRecords: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// Export activity logs
export const exportActivityLogs = async (req, res, next) => {
  try {
    const { 
      adminId, 
      action, 
      targetType, 
      startDate, 
      endDate, 
      format = 'csv' 
    } = req.query;

    const filter = {};
    if (adminId) filter.adminId = adminId;
    if (action) filter.action = action;
    if (targetType) filter.targetType = targetType;
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const logs = await ActivityLog.find(filter)
      .populate('adminId', 'name email')
      .sort('-timestamp')
      .lean();

    await logActivity(
      req,
      'data_exported',
      'system',
      null,
      `Exported ${logs.length} activity log records`,
      { format }
    );

    if (format === 'csv') {
      const headers = ['Timestamp', 'Admin Name', 'Admin Email', 'Action', 'Target Type', 'Target ID', 'Description', 'IP Address'];
      const rows = logs.map(log => [
        log.timestamp,
        log.adminName,
        log.adminEmail,
        log.action,
        log.targetType,
        log.targetId || '',
        log.description.replace(/,/g, ';'),
        log.ipAddress
      ]);
      const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=activity-logs-export-${Date.now()}.csv`);
      return res.send(csv);
    }

    res.json({
      exported: true,
      format,
      totalRecords: logs.length,
      data: logs
    });
  } catch (err) {
    next(err);
  }
};

// =================================
// BULK USER OPERATIONS APIs
// =================================

// Bulk approve users
export const bulkApproveUsers = async (req, res, next) => {
  try {
    const { userIds, userType } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'userIds must be a non-empty array' });
    }

    let Model;
    if (userType === 'influencer') {
      Model = Influencer;
    } else if (userType === 'business') {
      Model = Business;
    } else {
      return res.status(400).json({ message: 'userType must be influencer or business' });
    }

    const result = await Model.updateMany(
      { _id: { $in: userIds } },
      { 
        $set: { 
          status: 'active',
          isVerified: true
        }
      }
    );

    // Log bulk activity
    await logBulkActivity(
      req,
      `bulk_user_approved`,
      userType,
      userIds,
      `Bulk approved ${result.modifiedCount} ${userType} users`,
      { userType, count: result.modifiedCount }
    );

    // Create notification
    const notification = new Notification({
      recipientId: req.user._id || req.user.id,
      recipientType: 'admin',
      type: 'bulk_action_complete',
      title: 'Bulk Approval Complete',
      message: `Successfully approved ${result.modifiedCount} ${userType} users`,
      priority: 'normal',
      metadata: { userType, count: result.modifiedCount }
    });
    await notification.save();

    res.json({
      message: `Bulk approved ${result.modifiedCount} users`,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    });
  } catch (err) {
    next(err);
  }
};

// Bulk reject users
export const bulkRejectUsers = async (req, res, next) => {
  try {
    const { userIds, userType, reason } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'userIds must be a non-empty array' });
    }

    let Model;
    if (userType === 'influencer') {
      Model = Influencer;
    } else if (userType === 'business') {
      Model = Business;
    } else {
      return res.status(400).json({ message: 'userType must be influencer or business' });
    }

    const result = await Model.updateMany(
      { _id: { $in: userIds } },
      { 
        $set: { 
          status: 'rejected',
          isVerified: false
        }
      }
    );

    await logBulkActivity(
      req,
      `bulk_user_rejected`,
      userType,
      userIds,
      `Bulk rejected ${result.modifiedCount} ${userType} users`,
      { userType, count: result.modifiedCount, reason }
    );

    const notification = new Notification({
      recipientId: req.user._id || req.user.id,
      recipientType: 'admin',
      type: 'bulk_action_complete',
      title: 'Bulk Rejection Complete',
      message: `Successfully rejected ${result.modifiedCount} ${userType} users`,
      priority: 'normal',
      metadata: { userType, count: result.modifiedCount }
    });
    await notification.save();

    res.json({
      message: `Bulk rejected ${result.modifiedCount} users`,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    });
  } catch (err) {
    next(err);
  }
};

// Bulk suspend users
export const bulkSuspendUsers = async (req, res, next) => {
  try {
    const { userIds, userType, reason } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'userIds must be a non-empty array' });
    }

    let Model;
    if (userType === 'influencer') {
      Model = Influencer;
    } else if (userType === 'business') {
      Model = Business;
    } else {
      return res.status(400).json({ message: 'userType must be influencer or business' });
    }

    const result = await Model.updateMany(
      { _id: { $in: userIds } },
      { 
        $set: { 
          status: 'suspended'
        }
      }
    );

    await logBulkActivity(
      req,
      `bulk_user_suspended`,
      userType,
      userIds,
      `Bulk suspended ${result.modifiedCount} ${userType} users`,
      { userType, count: result.modifiedCount, reason }
    );

    res.json({
      message: `Bulk suspended ${result.modifiedCount} users`,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    });
  } catch (err) {
    next(err);
  }
};

// =================================
// USER ACTIVITY HISTORY APIs
// =================================

// Get user activity history
export const getUserActivityHistory = async (req, res, next) => {
  try {
    const { userId, userType, page = 1, limit = 50 } = req.query;

    if (!userId || !userType) {
      return res.status(400).json({ message: 'userId and userType are required' });
    }

    const filter = {
      targetType: userType,
      targetId: userId
    };

    const skip = (page - 1) * parseInt(limit);

    const [activities, total] = await Promise.all([
      ActivityLog.find(filter)
        .populate('adminId', 'name email role')
        .sort('-timestamp')
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      ActivityLog.countDocuments(filter)
    ]);

    res.json({
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
};

// =================================
// ADVANCED USER SEARCH APIs
// =================================

// Advanced user search with multiple filters
export const advancedUserSearch = async (req, res, next) => {
  try {
    const {
      userType,
      search,
      status,
      isVerified,
      startDate,
      endDate,
      minFollowers,
      maxFollowers,
      category,
      location,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    let Model;
    if (userType === 'influencer') {
      Model = Influencer;
    } else if (userType === 'business') {
      Model = Business;
    } else {
      return res.status(400).json({ message: 'userType must be influencer or business' });
    }

    const filter = {};

    // Status filter
    if (status) filter.status = status;

    // Verification filter
    if (isVerified !== undefined) {
      if (userType === 'influencer') {
        filter.isVerified = isVerified === 'true';
      } else if (userType === 'business') {
        filter['verificationStatus.businessVerified'] = isVerified === 'true';
      }
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Search in name, email
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
      
      if (userType === 'business') {
        filter.$or.push({ businessName: { $regex: search, $options: 'i' } });
      }
    }

    // Followers range (for influencers)
    if (userType === 'influencer' && (minFollowers || maxFollowers)) {
      filter['statistics.totalFollowers'] = {};
      if (minFollowers) filter['statistics.totalFollowers'].$gte = parseInt(minFollowers);
      if (maxFollowers) filter['statistics.totalFollowers'].$lte = parseInt(maxFollowers);
    }

    // Category filter
    if (category) {
      if (userType === 'influencer') {
        filter['influencerProfile.basicInfo.categories'] = { $in: [category] };
      } else if (userType === 'business') {
        filter.category = category;
      }
    }

    // Location filter
    if (location) {
      if (userType === 'influencer') {
        filter['location.city'] = { $regex: location, $options: 'i' };
      } else if (userType === 'business') {
        filter['contactInfo.location'] = { $regex: location, $options: 'i' };
      }
    }

    const skip = (page - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [users, total] = await Promise.all([
      Model.find(filter)
        .select('-password -refreshTokens')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Model.countDocuments(filter)
    ]);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      filters: req.query
    });
  } catch (err) {
    next(err);
  }
};

// =================================
// USER STATISTICS APIs
// =================================

// Get detailed user statistics
export const getUserStatistics = async (req, res, next) => {
  try {
    const { userId, userType } = req.params;

    if (!userId || !userType) {
      return res.status(400).json({ message: 'userId and userType are required' });
    }

    let Model;
    if (userType === 'influencer') {
      Model = Influencer;
    } else if (userType === 'business') {
      Model = Business;
    } else {
      return res.status(400).json({ message: 'Invalid userType' });
    }

    const user = await Model.findById(userId)
      .select('-password -refreshTokens')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get activity history count
    const activityCount = await ActivityLog.countDocuments({
      targetType: userType,
      targetId: userId
    });

    // Get applications count (for influencers)
    let applicationsCount = 0;
    if (userType === 'influencer') {
      applicationsCount = await Application.countDocuments({ influencer: userId });
    }

    // Get offers count (for businesses)
    let offersCount = 0;
    if (userType === 'business') {
      offersCount = await Offer.countDocuments({ business: userId });
    }

    // Get payments count
    let paymentsCount = 0;
    if (userType === 'influencer') {
      paymentsCount = await Payment.countDocuments({ influencer: userId });
    } else if (userType === 'business') {
      const businessOffers = await Offer.find({ business: userId }).distinct('_id');
      const businessApplications = await Application.find({ offer: { $in: businessOffers } }).distinct('_id');
      paymentsCount = await Payment.countDocuments({ application: { $in: businessApplications } });
    }

    // Get recent activity
    const recentActivities = await ActivityLog.find({
      targetType: userType,
      targetId: userId
    })
      .populate('adminId', 'name email')
      .sort('-timestamp')
      .limit(10)
      .lean();

    res.json({
      user,
      statistics: {
        activityCount,
        applicationsCount,
        offersCount,
        paymentsCount,
        recentActivities
      }
    });
  } catch (err) {
    next(err);
  }
};
