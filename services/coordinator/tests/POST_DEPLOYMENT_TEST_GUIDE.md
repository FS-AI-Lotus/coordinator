# Post-Deployment Test Guide

## Overview

The post-deployment test suite (`post-deployment.test.js`) provides comprehensive validation of the Coordinator service in production environments. These tests verify that all critical functionality works correctly after deployment.

## Test Coverage

### 1. Health & Connectivity Tests
- Root endpoint response
- Health check endpoint
- Endpoint listing

### 2. Service Registration & Discovery Tests
- List all registered services
- Registry alias endpoint
- Service registration
- Service details structure

### 3. AI Routing Functionality Tests
- Basic routing with query
- Routing with intent parameter
- Request validation
- Single strategy routing
- Multiple strategy routing
- Routing metadata
- Context-aware routing
- Empty services handling

### 4. Unified Proxy Endpoint Tests
- Request validation (requester_service, response template)
- Valid request handling
- Empty payload handling
- Complex payload structures
- Error handling (no service found)
- Routing metadata in responses
- Multiple response template fields

### 5. Integration Scenarios
- End-to-end flow (register → route → proxy)
- Consistency across multiple requests
- Concurrent request handling

### 6. Error Handling & Resilience
- Invalid JSON handling
- Malformed request body
- Non-existent endpoints
- Missing required fields
- Large payloads
- Special characters in payload

### 7. Performance & Reliability
- Response time validation
- Timeout handling
- Rapid sequential requests
- Processing time metadata

### 8. API Contract Validation
- Consistent response structures
- Error response format
- Metadata presence

## Running the Tests

### Prerequisites

1. **Environment Variable** (optional):
   ```bash
   export RAILWAY_URL=https://coordinator-production-e0a0.up.railway.app
   ```

   If not set, tests default to: `https://coordinator-production-e0a0.up.railway.app`

2. **Network Access**: Ensure you can reach the production Coordinator instance

### Run All Post-Deployment Tests

```bash
# Using npm script
npm run test:post-deployment

# Using Jest directly
node node_modules/jest/bin/jest.js tests/post-deployment.test.js --testTimeout=60000

# With verbose output
node node_modules/jest/bin/jest.js tests/post-deployment.test.js --testTimeout=60000 --verbose
```

### Run Specific Test Suites

```bash
# Health & Connectivity only
node node_modules/jest/bin/jest.js tests/post-deployment.test.js -t "Health & Connectivity"

# AI Routing only
node node_modules/jest/bin/jest.js tests/post-deployment.test.js -t "AI Routing"

# Unified Proxy only
node node_modules/jest/bin/jest.js tests/post-deployment.test.js -t "Unified Proxy"
```

### Run Individual Tests

```bash
# Specific test by name
node node_modules/jest/bin/jest.js tests/post-deployment.test.js -t "should respond to root endpoint"
```

## Test Configuration

### Timeouts

- **Standard Tests**: 30 seconds (`TEST_TIMEOUT`)
- **AI Routing Tests**: 45 seconds (`AI_ROUTING_TIMEOUT`)
- **Overall Test Suite**: 60 seconds (Jest timeout)

### Test Environment

Tests are designed to run against a live production instance. They:
- Do not modify production data (except temporary test services)
- Clean up test services after completion
- Handle cases where services may or may not be registered
- Accept various response status codes based on system state

## Expected Results

### Success Criteria

All tests should pass if:
- Coordinator service is running and accessible
- Network connectivity is stable
- AI routing is configured (or fallback is enabled)
- Services may or may not be registered (tests handle both cases)

### Status Code Expectations

Tests accept multiple valid status codes based on system state:

- **200**: Success
- **400**: Bad request (validation errors)
- **404**: Not found (no services, no route)
- **502**: Bad gateway (AI routing unavailable, target service unavailable)
- **503**: Service unavailable (target service not active)

### Test Service Cleanup

The test suite automatically:
- Registers a test service if needed
- Cleans up test services after completion
- Handles cleanup failures gracefully

## Troubleshooting

### Common Issues

1. **Connection Timeout**
   - Verify the `RAILWAY_URL` is correct
   - Check network connectivity
   - Ensure the Coordinator service is running

2. **AI Routing Timeouts**
   - AI routing may take longer in production
   - Check if `OPENAI_API_KEY` is configured
   - Verify fallback routing is enabled

3. **Service Not Found Errors**
   - Expected if no services are registered
   - Tests handle this gracefully
   - Consider registering test services first

4. **Test Failures**
   - Review error messages for specific failures
   - Check Coordinator logs for detailed errors
   - Verify environment variables are set correctly

### Debug Mode

Run tests with verbose output:

```bash
node node_modules/jest/bin/jest.js tests/post-deployment.test.js --verbose --testTimeout=60000
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Post-Deployment Tests

on:
  workflow_dispatch:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours

jobs:
  post-deployment-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: |
          cd services/coordinator
          npm install
      - name: Run post-deployment tests
        env:
          RAILWAY_URL: ${{ secrets.RAILWAY_URL }}
        run: |
          cd services/coordinator
          npm run test:post-deployment
```

### Railway Post-Deploy Hook

Add to `railway.json`:

```json
{
  "deploy": {
    "postDeploy": "cd services/coordinator && npm run test:post-deployment"
  }
}
```

## Test Maintenance

### Adding New Tests

1. Add tests to appropriate describe block
2. Follow existing test patterns
3. Handle multiple valid status codes
4. Include proper timeouts
5. Clean up any test data

### Updating Tests

- Keep tests aligned with API changes
- Update expected status codes if behavior changes
- Maintain backward compatibility checks

## Best Practices

1. **Idempotency**: Tests should be safe to run multiple times
2. **Isolation**: Tests should not depend on each other
3. **Cleanup**: Always clean up test data
4. **Flexibility**: Accept multiple valid responses based on system state
5. **Documentation**: Keep this guide updated with test changes

## Related Documentation

- [Test Guide](./TEST_GUIDE.md) - General testing documentation
- [Deployment Tests](./deployment.test.js) - Basic deployment validation
- [Unified Proxy Tests](./unified-proxy.test.js) - Comprehensive unified proxy tests
- [API Documentation](../API_DOCUMENTATION.md) - API reference

## Support

For issues or questions:
1. Check Coordinator logs
2. Review test output for specific errors
3. Verify environment configuration
4. Consult main documentation

