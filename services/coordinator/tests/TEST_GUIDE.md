# Test Guide - Unified Proxy Endpoint

## Overview

This guide explains how to run and maintain the comprehensive test suite for the `/api/fill-content-metrics/` unified proxy endpoint.

---

## Prerequisites

### Install Dependencies

```bash
cd services/coordinator
npm install
```

This will install:
- `jest` - Testing framework
- `supertest` - HTTP testing
- `nock` - HTTP mocking

---

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Only Unified Proxy Tests

```bash
npm run test:unified-proxy
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

This generates:
- Console coverage report
- HTML report in `coverage/` directory
- LCOV report for CI/CD

---

## Test Structure

### Test File Location

```
tests/
├── unified-proxy.test.js    # Main test file
├── mocks/
│   ├── mock-ai-routing.js   # Mock AI routing service
│   └── mock-services.js     # Mock microservices
├── helpers/
│   └── test-server.js      # Test server setup
└── setup/
    └── jest.setup.js        # Jest configuration
```

---

## Test Categories

The test suite covers 9 comprehensive categories:

### 1. Request Validation Tests
- Missing required fields
- Invalid field types
- Empty vs populated payloads

### 2. AI Routing Tests
- Successful routing
- High/low confidence scenarios
- Multiple service matching
- Routing failures

### 3. Service Discovery Tests
- Active service lookup
- Pending service handling
- Non-existent service errors

### 4. Request Forwarding Tests
- Correct body forwarding
- Header verification
- Timeout handling
- Error propagation

### 5. Response Mapping Tests
- Single field mapping
- Multiple field mapping
- Case-insensitive matching
- Default value handling
- Empty template handling
- Wrapped response unwrapping

### 6. Integration Tests
- End-to-end flows
- Multiple service scenarios
- Full request lifecycle

### 7. Error Handling Tests
- Network timeouts
- Service errors
- Invalid responses
- Exception handling

### 8. Performance Tests
- Response time validation
- Concurrent request handling

### 9. Logging Tests
- Logging verification

---

## Mock Services

The test suite includes mock services that simulate real microservices:

### Mock Exercises Service (Port 5001)
- Responds to coding/exercise queries
- Returns exercise content

### Mock Payment Service (Port 5002)
- Responds to payment queries
- Returns transaction data

### Mock User Service (Port 5003)
- Responds to user queries
- Returns user profile data

### Mock Error Service (Port 5004)
- Returns 500 errors for error testing

### Mock Timeout Service (Port 5005)
- Never responds for timeout testing

---

## Writing New Tests

### Test Template

```javascript
describe('Feature Name', () => {
  test('should do something specific', async () => {
    // 1. Setup mocks
    aiRoutingService.routeRequest = jest.fn().mockResolvedValue({
      success: true,
      routing: { /* ... */ }
    });

    registryService.getServiceByName = jest.fn().mockResolvedValue({
      serviceName: 'test-service',
      endpoint: 'http://test-service:5001',
      status: 'active'
    });

    // 2. Mock target service response
    nock('http://test-service:5001')
      .post('/api/fill-content-metrics/')
      .reply(200, {
        success: true,
        data: { answer: 'Test response' }
      });

    // 3. Make request
    const response = await request(app)
      .post('/api/fill-content-metrics/')
      .send({
        requester_service: 'test',
        payload: { action: 'test' },
        response: { answer: '' }
      });

    // 4. Assertions
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

### Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Reset mocks in `beforeEach`
3. **Naming**: Use descriptive test names
4. **Assertions**: Test both success and failure cases
5. **Coverage**: Aim for >80% code coverage

---

## Troubleshooting

### Tests Failing Due to Port Conflicts

If you see port conflicts, check if mock services are still running:

```bash
# Windows
netstat -ano | findstr :5001
netstat -ano | findstr :5002

# Linux/Mac
lsof -i :5001
lsof -i :5002
```

Kill processes if needed.

### Tests Timing Out

Some tests (like timeout tests) may take longer. The test timeout is set to 35 seconds in `jest.config.js`.

### Mock Services Not Starting

Ensure ports 5001-5005 are available. The mock services start automatically in `beforeAll` and stop in `afterAll`.

---

## Coverage Goals

- **Line Coverage**: >80%
- **Branch Coverage**: >75%
- **Function Coverage**: >90%

View coverage report:

```bash
npm run test:coverage
open coverage/index.html  # Mac
start coverage/index.html  # Windows
```

---

## CI/CD Integration

The tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run tests
  run: npm test

- name: Generate coverage
  run: npm run test:coverage
```

---

## Maintenance

### Adding New Test Cases

1. Identify the test category
2. Add test to appropriate `describe` block
3. Follow existing patterns
4. Ensure test passes
5. Update this guide if needed

### Updating Mocks

If the API changes, update:
- `tests/mocks/mock-services.js` - Mock service responses
- `tests/mocks/mock-ai-routing.js` - AI routing responses

### Updating Test Data

Test data is embedded in test cases. Update as needed when requirements change.

---

## Known Limitations

1. **Real Network Calls**: Tests use mocks, not real services
2. **Timeout Tests**: May take up to 35 seconds
3. **Concurrent Tests**: Limited to 10 concurrent requests in performance tests
4. **Port Dependencies**: Requires ports 5001-5005 to be available

---

## Getting Help

If tests fail:
1. Check error messages carefully
2. Verify mocks are set up correctly
3. Ensure ports are available
4. Review test logs for details
5. Check that dependencies are installed

---

## Test Execution Time

- **Full Suite**: ~30-60 seconds
- **Single Category**: ~5-10 seconds
- **Single Test**: ~1-2 seconds

---

## Next Steps

After running tests:
1. Review coverage report
2. Fix any failing tests
3. Add tests for new features
4. Update documentation

