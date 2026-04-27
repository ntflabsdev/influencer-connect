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

  console.log(`\n🔄 Making ${options.method || 'GET'} request to: ${url}`);

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      console.log(`❌ Error ${response.status}:`, data);
      return { error: data, status: response.status };
    }

    console.log(`✅ Success:`, JSON.stringify(data, null, 2));
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

async function testApplicationTrends() {
  console.log('\n📊 Testing Application Trends API');

  console.log('\n--- Testing Influencer Applications Over Time ---');
  const influencerData = await makeRequest('/analytics/user-type?userType=influencer&period=30d');

  console.log('\n--- Application Trends Data Structure ---');
  if (influencerData.applicationTrends) {
    console.log(`Found ${influencerData.applicationTrends.length} data points`);
    if (influencerData.applicationTrends.length > 0) {
      console.log('Sample data point:', influencerData.applicationTrends[0]);
    }
  } else {
    console.log('❌ No applicationTrends field found');
  }

  console.log('\n--- Testing Business Applications Over Time ---');
  const businessData = await makeRequest('/analytics/user-type?userType=business&period=30d');

  console.log('\n--- Application Trends Data Structure ---');
  if (businessData.applicationTrends) {
    console.log(`Found ${businessData.applicationTrends.length} data points`);
    if (businessData.applicationTrends.length > 0) {
      console.log('Sample data point:', businessData.applicationTrends[0]);
    }
  } else {
    console.log('❌ No applicationTrends field found');
  }

  return {
    influencerTrends: influencerData.applicationTrends || [],
    businessTrends: businessData.applicationTrends || []
  };
}

async function runTests() {
  console.log('🚀 Testing Dashboard Application Charts');
  console.log('=======================================');

  // Login first
  const loggedIn = await loginAsAdmin();
  if (!loggedIn) {
    console.log('❌ Cannot proceed without admin login. Please ensure admin user exists.');
    process.exit(1);
  }

  // Test the application trends
  const trends = await testApplicationTrends();

  console.log('\n📈 Summary:');
  console.log(`Influencer application data points: ${trends.influencerTrends.length}`);
  console.log(`Business application data points: ${trends.businessTrends.length}`);

  if (trends.influencerTrends.length > 0 || trends.businessTrends.length > 0) {
    console.log('✅ Charts should now display data!');
  } else {
    console.log('⚠️  No application data found. Charts will show "No data available"');
    console.log('   This is normal if there are no applications in the selected time period.');
  }

  console.log('\n🎉 Dashboard application charts test completed!');
  console.log('================================================');
}

// Run the tests
runTests().catch(console.error);