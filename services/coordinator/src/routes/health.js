/**
 * @feature monitoring, service-registration
 * @description Health check endpoint (shared by monitoring and service registration)
 * @dependencies service-registration, monitoring
 * @owner core-team
 * @http GET /health
 */

const express = require('express');
const router = express.Router();
const registryService = require('../services/registryService');
const metricsService = require('../services/metricsService');
const logger = require('../utils/logger');

/**
 * GET /health
 * Health check endpoint
 */
router.get('/', async (req, res) => {
  const uptime = metricsService.getUptime();
  const registeredServices = await registryService.getTotalServices();

  logger.info('Health check requested', {
    uptime,
    registeredServices
  });

  res.status(200).json({
    status: 'healthy',
    uptime,
    registeredServices
  });
});

module.exports = router;

