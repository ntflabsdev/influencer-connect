import fetch from 'node-fetch';

const API_BASE = 'https://influencer-connect-ttvy.onrender.com/api/admin';

async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.ADMIN_TOKEN || 'YOUR_ADMIN_JWT_TOKEN'}`
    },
    ...options
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

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

async function testAdminManagementAPIs() {
  console.log('👑 Testing Admin Management APIs');
  console.log('====================================');

  // 1. List all admins
  console.log('\n--- 1. Listing All Admins ---');
  const adminsList = await makeRequest('/admins');

  // 2. Create a new admin
  console.log('\n--- 2. Creating New Admin ---');
  const newAdminData = {
    name: 'Test Admin',
    email: `testadmin${Date.now()}@example.com`,
    password: 'test123456',
    role: 'moderator',
    department: 'moderation',
    permissions: {
      canManageInfluencers: true,
      canManageBusinesses: false,
      canModerateContent: true,
      canApproveOffers: false
    }
  };

  const createdAdmin = await makeRequest('/admins', {
    method: 'POST',
    body: newAdminData
  });

  let adminId = null;
  if (createdAdmin.id) {
    adminId = createdAdmin.id;

    // 3. Get admin details
    console.log('\n--- 3. Getting Admin Details ---');
    await makeRequest(`/admins/${adminId}`);

    // 4. Update admin
    console.log('\n--- 4. Updating Admin ---');
    const updateData = {
      name: 'Updated Test Admin',
      department: 'operations',
      permissions: {
        canManageInfluencers: false,
        canManageBusinesses: true,
        canModerateContent: true
      }
    };

    await makeRequest(`/admins/${adminId}`, {
      method: 'PATCH',
      body: updateData
    });

    // 5. Deactivate admin
    console.log('\n--- 5. Deactivating Admin ---');
    await makeRequest(`/admins/${adminId}`, { method: 'DELETE' });

    // 6. Verify admin is deactivated
    console.log('\n--- 6. Verifying Admin Deactivation ---');
    const updatedAdmin = await makeRequest(`/admins/${adminId}`);
    if (updatedAdmin.admin && !updatedAdmin.admin.isActive) {
      console.log('✅ Admin successfully deactivated');
    }
  }

  console.log('\n👑 Admin Management API Tests Completed!');
  console.log('==============================================');
}

// Run the tests
testAdminManagementAPIs().catch(console.error);