const API_BASE = "https://influencer-connect-ttvy.onrender.com";

async function testApi() {
  console.log("Testing API call to:", API_BASE);
  
  try {
    const response = await fetch(`${API_BASE}/api/auth/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": "https://influencer-connect-admin.vercel.app"
      },
      body: JSON.stringify({
        email: "admin@test.com",
        password: "password123"
      })
    });
    
    console.log("Response status:", response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Success:", JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log("❌ Error:", text);
    }
  } catch (error) {
    console.log("❌ Network error:", error.message);
  }
}

testApi();