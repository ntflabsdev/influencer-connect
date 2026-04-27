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

async function testContentModerationAPIs() {
  console.log('🎭 Testing Content Moderation APIs');
  console.log('====================================');

  // 1. Get pending submissions
  console.log('\n--- 1. Getting Pending Submissions ---');
  const pendingData = await makeRequest('/submissions?status=pending&limit=5');

  let submissionId = null;
  if (pendingData.submissions && pendingData.submissions.length > 0) {
    submissionId = pendingData.submissions[0]._id;
    console.log(`Found ${pendingData.submissions.length} pending submissions`);
  } else {
    console.log('❌ No pending submissions found');
    return;
  }

  // 2. Analyze content with AI
  console.log('\n--- 2. Analyzing Content with AI ---');
  const aiAnalysis = await makeRequest(`/content/analyze/${submissionId}`, {
    method: 'POST'
  });

  // 3. Get AI flagged submissions
  console.log('\n--- 3. Getting AI Flagged Submissions ---');
  const flaggedData = await makeRequest('/content/flagged');

  // 4. Bulk analyze multiple submissions
  console.log('\n--- 4. Bulk AI Analysis ---');
  const submissionIds = pendingData.submissions.slice(0, 2).map(s => s._id);
  if (submissionIds.length > 0) {
    const bulkAnalysis = await makeRequest('/content/bulk-analyze', {
      method: 'POST',
      body: { submissionIds }
    });
  }

  // 5. Bulk moderate content
  console.log('\n--- 5. Bulk Content Moderation ---');
  const moderateResult = await makeRequest('/content/bulk-moderate', {
    method: 'POST',
    body: {
      submissionIds: [submissionId],
      action: 'approve',
      feedback: 'Bulk approved via API test'
    }
  });

  // 6. Get content quality analytics
  console.log('\n--- 6. Content Quality Analytics ---');
  const analytics = await makeRequest('/content/analytics/quality?period=30d');

  console.log('\n🎭 Content Moderation API Tests Completed!');
  console.log('==========================================');

  // Summary
  console.log('\n📊 Summary:');
  console.log(`Pending submissions: ${pendingData.submissions?.length || 0}`);
  console.log(`AI flagged submissions: ${flaggedData.submissions?.length || 0}`);
  console.log(`Quality metrics available: ${analytics.qualityMetrics ? 'Yes' : 'No'}`);

  if (aiAnalysis.aiAnalysis) {
    console.log(`AI Analysis: ${aiAnalysis.aiAnalysis.flags?.length || 0} flags detected`);
  }
}

// Run the tests
testContentModerationAPIs().catch(console.error);