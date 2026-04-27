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

async function testPlatformSettingsAPIs() {
  console.log('⚙️ Testing Platform Settings APIs');
  console.log('====================================');

  // 1. Get current settings
  console.log('\n--- 1. Getting Current Platform Settings ---');
  const currentSettings = await makeRequest('/settings');

  if (currentSettings.settings) {
    // 2. Update platform settings
    console.log('\n--- 2. Updating Platform Settings ---');
    const updateData = {
      platform: {
        name: 'Test Platform Name',
        description: 'Updated platform description'
      },
      features: {
        userRegistration: false,
        influencerApplications: false
      },
      security: {
        passwordMinLength: 10,
        twoFactorRequired: true
      }
    };

    const updatedSettings = await makeRequest('/settings', {
      method: 'PATCH',
      body: updateData
    });

    // 3. Verify settings were updated
    console.log('\n--- 3. Verifying Settings Update ---');
    const verifySettings = await makeRequest('/settings');

    if (verifySettings.settings?.platform?.name === 'Test Platform Name') {
      console.log('✅ Settings update successful');
    } else {
      console.log('❌ Settings update failed');
    }

    // 4. Reset settings to defaults
    console.log('\n--- 4. Resetting Settings to Defaults ---');
    if (confirm('Do you want to reset settings to defaults?')) {
      const resetResult = await makeRequest('/settings/reset', { method: 'POST' });

      if (resetResult.settings) {
        console.log('✅ Settings reset to defaults');
      }
    } else {
      console.log('⏭️ Skipping settings reset');
    }
  } else {
    console.log('❌ Failed to load current settings');
  }

  console.log('\n⚙️ Platform Settings API Tests Completed!');
  console.log('==============================================');
}

// Run the tests
testPlatformSettingsAPIs().catch(console.error);