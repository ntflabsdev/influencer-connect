const fetch = require('node-fetch');

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

async function testListOffers() {
  console.log('\n📋 Testing List All Offers API');

  // Test basic listing
  console.log('\n--- Basic listing ---');
  await makeRequest('/offers');

  // Test with filters
  console.log('\n--- Filtered by status: draft ---');
  await makeRequest('/offers?status=draft');

  console.log('\n--- Filtered by status: open ---');
  await makeRequest('/offers?status=open');

  // Test search
  console.log('\n--- Search for "test" ---');
  await makeRequest('/offers?search=test');

  // Test pagination
  console.log('\n--- Page 1, limit 5 ---');
  await makeRequest('/offers?page=1&limit=5');
}

async function testOfferDetails() {
  console.log('\n📄 Testing Offer Details API');

  // First get a list of offers to pick one
  const offersList = await makeRequest('/offers?limit=1');
  if (offersList.offers && offersList.offers.length > 0) {
    const offerId = offersList.offers[0]._id;
    console.log(`\n--- Getting details for offer: ${offerId} ---`);
    await makeRequest(`/offers/${offerId}`);
  } else {
    console.log('❌ No offers found to test details');
  }
}

async function testOfferStatusUpdates() {
  console.log('\n🔄 Testing Offer Status Updates');

  // Get a draft offer to test approval
  const draftOffers = await makeRequest('/offers?status=draft&limit=1');
  if (draftOffers.offers && draftOffers.offers.length > 0) {
    const offerId = draftOffers.offers[0]._id;

    console.log(`\n--- Approving draft offer: ${offerId} ---`);
    await makeRequest(`/offers/${offerId}/status`, {
      method: 'PATCH',
      body: { status: 'open', notes: 'Approved via API test' }
    });

    // Test pausing
    console.log(`\n--- Pausing approved offer: ${offerId} ---`);
    await makeRequest(`/offers/${offerId}/status`, {
      method: 'PATCH',
      body: { status: 'paused', notes: 'Paused for testing' }
    });

    // Test closing
    console.log(`\n--- Closing offer: ${offerId} ---`);
    await makeRequest(`/offers/${offerId}/status`, {
      method: 'PATCH',
      body: { status: 'closed', notes: 'Closed via API test' }
    });
  } else {
    console.log('❌ No draft offers found to test status updates');
  }
}

async function testBulkUpdates() {
  console.log('\n📦 Testing Bulk Offer Updates');

  // Get multiple offers for bulk operations
  const offersList = await makeRequest('/offers?limit=3');
  if (offersList.offers && offersList.offers.length >= 2) {
    const offerIds = offersList.offers.slice(0, 2).map(offer => offer._id);

    console.log(`\n--- Bulk approving ${offerIds.length} offers ---`);
    await makeRequest('/offers/bulk-update', {
      method: 'POST',
      body: {
        offerIds,
        action: 'approve',
        reason: 'Bulk approval test'
      }
    });

    console.log(`\n--- Bulk pausing ${offerIds.length} offers ---`);
    await makeRequest('/offers/bulk-update', {
      method: 'POST',
      body: {
        offerIds,
        action: 'pause',
        reason: 'Bulk pause test'
      }
    });

    console.log(`\n--- Bulk unflagging ${offerIds.length} offers ---`);
    await makeRequest('/offers/bulk-update', {
      method: 'POST',
      body: {
        offerIds,
        action: 'unflag',
        reason: 'Bulk unflag test'
      }
    });
  } else {
    console.log('❌ Not enough offers found for bulk operations test');
  }
}

async function testOfferAnalytics() {
  console.log('\n📊 Testing Offer Analytics');

  console.log('\n--- Analytics for last 30 days ---');
  await makeRequest('/offers/analytics/overview?period=30d');

  console.log('\n--- Analytics for last 7 days ---');
  await makeRequest('/offers/analytics/overview?period=7d');

  console.log('\n--- Analytics for today ---');
  await makeRequest('/offers/analytics/overview?period=today');
}

async function testOfferFlagging() {
  console.log('\n🚩 Testing Offer Flagging');

  // Get an offer to flag
  const offersList = await makeRequest('/offers?limit=1');
  if (offersList.offers && offersList.offers.length > 0) {
    const offerId = offersList.offers[0]._id;

    console.log(`\n--- Flagging offer: ${offerId} ---`);
    await makeRequest(`/offers/${offerId}/flag`, {
      method: 'PATCH',
      body: {
        flagged: true,
        riskTags: ['test', 'api-test'],
        notes: 'Flagged via API test',
        reviewer: 'API Test Script'
      }
    });

    console.log(`\n--- Unflagging offer: ${offerId} ---`);
    await makeRequest(`/offers/${offerId}/flag`, {
      method: 'PATCH',
      body: {
        flagged: false,
        notes: 'Unflagged via API test',
        reviewer: 'API Test Script'
      }
    });
  } else {
    console.log('❌ No offers found to test flagging');
  }
}

async function testFilteredOffers() {
  console.log('\n🔍 Testing Filtered Offers');

  console.log('\n--- Only flagged offers ---');
  await makeRequest('/offers?flagged=true');

  console.log('\n--- Only non-flagged offers ---');
  await makeRequest('/offers?flagged=false');

  console.log('\n--- Combined filters: open status, not flagged ---');
  await makeRequest('/offers?status=open&flagged=false');

  console.log('\n--- Search + filters ---');
  await makeRequest('/offers?search=promo&status=open');
}

async function runAllTests() {
  console.log('🚀 Starting Admin Offers API Tests');
  console.log('=====================================');

  // Login first
  const loggedIn = await loginAsAdmin();
  if (!loggedIn) {
    console.log('❌ Cannot proceed without admin login. Please ensure admin user exists.');
    process.exit(1);
  }

  // Run all tests
  await testListOffers();
  await testOfferDetails();
  await testOfferStatusUpdates();
  await testBulkUpdates();
  await testOfferAnalytics();
  await testOfferFlagging();
  await testFilteredOffers();

  console.log('\n🎉 All Admin Offers API tests completed!');
  console.log('=======================================');
}

// Run the tests
runAllTests().catch(console.error);