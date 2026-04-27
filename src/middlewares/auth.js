import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Influencer } from '../models/Influencer.js';
import { Business } from '../models/Business.js';
import { Admin } from '../models/Admin.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;
    if (!token) return res.status(401).json({ message: 'Auth token missing' });
   console.log('Auth Token:', token);
    const decoded = jwt.verify(token, env.jwtSecret);
    console.log("Decoded JWT:", decoded);
    
    // Try to find user in all three models
    let user = null;
    let userRole = null;
    
    if(decoded.role === 'influencer') {
      user = await Influencer.findById(decoded.id);
      userRole = 'influencer';
    } else if(decoded.role === 'business') {
      user = await Business.findById(decoded.id);
      userRole = 'business';
    } else if(decoded.role === 'admin') {
      user = await Admin.findById(decoded.id);
      userRole = 'admin';
    }
    
    if (!user) return res.status(401).json({ message: 'User not found' });

    // Add role to user object for middleware checks
    // Mongoose documents support adding properties
    user.role = userRole;
    // Ensure id is set - use _id converted to string for consistency
    user.id = user._id ? user._id.toString() : (user.id || decoded.id);
    
    req.user = user;
    
    console.log('Authenticated User:', { 
      id: user._id, 
      role: user.role, 
      email: user.email,
      hasRole: 'role' in user 
    });
    next();
  } catch (err) {
    next(err);
  }
};

export const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Get role from user object (should be set in authenticate middleware)
  const userRole = req.user.role;

  console.log('User Role Check:', {
    userRole,
    rolesAllowed: roles,
    userHasRole: 'role' in req.user,
    userKeys: Object.keys(req.user).slice(0, 10)
  });

  if (!userRole || !roles.includes(userRole)) {
    return res.status(403).json({ message: 'Insufficient permissions' });
  }
  next();
};

// Admin-specific authentication middleware
export const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: 'Admin authentication token missing' });
    }

    const decoded = jwt.verify(token, env.jwtSecret);
    console.log("Admin Auth - Decoded JWT:", decoded);

    // Only allow admin role tokens
    if (decoded.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Admin access required. This endpoint is only for administrators.' 
      });
    }

    // Find admin user
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ message: 'Admin account not found' });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(403).json({ 
        message: 'Admin account is inactive. Please contact a superadmin.' 
      });
    }

    // Set admin properties - use role from database (superadmin/admin/moderator)
    // Don't override the role, use what's stored in database
    admin.id = admin._id ? admin._id.toString() : (admin.id || decoded.id);
    
    // Ensure role is set from database (superadmin, admin, or moderator)
    // If role doesn't exist in database, default to 'admin'
    if (!admin.role) {
      admin.role = 'admin';
    }

    req.user = admin;

    console.log('Authenticated Admin:', { 
      id: admin._id, 
      role: admin.role,  // This will be superadmin/admin/moderator from database
      email: admin.email,
      isActive: admin.isActive,
      adminRole: admin.role
    });

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid admin token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Admin token expired' });
    }
    next(err);
  }
};

export const allowSuperAdminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  console.log("Checking superadmin access for user:",  req.user );
  const userRole = req.user.role;

  if (userRole !== 'superadmin') {
    return res.status(403).json({ message: 'Superadmin access required' });
  }
  next();
};





