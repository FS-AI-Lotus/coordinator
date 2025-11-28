const express = require('express');
const router = express.Router();
const registryService = require('../services/registryService');
const metricsService = require('../services/metricsService');
const logger = require('../utils/logger');
const { validateRegistration, sanitizeInput } = require('../middleware/validation');

/**
 * GET /register
 * CI compatibility endpoint - returns 200 OK
 */
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Service registration endpoint',
    method: 'POST',
    description: 'Use POST /register to register a microservice'
  });
});

/**
 * POST /register
 * Register a new microservice
 * Supports both simplified format (name, url, grpc) and full format (serviceName, version, endpoint, etc.)
 */
router.post('/', sanitizeInput, async (req, res, next) => {
  try {
    // Check if it's the simplified format (name, url, grpc)
    if (req.body.name && req.body.url && req.body.grpc !== undefined) {
      const { name, url, grpc } = req.body;

      // Validate required fields
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'name is required and must be a non-empty string'
        });
      }

      if (!url || typeof url !== 'string' || url.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'url is required and must be a non-empty string'
        });
      }

      // Validate URL format
      try {
        new URL(url);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'url must be a valid URL'
        });
      }

      if (typeof grpc !== 'number' || grpc < 1 || grpc > 65535) {
        return res.status(400).json({
          success: false,
          message: 'grpc must be a valid port number (1-65535)'
        });
      }

      // Convert simplified format to full format
      const result = await registryService.registerService({
        serviceName: name.trim(),
        version: '1.0.0', // Default version
        endpoint: url.trim(),
        healthCheck: '/health',
        metadata: {
          grpc_port: grpc
        }
      });

      // Update metrics
      metricsService.incrementRegistrations();
      const totalServices = await registryService.getTotalServices();
      metricsService.updateRegisteredServices(totalServices);

      logger.info('Service registration successful (simplified format)', {
        serviceId: result.serviceId,
        serviceName: name
      });

      return res.status(201).json({
        message: 'Service registered',
        serviceId: result.serviceId
      });
    }

    // Otherwise, use the full format - validate first
    const validationErrors = [];
    const { serviceName, version, endpoint, healthCheck, migrationFile } = req.body;

    if (!serviceName || typeof serviceName !== 'string' || serviceName.trim().length === 0) {
      validationErrors.push('serviceName is required and must be a non-empty string');
    }
    if (!version || typeof version !== 'string' || version.trim().length === 0) {
      validationErrors.push('version is required and must be a non-empty string');
    }
    if (!endpoint || typeof endpoint !== 'string' || endpoint.trim().length === 0) {
      validationErrors.push('endpoint is required and must be a non-empty string');
    } else {
      try {
        new URL(endpoint);
      } catch (error) {
        validationErrors.push('endpoint must be a valid URL');
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Attempt to register the service
    const result = await registryService.registerService({
      serviceName,
      version,
      endpoint,
      healthCheck,
      migrationFile
    });

    // Update metrics
    metricsService.incrementRegistrations();
    const totalServices = await registryService.getTotalServices();
    metricsService.updateRegisteredServices(totalServices);

    logger.info('Service registration successful', {
      serviceId: result.serviceId,
      serviceName
    });

    res.status(201).json({
      success: true,
      message: 'Service registered successfully',
      serviceId: result.serviceId
    });
  } catch (error) {
    // Update failed registration metrics
    metricsService.incrementFailedRegistrations();

    logger.error('Service registration failed', {
      error: error.message,
      body: req.body
    });

    next(error);
  }
});

/**
 * POST /register/:serviceId/migration
 * Upload migration file for a registered service (Stage 2)
 */
router.post('/:serviceId/migration', sanitizeInput, async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const { migrationFile } = req.body;

    if (!migrationFile) {
      return res.status(400).json({
        success: false,
        message: 'Migration file is required'
      });
    }

    // Complete the service registration with migration file
    const result = await registryService.completeMigration(serviceId, migrationFile);

    logger.info('Migration file uploaded successfully', {
      serviceId,
      serviceName: result.serviceName
    });

    res.status(200).json({
      success: true,
      message: 'Migration file uploaded successfully',
      serviceId: serviceId,
      status: 'active'
    });
  } catch (error) {
    logger.error('Migration upload failed', {
      error: error.message,
      serviceId: req.params.serviceId
    });

    next(error);
  }
});

/**
 * DELETE /register/services
 * Delete all services (FOR TESTING ONLY)
 */
router.delete('/services', async (req, res) => {
  try {
    // Get all services
    const allServices = await registryService.getAllServicesFull();
    
    // Delete each one
    let deleted = 0;
    for (const service of allServices) {
      try {
        const success = await registryService.deleteService(service.id || service.serviceId);
        if (success) deleted++;
      } catch (error) {
        logger.warn('Failed to delete service', {
          serviceId: service.id || service.serviceId,
          serviceName: service.serviceName,
          error: error.message
        });
      }
    }
    
    logger.info('Deleted all services', { count: deleted });
    
    res.json({ 
      success: true, 
      deleted,
      message: `Deleted ${deleted} services` 
    });
  } catch (error) {
    logger.error('Failed to delete all services', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

