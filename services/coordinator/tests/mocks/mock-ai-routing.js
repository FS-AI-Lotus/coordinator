/**
 * Mock AI Routing Service
 * Provides predictable routing responses for testing
 */

class MockAIRoutingService {
  constructor() {
    this.routingMap = {
      // Coding/exercises queries
      'coding': { serviceName: 'exercises-service', confidence: 0.95 },
      'exercise': { serviceName: 'exercises-service', confidence: 0.92 },
      'programming': { serviceName: 'exercises-service', confidence: 0.90 },
      'javascript': { serviceName: 'exercises-service', confidence: 0.88 },
      
      // Payment queries
      'payment': { serviceName: 'payment-service', confidence: 0.94 },
      'billing': { serviceName: 'payment-service', confidence: 0.91 },
      'transaction': { serviceName: 'payment-service', confidence: 0.89 },
      'process payment': { serviceName: 'payment-service', confidence: 0.96 },
      
      // User queries
      'user': { serviceName: 'user-service', confidence: 0.93 },
      'profile': { serviceName: 'user-service', confidence: 0.90 },
      'authentication': { serviceName: 'user-service', confidence: 0.87 },
      'get user': { serviceName: 'user-service', confidence: 0.95 },
      
      // Low confidence queries
      'unknown': { serviceName: null, confidence: 0.2 },
      'random': { serviceName: null, confidence: 0.15 },
      'empty request': { serviceName: null, confidence: 0.1 }
    };
  }

  /**
   * Mock routeRequest function
   * @param {Object} data - Routing data
   * @param {Object} routing - Routing config
   * @returns {Promise<Object>} - Routing result
   */
  async routeRequest(data, routing = {}) {
    // Extract query from data
    const query = this._extractQuery(data);
    const queryLower = query.toLowerCase();
    
    // Find matching service
    let matchedService = null;
    let highestConfidence = 0;
    
    for (const [key, value] of Object.entries(this.routingMap)) {
      if (queryLower.includes(key.toLowerCase())) {
        if (value.confidence > highestConfidence) {
          highestConfidence = value.confidence;
          matchedService = value;
        }
      }
    }
    
    // If no match found or confidence too low
    if (!matchedService || matchedService.confidence < 0.3) {
      return {
        success: false,
        routing: {
          targetServices: [],
          primaryTarget: null,
          totalCandidates: 0
        }
      };
    }
    
    // Build service endpoint
    const endpoint = `http://${matchedService.serviceName}:5000`;
    
    return {
      success: true,
      routing: {
        targetServices: [{
          serviceName: matchedService.serviceName,
          endpoint: endpoint,
          confidence: matchedService.confidence,
          reasoning: `Mock routing: matched "${query}" to ${matchedService.serviceName}`
        }],
        primaryTarget: {
          serviceName: matchedService.serviceName,
          endpoint: endpoint,
          confidence: matchedService.confidence,
          reasoning: `Mock routing: matched "${query}" to ${matchedService.serviceName}`
        },
        totalCandidates: 1,
        strategy: routing.strategy || 'single',
        method: 'mock'
      }
    };
  }

  /**
   * Extract query string from routing data
   * @param {Object} data - Routing data
   * @returns {string} - Query string
   * @private
   */
  _extractQuery(data) {
    if (typeof data === 'string') {
      return data;
    }
    
    if (data?.payload?.query) {
      return data.payload.query;
    }
    
    if (data?.payload) {
      return JSON.stringify(data.payload);
    }
    
    return JSON.stringify(data);
  }

  /**
   * Set custom routing for testing
   * @param {string} query - Query string
   * @param {Object} routing - Routing result
   */
  setRouting(query, routing) {
    this.routingMap[query.toLowerCase()] = routing;
  }

  /**
   * Clear all routing mappings
   */
  clearRouting() {
    this.routingMap = {};
  }
}

module.exports = MockAIRoutingService;

