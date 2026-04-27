// Test Dashboard API Fix
// This script tests if the dashboard APIs now work with the correct /api/admin prefix

const API_BASE = 'http://localhost:5500/api/admin';

async function testEndpoint(endpoint, description) {
  console.log(`\n🧪 Testing: ${description}`);
  console.log(`📍 ${endpoint}`);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Bearer YOUR_ADMIN_TOKEN`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ SUCCESS - API endpoint found and working');

    // Basic validation
    if (typeof data === 'object') {
      const keys = Object.keys(data);
      console.log(`📊 Response contains: ${keys.join(', ')}`);
    }

    return { success: true, data };
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 TESTING DASHBOARD API FIX');
  console.log('=' .repeat(50));

  console.log('\n⚠️  IMPORTANT: Replace YOUR_ADMIN_TOKEN with actual admin JWT token');
  console.log('   Get token by logging in as admin at http://localhost:3001');

  const tests = [
    { endpoint: '/analytics/summary', desc: 'Platform Summary' },
    { endpoint: '/analytics/detail', desc: 'Detailed Analytics' },
    { endpoint: '/dashboard/activities?limit=5', desc: 'Recent Activities' },
    { endpoint: '/dashboard/top-performers?limit=3', desc: 'Top Performers' },
    { endpoint: '/dashboard/health', desc: 'System Health' },
    { endpoint: '/dashboard/status', desc: 'Dashboard Status Check' }
  ];

  const results = [];

  for (const test of tests) {
    const result = await testEndpoint(test.endpoint, test.desc);
    results.push({ ...test, ...result });
  }

  console.log('\n' + '='.repeat(50));
  console.log('📋 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✅ Successful: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);

  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.filter(r => !r.success).forEach(test => {
      console.log(`   • ${test.desc}: ${test.error}`);
    });
    console.log('\n💡 If getting 401 Unauthorized, replace YOUR_ADMIN_TOKEN with valid token');
    console.log('💡 If getting 404 Not Found, check if backend server is running on port 5500');
  } else {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ All admin dashboard APIs are working correctly');
    console.log('✅ Frontend can now successfully call backend APIs');
  }

  console.log('\n📝 NEXT STEPS:');
  console.log('1. Start backend: npm run dev');
  console.log('2. Start admin frontend: cd admin-app && npm run dev');
  console.log('3. Login as admin and visit dashboard');
  console.log('4. Dashboard should now load without 404 errors');
}

// Run the tests
runTests().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});