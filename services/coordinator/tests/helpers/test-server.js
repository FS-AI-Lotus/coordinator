/**
 * Test Server Helper
 * Sets up Express app for testing
 */

const express = require('express');
const unifiedProxyRoutes = require('../../src/routes/unified-proxy');
const { errorHandler, notFoundHandler } = require('../../src/middleware/errorHandler');

/**
 * Create test Express app with unified proxy route
 * @returns {Object} Express app
 */
function createTestApp() {
  const app = express();
  
  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Routes
  app.use('/api/fill-content-metrics', unifiedProxyRoutes);
  
  // Error handlers
  app.use(notFoundHandler);
  app.use(errorHandler);
  
  return app;
}

module.exports = {
  createTestApp
};

