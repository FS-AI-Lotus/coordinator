#!/usr/bin/env node

/**
 * Test script to verify /register endpoint and health check
 * Run: node test-register-fix.js
 */

const http = require('http');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Coordinator Service Fixes\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  let passed = 0;
  let failed = 0;

  // Test 1: GET /register should return 200 (CI compatibility)
  console.log('Test 1: GET /register (CI compatibility)');
  try {
    const response = await makeRequest('GET', '/register');
    if (response.statusCode === 200) {
      console.log('✅ PASS: GET /register returns 200');
      passed++;
    } else {
      console.log(`❌ FAIL: Expected 200, got ${response.statusCode}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ FAIL: ${error.message}`);
    failed++;
  }
  console.log('');

  // Test 2: POST /register with simplified format
  console.log('Test 2: POST /register with simplified format (name, url, grpc)');
  try {
    const registerData = {
      name: 'rag',
      url: 'https://ragmicroservice.up.railway.app',
      grpc: 50052
    };
    const response = await makeRequest('POST', '/register', registerData);
    if (response.statusCode === 201) {
      console.log('✅ PASS: POST /register returns 201');
      console.log(`   Response: ${JSON.stringify(response.body)}`);
      passed++;
    } else {
      console.log(`❌ FAIL: Expected 201, got ${response.statusCode}`);
      console.log(`   Response: ${JSON.stringify(response.body)}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ FAIL: ${error.message}`);
    failed++;
  }
  console.log('');

  // Test 3: POST /register with missing body should return 400
  console.log('Test 3: POST /register with missing body');
  try {
    const response = await makeRequest('POST', '/register', {});
    if (response.statusCode === 400) {
      console.log('✅ PASS: POST /register with missing body returns 400');
      passed++;
    } else {
      console.log(`❌ FAIL: Expected 400, got ${response.statusCode}`);
      console.log(`   Response: ${JSON.stringify(response.body)}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ FAIL: ${error.message}`);
    failed++;
  }
  console.log('');

  // Test 4: GET /health should show registeredServices > 0
  console.log('Test 4: GET /health after registration');
  try {
    // Wait a bit for metrics to update
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const response = await makeRequest('GET', '/health');
    if (response.statusCode === 200) {
      const registeredServices = response.body.registeredServices || 0;
      if (registeredServices > 0) {
        console.log(`✅ PASS: /health shows registeredServices = ${registeredServices}`);
        passed++;
      } else {
        console.log(`❌ FAIL: Expected registeredServices > 0, got ${registeredServices}`);
        failed++;
      }
    } else {
      console.log(`❌ FAIL: Expected 200, got ${response.statusCode}`);
      console.log(`   Response: ${JSON.stringify(response.body)}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ FAIL: ${error.message}`);
    failed++;
  }
  console.log('');

  // Summary
  console.log('='.repeat(50));
  console.log(`Tests Passed: ${passed}`);
  console.log(`Tests Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);
  console.log('='.repeat(50));

  if (failed === 0) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed');
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

