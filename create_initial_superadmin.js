import mongoose from 'mongoose';
import { Admin } from './src/models/Admin.js';

async function createInitialSuperAdmin() {
  try {
    console.log('🔄 Connecting to database...');

    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://aakashrajputntf:_9ZeTyyggsZ5nuL@cluster0.0ngxl.mongodb.net/mydb?appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Check if superadmin already exists
    const existingSuperAdmin = await Admin.findOne({
      $or: [
        { role: 'superadmin' },
        { email: 'superAdmin@gmail.com' }
      ]
    });

    if (existingSuperAdmin) {
      console.log('❌ Superadmin already exists!');
      console.log('📧 Email:', existingSuperAdmin.email);
      console.log('👑 Role:', existingSuperAdmin.role);
      await mongoose.disconnect();
      return;
    }

    console.log('🆕 Creating superadmin account...');

    // Create superadmin
    const superAdmin = new Admin({
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

    await superAdmin.save();

    console.log('🎉 Superadmin created successfully!');
    console.log('👤 Name: Super Admin');
    console.log('📧 Email: superAdmin@gmail.com');
    console.log('🔑 Password: Admin@123');
    console.log('👑 Role: superadmin');
    console.log('🏢 Department: management');
    console.log('✅ Status: Active');

    // Verify creation
    const verifyAdmin = await Admin.findOne({ email: 'superAdmin@gmail.com' });
    if (verifyAdmin) {
      console.log('✅ Superadmin verified in database');
      console.log('🆔 ID:', verifyAdmin._id);
    }

    await mongoose.disconnect();
    console.log('✅ Database connection closed');
    console.log('');
    console.log('🚀 You can now login with:');
    console.log('   Email: superAdmin@gmail.com');
    console.log('   Password: Admin@123');

  } catch (error) {
    console.error('❌ Error creating superadmin:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the script
console.log('👑 Creating Initial Superadmin Account');
console.log('=======================================');
createInitialSuperAdmin();