/**
 * Comprehensive AI Routing REST Test
 * 
 * This test:
 * 1. Checks what services are registered in production
 * 2. Registers mock services if needed
 * 3. Tests AI routing logic with different queries
 * 4. Verifies routing decisions are correct
 */

const request = require('supertest');

const RAILWAY_URL = process.env.RAILWAY_URL || 'https://coordinator-production-e0a0.up.railway.app';
const BASE_URL = RAILWAY_URL.replace(/\/$/, '');

// Mock service definitions
const mockServices = [
  {
    name: 'exercises-service',
    url: 'http://exercises-service:5000',
    grpc: false,
    description: 'Provides coding exercises and programming challenges',
    capabilities: ['coding', 'exercises', 'programming', 'javascript', 'python']
  },
  {
    name: 'payment-service',
    url: 'http://payment-service:5000',
    grpc: false,
    description: 'Handles payment processing and transactions',
    capabilities: ['payment', 'billing', 'transaction', 'checkout']
  },
  {
    name: 'user-service',
    url: 'http://user-service:5000',
    grpc: false,
    description: 'Manages user profiles and authentication',
    capabilities: ['user', 'profile', 'authentication', 'login']
  }
];

async function checkRegisteredServices() {
  console.log('\n=== Checking Registered Services ===\n');
  
  try {
    const response = await request(BASE_URL)
      .get('/services')
      .timeout(10000);
    
    if (response.status === 200) {
      const services = response.body.services || [];
      console.log(`Found ${services.length} registered services:\n`);
      
      services.forEach(service => {
        console.log(`  - ${service.serviceName} (${service.status})`);
        console.log(`    Endpoint: ${service.endpoint || 'N/A'}`);
        console.log(`    Version: ${service.version || 'N/A'}`);
        console.log('');
      });
      
      return services;
    } else {
      console.log(`Failed to get services: ${response.status}`);
      return [];
    }
  } catch (error) {
    console.log(`Error checking services: ${error.message}`);
    return [];
  }
}

async function registerMockService(service) {
  console.log(`\nRegistering ${service.name}...`);
  
  try {
    const response = await request(BASE_URL)
      .post('/register')
      .send(service)
      .timeout(10000);
    
    if (response.status === 200 || response.status === 201) {
      console.log(`✅ ${service.name} registered successfully`);
      if (response.body.serviceId) {
        return response.body.serviceId;
      }
    } else {
      console.log(`⚠️  ${service.name} registration returned status ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.body, null, 2)}`);
    }
  } catch (error) {
    console.log(`❌ Error registering ${service.name}: ${error.message}`);
  }
  
  return null;
}

