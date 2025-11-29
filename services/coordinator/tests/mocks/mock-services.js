/**
 * Mock Microservices
 * Simulates target services that respond to /api/fill-content-metrics/
 */

const express = require('express');

class MockService {
  constructor(name, port, responses) {
    this.name = name;
    this.port = port;
    this.app = express();
    this.server = null;
    this.responses = responses || {};
    
    this.app.use(express.json());
    this.setupRoutes();
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', service: this.name });
    });

    // Unified proxy endpoint
    this.app.post('/api/fill-content-metrics/', (req, res) => {
      const { requester_service, payload, response: responseTemplate } = req.body;
      
      // Get response based on service name or payload
      const responseKey = this._getResponseKey(payload);
      const responseData = this.responses[responseKey] || this.responses['default'] || {};
      
      // Simulate processing delay
      setTimeout(() => {
        res.json(responseData);
      }, 50); // 50ms delay
    });
  }

  _getResponseKey(payload) {
    if (!payload || typeof payload !== 'object') {
      return 'default';
    }
    
    // Check for specific keys
    if (payload.action === 'coding') return 'coding';
    if (payload.action === 'payment') return 'payment';
    if (payload.type === 'user') return 'user';
    
    return 'default';
  }

  async start() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log(`Mock ${this.name} started on port ${this.port}`);
          resolve();
        }
      });
    });
  }

  async stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log(`Mock ${this.name} stopped`);
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

// Mock Exercises Service
const createMockExercisesService = (port = 5001) => {
  return new MockService('exercises-service', port, {
    coding: {
      success: true,
      data: {
        answer: 'Exercise 1: Write a function to reverse a string\nExercise 2: Implement a binary search algorithm'
      }
    },
    default: {
      success: true,
      data: {
        answer: 'Default exercise content'
      }
    }
  });
};

// Mock Payment Service
const createMockPaymentService = (port = 5002) => {
  return new MockService('payment-service', port, {
    payment: {
      success: true,
      data: {
        transaction_id: 'txn_12345',
        status: 'completed',
        amount: 100.00
      }
    },
    default: {
      success: true,
      data: {
        transaction_id: 'txn_default',
        status: 'pending'
      }
    }
  });
};

// Mock User Service
const createMockUserService = (port = 5003) => {
  return new MockService('user-service', port, {
    user: {
      success: true,
      data: {
        user_id: 'user_123',
        username: 'testuser',
        email: 'test@example.com'
      }
    },
    default: {
      success: true,
      data: {
        user_id: 'user_default',
        username: 'default'
      }
    }
  });
};

// Mock service that returns errors
const createMockErrorService = (port = 5004) => {
  const app = express();
  app.use(express.json());
  
  app.post('/api/fill-content-metrics/', (req, res) => {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  });
  
  return {
    name: 'error-service',
    port: port,
    app: app,
    server: null,
    start: function() {
      return new Promise((resolve, reject) => {
        this.server = this.app.listen(this.port, (err) => {
          if (err) reject(err);
          else {
            console.log(`Mock ${this.name} started on port ${this.port}`);
            resolve();
          }
        });
      });
    },
    stop: function() {
      return new Promise((resolve) => {
        if (this.server) {
          this.server.close(() => {
            console.log(`Mock ${this.name} stopped`);
            resolve();
          });
        } else {
          resolve();
        }
      });
    }
  };
};

// Mock service that times out
const createMockTimeoutService = (port = 5005) => {
  const app = express();
  app.use(express.json());
  
  app.post('/api/fill-content-metrics/', (req, res) => {
    // Never respond - will timeout
    // Do nothing
  });
  
  return {
    name: 'timeout-service',
    port: port,
    app: app,
    server: null,
    start: function() {
      return new Promise((resolve, reject) => {
        this.server = this.app.listen(this.port, (err) => {
          if (err) reject(err);
          else {
            console.log(`Mock ${this.name} started on port ${this.port}`);
            resolve();
          }
        });
      });
    },
    stop: function() {
      return new Promise((resolve) => {
        if (this.server) {
          this.server.close(() => {
            console.log(`Mock ${this.name} stopped`);
            resolve();
          });
        } else {
          resolve();
        }
      });
    }
  };
};

module.exports = {
  MockService,
  createMockExercisesService,
  createMockPaymentService,
  createMockUserService,
  createMockErrorService,
  createMockTimeoutService
};

