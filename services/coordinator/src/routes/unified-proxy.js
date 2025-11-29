/**
 * @feature unified-proxy
 * @description Unified proxy endpoint for inter-service communication
 * @dependencies ai-routing, service-registration, smart-proxy
 * @owner core-team
 * @http POST /api/fill-content-metrics/
 */

const express = require('express');
const router = express.Router();
const aiRoutingService = require('../services/aiRoutingService');
const registryService = require('../services/registryService');
const logger = require('../utils/logger');
const { sanitizeInput } = require('../middleware/validation');

/**
 * POST /api/fill-content-metrics/
 * Unified proxy endpoint for inter-service communication
 * 
 * Request Format:
 * {
 *   "requester_service": "service-name",
 *   "payload": { ... },
 *   "response": { "field1": "", "field2": "" }
 * }
 * 
 * Flow:
 * 1. Receive request from requester microservice
 * 2. Extract payload and convert to natural language query
 * 3. Use AI routing to find best target service
 * 4. Forward request to target service's /api/fill-content-metrics/ endpoint
 * 5. Receive response from target service
 * 6. Map response data to match the response template structure
 * 7. Return mapped response to requester
 */
router.post('/', sanitizeInput, async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    const { requester_service, payload, response: responseTemplate } = req.body;

    // Validate required fields
    if (!requester_service) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: requester_service'
      });
    }

    if (!responseTemplate || typeof responseTemplate !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Missing or invalid required field: response (must be an object)'
      });
    }

    // Payload can be empty object, but must be present
    const requestPayload = payload || {};

    logger.info('Unified proxy request received', {
      requester_service,
      payloadKeys: Object.keys(requestPayload),
      responseTemplateKeys: Object.keys(responseTemplate)
    });

    // STEP 1: Convert payload to natural language query
    const query = convertPayloadToQuery(requestPayload);

    logger.info('Converted payload to query', {
      query,
      requester_service
    });

    // STEP 2: Use AI routing to find target service
    const routingData = {
      type: 'unified_proxy_query',
      payload: {
        query: query,
        metadata: {
          requester_service: requester_service,
          original_payload: requestPayload
        },
        context: {
          endpoint: '/api/fill-content-metrics/',
          purpose: 'inter_service_communication'
        }
      },
      context: {
        protocol: 'http',
        source: 'unified_proxy',
        method: 'POST',
        path: '/api/fill-content-metrics/'
      }
    };

    const routingConfig = {
      strategy: 'single',
      priority: 'accuracy'
    };

    let routingResult;
    try {
      routingResult = await aiRoutingService.routeRequest(routingData, routingConfig);
    } catch (error) {
      logger.error('AI routing failed', {
        error: error.message,
        requester_service,
        query
      });
      
      return res.status(502).json({
        success: false,
        message: 'Failed to route request: AI routing service unavailable',
        error: error.message,
        requester: requester_service
      });
    }

    // Check if routing was successful
    if (!routingResult.success || !routingResult.routing?.targetServices?.length) {
      logger.warn('No suitable service found for routing', {
        requester_service,
        query,
        availableServices: (await registryService.getAllServices()).length
      });

      return res.status(404).json({
        success: false,
        message: 'No suitable microservice found for this request',
        query: query,
        requester: requester_service,
        availableServices: await registryService.getAllServices()
      });
    }

    // Get primary target service
    const primaryTarget = routingResult.routing.primaryTarget || routingResult.routing.targetServices[0];
    const targetServiceName = primaryTarget.serviceName;
    const confidence = primaryTarget.confidence || 0;

    logger.info('Target service identified', {
      targetService: targetServiceName,
      confidence,
      requester_service,
      reasoning: primaryTarget.reasoning
    });

    // STEP 3: Get full service details
    const targetService = await registryService.getServiceByName(targetServiceName);
    if (!targetService) {
      logger.error('Target service not found in registry', {
        targetServiceName,
        requester_service
      });

      return res.status(404).json({
        success: false,
        message: `Target service '${targetServiceName}' not found in registry`,
        requester: requester_service
      });
    }

    // Only route to active services
    if (targetService.status !== 'active') {
      logger.warn('Target service is not active', {
        targetServiceName,
        status: targetService.status,
        requester_service
      });

      return res.status(503).json({
        success: false,
        message: `Target service '${targetServiceName}' is not active (status: ${targetService.status})`,
        requester: requester_service
      });
    }

    // STEP 4: Forward request to target service
    const targetUrl = `${targetService.endpoint}/api/fill-content-metrics/`;
    
    logger.info('Forwarding request to target service', {
      targetUrl,
      targetService: targetServiceName,
      requester_service
    });

    const forwardPayload = {
      requester_service: requester_service,
      payload: requestPayload,
      response: responseTemplate
    };

    let targetResponse;
    try {
      targetResponse = await forwardToTargetService(targetUrl, forwardPayload, requester_service);
    } catch (error) {
      logger.error('Failed to forward request to target service', {
        error: error.message,
        targetUrl,
        targetService: targetServiceName,
        requester_service
      });

      return res.status(502).json({
        success: false,
        message: `Failed to communicate with target service '${targetServiceName}'`,
        error: error.message,
        requester: requester_service,
        routed_to: targetServiceName
      });
    }

    // STEP 5 & 6: Map response to match response template
    const mappedResponse = mapResponseToTemplate(targetResponse, responseTemplate);

    const processingTime = Date.now() - startTime;

    logger.info('Unified proxy request completed successfully', {
      requester_service,
      targetService: targetServiceName,
      confidence,
      processingTime: `${processingTime}ms`
    });

    // STEP 7: Return mapped response
    res.status(200).json({
      success: true,
      data: mappedResponse,
      metadata: {
        routed_to: targetServiceName,
        confidence: confidence,
        requester: requester_service,
        processing_time_ms: processingTime
      }
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    logger.error('Unified proxy endpoint error', {
      error: error.message,
      stack: error.stack,
      requester_service: req.body?.requester_service,
      processingTime: `${processingTime}ms`
    });

    // Don't call next() if we've already sent a response
    if (!res.headersSent) {
      next(error);
    }
  }
});

