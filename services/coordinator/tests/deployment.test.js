/**
 * Deployment Tests - Tests against live Railway instance
 * These tests verify the deployed service is working correctly
 */

const request = require('supertest');

// Railway deployment URL
const RAILWAY_URL = process.env.RAILWAY_URL || 'https://coordinator-production-e0a0.up.railway.app';
const BASE_URL = RAILWAY_URL.replace(/\/$/, ''); // Remove trailing slash

describe('Deployment Tests - Railway Instance', () => {
  const apiUrl = '/api/fill-content-metrics/';

  // Increase timeout for network requests
  jest.setTimeout(30000);

  describe('Health Check', () => {
    test('should respond to root endpoint', async () => {
      const response = await request(BASE_URL)
        .get('/')
        .timeout(10000);

      expect(response.status).toBe(200);
      expect(response.body.service).toBe('Coordinator Microservice');
      expect(response.body.status).toBe('running');
    });

    test('should have unified proxy endpoint listed', async () => {
      const response = await request(BASE_URL)
        .get('/')
        .timeout(10000);

      expect(response.status).toBe(200);
      // Check if unified proxy is mentioned (may be in endpoints or proxy description)
      const endpointsStr = JSON.stringify(response.body.endpoints || {});
      expect(endpointsStr).toContain('fill-content-metrics');
    });

    test('should respond to health endpoint', async () => {
      const response = await request(BASE_URL)
        .get('/health')
        .timeout(10000);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
    });
  });

  describe('Unified Proxy Endpoint - Live Tests', () => {
    test('should reject request without requester_service', async () => {
      const response = await request(BASE_URL)
        .post(apiUrl)
        .send({
          payload: { action: 'coding' },
          response: { answer: '' }
        })
        .timeout(10000);

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
        .timeout(10000);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('response');
    });

    test('should accept valid request structure', async () => {
      const response = await request(BASE_URL)
        .post(apiUrl)
        .send({
          requester_service: 'test-service',
          payload: { action: 'coding' },
          response: { answer: '' }
        })
        .timeout(30000); // Longer timeout for AI routing

      // Should either succeed (if services registered) or return appropriate error
      expect([200, 404, 502, 503]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('metadata');
      } else {
        // If no services registered, should return appropriate error
        expect(response.body.success).toBe(false);
      }
    });

    test('should handle empty payload correctly', async () => {
      const response = await request(BASE_URL)
        .post(apiUrl)
        .send({
          requester_service: 'test-service',
          payload: {},
          response: { answer: '' }
        })
        .timeout(30000);

      // Should handle empty payload gracefully
      expect([200, 404, 502, 503]).toContain(response.status);
    });
  });

  describe('Service Discovery - Live Tests', () => {
    test('should respond to services endpoint', async () => {
      const response = await request(BASE_URL)
        .get('/services')
        .timeout(10000);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('services');
      expect(Array.isArray(response.body.services)).toBe(true);
    });

    test('should respond to registry endpoint (alias)', async () => {
      const response = await request(BASE_URL)
        .get('/registry')
        .timeout(10000);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
    });
  });

  describe('AI Routing - Live Tests', () => {
    test('should respond to route endpoint', async () => {
      const response = await request(BASE_URL)
        .post('/route')
        .send({
          data: {
            type: 'test',
            payload: { query: 'test query' }
          },
          routing: {
            strategy: 'single'
          }
        })
        .timeout(30000);

      // Should respond (may succeed or fail based on services)
      expect([200, 404, 502, 400]).toContain(response.status);
    });
  });

  describe('Error Handling - Live Tests', () => {
    test('should handle invalid JSON gracefully', async () => {
      const response = await request(BASE_URL)
        .post(apiUrl)
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .timeout(10000);

      expect([400, 500]).toContain(response.status);
    });

    test('should handle non-existent endpoint', async () => {
      const response = await request(BASE_URL)
        .get('/non-existent-endpoint')
        .timeout(10000);

      // Should return 404 or be proxied
      expect([404, 200, 502]).toContain(response.status);
    });
  });

  describe('Performance - Live Tests', () => {
    test('should respond within reasonable time', async () => {
      const startTime = Date.now();

      const response = await request(BASE_URL)
        .get('/health')
        .timeout(10000);

      const duration = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(5000); // Should respond in <5 seconds
    });
  });
});

