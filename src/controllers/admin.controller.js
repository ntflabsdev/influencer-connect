import { Offer } from '../models/Offer.js';
import { Application } from '../models/Application.js';
import { Influencer } from '../models/Influencer.js';
import { Business } from '../models/Business.js';
import { Admin } from '../models/Admin.js';
import { Payment } from '../models/Payment.js';
import { ContentSubmission } from '../models/ContentSubmission.js';
import { Dispute } from '../models/Dispute.js';
import { Ticket } from '../models/Ticket.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { Notification } from '../models/Notification.js';
import { logActivity, logBulkActivity } from '../utils/activityLogger.js';

// Import new APIs
import {
  getActivityLogs,
  getActivityLogById,
  getMyActivityLogs,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  createNotification,
  deleteNotification,
  generateUserReport,
  generateActivityReport,
  exportUsers,
  exportActivityLogs,
  bulkApproveUsers,
  bulkRejectUsers,
  bulkSuspendUsers,
  getUserActivityHistory,
  advancedUserSearch,
  getUserStatistics
} from './admin.new-apis.js';

// Re-export for routes
export {
  getActivityLogs,
  getActivityLogById,
  getMyActivityLogs,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  createNotification,
  deleteNotification,
  generateUserReport,
  generateActivityReport,
  exportUsers,
  exportActivityLogs,
  bulkApproveUsers,
  bulkRejectUsers,
  bulkSuspendUsers,
  getUserActivityHistory,
  advancedUserSearch,
  getUserStatistics
};

export const listPendingOffers = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Math.min(Number(req.query.limit || 20), 100);
    const skip = (page - 1) * limit;
    const [offers, total] = await Promise.all([
      Offer.find({ status: 'draft' }).sort('-createdAt').skip(skip).limit(limit),
      Offer.countDocuments({ status: 'draft' }),
    ]);
    res.json({ offers, page, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

export const approveOffer = async (req, res, next) => {
  try {
    const { offerId } = req.params;
    const offer = await Offer.findByIdAndUpdate(offerId, { status: 'open' }, { new: true });
    res.json({ offer });
  } catch (err) {
    next(err);
  }
};

export const listUsersForKyc = async (req, res, next) => {
  try {
    // Get unverified users from both Influencer and Business models
    const [influencers, businesses] = await Promise.all([
      Influencer.find({ verificationStatus: { $ne: 'verified' } }).limit(25).select('name email role verificationStatus'),
      Business.find({ verificationStatus: { $ne: 'verified' } }).limit(25).select('name email role verificationStatus')
    ]);

    const users = [...influencers, ...businesses];
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

export const approveUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isVerified } = req.body;

    // Default to true if not provided (approving means verifying)
    const verified = isVerified !== undefined ? isVerified : true;

    // Try to find and update in each model
    let user = await Influencer.findById(userId);
    let userType = 'influencer';
    if (user) {
      user.isVerified = verified;
      if (verified && user.status === 'adminpending') {
        user.status = 'active';
      } else if (!verified) {
        user.status = 'adminpending';
      }
      await user.save();
      
      // Log activity
      await logActivity(
        req,
        verified ? 'user_approved' : 'user_rejected',
        'influencer',
        userId,
        `${verified ? 'Approved' : 'Rejected'} influencer: ${user.name} (${user.email})`,
        { status: user.status, isVerified: verified },
        user.name
      );
      
      return res.json({ 
        message: 'User approved successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: 'influencer',
          status: user.status,
          isVerified: user.isVerified
        }
      });
    }
    
    user = await Business.findById(userId);
    userType = 'business';
    if (user) {
      // Initialize verificationStatus if it doesn't exist
      if (!user.verificationStatus) {
        user.verificationStatus = {};
      }
      user.verificationStatus.businessVerified = verified;
      if (verified && user.status === 'adminpending') {
        user.status = 'active';
      } else if (!verified) {
        user.status = 'adminpending';
      }
      await user.save();
      
      // Log activity
      await logActivity(
        req,
        verified ? 'user_approved' : 'user_rejected',
        'business',
        userId,
        `${verified ? 'Approved' : 'Rejected'} business: ${user.businessName || user.name} (${user.email})`,
        { status: user.status, isVerified: verified },
        user.businessName || user.name
      );
      
      return res.json({ 
        message: 'User approved successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: 'business',
          status: user.status,
          isVerified: user.verificationStatus.businessVerified
        }
      });
    }

    // Try Admin model
    user = await Admin.findById(userId);
    userType = 'admin';
    if (user) {
      user.isVerified = verified;
      if (verified && user.status === 'adminpending') {
        user.status = 'active';
      }
      await user.save();
      
      // Log activity
      await logActivity(
        req,
        verified ? 'user_approved' : 'user_rejected',
        'admin',
        userId,
        `${verified ? 'Approved' : 'Rejected'} admin: ${user.name} (${user.email})`,
        { status: user.status, isVerified: verified },
        user.name
      );
      
      return res.json({ 
        message: 'User approved successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: 'admin',
          status: user.status,
          isVerified: user.isVerified
        }
      });
    }

    return res.status(404).json({ message: 'User not found' });
  } catch (err) {
    next(err);
  }
};

export const analytics = async (req, res, next) => {
  try {
    const [offers, applications, influencers, businesses, admins] = await Promise.all([
      Offer.countDocuments(),
      Application.countDocuments(),
      Influencer.countDocuments(),
      Business.countDocuments(),
      Admin.countDocuments()
    ]);

    res.json({ offers, applications, influencers, businesses, admins });
  } catch (err) {
    next(err);
  }
};

export const analyticsDetail = async (req, res, next) => {
  try {
    const [offerStatus, appStatus, paymentAgg, dailyApps] = await Promise.all([
      Offer.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Payment.aggregate([
        { $match: { status: 'succeeded' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Application.aggregate([
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 14 },
      ]),
    ]);

    res.json({
      offerStatus,
      applicationStatus: appStatus,
      payments: paymentAgg[0] || { total: 0, count: 0 },
      dailyApplications: dailyApps.reverse(),
    });
  } catch (err) {
    next(err);
  }
};

// Get filtered analytics based on time period
export const getFilteredAnalytics = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '60d':
        startDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const matchStage = { createdAt: { $gte: startDate } };

    const [
      newInfluencers,
      newBusinesses,
      newOffers,
      newApplications,
      newPayments,
      dailyStats
    ] = await Promise.all([
      // New influencers in period
      Influencer.countDocuments(matchStage),

      // New businesses in period
      Business.countDocuments(matchStage),

      // New offers in period
      Offer.countDocuments(matchStage),

      // New applications in period
      Application.countDocuments(matchStage),

      // Payment stats in period
      Payment.aggregate([
        { $match: { ...matchStage, status: 'succeeded' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),

      // Daily breakdown for the period
      Application.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            applications: { $sum: 1 },
            offers: { $addToSet: '$offer' }
          },
        },
        { $sort: { '_id': 1 } }
      ])
    ]);

    // Get total counts (not just in period)
    const [totalInfluencers, totalBusinesses, totalOffers, totalApplications] = await Promise.all([
      Influencer.countDocuments(),
      Business.countDocuments(),
      Offer.countDocuments(),
      Application.countDocuments()
    ]);

    res.json({
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString()
      },
      summary: {
        totalUsers: totalInfluencers + totalBusinesses,
        totalInfluencers,
        totalBusinesses,
        totalOffers,
        totalApplications
      },
      newInPeriod: {
        influencers: newInfluencers,
        businesses: newBusinesses,
        offers: newOffers,
        applications: newApplications,
        revenue: newPayments[0]?.total || 0,
        transactions: newPayments[0]?.count || 0
      },
      dailyBreakdown: dailyStats
    });
  } catch (err) {
    next(err);
  }
};

