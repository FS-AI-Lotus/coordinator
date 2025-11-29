/**
 * Quick test script for AI Routing REST endpoint
 */

const request = require('supertest');

const RAILWAY_URL = process.env.RAILWAY_URL || 'https://coordinator-production-e0a0.up.railway.app';
const BASE_URL = RAILWAY_URL.replace(/\/$/, '');

async function testAIRouting() {
  console.log('Testing AI Routing REST Endpoint...\n');
  console.log(`Target: ${BASE_URL}/route\n`);

  const tests = [
    {
      name: 'Basic routing with query',
      request: {
        query: 'process payment',
        routing: { strategy: 'single', priority: 'accuracy' }
      }
    },
    {
      name: 'Routing with intent parameter',
      request: {
        intent: 'Get user profile information',
        routing: { strategy: 'single' }
      }
    },
    {
      name: 'Multiple strategy routing',
      request: {
        query: 'user authentication and payment',
        routing: { strategy: 'multiple', priority: 'accuracy' }
      }
    },
    {
      name: 'Routing with context',
      request: {
        query: 'process payment',
        method: 'POST',
        path: '/api/payments',
        body: { amount: 100 },
        routing: { strategy: 'single' }
      }
    },
    {
      name: 'Invalid request (no query)',
      request: {
        routing: { strategy: 'single' }
      },
      expectError: true
    }
  ];

  for (const test of tests) {
    try {
      console.log(`\n[TEST] ${test.name}`);
      console.log('Request:', JSON.stringify(test.request, null, 2));
      
      const startTime = Date.now();
      const response = await request(BASE_URL)
        .post('/route')
        .send(test.request)
        .timeout(45000);
      
      const duration = Date.now() - startTime;

      console.log(`Status: ${response.status}`);
      console.log(`Duration: ${duration}ms`);

      if (test.expectError) {
        if (response.status === 400) {
          console.log('✅ Expected error received');
        } else {
          console.log('⚠️  Unexpected status for error test');
        }
      } else {
        if (response.status === 200) {
          console.log('✅ Success!');
          if (response.body.routing) {
            console.log(`   Primary Target: ${response.body.routing.primaryTarget?.serviceName || 'N/A'}`);
            console.log(`   Confidence: ${response.body.routing.primaryTarget?.confidence || 'N/A'}`);
            console.log(`   Total Candidates: ${response.body.routing.totalCandidates || 0}`);
            console.log(`   Method: ${response.body.routing.method || 'N/A'}`);
            console.log(`   Processing Time: ${response.body.routing.processingTime || 'N/A'}`);
          }
        } else if (response.status === 404) {
          console.log('⚠️  No services found (expected if no services registered)');
        } else if (response.status === 502) {
          console.log('⚠️  AI routing unavailable (fallback may be enabled)');
        } else {
          console.log(`⚠️  Unexpected status: ${response.status}`);
          console.log('Response:', JSON.stringify(response.body, null, 2));
        }
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  console.log('\n\n=== Testing GET /route ===\n');
  
  try {
    console.log('[TEST] GET /route?q=test query');
    const response = await request(BASE_URL)
      .get('/route')
      .query({ q: 'test query' })
      .timeout(45000);
    
    console.log(`Status: ${response.status}`);
    if (response.status === 200) {
      console.log('✅ Success!');
      if (response.body.routing) {
        console.log(`   Primary Target: ${response.body.routing.primaryTarget?.serviceName || 'N/A'}`);
      }
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  console.log('\n\n=== Test Summary ===');
  console.log('All AI Routing REST tests completed!');
}

testAIRouting().catch(console.error);

