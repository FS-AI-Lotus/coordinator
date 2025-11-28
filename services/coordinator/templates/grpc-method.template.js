const logger = require('../../utils/logger');
const {{FEATURE_NAME}}Service = require('../../services/{{FEATURE_NAME}}Service');
const grpc = require('@grpc/grpc-js');

/**
 * @feature {{FEATURE_NAME}}
 * @description {{DESCRIPTION}}
 * @dependencies {{DEPENDENCIES}}
 * @owner {{OWNER}}
 * @grpc {{SERVICE_NAME}}.{{METHOD_NAME}}
 */

/**
 * Handle {{METHOD_NAME}} gRPC call
 * @param {Object} call - gRPC call object with request
 * @param {Function} callback - gRPC callback function
 */
async function handle{{METHOD_NAME}}(call, callback) {
  const startTime = Date.now();
  const request = call.request;

  try {
    logger.info('gRPC {{METHOD_NAME}} request received', {
      requestId: request.request_id || 'unknown',
      timestamp: new Date().toISOString()
    });

    // Validate request
    if (!request) {
      const error = new Error('Request is required');
      logger.error('gRPC {{METHOD_NAME}} validation failed', {
        error: error.message
      });
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: error.message
      });
    }

    // Process request using service
    const result = await {{FEATURE_NAME}}Service.process{{METHOD_NAME}}(request);

    // Build response
    const processingTime = Date.now() - startTime;
    const response = {
      // Add response fields here
      success: true,
      data: result,
      processing_time: `${processingTime}ms`
    };

    logger.info('gRPC {{METHOD_NAME}} response sent', {
      requestId: request.request_id || 'unknown',
      processingTime: `${processingTime}ms`
    });

    // Send successful response
    callback(null, response);

  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    logger.error('gRPC {{METHOD_NAME}} handler failed', {
      error: error.message,
      stack: error.stack,
      requestId: request?.request_id,
      processingTime: `${processingTime}ms`
    });

    // Send error response
    const grpcError = {
      code: grpc.status.INTERNAL,
      message: `{{METHOD_NAME}} processing failed: ${error.message}`,
      details: error.stack
    };

    callback(grpcError);
  }
}

module.exports = {
  handle{{METHOD_NAME}}
};