/**
 * Convert payload object to natural language query
 * @param {Object} payload - Request payload
 * @returns {string} - Natural language query string
 */
function convertPayloadToQuery(payload) {
  if (!payload || typeof payload !== 'object' || Object.keys(payload).length === 0) {
    return 'empty request';
  }

  // Convert object to key-value pairs
  const parts = [];
  for (const [key, value] of Object.entries(payload)) {
    if (value !== null && value !== undefined && value !== '') {
      if (typeof value === 'object') {
        // For nested objects, include key and summarize value
        parts.push(`${key}: ${JSON.stringify(value)}`);
      } else {
        parts.push(`${key}: ${value}`);
      }
    }
  }

  return parts.join(', ');
}

/**
 * Forward request to target service
 * @param {string} targetUrl - Target service URL
 * @param {Object} payload - Request payload
 * @param {string} requesterService - Requester service name
 * @returns {Promise<Object>} - Response from target service
 */
async function forwardToTargetService(targetUrl, payload, requesterService) {
  const timeout = 30000; // 30 seconds
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requester-Service': requesterService,
        'X-Routed-By': 'coordinator'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Check if response is OK
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Target service returned ${response.status}: ${errorText}`);
    }

    // Parse response
    const contentType = response.headers.get('content-type');
    let responseData;
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      try {
        responseData = JSON.parse(text);
      } catch {
        // If not JSON, wrap in object
        responseData = { raw: text };
      }
    }

    return responseData;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    
    if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
      throw new Error(`Target service unavailable: ${error.message}`);
    }
    
    throw error;
  }
}

/**
 * Map target service response to match response template
 * @param {Object} targetResponse - Response from target service
 * @param {Object} responseTemplate - Template defining expected response structure
 * @returns {Object} - Mapped response matching template
 */
function mapResponseToTemplate(targetResponse, responseTemplate) {
  // If target response is wrapped in success/data structure, extract it
  let actualData = targetResponse;
  if (targetResponse && typeof targetResponse === 'object') {
    if (targetResponse.success && targetResponse.data) {
      actualData = targetResponse.data;
    } else if (targetResponse.data) {
      actualData = targetResponse.data;
    }
  }

  // If actualData is not an object, wrap it
  if (typeof actualData !== 'object' || actualData === null) {
    actualData = { value: actualData };
  }

  // Create mapped response based on template
  const mappedResponse = {};
  
  for (const [templateKey, templateValue] of Object.entries(responseTemplate)) {
    // Try to find matching field in target response
    // Priority: exact match > case-insensitive match > first available field
    
    let matchedValue = undefined;
    
    // 1. Exact match
    if (actualData.hasOwnProperty(templateKey)) {
      matchedValue = actualData[templateKey];
    } else {
      // 2. Case-insensitive match
      const lowerKey = templateKey.toLowerCase();
      for (const [key, value] of Object.entries(actualData)) {
        if (key.toLowerCase() === lowerKey) {
          matchedValue = value;
          break;
        }
      }
    }

    // 3. If still no match, use template default value (if provided)
    if (matchedValue === undefined) {
      // Use template's default value (empty string, null, etc.)
      matchedValue = templateValue;
    }

    // 4. If template value is empty string and we have data, try to use first available field
    if (matchedValue === '' && Object.keys(actualData).length > 0) {
      // Use first available field from actual data
      const firstKey = Object.keys(actualData)[0];
      matchedValue = actualData[firstKey];
    }

    mappedResponse[templateKey] = matchedValue !== undefined ? matchedValue : templateValue;
  }

  // If template is empty but we have data, include all data
  if (Object.keys(responseTemplate).length === 0 && Object.keys(actualData).length > 0) {
    return actualData;
  }

  return mappedResponse;
}

module.exports = router;