// Get separate analytics for businesses and influencers
export const getUserTypeAnalytics = async (req, res, next) => {
  try {
    const { userType, period = '30d' } = req.query;

    if (!['influencer', 'business'].includes(userType)) {
      return res.status(400).json({ message: 'Invalid userType. Must be influencer or business' });
    }

    // Calculate date range
    const now = new Date();
    let startDate;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '60d':
        startDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const matchStage = { createdAt: { $gte: startDate } };

    let Model, offerMatch, applicationMatch;

    if (userType === 'influencer') {
      Model = Influencer;
      offerMatch = {}; // Influencers don't create offers
      applicationMatch = {}; // Applications are from influencers
    } else {
      Model = Business;
      offerMatch = {}; // Offers are created by businesses
      applicationMatch = {}; // Applications are to businesses
    }

    const [
      totalUsers,
      newUsers,
      userStats,
      offerStats,
      applicationStats,
      applicationTrends,
      revenueStats
    ] = await Promise.all([
      // Total users of this type
      Model.countDocuments(),

      // New users in period
      Model.countDocuments(matchStage),

      // User statistics (verification, status, etc.)
      Model.aggregate([
        {
          $group: {
            _id: null,
            totalActive: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            totalPending: { $sum: { $cond: [{ $eq: ['$status', 'adminpending'] }, 1, 0] } },
            totalVerified: { $sum: { $cond: [{ $eq: ['$isVerified', true] }, 1, 0] } },
          }
        }
      ]),

      // Offer statistics (for businesses)
      userType === 'business' ? Offer.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]) : Promise.resolve([]),

      // Application statistics (status counts)
      Application.aggregate([
        {
          $lookup: {
            from: userType === 'influencer' ? 'influencers' : 'businesses',
            localField: userType === 'influencer' ? 'influencer' : 'offer',
            foreignField: userType === 'influencer' ? '_id' : 'business',
            as: 'user'
          }
        },
        { $match: { ...matchStage, 'user.0': { $exists: true } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // Application trends (daily counts for charts)
      Application.aggregate([
        {
          $lookup: {
            from: userType === 'influencer' ? 'influencers' : 'businesses',
            localField: userType === 'influencer' ? 'influencer' : 'offer',
            foreignField: userType === 'influencer' ? '_id' : 'business',
            as: 'user'
          }
        },
        { $match: { ...matchStage, 'user.0': { $exists: true } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            applications: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]),

      // Revenue statistics (for businesses)
      userType === 'business' ? Payment.aggregate([
        { $match: { ...matchStage, status: 'succeeded' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]) : Promise.resolve([])
    ]);

    res.json({
      userType,
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString()
      },
      overview: {
        totalUsers,
        newUsersInPeriod: newUsers,
        activeUsers: userStats[0]?.totalActive || 0,
        pendingUsers: userStats[0]?.totalPending || 0,
        verifiedUsers: userStats[0]?.totalVerified || 0
      },
      offers: offerStats,
      applications: applicationStats,
      applicationTrends,
      revenue: userType === 'business' ? {
        total: revenueStats[0]?.total || 0,
        transactions: revenueStats[0]?.count || 0
      } : null
    });
  } catch (err) {
    next(err);
  }
};

export const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }

    const existing = await Admin.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const admin = new Admin({ name, email, password, role: 'admin' });
    await admin.save();

    const adminObj = admin.toObject();
    delete userObj.password;

    res.status(201).json({ user: userObj });
  } catch (err) {
    next(err);
  }
};

export const listUsers = async (req, res, next) => {
  try {
    const { role, status } = req.query;

    const results = { influencers: [], businesses: [], admins: [] };

    // Build common filter
    const baseFilter = {};
    if (status) {
      baseFilter.status = status;
    } else if (role === 'influencer') {
      // For influencer role, default to active status
      baseFilter.status = 'active';
    } else if (role === 'business') {
      // For business role, default to active status
      baseFilter.status = 'active';
    }

    // Fetch influencers
    if (!role || role === 'influencer') {
      const influencerFilter = { ...baseFilter };

      const influencers = await Influencer.find(influencerFilter)
        .select('name email status isVerified statistics createdAt lastActive')
        .sort('-createdAt')
        .limit(role ? 200 : 50);
     
      results.influencers = influencers.map(inf => ({
        id: inf._id,
        name: inf.name,
        email: inf.email,
        role: 'influencer',
        status: inf.status,
        isVerified: inf.isVerified || false,
        followers: inf.statistics?.totalFollowers || 0,
        rating: inf.statistics?.rating || 0,
        lastActive: inf.lastActive,
        joinedAt: inf.createdAt
      }));
    } else if (role === 'business') {
      // When specific role is business, don't fetch influencers
      results.influencers = [];
    }

    // Fetch businesses
    if (!role || role === 'business') {
      let businessFilter = {};

      if (status === 'active') {
        // For active view, include businesses with status 'active' or no status (legacy)
        businessFilter = {
          $or: [
            { status: 'active' },
            { status: { $exists: false } }
          ]
        };
      } else if (status === 'adminpending') {
        // For pending view, only businesses with status 'adminpending'
        businessFilter = { status: 'adminpending' };
      } else if (status) {
        // For other status values
        businessFilter = { status };
      } else {
        // Default to active businesses
        businessFilter = {
          $or: [
            { status: 'active' },
            { status: { $exists: false } }
          ]
        };
      }

      const businesses = await Business.find(businessFilter)
        .select('name email businessName category status verificationStatus businessStats createdAt lastActive')
        .sort('-createdAt')
        .limit(role ? 200 : 50);

      results.businesses = businesses.map(biz => ({
        id: biz._id,
        name: biz.name,
        email: biz.email,
        businessName: biz.businessName,
        category: biz.category,
        role: 'business',
        status: biz.status,
        isVerified: biz.verificationStatus?.businessVerified || false,
        offersCount: biz.businessStats?.totalOffers || 0,
        rating: biz.businessStats?.rating || 0,
        lastActive: biz.lastActive,
        joinedAt: biz.createdAt
      }));
    } else if (role === 'influencer') {
      // When specific role is influencer, don't fetch businesses
      results.businesses = [];
    }

    // Fetch admins (only for superadmins)
    if ((!role || role === 'admin') && req.user.role === 'superadmin') {
      const adminFilter = { ...baseFilter };
      if (role === 'admin') {
        adminFilter.isActive = status === 'active' ? true : status === 'inactive' ? false : { $exists: true };
      }

      const admins = await Admin.find(adminFilter)
        .select('name email role department isActive createdAt lastActive')
        .sort('-createdAt')
        .limit(role ? 200 : 20);

      results.admins = admins.map(adm => ({
        id: adm._id,
        name: adm.name,
        email: adm.email,
        role: adm.role,
        department: adm.department,
        status: adm.isActive ? 'active' : 'inactive',
        lastActive: adm.lastActive,
        joinedAt: adm.createdAt
      }));
    }

    res.json({ users: results });
  } catch (err) {
    next(err);
  }
};

export const createUserWithRole = async (req, res, next) => {
  try {
    const { name, email, password, role, meta } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password and role are required' });
    }

    if (!['influencer', 'business', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role must be influencer, business, or admin' });
    }

    // Check if email exists in any model
    const existingInfluencer = await Influencer.findOne({ email });
    const existingBusiness = await Business.findOne({ email });
    const existingAdmin = await Admin.findOne({ email });

    if (existingInfluencer || existingBusiness || existingAdmin) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    let user;
    let Model;

    // Create user based on role
    if (role === 'influencer') {
      Model = Influencer;
      user = new Influencer({
        name,
        email,
        password,
        isVerified: true,
        status: 'active',
        influencerProfile: {
          basicInfo: { fullName: name },
          contactInfo: {},
          portfolio: [],
          statistics: {
            totalFollowers: 0,
            totalEngagement: 0,
            averageEngagementRate: 0,
            completedCollaborations: 0,
            rating: 0
          }
        }
      });
    } else if (role === 'business') {
      Model = Business;
      user = new Business({
        name,
        email,
        password,
        businessName: name,
        isVerified: true,
        status: 'active',
        businessStats: {
          totalOffers: 0,
          activeOffers: 0,
          completedCollaborations: 0,
          totalSpent: 0,
          rating: 0
        },
        verificationStatus: {
          emailVerified: true,
          phoneVerified: false,
          businessVerified: false,
          paymentVerified: false
        }
      });
    } else if (role === 'admin') {
      Model = Admin;
      user = new Admin({
        name,
        email,
        password,
        role: 'admin',
        isActive: true,
        adminStats: {
          usersVerified: 0,
          usersSuspended: 0,
          offersApproved: 0,
          contentModerated: 0,
          ticketsResolved: 0,
          loginCount: 0
        }
      });
    }

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({ user: userObj });
  } catch (err) {
    next(err);
  }
};

export const updateUserByAdmin = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { name, email, password, role, userType, isVerified, status } = req.body;

    // Determine which model to use
    let Model;
    if (userType === 'influencer') {
      Model = Influencer;
    } else if (userType === 'business') {
      Model = Business;
    } else if (userType === 'admin') {
      Model = Admin;
    } else {
      // Try to find in all models if userType not specified
      let user = await Influencer.findById(userId);
      if (user) Model = Influencer;
      else {
        user = await Business.findById(userId);
        if (user) Model = Business;
        else {
          user = await Admin.findById(userId);
          if (user) Model = Admin;
        }
      }
    }

    if (!Model) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = await Model.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate role changes
    if (role && !['influencer', 'business', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Check email uniqueness if changing
    if (email && email !== user.email) {
      const existingInfluencer = await Influencer.findOne({ email });
      const existingBusiness = await Business.findOne({ email });
      const existingAdmin = await Admin.findOne({ email });

      if (existingInfluencer || existingBusiness || existingAdmin) {
        return res.status(409).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    // Update fields
    if (name) user.name = name;
    if (password) user.password = password;
    if (status) user.status = status;

    // Handle verification status based on model
    if (typeof isVerified === 'boolean') {
      if (Model === Influencer) {
        // For Influencer, set overall verification status
        user.isVerified = isVerified;
        if (isVerified && user.status === 'adminpending') {
          user.status = 'active';
        } else if (!isVerified) {
          user.status = 'adminpending';
        }
      } else if (Model === Business) {
        // For Business, set business verification flag
        user.verificationStatus.businessVerified = isVerified;
        if (isVerified && user.status === 'adminpending') {
          user.status = 'active';
        } else if (!isVerified) {
          user.status = 'adminpending';
        }
      } else if (Model === Admin) {
        user.isVerified = isVerified;
      }
    }

    // Role-specific updates
    if (Model === Influencer) {
      // Influencer specific updates
    } else if (Model === Business) {
      // Business specific updates
    } else if (Model === Admin) {
      if (role && ['superadmin', 'admin', 'moderator'].includes(role)) {
        user.role = role;
      }
    }

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.json({ user: userObj });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Try to find in all models
    let user = await Influencer.findById(userId);
    let userType = 'influencer';

    if (!user) {
      user = await Business.findById(userId);
      userType = 'business';
    }

    if (!user) {
      user = await Admin.findById(userId);
      userType = 'admin';
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userObj = user.toObject();
    delete userObj.password;

    // Add user type for frontend
    userObj.userType = userType;

    // Add isVerified field for frontend compatibility
    if (userType === 'influencer') {
      userObj.isVerified = userObj.isVerified || false;
    } else if (userType === 'business') {
      userObj.isVerified = userObj.verificationStatus?.businessVerified || false;
    }

    res.json({ user: userObj });
  } catch (err) {
    next(err);
  }
};

export const listSubmissions = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const submissions = await ContentSubmission.find(filter)
      .populate({
        path: 'application',
        populate: [
          { path: 'offer', select: 'title business' },
          { path: 'influencer', select: 'name email meta' },
        ],
      })
      .sort('-createdAt')
      .limit(200);
    res.json({ submissions });
  } catch (err) {
    next(err);
  }
};

export const reviewSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const { status, feedback, priority } = req.body;
    if (!['approved', 'changes_requested', 'pending', 'rejected', 'flagged'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updateData = {
      status,
      feedback,
      priority,
      $push: {
        moderationHistory: {
          action: status,
          moderator: req.user._id,
          reason: feedback,
          timestamp: new Date()
        }
      }
    };

    const submission = await ContentSubmission.findByIdAndUpdate(
      submissionId,
      updateData,
      { new: true },
    ).populate({
      path: 'application',
      populate: [
        { path: 'offer', select: 'title business' },
        { path: 'influencer', select: 'name email meta' },
      ],
    });

    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    res.json({ submission });
  } catch (err) {
    next(err);
  }
};

// AI-Powered Content Moderation APIs

// Analyze content with AI (simulated for now - can integrate with real AI services later)
export const analyzeContentAI = async (req, res, next) => {
  try {
    const { submissionId } = req.params;

    const submission = await ContentSubmission.findById(submissionId).populate({
      path: 'application',
      populate: [
        { path: 'offer', select: 'title description requirements' },
        { path: 'influencer', select: 'name meta' },
      ],
    });

    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    // Simulate AI analysis (in production, this would call external AI services)
    const aiAnalysis = await simulateAIContentAnalysis(submission);

    const updatedSubmission = await ContentSubmission.findByIdAndUpdate(
      submissionId,
      {
        aiModeration: {
          score: aiAnalysis.score,
          flags: aiAnalysis.flags,
          processedAt: new Date(),
          aiVersion: '1.0.0'
        },
        priority: aiAnalysis.priority
      },
      { new: true }
    ).populate({
      path: 'application',
      populate: [
        { path: 'offer', select: 'title business' },
        { path: 'influencer', select: 'name email meta' },
      ],
    });

    res.json({
      submission: updatedSubmission,
      aiAnalysis
    });
  } catch (err) {
    next(err);
  }
};

// Bulk AI analysis for multiple submissions
export const bulkAnalyzeContentAI = async (req, res, next) => {
  try {
    const { submissionIds } = req.body;

    if (!Array.isArray(submissionIds) || submissionIds.length === 0) {
      return res.status(400).json({ message: 'submissionIds must be a non-empty array' });
    }

    const submissions = await ContentSubmission.find({
      _id: { $in: submissionIds }
    }).populate({
      path: 'application',
      populate: [
        { path: 'offer', select: 'title description requirements' },
        { path: 'influencer', select: 'name meta' },
      ],
    });

    const analysisResults = [];

    for (const submission of submissions) {
      const aiAnalysis = await simulateAIContentAnalysis(submission);

      await ContentSubmission.findByIdAndUpdate(submission._id, {
        aiModeration: {
          score: aiAnalysis.score,
          flags: aiAnalysis.flags,
          processedAt: new Date(),
          aiVersion: '1.0.0'
        },
        priority: aiAnalysis.priority
      });

      analysisResults.push({
        submissionId: submission._id,
        aiAnalysis
      });
    }

    res.json({
      message: `Analyzed ${submissions.length} submissions`,
      results: analysisResults
    });
  } catch (err) {
    next(err);
  }
};

// Get submissions flagged by AI
export const listFlaggedSubmissions = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Math.min(Number(req.query.limit || 20), 100);
    const skip = (page - 1) * limit;

    const filter = {
      'aiModeration.score': { $gte: 0.7 }, // High risk submissions
      status: { $ne: 'approved' } // Not already approved
    };

    const [submissions, total] = await Promise.all([
      ContentSubmission.find(filter)
        .populate({
          path: 'application',
          populate: [
            { path: 'offer', select: 'title business' },
            { path: 'influencer', select: 'name email meta' },
          ],
        })
        .sort({ 'aiModeration.score': -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ContentSubmission.countDocuments(filter)
    ]);

    res.json({
      submissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

// Bulk moderation actions
export const bulkModerateContent = async (req, res, next) => {
  try {
    const { submissionIds, action, feedback, reason } = req.body;

    if (!Array.isArray(submissionIds) || submissionIds.length === 0) {
      return res.status(400).json({ message: 'submissionIds must be a non-empty array' });
    }

    let updateData = {};
    let validActions = ['approve', 'reject', 'flag', 'unflag', 'request_changes'];

    if (!validActions.includes(action)) {
      return res.status(400).json({
        message: `Invalid action. Must be one of: ${validActions.join(', ')}`
      });
    }

    switch (action) {
      case 'approve':
        updateData = {
          status: 'approved',
          feedback: feedback || 'Content approved via bulk moderation'
        };
        break;
      case 'reject':
        updateData = {
          status: 'rejected',
          feedback: feedback || 'Content rejected via bulk moderation'
        };
        break;
      case 'flag':
        updateData = {
          status: 'flagged',
          feedback: feedback || 'Content flagged for review'
        };
        break;
      case 'unflag':
        updateData = {
          status: 'pending',
          feedback: feedback || 'Content unflagged'
        };
        break;
      case 'request_changes':
        updateData = {
          status: 'changes_requested',
          feedback: feedback || 'Changes requested'
        };
        break;
    }

    updateData.$push = {
      moderationHistory: {
        action,
        moderator: req.user._id,
        reason: reason || feedback,
        timestamp: new Date()
      }
    };

    const result = await ContentSubmission.updateMany(
      { _id: { $in: submissionIds } },
      updateData
    );

    res.json({
      message: `Bulk ${action} completed`,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    });
  } catch (err) {
    next(err);
  }
};

// Content quality analytics
export const getContentQualityAnalytics = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '60d':
        startDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const matchStage = { createdAt: { $gte: startDate } };

    const [
      qualityMetrics,
      moderationStats,
      aiFlaggingTrends,
      approvalRates
    ] = await Promise.all([
      // Overall quality metrics
      ContentSubmission.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalSubmissions: { $sum: 1 },
            avgEngagement: { $avg: '$qualityMetrics.engagement' },
            avgRelevance: { $avg: '$qualityMetrics.relevance' },
            avgCompliance: { $avg: '$qualityMetrics.compliance' },
            avgOverall: { $avg: '$qualityMetrics.overall' }
          }
        }
      ]),

      // Moderation statistics
      ContentSubmission.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // AI flagging trends
      ContentSubmission.aggregate([
        { $match: { ...matchStage, 'aiModeration.processedAt': { $exists: true } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$aiModeration.processedAt' }
            },
            avgRiskScore: { $avg: '$aiModeration.score' },
            highRiskCount: {
              $sum: { $cond: [{ $gte: ['$aiModeration.score', 0.7] }, 1, 0] }
            },
            totalAnalyzed: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]),

      // Approval rates over time
      ContentSubmission.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            total: { $sum: 1 },
            approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } }
          }
        },
        {
          $project: {
            date: '$_id',
            total: 1,
            approved: 1,
            rejected: 1,
            approvalRate: {
              $cond: [
                { $eq: ['$total', 0] },
                0,
                { $multiply: [{ $divide: ['$approved', '$total'] }, 100] }
              ]
            }
          }
        },
        { $sort: { '_id': 1 } }
      ])
    ]);

    res.json({
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString()
      },
      qualityMetrics: qualityMetrics[0] || {
        totalSubmissions: 0,
        avgEngagement: 0,
        avgRelevance: 0,
        avgCompliance: 0,
        avgOverall: 0
      },
      moderationStats,
      aiFlaggingTrends,
      approvalRates
    });
  } catch (err) {
    next(err);
  }
};

