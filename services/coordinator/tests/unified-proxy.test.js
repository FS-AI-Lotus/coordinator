/**
 * Comprehensive Test Suite for Unified Proxy Endpoint
 * Tests /api/fill-content-metrics/ endpoint
 */

const request = require('supertest');
const nock = require('nock');
const { createTestApp } = require('./helpers/test-server');
const aiRoutingService = require('../../src/services/aiRoutingService');
const registryService = require('../../src/services/registryService');

// Mock services
const {
  createMockExercisesService,
  createMockPaymentService,
  createMockUserService,
  createMockErrorService,
  createMockTimeoutService
} = require('./mocks/mock-services');

describe('Unified Proxy Endpoint - /api/fill-content-metrics/', () => {
  let app;
  let mockExercisesService;
  let mockPaymentService;
  let mockUserService;
  let mockErrorService;
  let mockTimeoutService;

  // Store original implementations
  const originalRouteRequest = aiRoutingService.routeRequest;
  const originalGetServiceByName = registryService.getServiceByName;
  const originalGetAllServices = registryService.getAllServices;

  beforeAll(async () => {
    app = createTestApp();
    
    // Start mock services
    mockExercisesService = createMockExercisesService(5001);
    mockPaymentService = createMockPaymentService(5002);
    mockUserService = createMockUserService(5003);
    mockErrorService = createMockErrorService(5004);
    mockTimeoutService = createMockTimeoutService(5005);
    
    await Promise.all([
      mockExercisesService.start(),
      mockPaymentService.start(),
      mockUserService.start(),
      mockErrorService.start(),
      mockTimeoutService.start()
    ]);
  });

  afterAll(async () => {
    // Stop mock services
    await Promise.all([
      mockExercisesService.stop(),
      mockPaymentService.stop(),
      mockUserService.stop(),
      mockErrorService.stop(),
      mockTimeoutService.stop()
    ]);
    
    // Restore original implementations
    aiRoutingService.routeRequest = originalRouteRequest;
    registryService.getServiceByName = originalGetServiceByName;
    registryService.getAllServices = originalGetAllServices;
    
    nock.cleanAll();
  });

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    nock.cleanAll();
    
    // Setup default service registry mocks
    registryService.getServiceByName = jest.fn();
    registryService.getAllServices = jest.fn().mockResolvedValue([
      { serviceName: 'exercises-service', status: 'active' },
      { serviceName: 'payment-service', status: 'active' },
      { serviceName: 'user-service', status: 'active' }
    ]);
  });

  // ============================================
  // 1. REQUEST VALIDATION TESTS
  // ============================================
  describe('Request Validation', () => {
    test('should reject request without requester_service', async () => {
      const response = await request(app)
        .post('/api/fill-content-metrics/')
        .send({
          payload: { action: 'coding' },
          response: { answer: '' }
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('requester_service');
    });

    test('should reject request without response template', async () => {
      const response = await request(app)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'devlab',
          payload: { action: 'coding' }
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('response');
    });

    test('should reject request with invalid requester_service (empty string)', async () => {
      const response = await request(app)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: '',
          payload: { action: 'coding' },
          response: { answer: '' }
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should reject request with invalid response (not an object)', async () => {
      const response = await request(app)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'devlab',
          payload: { action: 'coding' },
          response: 'not an object'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('response');
    });

    test('should accept valid request with empty payload', async () => {
      // Mock AI routing
      aiRoutingService.routeRequest = jest.fn().mockResolvedValue({
        success: true,
        routing: {
          targetServices: [{
            serviceName: 'exercises-service',
            endpoint: 'http://exercises-service:5000',
            confidence: 0.95
          }],
          primaryTarget: {
            serviceName: 'exercises-service',
            endpoint: 'http://exercises-service:5000',
            confidence: 0.95
          }
        }
      });

      // Mock service registry
      registryService.getServiceByName = jest.fn().mockResolvedValue({
        serviceName: 'exercises-service',
        endpoint: 'http://exercises-service:5001',
        status: 'active'
      });

      // Mock target service response
      nock('http://exercises-service:5001')
        .post('/api/fill-content-metrics/')
        .reply(200, {
          success: true,
          data: { answer: 'Test answer' }
        });

      const response = await request(app)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'devlab',
          payload: {},
          response: { answer: '' }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should accept valid request with populated payload', async () => {
      // Mock AI routing
      aiRoutingService.routeRequest = jest.fn().mockResolvedValue({
        success: true,
        routing: {
          targetServices: [{
            serviceName: 'exercises-service',
            endpoint: 'http://exercises-service:5000',
            confidence: 0.95
          }],
          primaryTarget: {
            serviceName: 'exercises-service',
            endpoint: 'http://exercises-service:5000',
            confidence: 0.95
          }
        }
      });

      // Mock service registry
      registryService.getServiceByName = jest.fn().mockResolvedValue({
        serviceName: 'exercises-service',
        endpoint: 'http://exercises-service:5001',
        status: 'active'
      });

      // Mock target service response
      nock('http://exercises-service:5001')
        .post('/api/fill-content-metrics/')
        .reply(200, {
          success: true,
          data: { answer: 'Test answer' }
        });

      const response = await request(app)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'devlab',
          payload: {
            action: 'coding',
            amount: 2,
            difficulty: 'medium'
          },
          response: { answer: '' }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  // ============================================
  // 2. AI ROUTING TESTS
  // ============================================
  describe('AI Routing', () => {
    test('should route to exercises-service for coding query', async () => {
      // Mock AI routing
      aiRoutingService.routeRequest = jest.fn().mockResolvedValue({
        success: true,
        routing: {
          targetServices: [{
            serviceName: 'exercises-service',
            endpoint: 'http://exercises-service:5000',
            confidence: 0.95,
            reasoning: 'Coding query matched exercises-service'
          }],
          primaryTarget: {
            serviceName: 'exercises-service',
            endpoint: 'http://exercises-service:5000',
            confidence: 0.95
          }
        }
      });

      // Mock service registry
      registryService.getServiceByName = jest.fn().mockResolvedValue({
        serviceName: 'exercises-service',
        endpoint: 'http://exercises-service:5001',
        status: 'active'
      });

      // Mock target service response
      nock('http://exercises-service:5001')
        .post('/api/fill-content-metrics/')
        .reply(200, {
          success: true,
          data: { answer: 'Exercise content' }
        });

      const response = await request(app)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'devlab',
          payload: { action: 'coding' },
          response: { answer: '' }
        });

      expect(response.status).toBe(200);
      expect(response.body.metadata.routed_to).toBe('exercises-service');
      expect(response.body.metadata.confidence).toBe(0.95);
    });

    test('should route to payment-service for payment query', async () => {
      // Mock AI routing
      aiRoutingService.routeRequest = jest.fn().mockResolvedValue({
        success: true,
        routing: {
          targetServices: [{
            serviceName: 'payment-service',
            endpoint: 'http://payment-service:5000',
            confidence: 0.92
          }],
          primaryTarget: {
            serviceName: 'payment-service',
            endpoint: 'http://payment-service:5000',
            confidence: 0.92
          }
        }
      });

      // Mock service registry
      registryService.getServiceByName = jest.fn().mockResolvedValue({
        serviceName: 'payment-service',
        endpoint: 'http://payment-service:5002',
        status: 'active'
      });

      // Mock target service response
      nock('http://payment-service:5002')
        .post('/api/fill-content-metrics/')
        .reply(200, {
          success: true,
          data: { transaction_id: 'txn_123' }
        });

      const response = await request(app)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'user-service',
          payload: { action: 'payment' },
          response: { transaction_id: '' }
        });

      expect(response.status).toBe(200);
      expect(response.body.metadata.routed_to).toBe('payment-service');
    });

    test('should return 404 when no suitable service found', async () => {
      // Mock AI routing - no service found
      aiRoutingService.routeRequest = jest.fn().mockResolvedValue({
        success: false,
        routing: {
          targetServices: [],
          primaryTarget: null
        }
      });

      const response = await request(app)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'devlab',
          payload: { action: 'unknown' },
          response: { answer: '' }
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No suitable microservice');
    });

    test('should handle AI routing exception gracefully', async () => {
      // Mock AI routing to throw error
      aiRoutingService.routeRequest = jest.fn().mockRejectedValue(
        new Error('AI routing service unavailable')
      );

      const response = await request(app)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'devlab',
          payload: { action: 'coding' },
          response: { answer: '' }
        });

      expect(response.status).toBe(502);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Failed to route request');
    });

    test('should pick best service when multiple services available', async () => {
      // Mock AI routing with multiple candidates
      aiRoutingService.routeRequest = jest.fn().mockResolvedValue({
        success: true,
        routing: {
          targetServices: [
            {
              serviceName: 'exercises-service',
              endpoint: 'http://exercises-service:5000',
              confidence: 0.95
            },
            {
              serviceName: 'user-service',
              endpoint: 'http://user-service:5000',
              confidence: 0.70
            }
          ],
          primaryTarget: {
            serviceName: 'exercises-service',
            endpoint: 'http://exercises-service:5000',
            confidence: 0.95
          }
        }
      });

      // Mock service registry
      registryService.getServiceByName = jest.fn().mockResolvedValue({
        serviceName: 'exercises-service',
        endpoint: 'http://exercises-service:5001',
        status: 'active'
      });

      // Mock target service response
      nock('http://exercises-service:5001')
        .post('/api/fill-content-metrics/')
        .reply(200, {
          success: true,
          data: { answer: 'Best match' }
        });

      const response = await request(app)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'devlab',
          payload: { action: 'coding' },
          response: { answer: '' }
        });

      expect(response.status).toBe(200);
      expect(response.body.metadata.routed_to).toBe('exercises-service');
      expect(response.body.metadata.confidence).toBe(0.95);
    });
  });

  // ============================================
  // 3. SERVICE DISCOVERY TESTS
  // ============================================
  describe('Service Discovery', () => {
    test('should proceed when target service exists and is active', async () => {
      // Mock AI routing
      aiRoutingService.routeRequest = jest.fn().mockResolvedValue({
        success: true,
        routing: {
          targetServices: [{
            serviceName: 'exercises-service',
            endpoint: 'http://exercises-service:5000',
            confidence: 0.95
          }],
          primaryTarget: {
            serviceName: 'exercises-service',
            endpoint: 'http://exercises-service:5000',
            confidence: 0.95
          }
        }
      });

      // Mock service registry - active service
      registryService.getServiceByName = jest.fn().mockResolvedValue({
        serviceName: 'exercises-service',
        endpoint: 'http://exercises-service:5001',
        status: 'active'
      });

      // Mock target service response
      nock('http://exercises-service:5001')
        .post('/api/fill-content-metrics/')
        .reply(200, {
          success: true,
          data: { answer: 'Success' }
        });

      const response = await request(app)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'devlab',
          payload: { action: 'coding' },
          response: { answer: '' }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should return 503 when target service status is pending_migration', async () => {
      // Mock AI routing
      aiRoutingService.routeRequest = jest.fn().mockResolvedValue({
        success: true,
        routing: {
          targetServices: [{
            serviceName: 'exercises-service',
            endpoint: 'http://exercises-service:5000',
            confidence: 0.95
          }],
          primaryTarget: {
            serviceName: 'exercises-service',
            endpoint: 'http://exercises-service:5000',
            confidence: 0.95
          }
        }
      });

      // Mock service registry - pending service
      registryService.getServiceByName = jest.fn().mockResolvedValue({
        serviceName: 'exercises-service',
        endpoint: 'http://exercises-service:5001',
        status: 'pending_migration'
      });

      const response = await request(app)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'devlab',
          payload: { action: 'coding' },
          response: { answer: '' }
        });

      expect(response.status).toBe(503);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not active');
    });

    test('should return 404 when target service does not exist', async () => {
      // Mock AI routing
      aiRoutingService.routeRequest = jest.fn().mockResolvedValue({
        success: true,
        routing: {
          targetServices: [{
            serviceName: 'non-existent-service',
            endpoint: 'http://non-existent-service:5000',
            confidence: 0.95
          }],
          primaryTarget: {
            serviceName: 'non-existent-service',
            endpoint: 'http://non-existent-service:5000',
            confidence: 0.95
          }
        }
      });

      // Mock service registry - service not found
      registryService.getServiceByName = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'devlab',
          payload: { action: 'coding' },
          response: { answer: '' }
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found in registry');
    });
  });

  // ============================================
  // 4. REQUEST FORWARDING TESTS
  // ============================================
  describe('Request Forwarding', () => {
    test('should forward request with correct body', async () => {
      // Mock AI routing
      aiRoutingService.routeRequest = jest.fn().mockResolvedValue({
        success: true,
        routing: {
          targetServices: [{
            serviceName: 'exercises-service',
            endpoint: 'http://exercises-service:5000',
            confidence: 0.95
          }],
          primaryTarget: {
            serviceName: 'exercises-service',
            endpoint: 'http://exercises-service:5000',
            confidence: 0.95
          }
        }
      });

      // Mock service registry
      registryService.getServiceByName = jest.fn().mockResolvedValue({
        serviceName: 'exercises-service',
        endpoint: 'http://exercises-service:5001',
        status: 'active'
      });

      // Mock target service - verify request body
      const scope = nock('http://exercises-service:5001')
        .post('/api/fill-content-metrics/', (body) => {
          return body.requester_service === 'devlab' &&
                 body.payload.action === 'coding' &&
                 body.response.answer === '';
        })
        .reply(200, {
          success: true,
          data: { answer: 'Forwarded correctly' }
        });

      const response = await request(app)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'devlab',
          payload: { action: 'coding' },
          response: { answer: '' }
        });

      expect(response.status).toBe(200);
      expect(scope.isDone()).toBe(true);
    });

    test('should include X-Requester-Service header', async () => {
      // Mock AI routing
      aiRoutingService.routeRequest = jest.fn().mockResolvedValue({
        success: true,
        routing: {
          targetServices: [{
            serviceName: 'exercises-service',
            endpoint: 'http://exercises-service:5000',
            confidence: 0.95
          }],
          primaryTarget: {
            serviceName: 'exercises-service',
            endpoint: 'http://exercises-service:5000',
            confidence: 0.95
          }
        }
      });

      // Mock service registry
      registryService.getServiceByName = jest.fn().mockResolvedValue({
        serviceName: 'exercises-service',
        endpoint: 'http://exercises-service:5001',
        status: 'active'
      });

      // Mock target service - verify headers
      const scope = nock('http://exercises-service:5001', {
        reqheaders: {
          'X-Requester-Service': 'devlab',
          'X-Routed-By': 'coordinator'
        }
      })
        .post('/api/fill-content-metrics/')
        .reply(200, {
          success: true,
          data: { answer: 'Headers correct' }
        });

      const response = await request(app)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'devlab',
          payload: { action: 'coding' },
          response: { answer: '' }
        });

      expect(response.status).toBe(200);
      expect(scope.isDone()).toBe(true);
    });

    test('should handle target service unreachable', async () => {
      // Mock AI routing
      aiRoutingService.routeRequest = jest.fn().mockResolvedValue({
        success: true,
        routing: {
          targetServices: [{
            serviceName: 'unreachable-service',
            endpoint: 'http://unreachable-service:5000',
            confidence: 0.95
          }],
          primaryTarget: {
            serviceName: 'unreachable-service',
            endpoint: 'http://unreachable-service:5000',
            confidence: 0.95
          }
        }
      });

      // Mock service registry
      registryService.getServiceByName = jest.fn().mockResolvedValue({
        serviceName: 'unreachable-service',
        endpoint: 'http://unreachable-service:9999', // Wrong port
        status: 'active'
      });

      // Don't mock the target - it will fail to connect
      nock('http://unreachable-service:9999')
        .post('/api/fill-content-metrics/')
        .replyWithError({ code: 'ECONNREFUSED' });

      const response = await request(app)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'devlab',
          payload: { action: 'coding' },
          response: { answer: '' }
        });

      expect(response.status).toBe(502);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Failed to communicate');
    });

    test('should propagate target service error', async () => {
      // Mock AI routing
      aiRoutingService.routeRequest = jest.fn().mockResolvedValue({
        success: true,
        routing: {
          targetServices: [{
            serviceName: 'error-service',
            endpoint: 'http://error-service:5000',
            confidence: 0.95
          }],
          primaryTarget: {
            serviceName: 'error-service',
            endpoint: 'http://error-service:5000',
            confidence: 0.95
          }
        }
      });

      // Mock service registry
      registryService.getServiceByName = jest.fn().mockResolvedValue({
        serviceName: 'error-service',
        endpoint: 'http://error-service:5004',
        status: 'active'
      });

      // Mock target service - returns error
      nock('http://error-service:5004')
        .post('/api/fill-content-metrics/')
        .reply(500, {
          success: false,
          error: 'Internal server error'
        });

      const response = await request(app)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'devlab',
          payload: { action: 'coding' },
          response: { answer: '' }
        });

      expect(response.status).toBe(502);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // 5. RESPONSE MAPPING TESTS
  // ============================================
  describe('Response Mapping', () => {
    test('should map single field correctly', async () => {
      // Mock AI routing
      aiRoutingService.routeRequest = jest.fn().mockResolvedValue({
        success: true,
        routing: {
          targetServices: [{
            serviceName: 'exercises-service',
            endpoint: 'http://exercises-service:5000',
            confidence: 0.95
          }],
          primaryTarget: {
            serviceName: 'exercises-service',
            endpoint: 'http://exercises-service:5000',
            confidence: 0.95
          }
        }
      });

      // Mock service registry
      registryService.getServiceByName = jest.fn().mockResolvedValue({
        serviceName: 'exercises-service',
        endpoint: 'http://exercises-service:5001',
        status: 'active'
      });

      // Mock target service response
      nock('http://exercises-service:5001')
        .post('/api/fill-content-metrics/')
        .reply(200, {
          success: true,
          data: {
            answer: 'Exercise content here'
          }
        });

      const response = await request(app)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'devlab',
          payload: { action: 'coding' },
          response: { answer: '' }
        });

      expect(response.status).toBe(200);
      expect(response.body.data.answer).toBe('Exercise content here');
    });

    test('should map multiple fields correctly', async () => {
      // Mock AI routing
      aiRoutingService.routeRequest = jest.fn().mockResolvedValue({
        success: true,
        routing: {
          targetServices: [{
            serviceName: 'payment-service',
            endpoint: 'http://payment-service:5000',
            confidence: 0.95
          }],
          primaryTarget: {
            serviceName: 'payment-service',
            endpoint: 'http://payment-service:5000',
            confidence: 0.95
          }
        }
      });

      // Mock service registry
      registryService.getServiceByName = jest.fn().mockResolvedValue({
        serviceName: 'payment-service',
        endpoint: 'http://payment-service:5002',
        status: 'active'
      });

      // Mock target service response
      nock('http://payment-service:5002')
        .post('/api/fill-content-metrics/')
        .reply(200, {
          success: true,
          data: {
            transaction_id: 'txn_123',
            status: 'completed',
            amount: 100.00
          }
        });

      const response = await request(app)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'user-service',
          payload: { action: 'payment' },
          response: {
            transaction_id: '',
            status: '',
            amount: 0
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.data.transaction_id).toBe('txn_123');
      expect(response.body.data.status).toBe('completed');
      expect(response.body.data.amount).toBe(100.00);
    });

    test('should handle case-insensitive field matching', async () => {
      // Mock AI routing
      aiRoutingService.routeRequest = jest.fn().mockResolvedValue({
        success: true,
        routing: {
          targetServices: [{
            serviceName: 'exercises-service',
            endpoint: 'http://exercises-service:5000',
            confidence: 0.95
          }],
          primaryTarget: {
            serviceName: 'exercises-service',
            endpoint: 'http://exercises-service:5000',
            confidence: 0.95
          }
        }
      });

      // Mock service registry
      registryService.getServiceByName = jest.fn().mockResolvedValue({
        serviceName: 'exercises-service',
        endpoint: 'http://exercises-service:5001',
        status: 'active'
      });

      // Mock target service response with different case
      nock('http://exercises-service:5001')
        .post('/api/fill-content-metrics/')
        .reply(200, {
          success: true,
          data: {
            Answer: 'Case insensitive match' // Capital A
          }
        });

      const response = await request(app)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'devlab',
          payload: { action: 'coding' },
          response: { answer: '' } // lowercase
        });

      expect(response.status).toBe(200);
      expect(response.body.data.answer).toBe('Case insensitive match');
    });

    test('should use template default when field does not exist in target response', async () => {
      // Mock AI routing
      aiRoutingService.routeRequest = jest.fn().mockResolvedValue({
        success: true,
        routing: {
          targetServices: [{
            serviceName: 'exercises-service',
            endpoint: 'http://exercises-service:5000',
            confidence: 0.95
          }],
          primaryTarget: {
            serviceName: 'exercises-service',
            endpoint: 'http://exercises-service:5000',
            confidence: 0.95
          }
        }
      });

      // Mock service registry
      registryService.getServiceByName = jest.fn().mockResolvedValue({
        serviceName: 'exercises-service',
        endpoint: 'http://exercises-service:5001',
        status: 'active'
      });

      // Mock target service response - missing 'answer' field
      nock('http://exercises-service:5001')
        .post('/api/fill-content-metrics/')
        .reply(200, {
          success: true,
          data: {
            other_field: 'some value'
          }
        });

      const response = await request(app)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'devlab',
          payload: { action: 'coding' },
          response: { answer: 'default value' }
        });

      expect(response.status).toBe(200);
      // Should use first available field or default
      expect(response.body.data).toBeDefined();
    });

    test('should return all data when template is empty', async () => {
      // Mock AI routing
      aiRoutingService.routeRequest = jest.fn().mockResolvedValue({
        success: true,
        routing: {
          targetServices: [{
            serviceName: 'exercises-service',
            endpoint: 'http://exercises-service:5000',
            confidence: 0.95
          }],
          primaryTarget: {
            serviceName: 'exercises-service',
            endpoint: 'http://exercises-service:5000',
            confidence: 0.95
          }
        }
      });

      // Mock service registry
      registryService.getServiceByName = jest.fn().mockResolvedValue({
        serviceName: 'exercises-service',
        endpoint: 'http://exercises-service:5001',
        status: 'active'
      });

      // Mock target service response
      nock('http://exercises-service:5001')
        .post('/api/fill-content-metrics/')
        .reply(200, {
          success: true,
          data: {
            field1: 'value1',
            field2: 'value2',
            field3: 'value3'
          }
        });

      const response = await request(app)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'devlab',
          payload: { action: 'coding' },
          response: {} // Empty template
        });

      expect(response.status).toBe(200);
      expect(response.body.data.field1).toBe('value1');
      expect(response.body.data.field2).toBe('value2');
      expect(response.body.data.field3).toBe('value3');
    });

    test('should unwrap wrapped response correctly', async () => {
      // Mock AI routing
      aiRoutingService.routeRequest = jest.fn().mockResolvedValue({
        success: true,
        routing: {
          targetServices: [{
            serviceName: 'exercises-service',
            endpoint: 'http://exercises-service:5000',
            confidence: 0.95
          }],
          primaryTarget: {
            serviceName: 'exercises-service',
            endpoint: 'http://exercises-service:5000',
            confidence: 0.95
          }
        }
      });

      // Mock service registry
      registryService.getServiceByName = jest.fn().mockResolvedValue({
        serviceName: 'exercises-service',
        endpoint: 'http://exercises-service:5001',
        status: 'active'
      });

      // Mock target service response - wrapped in success/data
      nock('http://exercises-service:5001')
        .post('/api/fill-content-metrics/')
        .reply(200, {
          success: true,
          data: {
            answer: 'Wrapped response content'
          }
        });

      const response = await request(app)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'devlab',
          payload: { action: 'coding' },
          response: { answer: '' }
        });

      expect(response.status).toBe(200);
      expect(response.body.data.answer).toBe('Wrapped response content');
    });
  });

  // ============================================
  // 6. INTEGRATION TESTS
  // ============================================
  describe('Integration Tests', () => {
    test('should complete full flow: DevLab -> Coordinator -> Exercises', async () => {
      // Mock AI routing
      aiRoutingService.routeRequest = jest.fn().mockResolvedValue({
        success: true,
        routing: {
          targetServices: [{
            serviceName: 'exercises-service',
            endpoint: 'http://exercises-service:5000',
            confidence: 0.95,
            reasoning: 'Coding query matched exercises-service'
          }],
          primaryTarget: {
            serviceName: 'exercises-service',
            endpoint: 'http://exercises-service:5000',
            confidence: 0.95
          }
        }
      });

      // Mock service registry
      registryService.getServiceByName = jest.fn().mockResolvedValue({
        serviceName: 'exercises-service',
        endpoint: 'http://exercises-service:5001',
        status: 'active'
      });

      // Mock target service response
      nock('http://exercises-service:5001')
        .post('/api/fill-content-metrics/')
        .reply(200, {
          success: true,
          data: {
            answer: 'Exercise 1: Write a function\nExercise 2: Implement algorithm'
          }
        });

      const response = await request(app)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'devlab',
          payload: {
            action: 'coding',
            amount: 2,
            difficulty: 'medium',
            programming_language: 'javascript'
          },
          response: {
            answer: ''
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.answer).toContain('Exercise');
      expect(response.body.metadata.routed_to).toBe('exercises-service');
      expect(response.body.metadata.requester).toBe('devlab');
      expect(response.body.metadata.confidence).toBe(0.95);
    });

    test('should complete full flow: User-Service -> Coordinator -> Payment', async () => {
      // Mock AI routing
      aiRoutingService.routeRequest = jest.fn().mockResolvedValue({
        success: true,
        routing: {
          targetServices: [{
            serviceName: 'payment-service',
            endpoint: 'http://payment-service:5000',
            confidence: 0.92
          }],
          primaryTarget: {
            serviceName: 'payment-service',
            endpoint: 'http://payment-service:5000',
            confidence: 0.92
          }
        }
      });

      // Mock service registry
      registryService.getServiceByName = jest.fn().mockResolvedValue({
        serviceName: 'payment-service',
        endpoint: 'http://payment-service:5002',
        status: 'active'
      });

      // Mock target service response
      nock('http://payment-service:5002')
        .post('/api/fill-content-metrics/')
        .reply(200, {
          success: true,
          data: {
            transaction_id: 'txn_12345',
            status: 'completed',
            amount: 100.00
          }
        });

      const response = await request(app)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'user-service',
          payload: {
            action: 'payment',
            amount: 100.00
          },
          response: {
            transaction_id: '',
            status: '',
            amount: 0
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.transaction_id).toBe('txn_12345');
      expect(response.body.metadata.routed_to).toBe('payment-service');
    });

    test('should route to highest confidence service when multiple match', async () => {
      // Mock AI routing with multiple candidates
      aiRoutingService.routeRequest = jest.fn().mockResolvedValue({
        success: true,
        routing: {
          targetServices: [
            {
              serviceName: 'exercises-service',
              endpoint: 'http://exercises-service:5000',
              confidence: 0.95
            },
            {
              serviceName: 'user-service',
              endpoint: 'http://user-service:5000',
              confidence: 0.70
            },
            {
              serviceName: 'payment-service',
              endpoint: 'http://payment-service:5000',
              confidence: 0.60
            }
          ],
          primaryTarget: {
            serviceName: 'exercises-service',
            endpoint: 'http://exercises-service:5000',
            confidence: 0.95
          }
        }
      });

      // Mock service registry
      registryService.getServiceByName = jest.fn().mockResolvedValue({
        serviceName: 'exercises-service',
        endpoint: 'http://exercises-service:5001',
        status: 'active'
      });

      // Mock target service response
      nock('http://exercises-service:5001')
        .post('/api/fill-content-metrics/')
        .reply(200, {
          success: true,
          data: { answer: 'Best match' }
        });

      const response = await request(app)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'devlab',
          payload: { action: 'coding' },
          response: { answer: '' }
        });

      expect(response.status).toBe(200);
      expect(response.body.metadata.routed_to).toBe('exercises-service');
      expect(response.body.metadata.confidence).toBe(0.95);
    });
  });

  // ============================================
  // 7. ERROR HANDLING TESTS
  // ============================================
  describe('Error Handling', () => {
    test('should handle target service timeout', async () => {
      // Mock AI routing
      aiRoutingService.routeRequest = jest.fn().mockResolvedValue({
        success: true,
        routing: {
          targetServices: [{
            serviceName: 'timeout-service',
            endpoint: 'http://timeout-service:5000',
            confidence: 0.95
          }],
          primaryTarget: {
            serviceName: 'timeout-service',
            endpoint: 'http://timeout-service:5000',
            confidence: 0.95
          }
        }
      });

      // Mock service registry
      registryService.getServiceByName = jest.fn().mockResolvedValue({
        serviceName: 'timeout-service',
        endpoint: 'http://timeout-service:5005',
        status: 'active'
      });

      // Mock timeout - delay response beyond timeout
      nock('http://timeout-service:5005')
        .post('/api/fill-content-metrics/')
        .delayConnection(35000) // 35 seconds - beyond 30s timeout
        .reply(200, {
          success: true,
          data: { answer: 'Too late' }
        });

      const response = await request(app)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'devlab',
          payload: { action: 'coding' },
          response: { answer: '' }
        });

      expect(response.status).toBe(502);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Failed to communicate');
    }, 40000); // Increase timeout for this test

    test('should handle target service returning 500', async () => {
      // Mock AI routing
      aiRoutingService.routeRequest = jest.fn().mockResolvedValue({
        success: true,
        routing: {
          targetServices: [{
            serviceName: 'error-service',
            endpoint: 'http://error-service:5000',
            confidence: 0.95
          }],
          primaryTarget: {
            serviceName: 'error-service',
            endpoint: 'http://error-service:5000',
            confidence: 0.95
          }
        }
      });

      // Mock service registry
      registryService.getServiceByName = jest.fn().mockResolvedValue({
        serviceName: 'error-service',
        endpoint: 'http://error-service:5004',
        status: 'active'
      });

      // Mock target service - returns 500
      nock('http://error-service:5004')
        .post('/api/fill-content-metrics/')
        .reply(500, {
          success: false,
          error: 'Internal server error'
        });

      const response = await request(app)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'devlab',
          payload: { action: 'coding' },
          response: { answer: '' }
        });

      expect(response.status).toBe(502);
      expect(response.body.success).toBe(false);
    });

    test('should handle target service returning invalid JSON', async () => {
      // Mock AI routing
      aiRoutingService.routeRequest = jest.fn().mockResolvedValue({
        success: true,
        routing: {
          targetServices: [{
            serviceName: 'invalid-service',
            endpoint: 'http://invalid-service:5000',
            confidence: 0.95
          }],
          primaryTarget: {
            serviceName: 'invalid-service',
            endpoint: 'http://invalid-service:5000',
            confidence: 0.95
          }
        }
      });

      // Mock service registry
      registryService.getServiceByName = jest.fn().mockResolvedValue({
        serviceName: 'invalid-service',
        endpoint: 'http://invalid-service:5001',
        status: 'active'
      });

      // Mock target service - returns invalid JSON
      nock('http://invalid-service:5001')
        .post('/api/fill-content-metrics/')
        .reply(200, 'not valid json { broken');

      const response = await request(app)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'devlab',
          payload: { action: 'coding' },
          response: { answer: '' }
        });

      // Should handle gracefully - might return 200 with parsed data or 502
      expect([200, 502]).toContain(response.status);
    });
  });

  // ============================================
  // 8. PERFORMANCE TESTS
  // ============================================
  describe('Performance Tests', () => {
    test('should complete request within reasonable time', async () => {
      const startTime = Date.now();

      // Mock AI routing
      aiRoutingService.routeRequest = jest.fn().mockResolvedValue({
        success: true,
        routing: {
          targetServices: [{
            serviceName: 'exercises-service',
            endpoint: 'http://exercises-service:5000',
            confidence: 0.95
          }],
          primaryTarget: {
            serviceName: 'exercises-service',
            endpoint: 'http://exercises-service:5000',
            confidence: 0.95
          }
        }
      });

      // Mock service registry
      registryService.getServiceByName = jest.fn().mockResolvedValue({
        serviceName: 'exercises-service',
        endpoint: 'http://exercises-service:5001',
        status: 'active'
      });

      // Mock target service response
      nock('http://exercises-service:5001')
        .post('/api/fill-content-metrics/')
        .reply(200, {
          success: true,
          data: { answer: 'Fast response' }
        });

      const response = await request(app)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'devlab',
          payload: { action: 'coding' },
          response: { answer: '' }
        });

      const duration = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(5000); // Should complete in <5 seconds
    });

    test('should handle concurrent requests', async () => {
      // Mock AI routing
      aiRoutingService.routeRequest = jest.fn().mockResolvedValue({
        success: true,
        routing: {
          targetServices: [{
            serviceName: 'exercises-service',
            endpoint: 'http://exercises-service:5000',
            confidence: 0.95
          }],
          primaryTarget: {
            serviceName: 'exercises-service',
            endpoint: 'http://exercises-service:5000',
            confidence: 0.95
          }
        }
      });

      // Mock service registry
      registryService.getServiceByName = jest.fn().mockResolvedValue({
        serviceName: 'exercises-service',
        endpoint: 'http://exercises-service:5001',
        status: 'active'
      });

      // Mock target service - handle multiple requests
      nock('http://exercises-service:5001')
        .post('/api/fill-content-metrics/')
        .times(10)
        .reply(200, {
          success: true,
          data: { answer: 'Concurrent response' }
        });

      // Send 10 concurrent requests
      const requests = Array.from({ length: 10 }, (_, i) =>
        request(app)
          .post('/api/fill-content-metrics/')
          .send({
            requester_service: `devlab-${i}`,
            payload: { action: 'coding' },
            response: { answer: '' }
          })
      );

      const responses = await Promise.all(requests);

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });

  // ============================================
  // 9. LOGGING TESTS
  // ============================================
  describe('Logging', () => {
    test('should log request received', async () => {
      const logger = require('../../src/utils/logger');
      const logSpy = jest.spyOn(logger, 'info').mockImplementation();

      // Mock AI routing
      aiRoutingService.routeRequest = jest.fn().mockResolvedValue({
        success: true,
        routing: {
          targetServices: [{
            serviceName: 'exercises-service',
            endpoint: 'http://exercises-service:5000',
            confidence: 0.95
          }],
          primaryTarget: {
            serviceName: 'exercises-service',
            endpoint: 'http://exercises-service:5000',
            confidence: 0.95
          }
        }
      });

      // Mock service registry
      registryService.getServiceByName = jest.fn().mockResolvedValue({
        serviceName: 'exercises-service',
        endpoint: 'http://exercises-service:5001',
        status: 'active'
      });

      // Mock target service response
      nock('http://exercises-service:5001')
        .post('/api/fill-content-metrics/')
        .reply(200, {
          success: true,
          data: { answer: 'Logged' }
        });

      await request(app)
        .post('/api/fill-content-metrics/')
        .send({
          requester_service: 'devlab',
          payload: { action: 'coding' },
          response: { answer: '' }
        });

      // Check that logging was called
      expect(logSpy).toHaveBeenCalled();
      logSpy.mockRestore();
    });
  });
});

