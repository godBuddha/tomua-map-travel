const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3000/api';

async function testApi() {
  console.log('=== STARTING API TESTS ===');
  
  // 1. Test Login
  console.log('\n[1] Testing Login...');
  let token, refreshToken;
  try {
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123456' })
    });
    const loginData = await loginRes.json();
    if (loginData.success) {
      console.log('✅ Login successful!');
      token = loginData.data.accessToken;
      refreshToken = loginData.data.refreshToken;
    } else {
      console.log('❌ Login failed (might need different password):', loginData.message);
      // Let's try to register a test user if login failed
      console.log('--- Registering a test user ---');
      const regRes = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'testuser', password: 'testpassword123', email: 'test@example.com' })
      });
      const regData = await regRes.json();
      console.log('Register response:', regData);
      
      const loginRes2 = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'testuser', password: 'testpassword123' })
      });
      const loginData2 = await loginRes2.json();
      if (loginData2.success) {
        console.log('✅ Login successful with test user!');
        token = loginData2.data.accessToken;
        refreshToken = loginData2.data.refreshToken;
      }
    }
  } catch (err) {
    console.error('Error during login:', err.message);
  }

  // 2. Test Get Destinations
  console.log('\n[2] Testing Get Destinations...');
  try {
    const destRes = await fetch(`${API_BASE}/destinations`);
    const destData = await destRes.json();
    if (destData.success) {
      if (Array.isArray(destData.data)) {
        console.log(`✅ Fetched ${destData.data.length} destinations.`);
      } else {
        console.log(`✅ Fetched destinations. Structure:`, Object.keys(destData.data));
      }
    } else {
      console.log('❌ Failed to fetch destinations:', destData);
    }
  } catch (err) {
    console.error('Error getting destinations:', err.message);
  }

  // 3. Test Create Destination (Database Mismatch - 'other' type)
  console.log('\n[3] Testing Create Destination (type: other)...');
  if (token) {
    try {
      const createRes = await fetch(`${API_BASE}/destinations`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: { vi: 'Điểm đến Test Other', en: 'Test Destination Other' },
          type: 'other',
          lat: 20.8,
          lng: 104.8,
          description: { vi: 'Mô tả test', en: 'A test destination' },
          color: '#123456'
        })
      });
      const createData = await createRes.json();
      if (createData.success) {
        console.log('✅ Successfully created destination with type "other" and dynamic color:', createData.data.name);
      } else {
        console.log('❌ Failed to create destination:', createData);
      }
    } catch (err) {
      console.error('Error creating destination:', err.message);
    }
  } else {
    console.log('⚠️ Skipping destination creation due to missing token.');
  }

  // 4. Test Error Handling (Invalid endpoint)
  console.log('\n[4] Testing Error Handling (Invalid JSON response)...');
  try {
    // Calling NGINX (port 3000) for a missing route to see if we get HTML instead of JSON
    const errRes = await fetch(`http://localhost:3000/some-invalid-route`);
    const contentType = errRes.headers.get('content-type');
    console.log('Response Content-Type:', contentType);
    if (contentType && contentType.includes('application/json')) {
      console.log('Received JSON:', await errRes.json());
    } else {
      console.log(`✅ Server returned ${errRes.status} with Content-Type ${contentType}, preventing JSON parse error!`);
    }
  } catch (err) {
    console.error('Error in fetch:', err.message);
  }

  console.log('\n=== TESTS COMPLETED ===');
}

testApi();