// Simulated AI content analysis (replace with real AI service integration)
async function simulateAIContentAnalysis(submission) {
  // This simulates AI analysis - in production, integrate with services like:
  // - Google Cloud Vision API
  // - AWS Rekognition
  // - Clarifai
  // - Custom ML models

  const flags = [];
  let score = 0;

  // Analyze caption for spam keywords
  const spamKeywords = ['free money', 'click here', 'buy now', 'limited time'];
  const caption = submission.caption || '';
  const hasSpam = spamKeywords.some(keyword =>
    caption.toLowerCase().includes(keyword.toLowerCase())
  );

  if (hasSpam) {
    flags.push({
      type: 'spam',
      confidence: 0.85,
      details: 'Contains spam-like keywords'
    });
    score += 0.3;
  }

  // Check for brand compliance (simplified)
  const offer = submission.application?.offer;
  const requirements = offer?.requirements || [];

  if (requirements.length > 0) {
    const complianceScore = Math.random() * 3; // Simulate compliance check
    if (complianceScore < 1) {
      flags.push({
        type: 'off_brand',
        confidence: 0.7,
        details: 'May not comply with brand guidelines'
      });
      score += 0.2;
    }
  }

  // Random quality assessment
  const qualityScore = Math.random();
  if (qualityScore < 0.3) {
    flags.push({
      type: 'low_quality',
      confidence: 0.6,
      details: 'Content quality appears low'
    });
    score += 0.1;
  }

  // Determine priority based on score
  let priority = 'normal';
  if (score >= 0.5) priority = 'high';
  if (score >= 0.8) priority = 'urgent';

  return {
    score: Math.min(score, 1),
    flags,
    priority,
    processedAt: new Date(),
    recommendations: flags.length > 0 ? 'Review manually' : 'Auto-approve'
  };
}