async function testAIRouting(query, expectedService, description) {
  console.log(`\n[TEST] ${description}`);
  console.log(`Query: "${query}"`);
  console.log(`Expected: ${expectedService || 'any service'}`);
  
  try {
    const startTime = Date.now();
    const response = await request(BASE_URL)
      .post('/route')
      .send({
        query: query,
        routing: {
          strategy: 'single',
          priority: 'accuracy'
        }
      })
      .timeout(45000);
    
    const duration = Date.now() - startTime;
    
    console.log(`Status: ${response.status}`);
    console.log(`Duration: ${duration}ms`);
    
    if (response.status === 200 && response.body.routing) {
      const routing = response.body.routing;
      const primaryTarget = routing.primaryTarget;
      
      if (primaryTarget) {
        console.log(`✅ Routing successful!`);
        console.log(`   Target Service: ${primaryTarget.serviceName}`);
        console.log(`   Confidence: ${primaryTarget.confidence}`);
        console.log(`   Reasoning: ${primaryTarget.reasoning || 'N/A'}`);
        console.log(`   Method: ${routing.method || 'N/A'}`);
        console.log(`   Processing Time: ${routing.processingTime || 'N/A'}`);
        
        // Verify routing decision
        if (expectedService) {
          if (primaryTarget.serviceName === expectedService) {
            console.log(`   ✅ CORRECT: Routed to expected service (${expectedService})`);
          } else {
            console.log(`   ⚠️  MISMATCH: Expected ${expectedService}, got ${primaryTarget.serviceName}`);
          }
        }
        
        // Check confidence
        if (primaryTarget.confidence > 0.7) {
          console.log(`   ✅ High confidence (${primaryTarget.confidence})`);
        } else if (primaryTarget.confidence > 0.3) {
          console.log(`   ⚠️  Medium confidence (${primaryTarget.confidence})`);
        } else {
          console.log(`   ❌ Low confidence (${primaryTarget.confidence})`);
        }
      } else {
        console.log(`⚠️  No primary target found`);
        console.log(`   Available targets: ${routing.targetServices?.length || 0}`);
      }
    } else if (response.status === 404) {
      console.log(`⚠️  No services found for routing`);
      console.log(`   This means either:`);
      console.log(`   1. No services are registered`);
      console.log(`   2. No services match the query`);
    } else if (response.status === 502) {
      console.log(`⚠️  AI routing unavailable (may be using fallback)`);
    } else {
      console.log(`❌ Unexpected status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.body, null, 2)}`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function runComprehensiveTest() {
  console.log('='.repeat(60));
  console.log('AI Routing REST Protocol Test');
  console.log('='.repeat(60));
  console.log(`Target: ${BASE_URL}`);
  
  // Step 1: Check existing services
  const existingServices = await checkRegisteredServices();
  
  // Step 2: Register mock services if needed
  console.log('\n=== Registering Mock Services ===\n');
  const registeredServiceIds = [];
  
  for (const service of mockServices) {
    // Check if service already exists
    const exists = existingServices.some(s => s.serviceName === service.name);
    
    if (!exists) {
      const serviceId = await registerMockService(service);
      if (serviceId) {
        registeredServiceIds.push({ name: service.name, id: serviceId });
      }
    } else {
      console.log(`ℹ️  ${service.name} already registered, skipping`);
    }
  }
  
  // Wait a bit for services to be processed
  if (registeredServiceIds.length > 0) {
    console.log('\n⏳ Waiting 3 seconds for services to be processed...');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  // Step 3: Test AI Routing Logic
  console.log('\n' + '='.repeat(60));
  console.log('Testing AI Routing Logic');
  console.log('='.repeat(60));
  
  const routingTests = [
    {
      query: 'I need coding exercises',
      expectedService: 'exercises-service',
      description: 'Coding exercises query → exercises-service'
    },
    {
      query: 'process payment for order',
      expectedService: 'payment-service',
      description: 'Payment query → payment-service'
    },
    {
      query: 'get user profile information',
      expectedService: 'user-service',
      description: 'User profile query → user-service'
    },
    {
      query: 'create programming challenge',
      expectedService: 'exercises-service',
      description: 'Programming challenge → exercises-service'
    },
    {
      query: 'handle billing transaction',
      expectedService: 'payment-service',
      description: 'Billing transaction → payment-service'
    },
    {
      query: 'authenticate user login',
      expectedService: 'user-service',
      description: 'User authentication → user-service'
    }
  ];
  
  for (const test of routingTests) {
    await testAIRouting(test.query, test.expectedService, test.description);
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Step 4: Test edge cases
  console.log('\n' + '='.repeat(60));
  console.log('Testing Edge Cases');
  console.log('='.repeat(60));
  
  await testAIRouting('random query that does not match anything', null, 'Non-matching query');
  await testAIRouting('', null, 'Empty query');
  
  // Step 5: Summary
  console.log('\n' + '='.repeat(60));
  console.log('Test Summary');
  console.log('='.repeat(60));
  console.log(`\nRegistered Services: ${registeredServiceIds.length}`);
  console.log(`Routing Tests: ${routingTests.length}`);
  console.log(`Edge Cases: 2`);
  console.log('\n✅ AI Routing REST Protocol Test Complete!');
  
  // Cleanup note
  if (registeredServiceIds.length > 0) {
    console.log('\n⚠️  Note: Mock services were registered. You may want to clean them up manually.');
    console.log('   Services registered:');
    registeredServiceIds.forEach(s => {
      console.log(`     - ${s.name} (ID: ${s.id})`);
    });
  }
}

// Run the test
runComprehensiveTest().catch(error => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});

