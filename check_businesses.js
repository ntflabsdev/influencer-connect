import mongoose from 'mongoose';
import { Business } from './src/models/Business.js';

async function checkBusinesses() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://aakashrajputntf:_9ZeTyyggsZ5nuL@cluster0.0ngxl.mongodb.net/mydb?appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Count businesses by status
    const statusCounts = await Business.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    console.log('\nBusiness status counts:');
    statusCounts.forEach(status => {
      console.log(`${status._id}: ${status.count}`);
    });

    // Get sample businesses
    const businesses = await Business.find({})
      .select('name email status isVerified businessName')
      .limit(5);

    console.log('\nSample businesses:');
    businesses.forEach(biz => {
      console.log(`${biz.name} (${biz.email}) - Status: ${biz.status}, Verified: ${biz.isVerified}`);
    });

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');

  } catch (error) {
    console.error('Error:', error);
  }
}

checkBusinesses();