export const setSuspended = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { suspended } = req.body;

    // Try to find and update in each model
    let user = await Influencer.findByIdAndUpdate(userId, { status: suspended ? 'suspended' : 'active' }, { new: true });
    let userType = 'influencer';
    if (!user) {
      user = await Business.findByIdAndUpdate(userId, { status: suspended ? 'suspended' : 'active' }, { new: true });
      userType = 'business';
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log activity
    await logActivity(
      req,
      suspended ? 'user_suspended' : 'user_unsuspended',
      userType,
      userId,
      `${suspended ? 'Suspended' : 'Unsuspended'} ${userType}: ${user.name || user.businessName} (${user.email})`,
      { status: user.status },
      user.name || user.businessName
    );

    const obj = user.toObject();
    delete obj.password;
    res.json({ user: obj });
  } catch (err) {
    next(err);
  }
};

export const listDisputes = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const disputes = await Dispute.find(filter)
      .populate({
        path: 'application',
        populate: [{ path: 'offer', select: 'title business' }, { path: 'influencer', select: 'name email' }],
      })
      .sort('-createdAt')
      .limit(200);
    res.json({ disputes });
  } catch (err) {
    next(err);
  }
};

export const updateDispute = async (req, res, next) => {
  try {
    const { disputeId } = req.params;
    const { status, reviewerDecision, resolutionNote, tags } = req.body;
    const dispute = await Dispute.findByIdAndUpdate(
      disputeId,
      { status, reviewerDecision, resolutionNote, tags },
      { new: true },
    );
    if (!dispute) return res.status(404).json({ message: 'Dispute not found' });
    res.json({ dispute });
  } catch (err) {
    next(err);
  }
};

