const express = require('express');
const router = express.Router();
const {{FEATURE_NAME}}Service = require('../services/{{FEATURE_NAME}}Service');
const logger = require('../utils/logger');
const { sanitizeInput } = require('../middleware/validation');

/**
 * @feature {{FEATURE_NAME}}
 * @description {{DESCRIPTION}}
 * @dependencies {{DEPENDENCIES}}
 * @owner {{OWNER}}
 * @http GET /{{ENDPOINT_PATH}}
 * @http POST /{{ENDPOINT_PATH}}
 */

/**
 * GET /{{ENDPOINT_PATH}}
 * {{DESCRIPTION}} - Get operation
 */
router.get('/', async (req, res, next) => {
  try {
    const result = await {{FEATURE_NAME}}Service.get{{FEATURE_NAME}}();
    
    logger.info('{{FEATURE_NAME}} requested');
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Failed to get {{FEATURE_NAME}}', {
      error: error.message
    });
    next(error);
  }
});

/**
 * POST /{{ENDPOINT_PATH}}
 * {{DESCRIPTION}} - Create/Update operation
 */
router.post('/', sanitizeInput, async (req, res, next) => {
  try {
    const { data } = req.body;
    
    const result = await {{FEATURE_NAME}}Service.create{{FEATURE_NAME}}(data);
    
    logger.info('{{FEATURE_NAME}} created', {
      id: result.id
    });
    
    res.status(201).json({
      success: true,
      message: '{{FEATURE_NAME}} created successfully',
      data: result
    });
  } catch (error) {
    logger.error('Failed to create {{FEATURE_NAME}}', {
      error: error.message
    });
    next(error);
  }
});

/**
 * GET /{{ENDPOINT_PATH}}/:id
 * {{DESCRIPTION}} - Get by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await {{FEATURE_NAME}}Service.get{{FEATURE_NAME}}ById(id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: '{{FEATURE_NAME}} not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Failed to get {{FEATURE_NAME}} by ID', {
      error: error.message,
      id: req.params.id
    });
    next(error);
  }
});

module.exports = router;

