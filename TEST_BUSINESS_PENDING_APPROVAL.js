import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5500';
let adminToken = '';

async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE}/api/admin${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(adminToken && { 'Authorization': `Bearer ${adminToken}` }),
      ...options.headers
    },
    ...options
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  console.log(`\n🔄 Making ${options.method || 'GET'} request to: ${url}`);
  if (config.body) {
    console.log('📤 Request Body:', config.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      console.log(`❌ Error ${response.status}:`, data);
      return { error: data, status: response.status };
    }

    console.log(`✅ Success:`, data);
    return data;
  } catch (error) {
    console.log(`❌ Network Error:`, error.message);
    return { error: error.message };
  }
}

async function loginAsAdmin() {
  console.log('\n🔐 Logging in as admin...');
  const loginData = await makeRequest('/auth/login', {
    method: 'POST',
    body: {
      email: 'admin@test.com',
      password: 'password123'
    }
  });

  if (loginData.token) {
    adminToken = loginData.token;
    console.log('✅ Admin login successful');
    return true;
  } else {
    console.log('❌ Admin login failed');
    return false;
  }
}

async function testBusinessFiltering() {
  console.log('\n🏢 Testing Business Status Filtering');

  console.log('\n--- Getting active businesses ---');
  const activeData = await makeRequest('/users?role=business&status=active');
  console.log(`Found ${activeData.users?.businesses?.length || 0} active businesses`);

  console.log('\n--- Getting pending businesses ---');
  const pendingData = await makeRequest('/users?role=business&status=adminpending');
  console.log(`Found ${pendingData.users?.businesses?.length || 0} pending businesses`);

  return {
    activeCount: activeData.users?.businesses?.length || 0,
    pendingCount: pendingData.users?.businesses?.length || 0
  };
}

async function createTestPendingBusiness() {
  console.log('\n🆕 Creating a test pending business...');

  const businessData = {
    role: 'business',
    name: 'Test Business Owner',
    email: `testbusiness${Date.now()}@example.com`,
    password: 'test123456',
    meta: {
      businessName: 'Test Business Corp',
      website: 'https://testbusiness.com'
    }
  };

  const result = await makeRequest('/users', {
    method: 'POST',
    body: businessData
  });

  if (result.id) {
    console.log('✅ Test business created successfully');

    // Now get it and verify it's pending
    const verifyData = await makeRequest('/users?role=business&status=adminpending');
    const newBusiness = verifyData.users?.businesses?.find(b => b.email === businessData.email);

    if (newBusiness) {
      console.log('✅ Business is correctly in pending status');
      return newBusiness;
    } else {
      console.log('❌ Business not found in pending list');
    }
  } else {
    console.log('❌ Failed to create test business');
  }

  return null;
}

async function approveBusiness(business) {
  console.log(`\n✅ Approving business: ${business.name}`);

  const result = await makeRequest(`/users/${business.id}`, {
    method: 'PATCH',
    body: { isVerified: true }
  });

  if (result.message) {
    console.log('✅ Business approved successfully');

    // Verify it's now active
    const verifyData = await makeRequest('/users?role=business&status=active');
    const approvedBusiness = verifyData.users?.businesses?.find(b => b.id === business.id);

    if (approvedBusiness) {
      console.log('✅ Business is now active');
    } else {
      console.log('❌ Business not found in active list');
    }
  } else {
    console.log('❌ Failed to approve business');
  }
}

async function runAllTests() {
  console.log('🚀 Starting Business Pending Approval Tests');
  console.log('===========================================');

  // Login first
  const loggedIn = await loginAsAdmin();
  if (!loggedIn) {
    console.log('❌ Cannot proceed without admin login. Please ensure admin user exists.');
    process.exit(1);
  }

  // Test current state
  const counts = await testBusinessFiltering();

  // Create a test pending business if none exist
  let testBusiness = null;
  if (counts.pendingCount === 0) {
    testBusiness = await createTestPendingBusiness();
  } else {
    console.log('\n📋 Using existing pending business for testing');
    const pendingData = await makeRequest('/users?role=business&status=adminpending');
    testBusiness = pendingData.users?.businesses?.[0];
  }

  // Test approval flow if we have a pending business
  if (testBusiness) {
    await approveBusiness(testBusiness);
  }

  // Final state check
  console.log('\n📊 Final state:');
  await testBusinessFiltering();

  console.log('\n🎉 Business pending approval tests completed!');
  console.log('============================================');
}

// Run the tests
runAllTests().catch(console.error);