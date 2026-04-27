import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Admin } from '../models/Admin.js';
import { Business } from '../models/Business.js';
import { Influencer } from '../models/Influencer.js';
import { Offer } from '../models/Offer.js';
import { logger } from '../utils/logger.js';

const main = async () => {
  await connectDB();
  await Promise.all([
    Admin.deleteMany({}),
    Business.deleteMany({}),
    Influencer.deleteMany({}),
    Offer.deleteMany({})
  ]);

  const admin = await Admin.create({
    name: 'Super Admin',
    email: 'superAdmin@gmail.com',
    password: 'Admin@123',
    role: 'superadmin',
    department: 'management',
    isActive: true,
    permissions: {
      // User Management
      canManageInfluencers: true,
      canManageBusinesses: true,
      canManageAdmins: true,
      canSuspendUsers: true,
      canVerifyUsers: true,

      // Content Management
      canModerateContent: true,
      canApproveOffers: true,
      canDeleteContent: true,

      // Financial Management
      canViewPayments: true,
      canManageSubscriptions: true,
      canProcessRefunds: true,

      // System Administration
      canAccessLogs: true,
      canManageSettings: true,
      canViewAnalytics: true,
      canExportData: true,
      canManageIntegrations: true
    }
  });

  const business = await Business.create({
    name: 'Cafe Madrid',
    email: 'biz@test.com',
    password: 'password123',
    businessName: 'Cafe Madrid',
    companySize: '11-50',
    status: 'active',
    verificationStatus: { businessVerified: true },
    contactInfo: { website: 'https://cafemadrid.test' },
  });

  const influencer = await Influencer.create({
    name: 'Influencer One',
    email: 'infl@test.com',
    password: 'password123',
    status: 'active',
    isVerified: true,
    meta: { instagram: { username: '@infl', followers: 5000, connected: true } },
  });

  const offer = await Offer.create({
    business: business._id,
    title: 'Free brunch post',
    description: 'Post a story and feed post about our brunch.',
    reward: { cash: 50, perks: 'Free brunch for two' },
    requirements: ['IG story', 'IG post'],
    status: 'open',
    filters: { minFollowers: 1000, platforms: ['instagram'] },
  });

  logger.info('Seed data created', {
    admin: admin.email,
    business: business.email,
    influencer: influencer.email,
    offer: offer.title,
  });
  await mongoose.disconnect();
};

main().catch((err) => {
  logger.error(err);
  process.exit(1);
});