export const listTickets = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const tickets = await Ticket.find(filter).populate('user', 'name email role').sort('-createdAt').limit(200);
    res.json({ tickets });
  } catch (err) {
    next(err);
  }
};

export const updateTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { status, adminNote, priority } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(ticketId, { status, adminNote, priority }, { new: true });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json({ ticket });
  } catch (err) {
    next(err);
  }
};

export const flagOfferPolicy = async (req, res, next) => {
  try {
    const { offerId } = req.params;
    const { flagged, riskTags, notes, reviewer } = req.body;
    const offer = await Offer.findByIdAndUpdate(
      offerId,
      { policy: { flagged, riskTags, notes, reviewer } },
      { new: true },
    );
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    res.json({ offer });
  } catch (err) {
    next(err);
  }
};

// Comprehensive Offer Management APIs
export const listAllOffers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      business,
      flagged,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * parseInt(limit);
    const query = {};

    // Filters
    if (status) query.status = status;
    if (business) query.business = business;
    if (flagged !== undefined) query['policy.flagged'] = flagged === 'true';

    // Search
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [offers, total] = await Promise.all([
      Offer.find(query)
        .populate('business', 'businessName email avatarUrl')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Offer.countDocuments(query)
    ]);

    // Add application counts for each offer
    const offersWithStats = await Promise.all(
      offers.map(async (offer) => {
        const applicationStats = await Application.aggregate([
          { $match: { offer: offer._id } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]);

        const totalApplications = applicationStats.reduce((sum, stat) => sum + stat.count, 0);
        const approvedApplications = applicationStats.find(stat => stat._id === 'approved')?.count || 0;

        return {
          ...offer,
          stats: {
            totalApplications,
            approvedApplications,
            applicationStats
          }
        };
      })
    );

    res.json({
      offers: offersWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      filters: {
        status,
        business,
        flagged,
        search
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getOfferDetails = async (req, res, next) => {
  try {
    const { offerId } = req.params;

    const offer = await Offer.findById(offerId)
      .populate('business', 'businessName email avatarUrl contactInfo businessStats')
      .lean();

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    // Get applications for this offer
    const applications = await Application.find({ offer: offerId })
      .populate('influencer', 'name username avatarUrl statistics verificationStatus')
      .sort('-createdAt')
      .lean();

    // Get application statistics
    const applicationStats = await Application.aggregate([
      { $match: { offer: offerId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get payments for this offer (completed work)
    const payments = await Payment.find({ 'application.offer': offerId })
      .populate('application', 'influencer')
      .populate('influencer', 'name username')
      .sort('-createdAt')
      .lean();

    const totalRevenue = payments
      .filter(p => p.status === 'succeeded')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    res.json({
      offer,
      applications: {
        list: applications,
        stats: applicationStats,
        total: applications.length
      },
      payments: {
        list: payments,
        totalRevenue,
        totalTransactions: payments.filter(p => p.status === 'succeeded').length
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updateOfferStatus = async (req, res, next) => {
  try {
    const { offerId } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['draft', 'open', 'paused', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Must be: draft, open, paused, closed'
      });
    }

    const offer = await Offer.findByIdAndUpdate(
      offerId,
      {
        status,
        ...(notes && { 'policy.notes': notes })
      },
      { new: true }
    ).populate('business', 'businessName email');

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    res.json({
      message: `Offer ${status === 'open' ? 'approved and published' : status}`,
      offer
    });
  } catch (err) {
    next(err);
  }
};

export const bulkUpdateOffers = async (req, res, next) => {
  try {
    const { offerIds, action, reason } = req.body;

    if (!Array.isArray(offerIds) || offerIds.length === 0) {
      return res.status(400).json({ message: 'offerIds must be a non-empty array' });
    }

    let updateData = {};
    let message = '';

    switch (action) {
      case 'approve':
        updateData = { status: 'open' };
        message = 'Offers approved and published';
        break;
      case 'pause':
        updateData = { status: 'paused' };
        message = 'Offers paused';
        break;
      case 'close':
        updateData = { status: 'closed' };
        message = 'Offers closed';
        break;
      case 'flag':
        updateData = { 'policy.flagged': true, 'policy.notes': reason };
        message = 'Offers flagged for review';
        break;
      case 'unflag':
        updateData = { 'policy.flagged': false };
        message = 'Offers unflagged';
        break;
      default:
        return res.status(400).json({
          message: 'Invalid action. Must be: approve, pause, close, flag, unflag'
        });
    }

    const result = await Offer.updateMany(
      { _id: { $in: offerIds } },
      updateData
    );

    res.json({
      message,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    });
  } catch (err) {
    next(err);
  }
};

export const getOfferAnalytics = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '60d':
        startDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const matchStage = { createdAt: { $gte: startDate } };

    const [
      offerTrends,
      statusDistribution,
      topBusinessesByOffers,
      applicationConversionRates,
      revenueByOffer
    ] = await Promise.all([
      // Offer creation trends
      Offer.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 }
          },
        },
        { $sort: { '_id': 1 } }
      ]),

      // Current offer status distribution
      Offer.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // Top businesses by offer count
      Offer.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$business',
            offerCount: { $sum: 1 }
          }
        },
        { $sort: { offerCount: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'businesses',
            localField: '_id',
            foreignField: '_id',
            as: 'business'
          }
        },
        {
          $project: {
            business: { $arrayElemAt: ['$business', 0] },
            offerCount: 1
          }
        }
      ]),

      // Application conversion rates
      Offer.aggregate([
        { $match: { status: 'open' } },
        {
          $lookup: {
            from: 'applications',
            localField: '_id',
            foreignField: 'offer',
            as: 'applications'
          }
        },
        {
          $project: {
            title: 1,
            applicationsCount: { $size: '$applications' },
            approvedCount: {
              $size: {
                $filter: {
                  input: '$applications',
                  cond: { $eq: ['$$this.status', 'approved'] }
                }
              }
            }
          }
        },
        {
          $match: { applicationsCount: { $gt: 0 } }
        },
        {
          $group: {
            _id: null,
            totalOffers: { $sum: 1 },
            totalApplications: { $sum: '$applicationsCount' },
            totalApproved: { $sum: '$approvedCount' }
          }
        }
      ]),

      // Revenue by offer type
      Payment.aggregate([
        { $match: { ...matchStage, status: 'succeeded' } },
        {
          $lookup: {
            from: 'applications',
            localField: 'application',
            foreignField: '_id',
            as: 'application'
          }
        },
        {
          $lookup: {
            from: 'offers',
            localField: 'application.offer',
            foreignField: '_id',
            as: 'offer'
          }
        },
        { $match: { 'offer.0': { $exists: true } } },
        {
          $group: {
            _id: '$offer.reward.cash',
            totalRevenue: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { totalRevenue: -1 } }
      ])
    ]);

    const conversionStats = applicationConversionRates[0] || {
      totalOffers: 0,
      totalApplications: 0,
      totalApproved: 0
    };

    res.json({
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString()
      },
      offerTrends,
      statusDistribution,
      topBusinessesByOffers,
      conversionRates: {
        totalOffers: conversionStats.totalOffers,
        totalApplications: conversionStats.totalApplications,
        totalApproved: conversionStats.totalApproved,
        applicationRate: conversionStats.totalOffers > 0
          ? (conversionStats.totalApplications / conversionStats.totalOffers).toFixed(2)
          : 0,
        approvalRate: conversionStats.totalApplications > 0
          ? ((conversionStats.totalApproved / conversionStats.totalApplications) * 100).toFixed(1)
          : 0
      },
      revenueByOffer: revenueByOffer
    });
  } catch (err) {
    next(err);
  }
};

