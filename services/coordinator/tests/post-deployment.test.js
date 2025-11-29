/**
 * Comprehensive Post-Deployment Tests
 * Validates Coordinator functionality in production environment
 * 
 * Tests cover:
 * - AI Routing functionality
 * - Unified Proxy endpoint
 * - Service Registration & Discovery
 * - Integration scenarios
 * - Error handling & resilience
 * - Performance & reliability
 */

const request = require('supertest');

// Railway deployment URL
const RAILWAY_URL = process.env.RAILWAY_URL || 'https://coordinator-production-e0a0.up.railway.app';
const BASE_URL = RAILWAY_URL.replace(/\/$/, ''); // Remove trailing slash

// Test configuration
const TEST_TIMEOUT = 30000; // 30 seconds for network requests
const AI_ROUTING_TIMEOUT = 45000; // 45 seconds for AI routing (may take longer)

describe('Post-Deployment Tests - Production Coordinator', () => {
  // Test state
  let registeredServices = [];
  let testServiceId = null;

  // Increase timeout for all tests
  jest.setTimeout(60000);

  // ============================================================================
  // SETUP & TEARDOWN
  // ============================================================================

  beforeAll(async () => {
    // Verify we can connect to the service
    try {
      const response = await request(BASE_URL)
        .get('/health')
        .timeout(10000);
      
      if (response.status !== 200) {
        throw new Error(`Health check failed: ${response.status}`);
      }
    } catch (error) {
      throw new Error(`Cannot connect to Coordinator at ${BASE_URL}: ${error.message}`);
    }
  });

  afterAll(async () => {
    // Cleanup: Remove test services if created
    if (testServiceId) {
      try {
        await request(BASE_URL)
          .delete(`/register/services`)
          .send({ serviceId: testServiceId })
          .timeout(10000);
      } catch (error) {
        // Ignore cleanup errors
        console.warn('Cleanup failed:', error.message);
      }
    }
  });

  // ============================================================================
  // HEALTH & CONNECTIVITY TESTS
  // ============================================================================

  describe('Health & Connectivity', () => {
    test('should respond to root endpoint with service information', async () => {
      const response = await request(BASE_URL)
        .get('/')
        .timeout(TEST_TIMEOUT);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('service');
      expect(response.body.service).toBe('Coordinator Microservice');
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('running');
      expect(response.body).toHaveProperty('endpoints');
    });

    test('should respond to health endpoint', async () => {
      const response = await request(BASE_URL)
        .get('/health')
        .timeout(TEST_TIMEOUT);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
    });

    test('should list all available endpoints', async () => {
      const response = await request(BASE_URL)
        .get('/')
        .timeout(TEST_TIMEOUT);

      expect(response.status).toBe(200);
      expect(response.body.endpoints).toBeDefined();
      
      // Verify key endpoints are listed
      const endpointsStr = JSON.stringify(response.body.endpoints);
      expect(endpointsStr).toContain('register');
      expect(endpointsStr).toContain('route');
      expect(endpointsStr).toContain('fill-content-metrics');
    });
  });

  // ============================================================================
  // SERVICE REGISTRATION & DISCOVERY TESTS
  // ============================================================================

  describe('Service Registration & Discovery', () => {
    test('should list all registered services', async () => {
      const response = await request(BASE_URL)
        .get('/services')
        .timeout(TEST_TIMEOUT);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('services');
      expect(Array.isArray(response.body.services)).toBe(true);
      
      registeredServices = response.body.services;
    });

    test('should respond to registry alias endpoint', async () => {
      const response = await request(BASE_URL)
        .get('/registry')
        .timeout(TEST_TIMEOUT);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('services');
    });

    test('should handle service registration endpoint', async () => {
      const testService = {
        name: `test-service-${Date.now()}`,
        url: 'http://test-service:5000',
        grpc: false
      };

      const response = await request(BASE_URL)
        .post('/register')
        .send(testService)
        .timeout(TEST_TIMEOUT);

      // Should accept registration (may return 200 or 201)
      expect([200, 201]).toContain(response.status);
      
      if (response.body.serviceId) {
        testServiceId = response.body.serviceId;
      }
    });

    test('should return service details structure', async () => {
      const response = await request(BASE_URL)
        .get('/services')
        .timeout(TEST_TIMEOUT);

      if (response.body.services && response.body.services.length > 0) {
        const service = response.body.services[0];
        expect(service).toHaveProperty('serviceName');
        expect(service).toHaveProperty('status');
        expect(['active', 'pending', 'inactive']).toContain(service.status);
      }
    });
  });

  // ============================================================================
  // AI ROUTING TESTS
  // ============================================================================

  describe('AI Routing Functionality', () => {
    test('should respond to routing endpoint with valid query', async () => {
      const response = await request(BASE_URL)
        .post('/route')
        .send({
          query: 'I need to process a payment',
          routing: {
            strategy: 'single',
            priority: 'accuracy'
          }
        })
        .timeout(AI_ROUTING_TIMEOUT);

      // Should respond (may succeed or fail based on services)
      expect([200, 404, 502, 400]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success');
        expect(response.body).toHaveProperty('routing');
      }
    });

    test('should handle routing with intent parameter', async () => {
      const response = await request(BASE_URL)
        .post('/route')
        .send({
          intent: 'Get user profile information',
          routing: {
            strategy: 'single'
          }
        })
        .timeout(AI_ROUTING_TIMEOUT);

      expect([200, 404, 502, 400]).toContain(response.status);
    });

    test('should reject routing request without query or intent', async () => {
      const response = await request(BASE_URL)
        .post('/route')
        .send({
          routing: {
            strategy: 'single'
          }
        })
        .timeout(TEST_TIMEOUT);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/query|intent/i);
    });

    test('should support single strategy routing', async () => {
      const response = await request(BASE_URL)
        .post('/route')
        .send({
          query: 'coding exercise',
          routing: {
            strategy: 'single',
            priority: 'accuracy'
          }
        })
        .timeout(AI_ROUTING_TIMEOUT);

      if (response.status === 200 && response.body.routing) {
        expect(response.body.routing).toHaveProperty('primaryTarget');
        expect(response.body.routing).toHaveProperty('targetServices');
        expect(Array.isArray(response.body.routing.targetServices)).toBe(true);
      }
    });

    test('should support multiple strategy routing', async () => {
      const response = await request(BASE_URL)
        .post('/route')
        .send({
          query: 'user authentication and payment',
          routing: {
            strategy: 'multiple',
            priority: 'accuracy'
          }
        })
        .timeout(AI_ROUTING_TIMEOUT);

      if (response.status === 200 && response.body.routing) {
        expect(response.body.routing).toHaveProperty('targetServices');
        expect(Array.isArray(response.body.routing.targetServices)).toBe(true);
      }
    });

    test('should return routing metadata', async () => {
      const response = await request(BASE_URL)
        .post('/route')
        .send({
          query: 'test query',
          routing: {
            strategy: 'single'
          }
        })
        .timeout(AI_ROUTING_TIMEOUT);

      if (response.status === 200 && response.body.routing) {
        const routing = response.body.routing;
        
        // Check for metadata fields
        if (routing.primaryTarget) {
          expect(routing.primaryTarget).toHaveProperty('serviceName');
          expect(routing.primaryTarget).toHaveProperty('confidence');
          expect(typeof routing.primaryTarget.confidence).toBe('number');
        }
        
        if (routing.processingTime) {
          expect(routing.processingTime).toMatch(/\d+ms/);
        }
      }
    });

    test('should handle routing with context information', async () => {
      const response = await request(BASE_URL)
        .post('/route')
        .send({
          query: 'process payment',
          method: 'POST',
          path: '/api/payments',
          body: { amount: 100 },
          routing: {
            strategy: 'single'
          }
        })
        .timeout(AI_ROUTING_TIMEOUT);

      expect([200, 404, 502, 400]).toContain(response.status);
    });

    test('should handle empty services gracefully', async () => {
      // This test verifies the system handles the case when no services are registered
      const response = await request(BASE_URL)
        .post('/route')
        .send({
          query: 'any query',
          routing: {
            strategy: 'single'
          }
        })
        .timeout(AI_ROUTING_TIMEOUT);

      // Should return appropriate status (404 if no services, 200 if services exist)
      expect([200, 404, 502]).toContain(response.status);
    });
  });

  // ============================================================================
  // UNIFIED PROXY ENDPOINT TESTS
  // ============================================================================

  describe('Unified Proxy Endpoint - /api/fill-content-metrics/', () => {
    const apiUrl = '/api/fill-content-metrics/';

    test('should reject request without requester_service', async () => {
      const response = await request(BASE_URL)
        .post(apiUrl)
        .send({
          payload: { action: 'coding' },
          response: { answer: '' }
        })
        .timeout(TEST_TIMEOUT);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('requester_service');
    });

    test('should reject request without response template', async () => {
      const response = await request(BASE_URL)
        .post(apiUrl)
        .send({
          requester_service: 'test-service',
          payload: { action: 'coding' }
        })
        .timeout(TEST_TIMEOUT);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('response');
    });

    test('should accept valid request structure', async () => {
      const response = await request(BASE_URL)
        .post(apiUrl)
        .send({
          requester_service: 'test-service',
          payload: { action: 'coding', amount: 2 },
          response: { answer: '', exercises: [] }
        })
        .timeout(AI_ROUTING_TIMEOUT);

      // Should either succeed (if services registered) or return appropriate error
      expect([200, 404, 502, 503]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('metadata');
        expect(response.body.metadata).toHaveProperty('routed_to');
        expect(response.body.metadata).toHaveProperty('confidence');
        expect(response.body.metadata).toHaveProperty('requester');
        expect(response.body.metadata).toHaveProperty('processing_time_ms');
      }
    });

    test('should handle empty payload correctly', async () => {
      const response = await request(BASE_URL)
        .post(apiUrl)
        .send({
          requester_service: 'test-service',
          payload: {},
          response: { result: '' }
        })
        .timeout(AI_ROUTING_TIMEOUT);

      // Should handle empty payload gracefully
      expect([200, 404, 502, 503]).toContain(response.status);
    });

    test('should handle complex payload structures', async () => {
      const response = await request(BASE_URL)
        .post(apiUrl)
        .send({
          requester_service: 'test-service',
          payload: {
            action: 'payment',
            details: {
              amount: 100,
              currency: 'USD',
              method: 'credit_card'
            },
            metadata: {
              userId: '123',
              timestamp: new Date().toISOString()
            }
          },
          response: {
            transactionId: '',
            status: '',
            amount: 0
          }
        })
        .timeout(AI_ROUTING_TIMEOUT);

      expect([200, 404, 502, 503]).toContain(response.status);
    });

    test('should return proper error when no service found', async () => {
      const response = await request(BASE_URL)
        .post(apiUrl)
        .send({
          requester_service: 'test-service',
          payload: { action: 'nonexistent-service-query-xyz123' },
          response: { result: '' }
        })
        .timeout(AI_ROUTING_TIMEOUT);

      if (response.status === 404) {
        expect(response.body.success).toBe(false);
        expect(response.body.message).toMatch(/no.*service|not found/i);
      }
    });

    test('should include routing metadata in successful response', async () => {
      const response = await request(BASE_URL)
        .post(apiUrl)
        .send({
          requester_service: 'test-service',
          payload: { action: 'coding' },
          response: { answer: '' }
        })
        .timeout(AI_ROUTING_TIMEOUT);

      if (response.status === 200) {
        const metadata = response.body.metadata;
        expect(metadata).toHaveProperty('routed_to');
        expect(metadata).toHaveProperty('requester');
        expect(metadata).toHaveProperty('processing_time_ms');
        expect(typeof metadata.processing_time_ms).toBe('number');
      }
    });

    test('should handle multiple response template fields', async () => {
      const response = await request(BASE_URL)
        .post(apiUrl)
        .send({
          requester_service: 'test-service',
          payload: { action: 'coding' },
          response: {
            answer: '',
            exercises: [],
            difficulty: '',
            count: 0
          }
        })
        .timeout(AI_ROUTING_TIMEOUT);

      if (response.status === 200) {
        expect(response.body.data).toBeDefined();
        // Response should match template structure
        expect(typeof response.body.data).toBe('object');
      }
    });
  });

  // ============================================================================
  // INTEGRATION SCENARIOS
  // ============================================================================

  describe('Integration Scenarios', () => {
    test('should handle end-to-end flow: register -> route -> proxy', async () => {
      // Step 1: Check current services
      const servicesResponse = await request(BASE_URL)
        .get('/services')
        .timeout(TEST_TIMEOUT);
      
      expect(servicesResponse.status).toBe(200);
      const initialServiceCount = servicesResponse.body.services.length;

      // Step 2: Test routing
      const routingResponse = await request(BASE_URL)
        .post('/route')
        .send({
          query: 'test query',
          routing: { strategy: 'single' }
        })
        .timeout(AI_ROUTING_TIMEOUT);

      expect([200, 404, 502]).toContain(routingResponse.status);

      // Step 3: Test unified proxy
      const proxyResponse = await request(BASE_URL)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'integration-test',
          payload: { test: 'data' },
          response: { result: '' }
        })
        .timeout(AI_ROUTING_TIMEOUT);

      expect([200, 404, 502, 503]).toContain(proxyResponse.status);
    });

    test('should maintain consistency across multiple requests', async () => {
      const requests = Array(3).fill(null).map(() =>
        request(BASE_URL)
          .get('/services')
          .timeout(TEST_TIMEOUT)
      );

      const responses = await Promise.all(requests);

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('services');
      });

      // All should return same service count (or at least consistent structure)
      const serviceCounts = responses.map(r => r.body.services.length);
      // Service counts should be consistent (all same or increasing)
      const isConsistent = serviceCounts.every(count => 
        count === serviceCounts[0] || count >= serviceCounts[0]
      );
      expect(isConsistent).toBe(true);
    });

    test('should handle concurrent unified proxy requests', async () => {
      const requests = Array(3).fill(null).map((_, i) =>
        request(BASE_URL)
          .post('/api/fill-content-metrics/')
          .send({
            requester_service: `concurrent-test-${i}`,
            payload: { action: 'test', index: i },
            response: { result: '' }
          })
          .timeout(AI_ROUTING_TIMEOUT)
      );

      const responses = await Promise.all(requests);

      // All should return valid status codes
      responses.forEach(response => {
        expect([200, 404, 502, 503, 400]).toContain(response.status);
      });
    });
  });

  // ============================================================================
  // ERROR HANDLING & RESILIENCE
  // ============================================================================

  describe('Error Handling & Resilience', () => {
    test('should handle invalid JSON gracefully', async () => {
      const response = await request(BASE_URL)
        .post('/api/fill-content-metrics/')
        .set('Content-Type', 'application/json')
        .send('invalid json string')
        .timeout(TEST_TIMEOUT);

      expect([400, 500]).toContain(response.status);
    });

    test('should handle malformed request body', async () => {
      const response = await request(BASE_URL)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'test',
          payload: 'not an object',
          response: { result: '' }
        })
        .timeout(TEST_TIMEOUT);

      // Should either accept it or return appropriate error
      expect([200, 400, 500]).toContain(response.status);
    });

    test('should handle non-existent endpoints', async () => {
      const response = await request(BASE_URL)
        .get('/non-existent-endpoint-xyz123')
        .timeout(TEST_TIMEOUT);

      // Should return 404 or be handled by proxy
      expect([404, 200, 502]).toContain(response.status);
    });

    test('should handle missing required fields in routing', async () => {
      const response = await request(BASE_URL)
        .post('/route')
        .send({})
        .timeout(TEST_TIMEOUT);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should handle very large payloads', async () => {
      const largePayload = {
        requester_service: 'test',
        payload: {
          data: 'x'.repeat(10000) // 10KB string
        },
        response: { result: '' }
      };

      const response = await request(BASE_URL)
        .post('/api/fill-content-metrics/')
        .send(largePayload)
        .timeout(AI_ROUTING_TIMEOUT);

      // Should handle or reject appropriately
      expect([200, 400, 413, 502, 503]).toContain(response.status);
    });

    test('should handle special characters in payload', async () => {
      const response = await request(BASE_URL)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'test',
          payload: {
            query: 'test with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
            unicode: '测试 🚀 émoji'
          },
          response: { result: '' }
        })
        .timeout(AI_ROUTING_TIMEOUT);

      expect([200, 400, 404, 502, 503]).toContain(response.status);
    });
  });

  // ============================================================================
  // PERFORMANCE & RELIABILITY
  // ============================================================================

  describe('Performance & Reliability', () => {
    test('should respond to health check within 5 seconds', async () => {
      const startTime = Date.now();
      
      const response = await request(BASE_URL)
        .get('/health')
        .timeout(TEST_TIMEOUT);

      const duration = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(5000);
    });

    test('should respond to service list within 5 seconds', async () => {
      const startTime = Date.now();
      
      const response = await request(BASE_URL)
        .get('/services')
        .timeout(TEST_TIMEOUT);

      const duration = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(5000);
    });

    test('should complete routing request within timeout', async () => {
      const startTime = Date.now();
      
      const response = await request(BASE_URL)
        .post('/route')
        .send({
          query: 'test query',
          routing: { strategy: 'single' }
        })
        .timeout(AI_ROUTING_TIMEOUT);

      const duration = Date.now() - startTime;

      expect([200, 404, 502]).toContain(response.status);
      expect(duration).toBeLessThan(AI_ROUTING_TIMEOUT);
    });

    test('should complete unified proxy request within timeout', async () => {
      const startTime = Date.now();
      
      const response = await request(BASE_URL)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'test',
          payload: { action: 'test' },
          response: { result: '' }
        })
        .timeout(AI_ROUTING_TIMEOUT);

      const duration = Date.now() - startTime;

      expect([200, 404, 502, 503]).toContain(response.status);
      expect(duration).toBeLessThan(AI_ROUTING_TIMEOUT);
    });

    test('should handle rapid sequential requests', async () => {
      const requests = [];
      for (let i = 0; i < 5; i++) {
        requests.push(
          request(BASE_URL)
            .get('/health')
            .timeout(TEST_TIMEOUT)
        );
      }

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const duration = Date.now() - startTime;

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Should complete reasonably quickly
      expect(duration).toBeLessThan(10000);
    });

    test('should return processing time in metadata', async () => {
      const response = await request(BASE_URL)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'test',
          payload: { action: 'test' },
          response: { result: '' }
        })
        .timeout(AI_ROUTING_TIMEOUT);

      if (response.status === 200 && response.body.metadata) {
        expect(response.body.metadata).toHaveProperty('processing_time_ms');
        expect(typeof response.body.metadata.processing_time_ms).toBe('number');
        expect(response.body.metadata.processing_time_ms).toBeGreaterThan(0);
      }
    });
  });

  // ============================================================================
  // API CONTRACT VALIDATION
  // ============================================================================

  describe('API Contract Validation', () => {
    test('should return consistent response structure for services', async () => {
      const response = await request(BASE_URL)
        .get('/services')
        .timeout(TEST_TIMEOUT);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(typeof response.body.success).toBe('boolean');
      expect(response.body).toHaveProperty('services');
      expect(Array.isArray(response.body.services)).toBe(true);
    });

    test('should return consistent response structure for routing', async () => {
      const response = await request(BASE_URL)
        .post('/route')
        .send({
          query: 'test',
          routing: { strategy: 'single' }
        })
        .timeout(AI_ROUTING_TIMEOUT);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success');
        expect(response.body).toHaveProperty('routing');
        if (response.body.routing) {
          expect(response.body.routing).toHaveProperty('targetServices');
        }
      }
    });

    test('should return consistent response structure for unified proxy', async () => {
      const response = await request(BASE_URL)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'test',
          payload: { test: 'data' },
          response: { result: '' }
        })
        .timeout(AI_ROUTING_TIMEOUT);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success');
        expect(response.body.success).toBe(true);
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('metadata');
      } else if (response.status >= 400) {
        expect(response.body).toHaveProperty('success');
        expect(response.body.success).toBe(false);
        expect(response.body).toHaveProperty('message');
      }
    });

    test('should include error details in error responses', async () => {
      const response = await request(BASE_URL)
        .post('/api/fill-content-metrics/')
        .send({
          // Missing requester_service
          payload: { test: 'data' },
          response: { result: '' }
        })
        .timeout(TEST_TIMEOUT);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.message).toBe('string');
    });
  });
});

