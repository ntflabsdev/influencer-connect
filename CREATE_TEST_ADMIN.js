// Create Test Admin User
// Run this to create a test admin user for testing login

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Admin model (simplified for this script)
const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  department: { type: String, default: 'operations' },
  isActive: { type: Boolean, default: true },
  permissions: { type: Object, default: {} },
  adminStats: {
    usersVerified: { type: Number, default: 0 },
    usersSuspended: { type: Number, default: 0 },
    offersApproved: { type: Number, default: 0 },
    contentModerated: { type: Number, default: 0 },
    ticketsResolved: { type: Number, default: 0 },
    loginCount: { type: Number, default: 0 }
  }
}, { timestamps: true });

adminSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);

async function createTestAdmin() {
  try {
    console.log('🔧 Creating test admin user...');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@test.com' });
    if (existingAdmin) {
      console.log('✅ Test admin already exists');
      return;
    }

    // Create new admin
    const hashedPassword = await bcrypt.hash('password123', 10);
    const admin = new Admin({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'admin',
      department: 'operations',
      isActive: true,
      permissions: {
        users: true,
        offers: true,
        content: true,
        analytics: true,
        settings: true
      }
    });

    await admin.save();
    console.log('✅ Test admin created successfully!');
    console.log('📧 Email: admin@test.com');
    console.log('🔑 Password: password123');

  } catch (error) {
    console.error('❌ Error creating test admin:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

// Connect to MongoDB and run
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://aakashrajputntf:_9ZeTyyggsZ5nuL@cluster0.0ngxl.mongodb.net/mydb?appName=Cluster0';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('📊 Connected to MongoDB');
  return createTestAdmin();
}).catch(error => {
  console.error('❌ MongoDB connection failed:', error.message);
  process.exit(1);
});