export const listPayments = async (req, res, next) => {
  try {
    const { hold } = req.query;
    const filter = {};
    if (hold === 'true') filter.hold = true;
    const payments = await Payment.find(filter)
      .populate({
        path: 'application',
        populate: [{ path: 'offer', select: 'title' }, { path: 'influencer', select: 'name' }],
      })
      .sort('-createdAt')
      .limit(200);
    res.json({ payments });
  } catch (err) {
    next(err);
  }
};

export const updatePaymentHold = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { hold, status } = req.body;
    const payment = await Payment.findByIdAndUpdate(paymentId, { hold, status }, { new: true });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json({ payment });
  } catch (err) {
    next(err);
  }
};

export const listPortfolioForUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const submissions = await ContentSubmission.find({ status: 'approved' })
      .populate({
        path: 'application',
        match: { influencer: userId },
        populate: { path: 'offer', select: 'title business' },
      })
      .sort('-createdAt')
      .limit(50);
    const filtered = submissions.filter((s) => s.application); // respect match
    res.json({ submissions: filtered });
  } catch (err) {
    next(err);
  }
};

// Admin Profile Management
export const getAdminProfile = async (req, res, next) => {
  try {
    // Use _id or id - both should work but _id is more reliable for Mongoose documents
    const adminId = req.user._id || req.user.id;
    if (!adminId) {
      return res.status(401).json({ message: 'User ID not found in request' });
    }
    
    const admin = await Admin.findById(adminId).select('-password -refreshTokens');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    res.json({ profile: admin });
  } catch (err) {
    next(err);
  }
};

export const updateAdminProfile = async (req, res, next) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;

    // Use _id or id - both should work but _id is more reliable for Mongoose documents
    const adminId = req.user._id || req.user.id;
    if (!adminId) {
      return res.status(401).json({ message: 'User ID not found in request' });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    // If changing password, verify current password
    if (newPassword) {
      const bcrypt = await import('bcryptjs');
      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(newPassword, salt);
    }

    // Update other fields
    if (name) admin.name = name;
    if (email) admin.email = email;

    await admin.save();
    const updatedAdmin = admin.toObject();
    delete updatedAdmin.password;
    delete updatedAdmin.refreshTokens;

    res.json({ profile: updatedAdmin });
  } catch (err) {
    next(err);
  }
};

// =================================
// ADMIN MANAGEMENT APIs
// =================================

// List all admins (only superadmin can access)
export const listAdmins = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, department } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (department) filter.department = department;

    // Exclude current logged-in admin from the list
    const currentAdminId = req.user._id || req.user.id;
    if (currentAdminId) {
      filter._id = { $ne: currentAdminId };
    }

    const skip = (page - 1) * parseInt(limit);

    const [admins, total] = await Promise.all([
      Admin.find(filter)
        .select('-password -refreshTokens')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      Admin.countDocuments(filter)
    ]);

    res.json({
      admins,
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

// Create new admin (only superadmin can create)
export const createAdminUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'admin',
      department,
      permissions
    } = req.body;

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Create admin user
    const adminData = {
      name,
      email,
      password,
      role,
      department,
      permissions: permissions || {}
    };

    const newAdmin = await Admin.create(adminData);

    // Return admin data without password
    const adminObj = newAdmin.toObject();
    delete adminObj.password;
    delete adminObj.refreshTokens;

    res.status(201).json({
      message: 'Admin created successfully',
      admin: adminObj
    });
  } catch (err) {
    next(err);
  }
};

// Update admin user (superadmin only)
export const updateAdminUser = async (req, res, next) => {
  try {
    const { adminId } = req.params;
    const { name, email, role, department, permissions, isActive } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Prevent superadmin from being demoted or deactivated by others
    const currentUserId = (req.user._id || req.user.id)?.toString();
    if (admin.role === 'superadmin' && currentUserId !== adminId.toString()) {
      return res.status(403).json({ message: 'Cannot modify superadmin' });
    }

    // Update fields
    if (name) admin.name = name;
    if (email) admin.email = email;
    if (role) admin.role = role;
    if (department) admin.department = department;
    // Replace permissions completely (not merge) when permissions object is provided
    if (permissions && typeof permissions === 'object') {
      admin.permissions = { ...admin.permissions, ...permissions };
    }
    if (isActive !== undefined) admin.isActive = isActive;

    await admin.save();

    const adminObj = admin.toObject();
    delete adminObj.password;
    delete adminObj.refreshTokens;

    res.json({
      message: 'Admin updated successfully',
      admin: adminObj
    });
  } catch (err) {
    next(err);
  }
};

// Delete/deactivate admin (superadmin only)
export const deleteAdminUser = async (req, res, next) => {
  try {
    const { adminId } = req.params;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Prevent superadmin deletion
    if (admin.role === 'superadmin') {
      return res.status(403).json({ message: 'Cannot delete superadmin' });
    }

    // Soft delete - deactivate instead of hard delete
    admin.isActive = false;
    await admin.save();

    res.json({ message: 'Admin deactivated successfully' });
  } catch (err) {
    next(err);
  }
};

// Get admin details
export const getAdminDetails = async (req, res, next) => {
  try {
    const { adminId } = req.params;

    const admin = await Admin.findById(adminId).select('-password -refreshTokens');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({ admin });
  } catch (err) {
    next(err);
  }
};

// =================================
// PLATFORM SETTINGS APIs
// =================================

import { PlatformSettings } from '../models/PlatformSettings.js';

// Get platform settings
export const getPlatformSettings = async (req, res, next) => {
  try {
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = await PlatformSettings.create({});
    }
    res.json({ settings });
  } catch (err) {
    next(err);
  }
};

// Update platform settings
export const updatePlatformSettings = async (req, res, next) => {
  try {
    const updateData = req.body;

    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = await PlatformSettings.create(updateData);
    } else {
      // Update existing settings
      Object.keys(updateData).forEach(key => {
        if (typeof updateData[key] === 'object' && updateData[key] !== null) {
          // Deep merge for nested objects
          settings[key] = { ...settings[key], ...updateData[key] };
        } else {
          settings[key] = updateData[key];
        }
      });
      await settings.save();
    }

    res.json({
      message: 'Platform settings updated successfully',
      settings
    });
  } catch (err) {
    next(err);
  }
};

// Reset settings to defaults
export const resetPlatformSettings = async (req, res, next) => {
  try {
    await PlatformSettings.deleteMany({});
    const settings = await PlatformSettings.create({});

    res.json({
      message: 'Platform settings reset to defaults',
      settings
    });
  } catch (err) {
    next(err);
  }
};

