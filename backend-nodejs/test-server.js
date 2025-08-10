// Test script to verify server is running
const http = require('http');

console.log('🧪 Testing AstroBSM-Oracle Node.js Backend...\n');

// Test endpoints
const endpoints = [
  { path: '/health', name: 'Health Check' },
  { path: '/api/status', name: 'API Status' },
  { path: '/api/v1/auth/me', name: 'Auth Endpoint (should return 401)' }
];

function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: endpoint.path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`✅ ${endpoint.name}: ${res.statusCode} ${res.statusMessage}`);
        if (res.statusCode === 200 || res.statusCode === 401) {
          try {
            const parsed = JSON.parse(data);
            console.log(`   Response: ${JSON.stringify(parsed, null, 2)}`);
          } catch (e) {
            console.log(`   Response: ${data.substring(0, 100)}...`);
          }
        }
        console.log('');
        resolve(res.statusCode);
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${endpoint.name}: ${err.message}`);
      console.log('');
      resolve(0);
    });

    req.setTimeout(5000, () => {
      console.log(`⏰ ${endpoint.name}: Timeout`);
      console.log('');
      req.destroy();
      resolve(0);
    });

    req.end();
  });
}

async function runTests() {
  console.log('🌐 Testing server endpoints...\n');
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between requests
  }

  console.log('🎯 Test completed!');
  console.log('');
  console.log('🚀 If all tests passed, your server is running correctly!');
  console.log('🌐 Frontend: http://localhost:8080');
  console.log('🔗 API: http://localhost:8080/api/v1');
}

runTests();
