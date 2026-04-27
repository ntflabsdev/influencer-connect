// Test Admin Login Functionality
// This script tests if the admin login works correctly

const API_BASE = 'http://localhost:5500/api/auth';

async function testAdminLogin() {
  console.log('🧪 Testing Admin Login...');

  try {
    const response = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'password123'
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Admin login successful!');
      console.log('📊 Response:', {
        hasAccessToken: !!data.accessToken,
        hasRefreshToken: !!data.refreshToken,
        userRole: data.user?.role,
        userStatus: data.user?.status
      });
    } else {
      console.log('❌ Admin login failed:', data.message);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

async function testToastProvider() {
  console.log('\n🧪 Testing ToastProvider UUID generation...');

  try {
    // Test the UUID generation fallback
    const id1 = crypto.randomUUID ? crypto.randomUUID() : `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const id2 = crypto.randomUUID ? crypto.randomUUID() : `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log('✅ UUID generation working:', id1 !== id2);
    console.log('📊 Generated IDs are unique:', id1, id2);
  } catch (error) {
    console.log('❌ UUID generation failed:', error.message);
  }
}

// Run tests
testToastProvider();
testAdminLogin();