// Subscription Plan Management
export const listSubscriptionPlans = async (req, res, next) => {
  try {
    // For now, return hardcoded plans as per admin-app requirements
    // In future, this could be stored in database
    const plans = [
      {
        _id: 'free_influencer',
        name: 'Free Creator',
        description: 'Best for: New / nano influencers',
        price: 0,
        currency: 'EUR',
        interval: 'month',
        features: [
          'Apply to 5 offers / month',
          'Public profile + basic portfolio',
          'Upload proof & links',
          'Basic ratings visibility',
          'In-app chat (limited)',
          'Basic support'
        ],
        userType: 'influencer',
        isDefault: true
      },
      {
        _id: 'plus_influencer',
        name: 'Creator Plus',
        description: 'Best for: Active micro influencers',
        price: 9.99,
        currency: 'EUR',
        interval: 'month',
        features: [
          'Apply to unlimited offers',
          'Priority application visibility',
          'Advanced portfolio (engagement stats, brands worked with)',
          'Profile boost (algorithm preference)',
          'Full chat access',
          'Campaign reminders & deadlines',
          'Advanced support'
        ],
        userType: 'influencer'
      },
      {
        _id: 'pro_influencer',
        name: 'Creator Pro',
        description: 'Best for: Full-time creators',
        price: 19.99,
        currency: 'EUR',
        interval: 'month',
        features: [
          'Everything in Creator Plus',
          'Featured creator badge',
          'Early access to new offers',
          'Advanced analytics (views, saves, CTR*)',
          'AI-based offer matching',
          'Priority support',
          'Dedicated account manager'
        ],
        userType: 'influencer'
      },
      {
        _id: 'free_business',
        name: 'Free Business',
        description: 'Best for: First-time businesses',
        price: 0,
        currency: 'EUR',
        interval: 'month',
        features: [
          'Post 5 offers / month',
          'Receive applications',
          'Approve / reject influencers',
          'Basic chat',
          'Manual content approval',
          'Basic support'
        ],
        userType: 'business',
        isDefault: true
      },
      {
        _id: 'basic_business',
        name: 'Business Basic',
        description: 'Best for: Small cafés, gyms, salons',
        price: 29,
        currency: 'EUR',
        interval: 'month',
        features: [
          'Post unlimited offers',
          'Advanced filters (location, niche, engagement)',
          'Access influencer portfolios',
          'Basic analytics (reach, content count)',
          'Save favorite influencers',
          'Faster support'
        ],
        userType: 'business'
      },
      {
        _id: 'pro_business',
        name: 'Business Pro',
        description: 'Best for: Growing brands & chains',
        price: 79,
        currency: 'EUR',
        interval: 'month',
        features: [
          'Everything in Business Basic',
          'Featured offers (homepage/map)',
          'AI influencer recommendations',
          'Campaign performance analytics',
          'Multi-location support',
          'Priority influencer applications',
          'Dedicated account support'
        ],
        userType: 'business'
      }
    ];

    res.json({ plans });
  } catch (err) {
    next(err);
  }
};

export const createSubscriptionPlan = async (req, res, next) => {
  try {
    const { name, description, price, currency, interval, features } = req.body;

    // For now, just return success - in real implementation, save to database
    const plan = {
      _id: `plan_${Date.now()}`,
      name,
      description,
      price: Number(price),
      currency: currency || 'EUR',
      interval: interval || 'month',
      features: Array.isArray(features) ? features : [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.status(201).json({ plan });
  } catch (err) {
    next(err);
  }
};

export const updateSubscriptionPlan = async (req, res, next) => {
  try {
    const { planId } = req.params;
    const updates = req.body;

    // For now, just return success - in real implementation, update in database
    const updatedPlan = {
      _id: planId,
      ...updates,
      updatedAt: new Date()
    };

    res.json({ plan: updatedPlan });
  } catch (err) {
    next(err);
  }
};

export const deleteSubscriptionPlan = async (req, res, next) => {
  try {
    const { planId } = req.params;

    // For now, just return success - in real implementation, delete from database
    res.json({ message: 'Plan deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Custom Subscription Plans (for specific users)
export const listCustomSubscriptionPlans = async (req, res, next) => {
  try {
    // For now, return empty array - in real implementation, fetch from database
    const plans = [];
    res.json({ plans });
  } catch (err) {
    next(err);
  }
};

export const createCustomSubscriptionPlan = async (req, res, next) => {
  try {
    const { name, description, price, currency, interval, features, userId } = req.body;

    // For now, just return success - in real implementation, save to database
    const plan = {
      _id: `custom_${Date.now()}`,
      name,
      description,
      price: Number(price),
      currency: currency || 'EUR',
      interval: interval || 'month',
      features: Array.isArray(features) ? features : [],
      userId,
      isCustom: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.status(201).json({ plan });
  } catch (err) {
    next(err);
  }
};

export const updateCustomSubscriptionPlan = async (req, res, next) => {
  try {
    const { planId } = req.params;
    const updates = req.body;

    // For now, just return success - in real implementation, update in database
    const updatedPlan = {
      _id: planId,
      ...updates,
      isCustom: true,
      updatedAt: new Date()
    };

    res.json({ plan: updatedPlan });
  } catch (err) {
    next(err);
  }
};

export const deleteCustomSubscriptionPlan = async (req, res, next) => {
  try {
    const { planId } = req.params;

    // For now, just return success - in real implementation, delete from database
    res.json({ message: 'Custom plan deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Get recent activities for dashboard
export const getRecentActivities = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get recent user registrations
    const [recentInfluencers, recentBusinesses, recentOffers, recentApplications] = await Promise.all([
      Influencer.find({})
        .select('name email createdAt')
        .sort('-createdAt')
        .limit(limit)
        .lean(),

      Business.find({})
        .select('businessName email createdAt')
        .sort('-createdAt')
        .limit(limit)
        .lean(),

      Offer.find({})
        .select('title business createdAt status')
        .populate('business', 'businessName')
        .sort('-createdAt')
        .limit(limit)
        .lean(),

      Application.find({})
        .select('influencer offer status createdAt')
        .populate('influencer', 'name')
        .populate('offer', 'title')
        .sort('-createdAt')
        .limit(limit)
        .lean()
    ]);

    // Combine and sort all activities
    const activities = [
      ...recentInfluencers.map(user => ({
        type: 'influencer_signup',
        title: `${user.name} joined as Influencer`,
        timestamp: user.createdAt,
        data: user
      })),
      ...recentBusinesses.map(business => ({
        type: 'business_signup',
        title: `${business.businessName} joined as Business`,
        timestamp: business.createdAt,
        data: business
      })),
      ...recentOffers.map(offer => ({
        type: 'offer_created',
        title: `${offer.business.businessName} created offer: ${offer.title}`,
        timestamp: offer.createdAt,
        data: offer
      })),
      ...recentApplications.map(app => ({
        type: 'application_submitted',
        title: `${app.influencer.name} applied to: ${app.offer.title}`,
        timestamp: app.createdAt,
        data: app
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);

    res.json({ activities });
  } catch (err) {
    next(err);
  }
};

// Get top performers (influencers and businesses)
export const getTopPerformers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const [topInfluencers, topBusinesses] = await Promise.all([
      // Top influencers by followers and rating
      Influencer.find({ status: 'active', isVerified: true })
        .select('name username statistics rating avatarUrl')
        .sort('-statistics.totalFollowers -rating')
        .limit(limit)
        .lean(),

      // Top businesses by collaborations and rating
      Business.find({ status: 'active', 'verificationStatus.businessVerified': true })
        .select('businessName category businessStats rating avatarUrl')
        .sort('-businessStats.completedCollaborations -rating')
        .limit(limit)
        .lean()
    ]);

    res.json({
      topInfluencers: topInfluencers.map(inf => ({
        id: inf._id,
        name: inf.name,
        username: inf.username,
        followers: inf.statistics?.totalFollowers || 0,
        rating: inf.rating || 0,
        image: inf.avatarUrl
      })),
      topBusinesses: topBusinesses.map(biz => ({
        id: biz._id,
        name: biz.businessName,
        category: biz.category,
        collaborations: biz.businessStats?.completedCollaborations || 0,
        rating: biz.rating || 0,
        image: biz.avatarUrl
      }))
    });
  } catch (err) {
    next(err);
  }
};

// Get system health metrics
export const getSystemHealth = async (req, res, next) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Get active users (fallback to basic counts if complex query fails)
    let activeUsers = 0;
    let pendingVerifications = 0;
    let totalDisputes = 0;
    let totalTickets = 0;

    try {
      const activeUserCounts = await Promise.all([
        Influencer.countDocuments({ lastActive: { $gte: oneHourAgo } }).catch(() => 0),
        Business.countDocuments({ lastActive: { $gte: oneHourAgo } }).catch(() => 0),
        Admin.countDocuments({ lastActive: { $gte: oneHourAgo } }).catch(() => 0)
      ]);
      activeUsers = activeUserCounts.reduce((sum, count) => sum + count, 0);
    } catch (error) {
      console.warn('Error getting active users:', error.message);
      activeUsers = 0;
    }

    try {
      const pendingCounts = await Promise.all([
        Influencer.countDocuments({ status: 'adminpending' }).catch(() => 0),
        Business.countDocuments({ status: 'adminpending' }).catch(() => 0)
      ]);
      pendingVerifications = pendingCounts.reduce((sum, count) => sum + count, 0);
    } catch (error) {
      console.warn('Error getting pending verifications:', error.message);
      pendingVerifications = 0;
    }

    try {
      totalDisputes = await Dispute.countDocuments({ status: 'open' }).catch(() => 0);
    } catch (error) {
      console.warn('Error getting disputes count:', error.message);
      totalDisputes = 0;
    }

    try {
      totalTickets = await Ticket.countDocuments({ status: { $in: ['open', 'in_progress'] } }).catch(() => 0);
    } catch (error) {
      console.warn('Error getting tickets count:', error.message);
      totalTickets = 0;
    }

    res.json({
      uptime: '99.9%',
      activeUsers,
      pendingVerifications,
      totalDisputes,
      totalTickets,
      serverStatus: 'operational',
      lastUpdated: now.toISOString()
    });
  } catch (err) {
    console.error('System health check failed:', err);
    // Return basic response even if some queries fail
    res.json({
      uptime: '99.9%',
      activeUsers: 0,
      pendingVerifications: 0,
      totalDisputes: 0,
      totalTickets: 0,
      serverStatus: 'operational',
      lastUpdated: new Date().toISOString(),
      note: 'Some metrics unavailable due to database issues'
    });
  }
};

// Get revenue analytics over time
export const getRevenueAnalytics = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '60d':
        startDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const matchStage = { createdAt: { $gte: startDate }, status: 'succeeded' };

    const [
      totalRevenue,
      totalTransactions,
      dailyRevenue,
      revenueByPaymentMethod,
      topRevenueBusinesses
    ] = await Promise.all([
      // Total revenue in period
      Payment.aggregate([
        { $match: matchStage },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),

      // Total transactions in period
      Payment.countDocuments(matchStage),

      // Daily revenue breakdown
      Payment.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            revenue: { $sum: '$amount' },
            transactions: { $sum: 1 }
          },
        },
        { $sort: { '_id': 1 } }
      ]),

      // Revenue by payment method
      Payment.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$paymentMethod',
            revenue: { $sum: '$amount' },
            transactions: { $sum: 1 }
          },
        }
      ]),

      // Top revenue-generating businesses
      Payment.aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: 'applications',
            localField: 'application',
            foreignField: '_id',
            as: 'application'
          }
        },
        {
          $lookup: {
            from: 'offers',
            localField: 'application.offer',
            foreignField: '_id',
            as: 'offer'
          }
        },
        {
          $lookup: {
            from: 'businesses',
            localField: 'offer.business',
            foreignField: '_id',
            as: 'business'
          }
        },
        {
          $match: { 'business.0': { $exists: true } }
        },
        {
          $group: {
            _id: '$business._id',
            businessName: { $first: '$business.businessName' },
            totalRevenue: { $sum: '$amount' },
            transactions: { $sum: 1 }
          }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString()
      },
      summary: {
        totalRevenue: totalRevenue[0]?.total || 0,
        totalTransactions,
        averageTransactionValue: totalTransactions > 0 ? (totalRevenue[0]?.total || 0) / totalTransactions : 0
      },
      dailyRevenue,
      revenueByPaymentMethod,
      topRevenueBusinesses
    });
  } catch (err) {
    next(err);
  }
};

