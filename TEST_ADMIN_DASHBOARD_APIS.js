// TEST ADMIN DASHBOARD APIs
// Node.js script to test all admin dashboard endpoints

const fetch = require('node-fetch');

const API_BASE = 'http://192.168.1.55:5500/api/admin';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'YOUR_ADMIN_JWT_TOKEN';

async function testEndpoint(endpoint, description, expectArray = false) {
  console.log(`\n🧪 Testing: ${description}`);
  console.log(`📍 ${endpoint}`);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    console.log('✅ SUCCESS');

    // Basic validation
    if (expectArray && !Array.isArray(data)) {
      console.log('⚠️  WARNING: Expected array but got object');
    }

    if (typeof data === 'object') {
      const keys = Object.keys(data);
      console.log(`📊 Response keys: ${keys.join(', ')}`);

      if (keys.includes('activities') && Array.isArray(data.activities)) {
        console.log(`📈 Activities count: ${data.activities.length}`);
      }

      if (keys.includes('topInfluencers') && keys.includes('topBusinesses')) {
        console.log(`📈 Top influencers: ${data.topInfluencers?.length || 0}`);
        console.log(`📈 Top businesses: ${data.topBusinesses?.length || 0}`);
      }

      if (keys.includes('totalRevenue') || keys.includes('totalUsers')) {
        console.log(`📈 Analytics data available`);
      }
    }

    return { success: true, data };
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 ADMIN DASHBOARD API TESTS');
  console.log('=' .repeat(60));

  if (ADMIN_TOKEN === 'YOUR_ADMIN_JWT_TOKEN') {
    console.log('⚠️  WARNING: Set ADMIN_TOKEN environment variable or replace YOUR_ADMIN_JWT_TOKEN');
    console.log('   Example: ADMIN_TOKEN="your.jwt.token.here" node TEST_ADMIN_DASHBOARD_APIS.js');
    process.exit(1);
  }

  // First test the status endpoint
  console.log('\n🔍 Checking dashboard status...');
  const statusResult = await testEndpoint('/dashboard/status', 'Dashboard Status Check');
  if (!statusResult.success) {
    console.log('❌ Cannot connect to dashboard APIs. Check server and token.');
    process.exit(1);
  }

  const tests = [
    // Core Analytics
    { endpoint: '/analytics/summary', desc: 'Platform Summary', expectArray: false },
    { endpoint: '/analytics/detail', desc: 'Detailed Analytics', expectArray: false },
    { endpoint: '/analytics/filtered?period=30d', desc: 'Filtered Analytics (30d)', expectArray: false },
    { endpoint: '/analytics/user-type?userType=business&period=30d', desc: 'Business Analytics (30d)', expectArray: false },
    { endpoint: '/analytics/user-type?userType=influencer&period=30d', desc: 'Influencer Analytics (30d)', expectArray: false },

    // Dashboard APIs
    { endpoint: '/dashboard/activities?limit=5', desc: 'Recent Activities', expectArray: false },
    { endpoint: '/dashboard/top-performers?limit=3', desc: 'Top Performers', expectArray: false },
    { endpoint: '/dashboard/health', desc: 'System Health', expectArray: false },

    // Advanced Analytics
    { endpoint: '/analytics/revenue?period=30d', desc: 'Revenue Analytics (30d)', expectArray: false },
    { endpoint: '/analytics/geographic', desc: 'Geographic Analytics', expectArray: false },
    { endpoint: '/analytics/engagement?period=30d', desc: 'Engagement Analytics (30d)', expectArray: false },
  ];

  console.log('\n' + '='.repeat(60));
  console.log('🧪 RUNNING API TESTS');
  console.log('='.repeat(60));

  const results = [];

  for (const test of tests) {
    const result = await testEndpoint(test.endpoint, test.desc, test.expectArray);
    results.push({ ...test, ...result });
  }

  console.log('\n' + '='.repeat(60));
  console.log('📋 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const total = results.length;

  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`❌ Failed: ${failed}/${total}`);

  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.filter(r => !r.success).forEach(test => {
      console.log(`   • ${test.desc}: ${test.error}`);
    });
  } else {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ All admin dashboard APIs are working correctly');
  }

  console.log('\n📝 NOTES:');
  console.log('• Some analytics may return empty data if no records exist');
  console.log('• Geographic data requires users to have location information');
  console.log('• Revenue data requires successful payment records');

  // Show sample data for successful endpoints
  const successfulTests = results.filter(r => r.success && r.data);
  if (successfulTests.length > 0) {
    console.log('\n📊 SAMPLE DATA PREVIEW:');
    successfulTests.slice(0, 3).forEach(test => {
      const keys = Object.keys(test.data);
      console.log(`• ${test.desc}: ${keys.length} properties (${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''})`);
    });
  }

  console.log('\n🏁 TEST COMPLETE');
}

// Run the tests
runTests().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});