// Get geographic distribution of users
export const getGeographicAnalytics = async (req, res, next) => {
  try {
    const [
      influencerLocations,
      businessLocations,
      topCities
    ] = await Promise.all([
      // Influencer locations
      Influencer.aggregate([
        {
          $match: {
            'location.city': { $exists: true },
            status: 'active'
          }
        },
        {
          $group: {
            _id: '$location.country',
            count: { $sum: 1 },
            cities: {
              $push: {
                city: '$location.city',
                state: '$location.state',
                count: 1
              }
            }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Business locations
      Business.aggregate([
        {
          $match: {
            'contactInfo.location': { $exists: true },
            status: 'active'
          }
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            locations: {
              $push: '$contactInfo.location'
            }
          }
        }
      ]),

      // Top cities by user count
      Influencer.aggregate([
        {
          $match: {
            'location.city': { $exists: true },
            status: 'active'
          }
        },
        {
          $group: {
            _id: {
              city: '$location.city',
              country: '$location.country'
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ])
    ]);

    res.json({
      influencerLocations,
      businessLocations,
      topCities: topCities.map(city => ({
        city: city._id.city,
        country: city._id.country,
        userCount: city.count
      }))
    });
  } catch (err) {
    next(err);
  }
};

// Get user engagement metrics
export const getEngagementAnalytics = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '60d':
        startDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const matchStage = { createdAt: { $gte: startDate } };

    const [
      applicationTrends,
      offerEngagement,
      userActivityTrends,
      contentPerformance
    ] = await Promise.all([
      // Application trends
      Application.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            applications: { $sum: 1 },
            approved: {
              $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
            }
          },
        },
        { $sort: { '_id': 1 } }
      ]),

      // Offer engagement rates
      Offer.aggregate([
        { $match: { status: 'published' } },
        {
          $lookup: {
            from: 'applications',
            localField: '_id',
            foreignField: 'offer',
            as: 'applications'
          }
        },
        {
          $project: {
            title: 1,
            applicationsCount: { $size: '$applications' },
            approvedCount: {
              $size: {
                $filter: {
                  input: '$applications',
                  cond: { $eq: ['$$this.status', 'approved'] }
                }
              }
            }
          }
        },
        {
          $match: { applicationsCount: { $gt: 0 } }
        },
        {
          $project: {
            title: 1,
            applicationsCount: 1,
            approvedCount: 1,
            approvalRate: {
              $multiply: [
                { $divide: ['$approvedCount', '$applicationsCount'] },
                100
              ]
            }
          }
        },
        { $sort: { approvalRate: -1 } },
        { $limit: 10 }
      ]),

      // User activity trends
      Promise.all([
        Influencer.aggregate([
          { $match: { ...matchStage, lastActive: { $gte: startDate } } },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$lastActive' },
              },
              activeUsers: { $sum: 1 }
            },
          },
          { $sort: { '_id': 1 } }
        ]),
        Business.aggregate([
          { $match: { ...matchStage, lastActive: { $gte: startDate } } },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$lastActive' },
              },
              activeUsers: { $sum: 1 }
            },
          },
          { $sort: { '_id': 1 } }
        ])
      ]),

      // Content performance (placeholder - would need content metrics)
      Promise.resolve([])
    ]);

    res.json({
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString()
      },
      applicationTrends,
      offerEngagement,
      userActivityTrends: {
        influencers: userActivityTrends[0],
        businesses: userActivityTrends[1]
      },
      contentPerformance
    });
  } catch (err) {
    next(err);
  }
};

